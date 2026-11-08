import test from 'node:test';
import assert from 'node:assert/strict';
import { buildTableMenuUrl } from './customer-table-link.ts';

test('buildTableMenuUrl creates a centre-scoped menu link carrying the table ID', () => {
 assert.equal(
 buildTableMenuUrl('http://localhost:3000', '888-restoran', '8d33c948-ba43-4ee3-984a-2acef1af8248'),
 'http://localhost:3000/888-restoran/menu?table_id=8d33c948-ba43-4ee3-984a-2acef1af8248',
 );
});
