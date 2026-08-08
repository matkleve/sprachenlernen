import { describe, it } from "vitest";
import {
  applyReview, DEFAULT_CONFIG, newTask, retrievability, project,
  type Grade, type Task,
} from "@/lib/scheduler";

const DAY = 86_400_000;
const T0 = Date.UTC(2026, 0, 1);
const grades: Grade[] = ["again", "hard", "good", "easy"];

describe("PROBE2", () => {
  it("AC-4 by state, reviewing exactly at due", () => {
    const worst: Record<string, { err: number; desc: string }> = {};
    const walk = (t: Task, at: number, path: Grade[], depth: number) => {
      if (depth === 0) return;
      for (const g of grades) {
        const res = applyReview(t, g, at, DEFAULT_CONFIG);
        if (res.illegal) continue;
        const nt = res.task;
        if (nt.state !== "suspended") {
          const err = Math.abs(retrievability(nt, nt.due) - 0.9);
          const cur = worst[nt.state];
          if (!cur || err > cur.err) {
            worst[nt.state] = { err, desc: `${[...path, g].join(">")} S=${nt.stability!.toFixed(3)} interval=${(nt.due - at) / DAY}` };
          }
        }
        walk(nt, nt.due, [...path, g], depth - 1);
      }
    };
    walk(newTask("t", "w"), T0, [], 6);
    console.log(JSON.stringify(worst, null, 2));
  });

  it("how many legal-looking sequences get silently dropped", () => {
    let dropped = 0, total = 0;
    const reasons = new Set<string>();
    const walk = (t: Task, at: number, path: Grade[], depth: number) => {
      if (depth === 0) return;
      for (const g of grades) {
        const res = applyReview(t, g, at, DEFAULT_CONFIG);
        total++;
        if (res.illegal && t.state !== "suspended" && t.state !== "retired") {
          dropped++;
          reasons.add(`${t.state} + ${g} :: ${res.reason}`);
          continue;
        }
        if (res.illegal) continue;
        walk(res.task, res.task.due, [...path, g], depth - 1);
      }
    };
    walk(newTask("t", "w"), T0, [], 6);
    console.log("dropped", dropped, "of", total);
    console.log([...reasons].join("\n"));
  });

  it("difficulty feeds stability: old vs new D", () => {
    // reproduce the formula with the NEW difficulty to size the divergence
    const w = DEFAULT_CONFIG.weights;
    let t = applyReview(newTask("t", "w"), "good", T0, DEFAULT_CONFIG).task;
    t = applyReview(t, "good", T0 + 3 * DAY, DEFAULT_CONFIG).task;
    const at = t.due;
    for (const g of ["hard", "good", "easy"] as Grade[]) {
      const r = retrievability(t, at);
      const D_old = t.difficulty;
      const D_new = Math.min(10, Math.max(1, w[7] * w[4] + (1 - w[7]) * (D_old - w[6] * ({ again: 1, hard: 2, good: 3, easy: 4 }[g] - 3))));
      const f = (D: number) => t.stability! * (1 + Math.exp(w[8]) * (11 - D) * Math.pow(t.stability!, -w[9]) * (Math.exp(w[10] * (1 - r)) - 1) * (g === "hard" ? w[15] : 1) * (g === "easy" ? w[16] : 1));
      const actual = applyReview(t, g, at, DEFAULT_CONFIG).task.stability!;
      console.log(g, "D_old", D_old.toFixed(4), "D_new", D_new.toFixed(4), "S(withOldD)=", f(D_old).toFixed(4), "S(withNewD)=", f(D_new).toFixed(4), "impl=", actual.toFixed(4), "days diff", (Math.round(f(D_old)) - Math.round(f(D_new))));
    }
    // lapse case
    const r = retrievability(t, at);
    const D_old = t.difficulty;
    const D_new = Math.min(10, Math.max(1, w[7] * w[4] + (1 - w[7]) * (D_old + w[6] * 2)));
    const fl = (D: number) => Math.min(w[11] * Math.pow(D, -w[12]) * (Math.pow(t.stability! + 1, w[13]) - 1) * Math.exp(w[14] * (1 - r)), t.stability!);
    console.log("again: D_old", D_old.toFixed(4), "D_new", D_new.toFixed(4), "S(old)", fl(D_old).toFixed(4), "S(new)", fl(D_new).toFixed(4), "impl", applyReview(t, "again", at, DEFAULT_CONFIG).task.stability!.toFixed(4));
  });

  it("projection for a suspended / retired task", () => {
    let t = applyReview(newTask("t", "w"), "good", T0, DEFAULT_CONFIG).task;
    t = applyReview(t, "good", T0 + 3 * DAY, DEFAULT_CONFIG).task;
    let at = T0 + 4 * DAY;
    while (t.state !== "suspended") { const r = applyReview(t, "again", at, DEFAULT_CONFIG); if (!r.illegal) t = r.task; at += DAY; }
    const p = project(t, at, DEFAULT_CONFIG);
    console.log("suspended task, project:", JSON.stringify(p));
    console.log("actual due:", t.due, "state", t.state);
  });

  it("review before the previous one / same instant", () => {
    let t = applyReview(newTask("t", "w"), "good", T0, DEFAULT_CONFIG).task;
    t = applyReview(t, "good", T0 + 10 * DAY, DEFAULT_CONFIG).task;
    const back = applyReview(t, "good", T0 + 5 * DAY, DEFAULT_CONFIG).task;
    console.log("backdated review accepted:", back.reviews.map((r) => r.at - T0).join(","), "due moved from", (t.due - T0) / DAY, "to", (back.due - T0) / DAY, "days");
  });
});
