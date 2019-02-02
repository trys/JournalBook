import FileAdapter from './FileAdapter';
import DropboxAdapter from './DropboxAdapter';

const JOURNALBOOK_STORAGE_ADAPTER = 'journalbook_storage_adapter';

class Storage {
  constructor(adapters) {
    this.selectedAdapter = localStorage.getItem(JOURNALBOOK_STORAGE_ADAPTER);
    this.adapters = Object.assign({ file: new FileAdapter() }, adapters);
    if (!this.selectedAdapter) {
      this.setAdapter('file');
    }
  }

  get adapter() {
    return this.adapters[this.selectedAdapter];
  }

  requestAuth(provider) {
    if (provider === 'file') {
      return 'Provider not allowed';
    }
    const adapter = this.adapters[provider];
    if (!adapter) {
      return 'No Authentication Provider found';
    }

    adapter.requestAuth();
    return 'Redirecting to Auth provider';
  }

  authCallback(provider, query, cb) {
    if (provider === 'file') {
      return 'Provider not allowed';
    }
    const adapter = this.adapters[provider];
    if (!adapter) {
      return 'No Authentication Provider found';
    }

    adapter.authCallback(query, cb);
    return 'Processing...';
  }

  getAdapter() {
    return this.selectedAdapter;
  }

  setAdapter = adapter => {
    localStorage.setItem(JOURNALBOOK_STORAGE_ADAPTER, adapter);
    this.selectedAdapter = adapter;
  };

  sync = (data, cb) => {
    this.adapters[this.selectedAdapter].sync(data, cb);
  };
}
const storage = new Storage({
  dropbox: new DropboxAdapter({
    clientId: process.env.PREACT_APP_DROPBOX_CLIENT_ID,
    redirectUri: process.env.PREACT_APP_DROPBOX_REDIRCT_URI,
  }),
});

export default storage;
