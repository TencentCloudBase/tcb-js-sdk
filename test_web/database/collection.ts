// database collection
import * as assert from 'power-assert';
import { register,  isSuccess, callbackWithTryCatch, catchCallback } from '../util';

//import { ErrorCode } from '../../src/database/constant';

export function registerCollection(app) {
  const collName = 'coll-1';
  const db = app.database();
  const collection = db.collection(collName);

  register('database collection: name test', callbackWithTryCatch(() => {
    assert(collection.name === collName);
  }));

  register('database collection: add one doc, update and remove with callback', async () => {
    await new Promise(resolve => {
      collection.add({ a: 1 }, (err, res) => {
        try {
          assert(isSuccess(err, res), { err, res });
          assert(res.id, { err, res });
          assert(res.requestId, { err, res });

          let id = res.id;

          collection.doc(id).update({ age: 18 }, (err, res) => {
            try {
              assert(isSuccess(err, res), { err, res });
              assert(res.updated > 0);

              collection.doc(id).remove(callbackWithTryCatch((err, res) => {
                assert(isSuccess(err, res), { err, res });
                assert(res.deleted, { err, res });
                assert(res.requestId, { err, res });
              }, () => {
                resolve();
              }));
            } catch (e) {
              catchCallback(e);
              resolve();
            }
          });
        } catch (e) {
          catchCallback(e);
          resolve();
        }
      });
    });
  });

  register('database collection: add one doc, update and remove with promise', async () => {
    await new Promise(async resolve => {
      await collection.add({ a: 1 }).then(res => {
        try {
          assert(isSuccess(res), { res });
          assert(res.id, { res });
          assert(res.requestId, { res });

          let id = res.id;
          collection.doc(id).update({ age: 18 }).then(res => {
            try {
              assert(isSuccess(res), { res });
              assert(res.updated > 0);

              collection.doc(res.id).remove().then(callbackWithTryCatch(res => {
                assert(isSuccess(res), { res });
                assert(res.deleted, { res });
                assert(res.requestId, { res });
              }, () => {
                resolve();
              })).catch(callbackWithTryCatch(err => {
                assert(false, { err });
              }, () => {
                resolve();
              }));
            } catch (e) {
              catchCallback(e);
              resolve();
            }
          }).catch(callbackWithTryCatch(err => {
            assert(false, { err });
          }, () => {
            resolve();
          }));
        } catch (e) {
          catchCallback(e);
          resolve();
        }
      }).catch(callbackWithTryCatch(err => {
        assert(false, { err });
      }, () => {
        resolve();
      }));
    });
  });

  register('database collection: API - get all data', async () => {
    await collection.get().then(callbackWithTryCatch(res => {
      assert(Array.isArray(res.data), { res });
    })).catch(callbackWithTryCatch(err => {
      assert(false, { err });
    }));
  });

  register('database collection: API - use orderBy', async () => {
    const field = 'huming';
    const direction = 'asc';
    await collection.orderBy(field, direction).get().then(callbackWithTryCatch(res => {
      assert(Array.isArray(res.data), { res });
    })).catch(callbackWithTryCatch(err => {
      assert(false, { err });
    }));
  });

  register('database collection: API - use limit', async () => {
    const limit = 1;
    await collection.limit(limit).get().then(callbackWithTryCatch(res => {
      assert(Array.isArray(res.data && res.data.length === limit), { res });
    })).catch(callbackWithTryCatch(err => {
      assert(false, { err });
    }));
  });

  register('database collection: API - use offset', async () => {
    const offset = 2;
    await collection.skip(offset).get().then(callbackWithTryCatch(res => {
      assert(Array.isArray(res.data), { res });
    })).catch(callbackWithTryCatch(err => {
      assert(false, { err });
    }));
  });

  register('database collection: API - use field', async () => {
    await collection.field({ 'age': 1 }).get().then(callbackWithTryCatch(res => {
      assert(Array.isArray(res.data));
    })).catch(callbackWithTryCatch(err => {
      assert(false, { err });
    }));
  });

  register('database collection: API - add and remove with skip', async () => {
    return new Promise(async resolve => {
      try {
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
      } catch (e) {
        catchCallback(e);
      } finally {
        resolve();
      }
    });
  });
}