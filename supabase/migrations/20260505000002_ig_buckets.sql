alter table ig_conversations
  add column if not exists bucket text not null default 'new',
  add column if not exists unread boolean not null default false;
