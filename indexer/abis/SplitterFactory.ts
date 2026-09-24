export const splitterFactoryAbi = [
  {
    anonymous: false,
    type: "event",
    name: "SplitterCreated",
    inputs: [
      {
        indexed: true,
        name: "splitter",
        type: "address",
      },
      {
        indexed: true,
        name: "creator",
        type: "address",
      },
      {
        indexed: false,
        name: "members",
        type: "address[]",
      },
      {
        indexed: false,
        name: "shareDistribution",
        type: "uint256[]",
      },
    ],
  },
] as const;
