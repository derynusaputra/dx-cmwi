"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.css";
import { apiClient } from "@/lib/axios";
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
  created_at: string;
  user?: { id: number; name: string; email: string };
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
  const [data, setData] = useState<QCRRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterUrgency, setFilterUrgency] = useState("All");
  const [filterDept, setFilterDept] = useState("All");
  const [dateRange, setDateRange] = useState<[string, string]>(["", ""]);

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailData, setDetailData] = useState<QCRRecord | null>(null);

  const dateRef = useRef<HTMLInputElement>(null);
  const fpRef = useRef<flatpickr.Instance | null>(null);

  // ── flatpickr date range ──
  useEffect(() => {
    if (!dateRef.current) return;
    fpRef.current = flatpickr(dateRef.current, {
      mode: "range",
      dateFormat: "Y-m-d",
      onChange: (dates) => {
        if (dates.length === 2) {
          setDateRange([
            dates[0].toISOString().split("T")[0],
            dates[1].toISOString().split("T")[0],
          ]);
          setCurrentPage(1);
        } else if (dates.length === 0) {
          setDateRange(["", ""]);
        }
      },
    });
    return () => fpRef.current?.destroy();
  }, []);

  // ── Fetch ──
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {
        page: String(currentPage),
        limit: String(rowsPerPage),
      };
      if (filterStatus !== "All") params.status = filterStatus;
      if (filterUrgency !== "All") params.urgency_level = filterUrgency;
      if (filterDept !== "All") params.dept_section = filterDept;
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (dateRange[0]) params.date_from = dateRange[0];
      if (dateRange[1]) params.date_to = dateRange[1];

      const qs = new URLSearchParams(params).toString();
      const res = await apiClient.get<ApiResponse>(`/api/qcr?${qs}`);
      setData(res.data.data ?? []);
      setTotal(res.data.total ?? 0);
    } catch {
      setData([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, filterStatus, filterUrgency, filterDept, searchTerm, dateRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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

  const clearDate = () => { fpRef.current?.clear(); setDateRange(["", ""]); };

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      `}} />

      <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">

        {/* ── Toolbar ───────────────────────────────────────────────────── */}
        <div className="px-5 pt-5 pb-4 border-b border-gray-100 dark:border-white/5 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Quality Control Request</h2>
              <p className="text-xs text-gray-400 mt-0.5">{total} total records</p>
            </div>
            <button
              onClick={exportCSV}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
            >
              Export CSV
            </button>
          </div>

          {/* Search + Filters */}
          <div className="flex flex-wrap gap-2">
            <input
              type="text"
              placeholder="Cari dept, type wheel, purpose..."
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="flex-1 min-w-[200px] h-9 px-3 border border-gray-200 dark:border-white/10 rounded-lg text-sm bg-gray-50 dark:bg-white/5 text-gray-800 dark:text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-gray-400"
            />
            {[
              { label: "Status", value: filterStatus, set: setFilterStatus, opts: ["All", "Pending", "Received", "Rejected"] },
              { label: "Urgency", value: filterUrgency, set: setFilterUrgency, opts: ["All", "Top urgent", "Urgent", "Reguler"] },
              { label: "Dept", value: filterDept, set: setFilterDept, opts: ["All", "Dies Assurance", "PE Casting", "PE Machining", "PE Painting", "Prod. Casting", "Prod. Machining", "Prod. Painting", "PPIC / Shipment", "Equipment Assurance"] },
            ].map(({ label, value, set, opts }) => (
              <select
                key={label}
                value={value}
                onChange={e => { set(e.target.value); setCurrentPage(1); }}
                className="h-9 px-3 pr-8 border border-gray-200 dark:border-white/10 rounded-lg text-xs font-medium bg-gray-50 dark:bg-white/5 text-gray-700 dark:text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none cursor-pointer"
              >
                {opts.map(o => <option key={o} value={o}>{o === "All" ? `Semua ${label}` : o}</option>)}
              </select>
            ))}

            {/* Date range */}
            <div className="flex items-center gap-1">
              <input ref={dateRef} type="text" placeholder="Pilih tanggal..." readOnly
                className="h-9 w-44 px-3 border border-gray-200 dark:border-white/10 rounded-lg text-xs bg-gray-50 dark:bg-white/5 text-gray-800 dark:text-white outline-none focus:border-blue-500 cursor-pointer" />
              {(dateRange[0] || dateRange[1]) && (
                <button onClick={clearDate} className="h-9 px-2 text-gray-400 hover:text-gray-600 text-xs border border-gray-200 rounded-lg bg-gray-50 dark:bg-white/5 transition-colors">✕</button>
              )}
            </div>
          </div>
        </div>

        {/* ── Table ─────────────────────────────────────────────────────── */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/5">
              <TableRow>
                {["NO", "TANGGAL", "DEPT / SECTION", "TYPE WHEEL", "URGENCY", "PROCESS", "STATUS"].map(h => (
                  <TableCell key={h} isHeader className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-400 whitespace-nowrap">{h}</TableCell>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm text-gray-400">Memuat data...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-16 text-center text-sm text-gray-400">
                    Tidak ada data QCR ditemukan.
                  </TableCell>
                </TableRow>
              ) : data.map((row, index) => (
                <tr
                  key={row.id}
                  className="border-b border-gray-50 dark:border-white/5 hover:bg-blue-50/40 dark:hover:bg-white/5 cursor-pointer transition-colors"
                  onClick={() => { setDetailData(row); setDetailOpen(true); }}
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
                </tr>
              ))}
            </TableBody>
          </Table>
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
                </div>
              </section>

              <div className="border-t border-gray-100 dark:border-white/5" />

              {/* Detail Part */}
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

              {/* Item Evaluasi */}
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

              {/* Catatan */}
              {detailData.special_notes && (
                <>
                  <div className="border-t border-gray-100 dark:border-white/5" />
                  <section>
                    <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Catatan Khusus</h3>
                    <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/2 px-5 py-4">
                      <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">{detailData.special_notes}</p>
                    </div>
                  </section>
                </>
              )}

              {/* Email Approval */}
              {(detailData.email_sl_spv || detailData.email_amg_mgr) && (
                <>
                  <div className="border-t border-gray-100 dark:border-white/5" />
                  <section>
                    <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Email Approval</h3>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                      <InfoRow label="SL / SPV" value={detailData.email_sl_spv} />
                      <InfoRow label="AMG / MGR" value={detailData.email_amg_mgr} />
                    </div>
                  </section>
                </>
              )}

              {/* Waktu Pengecekan */}
              <div className="border-t border-gray-100 dark:border-white/5" />
              <section>
                <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Waktu Pengecekan</h3>
                <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/2 px-5 py-4 space-y-3">
                  {[
                    ["Start", detailData.start_check ? formatDateTime(detailData.start_check) : "—"],
                    ["Finish (Created At)", formatDateTime(detailData.created_at)],
                    ["Durasi", formatDuration(detailData.start_check, detailData.created_at)],
                  ].map(([label, value]) => (
                    <div key={label} className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-400">{label}</span>
                      <span className="text-sm font-bold text-gray-800 dark:text-white">{value}</span>
                    </div>
                  ))}
                </div>
              </section>

            </div>
          </div>
        </>
      )}
    </>
  );
}
