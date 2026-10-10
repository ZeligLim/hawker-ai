import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isTimeInSlot,
  isOperatingOpen,
  resolveEffectiveStallStatus,
  DEFAULT_WEEKLY_SCHEDULE,
  type OperatingSchedule,
} from './operating-hours.ts';

test('isTimeInSlot evaluates standard same-day time slots correctly', () => {
  assert.equal(isTimeInSlot('08:00', '22:00', '08:00'), true);
  assert.equal(isTimeInSlot('08:00', '22:00', '12:30'), true);
  assert.equal(isTimeInSlot('08:00', '22:00', '22:00'), true);
  assert.equal(isTimeInSlot('08:00', '22:00', '07:59'), false);
  assert.equal(isTimeInSlot('08:00', '22:00', '22:01'), false);
});

test('isTimeInSlot handles overnight slots across midnight', () => {
  // e.g. Night market open from 18:00 to 02:00
  assert.equal(isTimeInSlot('18:00', '02:00', '19:00'), true);
  assert.equal(isTimeInSlot('18:00', '02:00', '23:59'), true);
  assert.equal(isTimeInSlot('18:00', '02:00', '01:30'), true);
  assert.equal(isTimeInSlot('18:00', '02:00', '03:00'), false);
  assert.equal(isTimeInSlot('18:00', '02:00', '15:00'), false);
});

test('isOperatingOpen falls back to manualIsOpen when automated schedule is disabled', () => {
  const schedule: OperatingSchedule = {
    enabled: false,
    weekly: DEFAULT_WEEKLY_SCHEDULE,
  };

  assert.equal(isOperatingOpen(schedule, true), true);
  assert.equal(isOperatingOpen(schedule, false), false);
  assert.equal(isOperatingOpen(null, true), true);
  assert.equal(isOperatingOpen(undefined, false), false);
});

test('isOperatingOpen resolves automated schedule based on system time', () => {
  // Monday at 14:00 (inside 08:00 - 22:00)
  const monday2pm = new Date('2026-09-21T14:00:00'); // Sept 21 2026 is Monday
  // Monday at 23:30 (outside 08:00 - 22:00)
  const mondayLate = new Date('2026-09-21T23:30:00');

  const schedule: OperatingSchedule = {
    enabled: true,
    weekly: {
      ...DEFAULT_WEEKLY_SCHEDULE,
      mon: { isOpen: true, open: '08:00', close: '22:00' },
    },
  };

  assert.equal(isOperatingOpen(schedule, false, monday2pm), true); // schedule overrides manual false
  assert.equal(isOperatingOpen(schedule, true, mondayLate), false); // schedule overrides manual true
});

test('isOperatingOpen respects day marked as closed in schedule', () => {
  const monday2pm = new Date('2026-09-21T14:00:00');

  const schedule: OperatingSchedule = {
    enabled: true,
    weekly: {
      ...DEFAULT_WEEKLY_SCHEDULE,
      mon: { isOpen: false, open: '08:00', close: '22:00' },
    },
  };

  assert.equal(isOperatingOpen(schedule, true, monday2pm), false);
});

test('resolveEffectiveStallStatus enforces dual-layer master override rules', () => {
  const openDate = new Date('2026-09-21T14:00:00');

  // Case 1: All Active & Open -> Visible & Orderable
  const okResult = resolveEffectiveStallStatus({
    venueIsActive: true,
    stallIsActive: true,
    stallIsOpen: true,
    now: openDate,
  });
  assert.equal(okResult.isVisible, true);
  assert.equal(okResult.isOrderable, true);

  // Case 2: Venue is Inactive -> Master override, Stall is not visible / orderable
  const venueInactiveResult = resolveEffectiveStallStatus({
    venueIsActive: false,
    stallIsActive: true,
    stallIsOpen: true,
    now: openDate,
  });
  assert.equal(venueInactiveResult.isVisible, false);
  assert.equal(venueInactiveResult.isOrderable, false);

  // Case 3: Venue Owner sets Stall to Inactive -> Master override, Stall offline regardless of stall owner toggle
  const stallInactiveResult = resolveEffectiveStallStatus({
    venueIsActive: true,
    stallIsActive: false,
    stallIsOpen: true, // stall owner attempted to open
    now: openDate,
  });
  assert.equal(stallInactiveResult.isVisible, false);
  assert.equal(stallInactiveResult.isOrderable, false);
  assert.match(stallInactiveResult.reason || '', /inactive/i);

  // Case 4: Stall is Active, but Stall Owner toggles Closed
  const stallClosedResult = resolveEffectiveStallStatus({
    venueIsActive: true,
    stallIsActive: true,
    stallIsOpen: false,
    now: openDate,
  });
  assert.equal(stallClosedResult.isVisible, true);
  assert.equal(stallClosedResult.isOrderable, false);
  assert.equal(stallClosedResult.isStallOpen, false);
});
