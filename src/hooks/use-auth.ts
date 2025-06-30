import { login } from "@/redux/features/auth/authSlice";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { getCurrentUser, fetchAuthSession } from "aws-amplify/auth";
import { useCallback, useEffect, useState } from "react";

const useAuth = () => {
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // TODO: Implement syncUserInfo

  const fetchUser = useCallback(async () => {
    try {
      setIsLoading(true);
      const session = await fetchAuthSession();
      console.log(session);
      if (!session.userSub) {
        setIsLoading(false);
        return;
      }

      const user = await getCurrentUser();
      dispatch(login({ user }));
    } catch (error) {
      console.error("Error fetching user:", error);
    } finally {
      setIsLoading(false);
    }
  }, [dispatch]);

  return { user, isLoading, fetchUser };
};

export default useAuth;
