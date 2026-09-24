import { onchainTable } from "ponder";

export const splitter = onchainTable("splitter", (t) => ({
  address: t.hex().primaryKey(),
  creator: t.hex().notNull(),
  createdAtBlock: t.bigint().notNull(),
}));

export const incomingTransfer = onchainTable(
  "incoming_transfer",
  (t) => ({
    id: t.text().primaryKey(),
    token: t.hex().notNull(),
    from: t.hex().notNull(),
    to: t.hex().notNull(),
    amount: t.bigint().notNull(),
  }),
);
