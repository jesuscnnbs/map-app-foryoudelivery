import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { LoadedDataset } from '../types/stop'

interface RutasDB extends DBSchema {
  dataset: {
    key: string
    value: LoadedDataset
  }
}

const DB_NAME = 'rutas-reparto'
const DB_VERSION = 1
const DATASET_KEY = 'current'

let dbPromise: Promise<IDBPDatabase<RutasDB>> | null = null

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<RutasDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('dataset')) {
          db.createObjectStore('dataset')
        }
      },
    })
  }
  return dbPromise
}

export async function saveDataset(dataset: LoadedDataset): Promise<void> {
  try {
    const db = await getDB()
    await db.put('dataset', dataset, DATASET_KEY)
  } catch (error) {
    console.warn('No se pudo guardar el dataset en IndexedDB', error)
  }
}

export async function loadDataset(): Promise<LoadedDataset | null> {
  try {
    const db = await getDB()
    return (await db.get('dataset', DATASET_KEY)) ?? null
  } catch (error) {
    console.warn('No se pudo leer el dataset de IndexedDB', error)
    return null
  }
}

export async function clearDataset(): Promise<void> {
  try {
    const db = await getDB()
    await db.delete('dataset', DATASET_KEY)
  } catch (error) {
    console.warn('No se pudo borrar el dataset de IndexedDB', error)
  }
}
