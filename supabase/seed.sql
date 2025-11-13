-- TrueFund Seed Data
-- This file populates the database with demo data for testing

-- Insert demo reviews
INSERT INTO reviews (user_name, user_image, review_text, rating) VALUES
  ('Sarah Johnson', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah', 'TrueFund made it so easy to help my community. The platform is transparent and trustworthy.', 5),
  ('Rajesh Kumar', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rajesh', 'I was able to raise funds for my medical treatment within days. Forever grateful to this platform and all the donors.', 5),
  ('Emily Chen', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily', 'The verification process gives me confidence that my donations are going to real causes. Excellent platform!', 5),
  ('Mohammed Ali', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mohammed', 'As an NGO, this platform has been instrumental in reaching more donors. The dashboard is very helpful.', 4),
  ('Priya Sharma', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya', 'I love how I can track exactly where my donations go. The transparency is refreshing!', 5);

-- Note: Demo campaigns and users should be created through the application
-- to properly generate unique codes and maintain proper relationships.
-- The following are example campaigns that can be created:

-- Medical Campaign Example:
-- Title: "Help Arjun Fight Cancer"
-- Description: "10-year-old Arjun needs urgent chemotherapy treatment. Your support can save his life."
-- Cause: Medical
-- Goal: 500000
-- Location: Mumbai, Maharashtra
-- Image: Use medical campaign placeholder

-- Education Campaign Example:
-- Title: "Build a Library for Rural Children"
-- Description: "Help us build a library and provide books to 200 children in rural villages."
-- Cause: Education
-- Goal: 250000
-- Location: Bihar, India
-- Image: Use education campaign placeholder

-- Disaster Relief Campaign Example:
-- Title: "Flood Relief for Kerala Families"
-- Description: "Immediate relief for families affected by recent floods. Food, shelter, and medical aid needed."
-- Cause: Disaster Relief
-- Goal: 1000000
-- Location: Kerala, India
-- Image: Use disaster relief placeholder

-- Community Campaign Example:
-- Title: "Clean Water Initiative for Villages"
-- Description: "Install water purification systems in 5 villages to provide clean drinking water."
-- Cause: Community
-- Goal: 750000
-- Location: Rajasthan, India

-- Create admin user note:
-- After signup, manually update a user to be admin:
-- UPDATE users SET is_admin = true WHERE email = 'your-admin-email@example.com';
