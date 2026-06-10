-- Enable RLS on microservices table if not already enabled
ALTER TABLE microservices ENABLE ROW LEVEL SECURITY;

-- Policy to allow strictly read-only access to everyone (or at least authenticated users)
-- Since these are pricing options, they typically need to be visible.
CREATE POLICY "Allow public read access to microservices"
ON microservices FOR SELECT
USING (true);

-- Grant select permission to anon and authenticated roles just in case
GRANT SELECT ON microservices TO anon, authenticated;
