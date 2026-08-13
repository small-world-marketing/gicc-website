"use client";

import { ArrowLeft, ArrowRight, CheckCircle2, FileUp, LoaderCircle } from "lucide-react";
import Link from "next/link";
import Script from "next/script";
import { FormEvent, useEffect, useRef, useState } from "react";
import { getAttributionPayload } from "@/lib/attribution";
import { SITE } from "@/lib/site";

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const ALLOWED_FILE_TYPES = ["application/pdf", "image/jpeg", "image/png"];
const DEFAULT_TURNSTILE_SITE_KEY = "0x4AAAAAAD7DLiPQSJ1L7cRS";

type SubmitState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success"; reference: string }
  | { status: "error"; message: string };

function vancouverToday() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Vancouver",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export function EventRequestForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const stepHeadingRefs = useRef<Array<HTMLHeadingElement | null>>([]);
  const successHeadingRef = useRef<HTMLHeadingElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const hasNavigatedRef = useRef(false);
  const [step, setStep] = useState(1);
  const [requestType, setRequestType] = useState("recurring-program");
  const [chargesFees, setChargesFees] = useState("no");
  const [fileError, setFileError] = useState("");
  const [submitState, setSubmitState] = useState<SubmitState>({ status: "idle" });
  const [minDate] = useState(vancouverToday);
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? DEFAULT_TURNSTILE_SITE_KEY;

  useEffect(() => {
    if (!hasNavigatedRef.current) return;
    const heading = stepHeadingRefs.current[step - 1];
    heading?.focus({ preventScroll: true });
    heading?.scrollIntoView({
      block: "start",
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    });
  }, [step]);

  useEffect(() => {
    if (submitState.status === "success") {
      successHeadingRef.current?.focus({ preventScroll: true });
      window.scrollTo({
        top: 0,
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      });
      return;
    }
    if (submitState.status === "error") errorRef.current?.focus();
  }, [submitState.status]);

  const validateStep = (stepNumber: number) => {
    const fieldset = formRef.current?.querySelector<HTMLFieldSetElement>(`[data-step="${stepNumber}"]`);
    if (!fieldset) return false;
    const controls = Array.from(fieldset.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>("input, select, textarea"));
    const invalid = controls.find((control) => !control.checkValidity());
    if (invalid) {
      invalid.reportValidity();
      invalid.focus();
      return false;
    }
    return true;
  };

  const nextStep = () => {
    if (!validateStep(step)) return;
    hasNavigatedRef.current = true;
    setStep((current) => Math.min(3, current + 1));
  };

  const previousStep = () => {
    hasNavigatedRef.current = true;
    setStep((current) => Math.max(1, current - 1));
  };

  const onFileChange = (file?: File) => {
    if (!file) {
      setFileError("");
      return;
    }
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setFileError("Upload a PDF, JPG, or PNG file.");
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setFileError("The certification file must be 5 MB or smaller.");
      return;
    }
    setFileError("");
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateStep(3) || fileError) return;
    const form = formRef.current;
    if (!form) return;

    const formData = new FormData(form);
    formData.set("attribution", JSON.stringify(getAttributionPayload()));
    setSubmitState({ status: "submitting" });

    try {
      const response = await fetch("/api/event-request", { method: "POST", body: formData });
      const payload: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        const message =
          payload && typeof payload === "object" && "error" in payload && typeof payload.error === "string"
            ? payload.error
            : "We could not submit your request. Please try again.";
        throw new Error(message);
      }
      const reference =
        payload && typeof payload === "object" && "reference" in payload && typeof payload.reference === "string"
          ? payload.reference
          : "GICC request";

      if (formData.get("request_type") === "condolence") {
        const thankYouUrl = new URL("/event-request/condolence-thank-you/", window.location.origin);
        thankYouUrl.searchParams.set("reference", reference);
        window.location.assign(thankYouUrl.toString());
        return;
      }

      setSubmitState({ status: "success", reference });
    } catch (error) {
      console.error("GICC event request submission failed", error);
      setSubmitState({
        status: "error",
        message: error instanceof Error ? error.message : "We could not submit your request. Please try again.",
      });
    }
  };

  if (submitState.status === "success") {
    return (
      <section className="form-success" role="status" aria-labelledby="request-success-heading">
        <CheckCircle2 aria-hidden="true" />
        <p className="section-note">Request received</p>
        <h2 id="request-success-heading" ref={successHeadingRef} tabIndex={-1}>JazakAllahu khayran</h2>
        <p>
          GICC has received your space request. Your reference is <strong>{submitState.reference}</strong>.
          A request is not confirmed until the GICC team approves it by email.
        </p>
        <Link className="button button--navy" href="/">Return to GICC home</Link>
      </section>
    );
  }

  return (
    <>
      {turnstileSiteKey ? <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer /> : null}
      <form ref={formRef} className="event-request-form" onSubmit={submit} noValidate={false}>
        <ol className="step-indicator" aria-label="Form progress">
          {["Event", "Contact", "Terms"].map((label, index) => {
            const number = index + 1;
            return <li key={label} className={number === step ? "is-current" : number < step ? "is-complete" : ""} aria-current={number === step ? "step" : undefined}><span>{number}</span>{label}</li>;
          })}
        </ol>

        <input className="honeypot" type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />

        <fieldset className="form-step" data-step="1" hidden={step !== 1}>
          <legend className="sr-only">Event details</legend>
          <h2 ref={(node) => { stepHeadingRefs.current[0] = node; }} tabIndex={-1}>Tell us about the request</h2>
          <p>Use this form for a new recurring program or one-time rental—not registration in an existing program.</p>

          <div className="field-group field-group--full">
            <label htmlFor="request-type">Request type <span aria-hidden="true">*</span></label>
            <select id="request-type" name="request_type" required value={requestType} onChange={(event) => setRequestType(event.target.value)}>
              <option value="recurring-program">New recurring program</option>
              <option value="one-time-rental">One-time space rental</option>
              <option value="nikah">Nikah</option>
              <option value="condolence">Condolence gathering (Azza)</option>
            </select>
            {(requestType === "nikah" || requestType === "condolence") ? <p className="field-hint">A $200 GICC fee applies to Nikah and condolence gatherings.</p> : null}
          </div>

          <div className="field-group field-group--full">
            <label htmlFor="event-details">Program or event details <span aria-hidden="true">*</span></label>
            <textarea id="event-details" name="event_details" rows={6} minLength={20} maxLength={4000} required placeholder="Describe the purpose, activities, audience, and how the space will be used." />
          </div>

          <div className="form-grid form-grid--three">
            <div className="field-group">
              <label htmlFor="requested-date">Preferred date <span aria-hidden="true">*</span></label>
              <input id="requested-date" name="requested_date" type="date" min={minDate} required />
            </div>
            <div className="field-group">
              <label htmlFor="start-time">Start time <span aria-hidden="true">*</span></label>
              <input id="start-time" name="start_time" type="time" required />
            </div>
            <div className="field-group">
              <label htmlFor="duration">Duration <span aria-hidden="true">*</span></label>
              <select id="duration" name="duration_minutes" required defaultValue="">
                <option value="" disabled>Select duration</option>
                <option value="60">1 hour</option><option value="90">1.5 hours</option><option value="120">2 hours</option>
                <option value="180">3 hours</option><option value="240">4 hours</option><option value="300">5 hours</option>
              </select>
            </div>
          </div>

          <div className="form-grid">
            <div className="field-group">
              <label htmlFor="location">Location preference <span aria-hidden="true">*</span></label>
              <select id="location" name="location_preference" required defaultValue="">
                <option value="" disabled>Select a location</option>
                <option value="masjid">GICC Masjid</option>
                <option value="yec">GICC Youth & Education Center</option>
                <option value="no-preference">No preference</option>
              </select>
            </div>
            <div className="field-group">
              <label htmlFor="alternate-date">Alternate date</label>
              <input id="alternate-date" name="alternate_date" type="date" min={minDate} />
            </div>
          </div>

          {requestType === "recurring-program" ? (
            <div className="field-group field-group--full">
              <label htmlFor="recurrence">Requested recurrence <span aria-hidden="true">*</span></label>
              <input id="recurrence" name="recurrence" required maxLength={300} placeholder="For example: Every Saturday for 10 weeks" />
            </div>
          ) : null}

          <div className="form-grid">
            <div className="field-group">
              <label htmlFor="attendees">Attendees <span aria-hidden="true">*</span></label>
              <select id="attendees" name="attendees" required defaultValue="">
                <option value="" disabled>Select attendees</option>
                <option value="male">Male</option><option value="female">Female</option><option value="both">Male and female</option>
              </select>
            </div>
            <div className="field-group">
              <label htmlFor="participants">Expected participants <span aria-hidden="true">*</span></label>
              <input id="participants" name="expected_participants" type="number" min={1} max={1000} inputMode="numeric" required />
            </div>
          </div>

          <fieldset className="choice-group">
            <legend>Will participants be charged a fee? <span aria-hidden="true">*</span></legend>
            <label><input type="radio" name="fees_charged" value="no" checked={chargesFees === "no"} onChange={(event) => setChargesFees(event.target.value)} /> No</label>
            <label><input type="radio" name="fees_charged" value="yes" checked={chargesFees === "yes"} onChange={(event) => setChargesFees(event.target.value)} /> Yes</label>
          </fieldset>
          {chargesFees === "yes" ? (
            <div className="field-group">
              <label htmlFor="fee-amount">Fee per person (CAD) <span aria-hidden="true">*</span></label>
              <input id="fee-amount" name="fee_amount" type="number" min={0} max={10000} step="0.01" inputMode="decimal" required />
            </div>
          ) : null}
        </fieldset>

        <fieldset className="form-step" data-step="2" hidden={step !== 2}>
          <legend className="sr-only">Lead person details</legend>
          <h2 ref={(node) => { stepHeadingRefs.current[1] = node; }} tabIndex={-1}>Lead person</h2>
          <p>The lead person must be present and is responsible for the program or event.</p>
          <div className="form-grid">
            <div className="field-group"><label htmlFor="full-name">Full name <span aria-hidden="true">*</span></label><input id="full-name" name="full_name" autoComplete="name" maxLength={150} required /></div>
            <div className="field-group"><label htmlFor="email">Email <span aria-hidden="true">*</span></label><input id="email" name="email" type="email" autoComplete="email" maxLength={254} required /></div>
            <div className="field-group"><label htmlFor="phone">Phone <span aria-hidden="true">*</span></label><input id="phone" name="phone" type="tel" autoComplete="tel" inputMode="tel" minLength={7} maxLength={30} required /></div>
            <div className="field-group"><label htmlFor="request-date">Date of request <span aria-hidden="true">*</span></label><input id="request-date" name="request_date" type="date" max={minDate} defaultValue={minDate} required /></div>
          </div>
          <div className="field-group field-group--full">
            <label htmlFor="qualifications">Qualifications and relevant experience <span aria-hidden="true">*</span></label>
            <textarea id="qualifications" name="qualifications" rows={5} minLength={10} maxLength={3000} required placeholder="List the qualifications, experience, or certifications relevant to this program or event." />
          </div>
          <div className="field-group field-group--full">
            <label htmlFor="certification">Certification copy</label>
            <label className="file-input" htmlFor="certification"><FileUp aria-hidden="true" /><span><strong>Choose a PDF or image</strong>Maximum 5 MB</span></label>
            <input id="certification" name="certification" type="file" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" onChange={(event) => onFileChange(event.target.files?.[0])} aria-describedby="certification-error" aria-invalid={Boolean(fileError)} />
            <p id="certification-error" className="field-error" role="alert">{fileError}</p>
          </div>
        </fieldset>

        <fieldset className="form-step" data-step="3" hidden={step !== 3}>
          <legend className="sr-only">Terms and signature</legend>
          <h2 ref={(node) => { stepHeadingRefs.current[2] = node; }} tabIndex={-1}>Terms and signature</h2>
          <p>Every participant must follow these requirements while using GICC facilities.</p>
          <div className="terms-list">
            <section><h3>Respect for the sanctity of the masjid</h3><p>Dress modestly, behave respectfully, and keep sound at a level that does not disturb prayer or worship.</p></section>
            <section><h3>Parking and access</h3><p>Keep the fire lane clear, do not use reserved spaces, and leave the Imam’s parking space vacant.</p></section>
            <section><h3>Maintenance and cleanliness</h3><p>No smoking at the entrance. Leave the hall clean, stay within approved areas, and do not obstruct hallways or exits.</p></section>
            <section><h3>Supervision and safety</h3><p>The event lead must be present throughout the booking and is responsible for participants, safety, and compliance.</p></section>
            <section><h3>Food and decorations</h3><p>Only halal food is permitted. Use designated dining areas and do not use adhesives or decorations that damage GICC property.</p></section>
          </div>
          <label className="consent-row"><input type="checkbox" name="liability_acknowledged" value="yes" required /><span>I acknowledge that GICC may require an approved liability form before the request is confirmed.</span></label>
          <label className="consent-row"><input type="checkbox" name="terms_accepted" value="yes" required /><span>I have read and agree to the terms above, and I will ensure participants follow them.</span></label>
          <label className="consent-row"><input type="checkbox" name="accuracy_confirmed" value="yes" required /><span>I confirm that the information in this request is complete and accurate.</span></label>
          <div className="field-group field-group--full signature-field">
            <label htmlFor="signature">Type your full legal name as your signature <span aria-hidden="true">*</span></label>
            <input id="signature" name="signature" minLength={2} maxLength={150} autoComplete="name" required />
            <p className="field-hint">By typing your name, you agree that it acts as your electronic signature for this request.</p>
          </div>
          {turnstileSiteKey ? <div className="cf-turnstile" data-sitekey={turnstileSiteKey} data-theme="light" /> : null}
          <p className="form-notice">GICC may accept or decline any request. Submission does not reserve or confirm the space.</p>
        </fieldset>

        {submitState.status === "error" ? (
          <div ref={errorRef} className="form-error" role="alert" tabIndex={-1}>
            <p>{submitState.message}</p>
            <p>If the problem continues, email <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.</p>
          </div>
        ) : null}

        <div className="form-actions">
          {step > 1 ? <button className="button button--back" type="button" onClick={previousStep}><ArrowLeft aria-hidden="true" /> Back</button> : <span />}
          {step < 3 ? <button className="button button--navy" type="button" onClick={nextStep}>Continue <ArrowRight aria-hidden="true" /></button> : (
            <button className="button button--navy" type="submit" disabled={submitState.status === "submitting"}>
              {submitState.status === "submitting" ? <><LoaderCircle className="spin" aria-hidden="true" /> Submitting…</> : "Submit request"}
            </button>
          )}
        </div>
      </form>
    </>
  );
}
