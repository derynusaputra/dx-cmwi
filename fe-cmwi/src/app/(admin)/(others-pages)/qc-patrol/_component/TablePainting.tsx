"use client";

import React, { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface PaintingInspection {
  id: number;
  date: string;
  inspector: string;
  line: string;
  wheel_type: string;
  judgement: "OK" | "NG";
  status: string;
  shift: string;
  group: string;
  painting_status: string;
  brightness: Record<string, Record<string, string | number>> | null;
  thickness: Record<string, string | number> | null;
  gloss: Record<string, string | number> | null;
  photos: string[];
  attachments: string[];
  comment: string;
  created_at: string;
}

interface ApiResponse {
  data: PaintingInspection[];
  total: number;
  page: number;
  limit: number;
}

const API_URL = "";

export default function TablePainting() {
  const [data, setData] = useState<PaintingInspection[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterResult, setFilterResult] = useState("All");
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Detail modal
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailData, setDetailData] = useState<PaintingInspection | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = {
        page: currentPage,
        limit: rowsPerPage,
      };
      if (searchTerm) params.search = searchTerm;
      if (filterStatus !== "All") params.status = filterStatus;
      if (filterResult !== "All") params.judgement = filterResult;

      const res = await apiClient.get<ApiResponse>("/painting-inspections", { params });
      setData(res.data.data || []);
      setTotal(res.data.total);
    } catch {
      setData([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, rowsPerPage, searchTerm, filterStatus, filterResult]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, filterResult, rowsPerPage]);

  const openDetail = async (id: number) => {
    setDetailOpen(true);
    setDetailLoading(true);
    setDetailData(null);
    try {
      const res = await apiClient.get<{ data: PaintingInspection }>(`/painting-inspections/${id}`);
      setDetailData(res.data.data);
    } catch {
      setDetailData(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const totalPages = Math.ceil(total / rowsPerPage);

  const toggleSelectAll = () => {
    if (selectedRows.size === data.length && data.length > 0) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(data.map(item => item.id)));
    }
  };

  const toggleSelectRow = (id: number) => {
    const next = new Set(selectedRows);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelectedRows(next);
  };

  const handleExportCSV = () => {
    const headers = ["Date", "Inspector", "Line", "Wheel Type", "Result", "Status"];
    const csvContent = [
      headers.join(","),
      ...data.map(row =>
        [row.date, row.inspector, row.line, row.wheel_type, row.judgement, row.status].join(",")
      )
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "painting_inspection_data.csv";
    link.click();
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
    } catch {
      return dateStr;
    }
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, currentPage + 2);

    if (end - start + 1 < maxVisible) {
      if (start === 1) end = Math.min(totalPages, start + maxVisible - 1);
      else if (end === totalPages) start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
            currentPage === i
              ? "bg-gray-100 text-gray-900 dark:bg-white/10 dark:text-white"
              : "text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-white/5"
          }`}
        >
          {i}
        </button>
      );
    }
    return buttons;
  };

  const statusColor = (s: string) =>
    s === "Approved" ? "bg-green-500" : s === "Rejected" ? "bg-red-500" : s === "Pending GL" ? "bg-blue-500" : "bg-yellow-500";

  const statusBadge = (s: string) => {
    const colors: Record<string, string> = {
      "Approved": "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-900/30 dark:text-emerald-400",
      "Rejected": "bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-900/30 dark:text-red-400",
      "Pending GL": "bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-900/30 dark:text-blue-400",
      "Pending SPV": "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-900/30 dark:text-amber-400",
    };
    return colors[s] || "bg-gray-50 text-gray-700 ring-gray-600/20";
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Action Bar */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </div>
            <input
              type="text"
              className="block w-full p-2.5 pl-10 text-sm text-gray-900 border border-gray-200 rounded-lg bg-white focus:ring-blue-500 focus:border-blue-500 dark:bg-[#121212] dark:border-white/10 dark:placeholder-gray-500 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 outline-none transition-colors"
              placeholder="Search inspector or wheel type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-[#121212] overflow-hidden">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="appearance-none block w-full px-4 py-2.5 pr-10 text-sm text-gray-900 bg-transparent focus:outline-none dark:text-white cursor-pointer"
              >
                <option value="All">Status</option>
                <option value="Pending SPV">Pending SPV</option>
                <option value="Pending GL">Pending GL</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>

            <div className="relative border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-[#121212] overflow-hidden">
              <select
                value={filterResult}
                onChange={(e) => setFilterResult(e.target.value)}
                className="appearance-none block w-full px-4 py-2.5 pr-10 text-sm text-gray-900 bg-transparent focus:outline-none dark:text-white cursor-pointer"
              >
                <option value="All">Result</option>
                <option value="OK">OK</option>
                <option value="NG">NG</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200 transition-colors whitespace-nowrap"
            >
              Export CSV
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
              </svg>
            </button>
          </div>
        </div>

        <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
          <div>Total {total} records</div>
          <div className="flex items-center gap-2">
            Rows per page:
            <select
              value={rowsPerPage}
              onChange={(e) => setRowsPerPage(Number(e.target.value))}
              className="bg-transparent border-none focus:outline-none cursor-pointer text-gray-700 dark:text-gray-300"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/5 dark:bg-[#121212]">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[900px]">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/5">
                <TableRow>
                  <TableCell className="px-5 py-4 w-12">
                    <input
                      type="checkbox"
                      checked={data.length > 0 && selectedRows.size === data.length}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                    />
                  </TableCell>
                  {["DATE", "INSPECTOR", "LINE", "WHEEL TYPE", "RESULT", "STATUS", "ACTIONS"].map(h => (
                    <TableCell
                      key={h}
                      isHeader
                      className={`px-5 py-4 font-semibold text-gray-500 text-xs tracking-wider uppercase dark:text-gray-400 ${h === "ACTIONS" ? "text-end" : "text-start"}`}
                    >
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="px-5 py-12 text-center text-gray-400">
                      <div className="flex items-center justify-center gap-2">
                        <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                        Loading...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : data.length > 0 ? (
                  data.map((row) => (
                    <TableRow key={row.id} className="hover:bg-gray-50 dark:hover:bg-white/2 transition-colors group">
                      <TableCell className="px-5 py-4 w-12">
                        <input
                          type="checkbox"
                          checked={selectedRows.has(row.id)}
                          onChange={() => toggleSelectRow(row.id)}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                        />
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start font-medium text-gray-900 dark:text-white">
                        {formatDate(row.date)}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-500 text-start text-sm dark:text-gray-400">
                        {row.inspector}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-500 text-start text-sm dark:text-gray-400">
                        {row.line || "-"}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-500 text-start text-sm dark:text-gray-400">
                        {row.wheel_type}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start text-sm">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${row.judgement === "OK" ? "bg-green-500" : "bg-red-500"}`} />
                          <span className="text-gray-900 dark:text-gray-300">{row.judgement}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start text-sm">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${statusColor(row.status)}`} />
                          <span className="text-gray-900 dark:text-gray-300">{row.status}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-end">
                        <button
                          onClick={() => openDetail(row.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40 transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          Detail
                        </button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="px-5 py-12 text-center text-gray-500 dark:text-gray-400">
                      Belum ada data inspection.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
          </button>

          {renderPaginationButtons()}

          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages || totalPages === 0}
            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>

        <div className="font-medium">
          {selectedRows.size} of {total} selected
        </div>
      </div>

      {/* Detail Drawer */}
      {detailOpen && (
        <>
          <div className="fixed inset-0 z-99998 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => { setDetailOpen(false); setDetailData(null); }} />
          <div className="fixed inset-y-0 right-0 z-99999 w-full max-w-[640px] bg-white dark:bg-gray-900 shadow-2xl flex flex-col animate-[slideIn_0.3s_ease-out]">
            {detailLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <svg className="w-10 h-10 animate-spin text-blue-500" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  <span className="text-sm text-gray-400">Memuat detail...</span>
                </div>
              </div>
            ) : detailData ? (
              <>
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
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">{detailData.wheel_type}</h2>
                  <p className="text-sm text-gray-500 mt-1">{formatDate(detailData.date)} &middot; Shift {detailData.shift} &middot; Group {detailData.group}</p>
                  <div className="flex items-center gap-2 mt-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-full ring-1 ring-inset ${detailData.judgement === "OK" ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20" : "bg-red-50 text-red-700 ring-red-600/20"}`}>
                      {detailData.judgement === "OK" ? (
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"/></svg>
                      ) : (
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
                      )}
                      {detailData.judgement}
                    </span>
                    <span className={`inline-flex px-3 py-1.5 text-xs font-bold rounded-full ring-1 ring-inset ${statusBadge(detailData.status)}`}>
                      {detailData.status}
                    </span>
                  </div>
                </div>

                {/* Drawer Body */}
                <div className="flex-1 overflow-y-auto px-8 py-6 space-y-8">

                  {/* Info Grid */}
                  <section>
                    <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Informasi Umum</h3>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                      {[
                        ["Inspector", detailData.inspector],
                        ["Painting Status", detailData.painting_status],
                        ["Wheel Type", detailData.wheel_type],
                        ["Line FI", detailData.line || "-"],
                      ].map(([label, val]) => (
                        <div key={label as string}>
                          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white mt-0.5">{val as string}</p>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Brightness */}
                  {detailData.brightness && Object.keys(detailData.brightness).length > 0 && (
                    <section>
                      <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Brightness</h3>
                      <div className="rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-gray-50 dark:bg-white/5">
                              <th className="px-4 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wide">Area</th>
                              {["L", "a", "b", "△E", "△L"].map(h => (
                                <th key={h} className="px-3 py-3 text-center text-[11px] font-bold text-gray-500 uppercase tracking-wide">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                            {Object.entries(detailData.brightness).map(([area, vals]) => (
                              <tr key={area} className="hover:bg-gray-50/50 dark:hover:bg-white/2">
                                <td className="px-4 py-3 font-semibold text-gray-800 dark:text-gray-200 capitalize">{area}</td>
                                {["L", "a", "b", "△E", "△L"].map(k => (
                                  <td key={k} className="px-3 py-3 text-center text-gray-600 dark:text-gray-400 tabular-nums">
                                    {typeof vals === "object" && vals !== null ? (vals as Record<string, string | number>)[k] || <span className="text-gray-300">-</span> : <span className="text-gray-300">-</span>}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </section>
                  )}

                  {/* Thickness */}
                  {detailData.thickness && Object.keys(detailData.thickness).length > 0 && (
                    <section>
                      <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Thickness (um)</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {Object.entries(detailData.thickness).map(([key, val]) => (
                          <div key={key} className="rounded-xl border border-gray-200 dark:border-white/10 px-4 py-3 bg-gray-50/50 dark:bg-white/2">
                            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">{key.replace(/_/g, " ")}</p>
                            <p className="text-lg font-bold text-gray-900 dark:text-white mt-0.5 tabular-nums">{val || "-"}</p>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Gloss */}
                  {detailData.gloss && Object.keys(detailData.gloss).length > 0 && (
                    <section>
                      <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Gloss</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {Object.entries(detailData.gloss).map(([key, val]) => (
                          <div key={key} className="rounded-xl border border-gray-200 dark:border-white/10 px-4 py-3 bg-gray-50/50 dark:bg-white/2">
                            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">{key.replace(/_/g, " ")}</p>
                            <p className="text-lg font-bold text-gray-900 dark:text-white mt-0.5 tabular-nums">{val || "-"}</p>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Photos */}
                  {detailData.photos && detailData.photos.length > 0 && (
                    <section>
                      <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                        Foto Stamp FI
                        <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-[10px] font-bold">{detailData.photos.length}</span>
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {detailData.photos.map((url, idx) => (
                          <button
                            key={idx}
                            onClick={() => setLightboxImg(`${API_URL}${url}`)}
                            className="relative group rounded-2xl overflow-hidden border-2 border-gray-100 dark:border-white/10 aspect-square hover:border-blue-400 transition-colors"
                          >
                            <img src={`${API_URL}${url}`} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-3">
                              <span className="text-white text-xs font-semibold flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"/></svg>
                                Perbesar
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Attachments */}
                  {detailData.attachments && detailData.attachments.length > 0 && (
                    <section>
                      <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                        Lampiran
                        <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-100 text-gray-600 text-[10px] font-bold">{detailData.attachments.length}</span>
                      </h3>
                      <div className="space-y-2">
                        {detailData.attachments.map((url, idx) => {
                          const filename = url.split("/").pop() || `file-${idx + 1}`;
                          const ext = filename.split(".").pop()?.toLowerCase() || "";
                          const isImage = ["jpg", "jpeg", "png", "gif", "webp"].includes(ext);
                          const extColors: Record<string, string> = { pdf: "bg-red-100 text-red-600", xlsx: "bg-green-100 text-green-600", xls: "bg-green-100 text-green-600", docx: "bg-blue-100 text-blue-600", doc: "bg-blue-100 text-blue-600", csv: "bg-purple-100 text-purple-600" };
                          return (
                            <a
                              key={idx}
                              href={`${API_URL}${url}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-4 px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 hover:border-blue-300 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-all group"
                            >
                              {isImage ? (
                                <img src={`${API_URL}${url}`} alt="" className="w-11 h-11 rounded-lg object-cover ring-1 ring-gray-200" />
                              ) : (
                                <div className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 ${extColors[ext] || "bg-gray-100 text-gray-600"}`}>
                                  <span className="text-[10px] font-black uppercase">{ext}</span>
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate group-hover:text-blue-600 transition-colors">{filename}</p>
                                <p className="text-[11px] text-gray-400 uppercase">{ext} file</p>
                              </div>
                              <svg className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                              </svg>
                            </a>
                          );
                        })}
                      </div>
                    </section>
                  )}

                  {/* Comment */}
                  {detailData.comment && (
                    <section>
                      <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Komentar</h3>
                      <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/2 px-5 py-4">
                        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">{detailData.comment}</p>
                      </div>
                    </section>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"/></svg>
                  <p className="text-sm text-gray-400">Gagal memuat data.</p>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Lightbox */}
      {lightboxImg && (
        <div
          className="fixed inset-0 z-999999 bg-black/95 flex items-center justify-center p-6 cursor-zoom-out"
          onClick={() => setLightboxImg(null)}
        >
          <button
            onClick={() => setLightboxImg(null)}
            className="absolute top-6 right-6 w-11 h-11 bg-white/10 hover:bg-white/25 rounded-full flex items-center justify-center text-white transition-colors backdrop-blur-sm"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <img
            src={lightboxImg}
            alt="Preview"
            className="max-w-full max-h-full object-contain rounded-xl shadow-2xl cursor-default"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
