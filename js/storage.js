/**
 * Scorecard Studio
 * Browser storage abstraction
 * Version: 0.1.0-web-dev
 * Build: 003
 */

const DB_NAME = "scorecard-studio";
const DB_VERSION = 1;
const SETTINGS_STORE = "settings";

let databasePromise = null;

export async function initializeStorage() {
  try {
    const database = await openDatabase();
    return Boolean(database);
  } catch (error) {
    console.error("Unable to initialize browser storage:", error);
    throw new Error("Browser storage could not be initialized.");
  }
}

export async function getSetting(key, fallbackValue = null) {
  try {
    const database = await openDatabase();
    const record = await runRequest(
      database,
      SETTINGS_STORE,
      "readonly",
      (store) => store.get(key)
    );

    return record?.value ?? fallbackValue;
  } catch (error) {
    console.error(`Unable to read setting '${key}':`, error);
    throw new Error(`Could not read the '${key}' setting from browser storage.`);
  }
}

export async function setSetting(key, value) {
  try {
    const database = await openDatabase();
    const record = {
      key,
      value,
      updatedAt: new Date().toISOString()
    };

    await runRequest(
      database,
      SETTINGS_STORE,
      "readwrite",
      (store) => store.put(record)
    );

    return value;
  } catch (error) {
    console.error(`Unable to save setting '${key}':`, error);
    throw new Error(`Could not save the '${key}' setting to browser storage.`);
  }
}

function openDatabase() {
  if (databasePromise) {
    return databasePromise;
  }

  databasePromise = new Promise((resolve, reject) => {
    let request;

    try {
      request = indexedDB.open(DB_NAME, DB_VERSION);
    } catch (error) {
      reject(error);
      return;
    }

    request.onupgradeneeded = () => {
      const database = request.result;

      if (!database.objectStoreNames.contains(SETTINGS_STORE)) {
        database.createObjectStore(SETTINGS_STORE, { keyPath: "key" });
      }
    };

    request.onsuccess = () => {
      const database = request.result;

      database.onversionchange = () => {
        database.close();
        databasePromise = null;
      };

      resolve(database);
    };

    request.onerror = () => {
      databasePromise = null;
      reject(request.error ?? new Error("IndexedDB failed to open."));
    };

    request.onblocked = () => {
      console.warn("Scorecard Studio browser storage upgrade is blocked by another open tab.");
    };
  });

  return databasePromise;
}

function runRequest(database, storeName, mode, requestFactory) {
  return new Promise((resolve, reject) => {
    let transaction;

    try {
      transaction = database.transaction(storeName, mode);
      const store = transaction.objectStore(storeName);
      const request = requestFactory(store);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error ?? new Error("IndexedDB request failed."));
      transaction.onerror = () => reject(transaction.error ?? new Error("IndexedDB transaction failed."));
    } catch (error) {
      reject(error);
    }
  });
}
