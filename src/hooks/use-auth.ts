import { login, logout } from "@/redux/features/auth/authSlice";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { getCurrentUser, fetchAuthSession } from "aws-amplify/auth";
import { useCallback, useEffect, useState, useRef } from "react";

const useAuth = () => {
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const hasCheckedAuth = useRef(false);

  const fetchUser = useCallback(async () => {
    // Prevent multiple simultaneous auth checks
    if (hasCheckedAuth.current) {
      return;
    }
    hasCheckedAuth.current = true;

    try {
      setIsLoading(true);

      // Retry mechanism: Amplify may return undefined tokens initially
      // while loading from storage. We'll check up to 3 times with delays.
      let session;
      let retries = 0;
      const maxRetries = 3;

      do {
        session = await fetchAuthSession();
        console.log("Session:", session);

        if (session.tokens?.accessToken || session.userSub) {
          break;
        }

        if (retries < maxRetries - 1) {
          await new Promise((resolve) => setTimeout(resolve, 50));
        }
        retries++;
      } while (retries < maxRetries);

      if (session.tokens?.accessToken) {
        try {
          const currentUser = await getCurrentUser();
          console.log("User authenticated:", currentUser);
          dispatch(login({ user: currentUser }));
        } catch (userError) {
          console.error("Error getting user despite valid tokens:", userError);
          dispatch(logout());
        }
      } else {
        console.log("No authenticated user found");
        dispatch(logout());
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      dispatch(logout());
    } finally {
      setIsLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // TODO: Implement syncUserInfo

  return { user, isLoading, fetchUser };
};

export default useAuth;
