"use client";

import {
  ArrowUpRight,
  Building2,
  CalendarDays,
  CloudSun,
  Moon,
  MoonStar,
  Sun,
  Sunrise,
  Sunset,
  UsersRound,
  X,
} from "lucide-react";
import { createPortal } from "react-dom";
import { type RefObject, useCallback, useEffect, useRef, useState } from "react";
import { MasjidBuildingPicture } from "@/components/MasjidBuildingPicture";
import {
  bcDateString,
  bcLongDate,
  formatPrayerTime,
  hijriDateParts,
  nextIqama,
  type PrayerStatus,
  type PrayerTimesRecord,
} from "@/lib/prayer-time";
import { SITE } from "@/lib/site";

const AWQAT_URL = process.env.NEXT_PUBLIC_AWQAT_SUPABASE_URL ?? "https://kjbutgbpddsadvnbgblg.supabase.co";
const AWQAT_KEY =
  process.env.NEXT_PUBLIC_AWQAT_SUPABASE_ANON_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtqYnV0Z2JwZGRzYWR2bmJnYmxnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc3NjQ1NjMsImV4cCI6MjA1MzM0MDU2M30.giaKfNM-hUj2UCrC_ZBUjamv9vFkhP7TORF5xkzyL4Y";
const AWQAT_MASJID_ID =
  process.env.NEXT_PUBLIC_AWQAT_MASJID_ID ?? "96ac3382-aef7-4710-a187-7002ba7f4323";

async function fetchPrayerTimes(signal: AbortSignal): Promise<PrayerTimesRecord | null> {
  if (!AWQAT_KEY) return null;
  const params = new URLSearchParams({
    select:
      "prayer_date,fajr_azan,sunrise,dhuhr_azan,asr_azan,maghrib_azan,isha_azan,fajr_iqamah,dhuhr_iqamah,asr_iqamah,maghrib_iqamah,isha_iqamah,jumah_time_1,jumah_time_2,jumah_time_3",
    organization_id: `eq.${AWQAT_MASJID_ID}`,
    prayer_date: `eq.${bcDateString()}`,
  });
  const response = await fetch(`${AWQAT_URL}/rest/v1/daily_prayer_times?${params}`, {
    headers: { apikey: AWQAT_KEY, Authorization: `Bearer ${AWQAT_KEY}` },
    signal,
  });
  if (!response.ok) throw new Error(`Awqat request failed with status ${response.status}`);
  const payload: unknown = await response.json();
  return Array.isArray(payload) && payload.length ? (payload[0] as PrayerTimesRecord) : null;
}

function MonthlyPrayerTimesModal({
  open,
  onClose,
  returnFocusRef,
}: {
  open: boolean;
  onClose: () => void;
  returnFocusRef: RefObject<HTMLButtonElement | null>;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    const dialog = dialogRef.current;
    const returnFocusElement = returnFocusRef.current;
    const background = Array.from(document.body.children).filter(
      (element): element is HTMLElement => element instanceof HTMLElement && element !== dialog,
    );
    const previousInert = new Map(background.map((element) => [element, element.inert]));
    const handleKeys = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !dialog) return;
      const focusable = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => !element.hidden && element.getClientRects().length > 0);
      if (!focusable.length) {
        event.preventDefault();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.body.style.overflow = "hidden";
    background.forEach((element) => {
      element.inert = true;
    });
    window.addEventListener("keydown", handleKeys);
    return () => {
      document.body.style.overflow = previousOverflow;
      background.forEach((element) => {
        element.inert = previousInert.get(element) ?? false;
      });
      window.removeEventListener("keydown", handleKeys);
      window.requestAnimationFrame(() => {
        if (returnFocusElement?.isConnected) returnFocusElement.focus();
      });
    };
  }, [onClose, open, returnFocusRef]);

  if (!open) return null;
  return createPortal(
    <div ref={dialogRef} className="monthly-modal" role="dialog" aria-modal="true" aria-labelledby="monthly-modal-title">
      <button className="monthly-modal__backdrop" type="button" onClick={onClose} aria-label="Close monthly prayer times" />
      <div className="monthly-modal__panel">
        <div className="monthly-modal__header">
          <div>
            <p>Guildford Islamic Cultural Center</p>
            <h2 id="monthly-modal-title">Monthly Prayer Times</h2>
          </div>
          <a
            className="monthly-modal__external-link"
            href={SITE.monthlyPrayerUrl}
            target="_blank"
            rel="noreferrer"
          >
            Open monthly prayer times in a new tab
          </a>
          <button type="button" onClick={onClose} aria-label="Close monthly prayer times" autoFocus><X aria-hidden="true" /></button>
        </div>
        <iframe src={SITE.monthlyPrayerUrl} title="GICC monthly prayer times" tabIndex={-1} />
      </div>
    </div>,
    document.body,
  );
}

