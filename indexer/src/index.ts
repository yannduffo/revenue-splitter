// biome-ignore lint/correctness/noUnusedImports: The template demonstrates the registry import for new projects.
import { ponder } from "ponder:registry";
import { incomingTransfer } from "ponder:schema";

ponder.on("IncomingTransfer:Transfer", async ({ event, context }) => {
  await context.db.insert(incomingTransfer).values({
    id: event.id,
    token: event.log.address,
    from: event.args.from,
    to: event.args.to,
    amount: event.args.value,
  })
})
