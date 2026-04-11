const { execSync } = require("child_process");

function run(command) {
  execSync(command, { stdio: "inherit" });
}

function ensureBuild() {
  console.log("Building latest client before start...");
  run("pnpm build");
}

function freePort3000() {
  try {
    if (process.platform === "win32") {
      const output = execSync("netstat -ano | findstr :3000", { encoding: "utf8" });
      const pids = new Set();

      output
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)
        .forEach((line) => {
          const parts = line.split(/\s+/);
          const state = parts[3] || "";
          const pid = parts[parts.length - 1];
          if (state === "LISTENING" && pid && /^\d+$/.test(pid)) {
            pids.add(pid);
          }
        });

      for (const pid of pids) {
        console.log(`Stopping process on port 3000 (PID ${pid})...`);
        run(`taskkill /PID ${pid} /F`);
      }
    }
  } catch {
    // If no process is listening, continue silently.
  }
}

freePort3000();
ensureBuild();
