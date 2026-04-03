"use client";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, ChevronDown, ListChecks, Calendar, Clock, UserCheck, 
  Camera, MessageSquare, ThumbsUp, ThumbsDown, Paperclip, Send,
  PaintBucket, Sun, Ruler, Users, Loader2, Upload, X, SwitchCamera
} from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/axios";

type BrightnessSpec = {
  L: boolean;
  a: boolean;
  b: boolean;
  dE: string | null;
  dL: string | null;
};

type ThicknessSpec = {
  disk: number;
  spoke: number;
  flange: number;
  spokeVerticalA: number;
  spokeVerticalB: number;
  beadOuter: number;
  beadOuter2: number;
  backRimInner: number;
  backRimOuter: number;
  backSpokeInner: number;
  backSpokeOuter: number;
};

type SpecData = {
  brightness: {
    disk: BrightnessSpec | null;
    spoke: BrightnessSpec | null;
    flange: BrightnessSpec | null;
  };
  thickness: ThicknessSpec;
  gloss: {
    machining: string | null;
    casting: string | null;
  };
};

const B_STD: BrightnessSpec = { L: true, a: true, b: true, dE: "Max. 3", dL: null };
const B_CR: BrightnessSpec = { L: true, a: true, b: true, dE: null, dL: "-2 ~ +6" };

const T_STD: ThicknessSpec = { disk: 35, spoke: 35, flange: 35, spokeVerticalA: 50, spokeVerticalB: 50, beadOuter: 10, beadOuter2: 10, backRimInner: 20, backRimOuter: 20, backSpokeInner: 30, backSpokeOuter: 30 };
const T_135: ThicknessSpec = { ...T_STD, disk: 135, spoke: 135, flange: 135 };
const T_20: ThicknessSpec = { disk: 20, spoke: 20, flange: 20, spokeVerticalA: 20, spokeVerticalB: 20, beadOuter: 5, beadOuter2: 5, backRimInner: 10, backRimOuter: 10, backSpokeInner: 10, backSpokeOuter: 10 };
const T_45: ThicknessSpec = { ...T_20, disk: 45, spoke: 45, flange: 45 };
const T_135_35: ThicknessSpec = { ...T_135, spokeVerticalA: 35, spokeVerticalB: 35 };

