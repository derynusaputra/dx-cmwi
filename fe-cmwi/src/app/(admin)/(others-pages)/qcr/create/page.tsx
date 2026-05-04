"use client";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, ChevronDown, Clock, UserCheck, Send, Loader2,
  Layers, Zap, FlaskConical, Mail, FileText, AlertCircle
} from "lucide-react";
import { useState, useCallback } from "react";
import { apiClient } from "@/lib/axios";

// ─── Shared UI ──────────────────────────────────────────────────────────────

const DropdownField = ({ label, icon: Icon, value, onChange, options, placeholder }: {
  label: string; icon?: any; value: string; onChange: (v: string) => void; options: string[]; placeholder: string;
}) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>
    <div className="relative">
      {Icon && <Icon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />}
      <select value={value} onChange={e => onChange(e.target.value)}
        className={`w-full h-11 ${Icon ? "pl-9" : "pl-3"} pr-9 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 rounded-xl outline-none text-sm text-gray-800 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none`}>
        <option value="" disabled>{placeholder}</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
    </div>
  </div>
);

const TextField = ({ label, value, onChange, placeholder = "", type = "text" }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className="w-full h-11 px-3 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 rounded-xl outline-none text-sm text-gray-800 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-gray-400" />
  </div>
);

const EvalField = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => (
  <div>
    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">{label}</label>
    <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder="—"
      className="w-full h-9 px-3 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 rounded-lg outline-none text-sm text-gray-800 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all" />
  </div>
);

// ─── Options ─────────────────────────────────────────────────────────────────

