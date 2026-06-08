-- Membership tier. The only functional difference (for now): VIP members can
-- book calls with Javi on demand; standard members cannot.

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS tier TEXT NOT NULL DEFAULT 'standard'
    CHECK (tier IN ('standard', 'vip'));
