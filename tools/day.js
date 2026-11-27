// TTB — a calendar day, read as a calendar day.
//
// `new Date('2026-12-25')` is NOT the 25th. The ECMAScript date-only form is
// parsed as UTC midnight, so a browser west of Greenwich is holding 24 December
// at 19:00 — and every date tool in TTB then asked that value for a day of the
// week, a month and a date, and answered about a day nobody typed. Measured
// before this module existed, in America/New_York: `Business days` counted
// Saturday 26 + Sunday 27 December as ONE business day, `Add/subtract date` put
// 15 January + 30 days on a Friday (it is a Saturday), `Chinese zodiac` read
// 1 January 2026 as the year 2025 and answered Snake instead of Horse, and
// `Anniversary tracker` moved a 14 February anniversary to the 13th.
//
// parseDay() reads a bare YYYY-MM-DD in the LOCAL calendar, so the day that was
// typed is the day that is used. A string with a time in it is still an instant
// and is still parsed as one.
export const parseDay = (s) => {
  const str = String(s ?? '').trim();
  const m = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (m) {
    const y = Number(m[1]), mo = Number(m[2]), d = Number(m[3]);
    const dt = new Date(y, mo - 1, d);
    // 2026-02-30 rolls forward to 2 March; a day that does not exist is refused
    // rather than silently answered with a different day.
    if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) return null;
    return dt;
  }
  const dt = new Date(str);
  return isNaN(dt) ? null : dt;
};

// The local calendar date of a Date, as YYYY-MM-DD. `toISOString().slice(0,10)`
// is the UTC date, which names tomorrow for a user west of Greenwich after 19:00
// — the same mistake in the other direction.
export const dayString = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
