// src/scoring/complaints.ts

export type ComplaintCaseType =
  | "SOCIAL_ENGINEERING"
  | "SIM_SWAP"
  | "AGENT_ERROR"
  | "SYSTEM_BUG";

export type ComplaintResolution = "REFUND" | "SHARED" | "DENY";

export interface ComplaintAnalysis {
  caseType: ComplaintCaseType;
  confidence: number; // 0–1
  recommendedResolution: ComplaintResolution;
  explanation: string;
  callScript: string;
  smsScript: string;
}

function includesAny(text: string, keywords: string[]): boolean {
  return keywords.some(k => text.includes(k.toLowerCase()));
}

export function analyseComplaint(raw: string): ComplaintAnalysis {
  const text = raw.toLowerCase();

  const isSimSwap =
    includesAny(text, ["sim swap", "new sim", "sim was changed"]) ||
    (includesAny(text, ["phone off", "no network"]) &&
      includesAny(text, ["cash out", "withdraw", "agent"]));

  const isAgent =
    includesAny(text, ["agent"]) &&
    includesAny(text, ["gave me cash", "cash out", "cash-out", "cashout"]);

  const isSocial =
    includesAny(text, ["otp", "pin", "code", "promotion", "promo"]) &&
    includesAny(text, ["they called", "i got a call", "they said"]) &&
    !isSimSwap;

  const isSystem =
    includesAny(text, ["system", "deducted twice", "double debit", "network error"]) &&
    !isSocial &&
    !isSimSwap;

  let caseType: ComplaintCaseType = "SOCIAL_ENGINEERING";
  if (isSimSwap) caseType = "SIM_SWAP";
  else if (isAgent) caseType = "AGENT_ERROR";
  else if (isSystem) caseType = "SYSTEM_BUG";

  let confidence = 0.7;
  if (isSocial || isSimSwap || isAgent || isSystem) confidence = 0.9;

  let recommendedResolution: ComplaintResolution = "SHARED";
  let explanation = "";
  let callScript = "";
  let smsScript = "";

  switch (caseType) {
    case "SOCIAL_ENGINEERING":
      recommendedResolution = "SHARED";
      explanation =
        "The language in this complaint suggests a classic social-engineering pattern: the customer was called about a promotion or prize and guided step-by-step to enter their MoMo PIN/OTP. The transactions were technically authorised from the customer’s handset, but under pressure and deception.";
      callScript =
        "Madam/Sir, thank you for your patience. From our checks, we can see that the transactions were done from your SIM and your correct PIN/OTP was entered after a call claiming to be from MTN. This is a known scam pattern we are actively fighting.\n\nWe are opening a fraud case for you and will review whether we can assist with a goodwill refund depending on reversals and recovery from the receiving wallets. We will also block the suspected wallets and add your number to our No-Yawa education list so you receive the latest scam alerts.";
      smsScript =
        "MTN MoMo: We have reviewed your complaint. Our checks show your PIN/OTP was entered from your phone after a scam call. This is a known social-engineering fraud. We are investigating reversals and recovery and will update you within 5 working days. Remember: MTN will NEVER ask for your PIN/OTP on a call. Dial *170# > 6 > 5 for fraud tips.";
      break;

    case "SIM_SWAP":
      recommendedResolution = "REFUND";
      explanation =
        "The complaint references loss of network / SIM change followed by cash-outs the customer did not authorise. This fits a SIM-swap or identity-takeover case. Liability is likely with the operator/agent side, especially if KYC or SIM replacement controls failed.";
      callScript =
        "Madam/Sir, from our checks we see your SIM was replaced and immediately afterwards there were cash-outs at agents you have not used before. This looks like a SIM-swap fraud, not something you authorised yourself.\n\nWe are treating this as a high-priority fraud case. We will temporarily block the affected wallets and work with our field team and the agents involved. Our aim is to recover and refund as much as possible, and to fix any gaps in our SIM replacement process.";
      smsScript =
        "MTN MoMo: Your complaint appears to be linked to a SIM-swap fraud. We have blocked risky activity on your wallet and are investigating with our field team and agents. We will update you on recovery and refund within 3–5 working days. Visit any MTN shop with your Ghana Card if you suspect an unauthorised SIM change.";
      break;

    case "AGENT_ERROR":
      recommendedResolution = "SHARED";
      explanation =
        "The complaint centres on what happened at a specific MoMo agent (cash given but balance not correct / wrong number entered). This points to either an honest agent mistake or deliberate agent-side fraud. Responsibility is usually shared between customer, agent and MTN, depending on CCTV, logs and training.";
      callScript =
        "Madam/Sir, thank you for explaining. Our records show the cash-out was processed at Agent [code], but the amount/number may not match what you expected. We are treating this as an agent-related case.\n\nWe will review the agent’s transaction history, CCTV where available, and previous complaints. If we confirm agent error or misconduct, we will take action on the agent and look at refund options for you. We’ll give you an update within 3 working days.";
      smsScript =
        "MTN MoMo: We are reviewing your complaint involving a MoMo agent. Our team is checking the agent’s records and any previous cases. We will update you within 3 working days on the outcome and any refund or agent action. Thank you for your patience.";
      break;

    case "SYSTEM_BUG":
      recommendedResolution = "REFUND";
      explanation =
        "The complaint describes deductions without corresponding transactions or double-debits, and does not mention scam calls, SIM swaps or agents. This points to a potential system or integration issue on MTN’s side. In such cases MTN should correct and refund once verified.";
      callScript =
        "Madam/Sir, from what you have described and from our logs, this looks like a possible system error where your account was charged incorrectly. We are escalating this to our technical team to confirm.\n\nOnce confirmed, we will correct the balance and refund any affected amount as quickly as possible. We are sorry for the inconvenience — you did nothing wrong here.";
      smsScript =
        "MTN MoMo: Your complaint appears to be caused by a system issue. We have escalated it to our technical team and will correct any wrong deductions as soon as possible. You will receive an update within 2 working days. We apologise for the inconvenience.";
      break;
  }

  return {
    caseType,
    confidence,
    recommendedResolution,
    explanation,
    callScript,
    smsScript
  };
}
