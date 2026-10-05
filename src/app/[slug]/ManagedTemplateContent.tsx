"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import SiteFooter from "@/components/site/SiteFooter";
import SiteHeader from "@/components/site/SiteHeader";
import { defaultPageContent, hydratePageContent, readPageContent, type AdminPageContent } from "@/app/admin/page-data";

const textSnapshots = new WeakMap<HTMLElement, Map<string, { markup: string; value: string }>>();
const imageSnapshots = new WeakMap<HTMLImageElement, Map<string, { source: string; value: string }>>();

function syncText(element: Element | null, value: string | undefined, defaultValue: string | undefined, key: string) {
  if (!element || value === undefined) return;
  const target = element as HTMLElement;
  let snapshots = textSnapshots.get(target);
  if (!snapshots) {
    snapshots = new Map();
    textSnapshots.set(target, snapshots);
  }
  let snapshot = snapshots.get(key);
  if (!snapshot) {
    snapshot = { markup: target.innerHTML, value: defaultValue ?? "" };
    snapshots.set(key, snapshot);
  }
  if (snapshot.value === value) return;
  if (value === defaultValue) target.innerHTML = snapshot.markup;
  else target.textContent = value;
  snapshot.value = value;
}

function syncImage(image: HTMLImageElement | null, value: string, defaultValue: string | undefined, key: string, force = false) {
  if (!image) return;
  let snapshots = imageSnapshots.get(image);
  if (!snapshots) {
    snapshots = new Map();
    imageSnapshots.set(image, snapshots);
  }
  let snapshot = snapshots.get(key);
  if (!snapshot) {
    snapshot = { source: image.src, value: defaultValue ?? "" };
    snapshots.set(key, snapshot);
  }
  if (snapshot.value === value && !force) return;
  image.src = value || snapshot.source || "";
  snapshot.value = value;
}

