import * as assert from 'power-assert';
import { register } from '../index';
import * as util from 'util';

export function registerDate(app) {
  const db = app.database();
  const collName = 'coll-1';
  const collection = db.collection(collName);
  // const nameList = ["f", "b", "e", "d", "a", "c"];

  const date = new Date();
  const offset = 60 * 1000;
  const timestamp = Math.floor(Number(new Date()) / 1000);
  const initialData = {
    name: 'test',
    date,
    serverDate1: new db.serverDate(),
    serverDate2: db.serverDate({ offset }),
    timestamp: {
      $timestamp: timestamp
    },
    foo: {
      bar: db.serverDate({ offset })
    }
  };
  register('Document - CRUD', async () => {
    // Create
    const res = await collection.add(initialData);
    console.log(res);
    assert(res.id);
    assert(res.requestId);

    // Read
    const { id } = res;
    let result = await collection.where({
      _id: id
    }).get();
    console.log(result.data[0]);
    assert.strictEqual(result.data[0].date.getTime(), date.getTime());
    assert(util.isDate(result.data[0].foo.bar));
    assert.strictEqual(assert.strictEqual(result.data[0].serverDate1.getDate(), date.getDate()));
    assert.strictEqual(result.data[0].serverDate1.getTime() + offset, result.data[0].serverDate2.getTime());
    assert.strictEqual(result.data[0].timestamp.getTime(), timestamp * 1000);

    result = await collection.where({
      date: db.command.eq(date)
    }).get();
    console.log(result);
    assert.strictEqual(result.data[0].date.getTime(), date.getTime());

    result = await collection.where({
      date: db.command.lte(date)
    }).get();
    console.log(result);
    assert(result.data.length > 0);

    result = await collection.where({
      date: db.command.lte(date).and(db.command.gte(date))
    }).get();
    console.log(result);
    assert(result.data.length > 0);

    // Update
    const newDate = new Date();
    const newServerDate = new db.serverDate({ offset: 1000 * 60 * 60 }); // offset一小时
    result = await collection.where({
      date: db.command.lte(date).and(db.command.gte(date))
    }).update({
      date: newDate,
      serverDate2: newServerDate
    });
    console.log(result);
    assert.strictEqual(result.updated, 1);
    result = await collection.where({
      _id: id
    }).get();
    console.log(result);
    assert.strictEqual(result.data[0].date.getTime(), newDate.getTime());
    assert(result.data[0].serverDate2.getTime() - result.data[0].serverDate1.getTime() > 1000 * 60 * 60);


    // Delete
    const deleteRes = await collection.doc(id).remove();
    assert.strictEqual(deleteRes.deleted, 1);
  });
}