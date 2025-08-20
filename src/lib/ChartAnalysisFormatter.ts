/* eslint-disable @typescript-eslint/consistent-type-definitions */
export type Confidence = "low" | "medium" | "high";

export type ComparisonType =
  | "YoY"
  | "QoQ"
  | "MoM"
  | "WoW"
  | "vs_target"
  | "period_over_period";

export interface Metric {
  name: string;
  unit?: string;
}

export interface Timeframe {
  start?: string;   // ISO or label
  end?: string;     // ISO or label
  frequency?: string; // e.g., "daily", "quarterly", "1D"
}

export interface KeyValue {
  label: string;
  value: number | string;
  unit?: string;
  where_in_chart?: string;
}

export interface Comparison {
  type: ComparisonType;
  from: string;
  to: string;
  delta_abs?: number;
  delta_pct?: number;
}

export interface Outlier {
  point: string;
  reason?: string;
  impact?: string;
}

export interface ChartAnalysis {
  // Optional short prose from the model (≤120 words recommended)
  prose_summary?: string;

  chart_type?: string;
  metric?: Metric;
  timeframe?: Timeframe;

  main_trends?: string[];
  key_values?: KeyValue[];
  comparisons?: Comparison[];
  outliers?: Outlier[];
  insights?: string[];
  risks_or_limitations?: string[];
  recommended_actions?: string[];
  assumptions?: string[];
  confidence?: Confidence;
  follow_up_questions?: string[];
}

export interface FormatOptions {
  locale?: string;               // e.g., "en-US"
  currency?: string;             // e.g., "USD"
  maxBulletsPerSection?: number; // default 6
  includeEmptySections?: boolean; // default false
  headings?: {
    summary?: string;
    snapshot?: string;
    trends?: string;
    comparisons?: string;
    outliers?: string;
    insights?: string;
    risks?: string;
    actions?: string;
    assumptions?: string;
    questions?: string;
    json?: string;
  };
}

const defaultOptions: Required<FormatOptions> = {
  locale: "en-US",
  currency: "USD",
  maxBulletsPerSection: 6,
  includeEmptySections: false,
  headings: {
    summary: "Prose summary",
    snapshot: "Chart snapshot",
    trends: "Main trends",
    comparisons: "Comparisons",
    outliers: "Notable outliers",
    insights: "Insights",
    risks: "Risks & limitations",
    actions: "Recommended actions",
    assumptions: "Assumptions",
    questions: "Follow-up questions",
    json: "JSON block",
  },
};

function isBlank(x?: string | null): boolean {
  return !x || !x.trim();
}
function clean(s: string): string {
  // Collapse multiple spaces, trim, preserve punctuation.
  return s.replace(/\s+/g, " ").trim();
}
function limit<T>(arr: T[] | undefined, n: number): T[] {
  if (!arr || arr.length === 0) return [];
  return arr.slice(0, Math.max(0, n));
}
function uniq<T>(arr: T[] | undefined): T[] {
  if (!arr) return [];
  return Array.from(new Set(arr.map((x) => JSON.stringify(x)))).map((s) =>
    JSON.parse(s)
  );
}

function fmtNumber(n: number, locale: string): string {
  return new Intl.NumberFormat(locale, {
    maximumFractionDigits: 2,
  }).format(n);
}

function fmtPct(n: number, locale: string): string {
  return `${new Intl.NumberFormat(locale, {
    maximumFractionDigits: 2,
  }).format(n)}%`;
}

function fmtCurrency(n: number, locale: string, currency: string): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(n);
}

function fmtMaybeNumberOrText(
  v: number | string,
  locale: string,
  currency?: string,
  unit?: string
): string {
  if (typeof v === "number") {
    if (currency) return fmtCurrency(v, locale, currency);
    const core = fmtNumber(v, locale);
    return unit && unit !== "%" ? `${core} ${unit}` : core;
  }
  return clean(v);
}

function bullet(lines: string[]): string {
  return lines.map((l) => `• ${clean(l)}`).join("\n");
}
function section(title: string, lines: string[], opts: FormatOptions): string {
  const body = bullet(lines);
  return lines.length ? `${title}\n\n${body}\n` : opts.includeEmptySections ? `${title}\n\n• Not available\n` : "";
}

