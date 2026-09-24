import { bytesToHex, createPublicClient, http, parseAbiItem, type Address } from "viem";
  import { sepolia } from "viem/chains";

  // ---------------------------------------------------------------- config
  const RPC_URL = process.env.PONDER_RPC_URL_11155111;
  if (!RPC_URL) throw new Error("PONDER_RPC_URL_11155111 is missing (run with --env-file=.env.local)");

  const FACTORY_BLOCK = 11_667_295n;
  const WINDOW = 10_000n; // Infura's max block range for eth_getLogs
  const PAUSE_MS = 700; // eth_getLogs = 255 credits, Infura free tier = 500 credits/s

  const SPLITTER_A = "0xDdbea380B9340978F7Cac49fd050A5A85a1672FA" as const;
  const SPLITTER_B = "0xA95331F3E3CB06BBd4D379f3140ab268f13F9761" as const;
  const SPLITTERS: Address[] = [SPLITTER_A, SPLITTER_B];

  const transferEvent = parseAbiItem(
    "event Transfer(address indexed from, address indexed to, uint256 value)",
  );
  const claimedEvent = parseAbiItem(
    "event Claimed(address indexed token, address indexed member, uint256 amount)",
  );

  const client = createPublicClient({ chain: sepolia, transport: http(RPC_URL) });

  // ---------------------------------------------------------------- helpers
  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  // times a call, then pauses so we never exceed the credits budget
  async function timed<T>(label: string, fn: () => Promise<T>): Promise<T> {
    const t0 = performance.now();
    try {
      return await fn();
    } finally {
      console.log(`  ${label} — ${(performance.now() - t0).toFixed(0)} ms`);
      await sleep(PAUSE_MS);
    }
  }

  // unique log id, same format as the web's `id` (txHash-logIndex)
  const logId = (l: { transactionHash: string | null; logIndex: number | null }) =>
    `${l.transactionHash}-${l.logIndex}`;

  const randomAddress = () => bytesToHex(crypto.getRandomValues(new Uint8Array(20))) as Address;

  // first window after deployment: contains the Sepolia seeding
  const FIRST_WINDOW = { fromBlock: FACTORY_BLOCK, toBlock: FACTORY_BLOCK + WINDOW - 1n };

  // ---------------------------------------------------------------- tests
  async function t1() {
    console.log("\nT1 — does OR on topic2 equal the union of individual queries?");

    // viem turns `to: [A, B]` into topics: [Transfer, null, [A, B]]
    const combined = await timed("OR [A, B]", () =>
      client.getLogs({ event: transferEvent, args: { to: SPLITTERS }, ...FIRST_WINDOW }),
    );

    const individual = [];
    for (const s of SPLITTERS) {
      individual.push(
        ...(await timed(`to = ${s.slice(0, 10)}…`, () =>
          client.getLogs({ event: transferEvent, args: { to: s }, ...FIRST_WINDOW }),
        )),
      );
    }

    const a = new Set(combined.map(logId));
    const b = new Set(individual.map(logId));
    const same = a.size === b.size && [...a].every((id) => b.has(id));
    console.log(`  OR: ${a.size} logs | individual: ${b.size} logs | identical: ${same}`);

    for (const l of combined) {
      // topics.length === 4 → an ERC-721 Transfer, to filter out as the web does
      console.log(`   #${l.blockNumber} token ${l.address} → ${l.args.to} value=${l.args.value} topics=${l.topics.length}`);
    }
  }

  async function t2() {
    console.log("\nT2 — full sweep factory → head, one OR query per 10k window");
    const head = await client.getBlockNumber();
    let calls = 0;
    let total = 0;
    const t0 = performance.now();

    for (let from = FACTORY_BLOCK; from <= head; from += WINDOW) {
      const to = from + WINDOW - 1n > head ? head : from + WINDOW - 1n;
      const logs = await timed(`[${from} → ${to}]`, () =>
        client.getLogs({ event: transferEvent, args: { to: SPLITTERS }, fromBlock: from, toBlock: to }),
      );
      calls++;
      total += logs.length;
    }

    const seconds = (performance.now() - t0) / 1000;
    console.log(`  ${calls} calls, ${total} logs, ${seconds.toFixed(1)}s (including ${(calls * PAUSE_MS) / 1000}s of pauses)`);
    console.log(`  for comparison, the web does ${calls} calls PER splitter AND per query type, on every page load`);
  }

  async function t3() {
    console.log("\nT3 — OR array size limit (A and B hidden among random addresses)");
    const reference = await timed("reference [A, B]", () =>
      client.getLogs({ event: transferEvent, args: { to: SPLITTERS }, ...FIRST_WINDOW }),
    );

    for (const size of [10, 100, 500, 1_000, 2_000, 5_000]) {
      // real splitters at the END: if Infura silently truncated the list, we would notice
      const list = [...Array.from({ length: size - SPLITTERS.length }, randomAddress), ...SPLITTERS];
      try {
        const logs = await timed(`${size} addresses`, () =>
          client.getLogs({ event: transferEvent, args: { to: list }, ...FIRST_WINDOW }),
        );
        const ok = logs.length === reference.length;
        console.log(`    ${logs.length}/${reference.length} logs ${ok ? "OK" : "MISMATCH"}`);
      } catch (e) {
        console.log(`    FAILED: ${(e as Error).message.split("\n")[0]}`);
      }
    }
  }

  async function t4() {
    console.log("\nT4 — Claimed with address: [A, B]");
    const logs = await timed("Claimed", () =>
      client.getLogs({ address: SPLITTERS, event: claimedEvent, ...FIRST_WINDOW }),
    );

    const bySplitter = new Map<string, number>();
    for (const l of logs) {
      const key = l.address.toLowerCase();
      bySplitter.set(key, (bySplitter.get(key) ?? 0) + 1);
    }
    for (const s of SPLITTERS) {
      console.log(`   ${s}: ${bySplitter.get(s.toLowerCase()) ?? 0} claims`);
    }
  }

  async function t5() {
    console.log("\nT5 — lag of the safe / finalized tags");
    const [latest, safe, finalized] = await Promise.all([
      client.getBlock({ blockTag: "latest" }),
      client.getBlock({ blockTag: "safe" }),
      client.getBlock({ blockTag: "finalized" }),
    ]);
    console.log(`  latest #${latest.number}`);
    console.log(`  safe      −${latest.number - safe.number} blocks`);
    console.log(`  finalized −${latest.number - finalized.number} blocks`);
  }

  // ---------------------------------------------------------------- runner
  const tests = { t1, t2, t3, t4, t5 };
  const selected = process.argv.slice(2);

  for (const name of selected.length ? selected : Object.keys(tests)) {
    const test = tests[name as keyof typeof tests];
    if (!test) throw new Error(`unknown test: ${name}`);
    await test();
  }
