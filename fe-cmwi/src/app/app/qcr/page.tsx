"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeft, Plus, AlertCircle, Clock, Building2,
  ChevronRight, Loader2, ClipboardList, RefreshCw
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
  created_at: string;
}

const urgencyBadge = (level: string) => {
  if (level === "Top urgent") return "bg-red-50 text-red-700 ring-red-600/20";
  if (level === "Urgent") return "bg-amber-50 text-amber-700 ring-amber-600/20";
  return "bg-emerald-50 text-emerald-700 ring-emerald-600/20";
};

const statusBadge = (status: string) => {
  if (status === "Pending") return "bg-blue-50 text-blue-700 ring-blue-600/20";
  if (status === "Received") return "bg-emerald-50 text-emerald-700 ring-emerald-600/20";
  if (status === "Rejected") return "bg-red-50 text-red-700 ring-red-600/20";
  return "bg-slate-100 text-slate-600 ring-slate-500/20";
};

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });

export default function QCRListPage() {
  const router = useRouter();
  const [data, setData] = useState<QCRItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const res = await apiClient.get("/api/qcr?limit=50&page=1");
      setData(res.data.data ?? []);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-slate-800 leading-tight">QCR</h1>
            <p className="text-xs text-slate-400 font-medium">Quality Control Request</p>
          </div>
        </div>
        <button
          onClick={() => fetchData(true)}
          disabled={refreshing}
          className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors"
        >
          <RefreshCw className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="w-full max-w-xl px-4 sm:px-6 pt-5 pb-28 space-y-4">

        {/* Stats row */}
        {!loading && data.length > 0 && (
          <div className="grid grid-cols-3 gap-3 fade-up">
            {[
              ["Total", data.length, "text-blue-600 bg-blue-50"],
              ["Pending", data.filter(d => d.status === "Pending").length, "text-amber-600 bg-amber-50"],
              ["Received", data.filter(d => d.status === "Received").length, "text-emerald-600 bg-emerald-50"],
            ].map(([label, count, cls]) => (
              <div key={String(label)} className="bg-white rounded-2xl border border-slate-200 p-3 text-center shadow-sm">
                <p className={`text-xl font-extrabold ${(cls as string).split(" ")[0]}`}>{count as number}</p>
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

        {/* Empty state */}
        {/* {!loading && data.length === 0 && (
          <div className="fade-up flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center">
              <ClipboardList className="w-10 h-10 text-slate-300" />
            </div>
            <div className="text-center">
              <p className="text-base font-bold text-slate-600">Belum ada QCR</p>
              <p className="text-sm text-slate-400 mt-1">Buat request baru untuk memulai</p>
            </div>
          </div>
        )} */}

        {/* QCR Cards */}
        {!loading && data.map((item, idx) => (
          <div
            key={item.id}
            className="qcr-card bg-white rounded-2xl border border-slate-200 shadow-sm p-4 cursor-pointer hover:border-blue-300 hover:shadow-md fade-up"
            style={{ animationDelay: `${idx * 40}ms` }}
          >
            {/* Top row */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-0.5">
                  #{item.id} · {formatDate(item.date_request)}
                </p>
                <p className="font-extrabold text-slate-800 text-sm leading-snug truncate">
                  {item.type_wheel || "—"}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 shrink-0 mt-1" />
            </div>

            {/* Info row */}
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

            {/* Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-full ring-1 ring-inset ${urgencyBadge(item.urgency_level)}`}>
                <AlertCircle className="w-3 h-3" />
                {item.urgency_level}
              </span>
              <span className={`inline-flex px-2.5 py-1 text-[11px] font-bold rounded-full ring-1 ring-inset ${statusBadge(item.status)}`}>
                {item.status}
              </span>
              {item.wheel_phase && (
                <span className="inline-flex px-2.5 py-1 text-[11px] font-medium rounded-full bg-slate-100 text-slate-500">
                  {item.wheel_phase}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* FAB — Buat Request Baru */}
      <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none pb-[env(safe-area-inset-bottom)]">
        <div className="w-full max-w-xl mx-auto px-4 sm:px-6 pb-5 pt-3 pointer-events-auto bg-gradient-to-t from-[#f8f9fc] via-[#f8f9fc]/95 to-transparent">
          <button
            onClick={() => router.push("/app/qcr/form-request")}
            className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-2xl flex items-center justify-center gap-2.5 shadow-lg hover:shadow-xl active:scale-[0.97] transition-all"
          >
            <Plus className="w-5 h-5" />
            Buat Request Baru
          </button>
        </div>
      </div>
    </div>
  );
}
