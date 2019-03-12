import { ymd } from '../date';
import { DB } from '../db';

export default class FileAdapter {
  import = async () =>
    new Promise((resolve, reject) => {
      const db = new DB();
      const reader = new FileReader();
      const file = event.target.files[0];

      reader.onload = (() => async e => {
        try {
          const data = JSON.parse(e.target.result);
          await db.import(data);
          return resolve();
        } catch (e) {
          reject(e);
        }
      })();

      reader.readAsText(file);
    });

  export = async () => {
    const db = new DB();
    try {
      const MIME_TYPE = 'text/json;charset=utf-8';

      const data = await db.export();
      const blob = new Blob([JSON.stringify(data, null, 4)], {
        type: MIME_TYPE,
      });
      const name = `journalbook_${ymd()}.json`;

      const file = {
        name,
        data: window.URL.createObjectURL(blob),
      };
      return [file];
    } catch (e) {
      console.error(e);
    }
  };
}
