
import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-search-params', request.nextUrl.searchParams.toString());
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}
