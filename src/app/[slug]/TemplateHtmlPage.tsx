import { readFile } from "node:fs/promises";
import path from "node:path";
import ManagedTemplateContent from "./ManagedTemplateContent";

const fixedUtilities: Record<string, string> = {
  block: "display:block", inline: "display:inline", "inline-block": "display:inline-block", flex: "display:flex", "inline-flex": "display:inline-flex", grid: "display:grid", hidden: "display:none",
  relative: "position:relative", absolute: "position:absolute", fixed: "position:fixed", sticky: "position:sticky", "inset-0": "inset:0", "top-0": "top:0", "left-0": "left:0", "right-0": "right:0", "bottom-0": "bottom:0", "z-50": "z-index:50",
  "flex-col": "flex-direction:column", "flex-row": "flex-direction:row", "flex-wrap": "flex-wrap:wrap", "flex-nowrap": "flex-wrap:nowrap", "flex-1": "flex:1 1 0%", "flex-auto": "flex:1 1 auto", "flex-none": "flex:none", "flex-shrink-0": "flex-shrink:0", "items-center": "align-items:center", "items-start": "align-items:flex-start", "items-end": "align-items:flex-end", "justify-center": "justify-content:center", "justify-between": "justify-content:space-between", "justify-end": "justify-content:flex-end",
  "text-center": "text-align:center", "text-left": "text-align:left", "text-right": "text-align:right", uppercase: "text-transform:uppercase", capitalize: "text-transform:capitalize", italic: "font-style:italic", "font-medium": "font-weight:500", "font-semibold": "font-weight:600", "font-bold": "font-weight:700", "font-extrabold": "font-weight:800",
  "w-full": "width:100%", "h-full": "height:100%", "h-screen": "height:100vh", "min-h-screen": "min-height:100vh", "overflow-hidden": "overflow:hidden", "overflow-auto": "overflow:auto", "object-cover": "object-fit:cover", "object-contain": "object-fit:contain",
  "bg-transparent": "background-color:transparent", "rounded-full": "border-radius:9999px", "rounded-lg": "border-radius:.5rem", "rounded-xl": "border-radius:.75rem", "rounded-2xl": "border-radius:1rem", "border": "border-width:1px;border-style:solid", "border-2": "border-width:2px;border-style:solid", "border-t": "border-top-width:1px", "border-b": "border-bottom-width:1px",
  "bg-gradient-to-r": "background-image:linear-gradient(90deg,var(--tw-gradient-from),var(--tw-gradient-to))", "bg-gradient-to-br": "background-image:linear-gradient(135deg,var(--tw-gradient-from),var(--tw-gradient-to))", "bg-gradient-to-b": "background-image:linear-gradient(180deg,var(--tw-gradient-from),var(--tw-gradient-to))",
  "transition-all": "transition:all .3s", "transition-colors": "transition:color .2s,background-color .2s,border-color .2s", "transition-transform": "transition:transform .3s", "duration-300": "transition-duration:.3s", "duration-500": "transition-duration:.5s", "cursor-pointer": "cursor:pointer", "pointer-events-none": "pointer-events:none",
};

