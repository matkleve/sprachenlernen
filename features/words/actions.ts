"use server";

import { applyTaskLifecycle, type TaskLifecycleAction } from "@/lib/db/task-lifecycle";
import { revalidatePath } from "next/cache";

export async function setWordLifecycleAction(taskId: string, action: TaskLifecycleAction) {
  const result = await applyTaskLifecycle(taskId, action);
  if (result.status === "ok") {
    revalidatePath("/words");
  }
  return result;
}
