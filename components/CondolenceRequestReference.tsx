"use client";

import { useSearchParams } from "next/navigation";

const REQUEST_REFERENCE_PATTERN = /^GICC-(?:RECEIVED|\d{8}-[A-F0-9]{8})$/;

export function CondolenceRequestReference() {
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference")?.trim() ?? "";

  if (!REQUEST_REFERENCE_PATTERN.test(reference)) return null;

  return (
    <p className="condolence-thanks__reference">
      Request reference <strong>{reference}</strong>
    </p>
  );
}
