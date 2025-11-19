import React from "react";
import { Navigate } from "react-router-dom";
import usePermissions from "@/hooks/use-permissions";
import ROUTES from "@/constants/routes";

interface PermissionGuardProps {
  requiredRole: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Permission Guard Component
 *
 * Protects routes based on user roles from Cognito groups.
 * If user doesn't have the required role, redirects to forbidden page.
 *
 * @param requiredRole - The role required to access the route (e.g., 'teacher', 'admin')
 * @param children - The component to render if user has permission
 * @param fallback - Optional custom fallback component (default: redirect to forbidden page)
 */
const PermissionGuard: React.FC<PermissionGuardProps> = ({
  requiredRole,
  children,
  fallback = <Navigate to={ROUTES.FORBIDDEN} replace />,
}) => {
  const { hasRole, isLoading } = usePermissions();

  // Show loading spinner while checking permissions
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-muted-foreground">Checking permissions...</p>
      </div>
    );
  }

  // Check if user has the required role
  if (!hasRole(requiredRole)) {
    return <>{fallback}</>;
  }

  // User has permission, render children
  return <>{children}</>;
};

export default PermissionGuard;
