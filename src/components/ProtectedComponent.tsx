import { ReactNode, useEffect } from "react";
import { useRole } from "@/contexts/RoleContext";
import { useNavigate } from "react-router-dom"; // For navigation (React Router v6)

interface ProtectedComponentProps {
  feature: string;
  children: ReactNode;
  fallback?: ReactNode;
  redirectTo?: string; // Optional prop to specify where to redirect the user
}

export function ProtectedComponent({
  feature,
  children,
  fallback = null,
  redirectTo = "/forbidden", // Default fallback URL if not provided
}: ProtectedComponentProps) {
  const { canAccess } = useRole();
  const navigate = useNavigate(); // Used for redirection

  // If the user doesn't have access to the feature, either show fallback or redirect
  useEffect(() => {
    if (!canAccess(feature)) {
      if (redirectTo) {
        navigate(redirectTo); // Redirect if no access
      }
    }
  }, [feature, canAccess, navigate, redirectTo]);

  // If user doesn't have access, show the fallback message or component
  if (!canAccess(feature)) {
    return fallback || <div>You do not have permission to access this feature.</div>;
  }

  // If the user has access, render the children components
  return <>{children}</>;
}
