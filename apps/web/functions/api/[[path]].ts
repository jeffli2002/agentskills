// Proxy all /api/* requests to the API worker
export const onRequest: PagesFunction<{
  API: Fetcher;
}> = async (context) => {
  const url = new URL(context.request.url);
  const apiUrl = `https://agentskills-api.jefflee2002.workers.dev${url.pathname}${url.search}`;

  const request = new Request(apiUrl, {
    method: context.request.method,
    headers: context.request.headers,
    body: context.request.body,
    redirect: 'manual',
  });

  const response = await fetch(request);

  // Clone response to modify headers if needed
  const newResponse = new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });

  return newResponse;
};
