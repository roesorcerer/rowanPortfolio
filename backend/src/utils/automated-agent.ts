// Whether a User-Agent belongs to software rather than a person, for analytics
// intake. Such a request is acknowledged (204) and not stored.
//
// The case that prompted it is Vercel's deployment check: on every deploy a
// HeadlessChrome loads the preview site, which posts page views to the
// production API like any visitor. Search and AI crawlers that run JavaScript
// (Googlebot renders pages; AhrefsBot and PerplexityBot appear in the logs)
// do the same. None of them is a person reading the portfolio.
//
// The patterns are deliberately narrow. "bot" has to be followed by "/", ";",
// "-" or ")", which is how crawlers write it ("Googlebot/2.1",
// "compatible; bingbot/2.0;", "AdsBot-Google") — a bare /bot/ would also
// match phone models such as "CUBOT X30" and drop real visitors. A missed bot
// costs one inflated count; a dropped visitor is invisible, so the error is
// pushed toward keeping.
//
// Exported because the retention migration deletes rows recorded before this
// filter existed, and both must agree on what counts. Plain regexes, no
// lookbehind, so MongoDB's $in can run them as-is.
export const AUTOMATED_AGENT_PATTERNS = [
  /bot[/;)-]/i,
  /crawler/i,
  /spider/i,
  /headless/i,
  /lighthouse/i,
];

export function isAutomatedAgent(userAgent: string): boolean {
  return AUTOMATED_AGENT_PATTERNS.some((pattern) => pattern.test(userAgent));
}
