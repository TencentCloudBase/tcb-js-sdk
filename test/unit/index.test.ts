const tcb = require('../../dist/index');

jest.mock('../../dist/functions', () => {
  return {
    callFunction: jest.fn(function (...args) {
      return {
        this: this,
        args: args
      };
    })
  };
});

jest.mock('../../dist/storage', () => {
  return {
    uploadFile: jest.fn(function (...args) {
      return {
        this: this,
        args: args
      };
    }),
    deleteFile: jest.fn(function (...args) {
      return {
        this: this,
        args: args
      };
    }),
    getTempFileURL: jest.fn(function (...args) {
      return {
        this: this,
        args: args
      };
    }),
    downloadFile: jest.fn(function (...args) {
      return {
        this: this,
        args: args
      };
    })
  };
});

const app = tcb.init({
  env: 'env-id',
  timeout: 20000
});

test('tcb.init()', () => {
  expect(app).toHaveProperty('config');
  expect(app).toHaveProperty('authObj');
});

test('callFunction', () => {
  const result = app.callFunction(1, 2);
  expect(result.this).toEqual(app);
  expect(result.args).toEqual([1, 2]);
});

test('deleteFile', () => {
  const result = app.deleteFile(1, 2);
  expect(result.this).toEqual(app);
  expect(result.args).toEqual([1, 2]);
});

test('getTempFileURL', () => {
  const result = app.getTempFileURL(1, 2);
  expect(result.this).toEqual(app);
  expect(result.args).toEqual([1, 2]);
});

test('downloadFile', () => {
  const result = app.downloadFile(1, 2);
  expect(result.this).toEqual(app);
  expect(result.args).toEqual([1, 2]);
});

test('uploadFile', () => {
  const result = app.uploadFile(1, 2);
  expect(result.this).toEqual(app);
  expect(result.args).toEqual([1, 2]);
});