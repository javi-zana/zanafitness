-- DM signals pushed from Roadrunner's client sweep (clients/bin/push_sweep.py
-- in the roadrunner repo). One row per swept client, latest sweep wins.
-- Beeper is desktop-only, so the portal never reads DMs itself — it just
-- receives this triage summary.

CREATE TABLE IF NOT EXISTS dm_signals (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name     TEXT NOT NULL UNIQUE,          -- dossier name, the upsert key
  member_id       UUID REFERENCES profiles(id) ON DELETE SET NULL,
  chat_id         TEXT,
  last_message_at TIMESTAMPTZ,                   -- newest message either direction
  last_sender     TEXT CHECK (last_sender IN ('coach', 'client')),
  last_text       TEXT,
  draft_type      TEXT CHECK (draft_type IN ('reply', 'nudge')),
  needs_attention BOOLEAN NOT NULL DEFAULT false,
  unread_count    INTEGER,
  next_call       TEXT,
  swept_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Service-role only (ingest endpoint + ai tool). RLS on, no policies.
ALTER TABLE dm_signals ENABLE ROW LEVEL SECURITY;
