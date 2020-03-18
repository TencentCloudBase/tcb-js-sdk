// setup.js
const fs = require('fs');

const tcbjs = fs.readFileSync('./tcbjs/e2e/tcb.js', 'utf-8');

const browser = global.__BROWSER__;

jest.setTimeout(20000); // 20 second

async function setup() {
  const page = await browser.newPage();
  global.page = page;
  await page.goto('http://127.0.0.1:8000');
  await page.addScriptTag({
    content: tcbjs
  });
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
