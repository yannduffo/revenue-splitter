-- Splittr indexer schema
-- Dev workflow : this file drops everything and recreates it. A full resync takes seconds, so there are no migrations: schema change = reset + resync
--
-- Conventions:
-- - addresses and hashes : TEXT, lowercase, 0x-prefixed
-- - uint256 amounts: NUMERIC(78,0), since 2^256 has 78 digits and BIGINT would overflow

DROP TABLE IF EXISTS checkpoints, claims, deposits, splitter_members, splitters CASCADE;

-- one row per SplitterCreated emitted by the factory
CREATE TABLE splitters(
    address             TEXT        PRIMARY KEY,
    creator             TEXT        NOT NULL,
    created_block       BIGINT      NOT NULL,
    created_log_index   INTEGER     NOT NULL,
    created_tx          TEXT        NOT NULL,
    created_at          TIMESTAMPTZ NOT NULL
);

-- members and shares come straight from the SplitterCreated event (immutable)
CREATE TABLE splitter_members(
    splitter        TEXT        NOT NULL REFERENCES splitters(address) ON DELETE CASCADE,
    member          TEXT        NOT NULL,
    share_bps       INTEGER     NOT NULL CHECK (share_bps BETWEEN 1 AND 10000),
    PRIMARY KEY (splitter, member)
);
CREATE INDEX splitter_members_member_idx ON splitter_members(member);

--incoming ERC-20 Transfer (to = a splitter): token discovery + deposit history
CREATE TABLE deposits (
    tx_hash         TEXT            NOT NULL,
    log_index       INTEGER         NOT NULL,
    block_number    BIGINT          NOT NULL,
    block_time      TIMESTAMPTZ     NOT NULL,
    splitter        TEXT            NOT NULL REFERENCES splitters(address) ON DELETE CASCADE,
    token           TEXT            NOT NULL,
    sender          TEXT            NOT NULL,
    amount          NUMERIC(78,0)   NOT NULL,
    PRIMARY KEY (tx_hash, log_index)
);
CREATE INDEX deposits_splitter_idx ON deposits (splitter, block_number);

-- Claimed emitted by the splitters : claim history + per-member/per-token totals
CREATE TABLE claims(
    tx_hash         TEXT            NOT NULL,
    log_index       INTEGER         NOT NULL,
    block_number    BIGINT          NOT NULL,
    block_time      TIMESTAMPTZ     NOT NULL,
    splitter        TEXT            NOT NULL REFERENCES splitters(address) ON DELETE CASCADE,
    token           TEXT            NOT NULL,
    member          TEXT            NOT NULL,
    amount          NUMERIC(78,0)   NOT NULL,
    PRIMARY KEY (tx_hash, log_index)
);
CREATE INDEX claims_splitter_token_idx ON claims (splitter, token);
CREATE INDEX claims_splitter_member_idx ON claims (splitter, member);

-- end of each indexed range and its hash : the cursor, plus reorg detection
-- the worker resumes from MAX(block_number)
CREATE TABLE checkpoints (
    block_number     BIGINT  PRIMARY KEY,
    block_hash       TEXT    NOT NULL
);
