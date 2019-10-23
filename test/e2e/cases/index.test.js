/* eslint-disable max-nested-callbacks */

describe('数据库', () => {
  it('DB查询', async () => {
    const page = global.page;
    const result = await page.evaluate(() => {
      const db = app.database();
      return db.collection('test').where({
        text: /.*/
      }).get();
    });

    expect(result.data.length > 0).toBeTruthy();
  });

  it('插入Point', async () => {
    const page = global.page;
    let result = await page.evaluate(() => {
      const db = app.database();
      return db.collection('test').add({
        point: new db.Geo.Point(-180, -1)
      });
    });

    const { id } = result;
    expect(id).toBeDefined();

    result = await page.evaluate(() => {
      const db = app.database();
      return db.collection('test').where({
        point: new db.Geo.Point(-180, -1)
      }).get();
    });

    expect(result.data.length > 0).toBeTruthy();

    result = await page.evaluate((id) => {
      const db = app.database();
      return db.collection('test').where({
        _id: id
      }).remove();
    }, id);

    expect(result.deleted).toEqual(1);
  });
});

describe('鉴权', () => {
  it('自定义登录后应该有access token', async () => {
    const result = await page.evaluate(() => {
      return localStorage.getItem('access_token_starkwang-e850e3');
    });

    expect(result).toBeDefined();
  });
  it('getLoginState', async () => {
    const page = global.page;
    let result = await page.evaluate(() => {
      return app.auth().getLoginState();
    });

    expect(typeof result.credential.refreshToken === 'string').toBeTruthy();
    expect(typeof result.credential.accessToken === 'string').toBeTruthy();

    result = await page.evaluate(() => {
      return app.auth().signOut().then(() => {
        return app.auth().getLoginState();
      });
    });

    expect(result).toBeUndefined();
  });
});
