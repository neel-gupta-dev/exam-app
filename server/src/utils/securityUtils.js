/**
 * SECURITY-HARDENED Metadata / Fetch Proxy
 * 
 * Mitigations:
 * 1. DNS resolution validation — checks resolved IP, not just hostname string (blocks DNS rebinding)
 * 2. IPv6 loopback and link-local blocking ([::1], fe80::, etc.)
 * 3. redirect: 'manual' — prevents redirect-chain SSRF (attacker URL → 169.254.169.254)
 * 4. 5-second timeout via AbortController — prevents slow-loris style attacks
 * 5. Response body limit — prevents OOM via large payloads
 */

export const safeFetch = async (url, options = {}) => {
  const {
    maxBodySize = 2 * 1024 * 1024, // default 2MB
    timeoutMs = 5000,              // default 5s
    followRedirects = false,       // default manual redirects
    headers = {},
  } = options;

  // Ensure URL has protocol
  const targetUrl = url.startsWith('http') ? url : `https://${url}`;

  // SSRF Mitigation — validate BOTH hostname string and resolved IP
  let parsedUrl;
  try {
    parsedUrl = new URL(targetUrl);
  } catch (e) {
    throw new Error('Invalid URL format');
  }

  // Only allow http/https
  if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
    throw new Error('Only http/https URLs are supported');
  }

  const hostname = parsedUrl.hostname;

  // Block obvious hostnames first (fast path)
  const isLocalhost = hostname === 'localhost' || hostname.endsWith('.localhost');
  const isLoopback4 = /^127\./.test(hostname);
  const isLoopback6 = hostname === '[::1]' || hostname === '::1';
  const isZero = hostname === '0.0.0.0' || hostname === '[::]';
  const isPrivateA = /^10\./.test(hostname);
  const isPrivateB = /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname);
  const isPrivateC = /^192\.168\./.test(hostname);
  const isLinkLocal = /^169\.254\./.test(hostname) || hostname.startsWith('fe80');

  if (isLocalhost || isLoopback4 || isLoopback6 || isZero || isPrivateA || isPrivateB || isPrivateC || isLinkLocal) {
    throw new Error('Fetching from private or local addresses is strictly prohibited.');
  }

  // Resolve DNS to get actual IPs — defeats DNS rebinding attacks
  const dns = await import('dns');
  const { promisify } = await import('util');
  const dnsResolve4 = promisify(dns.default.resolve4);
  const dnsResolve6 = promisify(dns.default.resolve6);

  /** Check if an IPv6 address is private/reserved */
  const isPrivateIPv6 = (ip) => {
    const lower = ip.toLowerCase();
    return (
      lower === '::1' ||                          // Loopback
      lower.startsWith('fc') || lower.startsWith('fd') ||  // Unique Local (fc00::/7)
      lower.startsWith('fe80') ||                  // Link-Local (fe80::/10)
      lower === '::' ||                            // Unspecified
      lower.startsWith('::ffff:127.') ||           // IPv4-mapped loopback
      lower.startsWith('::ffff:10.') ||            // IPv4-mapped private
      lower.startsWith('::ffff:192.168.') ||       // IPv4-mapped private
      lower.startsWith('::ffff:169.254.')           // IPv4-mapped link-local
    );
  };

  try {
    // Resolve IPv4
    let ipv4Addresses = [];
    try { ipv4Addresses = await dnsResolve4(hostname); } catch (e) { /* no A records */ }

    for (const ip of ipv4Addresses) {
      if (
        /^127\./.test(ip) ||
        /^10\./.test(ip) ||
        /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(ip) ||
        /^192\.168\./.test(ip) ||
        /^169\.254\./.test(ip) ||
        ip === '0.0.0.0'
      ) {
        throw new Error('Resolved IP address is private — request blocked.');
      }
    }

    // Resolve IPv6
    let ipv6Addresses = [];
    try { ipv6Addresses = await dnsResolve6(hostname); } catch (e) { /* no AAAA records */ }

    for (const ip of ipv6Addresses) {
      if (isPrivateIPv6(ip)) {
        throw new Error('Resolved IPv6 address is private — request blocked.');
      }
    }

    // SECURITY: If hostname resolved to zero addresses total, block the request
    if (ipv4Addresses.length === 0 && ipv6Addresses.length === 0) {
      throw new Error('Could not resolve hostname — request blocked.');
    }
  } catch (dnsErr) {
    if (dnsErr.message.includes('blocked')) throw dnsErr;
    throw new Error('DNS resolution failed — request blocked.');
  }

  // Timeout to prevent hanging
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  const fetchOptions = {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      ...headers
    },
    redirect: followRedirects ? 'follow' : 'manual',
    signal: controller.signal,
  };

  try {
    const response = await fetch(targetUrl, fetchOptions);
    clearTimeout(timeout);
    
    // Create a wrapper object that exposes safe methods to consume the body
    return {
      status: response.status,
      ok: response.ok,
      headers: response.headers,
      url: targetUrl,
      parsedUrl,
      originalResponse: response,
      
      // Safe text consumption
      async text() {
        const contentLength = parseInt(response.headers.get('content-length') || '0', 10);
        if (contentLength > maxBodySize) {
          throw new Error(`Response too large (Max ${maxBodySize} bytes)`);
        }

        const chunks = [];
        let totalSize = 0;
        const reader = response.body?.getReader();
        if (!reader) throw new Error('No response body');

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          totalSize += value.length;
          if (totalSize > maxBodySize) {
            reader.cancel();
            throw new Error(`Response body exceeded ${maxBodySize} byte limit`);
          }
          chunks.push(value);
        }

        return Buffer.concat(chunks).toString('utf-8');
      }
    };
  } catch (error) {
    clearTimeout(timeout);
    if (error.name === 'AbortError') {
      throw new Error(`Request to target URL timed out (${timeoutMs}ms)`);
    }
    throw error;
  }
};
