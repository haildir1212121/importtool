export async function onRequest(context) {
  const { request, env } = context;

  // CORS preflight
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders(request),
    });
  }

  if (request.method !== "POST") {
    return new Response("Method Not Allowed", {
      status: 405,
      headers: corsHeaders(request),
    });
  }

  // Read the payload your HTML sends
  const bodyText = await request.text();

  // Forward to iCabbi
  const upstream = await fetch("https://api.icabbi.us/us4/bookings/add", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // IMPORTANT: set this as a Pages secret called ICABBI_AUTH
      "Authorization": env.ICABBI_AUTH,
    },
    body: bodyText,
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
  const origin = request.headers.get("Origin") || "*";
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
}
