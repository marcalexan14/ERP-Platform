// One command to run FinFlow locally: starts a local Postgres, syncs the schema,
// then launches the dev server. Run with `npm run local` (or double-click run.cmd).
import { spawn, spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";

const NPX = process.platform === "win32" ? "npx.cmd" : "npx";
const run = (cmd, args, opts = {}) =>
  spawnSync(cmd, args, { encoding: "utf8", shell: process.platform === "win32", ...opts });

function startPostgres() {
  console.log("→ Starting local Postgres (prisma dev)...");
  let res = run(NPX, ["--yes", "prisma@7.10.0", "dev", "--name", "finflow", "--detach"]);
  let out = `${res.stdout ?? ""}${res.stderr ?? ""}`;

  // Stale lock from an unclean shutdown — stop it and retry once.
  if (/Lock file is already being held/i.test(out)) {
    console.log("  (clearing a stale lock and retrying)");
    run(NPX, ["--yes", "prisma@7.10.0", "dev", "stop", "finflow"]);
    res = run(NPX, ["--yes", "prisma@7.10.0", "dev", "--name", "finflow", "--detach"]);
    out = `${res.stdout ?? ""}${res.stderr ?? ""}`;
  }

  const url = out.match(/postgres:\/\/postgres:postgres@localhost:\d+\/template1\?sslmode=disable/)?.[0];
  if (!url) {
    console.error("✗ Could not determine the database URL. Raw output:\n", out);
    process.exit(1);
  }
  return url;
}

const databaseUrl = startPostgres();
console.log(`  Database: ${databaseUrl}`);

writeFileSync(
  new URL("../.env.local", import.meta.url),
  `# Written by \`npm run local\`. Points the app at the prisma-dev Postgres.\nDATABASE_URL="${databaseUrl}"\n`,
);

console.log("→ Syncing database schema...");
const push = run(NPX, ["--yes", "drizzle-kit", "push"], {
  stdio: "inherit",
  env: { ...process.env, DATABASE_URL: databaseUrl },
});
if (push.status !== 0) {
  console.error("✗ Schema sync failed.");
  process.exit(1);
}

console.log("\n→ Starting the app at http://localhost:3000  (press Ctrl+C to stop)\n");
const dev = spawn(NPX, ["next", "dev", "--webpack"], {
  stdio: "inherit",
  shell: process.platform === "win32",
  env: { ...process.env, DATABASE_URL: databaseUrl },
});
dev.on("exit", (code) => process.exit(code ?? 0));