function renderSnapshot(a: ChartAnalysis, opts: Required<FormatOptions>): string[] {
  const lines: string[] = [];
  if (!isBlank(a.chart_type)) lines.push(`Type: ${a.chart_type}`);
  if (a.metric && !isBlank(a.metric.name)) {
    const unit = a.metric.unit ? ` (${a.metric.unit})` : "";
    lines.push(`Metric: ${a.metric.name}${unit}`);
  }
  if (a.timeframe && (a.timeframe.start || a.timeframe.end || a.timeframe.frequency)) {
    const tf = [
      a.timeframe.start ? `start ${a.timeframe.start}` : "",
      a.timeframe.end ? `end ${a.timeframe.end}` : "",
      a.timeframe.frequency ? `${a.timeframe.frequency}` : "",
    ]
      .filter(Boolean)
      .join(" • ");
    if (tf) lines.push(`Timeframe: ${tf}`);
  }
  if (a.key_values && a.key_values.length) {
    const kv = limit(uniq(a.key_values), opts.maxBulletsPerSection).map((k) => {
      const val = fmtMaybeNumberOrText(
        k.value as number | string,
        opts.locale,
        undefined,
        k.unit
      );
      const where = k.where_in_chart ? ` (${k.where_in_chart})` : "";
      return `${k.label}: ${val}${where}`;
    });
    lines.push(...kv);
  }
  return lines;
}

function renderTrends(a: ChartAnalysis, opts: Required<FormatOptions>): string[] {
  return limit(uniq(a.main_trends), opts.maxBulletsPerSection).map((t) => clean(t));
}

function renderComparisons(a: ChartAnalysis, opts: Required<FormatOptions>): string[] {
  const lines = limit(uniq(a.comparisons), opts.maxBulletsPerSection).map((c) => {
    const deltas: string[] = [];
    if (typeof c.delta_abs === "number") deltas.push(fmtNumber(c.delta_abs, opts.locale));
    if (typeof c.delta_pct === "number") deltas.push(`${fmtPct(c.delta_pct, opts.locale)}`);
    const deltaStr = deltas.length ? ` (${deltas.join(" / ")})` : "";
    return `${c.type}: ${c.from} → ${c.to}${deltaStr}`;
  });
  return lines;
}

function renderOutliers(a: ChartAnalysis, opts: Required<FormatOptions>): string[] {
  return limit(uniq(a.outliers), opts.maxBulletsPerSection).map((o) => {
    const parts = [o.point, o.reason, o.impact].filter((x) => !isBlank(x)) as string[];
    return parts.map(clean).join(" — ");
  });
}

function renderPlainList(arr: string[] | undefined, opts: Required<FormatOptions>): string[] {
  return limit(uniq(arr), opts.maxBulletsPerSection).map((x) => clean(x as string));
}

function summarize(s?: string): string[] {
  if (isBlank(s)) return [];
  // Keep the summary to a single short paragraph, no bullets.
  return [clean(s as string)];
}

export function formatAnalysisMarkdown(
  a: ChartAnalysis,
  options: Partial<FormatOptions> = {}
): string {
  const opts: Required<FormatOptions> = { ...defaultOptions, ...options, headings: { ...defaultOptions.headings, ...options.headings } };

  const parts: string[] = [];

  // Prose summary (one short paragraph, no bullets)
  const sum = summarize(a.prose_summary);
  if (sum.length) {
    parts.push(`${opts.headings.summary}\n\n${sum[0]}\n`);
  }

  // Snapshot
  parts.push(section(opts.headings.snapshot, renderSnapshot(a, opts), opts));

  // Trends
  parts.push(section(opts.headings.trends, renderTrends(a, opts), opts));

  // Comparisons
  parts.push(section(opts.headings.comparisons, renderComparisons(a, opts), opts));

  // Outliers
  parts.push(section(opts.headings.outliers, renderOutliers(a, opts), opts));

  // Insights / Risks / Actions
  parts.push(section(opts.headings.insights, renderPlainList(a.insights, opts), opts));
  parts.push(section(opts.headings.risks, renderPlainList(a.risks_or_limitations, opts), opts));
  parts.push(section(opts.headings.actions, renderPlainList(a.recommended_actions, opts), opts));

  // Assumptions / Questions
  parts.push(section(opts.headings.assumptions, renderPlainList(a.assumptions, opts), opts));
  parts.push(section(opts.headings.questions, renderPlainList(a.follow_up_questions, opts), opts));

  // JSON block (optional: keep last)
  const json = { ...a };
  if (Object.keys(json).length) {
    parts.push(`${opts.headings.json}\n\n\`\`\`json\n${JSON.stringify(json, null, 2)}\n\`\`\`\n`);
  }

  // Join with single blank lines; strip accidental doubles
  return parts.filter(Boolean).join("\n").replace(/\n{3,}/g, "\n\n");
}
