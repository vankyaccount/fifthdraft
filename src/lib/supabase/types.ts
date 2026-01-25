/**
 * DEPRECATED: Supabase types - use types from @/lib/db/queries instead
 * This file provides compatibility shims during migration
 */

import type { Note as DbNote } from '@/lib/db/queries'

// Re-export DB types for compatibility
export type Database = any
export type Note = DbNote