const PART_SPECS: Record<string, SpecData> = {
  "18X7A1-CUA-PMS-GY45CLF": { brightness: { disk: B_STD, spoke: B_STD, flange: B_STD }, thickness: T_STD, gloss: { machining: null, casting: null } },
  "18X7.5A1-CTM-PMS-GY45MF": { brightness: { disk: null, spoke: null, flange: null }, thickness: T_135, gloss: { machining: "Max. 17", casting: null } },
  "17X6A1-CDL-GY45CLF": { brightness: { disk: B_STD, spoke: B_STD, flange: B_STD }, thickness: T_STD, gloss: { machining: null, casting: null } },
  "17X6A1-CDL-BK01CLF": { brightness: { disk: B_STD, spoke: B_STD, flange: B_STD }, thickness: T_STD, gloss: { machining: null, casting: null } },
  "D17X6.5A1-DF-PMS-BK01F-ZJ": { brightness: { disk: null, spoke: null, flange: B_STD }, thickness: T_135_35, gloss: { machining: null, casting: null } },
  "D17X6.5A1-DF-PMS-BK01CLF-ZJ": { brightness: { disk: null, spoke: null, flange: B_STD }, thickness: T_135_35, gloss: { machining: null, casting: null } },
  "A17X6.5A1-TM-PMS-GY52F": { brightness: { disk: B_STD, spoke: B_STD, flange: B_STD }, thickness: T_45, gloss: { machining: null, casting: "Min. 85" } },
  "A18X7A1-TN1-PMS-BK01CLF": { brightness: { disk: B_STD, spoke: B_STD, flange: B_STD }, thickness: T_20, gloss: { machining: "Min. 85", casting: "Min. 85" } },
  "16X6A1-BGX-PMS-BK01F": { brightness: { disk: B_STD, spoke: null, flange: B_STD }, thickness: T_135, gloss: { machining: null, casting: null } },
  "16X6A1-BGX-PMS-GY45CLF": { brightness: { disk: B_STD, spoke: null, flange: B_STD }, thickness: T_STD, gloss: { machining: null, casting: null } },
  "D18X7A1-DU-PMS-BK01CLF": { brightness: { disk: B_STD, spoke: B_STD, flange: B_STD }, thickness: T_STD, gloss: { machining: null, casting: null } },
  "D17X6.5A1-DN-PMS-BK01CLF": { brightness: { disk: B_STD, spoke: B_STD, flange: B_STD }, thickness: T_STD, gloss: { machining: null, casting: null } },
  "A17X6.5A1-TH2-PMS-GY52CLF": { brightness: { disk: B_STD, spoke: B_STD, flange: B_STD }, thickness: T_20, gloss: { machining: null, casting: "Min. 85" } },
  "18X7A1-BTY-PMS-GY45CLF-ZJ": { brightness: { disk: B_STD, spoke: B_STD, flange: null }, thickness: T_STD, gloss: { machining: null, casting: null } },
  "16X7A1-CME-PMS-SV14F": { brightness: { disk: B_STD, spoke: B_STD, flange: B_STD }, thickness: T_135, gloss: { machining: null, casting: null } },
  "18X7A1-CHH-PMS-CR08F": { brightness: { disk: B_CR, spoke: null, flange: B_CR }, thickness: T_135, gloss: { machining: null, casting: null } },
  "17X6.5A1-CHF-PMS-SV14F-ZJ": { brightness: { disk: B_STD, spoke: null, flange: B_STD }, thickness: T_135, gloss: { machining: null, casting: null } },
  "16X6A1-CHC-PMS-SV14F-ZJ": { brightness: { disk: B_STD, spoke: null, flange: B_STD }, thickness: T_135, gloss: { machining: null, casting: null } },
  "17X6.5A1-L19-PMS-BK01CLF-ZJ": { brightness: { disk: B_STD, spoke: null, flange: B_STD }, thickness: T_STD, gloss: { machining: null, casting: null } },
  "16X6A1-CCN-PMS-GY45CLF-ZJ": { brightness: { disk: B_STD, spoke: null, flange: B_STD }, thickness: T_STD, gloss: { machining: null, casting: null } },
  "A17X6.5A1-SW1-PMS-BK01CLF-ZJ": { brightness: { disk: B_STD, spoke: null, flange: B_STD }, thickness: T_20, gloss: { machining: null, casting: null } },
  "A16X6.5A1-SV1-PMS-BK01CLF-ZJ": { brightness: { disk: B_STD, spoke: null, flange: B_STD }, thickness: T_20, gloss: { machining: null, casting: null } },
  "18X7.5A1-BQQ-PMS-CR08F-ZJ": { brightness: { disk: B_CR, spoke: null, flange: B_CR }, thickness: T_135, gloss: { machining: null, casting: null } },
  "15X5A1-DP-PMS-GY45CLF": { brightness: { disk: B_STD, spoke: B_STD, flange: null }, thickness: T_STD, gloss: { machining: null, casting: null } },
  "16X6A1-RST-PMS-GY02CLF": { brightness: { disk: B_STD, spoke: B_STD, flange: B_STD }, thickness: T_STD, gloss: { machining: null, casting: null } },
  "16X6A1-RST-PMS-BK01CLF": { brightness: { disk: B_STD, spoke: B_STD, flange: B_STD }, thickness: T_STD, gloss: { machining: null, casting: null } },
  "17X7A1-APH-PMS-SV14F": { brightness: { disk: B_STD, spoke: B_STD, flange: B_STD }, thickness: T_135, gloss: { machining: null, casting: null } },
  "17X7.5A1-AUQ-PMS-GY45CLF": { brightness: { disk: B_STD, spoke: null, flange: B_STD }, thickness: T_STD, gloss: { machining: null, casting: null } },
  "16X6A1-AWJ-PMS-GY45CLF": { brightness: { disk: B_STD, spoke: null, flange: B_STD }, thickness: T_STD, gloss: { machining: null, casting: null } },
  "16X6A1-ATW-PMS-SV14F": { brightness: { disk: B_STD, spoke: null, flange: B_STD }, thickness: T_135, gloss: { machining: null, casting: null } },
  "15X5.5A1-DJ-PMS-GY45CLF": { brightness: { disk: B_STD, spoke: null, flange: B_STD }, thickness: T_STD, gloss: { machining: null, casting: null } },
  "15X5.5A1-AWG-PMS-GY02F": { brightness: { disk: B_STD, spoke: B_STD, flange: B_STD }, thickness: T_135, gloss: { machining: null, casting: null } },
};

const SmallInputBox = ({ label, name, disabled = false, defaultValue = "", placeholder = "-" }: { label: string, name?: string, disabled?: boolean, defaultValue?: string, placeholder?: string }) => (
  <div className="flex flex-col gap-1.5 items-center w-full min-w-0">
    <label className="text-[10px] md:text-xs font-bold text-slate-700 capitalize tracking-wide">{label}</label>
    <div className={`w-full h-10 md:h-12 border rounded-lg flex items-center justify-center overflow-hidden bg-white hover:border-blue-400 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all ${disabled ? 'bg-slate-100 border-slate-200' : 'border-slate-300'}`}>
      <input 
        type="number"
        name={name}
        disabled={disabled}
        defaultValue={defaultValue}
        placeholder={placeholder==="-2 ~ +6" ? "-" : placeholder}
        className="w-full h-full text-center text-sm md:text-base font-semibold text-slate-800 bg-transparent outline-none disabled:text-slate-400 placeholder:text-slate-300 text-xs"
      />
    </div>
  </div>
);

