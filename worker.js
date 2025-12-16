export default {
  async fetch(request, env) {
    // CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(request)
      });
    }

    const url = new URL(request.url);

    if (url.pathname === "/api/bookings/add" && request.method === "POST") {
      const payload = await request.text();

      const resp = await fetch("https://api.icabbi.us/us4/bookings/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Store this in Worker secret, NOT in code
          "Authorization": env.ICABBI_AUTH
        },
        body: payload
      });

      const body = await resp.text();
      return new Response(body, {
        status: resp.status,
        headers: {
          ...corsHeaders(request),
          "Content-Type": resp.headers.get("content-type") || "text/plain"
        }
      });
    }

    return new Response("Not found", { status: 404, headers: corsHeaders(request) });
  }
};

function corsHeaders(request) {
  const origin = request.headers.get("Origin") || "*";
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400"
  };
}
