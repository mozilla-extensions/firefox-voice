/* globals test, expect */

require("fake-indexeddb/auto");

import { Database } from "../../history.js";

global.log = (function() {
  const exports = {};
  exports.messaging = exports.debug = exports.info = exports.warn = exports.error = msg =>
    null;
  return exports;
})();

const DB_NAME = "voice-test";

test("history database API", () => {
  const db = new Database(DB_NAME);
  const TEST_TABLE = "test";
  const PRIMARY_KEY = "pKey";
  const VOICE_VERSION = 1;

  // Test creation of table
  db.createTable(TEST_TABLE, PRIMARY_KEY, VOICE_VERSION)
    .then(result => {
      expect(result.version).toBe(VOICE_VERSION);
      expect(result.name).toBe(DB_NAME);
      expect(result.objectStoreNames).toEqual([TEST_TABLE]);
    })
    .catch(e => {
      throw new Error(`Failed to create table: ${e}`);
    });

  // Test addition of an object on existing table
  const intent = { pKey: "1234", name: "Open Tab" };
  expect(db.add(TEST_TABLE, intent)).resolves;

  // Test retrieval of an object
  Database.get(DB_NAME, TEST_TABLE, "1234")
    .then(row => {
      expect(row.pKey).toBe("1234");
      expect(row.name).toBe("Open Tab");
    })
    .catch(e => {
      throw new Error(`Failed to get from table: ${e}`);
    });

  // Retrieving an entry that does not exist should fail
  expect(Database.get(DB_NAME, TEST_TABLE, "1111")).rejects;

  // Retrieve all entries from table
  Database.getAll(DB_NAME, TEST_TABLE)
    .then(rows => {
      expect(rows).toEqual([intent]);
    })
    .catch(e => {
      throw new Error(`Failed to get all from table: ${e}`);
    });

  // Error should not occur when removing existent or non-existent object
  expect(() => db.delete(TEST_TABLE, "1234")).not.toThrow();
  expect(() => db.delete(TEST_TABLE, "1111")).not.toThrow();

  Database.getAll(DB_NAME, TEST_TABLE)
    .then(rows => {
      expect(rows).toEqual([]);
    })
    .catch(e => {
      throw new Error(`Failed to get all from table: ${e}`);
    });

  const intent2 = { pKey: "4321", name: "Mute Tab" };
  db.add(TEST_TABLE, intent);
  db.add(TEST_TABLE, intent2);

  Database.getAll(DB_NAME, TEST_TABLE)
    .then(rows => {
      expect(rows).toEqual([intent2, intent]);
    })
    .catch(e => {
      throw new Error(`Failed to get all from table: ${e}`);
    });

  // Testing if all entries in the table are removed
  expect(() => db.clearAll(TEST_TABLE)).not.toThrow();

  Database.getAll(DB_NAME, TEST_TABLE)
    .then(rows => {
      expect(rows).toEqual([]);
    })
    .catch(e => {
      throw new Error(`Failed to get all from table: ${e}`);
    });
});
