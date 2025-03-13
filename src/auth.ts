// src/auth.ts

import { useMsal } from "@azure/msal-react";
import { useState, useEffect, useCallback, useMemo } from "react";

export const useAuth = () => {
  const { instance } = useMsal();
  const [accessToken, setAccessToken] = useState<string>("");
  const accounts = instance.getAllAccounts();
  const account = accounts && accounts.length > 0 ? accounts[0] : null;
  const userId = account ? account.localAccountId : "";

  const accessTokenRequest = {
    scopes: [import.meta.env.VITE_PUBLIC_APP_SCOPE || ""],
    account: account || undefined
  };

  useEffect(() => {
    if (!account) return;
    const fetchData = async () => {
      try {
        const response = await instance.acquireTokenSilent(accessTokenRequest);
        setAccessToken(response.accessToken);
      } catch (error) {
        console.error("Silent token acquisition failed. Acquiring token using redirect.", error);
        // Optionally call acquireTokenRedirect if needed
        // await instance.acquireTokenRedirect(accessTokenRequest);
      }
    };
    fetchData();
  }, [instance, account]);

  const getAccessToken = useCallback(async () => {
    if (!account) throw new Error('No account available for token acquisition');
    if (!accessToken) {
      const response = await instance.acquireTokenSilent(accessTokenRequest);
      setAccessToken(response.accessToken);
      return response.accessToken;
    }
    return accessToken;
  }, [account, accessToken, instance, accessTokenRequest]);

  return useMemo(() => ({ userId, accessToken, getAccessToken }), [userId, accessToken, getAccessToken]);
};
