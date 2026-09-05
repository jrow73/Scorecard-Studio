/**
 * Scorecard Studio
 * Browser storage abstraction
 * Version: 0.1.0-web-dev
 * Build: 004
 */

const DB_NAME = "scorecard-studio";
const DB_VERSION = 2;
const SETTINGS_STORE = "settings";
const PDF_STORE = "pdfTemplates";

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
    const record = await getRecord(SETTINGS_STORE, key);
    return record?.value ?? fallbackValue;
  } catch (error) {
    console.error(`Unable to read setting '${key}':`, error);
    throw new Error(`Could not read the '${key}' setting from browser storage.`);
  }
}

export async function setSetting(key, value) {
  try {
    const record = { key, value, updatedAt: new Date().toISOString() };
    await putRecord(SETTINGS_STORE, record);
    return value;
  } catch (error) {
    console.error(`Unable to save setting '${key}':`, error);
    throw new Error(`Could not save the '${key}' setting to browser storage.`);
  }
}

export async function savePdfTemplate(key, file) {
  try {
    if (!(file instanceof Blob)) throw new Error("PDF data must be a Blob or File.");
    const record = {
      key,
      name: file.name || "scorecard-template.pdf",
      type: file.type || "application/pdf",
      size: file.size,
      blob: file,
      updatedAt: new Date().toISOString()
    };
    await putRecord(PDF_STORE, record);
    return record;
  } catch (error) {
    console.error("Unable to save PDF template:", error);
    throw new Error("Could not save the PDF template to browser storage.");
  }
}

export async function getPdfTemplate(key) {
  try {
    return await getRecord(PDF_STORE, key);
  } catch (error) {
    console.error("Unable to read PDF template:", error);
    throw new Error("Could not read the PDF template from browser storage.");
  }
}

export async function deletePdfTemplate(key) {
  try {
    const database = await openDatabase();
    await runRequest(database, PDF_STORE, "readwrite", (store) => store.delete(key));
  } catch (error) {
    console.error("Unable to delete PDF template:", error);
    throw new Error("Could not remove the PDF template from browser storage.");
  }
}

async function getRecord(storeName, key) {
  const database = await openDatabase();
  return runRequest(database, storeName, "readonly", (store) => store.get(key));
}

async function putRecord(storeName, record) {
  const database = await openDatabase();
  return runRequest(database, storeName, "readwrite", (store) => store.put(record));
}

function openDatabase() {
  if (databasePromise) return databasePromise;

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
      if (!database.objectStoreNames.contains(PDF_STORE)) {
        database.createObjectStore(PDF_STORE, { keyPath: "key" });
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
    try {
      const transaction = database.transaction(storeName, mode);
      const store = transaction.objectStore(storeName);
      const request = requestFactory(store);
      let result;

      request.onsuccess = () => { result = request.result; };
      request.onerror = () => reject(request.error ?? new Error("IndexedDB request failed."));
      transaction.oncomplete = () => resolve(result);
      transaction.onerror = () => reject(transaction.error ?? new Error("IndexedDB transaction failed."));
      transaction.onabort = () => reject(transaction.error ?? new Error("IndexedDB transaction was aborted."));
    } catch (error) {
      reject(error);
    }
  });
}
