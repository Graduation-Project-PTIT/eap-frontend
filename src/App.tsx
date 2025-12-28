import { useRoutes, useLocation, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { configureAmplify } from "./lib/amplify.ts";
import { useEffect } from "react";
import router from "./router.tsx";
import useAuth from "./hooks/use-auth.ts";
import ROUTES from "./constants/routes.ts";

const App = () => {
  const routes = useRoutes(router);

  const { user, isLoading: isFetchingUser } = useAuth();
  const { pathname } = useLocation();
  const isOnAuthRoute = pathname.startsWith(ROUTES.AUTH.ROOT);
  const isOnCallbackRoute = pathname === ROUTES.AUTH.CALLBACK;

  useEffect(() => {
    configureAmplify();
  }, []);

  if (isFetchingUser) {
    console.log("Loading user...");
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!user && !isOnAuthRoute && !isFetchingUser) {
    console.log("Redirecting to sign in...");
    return <Navigate to={ROUTES.AUTH.SIGN_IN} replace />;
  }

  // Don't redirect if on callback route - let the callback component handle it
  if (user && isOnAuthRoute && !isOnCallbackRoute) {
    console.log("Redirecting to dashboard...");
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return (
    <>
      {routes}
      <Toaster />
    </>
  );
};

export default App;
