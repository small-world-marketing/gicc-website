interface D1Result<T = unknown> {
  results?: T[];
  success: boolean;
}

interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  run<T = unknown>(): Promise<D1Result<T>>;
}

interface D1Database {
  prepare(query: string): D1PreparedStatement;
}

interface R2Bucket {
  put(key: string, value: ArrayBuffer, options?: { httpMetadata?: { contentType?: string } }): Promise<unknown>;
  delete(key: string): Promise<void>;
}

interface Env {
  BOOKINGS_DB?: D1Database;
  BOOKING_FILES?: R2Bucket;
  MAILERSEND_API_TOKEN?: string;
  LEAD_RECIPIENT?: string;
  MAIL_FROM?: string;
  MAIL_FROM_NAME?: string;
  TURNSTILE_SECRET_KEY?: string;
}

type EventContext = {
  request: Request & { cf?: Record<string, unknown> };
  env: Env;
};

const REQUEST_TYPES = ["recurring-program", "one-time-rental", "nikah", "condolence"];
const LOCATIONS = ["masjid", "yec", "no-preference"];
const ATTENDEES = ["male", "female", "both"];
const DURATIONS = [60, 90, 120, 180, 240, 300];
const ALLOWED_FILE_TYPES = ["application/pdf", "image/jpeg", "image/png"];
const MAX_FILE_BYTES = 5 * 1024 * 1024;
const MAX_REQUEST_BYTES = 6 * 1024 * 1024;

const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });

const textField = (form: FormData, key: string, max: number, required = true) => {
  const value = form.get(key);
  if (typeof value !== "string") {
    if (required) throw new ValidationError(`${key} is required.`);
    return "";
  }
  const trimmed = value.trim();
  if (required && !trimmed) throw new ValidationError(`${key} is required.`);
  if (trimmed.length > max) throw new ValidationError(`${key} is too long.`);
  return trimmed;
};

class ValidationError extends Error {}

const escapeHtml = (value: string) =>
  value.replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;",
  })[character] ?? character);

const humanize = (value: string) =>
  value.replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

const todayInVancouver = () => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Vancouver",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
};

const sha256 = async (value: string) => {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
};

const base64 = (buffer: ArrayBuffer) => {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunk = 0x8000;
  for (let index = 0; index < bytes.length; index += chunk) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunk));
  }
  return btoa(binary);
};

const verifyTurnstile = async (secret: string, token: string, remoteip: string) => {
  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ secret, response: token, remoteip }),
  });
  if (!response.ok) return false;
  const result = (await response.json()) as { success?: boolean };
  return result.success === true;
};

const classifyLeadSource = (raw: string) => {
  try {
    const value = JSON.parse(raw) as { params?: Record<string, string>; referrer?: string };
    const params = value.params ?? {};
    if (params.gclid || params.gbraid || params.wbraid) return "Google Ads";
    if (params.fbclid) return "Meta Ads";
    if (params.msclkid) return "Microsoft Ads";
    if (params.utm_source) return `${params.utm_source}${params.utm_medium ? ` / ${params.utm_medium}` : ""}`;
    if (value.referrer) return `Referral: ${new URL(value.referrer).hostname}`;
  } catch {
    return "Direct / unknown";
  }
  return "Direct / unknown";
};