function color(token: string) {
  const palette = token.match(/^(bg|text|border)-(white|black)(?:\/(\d+))?$/);
  if (palette) {
    const [, kind, shade, opacity] = palette;
    const cssColor = shade === "white" ? "255 255 255" : "0 0 0";
    const prop = kind === "bg" ? "background-color" : kind === "text" ? "color" : "border-color";
    return `${prop}:rgb(${cssColor}${opacity ? ` / ${opacity}%` : ""})`;
  }
  const match = token.match(/^(bg|text|border|from|to)-\[#([\da-fA-F]{3,8})\](?:\/(\d+))?$/);
  if (!match) return null;
  const [, kind, hex, opacity] = match;
  const value = `#${hex}`;
  if (kind === "from") return `--tw-gradient-from:${value};`;
  if (kind === "to") return `--tw-gradient-to:${value};`;
  const property = kind === "bg" ? "background-color" : kind === "text" ? "color" : "border-color";
  if (!opacity) return `${property}:${value}`;
  const channels = hex.length === 6
    ? `${parseInt(hex.slice(0, 2), 16)} ${parseInt(hex.slice(2, 4), 16)} ${parseInt(hex.slice(4, 6), 16)}`
    : "201 162 39";
  return `${property}:rgb(${channels} / ${opacity}%)`;
}

function utility(token: string): string | null {
  if (fixedUtilities[token]) return fixedUtilities[token];
  const colorStyle = color(token);
  if (colorStyle) return colorStyle;
  if (token === "mx-auto") return "margin-inline:auto";
  if (token === "my-auto") return "margin-block:auto";
  let match = token.match(/^(p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|ml|mr|gap|gap-x|gap-y)-(\d+(?:\.\d+)?)$/);
  if (match) {
    const [, prefix, raw] = match;
    const value = `${Number(raw) * 0.25}rem`;
    const properties: Record<string, string> = { p: "padding", px: "padding-inline", py: "padding-block", pt: "padding-top", pb: "padding-bottom", pl: "padding-left", pr: "padding-right", m: "margin", mx: "margin-inline", my: "margin-block", mt: "margin-top", mb: "margin-bottom", ml: "margin-left", mr: "margin-right", gap: "gap", "gap-x": "column-gap", "gap-y": "row-gap" };
    return `${properties[prefix]}:${value}`;
  }
  match = token.match(/^(w|h|min-h|max-w)-(\d+(?:\.\d+)?)$/);
  if (match) return `${({ w: "width", h: "height", "min-h": "min-height", "max-w": "max-width" } as Record<string, string>)[match[1]]}:${Number(match[2]) * 0.25}rem`;
  match = token.match(/^(text)-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl)$/);
  if (match) return `font-size:${({ xs: ".75rem", sm: ".875rem", base: "1rem", lg: "1.125rem", xl: "1.25rem", "2xl": "1.5rem", "3xl": "1.875rem", "4xl": "2.25rem", "5xl": "3rem" } as Record<string, string>)[match[2]]}`;
  match = token.match(/^grid-cols-(\d+)$/);
  if (match) return `grid-template-columns:repeat(${match[1]},minmax(0,1fr))`;
  match = token.match(/^max-w-(\d+)xl$/);
  if (match) return `max-width:${({ 2: "42rem", 3: "48rem", 4: "56rem", 5: "64rem", 6: "72rem", 7: "80rem" } as Record<string, string>)[match[1]] ?? "80rem"}`;
  match = token.match(/^min-h-\[(\d+)vh\]$/);
  if (match) return `min-height:${match[1]}vh`;
  match = token.match(/^(w|h|min-h|max-w)-\[(\d+(?:\.\d+)?)(px|rem|%|vh|vw)\]$/);
  if (match) return `${({ w: "width", h: "height", "min-h": "min-height", "max-w": "max-width" } as Record<string, string>)[match[1]]}:${match[2]}${match[3]}`;
  match = token.match(/^text-\[(\d+(?:\.\d+)?)(px|rem)\]$/);
  if (match) return `font-size:${match[1]}${match[2]}`;
  match = token.match(/^(opacity)-(\d+)$/);
  if (match) return `opacity:${Number(match[2]) / 100}`;
  match = token.match(/^(bg|text|border)-(white|black)\/(\d+)$/);
  if (match) {
    const prop = match[1] === "bg" ? "background-color" : match[1] === "text" ? "color" : "border-color";
    const channels = match[2] === "white" ? "255 255 255" : "0 0 0";
    return `${prop}:rgb(${channels} / ${match[3]}%)`;
  }
  if (token === "shadow-2xl" || token === "shadow-xl") return "box-shadow:0 20px 35px rgba(0,0,0,.25)";
  if (token === "shadow-lg") return "box-shadow:0 10px 20px rgba(0,0,0,.2)";
  match = token.match(/^tracking-(wide|wider|widest)$/);
  if (match) return `letter-spacing:${({ wide: ".025em", wider: ".05em", widest: ".1em" } as Record<string, string>)[match[1]]}`;
  match = token.match(/^leading-(tight|snug|normal|relaxed|loose)$/);
  if (match) return `line-height:${({ tight: "1.25", snug: "1.375", normal: "1.5", relaxed: "1.625", loose: "2" } as Record<string, string>)[match[1]]}`;
  return null;
}

function createUtilityCss(markup: string) {
  const classes = new Set<string>();
  for (const match of markup.matchAll(/class="([^"]+)"/g)) {
    for (const token of match[1].split(/\s+/)) classes.add(token);
  }
  const rules: string[] = [];
  const responsive = new Map<string, string[]>();
  for (const token of classes) {
    const parts = token.split(":");
    const utilityToken = parts.pop()!;
    const declarations = utility(utilityToken);
    const spaceMatch = utilityToken.match(/^space-([xy])-(\d+)$/);
    if (spaceMatch) {
      const amount = `${Number(spaceMatch[2]) * 0.25}rem`;
      const selector = `.templateRoot [class~="${token}"] > :not([hidden]) ~ :not([hidden])`;
      const rule = `${selector}{${spaceMatch[1] === "y" ? `margin-top:${amount}` : `margin-left:${amount}`}}`;
      const breakpoint = parts.at(-1);
      if (breakpoint === "sm" || breakpoint === "md" || breakpoint === "lg" || breakpoint === "xl") {
        const list = responsive.get(breakpoint) ?? [];
        list.push(rule);
        responsive.set(breakpoint, list);
      } else if (parts.length === 0) rules.push(rule);
      continue;
    }
    if (!declarations) continue;
    const selector = `.templateRoot [class~="${token}"]`;
    const rule = `${selector}{${declarations}}`;
    const breakpoint = parts.at(-1);
    if (breakpoint === "sm" || breakpoint === "md" || breakpoint === "lg" || breakpoint === "xl") {
      const list = responsive.get(breakpoint) ?? [];
      list.push(rule);
      responsive.set(breakpoint, list);
    } else if (parts.length === 0) rules.push(rule);
  }
  const breakpoints: Record<string, string> = { sm: "640px", md: "768px", lg: "1024px", xl: "1280px" };
  for (const [key, value] of responsive) rules.push(`@media(min-width:${breakpoints[key]}){${value.join("")}}`);
  return rules.join("");
}

