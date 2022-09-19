require('mocha');
const { assert } = require('chai');

describe('Sample Test', () => {
  it('should be an object', () => {
    assert.isObject({ foo: 'bar' });
  });
});
