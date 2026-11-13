import { isAutomatedAgent } from "./automated-agent";

// Real User-Agent strings, most of them copied from the production logs.
describe("isAutomatedAgent", () => {
  it.each([
    [
      "Vercel's deployment check",
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/153.0.8010.0 Safari/537.36",
    ],
    [
      "AhrefsBot",
      "Mozilla/5.0 (compatible; AhrefsBot/7.0; +http://ahrefs.com/robot/)",
    ],
    [
      "PerplexityBot",
      "Mozilla/5.0 (compatible; PerplexityBot/1.0; +https://perplexity.ai/perplexitybot)",
    ],
    [
      "Googlebot",
      "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
    ],
    [
      "bingbot",
      "Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)",
    ],
    ["AdsBot", "AdsBot-Google (+http://www.google.com/adsbot.html)"],
    [
      "Lighthouse",
      "Mozilla/5.0 (Linux) Chrome/120 Safari/537.36 Chrome-Lighthouse",
    ],
  ])("flags %s", (_name, agent) => {
    expect(isAutomatedAgent(agent)).toBe(true);
  });

  it.each([
    [
      "desktop Chrome",
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36",
    ],
    [
      "iPhone Safari",
      "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1",
    ],
    // A phone brand with "bot" in it — the reason the pattern is narrow.
    [
      "a CUBOT phone",
      "Mozilla/5.0 (Linux; Android 13; CUBOT X30 Build/TP1A) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Mobile Safari/537.36",
    ],
    ["an empty header", ""],
  ])("keeps %s", (_name, agent) => {
    expect(isAutomatedAgent(agent)).toBe(false);
  });
});