export default async function TemplateHtmlPage({ slug }: { slug: string }) {
  const filename = `nghieng-connect-hub.base44.app-${slug}.html`;
  const sourcePath = path.join(process.cwd(), "tailieugoc", "public", "html", filename);
  const sourceMarkup = await readFile(sourcePath, "utf8");
  const markup = sourceMarkup
    .replace(/<nav\b[\s\S]*?<\/nav>/i, "")
    .replace(/<footer\b[\s\S]*?<\/footer>/i, "");
  const css = createUtilityCss(markup);
  const baseCss = `.templateRoot{min-height:100vh;background:#06243d;color:#fff;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.5;overflow:hidden}.templateRoot *{box-sizing:border-box}.templateRoot a{color:inherit;text-decoration:none}.templateRoot img{max-width:100%;height:auto}.templateRoot button,.templateRoot input,.templateRoot select,.templateRoot textarea{font:inherit}.templateRoot .hero-section{position:relative;display:flex;min-height:85vh;align-items:center;overflow:hidden;background:#0d1b3e}.templateRoot .hero-section>div:first-child{position:absolute;inset:0}.templateRoot .hero-section img{width:100%;height:100%;object-fit:cover}.templateRoot .section-navy{background:#06243d}.templateRoot .circuit-bg{background-color:#06243d;background-image:linear-gradient(rgba(255,255,255,.018) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.018) 1px,transparent 1px);background-size:32px 32px}.templateRoot section{position:relative}.templateRoot footer{background:#080f23;color:#fff}.templateRoot nav{z-index:50}.templateRoot h1,.templateRoot h2,.templateRoot h3,.templateRoot h4{font-weight:800;line-height:1.15}.templateRoot p{line-height:1.65}.templateRoot .hover-card,.templateRoot .glass-card{border:1px solid rgba(215,168,74,.26);background:rgba(3,23,43,.72);border-radius:12px}.templateRoot form{width:100%}.templateRoot input,.templateRoot select,.templateRoot textarea{width:100%;min-height:42px;border:1px solid rgba(215,168,74,.25);border-radius:8px;background:#03172b;color:#fff;padding:10px 12px}.templateRoot textarea{min-height:110px}.templateRoot button{cursor:pointer}.templateRoot svg{flex:none}.templateRoot [class*="text-[#C9A227]"],.templateRoot [class*="text-[#D7A84A]"],.templateRoot [class*="text-gold"]{color:#d7a84a}.templateRoot [class*="bg-[#C9A227]"],.templateRoot [class*="bg-[#D7A84A]"]{background-color:#d7a84a}.templateRoot [class*="border-[#C9A227]"],.templateRoot [class*="border-[#D7A84A]"]{border-color:rgba(215,168,74,.45)}@media(max-width:767px){.templateRoot .hero-section{min-height:70vh}.templateRoot nav.fixed{padding-block:8px}.templateRoot section{scroll-margin-top:70px}}`;
  return (
    <ManagedTemplateContent slug={slug} markup={markup} css={`${baseCss}${css}`} />
  );
}
