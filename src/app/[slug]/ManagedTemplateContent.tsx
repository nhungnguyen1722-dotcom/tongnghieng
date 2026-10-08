"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import SiteFooter from "@/components/site/SiteFooter";
import SiteHeader from "@/components/site/SiteHeader";
import { defaultPageContent, hydratePageContent, homeSliderImages, readPageContent, type AdminPageContent } from "@/app/admin/page-data";

const textSnapshots = new WeakMap<HTMLElement, Map<string, { markup: string; value: string }>>();
const imageSnapshots = new WeakMap<HTMLImageElement, Map<string, { source: string; sourceSet: string | null; value: string }>>();
const linkSnapshots = new WeakMap<HTMLAnchorElement, { markup: string; href: string }>();

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
    snapshot = { source: image.src, sourceSet: image.getAttribute("srcset"), value: defaultValue ?? "" };
    snapshots.set(key, snapshot);
  }
  if (snapshot.value === value && !force) return;
  if (value === defaultValue) {
    if (snapshot.sourceSet) image.setAttribute("srcset", snapshot.sourceSet);
    else image.removeAttribute("srcset");
    image.src = snapshot.source || "";
  } else {
    image.removeAttribute("srcset");
    image.src = value || snapshot.source || "";
  }
  snapshot.value = value;
}

function syncSectionBody(element: HTMLElement, value: string | undefined, defaultValue: string | undefined, key: string) {
  if (value === undefined || value === defaultValue) return;
  const quote = element.querySelector<HTMLElement>("blockquote");
  if (quote) {
    syncText(quote, value, defaultValue, key);
    return;
  }

  const paragraphs = Array.from(element.querySelectorAll<HTMLElement>("p"));
  if (defaultValue !== undefined && paragraphs.length > 1) {
    const oldParts = defaultValue.split(/\n\s*\n/).filter(Boolean);
    const newParts = value.split(/\n\s*\n/).filter(Boolean);
    const bodyParagraphs = paragraphs.slice(1);
    newParts.forEach((part, index) => {
      let paragraph = bodyParagraphs[index];
      if (!paragraph) {
        paragraph = (bodyParagraphs.at(-1) ?? paragraphs[0]).cloneNode(false) as HTMLElement;
        paragraphs.at(-1)?.after(paragraph);
        bodyParagraphs.push(paragraph);
      }
      syncText(paragraph, part, oldParts[index], `${key}-${index}`);
    });
    bodyParagraphs.slice(newParts.length).forEach((paragraph) => paragraph.remove());
    return;
  }

  let body = element.querySelector<HTMLElement>("[data-admin-section-body]");
  if (!value) {
    body?.remove();
    return;
  }
  if (!body) {
    body = document.createElement("p");
    body.dataset.adminSectionBody = "true";
    body.style.cssText = "margin-top:1rem;white-space:pre-line";
    element.append(body);
  }
  body.textContent = value;
}

function syncSectionItems(element: HTMLElement, section: AdminPageContent["sections"][number], defaultSection: AdminPageContent["sections"][number] | undefined) {
  if (!section.items?.length) return;
  const cards = Array.from(element.querySelector<HTMLElement>(".grid")?.children ?? []).filter((child): child is HTMLElement => child instanceof HTMLElement);
  section.items.forEach((item, index) => {
    const card = cards[index];
    if (!card) return;
    const defaultItem = defaultSection?.items?.find((candidate) => candidate.id === item.id);
    const heading = card.querySelector<HTMLElement>("h3, h4, h5") ?? card.querySelector<HTMLElement>(":scope > div");
    syncText(heading, item.title, defaultItem?.title, `ItemTitle${section.id}${item.id}`);
    syncText(card.querySelector("p"), item.description, defaultItem?.description, `ItemDescription${section.id}${item.id}`);
  });
}

function syncSectionLink(element: HTMLElement, section: AdminPageContent["sections"][number], defaultSection: AdminPageContent["sections"][number] | undefined) {
  const link = element.querySelector<HTMLAnchorElement>("a");
  if (!link) return;
  let snapshot = linkSnapshots.get(link);
  if (!snapshot) {
    snapshot = { markup: link.innerHTML, href: link.getAttribute("href") ?? "" };
    linkSnapshots.set(link, snapshot);
  }
  const defaultLabel = defaultSection?.ctaLabel ?? link.textContent ?? "";
  const label = section.ctaLabel || defaultLabel;
  if (label !== defaultLabel) {
    const icon = link.querySelector("svg");
    link.replaceChildren(document.createTextNode(`${label} `), ...(icon ? [icon] : []));
  } else if (link.innerHTML !== snapshot.markup) link.innerHTML = snapshot.markup;

  const defaultHref = defaultSection?.ctaUrl ?? snapshot.href;
  const href = section.ctaUrl || defaultHref;
  if (href !== defaultHref) link.setAttribute("href", href);
  else if (link.getAttribute("href") !== snapshot.href) link.setAttribute("href", snapshot.href);
}

