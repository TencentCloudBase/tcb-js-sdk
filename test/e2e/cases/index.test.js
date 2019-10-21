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
