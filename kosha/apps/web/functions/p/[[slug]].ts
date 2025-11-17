/**
 * Cloudflare Pages Function for dynamic /p/* routes
 * Serves the [slug].html file for all /p/* requests to enable client-side routing
 */

export async function onRequest(context: any) {
  // Serve the [slug].html file which contains the client-side React app
  // The React app will extract the actual slug from the URL and fetch the OPS data
  try {
    // Fetch the static [slug].html file from the build output
    const url = new URL(context.request.url);
    url.pathname = '/p/[slug].html';

    const response = await context.env.ASSETS.fetch(url.toString());

    // Return the HTML with status 200 to maintain the original URL
    return new Response(response.body, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('Error serving [slug].html:', error);
    // If the file doesn't exist, return 404
    return new Response('Not Found', { status: 404 });
  }
}
