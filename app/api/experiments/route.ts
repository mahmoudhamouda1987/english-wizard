import { NextResponse } from "next/server";
import { currentUser } from "@/src/infrastructure/auth";
import { query } from "@/src/infrastructure/database";
import { assignVariant, canTransition, validateExperiment, type ExperimentRecord, type ExperimentStatus } from "@/src/domain/experimentation";

export const dynamic = "force-dynamic";

interface ExperimentRow {
  id: string;
  name: string;
  hypothesis: string;
  status: ExperimentStatus;
  control: string;
  variants: unknown;
  primary_learning_metric: string;
  guardrail_metrics: unknown;
}

function toRecord(row: ExperimentRow): ExperimentRecord {
  return {
    id: row.id,
    name: row.name,
    hypothesis: row.hypothesis,
    status: row.status,
    control: row.control,
    variants: Array.isArray(row.variants) ? (row.variants as string[]) : [],
    primaryLearningMetric: row.primary_learning_metric,
    guardrailMetrics: Array.isArray(row.guardrail_metrics) ? (row.guardrail_metrics as string[]) : [],
  };
}

export async function GET() {
  const session = await currentUser();
  if (!session) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  try {
    const result = await query<ExperimentRow>(`SELECT * FROM experiments ORDER BY created_at DESC LIMIT 100`).catch(() => ({ rows: [] as ExperimentRow[] }));
    const running = result.rows.map(toRecord).filter((experiment) => experiment.status === "RUNNING");
    const assignments = Object.fromEntries(running.map((experiment) => [experiment.name, assignVariant(session.learnerId, experiment)]));
    return NextResponse.json({ experiments: result.rows.map(toRecord), myAssignments: assignments });
  } catch {
    return NextResponse.json({ experiments: [], myAssignments: {} });
  }
}

export async function POST(request: Request) {
  const session = await currentUser();
  if (!session) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const action = typeof body.action === "string" ? body.action : "CREATE";

  if (action === "CREATE") {
    const candidate = {
      name: typeof body.name === "string" ? body.name : undefined,
      hypothesis: typeof body.hypothesis === "string" ? body.hypothesis : undefined,
      control: typeof body.control === "string" ? body.control : undefined,
      variants: Array.isArray(body.variants) ? (body.variants as unknown[]).filter((v): v is string => typeof v === "string") : undefined,
      primaryLearningMetric: typeof body.primaryLearningMetric === "string" ? body.primaryLearningMetric : undefined,
      guardrailMetrics: Array.isArray(body.guardrailMetrics) ? (body.guardrailMetrics as unknown[]).filter((v): v is string => typeof v === "string") : [],
    } satisfies Partial<ExperimentRecord>;
    const validation = validateExperiment(candidate);
    if (!validation.ok) return NextResponse.json({ error: validation.error }, { status: 400 });

    const id = crypto.randomUUID();
    await query(
      `INSERT INTO experiments (id,name,hypothesis,status,control,variants,primary_learning_metric,guardrail_metrics) VALUES ($1,$2,$3,'DRAFT',$4,$5::jsonb,$6,$7::jsonb)`,
      [id, candidate.name, candidate.hypothesis, candidate.control, JSON.stringify(candidate.variants), candidate.primaryLearningMetric, JSON.stringify(candidate.guardrailMetrics)],
    ).catch(() => null);
    return NextResponse.json({ id, ...candidate, status: "DRAFT" }, { status: 201 });
  }

  if (action === "TRANSITION") {
    const id = typeof body.id === "string" ? body.id : "";
    const to = typeof body.to === "string" ? (body.to as ExperimentStatus) : ("" as ExperimentStatus);
    const current = await query<ExperimentRow>(`SELECT * FROM experiments WHERE id = $1`, [id]).catch(() => ({ rows: [] as ExperimentRow[] }));
    if (!current.rows.length) return NextResponse.json({ error: "Experiment not found." }, { status: 404 });
    if (!canTransition(current.rows[0].status, to)) {
      return NextResponse.json({ error: `Transition ${current.rows[0].status} -> ${to} is not allowed.` }, { status: 400 });
    }
    await query(`UPDATE experiments SET status = $2 WHERE id = $1`, [id, to]).catch(() => null);
    await query(
      `INSERT INTO audit_events (id,learner_id,actor_id,action,entity_type,entity_id,metadata) VALUES ($1,NULL,$2,'EXPERIMENT_TRANSITION','EXPERIMENT',$3,$4::jsonb)`,
      [crypto.randomUUID(), session.userId, id, JSON.stringify({ to })],
    ).catch(() => null);
    return NextResponse.json({ ok: true, status: to });
  }

  return NextResponse.json({ error: "Unsupported action." }, { status: 400 });
}
