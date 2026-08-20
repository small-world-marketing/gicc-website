"use client";

import { HeartHandshake, Mail, MapPin, Menu, Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { PRIMARY_NAV, SITE } from "@/lib/site";

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  return (
    <header className="site-header">
      <div className="utility-bar">
        <div className="shell utility-bar__inner">
          <a className="utility-bar__address" href={SITE.mapsUrl} target="_blank" rel="noreferrer">
            <MapPin aria-hidden="true" />
            <span className="utility-bar__address-full">{SITE.addressLine}, Surrey, BC</span>
            <span className="utility-bar__address-short">Surrey, BC</span>
          </a>
          <a href={SITE.phoneHref}><Phone aria-hidden="true" /> {SITE.phoneDisplay}</a>
          <a className="utility-bar__email" href={`mailto:${SITE.email}`}><Mail aria-hidden="true" /> {SITE.email}</a>
        </div>
      </div>
      <div className="nav-bar">
        <div className="shell nav-bar__inner">
          <Link className="brand" href="/" aria-label={`${SITE.name} home`}>
            <Image
              src="/images/gicc-logo-white.webp"
              alt=""
              width={320}
              height={180}
              priority
            />
          </Link>
          <button
            className="menu-button"
            type="button"
            aria-expanded={open}
            aria-controls="primary-navigation"
            aria-label={open ? "Close navigation" : "Open navigation"}
            onClick={() => setOpen((current) => !current)}
          >
            <Menu aria-hidden="true" />
          </button>
          <nav
            id="primary-navigation"
            className={`primary-nav${open ? " primary-nav--open" : ""}`}
            aria-label="Primary navigation"
          >
            {PRIMARY_NAV.map((item) =>
              "external" in item && item.external ? (
                <a
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </a>
              ) : (
                <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>
                  {item.label}
                </Link>
              ),
            )}
            <Link className="nav-donate" href="/donate/" onClick={() => setOpen(false)}>
              <HeartHandshake aria-hidden="true" /> Donate
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