const WideInputBox = ({ label, name, placeholder = "Nilai", disabled = false }: { label: string, name?: string, placeholder?: string, disabled?: boolean }) => (
  <div className={`flex flex-col gap-1.5 w-full ${disabled ? 'hidden' : ''}`}>
    <label className="text-xs md:text-sm font-bold text-slate-700">{label}</label>
    <div className="w-full h-11 md:h-12 border border-slate-300 rounded-lg flex items-center px-3 bg-white hover:border-brand-400 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20 transition-all">
      <input 
        type="text"
        name={name}
        placeholder={placeholder}
        className="w-full h-full text-sm font-medium text-slate-800 bg-transparent outline-none placeholder:text-slate-400"
      />
    </div>
  </div>
);

const SectionContainer = ({ title, icon: Icon, children }: { title: string, icon: any, children: React.ReactNode }) => (
  <div className="w-full">
    <div className="flex items-center gap-2 mb-3 px-1">
      <Icon className="w-5 h-5 text-company-500 text-blue-600" />
      <h3 className="text-base md:text-lg font-bold text-slate-800">{title}</h3>
    </div>
    <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-4 md:p-5 flex flex-col gap-5">
      {children}
    </div>
  </div>
);


export default function PaintingQCForm() {
  const router = useRouter();

  // Step management
  const [step, setStep] = useState<1 | 2>(1);
  const [initialData, setInitialData] = useState({
    date: new Date().toISOString().split('T')[0],
    shift: "",
    group: "",
    inspector: "",
    paintingStatus: ""
  });

  const DROPDOWN_OPTIONS = {
    shift: ['1', '2'],
    group: ['A', 'B', 'C', 'NS'],
    inspector: ['ARA R. M.', 'NURHADI', 'A. GINANJAR', 'RIAN M.', 'HAFIZ L. U.'],
    paintingStatus: ['SARA', 'REPAIR 1X', 'REPAIR 2X', 'REPAIR 3X']
  };

  const [judgement, setJudgement] = useState<"OK" | "NG" | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const attachInputRef = useRef<HTMLInputElement>(null);

  const [fiPhotos, setFiPhotos] = useState<{ url: string; filename: string }[]>([]);
  const [attachments, setAttachments] = useState<{ url: string; filename: string }[]>([]);
  const [uploading, setUploading] = useState(false);

  // WebRTC Camera
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setCameraOpen(false);
    setCameraReady(false);
  }, []);

  const startCamera = useCallback(async (facing: "user" | "environment" = facingMode) => {
    try {
      streamRef.current?.getTracks().forEach(t => t.stop());
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 960 } },
        audio: false,
      });
      streamRef.current = stream;
      setCameraOpen(true);
    } catch {
      alert("Tidak dapat mengakses kamera. Pastikan izin kamera diaktifkan.");
      stopCamera();
    }
  }, [facingMode, stopCamera]);

  useEffect(() => {
    if (cameraOpen && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.onloadedmetadata = () => setCameraReady(true);
    }
  }, [cameraOpen]);

  const toggleFacing = useCallback(() => {
    const next = facingMode === "user" ? "environment" : "user";
    setFacingMode(next);
    if (cameraOpen) startCamera(next);
  }, [facingMode, cameraOpen, startCamera]);

  const capturePhoto = useCallback(async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);

    const blob = await new Promise<Blob | null>(res => canvas.toBlob(res, "image/jpeg", 0.85));
    if (!blob) return;

    stopCamera();
    setUploading(true);
    try {
      const file = new File([blob], `capture_${Date.now()}.jpg`, { type: "image/jpeg" });
      const res = await uploadFile(file, "photo");
      setFiPhotos(prev => [...prev, res]);
    } catch { alert("Gagal mengunggah foto."); }
    finally { setUploading(false); }
  }, [stopCamera]);

  useEffect(() => {
    return () => { streamRef.current?.getTracks().forEach(t => t.stop()); };
  }, []);

  const uploadFile = async (file: File, category: string) => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("category", category);
    const { data } = await apiClient.post("/uploads", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data as { url: string; filename: string };
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const res = await uploadFile(file, "photo");
        setFiPhotos(prev => [...prev, res]);
      }
    } catch { alert("Gagal mengunggah foto."); }
    finally { setUploading(false); e.target.value = ""; }
  };

  const handleAttachUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const res = await uploadFile(file, "document");
        setAttachments(prev => [...prev, res]);
      }
    } catch { alert("Gagal mengunggah file."); }
    finally { setUploading(false); e.target.value = ""; }
  };

  // Searchable Dropdown state
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPart, setSelectedPart] = useState<string>("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const partKeys = Object.keys(PART_SPECS);
  const filteredParts = partKeys.filter(part => part.toLowerCase().includes(searchQuery.toLowerCase()));

  const currentSpec = selectedPart ? PART_SPECS[selectedPart] : null;
  const hasBrightness = currentSpec && (currentSpec.brightness.disk || currentSpec.brightness.spoke || currentSpec.brightness.flange);
  const hasGloss = currentSpec && (currentSpec.gloss.machining || currentSpec.gloss.casting);

  const renderBrightnessBlock = (label: string, spec: BrightnessSpec | null) => {
    if (!spec) return null;
    const prefix = `brightness_${label.toLowerCase()}`;
    console.log(prefix);
    return (
      <div className="flex flex-col gap-3 p-4 rounded-xl border border-slate-200/80 bg-slate-50/30">
        <span className="text-sm font-bold text-slate-800">{label}</span>
        <div className="flex justify-between gap-1 sm:gap-2">
          <SmallInputBox label="L" name={`${prefix}_L`} disabled={!spec.L} />
          <SmallInputBox label="a" name={`${prefix}_a`} disabled={!spec.a} />
          <SmallInputBox label="b" name={`${prefix}_b`} disabled={!spec.b} />
          <SmallInputBox label="△E" name={`${prefix}_dE`} disabled={!spec.dE} placeholder="Max. 3"/>
          <SmallInputBox label="△L" name={`${prefix}_dL`} disabled={!spec.dL} defaultValue={!spec.dL ? "X" : ""} placeholder={!spec.dL ? "X" : "-2 ~ +6"} />
        </div>
      </div>
    );
  };

  const handleNextStep = () => {
    if (!initialData.date || !initialData.shift || !initialData.group || !initialData.inspector || !initialData.paintingStatus) {
      alert("Harap lengkapi semua data awal terlebih dahulu!");
      return;
    }
    setStep(2);
  };

  const handleSubmit = async () => {
    if (!selectedPart || !judgement) {
      alert("Pilih tipe part dan tentukan judgement (OK/NG) terlebih dahulu!");
      return;
    }
    if (!formRef.current) return;

    const fd = new FormData(formRef.current);
    const val = (name: string) => (fd.get(name) as string) || "";

    const brightness: Record<string, Record<string, string>> = {};
    for (const area of ["disk", "spoke", "flange"]) {
      const fields: Record<string, string> = {};
      let hasValue = false;
      for (const key of ["L", "a", "b", "△E", "△L"]) {
        const v = val(`brightness_${area}_${key}`);
        if (v && v !== "X") { fields[key] = v; hasValue = true; }
      }
      if (hasValue) brightness[area] = fields;
    }

    const thickness: Record<string, string> = {};
    const thicknessFields = [
      ["disk", "t_disk"], ["spoke", "t_spoke"], ["flange", "t_flange"],
      ["spokeVertA", "t_spokeVertA"], ["spokeVertB", "t_spokeVertB"],
      ["beadInner", "t_beadInner"], ["beadOuter", "t_beadOuter"],
      ["backRimInner", "t_backRimInner"], ["backRimOuter", "t_backRimOuter"],
      ["backSpokeIn", "t_backSpokeIn"], ["backSpokeOut", "t_backSpokeOut"],
    ];
    for (const [key, name] of thicknessFields) {
      const v = val(name);
      if (v) thickness[key] = v;
    }

    const gloss: Record<string, Record<string, string>> = {};
    for (const surface of ["machining", "casting"]) {
      const positions: Record<string, string> = {};
      let hasValue = false;
      for (let i = 1; i <= 5; i++) {
        const v = val(`gloss_${surface}_${i}`);
        if (v) { positions[`pos${i}`] = v; hasValue = true; }
      }
      if (hasValue) gloss[surface] = positions;
    }

    const payload = {
      date: initialData.date,
      shift: initialData.shift,
      group: initialData.group,
      inspector: initialData.inspector,
      painting_status: initialData.paintingStatus,
      wheel_type: selectedPart,
      line: val("fi_line"),
      brightness,
      thickness,
      gloss,
      photos: fiPhotos.map(p => p.url),
      attachments: attachments.map(a => a.url),
      comment: val("comment"),
      judgement,
    };

    setSubmitting(true);
    try {
      await apiClient.post("/painting-inspections", payload);
      alert("Report berhasil disimpan!");
      router.push("/app/qcpatrol");
    } catch (err: any) {
      alert(err.response?.data?.message || "Gagal menyimpan report.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-24 font-sans w-full flex flex-col items-center">
      <style dangerouslySetInnerHTML={{__html: `
        .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
        .animate-fade-in-up { animation: fadeInUp 0.4s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        
        .overflow-y-auto::-webkit-scrollbar { width: 6px; }
        .overflow-y-auto::-webkit-scrollbar-track { background: transparent; }
        .overflow-y-auto::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 10px; }
      `}} />

      {/* Main Header Container (Sticky) */}
      <div className="w-full bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => step === 2 ? setStep(1) : router.back()} 
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-700 transition-colors flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <h1 className="text-lg sm:text-xl font-bold text-slate-800">Painting QC Record</h1>
        </div>
      </div>

      <div className="w-full max-w-3xl space-y-6 pt-6 px-4 sm:px-6">
        
        {step === 1 && (
          <div className="bg-white rounded-[20px] border border-slate-200 shadow-sm p-6 md:p-8 relative z-10 transition-all animate-fade-in-up">
            <div className="mb-6">
              <h2 className="text-lg md:text-xl font-extrabold text-slate-800 tracking-tight">Data Awal Pengecekan</h2>
              <p className="text-sm text-slate-500 mt-1">Harap isi form di bawah ini sebelum memulai proses inspeksi</p>
            </div>
            
            <div className="space-y-5">
              {/* Tanggal */}
              {/* <div>
                <label className="flex items-center gap-2 text-sm font-bold text-slate-600 mb-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  Tanggal Inspeksi
                </label>
                <input 
                  type="date"
                  value={initialData.date}
                  onChange={(e) => setInitialData({...initialData, date: e.target.value})}
                  className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl outline-none text-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium"
                />
              </div> */}

              {/* Shift */}
              <div>
                <label className="block text-[15px] font-extrabold text-[#334155] mb-2.5">
                  Shift
                </label>
                <div className="relative">
                  <Clock className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select 
                    value={initialData.shift}
                    onChange={(e) => setInitialData({...initialData, shift: e.target.value})}
                    className="w-full h-14 pl-12 pr-10 bg-white border border-slate-200 rounded-[14px] outline-none text-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium appearance-none shadow-sm text-sm md:text-base hover:border-slate-300"
                  >
                    <option value="" disabled>Pilih Shift Kerja</option>
                    {DROPDOWN_OPTIONS.shift.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                  <ChevronDown className="w-5 h-5 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Group */}
              <div>
                <label className="block text-[15px] font-extrabold text-[#334155] mb-2.5">
                  Group
                </label>
                <div className="relative">
                  <Users className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select 
                    value={initialData.group}
                    onChange={(e) => setInitialData({...initialData, group: e.target.value})}
                    className="w-full h-14 pl-12 pr-10 bg-white border border-slate-200 rounded-[14px] outline-none text-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium appearance-none shadow-sm text-sm md:text-base hover:border-slate-300"
                  >
                    <option value="" disabled>Pilih Group</option>
                    {DROPDOWN_OPTIONS.group.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                  <ChevronDown className="w-5 h-5 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Inspector QC */}
              <div>
                <label className="block text-[15px] font-extrabold text-[#334155] mb-2.5">
                  Inspector QC
                </label>
                <div className="relative">
                  <UserCheck className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select 
                    value={initialData.inspector}
                    onChange={(e) => setInitialData({...initialData, inspector: e.target.value})}
                    className="w-full h-14 pl-12 pr-10 bg-white border border-slate-200 rounded-[14px] outline-none text-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium appearance-none shadow-sm text-sm md:text-base hover:border-slate-300"
                  >
                    <option value="" disabled>Pilih Nama Inspector</option>
                    {DROPDOWN_OPTIONS.inspector.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                  <ChevronDown className="w-5 h-5 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
              
              {/* Painting Status */}
              <div>
                <label className="block text-[15px] font-extrabold text-[#334155] mb-2.5">
                  Painting Status
                </label>
                <div className="relative">
                  <PaintBucket className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none -scale-x-100" />
                  <select 
                    value={initialData.paintingStatus}
                    onChange={(e) => setInitialData({...initialData, paintingStatus: e.target.value})}
                    className="w-full h-14 pl-12 pr-10 bg-white border border-slate-200 rounded-[14px] outline-none text-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium appearance-none shadow-sm text-sm md:text-base hover:border-slate-300"
                  >
                    <option value="" disabled>Pilih Status Pengecatan</option>
                    {DROPDOWN_OPTIONS.paintingStatus.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                  <ChevronDown className="w-5 h-5 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div className="pt-6 mt-4 border-t border-slate-100">
                <button 
                  onClick={handleNextStep}
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl active:scale-[0.98] transition-all text-base shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                >
                  Mulai Pengecekan
                  <ArrowLeft className="w-5 h-5 rotate-180" />
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-fade-in-up space-y-6">
            
            {/* Header Data Awal Summary */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col gap-3 text-sm font-medium text-slate-600">
              <div className="flex justify-between items-center w-full border-b border-slate-100 pb-3">
                 <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    <span>{initialData.date}</span>
                 </div>
                 <button 
                  onClick={() => setStep(1)}
                  className="text-blue-600 hover:text-blue-700 font-bold text-xs uppercase tracking-wider underline decoration-blue-500/30 underline-offset-4"
                >
                  Edit
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs sm:text-sm">
                <div className="flex flex-col gap-1 border-r border-slate-100 pr-2">
                  <span className="text-slate-400 text-[10px] sm:text-xs uppercase font-bold tracking-wider">Shift</span>
                  <span className="font-extrabold text-slate-800">{initialData.shift}</span>
                </div>
                <div className="flex flex-col gap-1 border-r border-slate-100 pr-2">
                  <span className="text-slate-400 text-[10px] sm:text-xs uppercase font-bold tracking-wider">Group</span>
                  <span className="font-extrabold text-slate-800">{initialData.group}</span>
                </div>
                <div className="flex flex-col gap-1 border-r border-slate-100 sm:pr-2">
                  <span className="text-slate-400 text-[10px] sm:text-xs uppercase font-bold tracking-wider">Inspector</span>
                  <span className="font-extrabold text-slate-800 truncate" title={initialData.inspector}>{initialData.inspector}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-slate-400 text-[10px] sm:text-xs uppercase font-bold tracking-wider">Status</span>
                  <span className="font-extrabold text-slate-800">{initialData.paintingStatus}</span>
                </div>
              </div>
            </div>

            {/* Dropdown Card */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 md:p-5 relative z-50 transition-all" ref={dropdownRef}>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 px-1">Tipe Part Wheel</label>
              <div 
                className="w-full border border-slate-300 rounded-lg h-12 flex items-center px-4 justify-between cursor-pointer bg-white hover:border-blue-400 transition-colors shadow-sm focus-within:ring-2 focus-within:ring-blue-500/20"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <span className={selectedPart ? "text-slate-800 font-bold text-sm md:text-base" : "text-slate-400 font-medium text-sm md:text-base"}>
                  {selectedPart || "Pilih Model Tipe..."}
                </span>
                <ChevronDown className="text-slate-500 w-5 h-5" />
              </div>

              {isDropdownOpen && (
                <div className="absolute top-[80px] left-0 right-0 mx-4 md:mx-5 bg-white border border-slate-200 shadow-lg rounded-xl overflow-hidden flex flex-col max-h-64 z-50 transform origin-top transition-all animate-fade-in">
                  <div className="p-3 border-b border-slate-100 bg-slate-50">
                    <input 
                      type="text" 
                      placeholder="Cari tipe part..." 
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg outline-none text-slate-700 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  <div className="overflow-y-auto">
                    {filteredParts.length > 0 ? filteredParts.map(part => (
                      <div 
                        key={part} 
                        className="px-5 py-3 hover:bg-blue-50 cursor-pointer text-slate-700 text-sm md:text-base border-b border-slate-50 last:border-0 font-medium transition-colors hover:text-blue-700"
                        onClick={() => {
                          setSelectedPart(part);
                          setIsDropdownOpen(false);
                          setSearchQuery("");
                        }}
                      >
                        {part}
                      </div>
                    )) : (
                      <div className="p-5 text-slate-400 text-center text-sm italic">Tidak ada part yang cocok dengan "{searchQuery}"</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Dynamic Form Check Areas */}
            {currentSpec ? (
              <form ref={formRef} onSubmit={(e) => e.preventDefault()} className="w-full space-y-6 animate-fade-in-up">
                
                {/* 1. Brightness Check */}
                {hasBrightness && (
                  <SectionContainer title="Brightness" icon={Sun}>
                    {renderBrightnessBlock("Disk", currentSpec.brightness.disk)}
                    {renderBrightnessBlock("Spoke", currentSpec.brightness.spoke)}
                    {renderBrightnessBlock("Flange", currentSpec.brightness.flange)}
                  </SectionContainer>
                )}

                {/* 2. Thickness Check */}
                <SectionContainer title="Thickness (µm)" icon={Ruler}>
                  <div className="grid grid-cols-2 gap-4 md:gap-5 w-full">
                    <WideInputBox label="Disk" name="t_disk" />
                    <WideInputBox label="Spoke" name="t_spoke" />
                    
                    <WideInputBox label="Flange" name="t_flange" />
                    <WideInputBox label="Spoke Vertical A" name="t_spokeVertA" />
                    
                    <WideInputBox label="Spoke Vertical B" name="t_spokeVertB" />
                    <WideInputBox label="Bead Inner" name="t_beadInner" />
                    
                    <WideInputBox label="Bead Outer" name="t_beadOuter" />
                    <WideInputBox label="Back Rim (Inner)" name="t_backRimInner" />
                    
                    <WideInputBox label="Back Rim (Outer)" name="t_backRimOuter" />
                    <WideInputBox label="Back Spoke (Inner)" name="t_backSpokeIn" />
                    
                    <WideInputBox label="Back Spoke (Outer)" name="t_backSpokeOut" />
                  </div>
                </SectionContainer>

                {/* 3. Gloss Check */}
                {hasGloss && (
                  <SectionContainer title="Gloss Check (GU)" icon={PaintBucket}>
                    {currentSpec.gloss.machining && (
                      <div className="">
                        <span className="text-sm font-bold text-slate-800">Machining Surface</span>
                        <div className="flex justify-between gap-1 sm:gap-2">
                          {[1, 2, 3, 4, 5].map(pos => (
                            <SmallInputBox key={`m${pos}`} name={`gloss_machining_${pos}`} label={`Posisi ${pos}`} placeholder={currentSpec.gloss.machining!} />
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {currentSpec.gloss.casting && (
                      <div className="flex flex-col gap-3 p-4 rounded-xl border border-slate-200/80 bg-slate-50/30">
                        <span className="text-sm font-bold text-slate-800">Casting Surface</span>
                        <div className="flex justify-between gap-1 sm:gap-2">
                          {[1, 2, 3, 4, 5].map(pos => (
                            <SmallInputBox key={`c${pos}`} name={`gloss_casting_${pos}`} label={`Posisi ${pos}`} placeholder={currentSpec.gloss.casting!} />
                          ))}
                        </div>
                      </div>
                    )}
                  </SectionContainer>
                )}

                {/* 4. FI Inspection */}
                <SectionContainer title="FI Inspection" icon={Camera}>
                  <div className="flex flex-col gap-1.5 w-full">
                    <label className="text-sm font-bold text-slate-800">Line FI</label>
                    <div className="w-full h-11 md:h-12 border border-slate-300 rounded-lg flex items-center px-3 bg-white relative">
                      <select name="fi_line" className="w-full h-full text-sm font-medium text-slate-800 bg-transparent outline-none appearance-none pr-8">
                        <option>Line #1</option>
                        <option>Line #2</option>
                        <option>Line #3</option>
                        <option>Double check</option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 pointer-events-none" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 w-full mt-2">
                    <label className="text-sm font-bold text-slate-800">Foto Stamp FI</label>
                    <input ref={galleryInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoUpload} />
                    <canvas ref={canvasRef} className="hidden" />

                    {fiPhotos.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {fiPhotos.map((photo, idx) => (
                          <div key={idx} className="relative rounded-lg border border-slate-200 overflow-hidden bg-slate-50">
                            <img src={photo.url} alt={`FI Stamp ${idx + 1}`} className="w-full h-28 object-cover" />
                            <button
                              type="button"
                              onClick={() => setFiPhotos(prev => prev.filter((_, i) => i !== idx))}
                              className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                            ><X className="w-3.5 h-3.5" /></button>
                            <p className="text-[10px] text-slate-500 px-1.5 py-1 truncate">{photo.filename}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-3">
                      <button
                        type="button"
                        disabled={uploading}
                        onClick={() => startCamera()}
                        className="flex-1 h-12 border-2 border-dashed border-blue-400 rounded-lg flex items-center justify-center gap-2 text-blue-600 bg-blue-50/50 hover:bg-blue-50 transition-colors disabled:opacity-50"
                      >
                        <Camera className="w-5 h-5" />
                        <span className="text-sm font-semibold">Ambil Foto</span>
                      </button>
                      <button
                        type="button"
                        disabled={uploading}
                        onClick={() => galleryInputRef.current?.click()}
                        className="flex-1 h-12 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center gap-2 text-slate-600 bg-white hover:bg-slate-50 transition-colors disabled:opacity-50"
                      >
                        {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                        <span className="text-sm font-semibold">Unggah Foto</span>
                      </button>
                    </div>
                  </div>
                </SectionContainer>

                {/* 5. Komentar */}
                <div className="w-full px-1">
                  <div className="flex items-center gap-2 mb-3">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                    <h3 className="text-base md:text-lg font-bold text-slate-800">Komentar</h3>
                  </div>
                  <div className="w-full flex flex-col gap-3">
                    <textarea 
                      name="comment"
                      placeholder="Tambahkan catatan jika diperlukan..."
                      className="w-full h-24 p-4 border border-slate-300 rounded-xl outline-none text-sm text-slate-800 resize-none hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all bg-white"
                    ></textarea>
                    
                    <input ref={attachInputRef} type="file" accept=".pdf,.xlsx,.xls,.docx,.doc,.csv,.jpg,.jpeg,.png" multiple className="hidden" onChange={handleAttachUpload} />
                    
                    {attachments.length > 0 && (
                      <div className="flex flex-col gap-2">
                        {attachments.map((att, idx) => (
                          <div key={idx} className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2 border border-slate-200">
                            <Paperclip className="w-4 h-4 text-slate-400 shrink-0" />
                            <span className="text-xs font-medium text-slate-700 truncate flex-1">{att.filename}</span>
                            <button type="button" onClick={() => setAttachments(prev => prev.filter((_, i) => i !== idx))} className="text-red-400 hover:text-red-600 text-xs font-bold shrink-0">Hapus</button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <button
                      type="button"
                      disabled={uploading}
                      onClick={() => attachInputRef.current?.click()}
                      className="self-start h-10 px-4 border border-slate-300 rounded-full flex items-center justify-center gap-2 text-slate-700 bg-white hover:bg-slate-50 transition-colors disabled:opacity-50"
                    >
                      {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Paperclip className="w-4 h-4" />}
                      <span className="text-xs font-semibold">{uploading ? "Mengunggah..." : "Lampirkan File/Gambar"}</span>
                    </button>
                  </div>
                </div>

                {/* Overall Judgement */}
                <div className="w-full pt-4">
                  <h4 className="text-center text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Overall Judgement</h4>
                  <div className="flex gap-4">
                    <button 
                      onClick={() => setJudgement("OK")}
                      className={`flex-1 h-20 rounded-xl border-2 flex flex-col items-center justify-center gap-1 transition-all
                      ${judgement === "OK" 
                        ? 'border-green-500 bg-green-50 text-green-600' 
                        : 'border-slate-200 bg-white text-slate-500 hover:border-green-300'}
                    `}>
                      <ThumbsUp className={`w-8 h-8 ${judgement === "OK" ? 'fill-green-200' : ''}`} />
                      <span className="font-bold">OK</span>
                    </button>
                    <button 
                      onClick={() => setJudgement("NG")}
                      className={`flex-1 h-20 rounded-xl border-2 flex flex-col items-center justify-center gap-1 transition-all
                      ${judgement === "NG" 
                        ? 'border-red-500 bg-red-50 text-red-600' 
                        : 'border-slate-200 bg-white text-slate-500 hover:border-red-300'}
                    `}>
                      <ThumbsDown className={`w-8 h-8 ${judgement === "NG" ? 'fill-red-200' : ''}`} />
                      <span className="font-bold">NG</span>
                    </button>
                  </div>
                </div>

                <div className="w-full pb-8 pt-4">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="w-full h-14 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-xl active:scale-[0.98] transition-all text-base shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                  >
                    {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    {submitting ? "Menyimpan..." : "Submit Report"}
                  </button>
                </div>

              </form>
            ) : (
              <div className="w-full bg-white rounded-xl border border-slate-200 shadow-sm p-10 flex flex-col items-center justify-center text-slate-500 mt-4 h-48 animate-fade-in">
                 <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3 border border-slate-100">
                   <ChevronDown className="w-6 h-6 text-slate-400" />
                 </div>
                 <p className="text-sm md:text-base text-center font-medium">Silakan pilih <strong className="text-slate-800">Tipe Part Wheel</strong> terlebih dahulu</p>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Camera Overlay */}
      {cameraOpen && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 bg-black/80">
            <h3 className="text-white font-semibold text-sm">Ambil Foto Stamp FI</h3>
            <div className="flex items-center gap-3">
              <button onClick={toggleFacing} className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors">
                <SwitchCamera className="w-5 h-5" />
              </button>
              <button onClick={stopCamera} className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center bg-black overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="max-w-full max-h-full object-contain"
            />
            {!cameraReady && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-white animate-spin" />
              </div>
            )}
          </div>

          <div className="flex items-center justify-center py-6 bg-black/80">
            <button
              onClick={capturePhoto}
              disabled={!cameraReady}
              className="w-16 h-16 rounded-full border-4 border-white bg-white/20 hover:bg-white/40 disabled:opacity-30 transition-all active:scale-90 flex items-center justify-center"
            >
              <div className="w-12 h-12 rounded-full bg-white" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
