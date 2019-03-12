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

  async getObject(table) {
    const keys = await this.keys(table);
    const values = await Promise.all(keys.map(key => this.get(table, key)));

    return values.reduce((current, entry, index) => {
      current[keys[index]] = entry;
      return current;
    }, {});
  }

  async import({ entries, questions, highlights = [] }) {
    if (!entries || !questions || !Array.isArray(highlights)) {
      return false;
    }

    const questionKeys = Object.keys(questions);
    questionKeys.map(async key => {
      const current = await this.get('questions', key);
      if (!current) {
        await this.set('questions', key, questions[key]);
      }
    });

    const entryKeys = Object.keys(entries);
    await Promise.all(
      entryKeys.map(async key => {
        const current = await this.get('entries', key);
        if (!current) {
          return this.set('entries', key, entries[key]);
        }
      })
    );

    await Promise.all(
      highlights.map(async key => this.set('highlights', key, true))
    );
    return true;
  }

  async export() {
    try {
      const questionValues = await this.getAll('questions');
      const questions = questionValues.reduce((current, value, index) => {
        current[value.slug] = value;
        return current;
      }, {});

      const entryKeys = await this.keys('entries');
      const entryValues = await Promise.all(
        entryKeys.map(key => this.get('entries', key))
      );

      const entries = entryValues.reduce((current, entry, index) => {
        current[entryKeys[index]] = entry;
        return current;
      }, {});

      const highlights = await this.keys('highlights');

      return { questions, entries, highlights };
    } catch (e) {
      return {
        questions: {},
        entries: {},
        highlights: [],
      };
    }
  }
}
