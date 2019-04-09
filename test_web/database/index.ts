// database
import * as assert from 'power-assert';

import {register, isSuccess, catchCallback, callbackWithTryCatch} from '../util';

import { registerCollection } from './collection';
import { registerCommand } from './command';
import { registerDate } from './date';
import { registerDb } from './db';
import { registerDocument } from './document';
import { registerGeo } from './geo';
import { registerOrder } from './order';
import { registerRegex } from './regex';

export async function test_database(app) {
  const collName = 'coll-1';

  registerCollection(app, collName);
  registerCommand(app, collName);
  registerDate(app, collName);
  registerDb(app, collName);
  registerDocument(app, collName);
  registerGeo(app, collName);
  registerOrder(app, collName);
  registerRegex(app, collName);

  register('Document - CRUD', async () => {
    await new Promise(async resolve => {
      try {
        const db = app.database();
        const _ = db.command;
        const collection = db.collection(collName);
        const initialData = {
          name: 'aaa',
          array: [1, 2, 3, [4, 5, 6], { a: 1, b: { c: 'fjasklfljkas', d: false }}],
          data: {
            a: 'a',
            b: 'b',
            c: 'c'
          },
          null: null,
          deepObject: {
            'l-02-01': {
              'l-03-01': {
                'l-04-01': {
                  level: 1,
                  name: 'l-01',
                  flag: '0'
                }
              }
            }
          }
        };

        // Create
        const res = await collection.add(initialData).catch(callbackWithTryCatch(err => {
          assert(false, { err });
        }, () => {
          resolve();
        }));
        assert(isSuccess(res) && res.id);
        assert(isSuccess(res) && res.requestId);

        // Read
        const { id } = res;
        let result = await collection.where({
          _id: id,
        }).get().catch(callbackWithTryCatch(err => {
          assert(false, { err });
        }, () => {
          resolve();
        }));
        assert.deepStrictEqual(result.data[0].name, initialData.name);
        assert.deepStrictEqual(result.data[0].array, initialData.array);
        assert.deepStrictEqual(result.data[0].deepObject, initialData.deepObject);

        result = await collection.where({
          null: _.or(_.eq(null))
        }).get().catch(callbackWithTryCatch(err => {
          assert(false, { err });
        }, () => {
          resolve();
        }));
        assert.deepStrictEqual(result.data[0].name, initialData.name);
        assert.deepStrictEqual(result.data[0].array, initialData.array);
        assert.deepStrictEqual(result.data[0].deepObject, initialData.deepObject);

        const doc = await collection.doc(id).get().catch(callbackWithTryCatch(err => {
          assert(false, { err });
        }, () => {
          resolve();
        }));
        assert.deepStrictEqual(doc.data[0].name, initialData.name);
        assert.deepStrictEqual(doc.data[0].array, initialData.array);
        assert.deepStrictEqual(doc.data[0].deepObject, initialData.deepObject);

        // Update
        result = await collection.where({
          _id: id
        }).update({
          name: 'bbb',
          array: [{ a: 1, b: 2, c: 3 }]
        }).catch(callbackWithTryCatch(err => {
          assert(false, { err });
        }, () => {
          resolve();
        }));
        assert(result.updated > 0);

        result = await collection.where({
          _id: id
        }).update({
          data: { a: null, b: null, c: null }
        }).catch(callbackWithTryCatch(err => {
          assert(false, { err });
        }, () => {
          resolve();
        }));
        assert(result.updated > 0);

        result = await collection.where({ _id: id }).get().catch(callbackWithTryCatch(err => {
          assert(false, { err });
        }, () => {
          resolve();
        }));
        assert(result.data[0]);
        assert.deepStrictEqual(result.data[0].data, { a: null, b: null, c: null });

        // 数组变为对象，mongo会报错
        result = await collection.where({
          _id: id
        }).update({
          array: { foo: 'bar' }
        }).catch(callbackWithTryCatch(err => {
          assert(false, { err });
        }, () => {
          resolve();
        }));
        assert.strictEqual(result.code, 'DATABASE_REQUEST_FAILED');

        result = await collection.where({
          _id: id
        }).get().catch(callbackWithTryCatch(err => {
          assert(false, { err });
        }, () => {
          resolve();
        }));
        assert.deepStrictEqual(result.data[0].array, [{ a: 1, b: 2, c: 3 }]);

        // Delete
        const deleteRes = await collection.doc(id).remove().catch(callbackWithTryCatch(err => {
          assert(false, { err });
        }, () => {
          resolve();
        }));
        assert.strictEqual(deleteRes.deleted, 1);
      } catch (e) {
        catchCallback(e);
      } finally {
        resolve();
      }
    });
  });

  register('Document - query', async () => {
    await new Promise(async resolve => {
      try {
        const db = app.database();
        const _ = db.command;
        const collection = db.collection(collName);

        // Query
        await Promise.all([
          collection.add({ a: 1, b: 100 }).catch(callbackWithTryCatch(err => {
            assert(false, { err });
          }, () => {
            resolve();
          })),
          collection.add({ a: 10, b: 1 }).catch(callbackWithTryCatch(err => {
            assert(false, { err });
          }, () => {
            resolve();
          }))
        ]);
        const query = _.or([{ b: _.and(_.gte(1), _.lte(10)) }, { b: _.and(_.gt(99), _.lte(101)) }]);
        await collection.where(query).get().then((res) => {
          assert(isSuccess(res) && res.data.length >= 2, { method: 'database:collection:get_query' }, res);
        }).catch(callbackWithTryCatch(err => {
          assert(false, { err });
        }, () => {
          resolve();
        }));
        // Delete
        await collection.where(query).remove().then(res => {
          assert(isSuccess(res) && res.deleted === 2, { method: 'database:collection:delete_query' }, res);
        }).catch(callbackWithTryCatch(err => {
          assert(false, { err });
        }, () => {
          resolve();
        }));
      } catch (e) {
        catchCallback(e);
      } finally {
        resolve();
      }
    });
  });
}