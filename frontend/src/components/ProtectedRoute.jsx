import { Navigate, useLocation } from "react-router-dom";
import { Center, Loader } from "@mantine/core";
import { useAuth } from "../context/AuthContext";

/**
 * Protects a route: if the user is not authenticated, redirects to /login
 * passing the current path as ?from=... so that after login the user is
 * brought back to the page they were trying to visit.
 */
function ProtectedRoute({ children }) {
  const { isAuthenticated, authLoaded } = useAuth();
  const location = useLocation();

  // Wait until the auth state has been restored from localStorage
  if (!authLoaded) {
    return (
      <Center h="60vh">
        <Loader size="lg" />
      </Center>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return children;
}

export default ProtectedRoute;
