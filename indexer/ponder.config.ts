import { createConfig, rateLimit } from "ponder";
import { http } from "viem";

import { erc20TransferAbi } from "./abis/ERC20";
import { splitterFactoryAbi } from "./abis/SplitterFactory";

const FACTORY_ADDRESS = "0x2A8B524C1fe5ff0687E642A5611BE907cfe902e0" as const;
const FACTORY_BLOCK = 11_667_295;
const TEST_END_BLOCK = 11_667_614; //320 block to test

export default createConfig({
  database: {
    kind: "pglite",
    directory: "./.ponder/pglite",
  },

  chains: {
    sepolia: {
      id: 11155111,
      rpc: rateLimit(
        http(process.env.PONDER_RPC_URL_11155111),
        {
          requestsPerSecond: 1,
        },
      ),
      pollingInterval: 12_000,
    },
  },

  contracts: {
    SplitterFactory: {
      chain: "sepolia",
      abi: splitterFactoryAbi,
      address: FACTORY_ADDRESS,

      //block window
      startBlock: FACTORY_BLOCK,
      endBlock: TEST_END_BLOCK,
    },

    //getting all ERC20 transfers
    AllTransfers: {
      chain: "sepolia",
      abi: erc20TransferAbi,

      filter: {
        event: "Transfer",
        args: {},
      },

      //block window
      startBlock: FACTORY_BLOCK,
      endBlock: TEST_END_BLOCK,
    },
  },
});
