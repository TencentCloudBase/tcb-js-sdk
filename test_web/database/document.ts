import * as assert from 'power-assert';
import { catchCallback, register } from '../util';
import { Util } from '../../src/database/util';

export function registerDocument(app, collName) {
  const docIDGenerated = Util.generateDocId();
  const db = app.database();

  register('database document: docID test', () => {
    const document = db.collection(collName).doc(docIDGenerated);
    assert(document.id === docIDGenerated);
  });

  register('database document: API - set data in empty document', async () => {
    await new Promise(async resolve => {
      try {
        const _ = db.command;
        const document = db.collection(collName).doc();
        await document.set({
          name: 'jude'
        }).catch(catchCallback);
        const documents = await db.collection(collName).where({
          name: _.eq('jude')
        }).get().catch(catchCallback);
        assert(Array.isArray(documents.data));
      } catch (e) {
        catchCallback(e);
      } finally {
        resolve();
      }
    });
  });

  register('database document: API - set data in document existed', async () => {
    await new Promise(async resolve => {
      try {
        const documents = await db.collection(collName).limit(1).get();
        const docId = documents.data[0]._id;
        let data = await db.collection(collName).doc(docId).set({
          data: { type: 'set' }
        });
        assert(data.updated === 1);

        data = await db.collection(collName).doc(docId).set({
          data: { arr: [1, 2, 3], foo: 123 },
          array: [0, 0, 0]
        });
        assert(data.updated === 1);

        data = await db.collection(collName).doc(docId).update({
          data: { arr: db.command.push([4, 5, 6]), foo: db.command.inc(1) },
          array: db.command.pop()
        });
        console.log(data);
        assert.strictEqual(data.updated, 1);
      } catch (e) {
        catchCallback(e);
      } finally {
        resolve();
      }
    });
  });

  register('database document: API - remove document that not exist', async () => {
    await new Promise(async resolve => {
      try {
        const document = db.collection(collName).doc(docIDGenerated);
        const data = await document.remove();
        assert(!data.deleted);
      } catch (e) {
        catchCallback(e);
      } finally {
        resolve();
      }
    });
  });

  register('database document: API - remove document should success', async () => {
    await new Promise(async resolve => {
      try {
        const documents = await db.collection(collName).get();
        const docId = documents.data[0]._id;
        const data = await db.collection(collName).doc(docId).remove();
        assert.strictEqual(data.deleted, 1);
      } catch (e) {
        catchCallback(e);
      } finally {
        resolve();
      }
    });
  });
}
