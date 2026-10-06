import { readFile } from "node:fs/promises";
import path from "node:path";
import ManagedTemplateContent from "./ManagedTemplateContent";

const fixedUtilities: Record<string, string> = {
  block: "display:block", inline: "display:inline", "inline-block": "display:inline-block", flex: "display:flex", "inline-flex": "display:inline-flex", grid: "display:grid", hidden: "display:none",
  relative: "position:relative", absolute: "position:absolute", fixed: "position:fixed", sticky: "position:sticky", "inset-0": "inset:0", "top-0": "top:0", "top-full": "top:100%", "left-0": "left:0", "right-0": "right:0", "bottom-0": "bottom:0", "z-10": "z-index:10", "z-20": "z-index:20", "z-50": "z-index:50",
  "flex-col": "flex-direction:column", "flex-row": "flex-direction:row", "flex-wrap": "flex-wrap:wrap", "flex-nowrap": "flex-wrap:nowrap", "flex-1": "flex:1 1 0%", "flex-auto": "flex:1 1 auto", "flex-none": "flex:none", "flex-shrink-0": "flex-shrink:0", "items-center": "align-items:center", "items-start": "align-items:flex-start", "items-end": "align-items:flex-end", "justify-center": "justify-content:center", "justify-between": "justify-content:space-between", "justify-end": "justify-content:flex-end",
  "text-center": "text-align:center", "text-left": "text-align:left", "text-right": "text-align:right", uppercase: "text-transform:uppercase", capitalize: "text-transform:capitalize", italic: "font-style:italic", "font-medium": "font-weight:500", "font-semibold": "font-weight:600", "font-bold": "font-weight:700", "font-extrabold": "font-weight:800", "font-black": "font-weight:900",
  "w-full": "width:100%", "h-full": "height:100%", "h-px": "height:1px", "h-screen": "height:100vh", "min-h-screen": "min-height:100vh", "aspect-video": "aspect-ratio:16 / 9", "overflow-hidden": "overflow:hidden", "overflow-auto": "overflow:auto", "object-cover": "object-fit:cover", "object-contain": "object-fit:contain",
  "bg-transparent": "background-color:transparent", "rounded-full": "border-radius:9999px", "rounded-lg": "border-radius:.5rem", "rounded-xl": "border-radius:.75rem", "rounded-2xl": "border-radius:1rem", "border": "border-width:1px;border-style:solid", "border-2": "border-width:2px;border-style:solid", "border-t": "border-top-width:1px", "border-b": "border-bottom-width:1px",
  "bg-gradient-to-r": "background-image:linear-gradient(90deg,var(--tw-gradient-from),var(--tw-gradient-via,var(--tw-gradient-to)),var(--tw-gradient-to))", "bg-gradient-to-br": "background-image:linear-gradient(135deg,var(--tw-gradient-from),var(--tw-gradient-via,var(--tw-gradient-to)),var(--tw-gradient-to))", "bg-gradient-to-b": "background-image:linear-gradient(180deg,var(--tw-gradient-from),var(--tw-gradient-via,var(--tw-gradient-to)),var(--tw-gradient-to))",
  "transition-all": "transition:all .3s", "transition-colors": "transition:color .2s,background-color .2s,border-color .2s", "transition-transform": "transition:transform .3s", "duration-300": "transition-duration:.3s", "duration-500": "transition-duration:.5s", "cursor-pointer": "cursor:pointer", "pointer-events-none": "pointer-events:none",
};