const OPTS = {
  dept: ["Dies Assurance","PE Casting","PE Machining","PE Painting","Prod. Casting","Prod. Machining","Prod. Painting","PPIC / Shipment","Equipment Assurance"],
  wheelPhase: ["MassPro","Trial","Hokyuhin / Stop produksi lebih 1 tahun","Lain-lain"],
  processWheel: ["After casting","After hakidashi","After HT","After machining","After painting","Other"],
  productStatus: ["Wheel","Cutting sample"],
  urgency: ["Top urgent","Urgent","Reguler"],
  noMold: ["#41","#42","#43","#44","#45","#46","#51","#52","#54","#55","#56"],
  noLine: ["#1","#2","#3","#4"],
};

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function QCRCreatePage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [submitting, setSubmitting] = useState(false);

  const [f1, setF1] = useState({ dept: "", purpose: "", wheelPhase: "", processWheel: "", productStatus: "", urgency: "", typeWheel: "", noMold: "", noLine: "", noShot: "", lotPainting: "" });
  const [dur, setDur] = useState({ material_test: "", life_test: "", drum_test: "", impact_test: "", dimension: "" });
  const [cap, setCap] = useState({ k_mold: "", s_microstructural: "", compos_3d_contour_2d: "" });
  const [pp, setPP] = useState({ wr_test: "", cass_test: "", tac_test: "", sst_test: "", paint_ability: "", other: "" });
  const [spore, setSpore] = useState("");
  const [notes, setNotes] = useState("");
  const [emailSL, setEmailSL] = useState("");
  const [emailAMG, setEmailAMG] = useState("");

  const set1 = useCallback((k: keyof typeof f1) => (v: string) => setF1(p => ({ ...p, [k]: v })), []);
  const setD = useCallback((k: keyof typeof dur) => (v: string) => setDur(p => ({ ...p, [k]: v })), []);
  const setC = useCallback((k: keyof typeof cap) => (v: string) => setCap(p => ({ ...p, [k]: v })), []);
  const setP = useCallback((k: keyof typeof pp) => (v: string) => setPP(p => ({ ...p, [k]: v })), []);

  const step1OK = f1.dept && f1.wheelPhase && f1.processWheel && f1.productStatus && f1.urgency;

  const urgencyColor = { "Top urgent": "bg-red-50 text-red-700 ring-red-200 dark:bg-red-900/20 dark:text-red-300 dark:ring-red-700", "Urgent": "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:ring-amber-700", "Reguler": "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:ring-emerald-700" }[f1.urgency] ?? "bg-gray-100 text-gray-500 ring-gray-200 dark:bg-white/10 dark:text-gray-400";

  const handleSubmit = async () => {
    const filterEmpty = (o: Record<string, string>) => Object.fromEntries(Object.entries(o).filter(([, v]) => v.trim() !== ""));
    const payload = {
      date_request: new Date().toISOString().split("T")[0],
      dept_section: f1.dept, purpose: f1.purpose, wheel_phase: f1.wheelPhase, process_wheel: f1.processWheel,
      product_status: f1.productStatus, urgency_level: f1.urgency, type_wheel: f1.typeWheel,
      no_mold: f1.noMold, no_line_machining: f1.noLine, no_shot: f1.noShot, lot_painting: f1.lotPainting,
      durability: filterEmpty(dur), capability: filterEmpty(cap), paint_performance: filterEmpty(pp),
      spore, special_notes: notes, email_sl_spv: emailSL, email_amg_mgr: emailAMG,
    };
    setSubmitting(true);
    try {
      await apiClient.post("/api/qcr", payload);
      router.push("/qcr");
    } catch (err: any) {
      alert(err.response?.data?.message || "Gagal menyimpan QCR.");
    } finally { setSubmitting(false); }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => step === 2 ? setStep(1) : router.back()}
          className="p-2 rounded-xl border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Buat QCR Request</h1>
          <p className="text-xs text-gray-400 mt-0.5">Quality Control Request</p>
        </div>
        {/* Step indicator */}
        <div className="ml-auto flex items-center gap-2">
          {[1, 2].map(s => (
            <div key={s} className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-all ${step >= s ? "bg-blue-600 text-white" : "bg-gray-100 dark:bg-white/10 text-gray-400"}`}>{s}</div>
          ))}
        </div>
      </div>

      {/* Step 1 */}
      {step === 1 && (
        <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/10 rounded-2xl p-6 space-y-5">
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white">Data Awal Request</h2>
            <p className="text-sm text-gray-400 mt-0.5">Isi informasi dasar sebelum melanjutkan ke item evaluasi</p>
          </div>

          {/* Auto date */}
          <div className="flex items-center gap-3 bg-gray-50 dark:bg-white/5 rounded-xl px-4 py-3 border border-gray-100 dark:border-white/5">
            <Clock className="w-4 h-4 text-gray-400 shrink-0" />
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Tanggal</p>
              <p className="text-sm font-bold text-gray-800 dark:text-white">{new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
            </div>
          </div>

          <DropdownField label="Dept. / Section *" icon={UserCheck} value={f1.dept} onChange={set1("dept")} options={OPTS.dept} placeholder="Pilih Dept / Section" />
          <TextField label="Purpose" value={f1.purpose} onChange={set1("purpose")} placeholder="Jelaskan tujuan request..." />
          <DropdownField label="Wheel Phase *" value={f1.wheelPhase} onChange={set1("wheelPhase")} options={OPTS.wheelPhase} placeholder="Pilih Wheel Phase" />
          <DropdownField label="Process Wheel *" value={f1.processWheel} onChange={set1("processWheel")} options={OPTS.processWheel} placeholder="Pilih Process Wheel" />
          <DropdownField label="Product Status *" value={f1.productStatus} onChange={set1("productStatus")} options={OPTS.productStatus} placeholder="Pilih Product Status" />
          <DropdownField label="Urgency Level *" icon={AlertCircle} value={f1.urgency} onChange={set1("urgency")} options={OPTS.urgency} placeholder="Pilih Urgency Level" />

          {f1.urgency && (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ring-1 ${urgencyColor}`}>
              <AlertCircle className="w-3.5 h-3.5" /> {f1.urgency}
            </span>
          )}

          <TextField label="Type Wheel" value={f1.typeWheel} onChange={set1("typeWheel")} placeholder="Contoh: 18X7A1-CUA-PMS-GY45CLF" />

          <div className="grid grid-cols-2 gap-4">
            <DropdownField label="No. Mold" value={f1.noMold} onChange={set1("noMold")} options={OPTS.noMold} placeholder="Pilih No. Mold" />
            <DropdownField label="No. Line Machining" value={f1.noLine} onChange={set1("noLine")} options={OPTS.noLine} placeholder="Pilih Line" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <TextField label="No. Shot" value={f1.noShot} onChange={set1("noShot")} placeholder="—" />
            <TextField label="Lot Painting" value={f1.lotPainting} onChange={set1("lotPainting")} placeholder="—" />
          </div>

          <div className="pt-2 border-t border-gray-100 dark:border-white/5">
            <button onClick={() => { if (!step1OK) { alert("Harap lengkapi field wajib (*)"); return; } setStep(2); }}
              className={`w-full h-11 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${step1OK ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm" : "bg-gray-100 dark:bg-white/10 text-gray-400 cursor-not-allowed"}`}>
              Lanjut ke Item Evaluasi <ArrowLeft className="w-4 h-4 rotate-180" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <div className="space-y-5">
          {/* Summary */}
          <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/10 rounded-2xl p-4">
            <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-100 dark:border-white/5">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Ringkasan Step 1</span>
              <button onClick={() => setStep(1)} className="text-xs font-bold text-blue-600 hover:text-blue-700 underline">Edit</button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              {[["Dept", f1.dept], ["Wheel Phase", f1.wheelPhase], ["Process", f1.processWheel], ["Product", f1.productStatus], ["Type Wheel", f1.typeWheel || "—"], ["No. Mold", f1.noMold || "—"]].map(([k, v]) => (
                <div key={k}><p className="text-[10px] font-bold text-gray-400 uppercase">{k}</p><p className="font-semibold text-gray-800 dark:text-white mt-0.5 truncate">{v}</p></div>
              ))}
            </div>
            <span className={`inline-flex items-center gap-1 mt-3 px-2.5 py-1 rounded-full text-xs font-bold ring-1 ${urgencyColor}`}>
              <AlertCircle className="w-3 h-3" /> {f1.urgency}
            </span>
          </div>

          {/* Durability */}
          <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/10 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4"><Layers className="w-4 h-4 text-indigo-600" /><h3 className="text-sm font-bold text-gray-800 dark:text-white">Durability</h3></div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <EvalField label="Material Test" value={dur.material_test} onChange={setD("material_test")} />
              <EvalField label="Life Test" value={dur.life_test} onChange={setD("life_test")} />
              <EvalField label="Drum Test" value={dur.drum_test} onChange={setD("drum_test")} />
              <EvalField label="Impact Test" value={dur.impact_test} onChange={setD("impact_test")} />
              <EvalField label="Dimension" value={dur.dimension} onChange={setD("dimension")} />
            </div>
          </div>

          {/* Capability */}
          <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/10 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4"><FlaskConical className="w-4 h-4 text-violet-600" /><h3 className="text-sm font-bold text-gray-800 dark:text-white">Capability Process</h3></div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <EvalField label="K-Mold" value={cap.k_mold} onChange={setC("k_mold")} />
              <EvalField label="S / Microstructural" value={cap.s_microstructural} onChange={setC("s_microstructural")} />
              <EvalField label="Compos 3D / Contour 2D" value={cap.compos_3d_contour_2d} onChange={setC("compos_3d_contour_2d")} />
            </div>
          </div>

          {/* Paint Performance */}
          <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/10 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4"><Zap className="w-4 h-4 text-amber-500" /><h3 className="text-sm font-bold text-gray-800 dark:text-white">Paint Performance</h3></div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <EvalField label="WR Test" value={pp.wr_test} onChange={setP("wr_test")} />
              <EvalField label="CASS Test" value={pp.cass_test} onChange={setP("cass_test")} />
              <EvalField label="TAC Test" value={pp.tac_test} onChange={setP("tac_test")} />
              <EvalField label="SST Test" value={pp.sst_test} onChange={setP("sst_test")} />
              <EvalField label="Paint Ability" value={pp.paint_ability} onChange={setP("paint_ability")} />
              <EvalField label="Other" value={pp.other} onChange={setP("other")} />
            </div>
          </div>

          {/* Catatan */}
          <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/10 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4"><FileText className="w-4 h-4 text-gray-500" /><h3 className="text-sm font-bold text-gray-800 dark:text-white">Catatan & Keterangan</h3></div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Spore</label>
                <input type="text" value={spore} onChange={e => setSpore(e.target.value)} placeholder="—"
                  className="w-full h-9 px-3 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 rounded-lg outline-none text-sm text-gray-800 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Catatan Khusus</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Tambahkan catatan..."
                  className="w-full p-3 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 rounded-lg outline-none text-sm text-gray-800 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none" />
              </div>
            </div>
          </div>

          {/* Email Approval */}
          <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/10 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4"><Mail className="w-4 h-4 text-blue-500" /><h3 className="text-sm font-bold text-gray-800 dark:text-white">Email Approval</h3></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Email SL / SPV</label>
                <input type="email" value={emailSL} onChange={e => setEmailSL(e.target.value)} placeholder="email@example.com"
                  className="w-full h-9 px-3 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 rounded-lg outline-none text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-gray-800 dark:text-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Email Request Manager</label>
                <input type="email" value={emailAMG} onChange={e => setEmailAMG(e.target.value)} placeholder="email@example.com"
                  className="w-full h-9 px-3 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 rounded-lg outline-none text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-gray-800 dark:text-white" />
              </div>
            </div>
          </div>

          <button onClick={handleSubmit} disabled={submitting}
            className={`w-full h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${submitting ? "bg-gray-100 dark:bg-white/10 text-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"}`}>
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {submitting ? "Menyimpan..." : "Submit QCR Request"}
          </button>
        </div>
      )}
    </div>
  );
}