function PrayerTimesExperience({ showHero }: { showHero: boolean }) {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimesRecord | null>(null);
  const [status, setStatus] = useState<PrayerStatus>(AWQAT_KEY ? "loading" : "unconfigured");
  const [showMonthly, setShowMonthly] = useState(false);
  const [now, setNow] = useState<Date | null>(null);
  const monthlyButtonRef = useRef<HTMLButtonElement>(null);
  const hijri = now ? hijriDateParts(now) : null;

  useEffect(() => {
    const updateClock = () => setNow(new Date());
    updateClock();
    const interval = window.setInterval(updateClock, 60 * 1000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!AWQAT_KEY) return;
    let active = true;
    let controller = new AbortController();
    const load = async () => {
      controller.abort();
      controller = new AbortController();
      try {
        const data = await fetchPrayerTimes(controller.signal);
        if (!active) return;
        setPrayerTimes(data);
        setStatus(data ? "ready" : "empty");
      } catch (error) {
        if (!active || (error instanceof DOMException && error.name === "AbortError")) return;
        console.error("Unable to load GICC prayer times", error);
        setStatus("error");
      }
    };
    void load();
    const interval = window.setInterval(load, 15 * 60 * 1000);
    return () => {
      active = false;
      controller.abort();
      window.clearInterval(interval);
    };
  }, []);

  const closeMonthly = useCallback(() => setShowMonthly(false), []);
  const prayers = [
    { name: "Fajr", arabic: "الفجر", Icon: Sunrise, start: prayerTimes?.fajr_azan, iqama: prayerTimes?.fajr_iqamah },
    { name: "Dhuhr", arabic: "الظهر", Icon: Sun, start: prayerTimes?.dhuhr_azan, iqama: prayerTimes?.dhuhr_iqamah },
    { name: "Asr", arabic: "العصر", Icon: CloudSun, start: prayerTimes?.asr_azan, iqama: prayerTimes?.asr_iqamah },
    { name: "Maghrib", arabic: "المغرب", Icon: Sunset, start: prayerTimes?.maghrib_azan, iqama: prayerTimes?.maghrib_iqamah },
    { name: "Isha", arabic: "العشاء", Icon: Moon, start: prayerTimes?.isha_azan, iqama: prayerTimes?.isha_iqamah },
  ];
  const jumuahs = [
    { name: "Jumu'ah 1", audience: "Brothers only", time: prayerTimes?.jumah_time_1 },
    { name: "Jumu'ah 2", audience: "Brothers & Sisters", time: prayerTimes?.jumah_time_2 },
    { name: "Jumu'ah 3", audience: "Brothers & Sisters", time: prayerTimes?.jumah_time_3 },
  ];

  return (
    <>
      {showHero ? (
        <section className="hero" aria-labelledby="home-heading">
          <MasjidBuildingPicture className="hero__media" alt="The Guildford neighbourhood that GICC serves in Surrey, BC" priority />
          <div className="hero__veil" aria-hidden="true" />
          <div className="hero__content">
            <p className="hero__kicker">As-Salaamu Alaykum, welcome.</p>
            <h1 id="home-heading">Guildford Islamic Cultural Center</h1>
            <p className="hero__lede">A spiritual home for daily prayer, Islamic learning, family programs, and community service in Guildford.</p>
            <div className="hero__actions">
              <a className="button button--gold" href="/calendar/"><CalendarDays aria-hidden="true" /> View weekly events</a>
              <a className="button button--blue" href="https://surreyislamiccenter.com/" target="_blank" rel="noreferrer"><Building2 aria-hidden="true" /> New Islamic Center</a>
            </div>
          </div>
          <dl className="hero__status">
            <div><dt>Next Iqama</dt><dd>{nextIqama(prayerTimes, status, now ?? new Date())}</dd></div>
            <div><dt>Jumu&apos;ah</dt><dd>{formatPrayerTime(prayerTimes?.jumah_time_1)}</dd></div>
            <div><dt>Calendar</dt><dd>Live</dd></div>
          </dl>
        </section>
      ) : null}

      <section id="prayer-times" className="prayer-section" aria-labelledby="prayer-heading">
        <div className="prayer-pattern" aria-hidden="true" />
        <div className="shell prayer-content">
          <div className="prayer-heading-row">
            <div className="prayer-heading-copy">
              <p className="prayer-arabic" lang="ar" dir="rtl">أوقات الصلاة</p>
              <h2 id="prayer-heading">Prayer Times</h2>
              <button ref={monthlyButtonRef} className="button button--gold prayer-download" type="button" onClick={() => setShowMonthly(true)}>
                <CalendarDays aria-hidden="true" /> Monthly Prayer Times
              </button>
            </div>
            <div className="date-stack">
              {hijri ? <p className="hijri-date"><span>{hijri.label}</span><small>{hijri.era}</small></p> : null}
              <p>{now ? bcLongDate(now) : "\u00a0"}</p>
            </div>
          </div>

          <div className="prayer-grid" aria-live="polite" aria-busy={status === "loading"}>
            {prayers.map(({ name, arabic, Icon, start, iqama }) => (
              <article className="prayer-card" key={name}>
                <div className="prayer-card__top"><span lang="ar">{arabic}</span><i><Icon aria-hidden="true" /></i></div>
                <h3>{name}</h3>
                <dl>
                  <div><dt>Start</dt><dd>{formatPrayerTime(start)}</dd></div>
                  <div><dt>Iqama</dt><dd>{formatPrayerTime(iqama)}</dd></div>
                </dl>
              </article>
            ))}
          </div>

          <div className="jumuah-heading"><span /><h3>Friday Jumu&apos;ah</h3><span /></div>
          <div className="jumuah-grid">
            {jumuahs.map(({ name, audience, time }) => (
              <article className="jumuah-card" key={name}>
                <div className="jumuah-card__top"><span lang="ar">الجمعة</span><i><MoonStar aria-hidden="true" /></i></div>
                <h4>{name}</h4>
                <p><UsersRound aria-hidden="true" /> {audience}</p>
                <strong>{formatPrayerTime(time)}</strong>
              </article>
            ))}
          </div>

          <a className="source-link" href={SITE.awqatUrl} target="_blank" rel="noreferrer">
            {status === "ready"
              ? "Times synced live from Awqat"
              : status === "loading"
                ? "Loading prayer times from Awqat"
                : "Open prayer times on Awqat"}
            <ArrowUpRight aria-hidden="true" />
          </a>
        </div>
      </section>
      <MonthlyPrayerTimesModal open={showMonthly} onClose={closeMonthly} returnFocusRef={monthlyButtonRef} />
    </>
  );
}

export function HomePrayerExperience() {
  return <PrayerTimesExperience showHero />;
}

export function PrayerTimesPageExperience() {
  return <PrayerTimesExperience showHero={false} />;
}
