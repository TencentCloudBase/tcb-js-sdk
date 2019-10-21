// setup.js
const fs = require('fs');
const axios = require('axios');

const tcbjs = fs.readFileSync('./tcbjs/e2e/tcb.js', 'utf-8');

const browser = global.__BROWSER__;

async function setup() {
  const page = await browser.newPage();
  global.page = page;
  await page.goto('http://127.0.0.1:8000');
  await page.addScriptTag({
    content: tcbjs
  });

  const { data: { ticket }} = await axios.get('http://service-m1w79cyz-1257776809.ap-shanghai.apigateway.myqcloud.com/release/');
  // await sleep(3600 * 1000);
  const refreshToken = await page.evaluate((ticket) => {
    app = window.tcb.init({
      env: 'starkwang-e850e3'
    });

    return app.auth({ persistence: 'local' }).signInWithTicket(ticket).then(() => {
      return window.localStorage['refresh_token_starkwang-e850e3'];
    });
  }, ticket);

  expect(refreshToken).toBeDefined();
}

beforeEach(async () => {
  await setup();
});

afterEach(async () => {
  const { page } = global;
  await page.evaluate(() => {
    localStorage.clear();
  });
  page.close();
});
