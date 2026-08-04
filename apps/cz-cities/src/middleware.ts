import { NextResponse, type NextRequest } from "next/server";

const markdownAlternates = new Map([
  ["/", "/index.md"],
  ["/members", "/members.md"],
  ["/groups", "/groups.md"],
  ["/regions", "/regions.md"],
  ["/about", "/about.md"],
]);

const linkHeader = [
  '</.well-known/agent-skills/index.json>; rel="index"; type="application/json"; title="Agent Skills"',
  '</llms.txt>; rel="alternate"; type="text/plain"; title="LLM Context"',
  '</sitemap.xml>; rel="sitemap"; type="application/xml"',
  '</robots.txt>; rel="alternate"; type="text/plain"; title="Robots"',
].join(", ");

function withAiDiscoveryHeaders(response: NextResponse) {
  response.headers.set("Link", linkHeader);
  return response;
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname.replace(/\/$/, "") || "/";
  const wantsMarkdown = request.headers.get("accept")?.includes("text/markdown");
  const markdownPath = markdownAlternates.get(pathname);

  if (wantsMarkdown && markdownPath) {
    const url = request.nextUrl.clone();
    url.pathname = markdownPath;
    return withAiDiscoveryHeaders(NextResponse.rewrite(url));
  }

  return withAiDiscoveryHeaders(NextResponse.next());
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.svg).*)"],
};
