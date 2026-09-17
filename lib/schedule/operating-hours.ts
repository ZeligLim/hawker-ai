export type DayOfWeek = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export interface DaySchedule {
  isOpen: boolean;
  open: string;  // "HH:mm" (24h e.g. "08:00")
  close: string; // "HH:mm" (24h e.g. "22:00")
}

export type WeeklySchedule = Record<DayOfWeek, DaySchedule>;

export interface OperatingSchedule {
  enabled: boolean;
  weekly: WeeklySchedule;
  timezone?: string;
}

export const DAYS_OF_WEEK: { key: DayOfWeek; label: string }[] = [
  { key: 'mon', label: 'Monday' },
  { key: 'tue', label: 'Tuesday' },
  { key: 'wed', label: 'Wednesday' },
  { key: 'thu', label: 'Thursday' },
  { key: 'fri', label: 'Friday' },
  { key: 'sat', label: 'Saturday' },
  { key: 'sun', label: 'Sunday' },
];

export const DEFAULT_WEEKLY_SCHEDULE: WeeklySchedule = {
  mon: { isOpen: true, open: '08:00', close: '22:00' },
  tue: { isOpen: true, open: '08:00', close: '22:00' },
  wed: { isOpen: true, open: '08:00', close: '22:00' },
  thu: { isOpen: true, open: '08:00', close: '22:00' },
  fri: { isOpen: true, open: '08:00', close: '22:00' },
  sat: { isOpen: true, open: '08:00', close: '22:00' },
  sun: { isOpen: true, open: '08:00', close: '22:00' },
};

export const DEFAULT_OPERATING_SCHEDULE: OperatingSchedule = {
  enabled: false,
  weekly: DEFAULT_WEEKLY_SCHEDULE,
  timezone: 'Asia/Kuala_Lumpur',
};

/**
 * Checks whether a given "HH:mm" time falls between open and close times.
 * Supports standard daytime ranges (e.g., 08:00 - 22:00) and overnight ranges (e.g., 18:00 - 02:00).
 */
export function isTimeInSlot(openTime: string, closeTime: string, currentTime: string): boolean {
  if (!openTime || !closeTime || !currentTime) return true;

  if (openTime <= closeTime) {
    // Normal single-day interval
    return currentTime >= openTime && currentTime <= closeTime;
  }

  // Overnight interval (e.g. 18:00 to 02:00)
  return currentTime >= openTime || currentTime <= closeTime;
}

/**
 * Maps a Date's getDay() (0=Sun, 1=Mon, ..., 6=Sat) to DayOfWeek
 */
export function getDayKeyFromDate(date: Date): DayOfWeek {
  const dayIndex = date.getDay();
  switch (dayIndex) {
    case 0:
      return 'sun';
    case 1:
      return 'mon';
    case 2:
      return 'tue';
    case 3:
      return 'wed';
    case 4:
      return 'thu';
    case 5:
      return 'fri';
    case 6:
      return 'sat';
    default:
      return 'mon';
  }
}

/**
 * Formats a date into "HH:mm" in 24-hour format
 */
export function formatTimeHHMM(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Resolves whether an entity (Hawker Centre or Stall) is currently open based on
 * automated operating schedule vs manual toggle.
 */
export function isOperatingOpen(
  schedule?: OperatingSchedule | null,
  manualIsOpen?: boolean,
  now: Date = new Date()
): boolean {
  // If schedule is not configured or automated scheduling is disabled, honor manual toggle
  if (!schedule || !schedule.enabled) {
    return manualIsOpen !== false;
  }

  const dayKey = getDayKeyFromDate(now);
  const dayConfig = schedule.weekly?.[dayKey];

  if (!dayConfig || !dayConfig.isOpen) {
    return false;
  }

  const currentHHMM = formatTimeHHMM(now);
  return isTimeInSlot(dayConfig.open, dayConfig.close, currentHHMM);
}

export interface EffectiveStallStatus {
  isVisible: boolean;
  isOrderable: boolean;
  isStallOpen: boolean;
  isVenueActive: boolean;
  isStallActive: boolean;
  reason?: string;
}

/**
 * Evaluates Dual-Layer Active/Inactive vs Open/Closed Logic:
 *
 * Rule: A stall is only visible & orderable to customers if both conditions are met:
 * 1. Venue Status == Active (Master override by SaaS / Venue Owner)
 * 2. Stall Status == Active (Master override by Venue Owner)
 * 3. Stall Status == Open (Operational control by Stall Owner via manual toggle or automated schedule)
 *
 * If Venue or Stall is Inactive, stall remains offline regardless of stall owner toggle.
 */
export function resolveEffectiveStallStatus(params: {
  venueIsActive?: boolean;
  venueSchedule?: OperatingSchedule | null;
  stallIsActive?: boolean;
  stallIsOpen?: boolean;
  stallSchedule?: OperatingSchedule | null;
  now?: Date;
}): EffectiveStallStatus {
  const {
    venueIsActive = true,
    venueSchedule,
    stallIsActive = true,
    stallIsOpen = true,
    stallSchedule,
    now = new Date(),
  } = params;

  // Master Override Layer 1: Venue Active
  if (!venueIsActive) {
    return {
      isVisible: false,
      isOrderable: false,
      isStallOpen: false,
      isVenueActive: false,
      isStallActive: Boolean(stallIsActive),
      reason: 'Hawker centre is temporarily inactive.',
    };
  }

  // Master Override Layer 2: Stall Inactive (by Venue Owner)
  if (!stallIsActive) {
    return {
      isVisible: false,
      isOrderable: false,
      isStallOpen: false,
      isVenueActive: true,
      isStallActive: false,
      reason: 'Stall is currently inactive (venue override).',
    };
  }

  // Venue Schedule Layer
  const venueOpen = isOperatingOpen(venueSchedule, true, now);
  if (!venueOpen) {
    return {
      isVisible: true,
      isOrderable: false,
      isStallOpen: false,
      isVenueActive: true,
      isStallActive: true,
      reason: 'Hawker centre is currently outside operating hours.',
    };
  }

  // Stall Schedule / Manual Open Layer
  const stallOpen = isOperatingOpen(stallSchedule, stallIsOpen, now);
  if (!stallOpen) {
    return {
      isVisible: true,
      isOrderable: false,
      isStallOpen: false,
      isVenueActive: true,
      isStallActive: true,
      reason: 'Stall is currently closed.',
    };
  }

  return {
    isVisible: true,
    isOrderable: true,
    isStallOpen: true,
    isVenueActive: true,
    isStallActive: true,
  };
}
