import { parseAbiItem } from "viem";

export const splitterCreatedEvent = parseAbiItem(
  "event SplitterCreated(address indexed splitter, address indexed creator, address[] members, uint256[] shareDistribution)",
);

export const transferEvent = parseAbiItem("event Transfer(address indexed from, address indexed to, uint256 value)");

export const claimedEvent = parseAbiItem("event Claimed(address indexed token, address indexed member, uint256 amount)");
