-- Instagram / ManyChat DM inbox tables

create table if not exists ig_conversations (
  id text primary key,              -- ManyChat subscriber_id
  display_name text,
  profile_pic_url text,
  last_message_body text,
  last_message_at timestamptz,
  status text not null default 'open',
  created_at timestamptz not null default now()
);

create table if not exists ig_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id text not null references ig_conversations(id) on delete cascade,
  direction text not null,          -- inbound | outbound
  body text not null,
  sent_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists ig_messages_conversation_id_sent_at
  on ig_messages(conversation_id, sent_at);

alter table ig_conversations enable row level security;
alter table ig_messages enable row level security;

create policy "service role full access ig_conversations"
  on ig_conversations for all using (true);

create policy "service role full access ig_messages"
  on ig_messages for all using (true);
