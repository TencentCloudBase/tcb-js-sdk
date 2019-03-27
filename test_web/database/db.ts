// database db
import * as assert from 'power-assert';
import { register } from '../index';

export function registerDb(app) {
  const db = app.database();

  register('get collection reference', () => {
    const collName = 'coll-1';
    const collection = db.collection(collName);
    assert(collection.name === collName);
  });

  register('Error: get collection without collection name', () => {
    try {
      db.collection();
    } catch (e) {
      assert(e.message === 'Collection name is required');
    }
  });
}
