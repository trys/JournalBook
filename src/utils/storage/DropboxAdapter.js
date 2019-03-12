import Dropbox from 'dropbox';
import { DB } from '../db';

const ACCESS_TOKEN = 'journalbook_dropbox_token';

export default class DropboxAdapter {
  constructor({ clientId = '', redirectUri = '' }) {
    this.clientId = clientId;
    this.redirectUri = redirectUri;
    console.log(this.redirectUri, redirectUri);
  }

  isAuthenticated = () => !!localStorage.getItem(ACCESS_TOKEN);

  requestAuth = () => {
    const dbx = new Dropbox.Dropbox({ clientId: this.clientId });
    const authUrl = dbx.getAuthenticationUrl(this.redirectUri);
    window.location.href = authUrl;
  };

  authCallback = async (query, callback) => {
    console.log(query);
    const queryParts = {};
    window.location.hash
      .trim()
      .replace(/^(\?|#|&)/, '')
      .split('&')
      .forEach(param => {
        const parts = param.replace(/\+/g, ' ').split('=');
        // Firefox (pre 40) decodes `%3D` to `=`
        // https://github.com/sindresorhus/query-string/pull/37
        let key = parts.shift();
        let val = parts.length > 0 ? parts.join('=') : undefined;

        key = decodeURIComponent(key);

        // missing `=` should be `null`:
        // http://w3.org/TR/2012/WD-url-20120524/#collect-url-parameters
        val = val === undefined ? null : decodeURIComponent(val);

        if (queryParts[key] === undefined) {
          queryParts[key] = val;
        } else if (Array.isArray(queryParts[key])) {
          queryParts[key].push(val);
        } else {
          queryParts[key] = [queryParts[key], val];
        }
      });

    console.log(queryParts);
    this.setAccessToken(queryParts.access_token);

    setTimeout(() => callback(), 3000);
  };

  logout() {
    localStorage.removeItem(ACCESS_TOKEN);
  }

  import = async () =>
    new Promise(async (resolve, reject) => {
      const db = new DB();
      const dbx = new Dropbox.Dropbox({
        accessToken: localStorage.getItem(ACCESS_TOKEN),
      });

      try {
        const file = await dbx.filesDownload({ path: '/journalbook.json' });

        const reader = new FileReader();
        // This fires after the blob has been read/loaded.
        reader.addEventListener('loadend', async e => {
          const content = e.srcElement.result;
          const data = JSON.parse(content);
          await db.import(data);
          return resolve();
        });

        // Start reading the blob as text.
        reader.readAsText(file.fileBlob);
      } catch (e) {
        console.error(e);
      }
      setTimeout(() => resolve(), 3000);
    });

  export = async () => {
    const db = new DB();
    const dbx = new Dropbox.Dropbox({
      accessToken: localStorage.getItem(ACCESS_TOKEN),
    });
    const MIME_TYPE = 'text/json;charset=utf-8';

    const data = await db.export();
    const blob = new Blob([JSON.stringify(data, null, 4)], {
      type: MIME_TYPE,
    });
    const name = `journalbook.json`;
    await dbx.filesUpload({
      path: '/' + name,
      contents: blob,
      mode: { '.tag': 'overwrite' },
    });
    return [];
  };

  sync = (data, cb) => {
    setTimeout(() => cb(), 3000);
  };

  setAccessToken = accessToken => {
    localStorage.setItem(ACCESS_TOKEN, accessToken);
  };
}
