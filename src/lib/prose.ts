/**
 * Pure text logic — no payload, no collections.
 *
 * Split out of content.ts so the unit tests (and anything else) can use these
 * without importing the client payload: content.ts reads siteConfig at module
 * top for getPageIndex(), and `client/` is a generated symlink that does not
 * exist on the CI runner. Everything here is a function of its arguments.
 */

/**
 * The one place an area turns into a display string.
 *
 * "{name}, {ST}" for US cities, bare `name` for everything else. Five call sites used
 * to interpolate `, ${state}` inline, which is exactly how a client whose areas are
 * airports ends up with "Teterboro Airport (KTEB), undefined" in the footer.
 */
export function areaLabel(area: { name: string; state?: string }): string {
  return area.state ? `${area.name}, ${area.state}` : area.name;
}

/** Splits an authored multi-paragraph string on blank lines. */
export function paragraphs(body: string): string[] {
  return body
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

/* ---------------------------------------------------------------------------
 * Prose block classification
 *
 * Payload copy is not markdown, but it is not flowing prose either. Authors write
 * three distinct shapes into the same string field, and the difference is the whole
 * reason copy-only sections used to look like a wall of grey text: a scannable spec
 * sheet was being rendered as an essay.
 *
 *   text   — an actual paragraph
 *   list   — a block whose every line begins with "- "
 *   points — a *run* of paragraphs opening "**Label.** explanation", which is a
 *            labelled list the author happened to type as prose
 *
 * Classifying here lets templates inspect the same structure their renderers use, so
 * layout and content agree on what the body is.
 * ------------------------------------------------------------------------ */

export type ProseBlock =
  | { kind: 'text'; text: string }
  | { kind: 'list'; items: string[] }
  | { kind: 'points'; items: ProsePoint[] };

export interface ProsePoint {
  label: string;
  body: string;
}

/** A label longer than this is a bolded sentence, not a lead-in. */
const MAX_LABEL_LENGTH = 60;

/**
 * `**Insured.** We carry $200,000 …` → { label: 'Insured', body: 'We carry …' }.
 *
 * The terminating period *inside* the bold is required, and it is what separates the
 * two things authors write with the same syntax:
 *
 *   **Insured.** We carry $200,000 …        ← a label; a new sentence follows
 *   **Weather at KTEB** includes cold …     ← the subject of one continuing sentence
 *
 * Only the first is a point. Promoting the second to a heading strips the sentence of
 * its subject and leaves the body opening on a bare verb ("includes cold winters…"),
 * which is exactly how it read before this check existed. The punctuation is the
 * author's signal, so a payload opts in by writing the lead-in convention.
 *
 * Also rejects anything merely emphatic: a wholly bold paragraph with no body after
 * it, and a bold clause too long to be a label.
 */
function asPoint(block: string): ProsePoint | null {
  const match = block.match(/^\*\*([^*\n]+[.:])\*\*\s*([\s\S]*)$/);
  if (!match) return null;

  const label = match[1].trim().replace(/[.:]$/, '').trim();
  const body = match[2].trim();
  if (!label || !body || label.length > MAX_LABEL_LENGTH) return null;

  return { label, body };
}

/** Parses an authored body into the blocks a renderer can lay out. */
export function proseBlocks(body: string): ProseBlock[] {
  const blocks: ProseBlock[] = [];
  /** Consecutive lead-in paragraphs, held back until we know how many there are. */
  let run: { point: ProsePoint; source: string }[] = [];

  const flushRun = () => {
    // One lead-in is an emphatic paragraph; two or more in a row is a list. A lone
    // one goes back out as its original text so nothing is silently restructured.
    if (run.length >= 2) {
      blocks.push({ kind: 'points', items: run.map((r) => r.point) });
    } else {
      for (const r of run) blocks.push({ kind: 'text', text: r.source });
    }
    run = [];
  };

  for (const block of paragraphs(body)) {
    const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);

    if (lines.length > 0 && lines.every((l) => l.startsWith('- '))) {
      flushRun();
      blocks.push({ kind: 'list', items: lines.map((l) => l.slice(2).trim()) });
      continue;
    }

    const point = asPoint(block);
    if (point) {
      run.push({ point, source: block });
      continue;
    }

    flushRun();
    blocks.push({ kind: 'text', text: block });
  }

  flushRun();
  return blocks;
}
