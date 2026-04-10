const { neon } = require('@neondatabase/serverless');

const HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// ── Default workspace seed data ───────────────────────────────────────────────
const DEFAULT_WORKSPACE = { id: 'a0000000-0000-0000-0000-000000000001', name: 'Bentonville 2026', slug: 'bentonville-2026', edit_token: 'rentmap2026' };

const DEFAULT_LANDMARKS = [
  { id:'mosque',  name:'Masjid',             address:'1801 SW 2nd St, Bentonville, AR',   lat:36.371887, lng:-94.234221, icon:'🕌', color:'#7c3aed' },
  { id:'work',    name:'DGTC (My Office)',    address:'805 Moberly Ln, Bentonville, AR',   lat:36.363539, lng:-94.183247, icon:'💼', color:'#2563eb' },
  { id:'walmart', name:'Walmart Home Office', address:'1600 SE 8th St, Bentonville, AR',   lat:36.363170, lng:-94.191317, icon:'🛒', color:'#0071ce' },
];

// Casuarina base: lat=36.3462927 lng=-94.2300324 at house 1406 (Nominatim confirmed)
// Poigai base:    lat=36.3455134 lng=-94.2300797 at house 1405 (Nominatim confirmed)
// lng rate: +0.0000130 per house number going east
// Unit offsets: north unit +0.000060 lat, south unit -0.000060 lat
const DEFAULT_PROPERTIES = [
  // ── SW Casuarina Dr ──────────────────────────────────────────────────────────
  { id:'1406-cas-bldg', name:'1406 SW Casuarina Dr', sub_label:'Building overview',
    lat:36.3462927, lng:-94.2300324,
    price:null,   price_str:'$1,625–$1,695', beds:3, baths:2.5, sqft:1400,
    move_in:'See units', status:'available', duplex_key:null, manager:'Prestige NWA',
    sources:'Zillow (building)', notes:'4-unit building page',
    url:'https://www.zillow.com/b/1406-sw-casuarina-dr-bentonville-ar-CdcVVs/' },

  { id:'1406-cas-1', name:'1406 SW Casuarina Dr #1', sub_label:'Unit 1',
    lat:36.3463527, lng:-94.2300324,                              // +0.000060 north
    price:1650,  price_str:'$1,650', beds:3, baths:2.5, sqft:1400,
    move_in:'May 9, 2026', status:'available', duplex_key:null, manager:'Prestige NWA',
    sources:'Zillow + Prestige', notes:'$1,650 deposit. $40 app fee.',
    url:'https://prestigenwa.managebuilding.com/Resident/public/rentals/82654' },

  { id:'1500-cas-2', name:'1500 SW Casuarina Dr #2', sub_label:'Unit 2',
    lat:36.3462327, lng:-94.2288104,                              // -0.000060 south
    price:1695,  price_str:'$1,695', beds:3, baths:2.5, sqft:1400,
    move_in:'Apr 11, 2026', status:'available', duplex_key:null, manager:'Prestige NWA',
    sources:'Zillow + Prestige', notes:'2024 build. Pet-friendly.',
    url:'https://prestigenwa.managebuilding.com/Resident/public/rentals/82710' },

  { id:'1602-cas-1', name:'1602 SW Casuarina Dr #1', sub_label:'Unit 1',
    lat:36.3463527, lng:-94.2274844,
    price:1625,  price_str:'$1,625', beds:3, baths:2.5, sqft:1400,
    move_in:'Mar 7, 2026', status:'check', duplex_key:'1602-cas', manager:'Prestige NWA',
    sources:'Zillow + Prestige', notes:'Avail date passed – verify.',
    url:'https://prestigenwa.managebuilding.com/Resident/public/rentals/80909' },

  { id:'1602-cas-2', name:'1602 SW Casuarina Dr #2', sub_label:'Unit 2',
    lat:36.3462327, lng:-94.2274844,
    price:1625,  price_str:'$1,625', beds:3, baths:2.5, sqft:1400,
    move_in:'Apr 11, 2026', status:'available', duplex_key:'1602-cas', manager:'Prestige NWA',
    sources:'Zillow + Prestige', notes:'Pet-friendly.',
    url:'https://prestigenwa.managebuilding.com/Resident/public/rentals/80908' },

  { id:'1704-cas-1', name:'1704 SW Casuarina Dr #1', sub_label:'Unit 1 · 1st mo FREE',
    lat:36.3463527, lng:-94.2261584,
    price:1650,  price_str:'$1,650', beds:3, baths:2.5, sqft:1400,
    move_in:'Apr 2, 2026', status:'check', duplex_key:'1704-cas', manager:'Prestige NWA',
    sources:'Zillow + Prestige', notes:'1st month free. Estimated date – verify.',
    url:'https://prestigenwa.managebuilding.com/Resident/public/rentals/92961' },

  { id:'1704-cas-2', name:'1704 SW Casuarina Dr #2', sub_label:'Unit 2 · 1st mo FREE',
    lat:36.3462327, lng:-94.2261584,
    price:1650,  price_str:'$1,650', beds:3, baths:2.5, sqft:1400,
    move_in:'Apr 2, 2026', status:'check', duplex_key:'1704-cas', manager:'Prestige NWA',
    sources:'Zillow + Prestige', notes:'1st month free. Estimated date – verify.',
    url:'https://prestigenwa.managebuilding.com/Resident/public/rentals/92962' },

  { id:'1800-cas-2', name:'1800 SW Casuarina Dr #2', sub_label:'Unit 2',
    lat:36.3462327, lng:-94.2249104,
    price:1650,  price_str:'$1,650', beds:3, baths:2.5, sqft:1400,
    move_in:'Feb 3, 2026', status:'available', duplex_key:null, manager:'Prestige NWA',
    sources:'Zillow only', notes:'63+ days on market.',
    url:'https://www.zillow.com/homedetails/1800-SW-Casuarina-Dr-2-Bentonville-AR-72712/460229143_zpid/' },

  // ── SW Poigai Way ─────────────────────────────────────────────────────────────
  { id:'1405-poi-1', name:'1405 SW Poigai Way #1', sub_label:'Unit 1 · RE/MAX',
    lat:36.3455734, lng:-94.2300797,
    price:1650,  price_str:'$1,650', beds:3, baths:3.0, sqft:1400,
    move_in:'Available now', status:'available', duplex_key:null, manager:'RE/MAX Real Estate Results',
    sources:'Zillow only', notes:'3 full baths. No pets.',
    url:'https://www.zillow.com/homedetails/1405-SW-Poigai-Way-1-Bentonville-AR-72712/446728738_zpid/' },

  { id:'1509-poi-1', name:'1509 SW Poigai Way #1', sub_label:'Unit 1',
    lat:36.3455734, lng:-94.2287277,
    price:1695,  price_str:'$1,695', beds:3, baths:2.5, sqft:1400,
    move_in:'Feb 7, 2026', status:'check', duplex_key:null, manager:'Prestige NWA',
    sources:'Zillow + Prestige', notes:'Avail date passed – verify.',
    url:'https://prestigenwa.managebuilding.com/Resident/public/rentals/86651' },

  // 1601 (odd=north side), 1602 (even=south side), 1606 (even=south side, further east)
  // Spread them 0.0002 degrees apart so they don't completely stack on the map
  { id:'1601-poi-1', name:'1601 SW Poigai Way #1', sub_label:'Unit 1',
    lat:36.3455734, lng:-94.2277517,                              // north side
    price:1650,  price_str:'$1,650', beds:3, baths:2.5, sqft:1400,
    move_in:'May 9, 2026', status:'available', duplex_key:null, manager:'Prestige NWA',
    sources:'Zillow + Prestige', notes:'$1,650 deposit.',
    url:'https://prestigenwa.managebuilding.com/Resident/public/rentals/85746' },

  { id:'1602-poi-1', name:'1602 SW Poigai Way #1', sub_label:'Unit 1',
    lat:36.3454534, lng:-94.2277387,                              // south side
    price:1625,  price_str:'$1,625', beds:3, baths:2.5, sqft:1400,
    move_in:'Mar 7, 2026', status:'check', duplex_key:null, manager:'Prestige NWA',
    sources:'Zillow + Prestige', notes:'Avail date passed – verify.',
    url:'https://prestigenwa.managebuilding.com/Resident/public/rentals/86697' },

  { id:'1606-poi-1', name:'1606 SW Poigai Way #1', sub_label:'Unit 1',
    lat:36.3454534, lng:-94.2274667,                              // south side, east of 1602
    price:1695,  price_str:'$1,695', beds:3, baths:2.5, sqft:1400,
    move_in:'Apr 11, 2026', status:'available', duplex_key:null, manager:'Prestige NWA',
    sources:'Zillow + Prestige', notes:'Pet-friendly.',
    url:'https://prestigenwa.managebuilding.com/Resident/public/rentals/86984' },

  { id:'1702-poi-1', name:'1702 SW Poigai Way #1', sub_label:'Unit 1 · 1st mo FREE',
    lat:36.3455734, lng:-94.2262187,
    price:1650,  price_str:'$1,650', beds:3, baths:2.5, sqft:1400,
    move_in:'Mar 20, 2026', status:'check', duplex_key:'1702-poi', manager:'Prestige NWA',
    sources:'Zillow + Prestige', notes:'1st month free. Avail date passed – verify.',
    url:'https://prestigenwa.managebuilding.com/Resident/public/rentals/93128' },

  { id:'1702-poi-2', name:'1702 SW Poigai Way #2', sub_label:'Unit 2',
    lat:36.3454534, lng:-94.2262187,
    price:1650,  price_str:'$1,650', beds:3, baths:2.5, sqft:1400,
    move_in:'Feb 4, 2026', status:'available', duplex_key:'1702-poi', manager:'Prestige NWA',
    sources:'Zillow only', notes:'62+ days on market. Also on RE/MAX.',
    url:'https://www.zillow.com/homedetails/1702-SW-Poigai-Way-2-Bentonville-AR-72713/460229149_zpid/' },

  // ── Buckeye Crossing ─────────────────────────────────────────────────────────
  { id:'buckeye', name:'Buckeye Crossing Townhomes', sub_label:'152-unit complex · 2019 build',
    lat:36.334671, lng:-94.243179,
    price:1449,  price_str:'$1,449+', beds:3, baths:2.5, sqft:1400,
    move_in:'Contact for availability', status:'available', duplex_key:null, manager:'Buckeye Crossing',
    sources:'buckeyecrossing.com', notes:'152 units. 2–3 bd, 1,277–1,440 sqft. (479) 360-8625',
    url:'https://www.buckeyecrossing.com/' },
];

