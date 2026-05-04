"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.css";
import { apiClient } from "@/lib/axios";
import { useAuthStore } from "@/stores/authStore";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface QCRRecord {
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
  no_shot: string;
  lot_painting: string;
  durability: Record<string, string> | null;
  capability: Record<string, string> | null;
  paint_performance: Record<string, string> | null;
  spore: string;
  special_notes: string;
  email_sl_spv: string;
  email_amg_mgr: string;
  status: string;
  start_check: string | null;
  finish_check: string | null;
  finish_target: string | null;
  received_at: string | null;
  judgement: string;
  report_files: string[];
  inspector_comment: string;
  created_at: string;
  user?: { id: number; name: string; username: string };
  assignments?: { id: number; inspector_id: number; inspector: { id: number; name: string; username: string } }[];
  approvals?: { id: number; role: string; action: string; comment: string; approver_name: string; created_at: string }[];
}

interface InspectorUser {
  id: number;
  name: string;
  username: string;
}

interface ApiResponse {
  data: QCRRecord[];
  total: number;
  page: number;
  limit: number;
}

// ─── Badge Helpers ─────────────────────────────────────────────────────────────

const urgencyBadgeClass = (level: string) => {
  if (level === "Top urgent") return "bg-red-50 text-red-700 ring-red-600/20";
  if (level === "Urgent") return "bg-amber-50 text-amber-700 ring-amber-600/20";
  return "bg-emerald-50 text-emerald-700 ring-emerald-600/20";
};

const statusBadgeClass = (status: string) => {
  if (status === "Pending Request Manager") return "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-900/20 dark:text-amber-300";
  if (status === "Pending QC-GL") return "bg-purple-50 text-purple-700 ring-purple-600/20 dark:bg-purple-900/20 dark:text-purple-300";
  if (status === "Assigned") return "bg-sky-50 text-sky-700 ring-sky-600/20 dark:bg-sky-900/20 dark:text-sky-300";
  if (status === "In Progress") return "bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-900/20 dark:text-blue-300";
  if (status === "Pending QC-GL Approval" || status === "Pending QC-SPV" || status === "Pending QC-AMG") return "bg-indigo-50 text-indigo-700 ring-indigo-600/20 dark:bg-indigo-900/20 dark:text-indigo-300";
  if (status === "Completed") return "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-900/20 dark:text-emerald-300";
  if (status?.startsWith("Rejected")) return "bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-900/20 dark:text-red-300";
  // Legacy statuses
  if (status === "Pending") return "bg-blue-50 text-blue-700 ring-blue-600/20";
  if (status === "Received") return "bg-emerald-50 text-emerald-700 ring-emerald-600/20";
  if (status === "Rejected") return "bg-red-50 text-red-700 ring-red-600/20";
  return "bg-slate-100 text-slate-600 ring-slate-300/30";
};

// ─── Format Helpers ───────────────────────────────────────────────────────────

const formatDate = (d: string) =>
  d ? new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const formatDateTime = (d: string) =>
  d ? new Date(d).toLocaleString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

