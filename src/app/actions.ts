"use server";

import { revalidatePath } from "next/cache";
import { addDecision, addRequest } from "@/lib/store";
import { suggestTriage, type SuggestionResult } from "@/lib/triage-ai";
import { DECISIONS, type Decision } from "@/lib/types";

function text(formData: FormData, key: string, max: number): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function createRequest(formData: FormData) {
  const title = text(formData, "title", 120);
  const description = text(formData, "description", 600);
  const requester = text(formData, "requester", 60);
  const team = text(formData, "team", 60);
  if (!title || !description) return;
  await addRequest({
    title,
    description,
    requester: requester || "Anonymous",
    team: team || "Unknown",
  });
  revalidatePath("/");
}

export async function decideRequest(formData: FormData) {
  const requestId = text(formData, "requestId", 80);
  const decision = text(formData, "decision", 10) as Decision;
  const reason = text(formData, "reason", 300);
  if (!requestId || !reason || !DECISIONS.includes(decision)) return;
  await addDecision(requestId, decision, reason);
  revalidatePath("/");
}

export async function suggestDecision(requestId: string): Promise<SuggestionResult> {
  const id = typeof requestId === "string" ? requestId.slice(0, 80) : "";
  if (!id) return { ok: false, error: "Request not found." };
  return suggestTriage(id);
}