const sendNotification = async ({
  env,
  fields,
  reference,
  attachment,
  cf,
}: {
  env: Env;
  fields: Record<string, string>;
  reference: string;
  attachment?: { buffer: ArrayBuffer; filename: string };
  cf: Record<string, unknown>;
}) => {
  if (!env.MAILERSEND_API_TOKEN) return { status: "skipped" as const, error: "MAILERSEND_API_TOKEN is not configured" };
  const recipient = env.LEAD_RECIPIENT ?? "secretary@giccmasjid.org";
  const from = env.MAIL_FROM ?? "notify@smallworld.ca";
  const fromName = env.MAIL_FROM_NAME ?? "GICC Website";
  const leadSource = classifyLeadSource(fields.attribution);
  const rows = [
    ["Reference", reference], ["Request type", humanize(fields.request_type)], ["Event details", fields.event_details],
    ["Requested date", fields.requested_date], ["Start time", fields.start_time], ["Duration", `${fields.duration_minutes} minutes`],
    ["Location", humanize(fields.location_preference)], ["Alternate date", fields.alternate_date || "—"], ["Recurrence", fields.recurrence || "—"],
    ["Attendees", humanize(fields.attendees)], ["Expected participants", fields.expected_participants], ["Participant fee", fields.fees_charged === "yes" ? `$${fields.fee_amount} CAD per person` : "No"],
    ["Lead person", fields.full_name], ["Email", fields.email], ["Phone", fields.phone], ["Qualifications", fields.qualifications],
    ["Electronic signature", fields.signature], ["Lead source", leadSource], ["Country", String(cf.country ?? "—")],
    ["Region", String(cf.region ?? "—")], ["City", String(cf.city ?? "—")], ["Timezone", String(cf.timezone ?? "—")], ["ASN", String(cf.asn ?? "—")],
  ];
  const text = rows.map(([label, value]) => `${label}: ${value}`).join("\n\n");
  const html = `<h1>New GICC space request</h1><p><strong>${escapeHtml(reference)}</strong></p><table cellpadding="8" cellspacing="0" border="1" style="border-collapse:collapse">${rows.map(([label, value]) => `<tr><th align="left">${escapeHtml(label)}</th><td>${escapeHtml(value).replace(/\n/g, "<br>")}</td></tr>`).join("")}</table>`;
  const payload: Record<string, unknown> = {
    from: { email: from, name: fromName },
    to: [{ email: recipient }],
    reply_to: { email: fields.email, name: fields.full_name },
    subject: `[${reference}] ${humanize(fields.request_type)} space request`,
    text,
    html,
  };
  if (attachment) {
    payload.attachments = [{ content: base64(attachment.buffer), filename: attachment.filename, disposition: "attachment" }];
  }
  const response = await fetch("https://api.mailersend.com/v1/email", {
    method: "POST",
    headers: { Authorization: `Bearer ${env.MAILERSEND_API_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) return { status: "failed" as const, error: `MailerSend returned ${response.status}` };
  return { status: "sent" as const, error: "" };
};

// --- CMS lead mirror (cms.smallworld.ca) -----------------------------------
// Best-effort copy of a delivered lead into the SWM CMS. Runs only after the
// email has been handed to MailerSend, times out after 4s and never throws,
// so it can never block or change the email delivery or the form response.
// Disabled unless CMS_LEAD_INGEST_URL and CMS_LEAD_TOKEN are set in Pages env.
type CmsLeadMirror = {
  name?: string
  phone?: string
  email?: string
  service?: string
  details?: string
  requestId?: string
  smsConsent?: boolean
  attribution?: Record<string, unknown>
}

async function mirrorLeadToCms(env: unknown, lead: CmsLeadMirror): Promise<void> {
  const vars = (env || {}) as Record<string, unknown>
  const url = typeof vars.CMS_LEAD_INGEST_URL === 'string' ? vars.CMS_LEAD_INGEST_URL.trim() : ''
  const rawToken = vars.CMS_LEAD_TOKEN || vars.PAYLOAD_BUILD_TOKEN
  const token = typeof rawToken === 'string' ? rawToken.trim() : ''
  if (!url || !token) return
  const clip = (value: unknown, max: number) => (typeof value === 'string' ? value.trim().slice(0, max) : '')
  const email = clip(lead.email, 254)
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : ''
  const body: Record<string, unknown> = {
    name: clip(lead.name, 100) || validEmail.slice(0, 100) || '(not provided)',
    phone: clip(lead.phone, 40) || '(not provided)',
  }
  if (validEmail) body.email = validEmail
  if (clip(lead.service, 200)) body.service = clip(lead.service, 200)
  if (clip(lead.details, 2000)) body.details = clip(lead.details, 2000)
  if (clip(lead.requestId, 200)) body.requestId = clip(lead.requestId, 200)
  if (typeof lead.smsConsent === 'boolean') body.smsConsent = lead.smsConsent
  if (lead.attribution && typeof lead.attribution === 'object') body.attribution = lead.attribution
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(4000),
    })
    if (!response.ok) console.warn(JSON.stringify({ event: 'lead_cms_store_failed', requestId: body.requestId, status: response.status }))
  } catch (error) {
    console.warn(JSON.stringify({ event: 'lead_cms_store_failed', requestId: body.requestId, reason: error instanceof Error ? error.name : 'request_failed' }))
  }
}
// ---------------------------------------------------------------------------

export const onRequestPost = async ({ request, env }: EventContext) => {
  const requestUrl = new URL(request.url);
  const origin = request.headers.get("Origin");
  if (origin && origin !== requestUrl.origin) return json({ error: "Cross-site submissions are not allowed." }, 403);
  if (!request.headers.get("Content-Type")?.startsWith("multipart/form-data")) {
    return json({ error: "The form submission format was invalid." }, 415);
  }
  const contentLength = Number(request.headers.get("Content-Length") ?? 0);
  if (contentLength > MAX_REQUEST_BYTES) return json({ error: "The uploaded file is too large." }, 413);
  if (!env.BOOKINGS_DB) return json({ error: "The request service is not configured yet." }, 503);

  const ip = request.headers.get("CF-Connecting-IP") ?? "unknown";
  const ipHash = await sha256(ip);
  const windowStart = Math.floor(Date.now() / (15 * 60 * 1000));
  try {
    await env.BOOKINGS_DB.prepare(
      "DELETE FROM event_request_rate_limits WHERE window_start < ?",
    ).bind(windowStart - 96).run();
    const rate = await env.BOOKINGS_DB.prepare(
      "INSERT INTO event_request_rate_limits (ip_hash, window_start, attempts) VALUES (?, ?, 1) ON CONFLICT(ip_hash, window_start) DO UPDATE SET attempts = attempts + 1 RETURNING attempts",
    ).bind(ipHash, windowStart).first<{ attempts: number }>();
    if ((rate?.attempts ?? 1) > 5) return json({ error: "Too many requests. Please wait 15 minutes and try again." }, 429);
  } catch (error) {
    console.error("event_request_rate_limit_failed", { message: error instanceof Error ? error.message : "Unknown error" });
    return json({ error: "The request service is not ready yet." }, 503);
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return json({ error: "The form submission could not be read." }, 400);
  }

  if (textField(form, "website", 200, false)) return json({ reference: "GICC-RECEIVED" });

  try {
    const fields = {
      request_type: textField(form, "request_type", 40), event_details: textField(form, "event_details", 4000),
      requested_date: textField(form, "requested_date", 10), start_time: textField(form, "start_time", 5),
      duration_minutes: textField(form, "duration_minutes", 4), location_preference: textField(form, "location_preference", 40),
      alternate_date: textField(form, "alternate_date", 10, false), recurrence: textField(form, "recurrence", 300, false),
      attendees: textField(form, "attendees", 20), expected_participants: textField(form, "expected_participants", 5),
      fees_charged: textField(form, "fees_charged", 3), fee_amount: textField(form, "fee_amount", 20, false),
      full_name: textField(form, "full_name", 150), email: textField(form, "email", 254).toLowerCase(),
      phone: textField(form, "phone", 30), request_date: textField(form, "request_date", 10),
      qualifications: textField(form, "qualifications", 3000), signature: textField(form, "signature", 150),
      liability_acknowledged: textField(form, "liability_acknowledged", 3), terms_accepted: textField(form, "terms_accepted", 3),
      accuracy_confirmed: textField(form, "accuracy_confirmed", 3), attribution: textField(form, "attribution", 12000, false),
    };

    const duration = Number(fields.duration_minutes);
    const participants = Number(fields.expected_participants);
    const feeAmount = fields.fee_amount ? Number(fields.fee_amount) : null;
    if (!REQUEST_TYPES.includes(fields.request_type)) throw new ValidationError("Select a valid request type.");
    if (!LOCATIONS.includes(fields.location_preference)) throw new ValidationError("Select a valid location.");
    if (!ATTENDEES.includes(fields.attendees)) throw new ValidationError("Select valid attendees.");
    if (!DURATIONS.includes(duration)) throw new ValidationError("Select a valid duration.");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fields.requested_date) || fields.requested_date < todayInVancouver()) throw new ValidationError("Select a valid future date.");
    if (fields.alternate_date && !/^\d{4}-\d{2}-\d{2}$/.test(fields.alternate_date)) throw new ValidationError("Select a valid alternate date.");
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(fields.start_time)) throw new ValidationError("Select a valid start time.");
    if (!Number.isInteger(participants) || participants < 1 || participants > 1000) throw new ValidationError("Enter a valid participant count.");
    if (fields.request_type === "recurring-program" && !fields.recurrence) throw new ValidationError("Describe the requested recurrence.");
    if (fields.fees_charged === "yes" && (!Number.isFinite(feeAmount) || (feeAmount ?? -1) < 0 || (feeAmount ?? 0) > 10000)) throw new ValidationError("Enter a valid fee amount.");
    if (!/^\S+@\S+\.\S+$/.test(fields.email)) throw new ValidationError("Enter a valid email address.");
    if ([fields.liability_acknowledged, fields.terms_accepted, fields.accuracy_confirmed].some((value) => value !== "yes")) throw new ValidationError("All acknowledgements are required.");

    if (env.TURNSTILE_SECRET_KEY) {
      const token = textField(form, "cf-turnstile-response", 3000);
      if (!(await verifyTurnstile(env.TURNSTILE_SECRET_KEY, token, ip))) throw new ValidationError("Spam verification failed. Please try again.");
    }

    const fileValue = form.get("certification");
    const certification = fileValue instanceof File && fileValue.size > 0 ? fileValue : null;
    if (certification && (!ALLOWED_FILE_TYPES.includes(certification.type) || certification.size > MAX_FILE_BYTES)) throw new ValidationError("The certification file must be a PDF, JPG, or PNG up to 5 MB.");
    if (certification && !env.BOOKING_FILES) return json({ error: "File storage is temporarily unavailable." }, 503);

    const id = crypto.randomUUID();
    const reference = `GICC-${fields.requested_date.replaceAll("-", "")}-${id.slice(0, 8).toUpperCase()}`;
    const extension = certification?.type === "application/pdf" ? "pdf" : certification?.type === "image/png" ? "png" : "jpg";
    const certificationPath = certification ? `event-requests/${id}/certification.${extension}` : "";
    const fileBuffer = certification ? await certification.arrayBuffer() : undefined;
    if (certification && fileBuffer && env.BOOKING_FILES) {
      await env.BOOKING_FILES.put(certificationPath, fileBuffer, { httpMetadata: { contentType: certification.type } });
    }

    const cf = request.cf ?? {};
    try {
      await env.BOOKINGS_DB.prepare(
        `INSERT INTO event_requests (
          id, reference, request_type, event_details, requested_date, start_time, duration_minutes,
          location_preference, alternate_date, recurrence, attendees, expected_participants, fees_charged,
          fee_amount_cad, full_name, email, phone, request_date, qualifications, certification_path,
          certification_filename, liability_acknowledged, terms_accepted, accuracy_confirmed, signature,
          terms_version, attribution_json, ip_hash, country, region, city, timezone, asn, user_agent
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ).bind(
        id, reference, fields.request_type, fields.event_details, fields.requested_date, fields.start_time, duration,
        fields.location_preference, fields.alternate_date || null, fields.recurrence || null, fields.attendees, participants,
        fields.fees_charged === "yes" ? 1 : 0, feeAmount, fields.full_name, fields.email, fields.phone, fields.request_date,
        fields.qualifications, certificationPath || null, certification?.name ?? null, 1, 1, 1, fields.signature,
        "2026-07-14", fields.attribution || null, ipHash, cf.country ?? null, cf.region ?? null, cf.city ?? null, cf.timezone ?? null,
        cf.asn ?? null, request.headers.get("User-Agent")?.slice(0, 1000) ?? null,
      ).run();
    } catch (error) {
      if (certificationPath && env.BOOKING_FILES) await env.BOOKING_FILES.delete(certificationPath);
      throw error;
    }

    const notification = await sendNotification({
      env, fields, reference, cf,
      attachment: certification && fileBuffer ? { buffer: fileBuffer, filename: certification.name } : undefined,
    });
    await env.BOOKINGS_DB.prepare(
      "UPDATE event_requests SET notification_status = ?, notification_error = ? WHERE id = ?",
    ).bind(notification.status, notification.error.slice(0, 500) || null, id).run();

    await mirrorLeadToCms(env, { name: fields.full_name, phone: fields.phone, email: fields.email, service: `Event request: ${fields.request_type}`, details: [`Reference: ${reference}`, `Requested: ${fields.requested_date} ${fields.start_time} (${fields.duration_minutes} min)`, `Location: ${fields.location_preference}`, `Attendees: ${fields.attendees}, expected participants: ${fields.expected_participants}`, fields.recurrence && `Recurrence: ${fields.recurrence}`, `Fees charged: ${fields.fees_charged}${fields.fee_amount ? ` ($${fields.fee_amount})` : ""}`, "", fields.event_details].filter((line): line is string => typeof line === "string").join("\n"), requestId: reference });
    console.info("event_request_received", { reference, notification: notification.status });
    return json({ reference }, 201);
  } catch (error) {
    if (error instanceof ValidationError) return json({ error: error.message }, 400);
    console.error("event_request_failed", { message: error instanceof Error ? error.message : "Unknown error" });
    return json({ error: "We could not save the request. Please try again." }, 500);
  }
};