// ── DB init + seed ────────────────────────────────────────────────────────────
async function initDb(sql) {
  await sql`
    CREATE TABLE IF NOT EXISTS workspaces (
      id          TEXT        PRIMARY KEY,
      name        TEXT        NOT NULL,
      slug        TEXT        UNIQUE NOT NULL,
      edit_token  TEXT        NOT NULL,
      created_at  TIMESTAMPTZ DEFAULT NOW()
    )`;

  await sql`
    CREATE TABLE IF NOT EXISTS landmarks (
      id            TEXT        PRIMARY KEY,
      workspace_id  TEXT        REFERENCES workspaces(id) ON DELETE CASCADE,
      name          TEXT        NOT NULL,
      address       TEXT,
      lat           DOUBLE PRECISION NOT NULL,
      lng           DOUBLE PRECISION NOT NULL,
      icon          TEXT        DEFAULT '📍',
      color         TEXT        DEFAULT '#2563eb',
      created_at    TIMESTAMPTZ DEFAULT NOW()
    )`;

  await sql`
    CREATE TABLE IF NOT EXISTS properties (
      id            TEXT        PRIMARY KEY,
      workspace_id  TEXT        REFERENCES workspaces(id) ON DELETE CASCADE,
      name          TEXT        NOT NULL,
      sub_label     TEXT,
      lat           DOUBLE PRECISION NOT NULL,
      lng           DOUBLE PRECISION NOT NULL,
      price         INTEGER,
      price_str     TEXT,
      beds          NUMERIC(3,1),
      baths         NUMERIC(3,1),
      sqft          INTEGER,
      move_in       TEXT,
      status        TEXT        DEFAULT 'available',
      duplex_key    TEXT,
      manager       TEXT,
      sources       TEXT,
      notes         TEXT,
      url           TEXT,
      added_by      TEXT,
      is_custom     BOOLEAN     DEFAULT false,
      created_at    TIMESTAMPTZ DEFAULT NOW()
    )`;

  // Seed default workspace + data if it doesn't exist
  const ws = await sql`SELECT id FROM workspaces WHERE slug = ${DEFAULT_WORKSPACE.slug}`;
  if (ws.length === 0) {
    await sql`INSERT INTO workspaces (id, name, slug, edit_token) VALUES (${DEFAULT_WORKSPACE.id}, ${DEFAULT_WORKSPACE.name}, ${DEFAULT_WORKSPACE.slug}, ${DEFAULT_WORKSPACE.edit_token})`;

    for (const lm of DEFAULT_LANDMARKS) {
      await sql`INSERT INTO landmarks (id, workspace_id, name, address, lat, lng, icon, color)
                VALUES (${lm.id}, ${DEFAULT_WORKSPACE.id}, ${lm.name}, ${lm.address}, ${lm.lat}, ${lm.lng}, ${lm.icon}, ${lm.color})`;
    }

    for (const p of DEFAULT_PROPERTIES) {
      await sql`INSERT INTO properties (id, workspace_id, name, sub_label, lat, lng, price, price_str, beds, baths, sqft, move_in, status, duplex_key, manager, sources, notes, url, is_custom)
                VALUES (${p.id}, ${DEFAULT_WORKSPACE.id}, ${p.name}, ${p.sub_label ?? ''}, ${p.lat}, ${p.lng}, ${p.price ?? null}, ${p.price_str}, ${p.beds}, ${p.baths}, ${p.sqft}, ${p.move_in}, ${p.status}, ${p.duplex_key ?? null}, ${p.manager}, ${p.sources}, ${p.notes}, ${p.url}, false)`;
    }
  }
}

