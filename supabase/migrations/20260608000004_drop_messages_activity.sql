-- Drop the messaging + activity-log features. The app code that referenced
-- these tables has been removed (coach app messaging/activity, member feeds,
-- 8 API routes, admin broadcast/thread setup). Members now use the weekly
-- check-in; coaching happens via reports + the coach app's other tabs.
--
-- IRREVERSIBLE — back up first if you want message/activity history.
-- CASCADE drops dependent RLS policies, FKs, and constraints.

-- Activity log family
DROP TABLE IF EXISTS activity_comments  CASCADE;
DROP TABLE IF EXISTS activity_reactions CASCADE;
DROP TABLE IF EXISTS activity_photos    CASCADE;
DROP TABLE IF EXISTS activities         CASCADE;

-- Messaging family
DROP TABLE IF EXISTS message_reads        CASCADE;
DROP TABLE IF EXISTS message_attachments  CASCADE;
DROP TABLE IF EXISTS messages             CASCADE;
DROP TABLE IF EXISTS thread_participants  CASCADE;
DROP TABLE IF EXISTS threads              CASCADE;
