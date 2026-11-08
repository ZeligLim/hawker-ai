import test from 'node:test';
import assert from 'node:assert/strict';
import { getStallRoute, getStallSlug } from './stall-route.ts';

test('stall routes use a readable name slug with an ID suffix', () => {
 const stall = { id: 'fo-12345678', name: 'Ah Huat Curry Mee' };

 assert.equal(getStallSlug(stall), 'ah-huat-curry-mee-fo-12345');
 assert.equal(getStallRoute(stall), '/ah-huat-curry-mee-fo-12345/owner');
 assert.equal(getStallRoute(stall, 'orders'), '/ah-huat-curry-mee-fo-12345/owner/orders');
});
