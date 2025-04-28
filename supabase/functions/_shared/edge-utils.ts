
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

export const getAuthToken = (req: Request): string | null => {
  const authHeader = req.headers.get('Authorization');
  return authHeader ? authHeader.replace('Bearer ', '') : null;
};

export const corsHandler = (req: Request, handler: () => Promise<Response>) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  return handler().then(response => {
    // Add CORS headers to the response
    const headers = new Headers(response.headers);
    Object.entries(corsHeaders).forEach(([key, value]) => {
      headers.set(key, value);
    });
    
    return new Response(response.body, {
      status: response.status,
      headers,
    });
  });
};

export const createHandler = (handler: (req: Request, token?: string) => Promise<Response>, requireAuth: boolean = false) => {
  return async (req: Request) => {
    return corsHandler(req, async () => {
      // Handle health checks
      if (req.url.endsWith('/_health')) {
        return new Response(JSON.stringify({ status: 'ok' }), {
          headers: { 'Content-Type': 'application/json' },
        });
      }

      try {
        const token = getAuthToken(req) ?? undefined;
        
        // Check if authentication is required
        if (requireAuth && !token) {
          return new Response(JSON.stringify({ 
            error: 'Missing authorization header' 
          }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
          });
        }

        return await handler(req, token);
      } catch (error) {
        console.error('Handler error:', error);
        return new Response(JSON.stringify({ 
          error: error instanceof Error ? error.message : 'Internal server error' 
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    });
  };
};
