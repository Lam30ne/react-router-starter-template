const CO_BASE     = "https://1bvgb3.chargeover.com";
const CO_API_KEY  = "V6eLZuNTcH2nflB4F0zPSbtEKkQvW8oa";
const CO_API_PASS = "QhcYWCbAyFuoVv837JH94agzwfqkPDUe";
const AUTH_HEADER = "Basic " + btoa(CO_API_KEY + ":" + CO_API_PASS);
const ALLOWED_ORIGIN = "*";

export default {
  async fetch(request) {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(),
      });
    }

    var url = new URL(request.url);
    var targetURL = CO_BASE + url.pathname + url.search;

    var upstreamResponse = await fetch(targetURL, {
      method: request.method,
      headers: {
        "Authorization": AUTH_HEADER,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: (request.method === "POST" || request.method === "PUT" || request.method === "PATCH")
        ? await request.text()
        : undefined,
    });

    var body = await upstreamResponse.text();

    return new Response(body, {
      status: upstreamResponse.status,
      headers: Object.assign(
        { "Content-Type": "application/json" },
        corsHeaders()
      ),
    });
  },
};

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}
