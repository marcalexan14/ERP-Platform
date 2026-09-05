import { NextResponse } from "next/server";
import { runDueRecurringRules } from "@/lib/recurring";

// Trigger this from an external scheduler (Vercel Cron, cron-job.org, etc.)
// with an Authorization: Bearer <CRON_SECRET> header. Runs across all
// organizations — there's no per-org scoping here since a real cron run
// isn't tied to a signed-in user.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");

  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results = await runDueRecurringRules();
  return NextResponse.json({ processed: results.length, results });
}
