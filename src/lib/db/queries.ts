// Database query helpers - replaces Supabase queries
import { query, transaction } from './postgres';
import type { Profile } from '@/lib/auth/types';

// ============================================
// PROFILES
// ============================================
export const profiles = {
  findById: async (id: string): Promise<Profile | null> => {
    const result = await query<Profile>('SELECT * FROM profiles WHERE id = $1', [id]);
    return result.rows[0] || null;
  },

  findByEmail: async (email: string): Promise<Profile | null> => {
    const result = await query<Profile>('SELECT * FROM profiles WHERE email = $1', [email.toLowerCase()]);
    return result.rows[0] || null;
  },

  findByStripeCustomerId: async (stripeCustomerId: string): Promise<Profile | null> => {
    const result = await query<Profile>('SELECT * FROM profiles WHERE stripe_customer_id = $1', [stripeCustomerId]);
    return result.rows[0] || null;
  },

  update: async (id: string, data: Partial<Profile>): Promise<Profile | null> => {
    const keys = Object.keys(data);
    if (keys.length === 0) return null;

    const values = Object.values(data);
    const setClause = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');

    const result = await query<Profile>(
      `UPDATE profiles SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id, ...values]
    );
    return result.rows[0] || null;
  },

  incrementMinutesUsed: async (userId: string, minutes: number): Promise<void> => {
    await query('SELECT increment_minutes_used($1, $2)', [userId, minutes]);
  },

  resetMinutesUsed: async (userId: string): Promise<void> => {
    await query('UPDATE profiles SET minutes_used = 0, updated_at = NOW() WHERE id = $1', [userId]);
  },
};

// ============================================
// RECORDINGS
// ============================================
export interface Recording {
  id: string;
  user_id: string;
  organization_id?: string;
  title?: string;
  mode: 'meeting' | 'brainstorming';
  whisper_mode: boolean;
  storage_path: string;
  file_size?: number;
  duration?: number;
  mime_type: string;
  status: 'queued' | 'uploading' | 'processing' | 'completed' | 'failed';
  processing_progress: number;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export const recordings = {
  findById: async (id: string): Promise<Recording | null> => {
    const result = await query<Recording>('SELECT * FROM recordings WHERE id = $1', [id]);
    return result.rows[0] || null;
  },

  findByUserId: async (userId: string, limit = 10): Promise<Recording[]> => {
    const result = await query<Recording>(
      `SELECT * FROM recordings WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2`,
      [userId, limit]
    );
    return result.rows;
  },

  create: async (data: Omit<Recording, 'id' | 'created_at' | 'updated_at'>): Promise<Recording> => {
    const result = await query<Recording>(
      `INSERT INTO recordings (user_id, organization_id, title, mode, whisper_mode, storage_path, file_size, duration, mime_type, status, processing_progress, error_message, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
       RETURNING *`,
      [
        data.user_id,
        data.organization_id || null,
        data.title || null,
        data.mode,
        data.whisper_mode,
        data.storage_path,
        data.file_size || null,
        data.duration || null,
        data.mime_type,
        data.status,
        data.processing_progress,
        data.error_message || null,
      ]
    );
    return result.rows[0];
  },

  updateStatus: async (id: string, status: string, progress?: number, errorMessage?: string): Promise<void> => {
    await query(
      `UPDATE recordings SET status = $1, processing_progress = COALESCE($2, processing_progress), error_message = $3, updated_at = NOW() WHERE id = $4`,
      [status, progress, errorMessage || null, id]
    );
  },

  update: async (id: string, data: Partial<Recording>): Promise<Recording | null> => {
    const keys = Object.keys(data);
    if (keys.length === 0) return null;

    const values = Object.values(data);
    const setClause = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');

    const result = await query<Recording>(
      `UPDATE recordings SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id, ...values]
    );
    return result.rows[0] || null;
  },

  delete: async (id: string): Promise<void> => {
    await query('DELETE FROM recordings WHERE id = $1', [id]);
  },

  getStoragePathsByUserId: async (userId: string): Promise<string[]> => {
    const result = await query<{ storage_path: string }>(
      'SELECT storage_path FROM recordings WHERE user_id = $1',
      [userId]
    );
    return result.rows.map((r) => r.storage_path);
  },
};

