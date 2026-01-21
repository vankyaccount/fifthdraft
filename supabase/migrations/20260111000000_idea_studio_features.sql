-- Enable pgvector extension FIRST
CREATE EXTENSION IF NOT EXISTS vector;

-- Add new columns for Idea Studio features
ALTER TABLE notes ADD COLUMN IF NOT EXISTS research_data JSONB;
ALTER TABLE notes ADD COLUMN IF NOT EXISTS embedding vector(1536);

-- Create index for similarity search (idea evolution)
CREATE INDEX IF NOT EXISTS notes_embedding_idx
ON notes USING ivfflat (embedding vector_cosine_ops);
