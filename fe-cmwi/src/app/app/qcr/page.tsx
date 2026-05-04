"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeft, AlertCircle, Clock, Building2,
  Play, FileText, CheckCircle2, Loader2, RefreshCw, User
} from "lucide-react";
import { apiClient } from "@/lib/axios";

interface QCRItem {
  id: number;
  date_request: string;
  dept_section: string;
  purpose: string;
  wheel_phase: string;
  process_wheel: string;
  product_status: string;
  urgency_level: string;
  type_wheel: string;
  no_mold: string;
  no_line_machining: string;
  status: string;
  judgement: string;
  finish_target: string | null;
  created_at: string;
  assignments?: { id: number; inspector: { id: number; name: string; username: string } }[];
}

const urgencyBadge = (level: string) => {
  if (level === "Top urgent") return "bg-red-50 text-red-700 ring-red-600/20";
  if (level === "Urgent") return "bg-amber-50 text-amber-700 ring-amber-600/20";
  return "bg-emerald-50 text-emerald-700 ring-emerald-600/20";
};

const statusConfig = (status: string) => {
  if (status === "Assigned") return { color: "bg-sky-50 text-sky-700 ring-sky-600/20", label: "Menunggu Mulai" };
  if (status === "In Progress") return { color: "bg-blue-50 text-blue-700 ring-blue-600/20", label: "Sedang Dikerjakan" };
  if (status === "Pending QC-GL Approval" || status === "Pending QC-SPV" || status === "Pending QC-AMG") return { color: "bg-indigo-50 text-indigo-700 ring-indigo-600/20", label: "Menunggu Approval" };
  if (status === "Completed") return { color: "bg-emerald-50 text-emerald-700 ring-emerald-600/20", label: "Selesai" };
  return { color: "bg-slate-100 text-slate-600 ring-slate-500/20", label: status };
};

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });

export default function QCRListPage() {
  const router = useRouter();
  const [data, setData] = useState<QCRItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [startingId, setStartingId] = useState<number | null>(null);

  const fetchData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const res = await apiClient.get("/api/qcr?limit=100");
      const allItems: QCRItem[] = res.data.data ?? [];
      
      // Filter hanya status yang relevan untuk dikerjakan operator
      const relevantStatuses = ["Assigned", "In Progress", "Pending QC-GL Approval", "Pending QC-SPV", "Pending QC-AMG", "Completed"];
      setData(allItems.filter(item => relevantStatuses.includes(item.status)));
    } catch {
      setData([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleStart = async (id: number) => {
    setStartingId(id);
    try {
      await apiClient.put(`/api/qcr/${id}/start`);
      await fetchData(true);
    } catch (e: any) {
      alert(e.response?.data?.message || "Gagal memulai check");
    } finally { setStartingId(null); }
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <div className="bg-[#f8f9fc] min-h-screen font-sans w-full flex flex-col items-center">
      <style dangerouslySetInnerHTML={{__html: `
        .qcr-card { transition: all 0.15s ease; }
        .qcr-card:active { transform: scale(0.98); }
        .fade-up { animation: fadeUp 0.3s ease-out forwards; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}} />

      {/* Sticky Header */}
      <div className="w-full bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 hover:bg-slate-100 rounded-lg text-slate-700 transition-colors">
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-slate-800 leading-tight">QCR Saya</h1>
            <p className="text-xs text-slate-400 font-medium">Quality Control Request</p>
          </div>
        </div>
        <button onClick={() => fetchData(true)} disabled={refreshing} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors">
          <RefreshCw className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="w-full max-w-xl px-4 sm:px-6 pt-5 pb-28 space-y-4">

        {/* Stats */}
        {!loading && data.length > 0 && (
          <div className="grid grid-cols-3 gap-3 fade-up">
            {[
              ["Total", data.length, "text-blue-600"],
              ["In Progress", data.filter(d => d.status === "In Progress").length, "text-amber-600"],
              ["Selesai", data.filter(d => d.status === "Completed").length, "text-emerald-600"],
            ].map(([label, count, cls]) => (
              <div key={String(label)} className="bg-white rounded-2xl border border-slate-200 p-3 text-center shadow-sm">
                <p className={`text-xl font-extrabold ${cls}`}>{count as number}</p>
                <p className="text-[11px] font-semibold text-slate-400 mt-0.5">{label as string}</p>
              </div>
            ))}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            <p className="text-sm text-slate-400 font-medium">Memuat data...</p>
          </div>
        )}

        {/* Empty */}
        {!loading && data.length === 0 && (
          <div className="fade-up flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center">
              <FileText className="w-10 h-10 text-slate-300" />
            </div>
            <div className="text-center">
              <p className="text-base font-bold text-slate-600">Belum ada penugasan</p>
              <p className="text-sm text-slate-400 mt-1">QCR yang di-assign ke kamu akan tampil di sini</p>
            </div>
          </div>
        )}

        {/* QCR Cards */}
        {!loading && data.map((item, idx) => {
          const sc = statusConfig(item.status);
          const canStart = item.status === "Assigned";
          const canReport = item.status === "In Progress";
          const isDone = ["Pending QC-GL Approval","Pending QC-SPV","Pending QC-AMG","Completed"].includes(item.status);

          return (
            <div key={item.id} className="qcr-card bg-white rounded-2xl border border-slate-200 shadow-sm p-4 fade-up" style={{ animationDelay: `${idx * 40}ms` }}>
              {/* Top */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-0.5">
                    #{item.id} · {formatDate(item.date_request)}
                  </p>
                  <p className="font-extrabold text-slate-800 text-sm leading-snug truncate">
                    {item.type_wheel || "—"}
                  </p>
                </div>
                {isDone && <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />}
              </div>

              {/* Dept & Process */}
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                <Building2 className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate font-medium">{item.dept_section}</span>
                {item.process_wheel && (
                  <>
                    <span className="text-slate-200">·</span>
                    <Clock className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{item.process_wheel}</span>
                  </>
                )}
              </div>

              {/* Inspector names */}
              {item.assignments && item.assignments.length > 0 && (
                <div className="flex items-center gap-1.5 mb-3 flex-wrap">
                  <User className="w-3 h-3 text-slate-400 shrink-0" />
                  {item.assignments.map(a => (
                    <span key={a.id} className="text-[11px] font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full ring-1 ring-sky-200">
                      {a.inspector?.name || a.inspector?.username}
                    </span>
                  ))}
                </div>
              )}

              {/* Target date */}
              {item.finish_target && (
                <div className="flex items-center gap-1.5 mb-3 text-xs text-slate-500">
                  <Clock className="w-3 h-3" />
                  Target: <span className="font-bold text-slate-700">{formatDate(item.finish_target)}</span>
                </div>
              )}

              {/* Badges */}
              <div className="flex items-center gap-2 flex-wrap mb-3">
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-full ring-1 ring-inset ${urgencyBadge(item.urgency_level)}`}>
                  <AlertCircle className="w-3 h-3" /> {item.urgency_level}
                </span>
                <span className={`inline-flex px-2.5 py-1 text-[11px] font-bold rounded-full ring-1 ring-inset ${sc.color}`}>
                  {sc.label}
                </span>
              </div>

              {/* Action buttons */}
              {canStart && (
                <button
                  onClick={() => handleStart(item.id)}
                  disabled={startingId === item.id}
                  className="w-full h-10 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl flex items-center justify-center gap-2 text-sm transition-all active:scale-[0.97]">
                  {startingId === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                  {startingId === item.id ? "Memulai..." : "Mulai Check"}
                </button>
              )}

              {canReport && (
                <button
                  onClick={() => router.push(`/app/qcr/${item.id}/report`)}
                  className="w-full h-10 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 text-sm transition-all active:scale-[0.97]">
                  <FileText className="w-4 h-4" />
                  Submit Report
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