function color(token: string) {
  const palette = token.match(/^(bg|text|border)-(white|black)(?:\/(\d+))?$/);
  if (palette) {
    const [, kind, shade, opacity] = palette;
    const cssColor = shade === "white" ? "255 255 255" : "3 23 43";
    const prop = kind === "bg" ? "background-color" : kind === "text" ? "color" : "border-color";
    return `${prop}:rgb(${cssColor}${opacity ? ` / ${opacity}%` : ""})`;
  }
  const match = token.match(/^(bg|text|border|from|via|to)-\[#([\da-fA-F]{3,8})\](?:\/(\d+))?$/);
  if (!match) return null;
  const [, kind, hex, opacity] = match;
  const value = `#${hex}`;
  if (kind === "from" || kind === "via" || kind === "to") {
    const variable = kind === "from" ? "--tw-gradient-from" : kind === "via" ? "--tw-gradient-via" : "--tw-gradient-to";
    if (!opacity) return `${variable}:${value};`;
    const channels = hex.length === 6
      ? `${parseInt(hex.slice(0, 2), 16)} ${parseInt(hex.slice(2, 4), 16)} ${parseInt(hex.slice(4, 6), 16)}`
      : "3 23 43";
    return `${variable}:rgb(${channels} / ${opacity}%);`;
  }
  const property = kind === "bg" ? "background-color" : kind === "text" ? "color" : "border-color";
  if (!opacity) return `${property}:${value}`;
  const channels = hex.length === 6
    ? `${parseInt(hex.slice(0, 2), 16)} ${parseInt(hex.slice(2, 4), 16)} ${parseInt(hex.slice(4, 6), 16)}`
    : "3 23 43";
  return `${property}:rgb(${channels} / ${opacity}%)`;
}

function utility(token: string): string | null {
  if (fixedUtilities[token]) return fixedUtilities[token];
  const colorStyle = color(token);
  if (colorStyle) return colorStyle;
  if (token === "mx-auto") return "margin-inline:auto";
  if (token === "my-auto") return "margin-block:auto";
  let match = token.match(/^(top|right|bottom|left)-(full|1\/2|\d+(?:\.\d+)?)$/);
  if (match) {
    const value = match[2] === "full" ? "100%" : match[2] === "1/2" ? "50%" : `${Number(match[2]) * 0.25}rem`;
    return `${match[1]}:${value}`;
  }
  match = token.match(/^z-(\d+)$/);
  if (match) return `z-index:${match[1]}`;
  match = token.match(/^(-)?translate-([xy])-(1\/2|\d+(?:\.\d+)?)$/);
  if (match) {
    const value = match[3] === "1/2" ? "50%" : `${Number(match[3]) * 0.25}rem`;
    const signedValue = match[1] ? `-${value}` : value;
    return `translate:${match[2] === "x" ? `${signedValue} 0` : `0 ${signedValue}`}`;
  }
  match = token.match(/^scale-(\d+)$/);
  if (match) return `scale:${Number(match[1]) / 100}`;
  match = token.match(/^duration-(\d+)$/);
  if (match) return `transition-duration:${Number(match[1])}ms`;
  match = token.match(/^(p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|ml|mr|gap|gap-x|gap-y)-(\d+(?:\.\d+)?)$/);
  if (match) {
    const [, prefix, raw] = match;
    const value = `${Number(raw) * 0.25}rem`;
    const properties: Record<string, string> = { p: "padding", px: "padding-inline", py: "padding-block", pt: "padding-top", pb: "padding-bottom", pl: "padding-left", pr: "padding-right", m: "margin", mx: "margin-inline", my: "margin-block", mt: "margin-top", mb: "margin-bottom", ml: "margin-left", mr: "margin-right", gap: "gap", "gap-x": "column-gap", "gap-y": "row-gap" };
    return `${properties[prefix]}:${value}`;
  }
  match = token.match(/^(w|h|min-h|max-w)-(\d+(?:\.\d+)?)$/);
  if (match) return `${({ w: "width", h: "height", "min-h": "min-height", "max-w": "max-width" } as Record<string, string>)[match[1]]}:${Number(match[2]) * 0.25}rem`;
  match = token.match(/^(text)-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl)$/);
  if (match) return `font-size:${({ xs: ".75rem", sm: ".875rem", base: "1rem", lg: "1.125rem", xl: "1.25rem", "2xl": "1.5rem", "3xl": "1.875rem", "4xl": "2.25rem", "5xl": "3rem", "6xl": "3.75rem", "7xl": "4.5rem" } as Record<string, string>)[match[2]]}`;
  match = token.match(/^grid-cols-(\d+)$/);
  if (match) return `grid-template-columns:repeat(${match[1]},minmax(0,1fr))`;
  match = token.match(/^aspect-\[(\d+)\/(\d+)\]$/);
  if (match) return `aspect-ratio:${match[1]} / ${match[2]}`;
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
    const channels = match[2] === "white" ? "255 255 255" : "3 23 43";
    return `${prop}:rgb(${channels} / ${match[3]}%)`;
  }
  if (token === "shadow-2xl" || token === "shadow-xl") return "box-shadow:0 20px 35px rgba(3,23,43,.25)";
  if (token === "shadow-lg") return "box-shadow:0 10px 20px rgba(3,23,43,.2)";
  match = token.match(/^tracking-(wide|wider|widest)$/);
  if (match) return `letter-spacing:${({ wide: ".025em", wider: ".05em", widest: ".1em" } as Record<string, string>)[match[1]]}`;
  match = token.match(/^tracking-\[(\d+(?:\.\d+)?)(px|em|rem)\]$/);
  if (match) return `letter-spacing:${match[1]}${match[2]}`;
  match = token.match(/^leading-(tight|snug|normal|relaxed|loose)$/);
  if (match) return `line-height:${({ tight: "1.25", snug: "1.375", normal: "1.5", relaxed: "1.625", loose: "2" } as Record<string, string>)[match[1]]}`;
  match = token.match(/^leading-\[(\d+(?:\.\d+)?)\]$/);
  if (match) return `line-height:${match[1]}`;
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
    const state = parts.find((part) => part === "hover" || part === "focus" || part === "focus-visible" || part === "active");
    const breakpoint = parts.find((part) => part === "sm" || part === "md" || part === "lg" || part === "xl");
    const declarations = utility(utilityToken);
    const spaceMatch = utilityToken.match(/^space-([xy])-(\d+)$/);
    if (spaceMatch) {
      const amount = `${Number(spaceMatch[2]) * 0.25}rem`;
      const selector = `.templateRoot [class~="${token}"] > :not([hidden]) ~ :not([hidden])`;
      const rule = `${selector}{${spaceMatch[1] === "y" ? `margin-top:${amount}` : `margin-left:${amount}`}}`;
      if (breakpoint) {
        const list = responsive.get(breakpoint) ?? [];
        list.push(rule);
        responsive.set(breakpoint, list);
      } else if (!state) rules.push(rule);
      continue;
    }
    if (!declarations) continue;
    const selector = `.templateRoot [class~="${token}"]`;
    const stateSelector = state ? state === "focus-visible" ? ":focus-visible" : `:${state}` : "";
    const rule = `${selector}${stateSelector}{${declarations}}`;
    if (breakpoint) {
      const list = responsive.get(breakpoint) ?? [];
      list.push(rule);
      responsive.set(breakpoint, list);
    } else rules.push(rule);
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
    .replace(/<footer\b[\s\S]*?<\/footer>/i, "")
    .replace(/class="([^"]*)"/g, (attribute, classNames: string) => {
      const classes = classNames.split(/\s+/);
      const entranceTransforms = new Set(["translate-y-8", "-translate-x-8", "translate-x-8", "-translate-y-8"]);
      if (!classes.some((token) => entranceTransforms.has(token))) return attribute;
      return `class="${classes.filter((token) => token !== "opacity-0" && !entranceTransforms.has(token)).join(" ")}"`;
    });
  const css = createUtilityCss(markup);
  const baseCss = `.templateRoot{min-height:100vh;background:#06243D;color:#FFFFFF;font-family:"Be Vietnam Pro",sans-serif;font-size:16px;line-height:1.6;overflow:hidden}.templateRoot *{box-sizing:border-box}.templateRoot a{color:inherit;text-decoration:none}.templateRoot img{max-width:100%;height:auto}.templateRoot button,.templateRoot input,.templateRoot select,.templateRoot textarea{font:inherit}.templateRoot :is([class~="border"],[class~="border-2"],[class~="border-t"],[class~="border-b"]){border-style:solid}.templateRoot .hero-section{position:relative;display:flex;min-height:85vh;align-items:center;overflow:hidden;background:#06243D}.templateRoot .hero-section>div:first-child{position:absolute;inset:0}.templateRoot .hero-section img{width:100%;height:100%;object-fit:cover}.templateRoot .section-navy{background:linear-gradient(135deg,#0D1B3E,#1A2F5E)}.templateRoot .circuit-bg{background-color:#06243D;background-image:linear-gradient(rgba(201,162,39,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(201,162,39,.03) 1px,transparent 1px);background-size:40px 40px}.templateRoot section{position:relative}.templateRoot footer{background:#03172B;color:#FFFFFF}.templateRoot nav{z-index:50}.templateRoot :is(h1,h2,h3,h4,h5,h6){font-family:"Inter Tight","Be Vietnam Pro",Inter,system-ui,sans-serif;letter-spacing:-.02em}.templateRoot h1,.templateRoot h2,.templateRoot h3,.templateRoot h4{font-weight:800;line-height:1.15}.templateRoot p{line-height:1.65}.templateRoot .space-y-4>p+p{margin-top:1rem}.templateRoot .gold-border{border:1px solid rgba(201,162,39,.4)}.templateRoot .gold-border-glow{border:1px solid rgba(201,162,39,.6);box-shadow:0 0 20px rgba(201,162,39,.15)}.templateRoot .text-gold-gradient{background:linear-gradient(135deg,#C9A227,#E8C84A,#A07E1A);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}.templateRoot .hover-card,.templateRoot .glass-card{border:1px solid rgba(201,162,39,.26);background:rgba(3,23,43,.72);border-radius:12px}.templateRoot form{width:100%}.templateRoot input,.templateRoot select,.templateRoot textarea{width:100%;min-height:42px;border:1px solid rgba(201,162,39,.25);border-radius:8px;background:#03172B;color:#FFFFFF;padding:10px 12px}.templateRoot textarea{min-height:110px}.templateRoot button{cursor:pointer}.templateRoot svg{flex:none}.templateRoot [class*="text-[#D7A84A]"],.templateRoot [class*="text-[#C9A227]"],.templateRoot [class*="text-gold"]{color:#C9A227}.templateRoot [class*="bg-[#D7A84A]"],.templateRoot [class*="bg-[#C9A227]"]{background-color:#C9A227}.templateRoot [class*="border-[#D7A84A]"],.templateRoot [class*="border-[#C9A227]"]{border-color:rgba(201,162,39,.45)}@media(max-width:767px){.templateRoot .hero-section{min-height:70vh}.templateRoot nav.fixed{padding-block:8px}.templateRoot section{scroll-margin-top:70px}}`;
  const themeCss = `html[data-theme="light"] .templateRoot{background:#F5F7F8;color:#03172B}
html[data-theme="light"] .templateRoot section:not(.hero-section){background-color:#F5F7F8!important;color:#03172B}
html[data-theme="light"] .templateRoot section.section-navy{background-color:#FFFFFF!important;background-image:none!important;color:#03172B}
html[data-theme="light"] .templateRoot section.circuit-bg:not(.hero-section){background-image:linear-gradient(rgba(3,23,43,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(3,23,43,.035) 1px,transparent 1px)!important;background-size:40px 40px}
html[data-theme="light"] .templateRoot strong[style*="color:#fff"]{color:#03172B!important}
html[data-theme="light"] .templateRoot [class*="bg-[#03172B]"]:not(.hero-section):not(.hero-section *),html[data-theme="light"] .templateRoot [class*="bg-[#06243D]"]:not(.hero-section):not(.hero-section *){background-color:#FFFFFF!important;color:#03172B!important}
html[data-theme="light"] .templateRoot [class*="text-white"]:not(.hero-section):not(.hero-section *){color:#03172B!important}
html[data-theme="light"] .templateRoot .hover-card:hover,html[data-theme="light"] .templateRoot .glass-card:hover,html[data-theme="light"] .templateRoot .grid>*>:hover{background:#F5F7F8!important;border-color:#F5F7F8!important;color:#03172B!important;transition:background-color .25s ease,color .25s ease,border-color .25s ease}
html[data-theme="light"] .templateRoot .hover-card:hover :is(h1,h2,h3,h4,p,span),html[data-theme="light"] .templateRoot .glass-card:hover :is(h1,h2,h3,h4,p,span),html[data-theme="light"] .templateRoot .grid>*>:hover :is(h1,h2,h3,h4,p,span){color:#03172B!important}`;
  const partnerCss = `.templateRoot .partner-filter-row{gap:.625rem;margin-bottom:2.5rem}.templateRoot .partner-filter-row button{min-height:2.5rem;padding:.5rem 1.125rem;border:1px solid rgba(201,162,39,.32);border-radius:9999px;background:rgba(3,23,43,.48);color:rgba(255,255,255,.72);font-size:.8125rem;font-weight:600;letter-spacing:.01em;white-space:nowrap;box-shadow:inset 0 1px 0 rgba(255,255,255,.035);transition:color .18s ease,border-color .18s ease,background .18s ease,box-shadow .18s ease}.templateRoot .partner-filter-row button:first-child:not([aria-pressed]),.templateRoot .partner-filter-row button[aria-pressed="true"]{border-color:#C9A227;background:linear-gradient(135deg,#C9A227,#E8C84A);color:#0D1B3E;box-shadow:0 3px 12px rgba(201,162,39,.18)}.templateRoot .partner-filter-row button:not(:first-child):not([aria-pressed="true"]):hover{border-color:rgba(232,200,74,.8);background:rgba(201,162,39,.1);color:#E8C84A}.templateRoot .partner-filter-row button:focus-visible{outline:2px solid #E8C84A;outline-offset:3px}.templateRoot .partner-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:1rem}.templateRoot .partner-grid>div{min-width:0;border-radius:.75rem;background:#03172B}.templateRoot .partner-grid svg{width:1.125rem;height:1.125rem;margin-bottom:.5rem;color:#C9A227}.templateRoot .partner-grid>div>div:first-of-type{color:rgba(255,255,255,.88);font-size:.875rem}.templateRoot .partner-grid>div>div:last-child{color:rgba(255,255,255,.42);font-size:.625rem}@media(min-width:640px){.templateRoot .partner-grid{grid-template-columns:repeat(4,minmax(0,1fr))}}@media(max-width:639px){.templateRoot .partner-filter-row{flex-wrap:nowrap;justify-content:flex-start;overflow-x:auto;padding:.25rem .125rem .75rem;scrollbar-width:thin}.templateRoot .partner-grid{gap:.75rem}}`;
  return (
    <ManagedTemplateContent slug={slug} markup={markup} css={`${baseCss}${css}${themeCss}${slug === "doi-tac" ? partnerCss : ""}`} />
  );
}
