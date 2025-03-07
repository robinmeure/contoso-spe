// src/providers/ChatAuthProvider.ts

import { IChatEmbeddedApiAuthProvider } from '@microsoft/sharepointembedded-copilotchat-react';
import { useMsal } from '@azure/msal-react';
import { useState, useCallback, useMemo } from 'react';

export interface ChatAuthProviderProps {
  hostname: string;
}

export const useChatAuthProvider = ({ hostname }: ChatAuthProviderProps): IChatEmbeddedApiAuthProvider => {
  const { instance } = useMsal();
  const [spoAccessToken, setSpoAccessToken] = useState<string>('');
  
  // The scope needed for SharePoint Embedded container access
  const spoScope = useMemo(() => {
    // Remove trailing slash if present
    const cleanHostname = hostname.endsWith('/') ? hostname.slice(0, -1) : hostname;
    return `${cleanHostname}/Container.Selected`;
  }, [hostname]);
  
  const getToken = useCallback(async (): Promise<string> => {
    try {
      // Try to get token silently first
      const accounts = instance.getAllAccounts();
      if (accounts.length === 0) {
        throw new Error('No accounts found, user must sign in');
      }
      
      const request = {
        scopes: [spoScope],
        account: accounts[0],
      };
      
      // Try to get token silently first
      const response = await instance.acquireTokenSilent(request);
      setSpoAccessToken(response.accessToken);
      return response.accessToken;
    } catch (error) {
      console.error('Error getting SPO token:', error);
      
      // If silent acquisition fails, try interactive
      try {
        const response = await instance.acquireTokenPopup({
          scopes: [spoScope],
        });
        setSpoAccessToken(response.accessToken);
        return response.accessToken;
      } catch (popupError) {
        console.error('Failed to get token interactively:', popupError);
        throw new Error('Failed to authenticate with SharePoint');
      }
    }
  }, [instance, spoScope]);
  
  return {
    hostname,
    getToken,
  };
};

// Create a singleton instance that can be configured at app initialization
export class ChatAuthProvider implements IChatEmbeddedApiAuthProvider {
  private static _instance: ChatAuthProvider;
  private _hostname: string = '';
  private _getTokenFunction: (() => Promise<string>) | null = null;
  private _isConfigured: boolean = false;
  private _configPromise: Promise<void> | null = null;
  private _resolveConfigPromise: (() => void) | null = null;
  
  private constructor() {
    // Private constructor to enforce singleton
    // Create a promise that will resolve when configuration is complete
    this._configPromise = new Promise<void>((resolve) => {
      this._resolveConfigPromise = resolve;
    });
  }
  
  public static get instance(): ChatAuthProvider {
    if (!ChatAuthProvider._instance) {
      ChatAuthProvider._instance = new ChatAuthProvider();
    }
    return ChatAuthProvider._instance;
  }
  
  public configure(hostname: string, getTokenFunction: () => Promise<string>): void {
    this._hostname = hostname;
    this._getTokenFunction = getTokenFunction;
    this._isConfigured = true;
    
    // Resolve the configuration promise
    if (this._resolveConfigPromise) {
      this._resolveConfigPromise();
    }
    
    console.log('ChatAuthProvider configured with hostname:', hostname);
  }
  
  public get hostname(): string {
    return this._hostname;
  }
  
  public get isConfigured(): boolean {
    return this._isConfigured;
  }
  
  public async waitForConfiguration(): Promise<void> {
    if (this._isConfigured) {
      return Promise.resolve();
    }
    
    return this._configPromise as Promise<void>;
  }
  
  public async getToken(): Promise<string> {
    // Wait for configuration to complete first
    if (!this._isConfigured) {
      console.log('ChatAuthProvider not configured yet, waiting for configuration...');
      await this.waitForConfiguration();
    }
    
    if (!this._getTokenFunction) {
      console.error('ChatAuthProvider error: Provider not configured or improperly initialized');
      throw new Error('ChatAuthProvider not configured. Call ChatAuthProvider.instance.configure(hostname, getTokenFunction) first.');
    }
    
    try {
      console.log('ChatAuthProvider: Getting token...');
      const token = await this._getTokenFunction();
      console.log('ChatAuthProvider: Token acquired successfully');
      return token;
    } catch (error) {
      console.error('Error getting token:', error);
      throw new Error('Failed to retrieve authentication token. Please check your connection and try again.');
    }
  }
}