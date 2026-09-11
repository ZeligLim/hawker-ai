import test from 'node:test';
import assert from 'node:assert/strict';
import { RESERVED_CENTRE_SLUGS } from './service.ts';

test('RESERVED_CENTRE_SLUGS contains customer app routes and core static routes', () => {
  assert.equal(RESERVED_CENTRE_SLUGS.has('home'), true);
  assert.equal(RESERVED_CENTRE_SLUGS.has('menu'), true);
  assert.equal(RESERVED_CENTRE_SLUGS.has('orders'), true);
  assert.equal(RESERVED_CENTRE_SLUGS.has('profile'), true);
  assert.equal(RESERVED_CENTRE_SLUGS.has('api'), true);
  assert.equal(RESERVED_CENTRE_SLUGS.has('shop-owner'), true);
  assert.equal(RESERVED_CENTRE_SLUGS.has('stall'), true);
  assert.equal(RESERVED_CENTRE_SLUGS.has('888-restoran'), false);
  assert.equal(RESERVED_CENTRE_SLUGS.has('lim-s-foodcourt'), false);
});