function applyManagedContent(root: HTMLElement, content: AdminPageContent, defaults: AdminPageContent | null) {
  const defaultSlider = defaults?.sliders[0];
  const activeSlider = content.sliders.find((slider) => slider.enabled);
  const hero = root.querySelector<HTMLElement>(".hero-section, .hero") ?? root.querySelector<HTMLElement>("section");

  if (hero && activeSlider) {
    syncText(hero.querySelector("h1"), activeSlider.title, defaultSlider?.title, "HeroTitle");
    syncText(hero.querySelector("p"), activeSlider.description, defaultSlider?.description, "HeroDescription");
    const firstSliderSelected = activeSlider.id === defaultSlider?.id;
    syncImage(hero.querySelector<HTMLImageElement>("img"), activeSlider.image, defaultSlider?.image, "HeroImage", !firstSliderSelected);
  }

  const pageSections = Array.from(root.querySelectorAll<HTMLElement>("section")).filter((section) => section !== hero);
  const defaultSections = defaults?.sections ?? [];
  const hasManagedSectionIds = pageSections.some((element) => element.dataset.adminSectionId !== undefined);
  const sectionElements = new Map(defaultSections.map((section, index) => [section.id, pageSections.find((element) => element.dataset.adminSectionId === section.id) ?? (hasManagedSectionIds ? undefined : pageSections[index])] as const));
  const orderedManagedElements: HTMLElement[] = [];

  content.sections.forEach((section) => {
    let element = sectionElements.get(section.id) ?? Array.from(root.querySelectorAll<HTMLElement>("[data-admin-page-section='true']")).find((item) => item.dataset.adminSectionId === section.id);
    if (!element && !defaultSections.some((item) => item.id === section.id)) {
      element = document.createElement("section");
      element.dataset.adminPageSection = "true";
      element.dataset.adminSectionId = section.id;
      element.style.cssText = "padding:4rem max(1.5rem,8vw);background:#06243d;color:#fff";
      const heading = document.createElement("h2");
      heading.style.cssText = "max-width:70rem;margin:0 auto 1rem;color:#d7a84a;font-size:clamp(1.5rem,3vw,2.5rem)";
      const description = document.createElement("p");
      description.style.cssText = "max-width:70rem;margin:0 auto;color:#dbe3e8;line-height:1.7;white-space:pre-line";
      element.append(heading, description);
      root.append(element);
    }
    if (!element) return;
    orderedManagedElements.push(element);
    element.dataset.adminPageSection = "true";
    element.dataset.adminSectionId = section.id;
    const defaultSection = defaultSections.find((item) => item.id === section.id);
    element.hidden = !section.enabled;

    syncText(element.querySelector("h2, h3, h4"), section.title, defaultSection?.title, `SectionTitle${section.id}`);
    syncText(element.querySelector("p"), section.description, defaultSection?.description, `SectionDescription${section.id}`);
    syncImage(element.querySelector<HTMLImageElement>("img"), section.image ?? "", defaultSection?.image, `SectionImage${section.id}`);

    if (section.body) {
      let body = element.querySelector<HTMLElement>("[data-admin-section-body]");
      if (!body) {
        body = document.createElement("p");
        body.dataset.adminSectionBody = "true";
        body.style.cssText = "margin-top:1rem;white-space:pre-line";
        element.append(body);
      }
      body.textContent = section.body;
    } else element.querySelector("[data-admin-section-body]")?.remove();

    const link = element.querySelector<HTMLAnchorElement>("a");
    if (link) {
      link.dataset.adminOriginalText ??= link.textContent ?? "";
      link.dataset.adminOriginalHref ??= link.href;
      link.textContent = section.ctaLabel || link.dataset.adminOriginalText || "";
      link.href = section.ctaUrl || link.dataset.adminOriginalHref || "";
    }
  });

  const activeSectionIds = new Set(content.sections.map((section) => section.id));
  defaultSections.forEach((section) => {
    if (activeSectionIds.has(section.id)) return;
    const element = sectionElements.get(section.id);
    if (element) element.hidden = true;
  });

  if (hero && orderedManagedElements.length === defaultSections.length && orderedManagedElements.length > 1) {
    const parent = orderedManagedElements[0].parentElement;
    if (parent && orderedManagedElements.every((section) => section.parentElement === parent)) {
      const marker = document.createComment("admin-section-order");
      parent.insertBefore(marker, orderedManagedElements[0]);
      const fragment = document.createDocumentFragment();
      orderedManagedElements.forEach((section) => fragment.append(section));
      parent.insertBefore(fragment, marker);
      marker.remove();
    }
  }
}

export default function ManagedTemplateContent({ slug, markup, css }: { slug: string; markup: string; css: string }) {
  const defaults = useMemo(() => defaultPageContent(slug), [slug]);
  const [content, setContent] = useState<AdminPageContent>(() => readPageContent(slug) ?? defaults!);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    const refresh = () => {
      const next = readPageContent(slug);
      if (next) setContent(next);
    };
    void hydratePageContent(slug).then(() => { if (active) refresh(); });
    window.addEventListener("nghieng:content-updated", refresh);
    return () => {
      active = false;
      window.removeEventListener("nghieng:content-updated", refresh);
    };
  }, [slug]);

  useEffect(() => {
    document.title = content.title;
    document.querySelector('meta[name="description"]')?.setAttribute("content", content.description);
    if (rootRef.current) applyManagedContent(rootRef.current, content, defaults);
  }, [content, defaults]);

  return (
    <main className="templateRoot" aria-label={content.name}>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <SiteHeader />
      {content.active ? <div ref={rootRef} dangerouslySetInnerHTML={{ __html: markup }} /> : <section style={{ minHeight: "55vh", display: "grid", placeContent: "center", padding: "3rem 1.5rem", textAlign: "center" }}><h1>{content.name}</h1><p>Trang hiện chưa được xuất bản.</p></section>}
      <SiteFooter />
    </main>
  );
}
