import type { User } from '@supabase/supabase-js';

export const DEVELOPER_EMAIL = 'zereapushev@gmail.com';

export function isDeveloper(user: User | null | undefined) {
  return user?.email?.toLowerCase() === DEVELOPER_EMAIL;
}
