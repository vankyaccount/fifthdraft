-- ============================================
-- FOLDERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.folders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#6366F1', -- Indigo color
  icon TEXT DEFAULT 'folder', -- Icon name from lucide-react
  parent_folder_id UUID REFERENCES public.folders(id) ON DELETE CASCADE,
  position INTEGER DEFAULT 0, -- For ordering folders

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, name)
);

-- Add folder_id to notes table
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS folder_id UUID REFERENCES public.folders(id) ON DELETE SET NULL;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_folders_user_id ON public.folders(user_id);
CREATE INDEX IF NOT EXISTS idx_folders_parent_id ON public.folders(parent_folder_id);
CREATE INDEX IF NOT EXISTS idx_notes_folder_id ON public.notes(folder_id);

-- ============================================
-- ROW LEVEL SECURITY FOR FOLDERS
-- ============================================
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;

-- Users can view their own folders
CREATE POLICY "Users can view own folders" ON public.folders
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own folders
CREATE POLICY "Users can insert own folders" ON public.folders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own folders
CREATE POLICY "Users can update own folders" ON public.folders
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own folders
CREATE POLICY "Users can delete own folders" ON public.folders
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- DEFAULT FOLDERS
-- ============================================
-- Function to create default folders for new users
CREATE OR REPLACE FUNCTION create_default_folders()
RETURNS TRIGGER AS $$
BEGIN
  -- Create "Work" folder
  INSERT INTO public.folders (user_id, name, description, color, icon, position)
  VALUES (NEW.id, 'Work', 'Work-related notes and meetings', '#3B82F6', 'briefcase', 1);

  -- Create "Personal" folder
  INSERT INTO public.folders (user_id, name, description, color, icon, position)
  VALUES (NEW.id, 'Personal', 'Personal ideas and notes', '#10B981', 'home', 2);

  -- Create "Ideas" folder
  INSERT INTO public.folders (user_id, name, description, color, icon, position)
  VALUES (NEW.id, 'Ideas', 'Brainstorming and creative thinking', '#8B5CF6', 'lightbulb', 3);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create default folders for new users
DROP TRIGGER IF EXISTS on_auth_user_created_folders ON public.profiles;
CREATE TRIGGER on_auth_user_created_folders
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_default_folders();
