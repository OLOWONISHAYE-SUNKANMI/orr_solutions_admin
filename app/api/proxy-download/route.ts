import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const url = searchParams.get('url');

    if (!url) {
        return new NextResponse('Missing url parameter', { status: 400 });
    }

    try {
        const fetchHeaders = new Headers();
        
        // Only forward the authorization header if it's hitting our backend
        // This prevents 401 errors from external services like Google Cloud Storage which would reject our JWTs
        const isOurBackend = url.includes(process.env.NEXT_PUBLIC_API_URL || 'orr-backend') || url.includes('127.0.0.1') || url.includes('localhost');
        if (isOurBackend) {
            const authHeader = request.headers.get('authorization');
            if (authHeader) {
                fetchHeaders.set('authorization', authHeader);
            }
        }

        const response = await fetch(url, { headers: fetchHeaders });
        
        if (!response.ok) {
            return new NextResponse(`Failed to fetch from remote: ${response.statusText}`, { status: response.status });
        }

        const buffer = await response.arrayBuffer();
        
        const headers = new Headers();
        headers.set('Content-Type', response.headers.get('content-type') || 'application/octet-stream');
        // Forward content-disposition if present
        const disposition = response.headers.get('content-disposition');
        if (disposition) {
            headers.set('Content-Disposition', disposition);
        }

        return new NextResponse(buffer, { headers });
    } catch (error: any) {
        console.error('Proxy download error:', error);
        return new NextResponse(`Proxy Error: ${error.message}`, { status: 500 });
    }
}
