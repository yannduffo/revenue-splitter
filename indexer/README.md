# Indexer

Node worker that indexes Splittr events into Postgres, for the web app's API routes. Why a custom one rather than Ponder: see [NOTES.md](./NOTES.md).

## What it indexes

| Event | Query |
|---|---|
| `SplitterCreated` | `address: factory` |
| ERC-20 `Transfer` to a splitter | recipient topic OR'ed over every known splitter, no contract address |
| `Claimed` | `address: [splitters]` |

Splitters are sent in batches of 500 (Infura refuses between 1,000 and 2,000).

## How it runs

One loop, one cursor. Each tick reads `SplitterCreated` for the next range first, then transfers and claims for that same range with the updated list, so a new splitter needs no backfill. Rows and the checkpoint are written in one transaction.

The worker stays `CONFIRMATIONS` blocks behind the head and checks the hash of its last checkpoint at every tick. On a mismatch, it walks back to the last matching checkpoint and deletes everything indexed after it.

## Run locally

```bash
docker compose up -d                 # Postgres, schema created on first start
cp .env.example .env.local           # RPC_URL, DATABASE_URL, FACTORY_ADDRESS, FACTORY_BLOCK
npm install && npm run dev
```

To reset: `docker compose exec -T postgres psql -U splittr -d splittr < db/schema.sql`. The worker rebuilds everything in about 40 seconds.

In production it runs as the `indexer` service of the root `docker-compose.yml`.
