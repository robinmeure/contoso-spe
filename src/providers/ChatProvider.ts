import { ChatEmbedded, ChatLaunchConfig, IDataSourcesProps } from '@microsoft/sharepointembedded-copilotchat-react';

type DataSourceSubscriber = (dataSources: IDataSourcesProps[]) => void;
type ConfigSubscriber = (config: ChatLaunchConfig) => void;

/**
 * ChatProvider - Singleton service to manage Copilot chat configuration and data sources
 */
export class ChatProvider {
  private static _instance: ChatProvider;
  private _dataSources: IDataSourcesProps[] = [];
  private _dataSourceSubscribers: DataSourceSubscriber[] = [];
  private _configSubscribers: ConfigSubscriber[] = [];
  private _config: ChatLaunchConfig | undefined;
  private _isConfigSet: boolean = false;

  private constructor() {
    // Private constructor to enforce singleton
    console.log('ChatProvider instance created');
  }

  public static get instance(): ChatProvider {
    if (!ChatProvider._instance) {
      ChatProvider._instance = new ChatProvider();
    }
    return ChatProvider._instance;
  }

  /**
   * Set the chat configuration
   */
  public setChatConfig(config: ChatLaunchConfig): void {
    if (!config) {
      console.error('Attempted to set undefined or null chat config');
      return;
    }
    
    console.log('Setting chat config:', config);
    this._config = config;
    this._isConfigSet = true;
    
    // Notify subscribers
    this._notifyConfigSubscribers();
  }

  /**
   * Get the chat configuration
   */
  public getChatConfig(): ChatLaunchConfig | undefined {
    console.log('Getting chat config, isConfigSet:', this._isConfigSet);
    if (!this._config) {
      console.warn('Chat config is undefined');
    }
    return this._config;
  }

  /**
   * Check if the chat configuration has been set
   */
  public get isConfigSet(): boolean {
    return this._isConfigSet && this._config !== undefined;
  }

  /**
   * Set data sources for the chat
   */
  public setDataSources(dataSources: IDataSourcesProps[]): void {
    if (!dataSources) {
      console.error('Attempted to set undefined or null data sources');
      return;
    }
    
    console.log('Setting data sources:', dataSources);
    this._dataSources = [...dataSources]; // Create a new array to avoid external modifications
    this._notifyDataSourceSubscribers();
  }

  /**
   * Get the current data sources
   */
  public getDataSources(): IDataSourcesProps[] {
    return [...this._dataSources]; // Return a copy to prevent external mutations
  }

  /**
   * Add a data source to the chat
   */
  public addDataSource(dataSource: IDataSourcesProps): void {
    if (!dataSource) {
      console.error('Attempted to add undefined or null data source');
      return;
    }
    
    console.log('Adding data source:', dataSource);
    this._dataSources.push(dataSource);
    this._notifyDataSourceSubscribers();
  }
  
  /**
   * Remove a data source from the chat
   */
  public removeDataSource(dataSource: IDataSourcesProps): boolean {
    const initialLength = this._dataSources.length;
    this._dataSources = this._dataSources.filter(ds => ds !== dataSource);
    
    const removed = initialLength !== this._dataSources.length;
    if (removed) {
      console.log(`Removed data source with id: ${dataSource}`);
      this._notifyDataSourceSubscribers();
    } else {
      console.warn(`No data source found with id: ${dataSource}`);
    }
    return removed;
  }

  /**
   * Subscribe to data source changes
   */
  public addDataSourceSubscriber(callback: DataSourceSubscriber): () => void {
    if (!callback) {
      console.error('Attempted to add undefined or null data source subscriber');
      return () => {}; // Return no-op function
    }
    
    this._dataSourceSubscribers.push(callback);
    
    // Notify the new subscriber with current state immediately
    try {
      callback([...this._dataSources]);
    } catch (error) {
      console.error('Error notifying data source subscriber:', error);
    }
    
    // Return unsubscribe function
    return () => {
      this._dataSourceSubscribers = this._dataSourceSubscribers.filter(sub => sub !== callback);
    };
  }

  /**
   * Subscribe to config changes
   */
  public addConfigSubscriber(callback: ConfigSubscriber): () => void {
    if (!callback) {
      console.error('Attempted to add undefined or null config subscriber');
      return () => {}; // Return no-op function
    }
    
    this._configSubscribers.push(callback);
    
    // If config is already set, notify the subscriber immediately
    if (this._isConfigSet && this._config) {
      try {
        callback(this._config);
      } catch (error) {
        console.error('Error notifying config subscriber:', error);
      }
    }
    
    // Return unsubscribe function
    return () => {
      this._configSubscribers = this._configSubscribers.filter(sub => sub !== callback);
    };
  }

  /**
   * Reset the provider state
   */
  public reset(): void {
    console.log('Resetting ChatProvider state');
    this._dataSources = [];
    this._config = undefined;
    this._isConfigSet = false;
    // Don't clear subscribers - they should be notified of the reset
    this._notifyDataSourceSubscribers();
    // No need to notify config subscribers as there's no config
  }

  /**
   * Notify all data source subscribers
   */
  private _notifyDataSourceSubscribers(): void {
    const dataSources = [...this._dataSources];
    this._dataSourceSubscribers.forEach(subscriber => {
      try {
        subscriber(dataSources);
      } catch (error) {
        console.error('Error in data source subscriber:', error);
      }
    });
  }
  
  /**
   * Notify all config subscribers
   */
  private _notifyConfigSubscribers(): void {
    if (!this._config) {
      return;
    }
    
    const config = this._config; // Create local reference for safety
    this._configSubscribers.forEach(subscriber => {
      try {
        subscriber(config);
      } catch (error) {
        console.error('Error in config subscriber:', error);
      }
    });
  }
}