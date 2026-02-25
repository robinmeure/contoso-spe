// src/auth.ts

import { useMsal } from "@azure/msal-react";
import { useState, useEffect, useCallback, useMemo } from "react";

export const useAuth = () => {
  const { instance } = useMsal();
  const [accessToken, setAccessToken] = useState<string>("");
  const accounts = instance.getAllAccounts();
  const account = accounts && accounts.length > 0 ? accounts[0] : null;
  const userId = account ? account.localAccountId : "";

  const scopes = useMemo(
    () => [import.meta.env.VITE_PUBLIC_APP_SCOPE || ""],
    []
  );

  useEffect(() => {
    if (!account) return;
    const fetchData = async () => {
      try {
        const response = await instance.acquireTokenSilent({
          scopes,
          account: account || undefined
        });
        setAccessToken(response.accessToken);
      } catch (error) {
        console.error("Silent token acquisition failed. Acquiring token using redirect.", error);
      }
    };
    fetchData();
  }, [instance, account, scopes]);

  const getAccessToken = useCallback(async () => {
    if (!account) throw new Error('No account available for token acquisition');
    if (!accessToken) {
      const response = await instance.acquireTokenSilent({
        scopes,
        account: account || undefined
      });
      setAccessToken(response.accessToken);
      return response.accessToken;
    }
    return accessToken;
  }, [account, accessToken, instance, scopes]);

  return useMemo(() => ({ userId, accessToken, getAccessToken }), [userId, accessToken, getAccessToken]);
};
