/** Un puesto tal como está en `src/data/experience.json` (más reciente primero). */
export interface Job {
  readonly period: string;
  readonly role: string;
  readonly company: string;
  readonly highlights: readonly string[];
  /**
   * Muestra el puesto como una rama que sale de main y vuelve con un merge.
   * El primer highlight se usa como resumen del merge; el resto, como commits de la rama.
   */
  readonly git?: { readonly branch: string };
}

export interface Commit {
  readonly hash: string;
  readonly date: string;
  readonly message: string;
  readonly detail: string;
  /** 0 = main, 1 = rama. */
  readonly lane: 0 | 1;
  readonly isHead: boolean;
}

/** Hash corto y estable (FNV-1a) para que no cambie entre builds. */
export function shortHash(value: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0').slice(0, 7);
}

const periodBounds = (period: string): [string, string] => {
  const [start, end = ''] = period.split(/\s+-\s+/);
  return [start.trim(), end.trim()];
};

type Draft = Omit<Commit, 'hash' | 'isHead'>;

function commitsOf(job: Job): Draft[] {
  const [start, end] = periodBounds(job.period);

  if (!job.git) {
    return [{ date: start, message: `feat: ${job.company}`, detail: job.highlights[0] ?? job.role, lane: 0 }];
  }

  const [summary = '', ...rest] = job.highlights;
  return [
    { date: start, message: `branch: ${job.git.branch}`, detail: `${job.role} en ${job.company}`, lane: 1 },
    ...rest.map((highlight): Draft => ({ date: '', message: highlight, detail: '', lane: 1 })),
    { date: end, message: `merge: ${job.git.branch} → main`, detail: summary, lane: 0 },
  ];
}

/** Convierte la experiencia (más reciente primero) en un `git log --reverse`. */
export function toGitLog(jobsNewestFirst: readonly Job[]): Commit[] {
  const drafts = [...jobsNewestFirst].reverse().flatMap(commitsOf);
  return drafts.map((draft, i) => ({
    ...draft,
    hash: shortHash(`${draft.message}|${draft.date}|${i}`),
    isHead: i === drafts.length - 1,
  }));
}
