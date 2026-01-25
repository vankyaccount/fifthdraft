/**
 * Temporary migration helper - provides Supabase-like interface using custom APIs
 * TODO: Replace all usages with direct API calls and remove this file
 */

// Stub createClient that returns types but throws at runtime
export function createClient(): any {
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
    from: (table: string): any => {
      return {
        select: () => ({ eq: () => ({ single: () => ({}) }) }),
        insert: () => ({}),
        update: () => ({ eq: () => ({}) }),
        delete: () => ({ eq: () => ({}) }),
      };
    },
    storage: {
      from: (): any => {
        return {
          upload: () => ({}),
          download: () => ({}),
        };
      },
    },
  };
}
