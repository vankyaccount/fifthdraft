// Database configuration
// Supports both Supabase (development) and direct PostgreSQL (production)

export type DatabaseProvider = 'supabase' | 'postgres';

export interface DatabaseConfig {
  provider: DatabaseProvider;
  // Supabase config
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  supabaseServiceRoleKey?: string;
  // Direct PostgreSQL config
  postgresHost?: string;
  postgresPort?: number;
  postgresDatabase?: string;
  postgresUser?: string;
  postgresPassword?: string;
  postgresSsl?: boolean;
}

export function getDatabaseConfig(): DatabaseConfig {
  // Check if we should use direct PostgreSQL (production on OVHcloud)
  const usePostgres = process.env.DATABASE_PROVIDER === 'postgres' ||
                      process.env.POSTGRES_HOST !== undefined;

  if (usePostgres) {
    return {
      provider: 'postgres',
      postgresHost: process.env.POSTGRES_HOST || 'localhost',
      postgresPort: parseInt(process.env.POSTGRES_PORT || '5432'),
      postgresDatabase: process.env.POSTGRES_DATABASE || 'fifthdraft',
      postgresUser: process.env.POSTGRES_USER || 'postgres',
      postgresPassword: process.env.POSTGRES_PASSWORD || '',
      postgresSsl: process.env.POSTGRES_SSL === 'true',
    };
  }

  // Default to Supabase (development)
  return {
    provider: 'supabase',
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  };
}

export function isUsingSupabase(): boolean {
  return getDatabaseConfig().provider === 'supabase';
}

export function isUsingPostgres(): boolean {
  return getDatabaseConfig().provider === 'postgres';
}
