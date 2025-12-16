export async function onRequest(context) {
  const { request, env } = context;

  // Handle CORS preflight
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders(request),
    });
  }

  // Only allow POST
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", {
      status: 405,
      headers: corsHeaders(request),
    });
  }

  if (!env.ICABBI_AUTH) {
    return new Response("Missing ICABBI_AUTH secret", {
      status: 500,
      headers: corsHeaders(request),
    });
  }

  const body = await request.text();

  // Forward to iCabbi
  const upstream = await fetch("https://api.icabbi.us/us4/bookings/add", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": env.ICABBI_AUTH,
    },
    body,
  });

  const respText = await upstream.text();

  return new Response(respText, {
    status: upstream.status,
    headers: {
      ...corsHeaders(request),
      "Content-Type": upstream.headers.get("content-type") || "text/plain",
    },
  });
}

function corsHeaders(request) {
  const origin = request.headers.get("Origin") || "";

  // Lock this to your GitHub Pages site
  const allowedOrigin = "https://haildir1212121.github.io";

  return {
    "Access-Control-Allow-Origin": origin === allowedOrigin ? origin : allowedOrigin,
    "Vary": "Origin",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
}
