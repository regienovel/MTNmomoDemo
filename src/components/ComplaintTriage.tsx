// src/components/ComplaintTriage.tsx

import React, { useState } from "react";
import { COMPLAINT_EXAMPLES } from "../data/complaints";
import {
  analyseComplaint,
  type ComplaintAnalysis
} from "../scoring/complaints";

export const ComplaintTriage: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string>(COMPLAINT_EXAMPLES[0].id);
  const [text, setText] = useState<string>(COMPLAINT_EXAMPLES[0].text);
  const [analysis, setAnalysis] = useState<ComplaintAnalysis | null>(null);

  const handleExampleChange = (id: string) => {
    setSelectedId(id);
    const example = COMPLAINT_EXAMPLES.find(c => c.id === id);
    if (example) {
      setText(example.text);
      setAnalysis(null);
    }
  };

  const handleAnalyse = () => {
    if (!text.trim()) return;
    const result = analyseComplaint(text);
    setAnalysis(result);
  };

  const caseTypeLabel = (type: ComplaintAnalysis["caseType"]) => {
    switch (type) {
      case "SOCIAL_ENGINEERING":
        return "Social-engineering scam (customer coached to authorise)";
      case "SIM_SWAP":
        return "SIM-swap / identity takeover";
      case "AGENT_ERROR":
        return "Agent error or potential agent-side fraud";
      case "SYSTEM_BUG":
        return "Possible system / technical issue";
    }
  };

  const resolutionLabel = (res: ComplaintAnalysis["recommendedResolution"]) => {
    switch (res) {
      case "REFUND":
        return "Likely full refund";
      case "SHARED":
        return "Shared responsibility (partial refund / education)";
      case "DENY":
        return "Likely no refund (but strong education and escalation path)";
    }
  };

  return (
    <div className="h-full flex flex-col gap-4">
      <div className="bg-slate-900/80 border border-momoBlue/60 rounded-2xl p-4 shadow-lg">
        <h2 className="text-base font-semibold mb-1">
          MoMo Fraud Case Triage & Customer Trust Assistant
        </h2>
        <p className="text-xs text-slate-400 mb-3">
          Paste in WhatsApp chats, call-centre notes or email complaints. The assistant
          classifies the likely fraud type, proposes a fair resolution, and drafts
          clear, non-blaming explanations for the customer.
        </p>

        <div className="flex flex-col md:flex-row gap-4">
          {/* Left: complaint input */}
          <div className="flex-1 flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <label className="text-xs text-slate-300">
                Load Ghana-realistic example
              </label>
              <select
                className="text-xs bg-slate-950 border border-momoBlue/50 rounded-lg px-2 py-1 text-slate-100"
                value={selectedId}
                onChange={e => handleExampleChange(e.target.value)}
              >
                {COMPLAINT_EXAMPLES.map(ex => (
                  <option key={ex.id} value={ex.id}>
                    {ex.label}
                  </option>
                ))}
              </select>
            </div>
            <textarea
              className="flex-1 min-h-[160px] text-xs bg-slate-950 border border-momoBlue/60 rounded-xl px-3 py-2 text-slate-100 resize-y"
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Paste the customer's complaint transcript here..."
            />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleAnalyse}
                className="px-4 py-1.5 text-xs rounded-full bg-mtnYellow text-slate-950 font-semibold hover:bg-yellow-300 transition"
              >
                Analyse complaint
              </button>
            </div>
          </div>

          {/* Right: analysis output */}
          <div className="flex-1 bg-slate-950/70 border border-momoBlue/60 rounded-xl px-3 py-2 text-xs text-slate-100">
            {analysis ? (
              <>
                <p className="text-[11px] text-slate-400 mb-1">
                  Likely case type &amp; recommended treatment
                </p>
                <p className="text-sm font-semibold mb-1">
                  {caseTypeLabel(analysis.caseType)}
                </p>
                <p className="text-[11px] text-slate-400 mb-2">
                  Confidence:{" "}
                  <span className="text-slate-100">
                    {Math.round(analysis.confidence * 100)}%
                  </span>{" "}
                  · {resolutionLabel(analysis.recommendedResolution)}
                </p>

                <div className="mb-2">
                  <p className="text-[11px] font-semibold mb-1">
                    Investigator summary (plain English)
                  </p>
                  <p className="text-[11px] text-slate-200 whitespace-pre-line">
                    {analysis.explanation}
                  </p>
                </div>

                <div className="mb-2">
                  <p className="text-[11px] font-semibold mb-1">
                    Suggested call-centre script
                  </p>
                  <p className="text-[11px] text-slate-200 whitespace-pre-line">
                    {analysis.callScript}
                  </p>
                </div>

                <div>
                  <p className="text-[11px] font-semibold mb-1">
                    Suggested follow-up SMS to the customer
                  </p>
                  <p className="text-[11px] text-slate-200 whitespace-pre-line">
                    {analysis.smsScript}
                  </p>
                </div>
              </>
            ) : (
              <p className="text-[11px] text-slate-400">
                Run the analysis to see a suggested classification, resolution and
                scripts. This directly tackles the “MTN just blames customers and keeps
                quiet for 15 days” perception.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
