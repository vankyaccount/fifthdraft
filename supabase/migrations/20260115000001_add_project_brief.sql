-- Add project_brief and mindmap_data columns to notes table for caching
-- This avoids redundant API calls and token usage for Idea Studio features

ALTER TABLE notes ADD COLUMN IF NOT EXISTS project_brief JSONB;

-- Update comment for clarity
COMMENT ON COLUMN notes.project_brief IS 'Cached project brief data from Idea Studio (Pro feature)';
COMMENT ON COLUMN notes.mindmap_data IS 'Cached mindmap data from Idea Studio (Pro feature)';
