-- Migration 017: Set realistic coordinates and defaults for hawker centres
UPDATE restaurants
SET lat = 3.1432, lng = 101.6985
WHERE slug = '888-restoran' AND (lat = 0 OR lat IS NULL);

UPDATE restaurants
SET lat = 3.1465, lng = 101.7015
WHERE slug = 'lim-s-foodcourt' AND (lat = 0 OR lat IS NULL);
