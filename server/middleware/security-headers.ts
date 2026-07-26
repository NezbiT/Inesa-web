/**
 * Global security headers for all HTML and API responses.
 * Complements nitro.routeRules headers for prerendered static files.
 */
export default defineEventHandler((event) => {
  const headers = {
    'X-Frame-Options': 'SAMEORIGIN',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'X-DNS-Prefetch-Control': 'on',
    // CSP allows self, Google Fonts, and optional analytics.
    'Content-Security-Policy': [
      "default-src 'self'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'self'",
      "object-src 'none'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' https://fonts.gstatic.com data:",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com",
      "connect-src 'self' https://www.google-analytics.com https://region1.google-analytics.com https://www.googletagmanager.com",
      "upgrade-insecure-requests",
    ].join('; '),
  }

  for (const [key, value] of Object.entries(headers)) {
    setResponseHeader(event, key, value)
  }
})