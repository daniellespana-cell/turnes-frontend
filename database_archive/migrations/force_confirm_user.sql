
-- Force Confirm Specific User
UPDATE auth.users 
SET email_confirmed_at = now() 
WHERE email = 'danielgoleman@gmail.com';
