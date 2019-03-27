// database collection
import * as assert from 'power-assert';
import { register } from '../index';
//import { ErrorCode } from '../../src/database/constant';

export function registerCollection(app) {
  const collName = 'coll-1';
  const db = app.database();
  const collection = db.collection(collName);

  register('name test', async () => {
    assert(collection.name === collName);
  });

  /*register('Error - use invalid docId to get reference', async () => {
    const docId = 'abcdefg';
    try {
      collection.doc(docId);
    } catch (e) {
      assert(e.message === ErrorCode.DocIDError);
    }
  });*/

  register('API - get all data', async () => {
    const res = await collection.get();
    assert(Array.isArray(res.data));
  });

  // register("API - use where", async () => {
  //   const field = "name";
  //   const value = "huming";
  //   const opStr = "==";
  //   const data = await collection.where(field, opStr, value).get();
  //   assert(Array.isArray(data.data));
  // });

  register('API - use orderBy', async () => {
    const field = 'huming';
    const direction = 'asc';
    const data = await collection.orderBy(field, direction).get();
    assert(Array.isArray(data.data));
  });

  register('API - use limit', async () => {
    const limit = 1;
    const data = await collection.limit(limit).get();
    assert(Array.isArray(data.data) && data.data.length === limit);
  });

  register('API - use offset', async () => {
    const offset = 2;
    const data = await collection.skip(offset).get();
    assert(Array.isArray(data.data));
  });

  register('API - add one doc, update and remove', async () => {
    const res = await collection.add({
      name: 'huming'
    });
    assert(res);

    const data = await collection.where({
      name: db.command.eq('huming')
    }).update({
      age: 18
    });
    assert(data.updated > 0);

    const remove = await collection.where({
      name: db.command.eq('huming')
    }).remove();

    assert(remove.deleted > 0);
  });

  register('API - use field', async () => {
    await db.createCollection(collName);
    const res = await collection.field({ 'age': 1 }).get();
    assert(Array.isArray(res.data));
  });

  register('API - add and remove with skip', async () => {
    const text = 'test for add and remove with skip';
    let i = 0;
    while (i++ < 10) {
      await collection.add({
        text
      });
    }

    let result = await collection.where({
      text
    }).get();

    assert(result.data.length > 0);

    await collection.where({
      text
    }).orderBy('text', 'asc').skip(3).remove();

    result = await collection.where({
      text
    }).get();

    console.log(result);
    assert(result.data.length === 0);
  });
}