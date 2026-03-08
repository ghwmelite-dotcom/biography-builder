-- Seed existing blog post tweets into the queue
INSERT INTO tweet_queue (source, content, url, priority) VALUES
  ('blog', 'New on the blog: FuneralPress Complete User Guide — All Features Explained', 'https://funeralpress.org/blog/funeralpress-complete-user-guide', 8);