const formatDuration = (start: string | null, end: string): string => {
  if (!start) return "—";
  const ms = new Date(end).getTime() - new Date(start).getTime();
  if (ms <= 0) return "—";
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h} jam ${m} menit`;
  if (m > 0) return `${m} menit ${s} detik`;
  return `${s} detik`;
};

// Get approval record for a specific role from an inspection
const getApprovalForRole = (approvals: QCRRecord['approvals'] | null | undefined, role: string) => {
  if (!approvals) return undefined;
  return approvals.find(a => a.role === role);
};


// ─── Sub-components ───────────────────────────────────────────────────────────

const InfoRow = ({ label, value }: { label: string; value?: string | null }) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{label}</span>
    <span className="text-sm font-semibold text-gray-800 dark:text-white break-words">{value || "—"}</span>
  </div>
);

const EvalSection = ({
  title, color, data,
}: {
  title: string; color: string; data: Record<string, string> | null;
}) => {
  if (!data || Object.keys(data).length === 0) return null;
  const labelMap: Record<string, string> = {
    material_test: "Material Test", life_test: "Life Test", drum_test: "Drum Test",
    impact_test: "Impact Test", dimension: "Dimension",
    k_mold: "K-Mold", s_microstructural: "S / Microstructural", compos_3d_contour_2d: "Compos 3D / Contour 2D",
    wr_test: "WR Test", cass_test: "CASS Test", tac_test: "TAC Test",
    sst_test: "SST Test", paint_ability: "Paint Ability", other: "Other",
  };
  return (
    <div className="flex flex-col gap-2">
      <h4 className={`text-[10px] font-bold uppercase tracking-widest ${color}`}>{title}</h4>
      <div className="grid grid-cols-2 gap-x-6 gap-y-2">
        {Object.entries(data).map(([k, v]) => (
          <InfoRow key={k} label={labelMap[k] ?? k} value={v} />
        ))}
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function TableQCR() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [data, setData] = useState<QCRRecord[]>([]);
  const [statsData, setStatsData] = useState<QCRRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterUrgency, setFilterUrgency] = useState("All");
  const [filterDept, setFilterDept] = useState("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailData, setDetailData] = useState<QCRRecord | null>(null);

  // ── Workflow action state ──
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");
  const [approveComment, setApproveComment] = useState("");
  const [inspectors, setInspectors] = useState<InspectorUser[]>([]);
  const [selectedInspectors, setSelectedInspectors] = useState<number[]>([]);
  const [finishTarget, setFinishTarget] = useState("");
  const [showReceiveForm, setShowReceiveForm] = useState(false);

  const datePickerRef = useRef<HTMLInputElement>(null);
  const fpRef = useRef<flatpickr.Instance | null>(null);

  // ── Date helpers ──
  const toYMD = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };
  const todayStr = () => toYMD(new Date());
  const daysAgoStr = (n: number) => { const d = new Date(); d.setDate(d.getDate() - n); return toYMD(d); };
  const firstDayOfMonthStr = () => { const d = new Date(); d.setDate(1); return toYMD(d); };

  const applyPreset = (preset: "today" | "7d" | "30d" | "month") => {
    const today = todayStr();
    let from = today;
    if (preset === "7d") from = daysAgoStr(6);
    else if (preset === "30d") from = daysAgoStr(29);
    else if (preset === "month") from = firstDayOfMonthStr();
    setDateFrom(from); setDateTo(today);
    fpRef.current?.setDate([from, today], false);
  };

  const clearDateFilter = () => { setDateFrom(""); setDateTo(""); fpRef.current?.clear(); };

  // ── flatpickr ──
  useEffect(() => {
    if (!datePickerRef.current) return;
    const fp = flatpickr(datePickerRef.current, {
      mode: "range",
      dateFormat: "Y-m-d",
      disableMobile: true,
      onChange: (dates) => {
        if (dates.length === 1) { const d = toYMD(dates[0]); setDateFrom(d); setDateTo(d); }
        else if (dates.length === 2) { setDateFrom(toYMD(dates[0])); setDateTo(toYMD(dates[1])); }
        else { setDateFrom(""); setDateTo(""); }
      },
    }) as flatpickr.Instance;
    fpRef.current = fp;
    return () => { fp.destroy(); fpRef.current = null; };
  }, []);

  // ── Fetch ──
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(currentPage), limit: String(rowsPerPage) };
      if (filterStatus !== "All") params.status = filterStatus;
      if (filterUrgency !== "All") params.urgency_level = filterUrgency;
      if (filterDept !== "All") params.dept_section = filterDept;
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;
      const qs = new URLSearchParams(params).toString();
      const res = await apiClient.get<ApiResponse>(`/api/qcr?${qs}`);
      setData(res.data.data ?? []);
      setTotal(res.data.total ?? 0);
    } catch { setData([]); setTotal(0); }
    finally { setLoading(false); }
  }, [currentPage, rowsPerPage, filterStatus, filterUrgency, filterDept, searchTerm, dateFrom, dateTo]);

  const fetchStats = useCallback(async () => {
    try {
      const params: Record<string, string> = { limit: "10000" };
      if (filterStatus !== "All") params.status = filterStatus;
      if (filterUrgency !== "All") params.urgency_level = filterUrgency;
      if (filterDept !== "All") params.dept_section = filterDept;
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;
      const qs = new URLSearchParams(params).toString();
      const res = await apiClient.get<ApiResponse>(`/api/qcr?${qs}`);
      setStatsData(res.data.data ?? []);
    } catch { setStatsData([]); }
  }, [filterStatus, filterUrgency, filterDept, searchTerm, dateFrom, dateTo]);

  useEffect(() => { fetchData(); fetchStats(); }, [fetchData, fetchStats]);

  useEffect(() => { setCurrentPage(1); }, [filterStatus, filterUrgency, filterDept, searchTerm, dateFrom, dateTo, rowsPerPage]);

  // ── Overview stats ──
  const getOverviewData = () => {
    const totalCount = statsData.length;
    const grouped: Record<string, { total: number; pending: number; received: number; rejected: number }> = {};
    statsData.forEach(item => {
      const key = item.dept_section || "Other";
      if (!grouped[key]) grouped[key] = { total: 0, pending: 0, received: 0, rejected: 0 };
      grouped[key].total++;
      if (item.status === "Pending") grouped[key].pending++;
      else if (item.status === "Received") grouped[key].received++;
      else if (item.status === "Rejected") grouped[key].rejected++;
    });
    return { totalCount, grouped };
  };
  const { totalCount, grouped } = getOverviewData();

  // ── Pagination ──
  const totalPages = Math.max(1, Math.ceil(total / rowsPerPage));

  // ── CSV Export ──
  const exportCSV = () => {
    if (!data.length) return;
    const headers = ["No", "ID", "Tanggal", "Dept/Section", "Purpose", "Wheel Phase",
      "Process Wheel", "Product Status", "Urgency", "Type Wheel", "No Mold",
      "Line Machining", "No Shot", "Lot Painting", "Status", "Submitted By", "Created At"];
    const rows = data.map((r, i) => [
      (currentPage - 1) * rowsPerPage + i + 1, r.id, r.date_request, r.dept_section,
      r.purpose, r.wheel_phase, r.process_wheel, r.product_status, r.urgency_level,
      r.type_wheel, r.no_mold, r.no_line_machining, r.no_shot, r.lot_painting,
      r.status, r.user?.name ?? "", r.created_at,
    ]);
    const csv = [headers, ...rows].map(row => row.map(v => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = `QCR_${new Date().toISOString().slice(0,10)}.csv`; a.click();
  };

  // ── Workflow Actions ──
  const openDetail = async (row: QCRRecord) => {
    setDetailData(row);
    setDetailOpen(true);
    setActionError("");
    setApproveComment("");
    setShowReceiveForm(false);
    setSelectedInspectors([]);
    setFinishTarget("");
  };

  const loadInspectors = async () => {
    try {
      const res = await apiClient.get<{ data: InspectorUser[] }>("/api/qcr/inspectors");
      setInspectors(res.data.data ?? []);
    } catch { setInspectors([]); }
  };

  const handleApprove = async (action: "approved" | "rejected") => {
    if (!detailData) return;
    if (action === "rejected" && !approveComment.trim()) {
      setActionError("Komentar wajib diisi saat menolak"); return;
    }
    setActionLoading(true); setActionError("");
    try {
      await apiClient.put(`/api/qcr/${detailData.id}/approve`, { action, comment: approveComment });
      // Reload detail & list
      const res = await apiClient.get<{ data: QCRRecord }>(`/api/qcr/${detailData.id}`);
      setDetailData(res.data.data);
      fetchData(); fetchStats();
      setApproveComment("");
    } catch (e: any) {
      setActionError(e.response?.data?.message || "Aksi gagal");
    } finally { setActionLoading(false); }
  };

  const handleReceive = async () => {
    if (!detailData) return;
    if (selectedInspectors.length === 0) { setActionError("Pilih minimal 1 inspector"); return; }
    setActionLoading(true); setActionError("");
    try {
      await apiClient.put(`/api/qcr/${detailData.id}/receive`, { finish_target: finishTarget, inspector_ids: selectedInspectors });
      const res = await apiClient.get<{ data: QCRRecord }>(`/api/qcr/${detailData.id}`);
      setDetailData(res.data.data);
      fetchData(); fetchStats();
      setShowReceiveForm(false);
    } catch (e: any) {
      setActionError(e.response?.data?.message || "Gagal receive QCR");
    } finally { setActionLoading(false); }
  };

  const handleStart = async () => {
    if (!detailData) return;
    setActionLoading(true); setActionError("");
    try {
      await apiClient.put(`/api/qcr/${detailData.id}/start`);
      const res = await apiClient.get<{ data: QCRRecord }>(`/api/qcr/${detailData.id}`);
      setDetailData(res.data.data);
      fetchData(); fetchStats();
    } catch (e: any) {
      setActionError(e.response?.data?.message || "Gagal start pengecekan");
    } finally { setActionLoading(false); }
  };

  const handleSubmitReport = async () => {
    if (!detailData) return;
    setActionLoading(true); setActionError("");
    try {
      // Di versi sederhana ini, saat submit report kita kirim mock comment & files
      await apiClient.put(`/api/qcr/${detailData.id}/submit-report`, {
        inspector_comment: "Pengecekan selesai dan memenuhi standar kualitas.",
        report_files: ["/dummy-report.pdf"]
      });
      const res = await apiClient.get<{ data: QCRRecord }>(`/api/qcr/${detailData.id}`);
      setDetailData(res.data.data);
      fetchData(); fetchStats();
    } catch (e: any) {
      setActionError(e.response?.data?.message || "Gagal submit report");
    } finally { setActionLoading(false); }
  };

  const toggleInspector = (id: number) => {
    setSelectedInspectors([id]);
  };

  return (
    <>
      <style>{`
        @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        .qcr-scrollbar::-webkit-scrollbar { width: 4px; }
        .qcr-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .qcr-scrollbar::-webkit-scrollbar-thumb { background-color: #d1d5db; border-radius: 9999px; }
      `}</style>

      <div className="flex flex-col gap-6">

        {/* ── Overview Cards ─────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row w-full gap-4">
          {/* Card: Total Request */}
          <div className="flex-none bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/10 rounded-2xl p-6 w-full md:w-64 flex flex-col justify-center">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xs font-bold text-gray-500 tracking-wider">TOTAL REQUEST</h3>
              <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
              </div>
            </div>
            <div className="text-4xl font-black text-gray-900 dark:text-white mb-2">{totalCount}</div>
            <div className="text-xs font-medium text-gray-400">Total seluruh data QCR</div>
          </div>

          {/* Card: Statistik per Dept */}
          <div className="flex-1 bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/10 rounded-2xl p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-gray-500 tracking-wider">STATISTIK PER DEPT / SECTION</h3>
              <span className="text-[10px] font-bold bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400 px-2 py-1 rounded-full">{Object.keys(grouped).length} Dept</span>
            </div>
            <div className="flex-1 overflow-y-auto pr-2 max-h-[120px] qcr-scrollbar">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3">
                {Object.entries(grouped).sort((a, b) => b[1].total - a[1].total).map(([dept, stats]) => {
                  const pendPct = stats.total > 0 ? (stats.pending / stats.total) * 100 : 0;
                  const recvPct = stats.total > 0 ? (stats.received / stats.total) * 100 : 0;
                  const rejPct  = stats.total > 0 ? (stats.rejected / stats.total) * 100 : 0;
                  return (
                    <div key={dept} className="flex flex-col gap-1.5 p-3 rounded-xl bg-gray-50/50 dark:bg-white/2 border border-gray-100 dark:border-white/5">
                      <div className="flex items-end justify-between">
                        <span className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate max-w-[120px]" title={dept}>{dept}</span>
                        <span className="text-[11px] font-bold text-gray-500 shrink-0 ml-1">{stats.total} REQ</span>
                      </div>
                      <div className="flex h-1.5 w-full rounded-full overflow-hidden bg-gray-200 dark:bg-white/10 my-1">
                        {stats.pending > 0 && <div className="bg-blue-500 h-full" style={{ width: `${pendPct}%` }} />}
                        {stats.received > 0 && <div className="bg-emerald-500 h-full" style={{ width: `${recvPct}%` }} />}
                        {stats.rejected > 0 && <div className="bg-red-500 h-full" style={{ width: `${rejPct}%` }} />}
                      </div>
                      <div className="flex justify-between text-[9px] font-extrabold tracking-widest">
                        <span className="text-blue-600 dark:text-blue-400">P:{stats.pending}</span>
                        <span className="text-emerald-600 dark:text-emerald-400">R:{stats.received}</span>
                        <span className="text-red-500 dark:text-red-400">X:{stats.rejected}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ── Action Bar ─────────────────────────────────────────── */}
        <div className="flex flex-col gap-4">

          {/* Row 1: Search + Filters + Export */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              </div>
              <input type="text"
                className="block w-full p-2.5 pl-9 text-sm text-gray-900 border border-gray-200 rounded-lg bg-white focus:ring-blue-500 focus:border-blue-500 dark:bg-[#121212] dark:border-white/10 dark:placeholder-gray-500 dark:text-white outline-none transition-colors"
                placeholder="Cari dept, type wheel, purpose..."
                value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {([
                { key: "dept", label: "Dept", value: filterDept, set: setFilterDept, opts: ["All","Dies Assurance","PE Casting","PE Machining","PE Painting","Prod. Casting","Prod. Machining","Prod. Painting","PPIC / Shipment","Equipment Assurance"] },
                { key: "status", label: "Status", value: filterStatus, set: setFilterStatus, opts: ["All","Pending","Received","Rejected"] },
                { key: "urgency", label: "Urgency", value: filterUrgency, set: setFilterUrgency, opts: ["All","Top urgent","Urgent","Reguler"] },
              ] as const).map(({ key, label, value, set, opts }) => (
                <div key={key} className="relative border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-[#121212] overflow-hidden">
                  <select value={value} onChange={e => set(e.target.value)}
                    className={`appearance-none block w-full px-3 py-2.5 pr-8 text-sm bg-transparent focus:outline-none cursor-pointer ${
                      value !== "All" ? "text-blue-700 dark:text-blue-300 font-semibold" : "text-gray-900 dark:text-white"
                    }`}>
                    <option value="All">{label}</option>
                    {opts.filter(o => o !== "All").map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg>
                  </div>
                </div>
              ))}
              <button onClick={exportCSV}
                className="flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200 transition-colors whitespace-nowrap">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                Export
              </button>
              <button onClick={() => router.push("/qcr/create")}
                className="flex items-center gap-1.5 px-3 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors whitespace-nowrap shadow-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
                Buat Request
              </button>
            </div>
          </div>

          {/* Row 2: Date Range + Presets */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/10 rounded-xl">
            <div className="flex items-center gap-1.5 shrink-0">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tanggal</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap flex-1">
              <div className={`relative flex items-center gap-2 border rounded-lg px-3 py-2 min-w-[240px] transition-colors cursor-pointer ${
                (dateFrom || dateTo) ? "border-sky-400 bg-sky-50 dark:bg-sky-900/20 dark:border-sky-600" : "border-gray-200 dark:border-white/10 bg-white dark:bg-[#1a1a1a] hover:border-gray-300"
              }`}>
                <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                <input ref={datePickerRef} type="text" readOnly placeholder="Pilih rentang tanggal..."
                  className={`flex-1 text-sm font-medium bg-transparent outline-none cursor-pointer min-w-0 ${
                    (dateFrom || dateTo) ? "text-sky-700 dark:text-sky-300" : "text-gray-400 dark:text-gray-500"
                  }`}
                />
                {(dateFrom || dateTo) && (
                  <button onClick={e => { e.stopPropagation(); clearDateFilter(); }} className="shrink-0 text-sky-400 hover:text-sky-600 transition-colors">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
                  </button>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-gray-400 font-medium hidden sm:block">Cepat:</span>
                {(["today","7d","30d","month"] as const).map(p => (
                  <button key={p} onClick={() => applyPreset(p)}
                    className="px-2.5 py-1.5 text-xs font-semibold rounded-md border transition-all border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:border-sky-400 hover:bg-sky-50 hover:text-sky-700 dark:hover:bg-sky-900/20">
                    {p === "today" ? "Hari Ini" : p === "7d" ? "7 Hari" : p === "30d" ? "30 Hari" : "Bulan Ini"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Row 3: Stats + Filter Chips + Rows per page */}
          <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2 flex-wrap">
              <span>Total {total} records</span>
              {(dateFrom || dateTo) && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300 text-xs font-semibold ring-1 ring-sky-200 dark:ring-sky-700">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                  {dateFrom && dateTo ? (dateFrom === dateTo ? dateFrom : `${dateFrom} — ${dateTo}`) : dateFrom ? `Dari ${dateFrom}` : `Sampai ${dateTo}`}
                  <button onClick={clearDateFilter} className="hover:text-sky-900 transition-colors"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg></button>
                </span>
              )}
              {filterDept !== "All" && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 text-xs font-semibold ring-1 ring-blue-200 dark:ring-blue-700">
                  Dept: {filterDept}
                  <button onClick={() => setFilterDept("All")} className="hover:text-blue-900 transition-colors"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg></button>
                </span>
              )}
              {filterStatus !== "All" && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 text-xs font-semibold ring-1 ring-blue-200 dark:ring-blue-700">
                  Status: {filterStatus}
                  <button onClick={() => setFilterStatus("All")} className="hover:text-blue-900 transition-colors"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg></button>
                </span>
              )}
              {filterUrgency !== "All" && (
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ${
                  filterUrgency === "Top urgent" ? "bg-red-50 text-red-700 ring-red-200 dark:bg-red-900/30 dark:text-red-300 dark:ring-red-700"
                  : filterUrgency === "Urgent" ? "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:ring-amber-700"
                  : "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:ring-emerald-700"
                }`}>
                  {filterUrgency}
                  <button onClick={() => setFilterUrgency("All")} className="hover:opacity-70 transition-opacity"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg></button>
                </span>
              )}
              {(filterDept !== "All" || filterStatus !== "All" || filterUrgency !== "All" || dateFrom || dateTo) && (
                <button onClick={() => { setFilterDept("All"); setFilterStatus("All"); setFilterUrgency("All"); clearDateFilter(); }}
                  className="text-xs text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 underline underline-offset-2 transition-colors">
                  Reset semua
                </button>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              Rows per page:
              <select value={rowsPerPage} onChange={e => setRowsPerPage(Number(e.target.value))}
                className="bg-transparent border-none focus:outline-none cursor-pointer text-gray-700 dark:text-gray-300">
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </div>
          </div>
        </div>

        {/* ── Table ───────────────────────────────────────────────── */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/5 dark:bg-[#121212]">
          <div className="overflow-x-auto">
            <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/5">
              <TableRow>
                {["NO", "TANGGAL", "DEPT / SECTION", "TYPE WHEEL", "URGENCY", "PROCESS", "STATUS", "APPROVAL", "ACTIONS"].map(h => (
                  <TableCell key={h} isHeader className={`px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-400 whitespace-nowrap ${h === "ACTIONS" ? "text-end" : h === "APPROVAL" ? "text-center" : ""}`}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm text-gray-400">Memuat data...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="py-16 text-center text-sm text-gray-400">
                    Tidak ada data QCR ditemukan.
                  </TableCell>
                </TableRow>
              ) : data.map((row, index) => (
                <tr
                  key={row.id}
                  className="border-b border-gray-50 dark:border-white/5 hover:bg-blue-50/40 dark:hover:bg-white/5 cursor-pointer transition-colors"
                  onClick={() => openDetail(row)}
                >
                  <TableCell className="px-4 py-3 text-xs font-bold text-gray-400 tabular-nums">
                    {(currentPage - 1) * rowsPerPage + index + 1}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">
                    {formatDate(row.date_request)}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <p className="text-sm font-semibold text-gray-800 dark:text-white">{row.dept_section}</p>
                    {row.purpose && <p className="text-xs text-gray-400 truncate max-w-[180px]">{row.purpose}</p>}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm font-mono font-medium text-gray-700 dark:text-gray-200 whitespace-nowrap">
                    {row.type_wheel || "—"}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <span className={`inline-flex px-2.5 py-1 text-[11px] font-bold rounded-full ring-1 ring-inset ${urgencyBadgeClass(row.urgency_level)}`}>
                      {row.urgency_level}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {row.process_wheel}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <span className={`inline-flex px-2.5 py-1 text-[11px] font-bold rounded-full ring-1 ring-inset ${statusBadgeClass(row.status)}`}>
                      {row.status}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {["GL", "SPV", "AMG"].map((role) => {
                        const approval = getApprovalForRole(row.approvals, role);
                        const isApproved = approval?.action === "approved";
                        const isRejected = approval?.action === "rejected";
                        const displayRole = role;
                        return (
                          <span
                            key={role}
                            title={approval ? `${displayRole}: ${approval.action} oleh ${approval.approver_name}` : `${displayRole}: Belum diproses`}
                            className={`inline-flex items-center justify-center w-8 h-6 text-[9px] font-bold rounded-md cursor-default ${
                              isApproved
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                : isRejected
                                ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                : "bg-gray-100 text-gray-400 dark:bg-white/5 dark:text-gray-500"
                            }`}
                          >
                            {isApproved ? "✓" : isRejected ? "✗" : "–"}
                          </span>
                        );
                      })}
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-end">
                    <button
                      onClick={(e) => { e.stopPropagation(); openDetail(row); }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Detail
                    </button>
                  </TableCell>
                </tr>
              ))}
            </TableBody>
            </Table>
          </div>
        </div>

        {/* ── Pagination ────────────────────────────────────────────────── */}
        {!loading && totalPages > 1 && (
          <div className="px-5 py-4 border-t border-gray-100 dark:border-white/5 flex items-center justify-between gap-3 flex-wrap">
            <p className="text-xs text-gray-400">
              Menampilkan {(currentPage - 1) * rowsPerPage + 1}–{Math.min(currentPage * rowsPerPage, total)} dari {total} record
            </p>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed text-sm transition-colors"
              >‹</button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const start = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
                const p = start + i;
                return (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${
                      p === currentPage
                        ? "bg-blue-600 text-white shadow-sm"
                        : "border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/10"
                    }`}
                  >{p}</button>
                );
              })}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed text-sm transition-colors"
              >›</button>
            </div>
          </div>
        )}
      </div>

      {/* ── Detail Drawer ──────────────────────────────────────────────── */}
      {detailOpen && detailData && (
        <>
          <div className="fixed inset-0 z-99998 bg-black/40 backdrop-blur-sm" onClick={() => { setDetailOpen(false); setDetailData(null); }} />
          <div className="fixed inset-y-0 right-0 z-99999 w-full max-w-[600px] bg-white dark:bg-gray-900 shadow-2xl flex flex-col animate-[slideIn_0.3s_ease-out]">

            {/* Drawer Header */}
            <div className="shrink-0 px-8 pt-7 pb-5 border-b border-gray-100 dark:border-white/5">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => { setDetailOpen(false); setDetailData(null); }}
                  className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 dark:hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                  Tutup
                </button>
                <span className="text-xs text-gray-400 font-mono">ID #{detailData.id}</span>
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{detailData.type_wheel || "—"}</h2>
              <p className="text-sm text-gray-500 mt-1">{formatDate(detailData.date_request)} · {detailData.dept_section}</p>
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                <span className={`inline-flex px-3 py-1.5 text-xs font-bold rounded-full ring-1 ring-inset ${urgencyBadgeClass(detailData.urgency_level)}`}>
                  {detailData.urgency_level}
                </span>
                <span className={`inline-flex px-3 py-1.5 text-xs font-bold rounded-full ring-1 ring-inset ${statusBadgeClass(detailData.status)}`}>
                  {detailData.status}
                </span>
              </div>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto px-8 py-6 space-y-8">

              {/* ── Progress Timeline ── */}
              <section>
                <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Progress</h3>
                <div className="flex flex-col gap-1.5">
                  {[
                    { label: "Submit Request", statuses: ["Pending Request Manager","Pending QC-GL","Assigned","In Progress","Pending QC-GL Approval","Pending QC-SPV","Pending QC-AMG","Completed"] },
                    { label: "Approval Request Manager", statuses: ["Pending QC-GL","Assigned","In Progress","Pending QC-GL Approval","Pending QC-SPV","Pending QC-AMG","Completed"] },
                    { label: "Diterima QC-GL", statuses: ["Assigned","In Progress","Pending QC-GL Approval","Pending QC-SPV","Pending QC-AMG","Completed"] },
                    { label: "Inspector Check", statuses: ["Pending QC-GL Approval","Pending QC-SPV","Pending QC-AMG","Completed"] },
                    { label: "Approval QC-GL → SPV → AMG", statuses: ["Completed"] },
                  ].map(({ label, statuses }) => {
                    const done = statuses.includes(detailData.status);
                    const active = detailData.status === statuses[0] || (!done && statuses.some(s => s === detailData.status));
                    let timestamp = "";
                    if (done) {
                      if (label === "Submit Request") timestamp = detailData.created_at;
                      if (label === "Approval Request Manager") timestamp = detailData.approvals?.find(a => a.role === "RE_MG" && a.action === "approved")?.created_at || "";
                      if (label === "Diterima QC-GL") timestamp = detailData.received_at || "";
                      if (label === "Inspector Check") timestamp = detailData.finish_check || "";
                      if (label === "Approval QC-GL → SPV → AMG") timestamp = detailData.approvals?.find(a => a.role === "AMG" && a.action === "approved")?.created_at || "";
                    }

                    return (
                      <div key={label} className="flex items-start gap-2.5">
                        <div className={`w-4 h-4 mt-0.5 rounded-full flex items-center justify-center shrink-0 ${done ? "bg-emerald-500" : active ? "bg-blue-500 animate-pulse" : "bg-gray-200 dark:bg-white/10"}`}>
                          {done && <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>}
                        </div>
                        <div className="flex flex-col -mt-0.5">
                          <span className={`text-xs font-semibold ${done ? "text-emerald-600 dark:text-emerald-400" : active ? "text-blue-600 dark:text-blue-400" : "text-gray-400"}`}>{label}</span>
                          {timestamp && <span className="text-[10px] font-medium text-gray-400">{formatDateTime(timestamp)}</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              <div className="border-t border-gray-100 dark:border-white/5" />

              {/* ── Workflow Actions ── */}
              {actionError && <div className="text-xs font-semibold text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">{actionError}</div>}

              {/* QC-GL: Receive & Assign */}
              {detailData.status === "Pending QC-GL" && (user?.roles.includes("gl") || user?.roles.includes("admin") || user?.roles.includes("superadmin")) && (
                <section>
                  <h3 className="text-[11px] font-bold text-purple-500 uppercase tracking-widest mb-3">Aksi QC-GL — Terima & Assign</h3>
                  {!showReceiveForm ? (
                    <div className="flex gap-2">
                      <button onClick={() => { setShowReceiveForm(true); loadInspectors(); }}
                        className="flex-1 h-9 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors">Terima & Assign Inspector</button>
                      <button onClick={() => handleApprove("rejected")} disabled={actionLoading}
                        className="flex-1 h-9 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors disabled:opacity-50">Tolak</button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Target Selesai</label>
                        <input type="date" value={finishTarget} onChange={e => setFinishTarget(e.target.value)}
                          className="w-full h-9 px-3 border border-gray-200 dark:border-white/10 rounded-lg text-sm bg-white dark:bg-[#1a1a1a] text-gray-800 dark:text-white outline-none focus:border-blue-500" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Pilih Inspector</label>
                        <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto">
                          {inspectors.map(ins => (
                            <label key={ins.id} className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer border transition-colors ${selectedInspectors.includes(ins.id) ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-gray-200 dark:border-white/10 hover:border-gray-300"}`}>
                              <input type="radio" name="inspector_select" checked={selectedInspectors.includes(ins.id)} onChange={() => toggleInspector(ins.id)} className="accent-blue-600" />
                              <span className="text-sm font-semibold text-gray-800 dark:text-white">{ins.name || ins.username}</span>
                            </label>
                          ))}
                          {inspectors.length === 0 && <p className="text-xs text-gray-400 py-2">Memuat inspector...</p>}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={handleReceive} disabled={actionLoading}
                          className="flex-1 h-9 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors disabled:opacity-50">
                          {actionLoading ? "Menyimpan..." : "Konfirmasi Assign"}
                        </button>
                        <button onClick={() => setShowReceiveForm(false)} className="h-9 px-4 rounded-lg border border-gray-200 dark:border-white/10 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5">Batal</button>
                      </div>
                    </div>
                  )}
                  <div className="mt-3">
                    <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Komentar Penolakan</label>
                    <input value={approveComment} onChange={e => setApproveComment(e.target.value)} placeholder="Wajib diisi jika tolak..."
                      className="w-full h-9 px-3 border border-gray-200 dark:border-white/10 rounded-lg text-sm bg-white dark:bg-[#1a1a1a] text-gray-800 dark:text-white outline-none focus:border-blue-500" />
                  </div>
                </section>
              )}

              {/* Start & Submit Report */}
              {(user?.roles.includes("qc_inspector") || user?.roles.includes("operator") || user?.roles.includes("gl") || user?.roles.includes("admin") || user?.roles.includes("superadmin")) && (
                <>
                  {detailData.status === "Assigned" && (
                    <section>
                      <h3 className="text-[11px] font-bold text-blue-500 uppercase tracking-widest mb-3">Aksi Inspector — Mulai Pengecekan</h3>
                      <button onClick={handleStart} disabled={actionLoading} className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-lg shadow-md transition-all disabled:opacity-50">
                        {actionLoading ? "Memproses..." : "Memulai..."}
                      </button>
                    </section>
                  )}
                  {detailData.status === "On Progress" && (
                    <section>
                      <h3 className="text-[11px] font-bold text-emerald-500 uppercase tracking-widest mb-3">Aksi Inspector — Submit Report</h3>
                      <button onClick={handleSubmitReport} disabled={actionLoading} className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-lg shadow-md transition-all disabled:opacity-50">
                        {actionLoading ? "Memproses..." : "Selesai & Submit Report"}
                      </button>
                    </section>
                  )}
                </>
              )}

              {/* ── Daftar Persetujuan (GL → SPV → AMG) — always show when relevant ── */}
              {["Pending QC-GL Approval","Pending QC-SPV","Pending QC-AMG","Completed"].some(s => detailData.status === s || detailData.status.startsWith("Rejected")) && (
                <>
                  <div className="border-t border-gray-100 dark:border-white/5" />
                  <section>
                    <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4">Daftar Persetujuan</h3>
                    <div className="space-y-0">
                      {(["GL", "SPV", "AMG"] as const).map((role, idx) => {
                        const approval = detailData.approvals?.find(a => a.role === role);
                        const isApproved = approval?.action === "approved";
                        const isRejected = approval?.action === "rejected";
                        const isPending = !approval;
                        const roleFull: Record<string, string> = { GL: "Group Leader", SPV: "Supervisor", AMG: "Asst. Manager" };
                        return (
                          <div key={role} className="relative">
                            {idx < 2 && (
                              <div className={`absolute left-5 top-12 w-0.5 h-8 ${isPending ? "bg-gray-200 dark:bg-white/10" : isApproved ? "bg-emerald-300 dark:bg-emerald-700" : "bg-red-300 dark:bg-red-700"}`} />
                            )}
                            <div className={`flex items-start gap-4 p-4 rounded-xl mb-2 transition-colors ${isPending ? "bg-gray-50/50 dark:bg-white/2" : isApproved ? "bg-emerald-50/50 dark:bg-emerald-900/10" : "bg-red-50/50 dark:bg-red-900/10"}`}>
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${isPending ? "bg-gray-200 text-gray-500 dark:bg-white/10 dark:text-gray-400" : isApproved ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400" : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400"}`}>
                                {approval ? approval.approver_name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) : role}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                  {approval ? approval.approver_name : `Menunggu ${role}`}
                                </p>
                                <p className="text-[11px] text-gray-500 dark:text-gray-400">{roleFull[role]}</p>
                                {approval?.comment && (
                                  <div className="mt-2 rounded-lg bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 px-3 py-2">
                                    <p className="text-xs text-gray-600 dark:text-gray-300 whitespace-pre-wrap">&ldquo;{approval.comment}&rdquo;</p>
                                  </div>
                                )}
                              </div>
                              <div className="text-right shrink-0">
                                <span className={`inline-flex px-2.5 py-1 text-[10px] font-bold rounded-full ${isPending ? "bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-gray-400" : isApproved ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`}>
                                  {isPending ? "Menunggu" : isApproved ? "Disetujui" : "Ditolak"}
                                </span>
                                {approval && <p className="text-[10px] text-gray-400 mt-1">{formatDateTime(approval.created_at)}</p>}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                </>
              )}

              {/* ── Aksi Approval (tombol muncul jika user punya role yang tepat) ── */}
              {["Pending QC-GL Approval","Pending QC-SPV","Pending QC-AMG"].includes(detailData.status) && (() => {
                const requiredRole =
                  detailData.status === "Pending QC-GL Approval" ? "gl" :
                  detailData.status === "Pending QC-SPV" ? "spv" :
                  detailData.status === "Pending QC-AMG" ? "amg" : "";

                const isAdmin = user?.roles.includes("admin") || user?.roles.includes("superadmin");
                const hasRole = user?.roles.includes(requiredRole);
                if (!isAdmin && !hasRole) return null;

                return (
                  <section className="border-t border-gray-100 dark:border-white/5 pt-4">
                    <h3 className="text-[11px] font-bold text-indigo-500 uppercase tracking-widest mb-3">Aksi Persetujuan — {detailData.status}</h3>
                    <div className="space-y-2">
                      <input value={approveComment} onChange={e => setApproveComment(e.target.value)} placeholder="Komentar (wajib jika tolak)..."
                        className="w-full h-9 px-3 border border-gray-200 dark:border-white/10 rounded-lg text-sm bg-white dark:bg-[#1a1a1a] text-gray-800 dark:text-white outline-none focus:border-blue-500" />
                      <div className="flex gap-2">
                        <button onClick={() => handleApprove("approved")} disabled={actionLoading}
                          className="flex-1 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"/></svg>
                          {actionLoading ? "..." : "Setujui"}
                        </button>
                        <button onClick={() => handleApprove("rejected")} disabled={actionLoading}
                          className="flex-1 h-10 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-md shadow-red-600/20">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
                          {actionLoading ? "..." : "Tolak"}
                        </button>
                      </div>
                    </div>
                  </section>
                );
              })()}

              {/* ── Inspector Assignments ── */}
              {detailData.assignments && detailData.assignments.length > 0 && (
                <>
                  <div className="border-t border-gray-100 dark:border-white/5" />
                  <section>
                    <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Inspector Ditugaskan</h3>
                    <div className="flex flex-wrap gap-2">
                      {detailData.assignments.map(a => (
                        <span key={a.id} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-300 rounded-full text-xs font-bold ring-1 ring-sky-200 dark:ring-sky-700">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                          {a.inspector?.name || a.inspector?.username || `Inspector #${a.inspector_id}`}
                        </span>
                      ))}
                    </div>
                    {detailData.finish_target && (
                      <p className="text-xs text-gray-400 mt-2">Target selesai: <span className="font-bold text-gray-700 dark:text-gray-200">{formatDate(detailData.finish_target)}</span></p>
                    )}
                  </section>
                </>
              )}

              {/* ── Inspector Report ── */}
              {detailData.judgement && (
                <>
                  <div className="border-t border-gray-100 dark:border-white/5" />
                  <section>
                    <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Hasil Pengecekan</h3>
                    <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/2 px-5 py-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-400">Judgement</span>
                        <span className={`inline-flex px-3 py-1 text-xs font-extrabold rounded-full ${detailData.judgement === "OK" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300" : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300"}`}>{detailData.judgement}</span>
                      </div>
                      {detailData.inspector_comment && (
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-semibold text-gray-400">Komentar Inspector</span>
                          <p className="text-sm text-gray-700 dark:text-gray-300">{detailData.inspector_comment}</p>
                        </div>
                      )}
                      {detailData.report_files && detailData.report_files.length > 0 && (
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-semibold text-gray-400">File Report</span>
                          <div className="flex flex-wrap gap-2">
                            {detailData.report_files.map((f, i) => (
                              <a key={i} href={f} target="_blank" rel="noreferrer"
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg text-xs font-semibold hover:bg-blue-100 transition-colors">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
                                File {i + 1}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                      {[["Start Check", detailData.start_check], ["Finish Check", detailData.finish_check]].map(([label, val]) => (
                        <div key={String(label)} className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-gray-400">{label}</span>
                          <span className="text-sm font-bold text-gray-800 dark:text-white">{val ? formatDateTime(val as string) : "—"}</span>
                        </div>
                      ))}
                    </div>
                  </section>
                </>
              )}

              <div className="border-t border-gray-100 dark:border-white/5" />

              {/* Info Umum */}
              <section>
                <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Informasi Umum</h3>
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  <InfoRow label="Dept / Section" value={detailData.dept_section} />
                  <InfoRow label="Purpose" value={detailData.purpose} />
                  <InfoRow label="Wheel Phase" value={detailData.wheel_phase} />
                  <InfoRow label="Process Wheel" value={detailData.process_wheel} />
                  <InfoRow label="Product Status" value={detailData.product_status} />
                  <InfoRow label="Urgency Level" value={detailData.urgency_level} />
                  <InfoRow label="Submitted By" value={detailData.user?.name || detailData.user?.username || "—"} />
                </div>
              </section>

              <div className="border-t border-gray-100 dark:border-white/5" />

              <section>
                <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Detail Part</h3>
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  <InfoRow label="Type Wheel" value={detailData.type_wheel} />
                  <InfoRow label="No. Mold" value={detailData.no_mold} />
                  <InfoRow label="No. Line Machining" value={detailData.no_line_machining} />
                  <InfoRow label="No. Shot" value={detailData.no_shot} />
                  <InfoRow label="Lot Painting" value={detailData.lot_painting} />
                  <InfoRow label="Spore" value={detailData.spore} />
                </div>
              </section>

              {(detailData.durability || detailData.capability || detailData.paint_performance) && (
                <>
                  <div className="border-t border-gray-100 dark:border-white/5" />
                  <section className="space-y-5">
                    <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Item Evaluasi</h3>
                    <EvalSection title="Durability" color="text-indigo-500" data={detailData.durability} />
                    <EvalSection title="Capability Process" color="text-violet-500" data={detailData.capability} />
                    <EvalSection title="Paint Performance" color="text-amber-500" data={detailData.paint_performance} />
                  </section>
                </>
              )}

              {/* ── Approval History ── */}
              {detailData.approvals && detailData.approvals.length > 0 && (
                <>
                  <div className="border-t border-gray-100 dark:border-white/5" />
                  <section>
                    <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Riwayat Approval</h3>
                    <div className="flex flex-col gap-2">
                      {detailData.approvals.map(a => (
                        <div key={a.id} className={`flex flex-col gap-1 px-4 py-3 rounded-xl border ${a.action === "approved" ? "border-emerald-200 bg-emerald-50/50 dark:border-emerald-700 dark:bg-emerald-900/10" : "border-red-200 bg-red-50/50 dark:border-red-700 dark:bg-red-900/10"}`}>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-gray-700 dark:text-gray-200">{a.approver_name} <span className="text-gray-400 font-normal">({a.role})</span></span>
                            <span className={`text-[10px] font-extrabold uppercase ${a.action === "approved" ? "text-emerald-600" : "text-red-600"}`}>{a.action}</span>
                          </div>
                          {a.comment && <p className="text-xs text-gray-500 dark:text-gray-400">{a.comment}</p>}
                          <p className="text-[10px] text-gray-400">{formatDateTime(a.created_at)}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                </>
              )}

            </div>
          </div>
        </>
      )}
    </>
  );
}
