const { neon } = require('@neondatabase/serverless');

const HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
};

async function getDb() {
  const sql = neon(process.env.DATABASE_URL);
  await sql`
    CREATE TABLE IF NOT EXISTS custom_props (
      id          TEXT PRIMARY KEY,
      name        TEXT NOT NULL,
      address     TEXT,
      lat         DOUBLE PRECISION NOT NULL,
      lng         DOUBLE PRECISION NOT NULL,
      added_by    TEXT,
      notes       TEXT,
      created_at  TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  return sql;
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: HEADERS, body: '' };
  }

  try {
    const sql = await getDb();

    if (event.httpMethod === 'GET') {
      const rows = await sql`SELECT * FROM custom_props ORDER BY created_at ASC`;
      return { statusCode: 200, headers: HEADERS, body: JSON.stringify(rows) };
    }

    if (event.httpMethod === 'POST') {
      const { id, name, address, lat, lng, added_by, notes } = JSON.parse(event.body);
      await sql`
        INSERT INTO custom_props (id, name, address, lat, lng, added_by, notes)
        VALUES (${id}, ${name}, ${address ?? ''}, ${lat}, ${lng}, ${added_by ?? ''}, ${notes ?? ''})
        ON CONFLICT (id) DO NOTHING
      `;
      return { statusCode: 201, headers: HEADERS, body: JSON.stringify({ ok: true }) };
    }

    if (event.httpMethod === 'DELETE') {
      const id = event.queryStringParameters?.id;
      if (!id) return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ error: 'Missing id' }) };
      await sql`DELETE FROM custom_props WHERE id = ${id}`;
      return { statusCode: 200, headers: HEADERS, body: JSON.stringify({ ok: true }) };
    }

    return { statusCode: 405, headers: HEADERS, body: JSON.stringify({ error: 'Method not allowed' }) };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, headers: HEADERS, body: JSON.stringify({ error: err.message }) };
  }
};
