"use client";
import { useRouter, useParams } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Upload, Send, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { apiClient } from "@/lib/axios";

export default function QCRReportPage() {
  const router = useRouter();
  const params = useParams();
  const qcrId = params.id as string;

  const [judgement, setJudgement] = useState<"OK" | "NG" | "">("");
  const [comment, setComment] = useState("");
  const [files, setFiles] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setUploading(true);
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(e.target.files)) {
        if (file.size > 5 * 1024 * 1024) {
          setError(`File ${file.name} melebihi 5MB`);
          setUploading(false);
          return;
        }
        const fd = new FormData();
        fd.append("file", file);
        const res = await apiClient.post<{ url: string }>("/uploads", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        uploaded.push(res.data.url);
      }
      setFiles(prev => [...prev, ...uploaded]);
    } catch (e: any) {
      setError(e.response?.data?.message || "Gagal upload file");
    } finally { setUploading(false); }
  };

  const handleSubmit = async () => {
    if (!judgement) { setError("Pilih judgement terlebih dahulu"); return; }
    if (judgement === "NG" && !comment.trim()) { setError("Komentar wajib diisi untuk judgement NG"); return; }
    setSubmitting(true); setError("");
    try {
      await apiClient.put(`/api/qcr/${qcrId}/submit-report`, {
        judgement,
        report_files: files,
        comment,
      });
      router.push("/app/qcr");
    } catch (e: any) {
      setError(e.response?.data?.message || "Gagal submit report");
    } finally { setSubmitting(false); }
  };

  return (
    <div className="bg-[#f8f9fc] min-h-screen font-sans w-full flex flex-col items-center">
      {/* Header */}
      <div className="w-full bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm px-4 sm:px-6 py-3 flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 hover:bg-slate-100 rounded-lg text-slate-700 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-slate-800 leading-tight">Submit Report</h1>
          <p className="text-xs text-slate-400 font-medium">QCR #{qcrId}</p>
        </div>
      </div>

      <div className="w-full max-w-xl px-4 sm:px-6 pt-5 pb-28 space-y-4">

        {/* Judgement */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <h2 className="text-sm font-bold text-slate-700 mb-4">Hasil Pengecekan *</h2>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => setJudgement("OK")}
              className={`h-20 rounded-2xl font-extrabold text-xl flex flex-col items-center justify-center gap-1 border-2 transition-all ${judgement === "OK" ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-white text-slate-400 hover:border-emerald-300"}`}>
              <CheckCircle2 className="w-7 h-7" />
              OK
            </button>
            <button onClick={() => setJudgement("NG")}
              className={`h-20 rounded-2xl font-extrabold text-xl flex flex-col items-center justify-center gap-1 border-2 transition-all ${judgement === "NG" ? "border-red-500 bg-red-50 text-red-700" : "border-slate-200 bg-white text-slate-400 hover:border-red-300"}`}>
              <XCircle className="w-7 h-7" />
              NG
            </button>
          </div>
        </div>

        {/* Comment */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <h2 className="text-sm font-bold text-slate-700 mb-2">
            Komentar {judgement === "NG" ? <span className="text-red-500">*</span> : <span className="text-slate-400 font-normal text-xs">(opsional)</span>}
          </h2>
          <textarea value={comment} onChange={e => setComment(e.target.value)} rows={4}
            placeholder={judgement === "NG" ? "Jelaskan temuan NG..." : "Keterangan tambahan (opsional)..."}
            className="w-full p-3 border border-slate-200 rounded-xl outline-none text-sm text-slate-800 resize-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all bg-white placeholder:text-slate-300" />
        </div>

        {/* Upload */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <h2 className="text-sm font-bold text-slate-700 mb-3">Upload Report File (PDF)</h2>
          <label className="flex items-center justify-center gap-2 h-12 w-full border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all text-slate-500 text-sm font-medium">
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {uploading ? "Uploading..." : "Pilih File PDF"}
            <input type="file" accept=".pdf,image/*" multiple onChange={handleUpload} className="hidden" disabled={uploading} />
          </label>
          {files.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {files.map((f, i) => (
                <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold ring-1 ring-blue-200">
                  File {i + 1}
                  <button onClick={() => setFiles(prev => prev.filter((_, j) => j !== i))} className="hover:text-red-600 transition-colors">×</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {error && <div className="text-sm font-semibold text-red-600 bg-red-50 rounded-xl px-4 py-3">{error}</div>}
      </div>

      {/* Submit FAB */}
      <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none pb-[env(safe-area-inset-bottom)]">
        <div className="w-full max-w-xl mx-auto px-4 sm:px-6 pb-5 pt-3 pointer-events-auto bg-gradient-to-t from-[#f8f9fc] via-[#f8f9fc]/95 to-transparent">
          <button onClick={handleSubmit} disabled={submitting || !judgement}
            className={`w-full h-14 font-extrabold rounded-2xl flex items-center justify-center gap-2.5 shadow-lg transition-all ${submitting || !judgement ? "bg-slate-200 text-slate-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 text-white hover:shadow-xl active:scale-[0.97]"}`}>
            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            {submitting ? "Mengirim Report..." : "Submit Report"}
          </button>
        </div>
      </div>
    </div>
  );
}
