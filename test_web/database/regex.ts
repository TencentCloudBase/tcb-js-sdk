// database regex
import * as assert from 'power-assert';
import { catchCallback, register, isSuccess } from '../util';

export function registerRegex(app, collName) {
  const db = app.database();
  const collection = db.collection(collName);
  // const nameList = ["f", "b", "e", "d", "a", "c"];

  const initialData = {
    name: 'AbCdEfxxxxxxxxxxxxxx1234结尾',
    array: [1, 2, 3, [4, 5, 6], { a: 1, b: { c: 'fjasklfljkas', d: false }}],
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
  register('database regex: Document - CRUD', async () => {
    await new Promise(async resolve => {
      try {
        // Create
        const res = await collection.add(initialData);
        console.log(res);
        assert(isSuccess(res) && res.id);
        assert(isSuccess(res) && res.requestId);

        // Read

        // // 直接使用正则表达式
        let result = await collection
          .where({
            name: /^abcdef.*\d+结尾$/i
          })
          .get();
        // console.log(result);
        assert(result.data.length > 0);

        // new db.RegExp
        result = await collection
          .where({
            name: new db.RegExp({
              regexp: '^abcdef.*\\d+结尾$',
              options: 'i'
            })
          })
          .get();
        console.log(result);
        assert(result.data.length > 0);

        // db.RegExp
        result = await collection
          .where({
            name: db.RegExp({
              regexp: '^abcdef.*\\d+结尾$',
              options: 'i'
            })
          })
          .get();
        console.log(result);
        assert(result.data.length > 0);

        // // Update(TODO)
        result = await collection
          .where({
            name: db.command.or(new db.RegExp({
              regexp: '^abcdef.*\\d+结尾$',
              options: 'i'
            }), db.RegExp({
              regexp: '^fffffff$',
              options: 'i'
            }))
          })
          .get();
        console.log(result);
        assert(result.data.length > 0);

        // Update(TODO)
        result = await collection
          .where({
            name: db.command.or(db.RegExp({
              regexp: '^abcdef.*\\d+结尾$',
              options: 'i'
            }), db.RegExp({
              regexp: '^fffffff$',
              options: 'i'
            }))
          })
          .update({
            name: 'ABCDEFxxxx5678结尾'
          });
        console.log(result);
        assert(result.updated > 0);

        // Delete
        const deleteRes = await collection
          .where({
            name: db.RegExp({
              regexp: '^abcdef.*\\d+结尾$',
              options: 'i'
            })
          })
          .remove();
        console.log(deleteRes);
        assert(deleteRes.deleted > 0);
      } catch (e) {
        catchCallback(e);
      } finally {
        resolve();
      }
    });
  });
}
