const EVENTS_SHEET_ID = "1p33_LNs80WWptg6cfT0OxW2-C1Yvh1AXQcnTOoGQos8";
const EVENTS_SHEET_URL = `https://docs.google.com/spreadsheets/d/${EVENTS_SHEET_ID}/gviz/tq?tqx=out:json`;

type GvizCell = { v: unknown; f?: string } | null;
type GvizRow = { c: GvizCell[] };
type GvizColumn = { label?: string };
type GvizTable = { cols: GvizColumn[]; rows: GvizRow[] };
type GvizResponse = { table: GvizTable };

export type SheetEvent = {
  name: string;
  category: string;
  audience: string;
  ageRange: string;
  startDate: string;
  endDate?: string;
  startTime: string;
  endTime?: string;
  days: string;
  recurrence: string;
  location: string;
  price: string;
  posterLink?: string;
  registrationLink?: string;
};

function json(payload: unknown, status = 200) {
  return Response.json(payload, {
    status,
    headers: {
      "Cache-Control": status === 200 ? "public, max-age=300, stale-while-revalidate=900" : "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

function parseGvizResponse(text: string): GvizResponse {
  const match = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\);\s*$/);
  if (!match) throw new Error("Unexpected Google Sheets response format");
  return JSON.parse(match[1]) as GvizResponse;
}

function cellText(cell: GvizCell): string {
  if (!cell) return "";
  if (typeof cell.f === "string") return cell.f.trim();
  if (typeof cell.v === "string") return cell.v.trim();
  return "";
}

function cellLink(cell: GvizCell): string | undefined {
  const text = cellText(cell);
  return text.length > 0 ? text : undefined;
}

function parseGvizDateOnly(cell: GvizCell): string | null {
  if (!cell || cell.v == null) return null;
  const raw = cell.v;
  if (typeof raw === "string") {
    const match = raw.match(/^Date\((\d+),(\d+),(\d+)/);
    if (match) {
      const [, year, month, day] = match;
      const date = new Date(Date.UTC(Number(year), Number(month), Number(day)));
      if (Number.isNaN(date.getTime())) return null;
      return date.toISOString().slice(0, 10);
    }
    const parsed = new Date(raw);
    if (!Number.isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10);
  }
  return null;
}

function toSheetEvent(row: GvizRow, columnIndex: Map<string, number>): SheetEvent | null {
  const cell = (...labels: string[]): GvizCell => {
    for (const label of labels) {
      const index = columnIndex.get(label);
      if (index !== undefined) return row.c[index] ?? null;
    }
    return null;
  };

  const name = cellText(cell("Event Name"));
  if (!name) return null;

  const startDate = parseGvizDateOnly(cell("Start Date", "Date"));
  if (!startDate) return null;
  const endDate = parseGvizDateOnly(cell("End Date")) ?? undefined;

  return {
    name,
    category: cellText(cell("Category")),
    audience: cellText(cell("Audience", "Group")),
    ageRange: cellText(cell("Age Range")),
    startDate,
    endDate,
    startTime: cellText(cell("Start Time")),
    endTime: cellText(cell("End Time")),
    days: cellText(cell("Days")),
    recurrence: cellText(cell("Recurrence")),
    location: cellText(cell("Location")),
    price: cellText(cell("Price")),
    posterLink: cellLink(cell("Poster Link")),
    registrationLink: cellLink(cell("Registration Link")),
  };
}

async function loadSheetEvents(signal: AbortSignal): Promise<SheetEvent[]> {
  const response = await fetch(EVENTS_SHEET_URL, { signal });
  if (!response.ok) throw new Error(`Google Sheets request failed with status ${response.status}`);

  const { table } = parseGvizResponse(await response.text());
  const columnIndex = new Map<string, number>();
  table.cols.forEach((column, index) => {
    if (column.label) columnIndex.set(column.label.trim().replace(/\*+$/, "").trim(), index);
  });

  const events: SheetEvent[] = [];
  for (const row of table.rows) {
    const event = toSheetEvent(row, columnIndex);
    if (event) events.push(event);
  }
  return events;
}

export const onRequestGet = async ({ request }: { request: Request }) => {
  try {
    return json({ events: await loadSheetEvents(request.signal) });
  } catch (error) {
    console.error("Unable to load the GICC events sheet", error);
    return json({ error: "Events feed is temporarily unavailable" }, 502);
  }
};