function applyManagedContent(root: HTMLElement, content: AdminPageContent, defaults: AdminPageContent | null, manageHero = true) {
  const defaultSlider = defaults?.sliders[0];
  const activeSlider = content.sliders.find((slider) => slider.enabled);
  const hero = root.querySelector<HTMLElement>(".hero-section, .hero") ?? root.querySelector<HTMLElement>("section");

  if (manageHero && hero && activeSlider) {
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
      element.style.cssText = "padding:4rem max(1.5rem,8vw);background:#06243D;color:#FFFFFF";
      const heading = document.createElement("h2");
      heading.style.cssText = "max-width:70rem;margin:0 auto 1rem;color:#D7A84A;font-size:clamp(1.5rem,3vw,2.5rem)";
      const description = document.createElement("p");
      description.style.cssText = "max-width:70rem;margin:0 auto;color:#F5F7F8;line-height:1.7;white-space:pre-line";
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

    syncSectionBody(element, section.body, defaultSection?.body, `SectionBody${section.id}`);
    syncSectionItems(element, section, defaultSection);
    syncSectionLink(element, section, defaultSection);
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

function setupTemplateSlider(root: HTMLElement, content: AdminPageContent, defaults: AdminPageContent | null) {
  const hero = root.querySelector<HTMLElement>(".hero-section");
  if (!hero) return;

  const panels = Array.from(hero.children).filter((child): child is HTMLElement =>
    child instanceof HTMLElement && Boolean(child.querySelector(":scope > img")),
  );
  const dots = Array.from(hero.querySelectorAll<HTMLButtonElement>('button[aria-label^="Chuyển đến Slide"]'));
  const controls = dots[0]?.parentElement;
  const arrows = Array.from(hero.querySelectorAll<HTMLButtonElement>('button[aria-label="Slide trước"], button[aria-label="Slide sau"]'));
  const initialPanelIndex = panels.findIndex((panel) => panel.getAttribute("aria-hidden") === "false" || panel.classList.contains("opacity-100"));

  const enabledSlides = content.sliders.filter((slide) => slide.enabled && slide.image);
  const slides = enabledSlides.map((slide, index) => {
    const defaultSlide = defaults?.sliders.find((item) => item.id === slide.id);
    const defaultIndex = defaults?.sliders.findIndex((item) => item.id === slide.id) ?? -1;
    const isUnchangedPlaceholder = defaultSlide?.image === slide.image
      && defaults?.sliders.every((item) => item.image === defaultSlide.image);
    if (!isUnchangedPlaceholder) return slide;
    return { ...slide, image: homeSliderImages[(defaultIndex >= 0 ? defaultIndex : index) % homeSliderImages.length] };
  });
  const slideCount = Math.min(slides.length, panels.length, dots.length);

  panels.forEach((panel, index) => {
    panel.hidden = index >= slideCount;
  });
  arrows.forEach((button) => {
    const isPrevious = button.getAttribute("aria-label") === "Slide trước";
    button.type = "button";
    button.hidden = slideCount <= 1;
    button.className = `top-slider-arrow ${isPrevious ? "top-slider-arrow-prev" : "top-slider-arrow-next"}`;
    button.setAttribute("aria-label", isPrevious ? "Slide trước" : "Slide sau");
  });
  dots.forEach((dot, index) => {
    dot.hidden = index >= slideCount;
    dot.type = "button";
    dot.className = "top-slider-dot";
    dot.setAttribute("aria-label", `Chuyển đến slide ${index + 1}`);
  });

  if (controls) {
    controls.className = "top-slider-controls";
    controls.hidden = slideCount <= 1;
    controls.setAttribute("role", "group");
    controls.setAttribute("aria-label", "Chọn banner đầu trang");
  }

  if (slideCount === 0) {
    panels.forEach((panel, index) => {
      panel.hidden = index > 0;
      panel.classList.toggle("opacity-100", index === 0);
      panel.classList.toggle("opacity-0", index > 0);
      panel.setAttribute("aria-hidden", String(index > 0));
    });
    return;
  }

  const heading = hero.querySelector("h1");
  const description = hero.querySelector("p");
  let activeIndex = 0;
  const showSlide = (index: number) => {
    activeIndex = (index + slideCount) % slideCount;
    for (let slideIndex = 0; slideIndex < slideCount; slideIndex += 1) {
      const isActive = slideIndex === activeIndex;
      const panel = panels[slideIndex];
      const image = panel.querySelector<HTMLImageElement>(":scope > img");
      if (image) {
        image.src = slides[slideIndex].image;
        image.alt = slides[slideIndex].title || content.name;
      }
      panel.classList.toggle("opacity-100", isActive);
      panel.classList.toggle("opacity-0", !isActive);
      panel.setAttribute("aria-hidden", String(!isActive));
      dots[slideIndex].setAttribute("aria-current", String(isActive));
    }

    const slide = slides[activeIndex];
    const initialSlide = slides[initialPanelIndex >= 0 && initialPanelIndex < slideCount ? initialPanelIndex : 0];
    const initialDefault = defaults?.sliders.find((item) => item.id === initialSlide.id) ?? defaults?.sliders[0];
    syncText(heading, slide.title, initialDefault?.title, "HeroTitle");
    syncText(description, slide.description, initialDefault?.description, "HeroDescription");
  };

  let timer: number | null = null;
  const restartTimer = () => {
    if (timer !== null) window.clearInterval(timer);
    timer = slideCount > 1 ? window.setInterval(() => showSlide(activeIndex + 1), 6000) : null;
  };

  const removeDotListeners = dots.slice(0, slideCount).map((dot, index) => {
    const onClick = () => {
      showSlide(index);
      restartTimer();
    };
    dot.addEventListener("click", onClick);
    return () => dot.removeEventListener("click", onClick);
  });

  const removeArrowListeners = arrows.map((button) => {
    const isPrevious = button.getAttribute("aria-label") === "Slide trước";
    const onClick = () => {
      showSlide(activeIndex + (isPrevious ? -1 : 1));
      restartTimer();
    };
    button.addEventListener("click", onClick);
    return () => button.removeEventListener("click", onClick);
  });

  showSlide(initialPanelIndex >= 0 && initialPanelIndex < slideCount ? initialPanelIndex : 0);
  restartTimer();

  return () => {
    if (timer !== null) window.clearInterval(timer);
    removeDotListeners.forEach((removeListener) => removeListener());
    removeArrowListeners.forEach((removeListener) => removeListener());
  };
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
    if (slug !== "doi-tac" || !rootRef.current) return;
    const root = rootRef.current;
    const filters = Array.from(root.querySelectorAll<HTMLButtonElement>("section button"));
    const cards = Array.from(root.querySelectorAll<HTMLElement>("section .grid > div"));
    const inactiveClasses = "border border-[#C9A227]/20 text-white/60 hover:text-[#C9A227] hover:border-[#C9A227]/40";
    const activeClasses = "bg-gradient-to-r from-[#C9A227] to-[#E8C84A] text-[#0D1B3E]";
    const selectFilter = (selected: HTMLButtonElement) => {
      const category = selected.textContent?.trim();
      filters.forEach((filter) => {
        const isActive = filter === selected;
        filter.className = `px-4 py-2 rounded-full text-sm font-medium transition-colors ${isActive ? activeClasses : inactiveClasses}`;
        filter.setAttribute("aria-pressed", String(isActive));
      });
      cards.forEach((card) => {
        const cardCategory = card.querySelector<HTMLElement>(":scope > div:last-child")?.textContent?.trim();
        const visible = category === "Tất cả" || cardCategory === category;
        card.hidden = !visible;
        card.style.display = visible ? "" : "none";
      });
    };
    const onClick = (event: MouseEvent) => {
      const button = (event.target as Element).closest("button");
      if (button && filters.includes(button)) selectFilter(button);
    };
    const initial = filters.find((filter) => filter.textContent?.trim() === "Tất cả") ?? filters[0];
    if (initial) selectFilter(initial);
    root.addEventListener("click", onClick);
    return () => root.removeEventListener("click", onClick);
  }, [slug, markup]);

  useEffect(() => {
    if (!rootRef.current) return;
    const hasTemplateSlider = slug === "gioi-thieu" || slug === "cong-nghe-ai" || slug === "cong-dong";
    applyManagedContent(rootRef.current, content, defaults, !hasTemplateSlider);
    if (hasTemplateSlider) {
      return setupTemplateSlider(rootRef.current, content, defaults);
    }
  }, [content, defaults, slug]);

  return (
    <main className="templateRoot" aria-label={content.name}>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <SiteHeader overHero={slug === "gioi-thieu" || slug === "cong-nghe-ai" || slug === "cong-dong"} />
      {content.active ? <div ref={rootRef} dangerouslySetInnerHTML={{ __html: markup }} /> : <section style={{ minHeight: "55vh", display: "grid", placeContent: "center", padding: "3rem 1.5rem", textAlign: "center" }}><h1>{content.name}</h1><p>Trang hiện chưa được xuất bản.</p></section>}
      <SiteFooter />
    </main>
  );
}
