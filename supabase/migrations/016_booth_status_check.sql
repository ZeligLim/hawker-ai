-- Migration 016: Allow 'closed' in food_outlets status check constraint
-- Supports both is_open boolean flag and explicit status = 'closed'

ALTER TABLE food_outlets DROP CONSTRAINT IF EXISTS food_outlets_status_check;

ALTER TABLE food_outlets
  ADD CONSTRAINT food_outlets_status_check
  CHECK (status IN ('draft', 'pending_review', 'approved', 'rejected', 'suspended', 'closed'));
