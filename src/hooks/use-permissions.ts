import { useState, useEffect, useCallback } from "react";
import { fetchAuthSession } from "aws-amplify/auth";

/**
 * Hook to manage user permissions based on Cognito groups
 *
 * Extracts roles from JWT token's cognito:groups claim
 * and provides helper functions to check permissions
 */
const usePermissions = () => {
  const [roles, setRoles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Extract user roles from Cognito JWT token
   */
  const getUserRoles = useCallback(async (): Promise<string[]> => {
    try {
      const session = await fetchAuthSession();
      const accessToken = session.tokens?.accessToken;

      if (!accessToken) {
        return [];
      }

      // Decode JWT payload to get cognito:groups claim
      const payload = accessToken.payload;
      const groups = (payload["cognito:groups"] as string[]) || [];

      return groups;
    } catch (error) {
      console.error("Error fetching user roles:", error);
      return [];
    }
  }, []);

  /**
   * Load user roles on mount
   */
  const loadRoles = useCallback(async () => {
    setIsLoading(true);
    const userRoles = await getUserRoles();
    setRoles(userRoles);
    setIsLoading(false);
  }, [getUserRoles]);

  useEffect(() => {
    loadRoles();
  }, [loadRoles]);

  /**
   * Check if user has a specific role (case-insensitive)
   */
  const hasRole = useCallback(
    (role: string): boolean => {
      return roles.some((r) => r.toLowerCase() === role.toLowerCase());
    },
    [roles],
  );

  /**
   * Check if user is a teacher
   */
  const isTeacher = useCallback((): boolean => {
    return hasRole("teacher");
  }, [hasRole]);

  /**
   * Check if user is an admin
   */
  const isAdmin = useCallback((): boolean => {
    return hasRole("admin");
  }, [hasRole]);

  /**
   * Check if user has any of the specified roles (case-insensitive)
   */
  const hasAnyRole = useCallback(
    (requiredRoles: string[]): boolean => {
      return requiredRoles.some((requiredRole) =>
        roles.some((userRole) => userRole.toLowerCase() === requiredRole.toLowerCase()),
      );
    },
    [roles],
  );

  /**
   * Check if user has all of the specified roles (case-insensitive)
   */
  const hasAllRoles = useCallback(
    (requiredRoles: string[]): boolean => {
      return requiredRoles.every((requiredRole) =>
        roles.some((userRole) => userRole.toLowerCase() === requiredRole.toLowerCase()),
      );
    },
    [roles],
  );

  /**
   * Refresh roles (useful after login or role changes)
   */
  const refreshRoles = useCallback(async () => {
    await loadRoles();
  }, [loadRoles]);

  return {
    roles,
    isLoading,
    hasRole,
    isTeacher,
    isAdmin,
    hasAnyRole,
    hasAllRoles,
    refreshRoles,
  };
};

export default usePermissions;
