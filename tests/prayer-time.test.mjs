import assert from "node:assert/strict";
import test from "node:test";
import {
  bcDateString,
  bcLongDate,
  currentBcMinutes,
  formatPrayerTime,
  hijriDateParts,
  nextIqama,
} from "../lib/prayer-time.ts";

test("BC prayer clock stays on UTC-7 in November", () => {
  const now = new Date("2026-11-06T20:00:00Z");
  assert.equal(bcDateString(now), "2026-11-06");
  assert.equal(currentBcMinutes(now), 13 * 60);
});

test("BC date rolls over at 07:00 UTC", () => {
  const before = new Date("2026-11-07T06:30:00Z");
  const after = new Date("2026-11-07T07:30:00Z");
  assert.equal(bcDateString(before), "2026-11-06");
  assert.equal(bcDateString(after), "2026-11-07");
  assert.equal(currentBcMinutes(before), 23 * 60 + 30);
  assert.equal(currentBcMinutes(after), 30);
  assert.match(bcLongDate(after), /Saturday, November 7/);
  assert.deepEqual(hijriDateParts(after), hijriDateParts(new Date("2026-11-07T20:00:00Z")));
  assert.notDeepEqual(hijriDateParts(before), hijriDateParts(after));
});

test("historical dates retain Vancouver winter time before permanent Pacific Time", () => {
  assert.equal(currentBcMinutes(new Date("2026-03-08T09:30:00Z")), 90);
  assert.equal(currentBcMinutes(new Date("2026-03-08T10:00:00Z")), 180);
});

test("next iqama after Dhuhr is Asr using the BC clock", () => {
  const times = {
    fajr_iqamah: "06:40:00",
    dhuhr_iqamah: "13:40:00",
    asr_iqamah: "16:00:00",
    maghrib_iqamah: "17:50:00",
    isha_iqamah: "20:00:00",
  };
  assert.equal(nextIqama(times, "ready", new Date("2026-11-06T21:00:00Z")), "Asr 4:00 PM");
});

test("Awqat wall-clock strings are formatted without shifting", () => {
  assert.equal(formatPrayerTime("17:45:00"), "5:45 PM");
});
