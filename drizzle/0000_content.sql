CREATE TABLE content_state (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  revision INTEGER NOT NULL DEFAULT 0,
  draft TEXT NOT NULL DEFAULT '{"copy":{},"images":{}}',
  published TEXT NOT NULL DEFAULT '{"copy":{},"images":{}}'
);
--> statement-breakpoint
CREATE TABLE content_versions (
  version INTEGER PRIMARY KEY,
  content TEXT NOT NULL,
  published_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
INSERT INTO content_state (id) VALUES (1);
--> statement-breakpoint
INSERT INTO content_versions (version, content) SELECT 0, published FROM content_state WHERE id = 1;
