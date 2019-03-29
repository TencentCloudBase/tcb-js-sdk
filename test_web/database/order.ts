// database order
import * as assert from 'power-assert';
import { register } from '../util';

export function registerOrder(app) {
  const db = app.database();

  const collName = 'coll-1';
  const collection = db.collection(collName);
  // const nameList = ["f", "b", "e", "d", "a", "c"];

  register('Document - OrderBy', async () => {
    // Create

    for (let i = 0; i < 7; i++) {
      const res = await collection.add({
        category: '类别B',
        value: Math.random()
      });
      assert(res.id);
      assert(res.requestId);
    }

    for (let i = 0; i < 3; i++) {
      const res = await collection.add({
        category: '类别C',
        value: Math.random()
      });
      assert(res.id);
      assert(res.requestId);
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
  });
}
