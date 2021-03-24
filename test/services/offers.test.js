const assert = require('assert');
const app = require('../../src/app');

describe('\'offers\' service', () => {
  it('registered the service', () => {
    const service = app.service('offers');

    assert.ok(service, 'Registered the service');
  });
});
