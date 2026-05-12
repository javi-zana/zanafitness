-- Only one head coach (Javi). Demote Bea to a regular coach.
UPDATE profiles SET role = 'coach' WHERE email = 'bea.ongg@gmail.com';