// ── Handler ───────────────────────────────────────────────────────────────────
exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: HEADERS, body: '' };
  }

  try {
    const sql = neon(process.env.DATABASE_URL);
    await initDb(sql);

    const slug = event.queryStringParameters?.workspace || DEFAULT_WORKSPACE.slug;

    if (event.httpMethod === 'GET') {
      const [wsRows, properties, landmarks] = await Promise.all([
        sql`SELECT id, name, slug FROM workspaces WHERE slug = ${slug}`,
        sql`SELECT p.* FROM properties p JOIN workspaces w ON p.workspace_id = w.id WHERE w.slug = ${slug} ORDER BY p.is_custom ASC, p.created_at ASC`,
        sql`SELECT l.* FROM landmarks l JOIN workspaces w ON l.workspace_id = w.id WHERE w.slug = ${slug} ORDER BY l.created_at ASC`,
      ]);

      return {
        statusCode: 200,
        headers: HEADERS,
        body: JSON.stringify({
          workspace: wsRows[0] || null,
          properties,
          landmarks,
        }),
      };
    }

    if (event.httpMethod === 'POST') {
      const { id, name, address, lat, lng, added_by, notes, url } = JSON.parse(event.body);
      const wsRows = await sql`SELECT id FROM workspaces WHERE slug = ${slug}`;
      const wsId = wsRows[0]?.id;
      if (!wsId) return { statusCode: 404, headers: HEADERS, body: JSON.stringify({ error: 'Workspace not found' }) };

      await sql`
        INSERT INTO properties
          (id, workspace_id, name, sub_label, lat, lng, price_str, beds, baths, sqft, move_in, status, added_by, notes, url, is_custom)
        VALUES
          (${id}, ${wsId}, ${name}, ${address ?? ''}, ${lat}, ${lng}, '—', null, null, null, '—', 'available', ${added_by ?? null}, ${notes ?? null}, ${url ?? null}, true)
        ON CONFLICT (id) DO NOTHING
      `;
      return { statusCode: 201, headers: HEADERS, body: JSON.stringify({ ok: true }) };
    }

    if (event.httpMethod === 'DELETE') {
      const id = event.queryStringParameters?.id;
      if (!id) return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ error: 'Missing id' }) };
      await sql`DELETE FROM properties WHERE id = ${id} AND is_custom = true`;
      return { statusCode: 200, headers: HEADERS, body: JSON.stringify({ ok: true }) };
    }

    return { statusCode: 405, headers: HEADERS, body: JSON.stringify({ error: 'Method not allowed' }) };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, headers: HEADERS, body: JSON.stringify({ error: err.message }) };
  }
};
