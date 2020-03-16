/* globals log */

export class Database {
  constructor(dbName) {
    this.DBName = dbName;
    this.readonly = "readonly";
    this.readwrite = "readwrite";
  }

  createTable(TBName, primaryKey) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DBName);
      request.onupgradeneeded = e => {
        const database = e.target.result;
        database.createObjectStore(TBName, {
          keyPath: primaryKey,
        });
      };
      request.onsuccess = e => {
        const database = e.target.result;
        resolve(database);
      };
      request.onerror = function(e) {
        reject("Error: failed to create a database!");
      };
    });
  }

  get(primaryKey, TBName) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DBName);
      request.onsuccess = e => {
        const database = e.target.result;
        const transaction = database.transaction([TBName]);
        const objectStore = transaction.objectStore(TBName);
        const read = objectStore.get(primaryKey);

        read.onerror = function(event) {
          reject("Unable to retrieve data from database!");
        };

        read.onsuccess = function(event) {
          log.info("get result:", read.result);
          resolve(read.result);
        };
        database.close();
      };
      request.onerror = event => reject("Unable to retrieve from database!");
    });
  }

  getAll(TBName) {
    return new Promise(resolve => {
      const request = indexedDB.open(this.DBName);
      request.onsuccess = e => {
        const database = e.target.result;
        const objectStore = database.transaction(TBName).objectStore(TBName);
        const list = [];

        objectStore.openCursor().onsuccess = event => {
          const cursor = event.target.result;
          if (cursor) {
            list.push(cursor.value);
            cursor.continue();
          } else {
            resolve(list);
          }
        };
      };
    });
  }

  add(obj, TBName) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DBName);
      request.onsuccess = e => {
        const database = e.target.result;
        const add = database
          .transaction([TBName], this.readwrite)
          .objectStore(TBName)
          .add(obj);
        add.onsuccess = event => {
          // log.info("1 record has been added to your database.");
          resolve("1 record has been added to your database.");
        };
        add.onerror = event => reject("Unable to add data records");
        database.close();
      };
    });
  }

  delete(primaryKey, TBName) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DBName);
      request.onsuccess = e => {
        const database = e.target.result;
        const remove = database
          .transaction([TBName], this.readwrite)
          .objectStore(TBName)
          .delete(primaryKey);
        remove.onerror = event =>
          reject("This entry could not be removed from database.");
        remove.onsuccess = event =>
          resolve("This entry has been removed from your database.");
        database.close();
      };
    });
  }

  clearAll(TBName) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DBName);
      request.onsuccess = e => {
        const database = e.target.result;
        const objectStore = database
          .transaction(TBName, this.readwrite)
          .objectStore(TBName);
        const clear = objectStore.clear();
        clear.onsuccess = event => {
          resolve("successfully removed all entries in the table");
        };
        clear.onerror = error => {
          reject(error);
        };
        database.close();
      };
    });
  }
}
