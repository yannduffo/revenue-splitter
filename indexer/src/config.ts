import type { Address } from "viem";

//helper to check if the asked env variable is actually set
function required(name: string): string{
  const value = process.env[name];
  if (!value) throw new Error(`${name} is missing (run with --env-file=.env.local)`);

  return value;
}

export const RPC_URL = required("RPC_URL");
export const DATABASE_URL = required("DATABASE_URL");

//? pourquoi pas dans le env ?
export const FACTORY_ADDRESS: Address = "0x2A8B524C1fe5ff0687E642A5611BE907cfe902e0";
export const FACTORY_BLOCK = 11_667_295n;

export const WINDOW = 10_000n; //infura max block range for eth_getLogs
export const BATCH_SIZE = 500; //addresses per OR queries : theorical limit of number of addresses in one Infura request
export const CONFIRMATIONS = 5n; // stay N blocks behind the head (reorg will improve that)

export const POLL_MS = 60_000; //pool every 60s -> 1,3M Infura credits a day

//set so we don't go over 500 credits / s
export const LOGS_PAUSE_MS = 700;
export const BLOCK_PAUSE_MS = 200;
