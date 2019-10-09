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
