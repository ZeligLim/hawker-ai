import test from 'node:test';
import assert from 'node:assert/strict';

import { addItemToCart, buildCartSummary, updateCartItemQuantity } from './cart.ts';

const dishOne = {
  dishId: 'dish-1',
  name: 'Chicken Rice',
  restaurantName: 'Setia Hawker Centre',
  stallName: 'Ah Seng Chicken Rice',
  stallId: 'stall-1',
  price: 8,
};

const dishTwo = {
  dishId: 'dish-2',
  name: 'Cendol',
  restaurantName: 'Setia Hawker Centre',
  stallName: 'Dessert House',
  stallId: 'stall-2',
  price: 5,
};

test('adds items to the cart and groups merchant totals correctly', () => {
  const items = addItemToCart([], dishOne);
  const nextItems = addItemToCart(items, dishTwo);

  const summary = buildCartSummary(nextItems);

  assert.equal(summary.items.length, 2);
  assert.equal(summary.subtotal, 13);
  assert.equal(summary.merchantGroups.length, 2);
  assert.equal(summary.total, 13.65);
});

test('updates cart quantities and removes zero or negative quantities', () => {
  const items = addItemToCart([], { ...dishOne, quantity: 2 });
  const updated = updateCartItemQuantity(items, items[0].id, 3);
  const cleared = updateCartItemQuantity(updated, updated[0].id, 0);

  assert.equal(updated[0].quantity, 3);
  assert.equal(cleared.length, 0);
});
