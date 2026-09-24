// biome-ignore lint/correctness/noUnusedImports: The template demonstrates the registry import for new projects.
import { ponder } from "ponder:registry";
import { incomingTransfer, splitter } from "ponder:schema";

ponder.on("SplitterFactory:SplitterCreated",
  async ({ event, context }) => {
    await context.db
      .insert(splitter)
      .values({
        address: event.args.splitter,
        creator: event.args.creator,
        createdAtBlock: event.block.number,
      })
      .onConflictDoNothing();
  },
);

ponder.on("AllTransfers:Transfer", async ({ event, context }) => {
  const recipient = await context.db.find(splitter, { address: event.args.to, })

  //recipient isn't an official splitter
  if (recipient === null) return;

  await context.db.insert(incomingTransfer).values({
    id: event.id,
    token: event.log.address,
    from: event.args.from,
    to: event.args.to,
    amount: event.args.value,
  });
});
