import {type Address, isAddress } from "viem";

//helper to check if the asked env variable is actually set
function required(name: string): string{
  const value = process.env[name];
  if (!value) throw new Error(`${name} is missing (locally: .env.local, in Docker: the compose environment)`);

  return value;
}

export const RPC_URL = required("RPC_URL");
export const DATABASE_URL = required("DATABASE_URL");

//deployment-specific: which factory to index, and from which block
const factory = required("FACTORY_ADDRESS");
if (!isAddress(factory)) throw new Error(`FACTORY_ADDRESS is not an address: ${factory}`);
export const FACTORY_ADDRESS: Address = factory;
export const FACTORY_BLOCK = BigInt(required("FACTORY_BLOCK"));

export const WINDOW = 10_000n; //infura max block range for eth_getLogs
export const BATCH_SIZE = 500; //addresses per OR queries : theorical limit of number of addresses in one Infura request
export const CONFIRMATIONS = BigInt(process.env.CONFIRMATIONS ?? "5"); // stay N blocks behind the head (0 on anvil cause it mines a block when a tx arrives)

export const POLL_MS = 60_000; //pool every 60s -> 1,3M Infura credits a day

//set so we don't go over 500 credits / s
export const LOGS_PAUSE_MS = 700;
export const BLOCK_PAUSE_MS = 200;
