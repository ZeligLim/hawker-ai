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

test('adds items to the cart and groups merchant totals correctly with RM 0.50 platform fee', () => {
  const items = addItemToCart([], dishOne);
  const nextItems = addItemToCart(items, dishTwo);

  // Default: fee_payer = CUSTOMER, platform_fee_fixed = 0.50
  const summary = buildCartSummary(nextItems);

  assert.equal(summary.items.length, 2);
  assert.equal(summary.subtotal, 13);
  assert.equal(summary.merchantGroups.length, 2);
  assert.equal(summary.serviceFee, 0.50);
  assert.equal(summary.platformFeeAmount, 0.50);
  assert.equal(summary.total, 13.50);
  assert.equal(summary.merchantPayoutAmount, 13.00);

  // Merchant-paid fee mode: fee_payer = MERCHANT
  const merchantPaidSummary = buildCartSummary(nextItems, { feePayer: 'MERCHANT' });
  assert.equal(merchantPaidSummary.total, 13.00);
  assert.equal(merchantPaidSummary.merchantPayoutAmount, 12.50);
  assert.equal(merchantPaidSummary.platformFeeAmount, 0.50);
});

test('updates cart quantities and removes zero or negative quantities', () => {
  const items = addItemToCart([], { ...dishOne, quantity: 2 });
  const updated = updateCartItemQuantity(items, items[0].id, 3);
  const cleared = updateCartItemQuantity(updated, updated[0].id, 0);

  assert.equal(updated[0].quantity, 3);
  assert.equal(cleared.length, 0);
});

test('calculates platform fee charged by percentage', () => {
  const items = addItemToCart([], { ...dishOne, price: 20 }); // RM 20 subtotal
  
  // 5% percentage charge with 0 fixed fee
  const summary5Pct = buildCartSummary(items, {
    feePayer: 'CUSTOMER',
    platformFeeFixed: 0.00,
    platformFeePercent: 0.0500, // 5%
  });

  assert.equal(summary5Pct.subtotal, 20.00);
  assert.equal(summary5Pct.serviceFee, 1.00); // 5% of 20 = 1.00
  assert.equal(summary5Pct.total, 21.00);
  assert.equal(summary5Pct.merchantPayoutAmount, 20.00);

  // 10% percentage charge paid by merchant
  const summaryMerchant10Pct = buildCartSummary(items, {
    feePayer: 'MERCHANT',
    platformFeeFixed: 0.00,
    platformFeePercent: 0.1000, // 10%
  });

  assert.equal(summaryMerchant10Pct.subtotal, 20.00);
  assert.equal(summaryMerchant10Pct.serviceFee, 2.00); // 10% of 20 = 2.00
  assert.equal(summaryMerchant10Pct.total, 20.00);
  assert.equal(summaryMerchant10Pct.merchantPayoutAmount, 18.00); // 20 - 2 = 18
});
