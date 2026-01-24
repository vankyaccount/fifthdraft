/**
 * Temporary migration helper - provides Supabase-like interface using custom APIs
 * TODO: Replace all usages with direct API calls and remove this file
 */

// Stub createClient that throws helpful errors
export function createClient() {
  return {
    auth: {
      getUser: async () => {
        throw new Error(
          'Supabase removed: Use getCurrentUser() from @/lib/auth/client instead'
        );
      },
      signUp: async () => {
        throw new Error(
          'Supabase removed: Use signup() from @/lib/auth/client instead'
        );
      },
      signIn: async () => {
        throw new Error(
          'Supabase removed: Use login() from @/lib/auth/client instead'
        );
      },
    },
    from: (table: string) => {
      throw new Error(
        `Supabase removed: Use fetch('/api/${table}') or db.${table} from '@/lib/db/queries' instead`
      );
    },
    storage: {
      from: () => {
        throw new Error(
          'Supabase Storage removed: Use file system storage via /api/storage endpoints instead'
        );
      },
    },
  };
}
