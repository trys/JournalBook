import { openDb } from 'idb';

export class DB {
  db;

  constructor(dbPromise) {
    this.db = dbPromise || openDb('entries-store');
  }

  get(table, key) {
    return this.db.then(db =>
      db
        .transaction(table)
        .objectStore(table)
        .get(key)
    );
  }

  set(table, key, val) {
    return this.db.then(db => {
      const tx = db.transaction(table, 'readwrite');
      tx.objectStore(table).put(val, key);
      return tx.complete;
    });
  }

  delete(table, key) {
    return this.db.then(db => {
      const tx = db.transaction(table, 'readwrite');
      tx.objectStore(table).delete(key);
      return tx.complete;
    });
  }

  clear(table) {
    return this.db.then(db => {
      const tx = db.transaction(table, 'readwrite');
      tx.objectStore(table).clear();
      return tx.complete;
    });
  }

  keys(table) {
    return this.db.then(db => {
      const tx = db.transaction(table);
      const keys = [];
      const store = tx.objectStore(table);

      (store.iterateKeyCursor || store.iterateCursor).call(store, cursor => {
        if (!cursor) return;
        keys.push(cursor.key);
        cursor.continue();
      });

      return tx.complete.then(() => {
        keys.reverse();
        return keys;
      });
    });
  }

  getAll(table) {
    return this.db.then(db =>
      db
        .transaction(table)
        .objectStore(table)
        .getAll()
    );
  }
}
