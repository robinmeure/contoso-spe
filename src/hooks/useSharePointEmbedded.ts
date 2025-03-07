import { useCallback } from 'react';
import { useAuth } from '../auth';
import { SharePointEmbeddedClient } from '../services/sharePointEmbeddedClient';

/**
 * React hook for accessing the SharePoint Embedded client
 */
export const useSPEClient = () => {
  const { getAccessToken } = useAuth();
  const containerTypeId = import.meta.env.VITE_SPE_CONTAINER_TYPE_ID || '';
  
  const getClient = useCallback(async () => {
    const token = await getAccessToken();
    return new SharePointEmbeddedClient(token, containerTypeId);
  }, [getAccessToken, containerTypeId]);
  
  return { getClient };
};