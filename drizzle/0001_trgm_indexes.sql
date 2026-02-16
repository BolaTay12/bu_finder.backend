CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;

CREATE INDEX IF NOT EXISTS idx_items_title_trgm ON items USING gin (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_items_description_trgm ON items USING gin (description gin_trgm_ops);