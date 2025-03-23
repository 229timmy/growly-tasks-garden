-- Update health_score column to use 1-10 range
ALTER TABLE plant_measurements 
DROP CONSTRAINT IF EXISTS plant_measurements_health_score_check;

ALTER TABLE plant_measurements
ADD CONSTRAINT plant_measurements_health_score_check 
CHECK (health_score >= 1 AND health_score <= 10);

-- Update existing health scores to new scale (multiply by 2)
UPDATE plant_measurements 
SET health_score = health_score * 2 
WHERE health_score IS NOT NULL; 