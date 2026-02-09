// Proxy all /api/* requests to the API worker
export async function onRequest(context) {
  const url = new URL(context.request.url);
  const apiUrl = `https://agentskills-api.jefflee2002.workers.dev${url.pathname}${url.search}`;

  const headers = new Headers(context.request.headers);
  headers.set('X-Forwarded-Host', url.host);
  headers.set('X-Forwarded-Proto', url.protocol.replace(':', ''));

  const request = new Request(apiUrl, {
    method: context.request.method,
    headers: headers,
    body: context.request.body,
    redirect: 'manual',
  });

  const response = await fetch(request);

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });
}
