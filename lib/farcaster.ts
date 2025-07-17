import { sdk } from '@farcaster/miniapp-sdk';

export interface FarcasterSDK {
  isReady: boolean;
  isLoading: boolean;
  error: Error | null;
  markReady: () => Promise<void>;
}

class FarcasterManager {
  private _isReady = false;
  private _isLoading = true;
  private _error: Error | null = null;
  private _readyPromise: Promise<void> | null = null;

  constructor() {
    this.initialize();
  }

  private async initialize() {
    try {
      // Wait a bit for the app to initialize
      await new Promise(resolve => setTimeout(resolve, 100));
      
      this._isLoading = false;
    } catch (error) {
      this._error = error instanceof Error ? error : new Error('Failed to initialize Farcaster SDK');
      this._isLoading = false;
    }
  }

  async markReady(): Promise<void> {
    if (this._readyPromise) {
      return this._readyPromise;
    }

    this._readyPromise = this._markReadyInternal();
    return this._readyPromise;
  }

  private async _markReadyInternal(): Promise<void> {
    try {
      if (typeof window !== 'undefined' && sdk?.actions?.ready) {
        await sdk.actions.ready();
        this._isReady = true;
      } else {
        // Fallback for non-miniapp environments
        this._isReady = true;
      }
    } catch (error) {
      console.warn('Failed to call SDK ready:', error);
      // Don't throw error, just mark as ready anyway
      this._isReady = true;
    }
  }

  get isReady() {
    return this._isReady;
  }

  get isLoading() {
    return this._isLoading;
  }

  get error() {
    return this._error;
  }
}

export const farcasterManager = new FarcasterManager();