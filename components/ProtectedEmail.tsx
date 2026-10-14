"use client";

import { Mail } from "lucide-react";
import { useState } from "react";

const EMAIL_CODE_POINTS = {
  general: [105, 110, 102, 111, 64, 103, 105, 99, 99, 109, 97, 115, 106, 105, 100, 46, 111, 114, 103],
  religious: [105, 109, 97, 109, 64, 103, 105, 99, 99, 109, 97, 115, 106, 105, 100, 46, 111, 114, 103],
} as const;

type ProtectedEmailProps = {
  kind: keyof typeof EMAIL_CODE_POINTS;
  label?: string;
  variant?: "card" | "inline";
};

const decodeEmail = (kind: ProtectedEmailProps["kind"]) =>
  String.fromCharCode(...EMAIL_CODE_POINTS[kind]);

export function ProtectedEmail({ kind, label = "Email", variant = "card" }: ProtectedEmailProps) {
  const [email, setEmail] = useState("");

  if (variant === "inline") {
    return email ? (
      <a href={`mailto:${email}`}>{email}</a>
    ) : (
      <button className="protected-email-inline" type="button" onClick={() => setEmail(decodeEmail(kind))}>
        Reveal email address
      </button>
    );
  }

  return email ? (
    <a href={`mailto:${email}`}>
      <Mail aria-hidden="true" />
      <span><strong>{label}</strong>{email}</span>
    </a>
  ) : (
    <button type="button" onClick={() => setEmail(decodeEmail(kind))} aria-label={`Reveal ${label.toLowerCase()} email address`}>
      <Mail aria-hidden="true" />
      <span><strong>{label}</strong>Reveal email address</span>
    </button>
  );
}