// ============================================
// NOTES
// ============================================
export interface Note {
  id: string;
  recording_id?: string;
  user_id: string;
  organization_id?: string;
  folder_id?: string;
  title: string;
  content: string;
  summary?: string;
  tags?: string[];
  mode?: 'meeting' | 'brainstorming';
  template_used?: string;
  structure?: Record<string, unknown>;
  mindmap_data?: Record<string, unknown>;
  flowchart_data?: Record<string, unknown>;
  user_feedback?: Record<string, unknown>;
  embedding?: number[];
  project_brief?: Record<string, unknown>;
  research_data?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export const notes = {
  findById: async (id: string): Promise<Note | null> => {
    const result = await query<Note>('SELECT * FROM notes WHERE id = $1', [id]);
    return result.rows[0] || null;
  },

  findByIdAndUserId: async (id: string, userId: string): Promise<Note | null> => {
    const result = await query<Note>('SELECT * FROM notes WHERE id = $1 AND user_id = $2', [id, userId]);
    return result.rows[0] || null;
  },

  findByUserId: async (userId: string, limit = 50): Promise<Note[]> => {
    const result = await query<Note>(
      `SELECT * FROM notes WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2`,
      [userId, limit]
    );
    return result.rows;
  },

  findByRecordingId: async (recordingId: string): Promise<Note | null> => {
    const result = await query<Note>('SELECT * FROM notes WHERE recording_id = $1', [recordingId]);
    return result.rows[0] || null;
  },

  create: async (data: Omit<Note, 'id' | 'created_at' | 'updated_at'>): Promise<Note> => {
    const result = await query<Note>(
      `INSERT INTO notes (recording_id, user_id, organization_id, folder_id, title, content, summary, tags, mode, template_used, structure, mindmap_data, flowchart_data, user_feedback, embedding, project_brief, research_data, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, NOW(), NOW())
       RETURNING *`,
      [
        data.recording_id || null,
        data.user_id,
        data.organization_id || null,
        data.folder_id || null,
        data.title,
        data.content,
        data.summary || null,
        data.tags || null,
        data.mode || null,
        data.template_used || null,
        data.structure ? JSON.stringify(data.structure) : null,
        data.mindmap_data ? JSON.stringify(data.mindmap_data) : null,
        data.flowchart_data ? JSON.stringify(data.flowchart_data) : null,
        data.user_feedback ? JSON.stringify(data.user_feedback) : null,
        data.embedding || null,
        data.project_brief ? JSON.stringify(data.project_brief) : null,
        data.research_data ? JSON.stringify(data.research_data) : null,
      ]
    );
    return result.rows[0];
  },

  update: async (id: string, data: Partial<Note>): Promise<Note | null> => {
    const keys = Object.keys(data);
    if (keys.length === 0) return null;

    // Handle JSON fields
    const values = Object.entries(data).map(([key, value]) => {
      if (['structure', 'mindmap_data', 'flowchart_data', 'user_feedback', 'project_brief', 'research_data'].includes(key) && value) {
        return JSON.stringify(value);
      }
      return value;
    });

    const setClause = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');

    const result = await query<Note>(
      `UPDATE notes SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id, ...values]
    );
    return result.rows[0] || null;
  },

  delete: async (id: string): Promise<void> => {
    await query('DELETE FROM notes WHERE id = $1', [id]);
  },

  findByTags: async (userId: string, tags: string[]): Promise<Note[]> => {
    const result = await query<Note>(
      `SELECT * FROM notes WHERE user_id = $1 AND tags && $2 ORDER BY created_at DESC`,
      [userId, tags]
    );
    return result.rows;
  },
};

// ============================================
// ACTION ITEMS
// ============================================
export interface ActionItem {
  id: string;
  note_id?: string;
  recording_id?: string;
  user_id: string;
  title: string;
  description?: string;
  type?: 'task' | 'decision' | 'deadline';
  assignee_name?: string;
  assignee_user_id?: string;
  due_date?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'canceled';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  created_at: string;
  updated_at: string;
}

export const actionItems = {
  findByNoteId: async (noteId: string): Promise<ActionItem[]> => {
    const result = await query<ActionItem>(
      'SELECT * FROM action_items WHERE note_id = $1 ORDER BY created_at',
      [noteId]
    );
    return result.rows;
  },

  findByUserId: async (userId: string, status?: string): Promise<ActionItem[]> => {
    if (status) {
      const result = await query<ActionItem>(
        'SELECT * FROM action_items WHERE user_id = $1 AND status = $2 ORDER BY created_at DESC',
        [userId, status]
      );
      return result.rows;
    }
    const result = await query<ActionItem>(
      'SELECT * FROM action_items WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    return result.rows;
  },

  create: async (data: Omit<ActionItem, 'id' | 'created_at' | 'updated_at'>): Promise<ActionItem> => {
    const result = await query<ActionItem>(
      `INSERT INTO action_items (note_id, recording_id, user_id, title, description, type, assignee_name, assignee_user_id, due_date, status, priority, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
       RETURNING *`,
      [
        data.note_id || null,
        data.recording_id || null,
        data.user_id,
        data.title,
        data.description || null,
        data.type || 'task',
        data.assignee_name || null,
        data.assignee_user_id || null,
        data.due_date || null,
        data.status || 'pending',
        data.priority || 'medium',
      ]
    );
    return result.rows[0];
  },

  createMany: async (items: Omit<ActionItem, 'id' | 'created_at' | 'updated_at'>[]): Promise<ActionItem[]> => {
    if (items.length === 0) return [];

    const results: ActionItem[] = [];
    for (const item of items) {
      const created = await actionItems.create(item);
      results.push(created);
    }
    return results;
  },

  update: async (id: string, data: Partial<ActionItem>): Promise<ActionItem | null> => {
    const keys = Object.keys(data);
    if (keys.length === 0) return null;

    const values = Object.values(data);
    const setClause = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');

    const result = await query<ActionItem>(
      `UPDATE action_items SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id, ...values]
    );
    return result.rows[0] || null;
  },
};

// ============================================
// TRANSCRIPTIONS
// ============================================
export interface Transcription {
  id: string;
  recording_id: string;
  raw_text?: string;
  raw_segments?: Record<string, unknown>[];
  cleaned_text?: string;
  speakers?: Record<string, unknown>;
  speaker_count?: number;
  language?: string;
  confidence?: number;
  word_count?: number;
  processing_duration?: number;
  created_at: string;
}

export const transcriptions = {
  findByRecordingId: async (recordingId: string): Promise<Transcription | null> => {
    const result = await query<Transcription>(
      'SELECT * FROM transcriptions WHERE recording_id = $1',
      [recordingId]
    );
    return result.rows[0] || null;
  },

  create: async (data: Omit<Transcription, 'id' | 'created_at'>): Promise<Transcription> => {
    const result = await query<Transcription>(
      `INSERT INTO transcriptions (recording_id, raw_text, raw_segments, cleaned_text, speakers, speaker_count, language, confidence, word_count, processing_duration, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
       RETURNING *`,
      [
        data.recording_id,
        data.raw_text || null,
        data.raw_segments ? JSON.stringify(data.raw_segments) : null,
        data.cleaned_text || null,
        data.speakers ? JSON.stringify(data.speakers) : null,
        data.speaker_count || null,
        data.language || null,
        data.confidence || null,
        data.word_count || null,
        data.processing_duration || null,
      ]
    );
    return result.rows[0];
  },
};

// ============================================
// FOLDERS
// ============================================
export interface Folder {
  id: string;
  user_id: string;
  name: string;
  color?: string;
  parent_id?: string;
  created_at: string;
  updated_at: string;
}

export const folders = {
  findByUserId: async (userId: string): Promise<Folder[]> => {
    const result = await query<Folder>(
      'SELECT * FROM folders WHERE user_id = $1 ORDER BY created_at',
      [userId]
    );
    return result.rows;
  },

  create: async (data: Omit<Folder, 'id' | 'created_at' | 'updated_at'>): Promise<Folder> => {
    const result = await query<Folder>(
      `INSERT INTO folders (user_id, name, color, parent_id, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       RETURNING *`,
      [data.user_id, data.name, data.color || '#6366f1', data.parent_id || null]
    );
    return result.rows[0];
  },

  update: async (id: string, data: Partial<Folder>): Promise<Folder | null> => {
    const keys = Object.keys(data);
    if (keys.length === 0) return null;

    const values = Object.values(data);
    const setClause = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');

    const result = await query<Folder>(
      `UPDATE folders SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id, ...values]
    );
    return result.rows[0] || null;
  },

  delete: async (id: string): Promise<void> => {
    await query('DELETE FROM folders WHERE id = $1', [id]);
  },
};

// ============================================
// USAGE LOGS
// ============================================
export interface UsageLog {
  id: string;
  user_id: string;
  organization_id?: string;
  resource_type: string;
  units_consumed?: number;
  recording_id?: string;
  conversation_id?: string;
  created_at: string;
}

export const usageLogs = {
  create: async (data: Omit<UsageLog, 'id' | 'created_at'>): Promise<UsageLog> => {
    const result = await query<UsageLog>(
      `INSERT INTO usage_logs (user_id, organization_id, resource_type, units_consumed, recording_id, conversation_id, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       RETURNING *`,
      [
        data.user_id,
        data.organization_id || null,
        data.resource_type,
        data.units_consumed || null,
        data.recording_id || null,
        data.conversation_id || null,
      ]
    );
    return result.rows[0];
  },
};

// ============================================
// PRO PLUS WAITLIST
// ============================================
export interface ProPlusWaitlistEntry {
  id: string;
  user_id: string;
  email: string;
  full_name?: string;
  status: 'pending' | 'approved' | 'rejected' | 'converted';
  feedback?: string;
  use_case?: string;
  company?: string;
  created_at: string;
  updated_at: string;
}

export const proPlusWaitlist = {
  findByUserId: async (userId: string, statuses?: string[]): Promise<ProPlusWaitlistEntry | null> => {
    if (statuses && statuses.length > 0) {
      const result = await query<ProPlusWaitlistEntry>(
        'SELECT * FROM pro_plus_waitlist WHERE user_id = $1 AND status = ANY($2)',
        [userId, statuses]
      );
      return result.rows[0] || null;
    }
    const result = await query<ProPlusWaitlistEntry>(
      'SELECT * FROM pro_plus_waitlist WHERE user_id = $1',
      [userId]
    );
    return result.rows[0] || null;
  },

  create: async (data: Omit<ProPlusWaitlistEntry, 'id' | 'created_at' | 'updated_at'>): Promise<ProPlusWaitlistEntry> => {
    const result = await query<ProPlusWaitlistEntry>(
      `INSERT INTO pro_plus_waitlist (user_id, email, full_name, status, feedback, use_case, company, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
       RETURNING *`,
      [
        data.user_id,
        data.email,
        data.full_name || null,
        data.status || 'pending',
        data.feedback || null,
        data.use_case || null,
        data.company || null,
      ]
    );
    return result.rows[0];
  },
};

// ============================================
// USER SETTINGS
// ============================================
export interface UserSettings {
  id: string;
  theme?: string;
  language?: string;
  notifications_enabled?: boolean;
  email_notifications?: boolean;
  auto_delete_audio?: boolean;
  default_mode?: string;
  created_at: string;
  updated_at: string;
}

export const userSettings = {
  findById: async (userId: string): Promise<UserSettings | null> => {
    const result = await query<UserSettings>('SELECT * FROM user_settings WHERE id = $1', [userId]);
    return result.rows[0] || null;
  },

  upsert: async (userId: string, data: Partial<UserSettings>): Promise<UserSettings> => {
    const keys = Object.keys(data).filter((k) => k !== 'id');
    const values = keys.map((k) => data[k as keyof UserSettings]);

    // Build the upsert query
    const insertCols = ['id', ...keys].join(', ');
    const insertVals = ['$1', ...keys.map((_, i) => `$${i + 2}`)].join(', ');
    const updateSet = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');

    const result = await query<UserSettings>(
      `INSERT INTO user_settings (${insertCols}, created_at, updated_at)
       VALUES (${insertVals}, NOW(), NOW())
       ON CONFLICT (id) DO UPDATE SET ${updateSet}, updated_at = NOW()
       RETURNING *`,
      [userId, ...values]
    );
    return result.rows[0];
  },
};

// Export a db object for convenience
export const db = {
  profiles,
  recordings,
  notes,
  actionItems,
  transcriptions,
  folders,
  usageLogs,
  proPlusWaitlist,
  userSettings,
  query,
  transaction,
};
