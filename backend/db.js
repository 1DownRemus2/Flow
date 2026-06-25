const { Pool, types } = require('pg');

// Tell pg to return DATE columns as plain strings (e.g. "2026-06-01")
// instead of JS Date objects, which get shifted by timezone conversion.
types.setTypeParser(1082, (val) => val);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

module.exports = pool;
