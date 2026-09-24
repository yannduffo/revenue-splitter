import { createConfig } from "ponder";

import { erc20TransferAbi } from "./abis/ERC20";

const SPLITTER_A = "0xDdbea380B9340978F7Cac49fd050A5A85a1672FA" as const;

export default createConfig({
  database: {
    kind: "pglite",
    directory: "./.ponder/pglite",
  },

  chains: {
    sepolia: {
      id: 11155111,
      rpc: process.env.PONDER_RPC_URL_11155111,
    },
  },

  contracts: {
    IncomingTransfer: {
      chain: "sepolia",
      abi: erc20TransferAbi,

      //no address property -> aim is to test wildcard indexing for our token discovery
      filter: {
        event: "Transfer",
        args: {
          to: SPLITTER_A,
        },
      },

      //block window
      startBlock: 11_667_608,
      endBlock: 11_667_614,
    },
  },
});
