import { useMemo } from 'react';
import type { Role } from '../types';

export type VisibilityTier = 'all' | 'dept' | 'admin_hr';

/**
 * Gating logic for content rendering based on visibility tiers.
 * - Tier 1: ALL_EMPLOYEES ('all') -> visible to everyone.
 * - Tier 2: DEPARTMENT_SCOPED ('dept') -> visible only if user's department matches content department, or user is HR/Admin.
 * - Tier 3: ADMIN_HR_ONLY ('admin_hr') -> visible only to HR or Admin users.
 */
export function checkVisibility(
  tier: VisibilityTier,
  userRole: Role,
  userDept: string,
  contentDept?: string
): boolean {
  if (tier === 'all') return true;
  
  if (tier === 'dept') {
    return (
      userDept === contentDept ||
      userRole === 'hr' ||
      userRole === 'admin'
    );
  }
  
  if (tier === 'admin_hr') {
    return userRole === 'hr' || userRole === 'admin';
  }
  
  return false;
}

export function useVisibility(
  tier: VisibilityTier,
  userRole: Role,
  userDept: string,
  contentDept?: string
): boolean {
  return useMemo(() => {
    return checkVisibility(tier, userRole, userDept, contentDept);
  }, [tier, userRole, userDept, contentDept]);
}
