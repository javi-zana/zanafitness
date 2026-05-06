-- Drop the community feature: posts, reactions, comments.
-- CASCADE removes RLS policies, indexes, and FKs.

DROP TABLE IF EXISTS community_post_comments  CASCADE;
DROP TABLE IF EXISTS community_post_reactions CASCADE;
DROP TABLE IF EXISTS community_posts          CASCADE;
