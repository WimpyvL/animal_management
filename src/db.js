import { openDB } from 'idb';

const dbName = 'AnimalDB';
const animalStoreName = 'animals';
const userStoreName = 'users';

export const initDB = async () => {
  const db = await openDB(dbName, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(animalStoreName)) {
        const animalStore = db.createObjectStore(animalStoreName, { 
          keyPath: 'id', 
          autoIncrement: true 
        });
        animalStore.createIndex('name', 'name');
        animalStore.createIndex('type', 'type');
        animalStore.createIndex('qrCode', 'qrCode');
      }
      if (!db.objectStoreNames.contains(userStoreName)) {
        const userStore = db.createObjectStore(userStoreName, { 
          keyPath: 'username', 
          unique: true 
        });
      }
    },
  });
  return db;
};

export const addAnimal = async (db, animal, type) => {
  const tx = db.transaction(animalStoreName, 'readwrite');
  const store = tx.objectStore(animalStoreName);
  const id = await store.add({ ...animal, type });
  await tx.done;
  return id;
};

export const getAnimal = async (db, id) => {
  return await db.get(animalStoreName, id);
};

export const getAllAnimals = async (db) => {
  return await db.getAll(animalStoreName);
};

export const updateAnimal = async (db, id, animal, type) => {
  const tx = db.transaction(animalStoreName, 'readwrite');
  const store = tx.objectStore(animalStoreName);
  await store.put({ ...animal, id, type });
  await tx.done;
};

export const deleteAnimal = async (db, id) => {
  const tx = db.transaction(animalStoreName, 'readwrite');
  const store = tx.objectStore(animalStoreName);
  await store.delete(id);
  await tx.done;
};

export const addUser = async (db, username, password) => {
  const tx = db.transaction(userStoreName, 'readwrite');
  const store = tx.objectStore(userStoreName);
  await store.add({ username, password });
  await tx.done;
};

export const getUser = async (db, username) => {
  return await db.get(userStoreName, username);
};
