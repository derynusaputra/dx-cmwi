import { NextRequest, NextResponse } from 'next/server';

const BACKEND = process.env.BACKEND_URL || 'http://localhost:8080';

async function handler(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const backendUrl = `${BACKEND}/user/${path.join('/')}${request.nextUrl.search}`;

  const headers = new Headers();
  headers.set('Content-Type', 'application/json');

  const authHeader = request.headers.get('Authorization');
  if (authHeader) headers.set('Authorization', authHeader);

  const cookieHeader = request.headers.get('cookie');
  if (cookieHeader) headers.set('cookie', cookieHeader);

  let body: BodyInit | null = null;
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    body = await request.text();
  }

  const backendRes = await fetch(backendUrl, {
    method: request.method,
    headers,
    body,
  });

  const responseBody = await backendRes.text();

  const response = new NextResponse(responseBody, {
    status: backendRes.status,
    headers: { 'Content-Type': 'application/json' },
  });

  const setCookie = backendRes.headers.get('set-cookie');
  if (setCookie) response.headers.set('set-cookie', setCookie);

  return response;
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const DELETE = handler;
export const PATCH = handler;
