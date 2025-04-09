import { supabase } from '../lib/supabase';
import { UserRoleStats } from '../context/AnalyticsContext';

interface User {
  id: string;
  role?: string;
}

export const getTotalUsersCount = async (): Promise<number> => {
  const { count } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true });
  return count || 0;
};

export const getUserRoleStats = async (): Promise<UserRoleStats[]> => {
  const { data } = await supabase
    .from('users')
    .select('role')
    .not('role', 'is', null);

  const roleCounts = (data || []).reduce((acc, user) => {
    const role = user.role || 'Unknown';
    acc[role] = (acc[role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(roleCounts).map(([role, count]) => ({ role, count }));
};