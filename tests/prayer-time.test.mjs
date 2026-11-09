import assert from "node:assert/strict";
import test from "node:test";
import {
  bcDateString,
  bcLongDate,
  currentBcMinutes,
  formatPrayerTime,
  hijriDateParts,
  nextIqama,
  zawalTime,
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

test("Zawal is ten wall-clock minutes before Dhuhr", () => {
  assert.equal(zawalTime("12:59:00"), "12:49");
  assert.equal(formatPrayerTime(zawalTime("12:59:00")), "12:49 PM");
  assert.equal(zawalTime("13:05:00"), "12:55");
  assert.equal(zawalTime("00:05:00"), "23:55");
  assert.equal(zawalTime("9:05"), "08:55");
});

test("Zawal rejects missing and invalid Awqat times", () => {
  for (const value of [null, undefined, "", "   ", "invalid", "24:00:00", "12:60:00", "12:00:60", "abc12:59"]) {
    assert.equal(zawalTime(value), null);
    assert.equal(formatPrayerTime(zawalTime(value)), "-");
  }
});

test("Awqat sunrise and Zawal follow the selected BC daily record at midnight", () => {
  const records = [
    { prayer_date: "2026-11-09", sunrise: "08:12:00", dhuhr_azan: "12:59:00" },
    { prayer_date: "2026-11-10", dhuhr_azan: "12:59:00" },
  ];
  assert.equal(formatPrayerTime(records[0].sunrise), "8:12 AM");
  for (const [instant, expectedDate] of [
    ["2026-11-10T06:59:00Z", "2026-11-09"],
    ["2026-11-10T07:00:00Z", "2026-11-10"],
  ]) {
    const date = bcDateString(new Date(instant));
    assert.equal(date, expectedDate);
    const record = records.find((row) => row.prayer_date === date);
    assert.ok(record);
    assert.equal(zawalTime(record.dhuhr_azan), "12:49");
  }
});
