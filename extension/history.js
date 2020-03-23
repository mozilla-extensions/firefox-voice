/* globals log */

export class Database {
  constructor(dbName) {
    this.dbName = dbName;
    this.readonly = "readonly";
    this.readwrite = "readwrite";
  }

  createTable(tbName, primaryKey, version) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, version);
      request.onupgradeneeded = e => {
        const database = e.target.result;
        database.createObjectStore(tbName, {
          keyPath: primaryKey,
        });
      };
      request.onsuccess = e => {
        const database = e.target.result;
        resolve(database);
      };
      request.onerror = e => {
        const code = e.target.errorCode;
        reject(new Error(`Failed to create a database: ${code}`));
      };
    });
  }

  get(tbName, primaryKey) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName);
      request.onsuccess = e => {
        const database = e.target.result;
        const transaction = database.transaction([tbName]);
        const objectStore = transaction.objectStore(tbName);
        const read = objectStore.get(primaryKey);
        read.onsuccess = e => {
          log.info("Got result:", read.result);
          resolve(read.result);
        };
        read.onerror = e => {
          const code = e.target.errorCode;
          reject(new Error(`Unable to retrieve data from database: ${code}`));
        };
        database.close();
      };
      request.onerror = e => {
        const code = e.target.errorCode;
        reject(new Error(`Unable to retrieve from database: ${code}`));
      };
    });
  }

  /**
   * Retrieves all documents from the table.
   * @param {string} tbName - the table name to retrieve documents from
   * @param {string} direction - "prev" is most recent first (based on
   * primaryKey), "next" is most recent last (based on primaryKey)
   * @returns {Promise} The documents
   */
  getAll(tbName, direction) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName);
      request.onsuccess = e => {
        const database = e.target.result;
        const objectStore = database.transaction(tbName).objectStore(tbName);
        const list = [];
        // default to descending order (or most recent if
        // the primary key is timestamp)
        const request = direction
          ? objectStore.openCursor(null, direction)
          : objectStore.openCursor(null, "prev");
        request.onsuccess = e => {
          const cursor = e.target.result;
          if (cursor) {
            list.push(cursor.value);
            cursor.continue();
          } else {
            resolve(list);
          }
        };
        request.onerror = e => {
          const code = e.target.errorCode;
          reject(new Error(`Unable to retrieve data from database: ${code}`));
        };
      };
    });
  }

  add(tbName, obj) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName);
      request.onsuccess = e => {
        const database = e.target.result;
        const add = database
          .transaction([tbName], this.readwrite)
          .objectStore(tbName)
          .add(obj);
        add.onsuccess = e => {
          log.info("1 record has been added to your database.");
          resolve();
        };
        add.onerror = e => {
          const code = e.target.errorCode;
          reject(new Error(`Unable to add data records: ${code}`));
        };
        database.close();
      };
    });
  }

  delete(tbName, primaryKey) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName);
      request.onsuccess = e => {
        const database = e.target.result;
        const remove = database
          .transaction([tbName], this.readwrite)
          .objectStore(tbName)
          .delete(primaryKey);
        remove.onsuccess = e => {
          log.info("This entry has been removed from your database.");
          resolve();
        };
        remove.onerror = e => {
          const code = e.target.errorCode;
          reject(new Error(`Entry could not be removed in databse: ${code}`));
        };
        database.close();
      };
    });
  }

  clearAll(tbName) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName);
      request.onsuccess = e => {
        const database = e.target.result;
        const objectStore = database
          .transaction(tbName, this.readwrite)
          .objectStore(tbName);
        const clear = objectStore.clear();
        clear.onsuccess = e => {
          log.info("Successfully removed all entries in the table");
          resolve();
        };
        clear.onerror = e => {
          const code = e.target.errorCode;
          reject(new Error(`Failed to remove entries in database: ${code}`));
        };
        database.close();
      };
    });
  }
}
