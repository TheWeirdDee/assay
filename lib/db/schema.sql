-- Assay schema. Run via `npm run db:migrate` (scripts/migrate.mjs). Idempotent (IF NOT EXISTS).

create extension if not exists pgcrypto;

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  password_hash text not null,
  created_at timestamptz not null default now()
);

create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  token_hash text unique not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);
create index if not exists sessions_user_id_idx on sessions(user_id);

-- One row per treasury operator a user runs. A user may own several (multi-tenant).
create table if not exists merchants (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references users(id) on delete cascade,
  name text not null,
  chain text not null default 'monad',
  atoken_address text not null,
  cleanverse_api_base_url text not null default 'https://uatapi.cleanverse.com/api/cooperate',
  -- AES-256-GCM ciphertext, base64: iv(12) || tag(16) || ciphertext. Never store plaintext secrets.
  cleanverse_api_id_enc text not null,
  cleanverse_api_key_enc text not null,
  merchant_wallet_address text not null,
  merchant_wallet_private_key_enc text not null,
  policy_solvency_rule boolean not null default true,
  policy_anomaly_tolerance text not null default 'medium'
    check (policy_anomaly_tolerance in ('low', 'medium', 'high')),
  policy_escalate_to text not null default '',
  last_synced_block numeric not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists merchants_owner_idx on merchants(owner_user_id);

create table if not exists baselines (
  merchant_id uuid primary key references merchants(id) on delete cascade,
  amount_mean double precision not null default 100,
  amount_std double precision not null default 40,
  known_counterparties jsonb not null default '[]'::jsonb,
  cleared_inflows numeric not null default 0,
  committed_outflows numeric not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists decisions (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid not null references merchants(id) on delete cascade,
  ts timestamptz not null default now(),
  payment jsonb not null,
  verdict jsonb not null,
  outcome text not null check (outcome in ('settled', 'held_by_judgment', 'blocked_by_compliance')),
  amount_units text not null,
  tx_hash text,
  compliance_code integer,
  compliance_message text,
  resolution text check (resolution in ('approved', 'rejected')),
  resolved_at timestamptz,
  resolved_tx_hash text,
  audit_report_url text,
  -- dedupe key for inbound transfers discovered by the on-chain poller (chain tx hash); null for
  -- merchant-initiated outbound payments, which have no natural dedupe key of their own.
  source_tx_hash text
);
create index if not exists decisions_merchant_ts_idx on decisions(merchant_id, ts desc);
create unique index if not exists decisions_source_tx_unique
  on decisions(merchant_id, source_tx_hash) where source_tx_hash is not null;
