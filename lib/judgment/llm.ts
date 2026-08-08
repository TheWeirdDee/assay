/**
 * Real LLM narration of a judgment-engine decision. The decision itself (ALLOW/HOLD/ESCALATE) is
 * computed deterministically by judge() in engine.ts and is never touched here -- a money-moving
 * decision in a compliance product cannot depend on a non-deterministic model. This module only
 * asks Claude to write the human-readable explanation of a decision that was already made, from the
 * exact deterministic signals judge() computed. If the call fails or is declined for any reason, the
 * caller falls back to judge()'s own plain-language `rationale`, which is already honest and
 * complete -- so a model outage degrades prose quality, never the decision or the audit trail.
 */
import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import type { Decision, MerchantPolicy, Payment } from "./engine";

let client: Anthropic | undefined;
function getClient(): Anthropic {
  if (!client) client = new Anthropic();
  return client;
}

export interface RationaleInput {
  payment: Payment;
  decision: Decision;
  signals: Record<string, number | string>;
  riskLevel?: string;
  policy: MerchantPolicy;
}

/** Returns undefined on any failure (API error, refusal, missing key) -- caller falls back to the deterministic rationale. */
export async function generateLLMRationale(input: RationaleInput): Promise<string | undefined> {
  try {
    const response = await getClient().messages.create({
      model: "claude-opus-5",
      max_tokens: 300,
      output_config: { effort: "low" },
      system:
        "You narrate one treasury decision already made by a deterministic risk engine for a merchant's " +
        "operations dashboard. You do not decide anything -- the decision and the signals behind it are " +
        "given to you as fact. Write 1-2 plain-language sentences a merchant would read in an audit log: " +
        "state the decision, cite the specific signals that drove it, and if it is a HOLD or ESCALATE, say " +
        "what the merchant should check. No preamble, no markdown, no restating these instructions.",
      messages: [
        {
          role: "user",
          content: JSON.stringify({
            decision: input.decision,
            direction: input.payment.direction,
            amount: input.payment.amount,
            counterparty: input.payment.from,
            signals: input.signals,
            riskLevel: input.riskLevel,
            merchantPolicy: input.policy,
          }),
        },
      ],
    });

    if (response.stop_reason === "refusal") return undefined;
    const textBlock = response.content.find((b): b is Anthropic.TextBlock => b.type === "text");
    const text = textBlock?.text?.trim();
    return text ? text : undefined;
  } catch {
    return undefined;
  }
}
