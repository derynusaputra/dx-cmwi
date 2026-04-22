"use client";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, ChevronDown, Clock, UserCheck, Send, Loader2,
  Layers, Zap, FlaskConical, Mail, FileText, AlertCircle
} from "lucide-react";
import { useState, useCallback } from "react";
import { apiClient } from "@/lib/axios";

// ─── Shared UI Components ────────────────────────────────────────────────────

const DropdownField = ({
  label, icon: Icon, value, onChange, options, placeholder,
}: {
  label: string; icon?: any; value: string;
  onChange: (v: string) => void; options: string[]; placeholder: string;
}) => (
  <div>
    <label className="block text-[15px] font-extrabold text-[#334155] mb-2.5">{label}</label>
    <div className="relative">
      {Icon && <Icon className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full h-14 ${Icon ? "pl-12" : "pl-4"} pr-10 bg-white border border-slate-200 rounded-[14px] outline-none text-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium appearance-none shadow-sm text-sm md:text-base hover:border-slate-300`}
      >
        <option value="" disabled>{placeholder}</option>
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
      <ChevronDown className="w-5 h-5 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
    </div>
  </div>
);

const TextField = ({
  label, value, onChange, placeholder = "", type = "text",
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string;
}) => (
  <div>
    <label className="block text-[15px] font-extrabold text-[#334155] mb-2.5">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full h-14 px-4 bg-white border border-slate-200 rounded-[14px] outline-none text-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium shadow-sm text-sm md:text-base hover:border-slate-300 placeholder:text-slate-400 placeholder:font-normal"
    />
  </div>
);

const EvalTextField = ({
  label, value, onChange,
}: {
  label: string; value: string; onChange: (v: string) => void;
}) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-bold text-slate-600">{label}</label>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="—"
      className="w-full h-11 px-3 bg-white border border-slate-200 rounded-xl outline-none text-sm font-medium text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-300"
    />
  </div>
);

const SectionCard = ({ title, icon: Icon, iconColor = "text-blue-600", children }: {
  title: string; icon: any; iconColor?: string; children: React.ReactNode;
}) => (
  <div className="w-full">
    <div className="flex items-center gap-2 mb-3 px-1">
      <Icon className={`w-5 h-5 ${iconColor}`} />
      <h3 className="text-base font-bold text-slate-800">{title}</h3>
    </div>
    <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-4 md:p-5">
      {children}
    </div>
  </div>
);

// ─── Dropdown Options ─────────────────────────────────────────────────────────

const OPTS = {
  deptSection: [
    "Dies Assurance", "PE Casting", "PE Machining", "PE Painting",
    "Prod. Casting", "Prod. Machining", "Prod. Painting",
    "PPIC / Shipment", "Equipment Assurance",
  ],
  wheelPhase: ["MassPro", "Trial", "Hokyuhin / Stop produksi lebih 1 tahun", "Lain-lain"],
  processWheel: ["After casting", "After hakidashi", "After HT", "After machining", "After painting", "Other"],
  productStatus: ["Wheel", "Cutting sample"],
  urgencyLevel: ["Top urgent", "Urgent", "Reguler"],
  noMold: ["#41", "#42", "#43", "#44", "#45", "#46", "#51", "#52", "#54", "#55", "#56"],
  noLineMachining: ["#1", "#2", "#3", "#4"],
};

// ─── Main Form ────────────────────────────────────────────────────────────────

export default function QCRForm() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [submitting, setSubmitting] = useState(false);
  const [startCheckTime, setStartCheckTime] = useState("");

  // Step 1 fields
  const [form1, setForm1] = useState({
    deptSection: "",
    purpose: "",
    wheelPhase: "",
    processWheel: "",
    productStatus: "",
    urgencyLevel: "",
    typeWheel: "",
    noMold: "",
    noLineMachining: "",
    noShot: "",
    lotPainting: "",
  });

  // Step 2 eval fields
  const [durability, setDurability] = useState({
    material_test: "", life_test: "", drum_test: "", impact_test: "", dimension: "",
  });
  const [capability, setCapability] = useState({
    k_mold: "", s_microstructural: "", compos_3d_contour_2d: "",
  });
  const [paintPerf, setPaintPerf] = useState({
    wr_test: "", cass_test: "", tac_test: "", sst_test: "", paint_ability: "", other: "",
  });
  const [spore, setSpore] = useState("");
  const [specialNotes, setSpecialNotes] = useState("");
  const [emailSLSPV, setEmailSLSPV] = useState("");
  const [emailAMGMGR, setEmailAMGMGR] = useState("");

  const set1 = useCallback((key: keyof typeof form1) => (v: string) =>
    setForm1(prev => ({ ...prev, [key]: v })), []);
  const setDur = useCallback((key: keyof typeof durability) => (v: string) =>
    setDurability(prev => ({ ...prev, [key]: v })), []);
  const setCap = useCallback((key: keyof typeof capability) => (v: string) =>
    setCapability(prev => ({ ...prev, [key]: v })), []);
  const setPP = useCallback((key: keyof typeof paintPerf) => (v: string) =>
    setPaintPerf(prev => ({ ...prev, [key]: v })), []);

  const today = new Date().toISOString().split("T")[0];

  const step1Required = form1.deptSection && form1.wheelPhase && form1.processWheel &&
    form1.productStatus && form1.urgencyLevel;

  const handleNext = () => {
    if (!step1Required) {
      alert("Harap lengkapi semua field wajib terlebih dahulu!");
      return;
    }
    setStartCheckTime(new Date().toISOString());
    setStep(2);
  };

  const handleSubmit = async () => {
    // Filter out empty eval fields
    const filterEmpty = (obj: Record<string, string>) =>
      Object.fromEntries(Object.entries(obj).filter(([, v]) => v.trim() !== ""));

    const payload = {
      date_request: today,
      dept_section: form1.deptSection,
      purpose: form1.purpose,
      wheel_phase: form1.wheelPhase,
      process_wheel: form1.processWheel,
      product_status: form1.productStatus,
      urgency_level: form1.urgencyLevel,
      type_wheel: form1.typeWheel,
      no_mold: form1.noMold,
      no_line_machining: form1.noLineMachining,
      no_shot: form1.noShot,
      lot_painting: form1.lotPainting,
      durability: filterEmpty(durability),
      capability: filterEmpty(capability),
      paint_performance: filterEmpty(paintPerf),
      spore,
      special_notes: specialNotes,
      email_sl_spv: emailSLSPV,
      email_amg_mgr: emailAMGMGR,
      start_check: startCheckTime || undefined,
    };

    setSubmitting(true);
    try {
      await apiClient.post("/api/qcr", payload);
      alert("QCR berhasil disimpan!");
      router.back();
    } catch (err: any) {
      alert(err.response?.data?.message || "Gagal menyimpan QCR.");
    } finally {
      setSubmitting(false);
    }
  };

  const urgencyColor = {
    "Top urgent": "bg-red-50 text-red-700 border-red-200",
    "Urgent": "bg-amber-50 text-amber-700 border-amber-200",
    "Reguler": "bg-emerald-50 text-emerald-700 border-emerald-200",
  }[form1.urgencyLevel] ?? "bg-slate-50 text-slate-600 border-slate-200";

  return (
    <div className="bg-slate-50 min-h-screen pb-24 font-sans w-full flex flex-col items-center">
      <style dangerouslySetInnerHTML={{__html: `
        .fade-up { animation: fadeUp 0.35s ease-out forwards; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        select option { font-weight: 500; }
      `}} />

      {/* Sticky Header */}
      <div className="w-full bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => step === 2 ? setStep(1) : router.back()}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-800 leading-tight">QCR Form</h1>
            <p className="text-xs text-slate-400 font-medium">Quality Control Request</p>
          </div>
        </div>
        {/* Step indicator */}
        <div className="flex items-center gap-1.5">
          {[1, 2].map(s => (
            <div key={s} className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-all ${
              step >= s ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-400"
            }`}>{s}</div>
          ))}
        </div>
      </div>

      <div className="w-full max-w-xl space-y-5 pt-6 px-4 sm:px-6">

        {/* ── STEP 1 ─────────────────────────────────────────────────────── */}
        {step === 1 && (
          <div className="fade-up space-y-5">
            <div className="bg-white rounded-[20px] border border-slate-200 shadow-sm p-6 md:p-8">
              <div className="mb-6">
                <h2 className="text-lg md:text-xl font-extrabold text-slate-800 tracking-tight">Data Awal Request</h2>
                <p className="text-sm text-slate-500 mt-1">Isi informasi dasar sebelum melanjutkan ke item evaluasi</p>
              </div>

              <div className="space-y-5">
                {/* Date (auto, read-only display) */}
                <div className="flex items-center gap-3 bg-slate-50 rounded-[14px] px-4 h-14 border border-slate-200">
                  <Clock className="w-5 h-5 text-slate-400 shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tanggal</p>
                    <p className="text-sm font-bold text-slate-800">{new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
                  </div>
                </div>

                <DropdownField label="Dept. / Section *" icon={UserCheck} value={form1.deptSection} onChange={set1("deptSection")} options={OPTS.deptSection} placeholder="Pilih Dept / Section" />
                <TextField label="Purpose" value={form1.purpose} onChange={set1("purpose")} placeholder="Jelaskan tujuan request..." />
                <DropdownField label="Wheel Phase *" value={form1.wheelPhase} onChange={set1("wheelPhase")} options={OPTS.wheelPhase} placeholder="Pilih Wheel Phase" />
                <DropdownField label="Process Wheel *" value={form1.processWheel} onChange={set1("processWheel")} options={OPTS.processWheel} placeholder="Pilih Process Wheel" />
                <DropdownField label="Product Status *" value={form1.productStatus} onChange={set1("productStatus")} options={OPTS.productStatus} placeholder="Pilih Product Status" />
                <DropdownField label="Urgency Level *" value={form1.urgencyLevel} onChange={set1("urgencyLevel")} options={OPTS.urgencyLevel} placeholder="Pilih Urgency Level" />

                {/* Urgency badge preview */}
                {form1.urgencyLevel && (
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-bold ${urgencyColor}`}>
                    <AlertCircle className="w-4 h-4" />
                    {form1.urgencyLevel}
                  </div>
                )}

                <TextField label="Type Wheel" value={form1.typeWheel} onChange={set1("typeWheel")} placeholder="Contoh: 18X7A1-CUA-PMS-GY45CLF" />

                <div className="grid grid-cols-2 gap-4">
                  <DropdownField label="No. Mold" value={form1.noMold} onChange={set1("noMold")} options={OPTS.noMold} placeholder="Pilih No. Mold" />
                  <DropdownField label="No. Line Machining" value={form1.noLineMachining} onChange={set1("noLineMachining")} options={OPTS.noLineMachining} placeholder="Pilih Line" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <TextField label="No. Shot" value={form1.noShot} onChange={set1("noShot")} placeholder="—" />
                  <TextField label="Lot Painting" value={form1.lotPainting} onChange={set1("lotPainting")} placeholder="—" />
                </div>

                <div className="pt-4 mt-2 border-t border-slate-100">
                  <button
                    onClick={handleNext}
                    disabled={!step1Required}
                    className={`w-full h-12 font-extrabold rounded-xl transition-all text-base flex items-center justify-center gap-2 ${
                      step1Required
                        ? "bg-blue-600 hover:bg-blue-700 text-white active:scale-[0.98] shadow-sm hover:shadow-md"
                        : "bg-slate-200 text-slate-400 cursor-not-allowed"
                    }`}
                  >
                    Lanjut ke Item Evaluasi
                    <ArrowLeft className="w-5 h-5 rotate-180" />
                  </button>
                  {!step1Required && (
                    <p className="text-center text-xs text-amber-600 font-medium mt-2">Lengkapi field bertanda * terlebih dahulu</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 2 ─────────────────────────────────────────────────────── */}
        {step === 2 && (
          <div className="fade-up space-y-5">

            {/* Summary Card Step 1 */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
              <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ringkasan Data Awal</span>
                <button
                  onClick={() => setStep(1)}
                  className="text-blue-600 hover:text-blue-700 font-bold text-xs uppercase tracking-wider underline decoration-blue-500/30 underline-offset-4"
                >
                  Edit
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3 text-xs">
                {[
                  ["Dept / Section", form1.deptSection],
                  ["Wheel Phase", form1.wheelPhase],
                  ["Process Wheel", form1.processWheel],
                  ["Product Status", form1.productStatus],
                  ["Type Wheel", form1.typeWheel || "—"],
                  ["No. Mold", form1.noMold || "—"],
                  ["Line Machining", form1.noLineMachining || "—"],
                  ["No. Shot", form1.noShot || "—"],
                  ["Lot Painting", form1.lotPainting || "—"],
                ].map(([k, v]) => (
                  <div key={k}>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{k}</p>
                    <p className="font-bold text-slate-800 mt-0.5 truncate">{v}</p>
                  </div>
                ))}
              </div>
              {/* Urgency badge */}
              <div className="mt-3 pt-2 border-t border-slate-100">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold ${urgencyColor}`}>
                  <AlertCircle className="w-3.5 h-3.5" />
                  {form1.urgencyLevel}
                </span>
              </div>
            </div>

            {/* Durability */}
            <SectionCard title="Durability" icon={Layers} iconColor="text-indigo-600">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <EvalTextField label="Material Test" value={durability.material_test} onChange={setDur("material_test")} />
                <EvalTextField label="Life Test" value={durability.life_test} onChange={setDur("life_test")} />
                <EvalTextField label="Drum Test" value={durability.drum_test} onChange={setDur("drum_test")} />
                <EvalTextField label="Impact Test" value={durability.impact_test} onChange={setDur("impact_test")} />
                <EvalTextField label="Dimension" value={durability.dimension} onChange={setDur("dimension")} />
              </div>
            </SectionCard>

            {/* Capability Process */}
            <SectionCard title="Capability Process" icon={FlaskConical} iconColor="text-violet-600">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <EvalTextField label="K-Mold" value={capability.k_mold} onChange={setCap("k_mold")} />
                <EvalTextField label="S / Microstructural" value={capability.s_microstructural} onChange={setCap("s_microstructural")} />
                <EvalTextField label="Compos 3D / Contour 2D" value={capability.compos_3d_contour_2d} onChange={setCap("compos_3d_contour_2d")} />
              </div>
            </SectionCard>

            {/* Paint Performance */}
            <SectionCard title="Paint Performance" icon={Zap} iconColor="text-amber-500">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <EvalTextField label="WR Test" value={paintPerf.wr_test} onChange={setPP("wr_test")} />
                <EvalTextField label="CASS Test" value={paintPerf.cass_test} onChange={setPP("cass_test")} />
                <EvalTextField label="TAC Test" value={paintPerf.tac_test} onChange={setPP("tac_test")} />
                <EvalTextField label="SST Test" value={paintPerf.sst_test} onChange={setPP("sst_test")} />
                <EvalTextField label="Paint Ability" value={paintPerf.paint_ability} onChange={setPP("paint_ability")} />
                <EvalTextField label="Other" value={paintPerf.other} onChange={setPP("other")} />
              </div>
            </SectionCard>

            {/* Spore + Catatan Khusus */}
            <SectionCard title="Catatan & Keterangan" icon={FileText} iconColor="text-slate-500">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1.5">Spore</label>
                  <input
                    type="text"
                    value={spore}
                    onChange={(e) => setSpore(e.target.value)}
                    placeholder="—"
                    className="w-full h-11 px-3 bg-white border border-slate-200 rounded-xl outline-none text-sm font-medium text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-300"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1.5">Catatan Khusus</label>
                  <textarea
                    value={specialNotes}
                    onChange={(e) => setSpecialNotes(e.target.value)}
                    placeholder="Tambahkan catatan atau informasi tambahan..."
                    rows={4}
                    className="w-full p-3 border border-slate-200 rounded-xl outline-none text-sm text-slate-800 resize-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all bg-white placeholder:text-slate-300"
                  />
                </div>
              </div>
            </SectionCard>

            {/* Email Approval */}
            <SectionCard title="Email Approval" icon={Mail} iconColor="text-blue-500">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1.5">Email SL / SPV</label>
                  <input
                    type="email"
                    value={emailSLSPV}
                    onChange={(e) => setEmailSLSPV(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full h-11 px-3 bg-white border border-slate-200 rounded-xl outline-none text-sm font-medium text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-300"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Email untuk approval</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1.5">Email AMG / MGR</label>
                  <input
                    type="email"
                    value={emailAMGMGR}
                    onChange={(e) => setEmailAMGMGR(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full h-11 px-3 bg-white border border-slate-200 rounded-xl outline-none text-sm font-medium text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-300"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Email untuk approval</p>
                </div>
              </div>
            </SectionCard>

            {/* Submit */}
            <div className="pb-8 pt-2">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className={`w-full h-14 font-bold rounded-xl transition-all text-base flex items-center justify-center gap-2 ${
                  submitting
                    ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white active:scale-[0.98] shadow-sm hover:shadow-md"
                }`}
              >
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                {submitting ? "Menyimpan..." : "Submit QCR Request"}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
