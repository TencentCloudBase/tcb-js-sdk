// database order
import * as assert from 'power-assert';
import { catchCallback, register, isSuccess } from '../util';

export function registerOrder(app, collName) {
  const db = app.database();
  const collection = db.collection(collName);
  // const nameList = ["f", "b", "e", "d", "a", "c"];

  register('database order: Document - OrderBy', async () => {
    await new Promise(async resolve => {
      try {
        // Create
        for (let i = 0; i < 7; i++) {
          const res = await collection.add({
            category: '类别B',
            value: Math.random()
          });
          assert(isSuccess(res) && res.id);
          assert(isSuccess(res) && res.requestId);
        }

        for (let i = 0; i < 3; i++) {
          const res = await collection.add({
            category: '类别C',
            value: Math.random()
          });
          assert(isSuccess(res) && res.id);
          assert(isSuccess(res) && res.requestId);
        }

        await collection.add({
          category: '类别A',
          value: Math.random()
        });

        // Read
        let result = await collection
          .where({
            category: /^类别/i
          })
          .orderBy('category', 'asc')
          .get();
        assert(result.data.length >= 11);
        assert(result.data[0].category === '类别A');
        assert(result.data[result.data.length - 1].category === '类别C');

        // Delete
        const deleteRes = await collection
          .where({
            category: db.RegExp({
              regexp: '^类别'
            })
          })
          .remove();
        console.log(deleteRes);
        assert(deleteRes.deleted >= 11);
      } catch (e) {
        catchCallback(e);
      } finally {
        resolve();
      }
    });
  });
}
