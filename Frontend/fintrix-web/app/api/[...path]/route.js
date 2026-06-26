import { NextResponse } from "next/server";

const FALLBACK_BACKEND_BASE = process.env.NODE_ENV === "production" ? "" : "http://127.0.0.1:8000";

function getBackendBaseUrl() {
  const configuredBaseUrl =
    process.env.BACKEND_API_URL ||
    (process.env.NODE_ENV === "production"
      ? process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL
      : "") ||
    FALLBACK_BACKEND_BASE;

  return configuredBaseUrl.replace(/\/$/, "");
}

async function proxyRequest(request, context) {
  const backendBaseUrl = getBackendBaseUrl();

  if (!backendBaseUrl) {
    return NextResponse.json(
      { detail: "Backend API URL is not configured." },
      { status: 502 }
    );
  }

  const pathParts = context.params?.path || [];
  const requestPath = `/api/${pathParts.join("/")}`;
  const targetUrl = new URL(request.url);
  const destination = new URL(`${requestPath}${targetUrl.search}`, backendBaseUrl);

  const headers = new Headers(request.headers);
  headers.delete("host");

  const init = {
    method: request.method,
    headers,
    redirect: "manual",
  };

  if (!["GET", "HEAD"].includes(request.method)) {
    init.body = await request.arrayBuffer();
  }

  const response = await fetch(destination, init);
  const responseHeaders = new Headers(response.headers);
  responseHeaders.delete("content-encoding");
  responseHeaders.delete("content-length");
  responseHeaders.delete("transfer-encoding");

  return new NextResponse(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
  });
}

export function GET(request, context) {
  return proxyRequest(request, context);
}

export function POST(request, context) {
  return proxyRequest(request, context);
}

export function PUT(request, context) {
  return proxyRequest(request, context);
}

export function PATCH(request, context) {
  return proxyRequest(request, context);
}

export function DELETE(request, context) {
  return proxyRequest(request, context);
}

export function OPTIONS(request, context) {
  return proxyRequest(request, context);
}
