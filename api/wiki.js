export default async function handler(req, res) {
  // Allow CORS from any origin
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { article, start, end } = req.query;

  if (!article || !start || !end) {
    return res.status(400).json({ error: 'Missing article, start, or end params' });
  }

  const url = `https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/en.wikipedia/desktop/user/${encodeURIComponent(article)}/daily/${start}/${end}`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'FluWatchUSA/1.0 (fluwatchusa.watch; research tool based on Vij 2025)',
        'Accept': 'application/json',
      }
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: `Wikimedia API error: ${response.status}` });
    }

    const data = await response.json();
    // Cache for 6 hours — data is daily so no need to hammer the API
    res.setHeader('Cache-Control', 's-maxage=21600, stale-while-revalidate');
    return res.status(200).json(data);

  } catch (err) {
    return res.status(500).json({ error: 'Proxy fetch failed', detail: err.message });
  }
}
