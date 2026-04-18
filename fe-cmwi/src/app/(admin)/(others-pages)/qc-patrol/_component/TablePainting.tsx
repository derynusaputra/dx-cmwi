"use client";

// ─── Spec Types & Data (mirrored from painting form for NG validation) ───────
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
const B_CR: BrightnessSpec = { L: true, a: true, b: true, dE: "", dL: "-2 ~ +6" };

const T_STD: ThicknessSpec = { disk: 35, spoke: 35, flange: 35, spokeVerticalA: 50, spokeVerticalB: 50, beadOuter: 10, beadOuter2: 10, backRimInner: 20, backRimOuter: 20, backSpokeInner: 30, backSpokeOuter: 30 };
const T_135: ThicknessSpec = { ...T_STD, disk: 135, spoke: 135, flange: 135 };
const T_20: ThicknessSpec = { disk: 20, spoke: 20, flange: 20, spokeVerticalA: 20, spokeVerticalB: 20, beadOuter: 5, beadOuter2: 5, backRimInner: 10, backRimOuter: 10, backSpokeInner: 10, backSpokeOuter: 10 };
const T_45: ThicknessSpec = { ...T_20, disk: 45, spoke: 45, flange: 45 };
const T_135_35: ThicknessSpec = { ...T_135, spokeVerticalA: 35, spokeVerticalB: 35 };
const T_STD_35: ThicknessSpec = { ...T_STD, spokeVerticalA: 35, spokeVerticalB: 35 };

const PART_SPECS: Record<string, SpecData> = {
  "18X7A1-CUA-PMS-GY45CLF": { brightness: { disk: B_STD, spoke: null, flange: B_STD }, thickness: T_STD, gloss: { machining: null, casting: null } },
  "18X7.5A1-CTM-PMS-GY45MF": { brightness: { disk: null, spoke: null, flange: null }, thickness: T_135, gloss: { machining: "Max. 17", casting: null } },
  "17X6A1-CDL-GY45CLF": { brightness: { disk: B_STD, spoke: B_STD, flange: B_STD }, thickness: T_STD, gloss: { machining: null, casting: null } },
  "17X6A1-CDL-BK01CLF": { brightness: { disk: B_STD, spoke: B_STD, flange: B_STD }, thickness: T_STD, gloss: { machining: null, casting: null } },
  "D17X6.5A1-DF-PMS-BK01F-ZJ": { brightness: { disk: null, spoke: null, flange: B_STD }, thickness: T_135_35, gloss: { machining: null, casting: null } },
  "D17X6.5A1-DF-PMS-BK01CLF-ZJ": { brightness: { disk: null, spoke: null, flange: B_STD }, thickness: T_STD_35, gloss: { machining: null, casting: null } },
  "A17X6.5A1-TM-PMS-GY52F": { brightness: { disk: B_STD, spoke: B_STD, flange: B_STD }, thickness: T_45, gloss: { machining: null, casting: "Min. 85" } },
  "A18X7A1-TN1-PMS-BK01CLF": { brightness: { disk: B_STD, spoke: B_STD, flange: B_STD }, thickness: T_20, gloss: { machining: "Min. 85", casting: "Min. 85" } },
  "16X6A1-BGX-PMS-BK01F": { brightness: { disk: B_STD, spoke: null, flange: B_STD }, thickness: T_135, gloss: { machining: null, casting: null } },
  "16X6A1-BGX-PMS-GY45CLF": { brightness: { disk: B_STD, spoke: null, flange: B_STD }, thickness: T_STD, gloss: { machining: null, casting: null } },
  "D18X7A1-DU-PMS-BK01CLF": { brightness: { disk: B_STD, spoke: B_STD, flange: B_STD }, thickness: T_STD, gloss: { machining: null, casting: null } },
  "D17X6.5A1-DN-PMS-BK01CLF": { brightness: { disk: B_STD, spoke: B_STD, flange: B_STD }, thickness: T_STD, gloss: { machining: null, casting: null } },
  "A17X6.5A1-TH2-PMS-GY52CLF": { brightness: { disk: B_STD, spoke: B_STD, flange: B_STD }, thickness: T_20, gloss: { machining: "Min. 85", casting: "Min. 85" } },
  "18X7A1-BTY-PMS-GY45CLF-ZJ": { brightness: { disk: B_STD, spoke: B_STD, flange: null }, thickness: T_STD, gloss: { machining: null, casting: null } },
  "16X7A1-CME-PMS-SV14F": { brightness: { disk: B_STD, spoke: B_STD, flange: B_STD }, thickness: T_135, gloss: { machining: null, casting: null } },
  "18X7A1-CHH-PMS-CR08F": { brightness: { disk: B_CR, spoke: null, flange: B_CR }, thickness: T_135, gloss: { machining: null, casting: null } },
  "17X6.5A1-CHF-PMS-SV14F-ZJ": { brightness: { disk: B_STD, spoke: B_STD, flange: B_STD }, thickness: T_135, gloss: { machining: null, casting: null } },
  "16X6A1-CHC-PMS-SV14F-ZJ": { brightness: { disk: B_STD, spoke: B_STD, flange: B_STD }, thickness: T_135, gloss: { machining: null, casting: null } },
  "17X6.5A1-L19-PMS-BK01CLF-ZJ": { brightness: { disk: null, spoke: null, flange: B_STD }, thickness: T_STD, gloss: { machining: null, casting: null } },
  "16X6A1-CCN-PMS-GY45CLF-ZJ": { brightness: { disk: B_STD, spoke: null, flange: B_STD }, thickness: T_STD, gloss: { machining: null, casting: null } },
  "A17X6.5A1-SW1-PMS-BK01CLF-ZJ": { brightness: { disk: null, spoke: null, flange: B_STD }, thickness: T_20, gloss: { machining: null, casting: null } },
  "A16X6.5A1-SV1-PMS-BK01CLF-ZJ": { brightness: { disk: B_STD, spoke: null, flange: B_STD }, thickness: T_20, gloss: { machining: null, casting: null } },
  "18X7.5A1-BQQ-PMS-CR08F-ZJ": { brightness: { disk: B_CR, spoke: null, flange: B_CR }, thickness: T_135, gloss: { machining: null, casting: null } },
  "15X5A1-DP-PMS-GY45CLF": { brightness: { disk: B_STD, spoke: B_STD, flange: B_STD }, thickness: T_STD_35, gloss: { machining: null, casting: null } },
  "16X6A1-RST-PMS-GY02CLF": { brightness: { disk: B_STD, spoke: null, flange: B_STD }, thickness: T_STD, gloss: { machining: null, casting: null } },
  "16X6A1-RST-PMS-BK01CLF": { brightness: { disk: B_STD, spoke: null, flange: B_STD }, thickness: T_STD, gloss: { machining: null, casting: null } },
  "17X7A1-APH-PMS-SV14F": { brightness: { disk: B_STD, spoke: B_STD, flange: B_STD }, thickness: T_135, gloss: { machining: null, casting: null } },
  "17X7.5A1-AUQ-PMS-GY45CLF": { brightness: { disk: B_STD, spoke: null, flange: B_STD }, thickness: T_STD, gloss: { machining: null, casting: null } },
  "16X6A1-AWJ-PMS-GY45CLF": { brightness: { disk: B_STD, spoke: null, flange: B_STD }, thickness: T_STD, gloss: { machining: null, casting: null } },
  "16X6A1-ATW-PMS-SV14F": { brightness: { disk: B_STD, spoke: B_STD, flange: B_STD }, thickness: T_135, gloss: { machining: null, casting: null } },
  "15X5.5A1-DJ-PMS-GY45CLF": { brightness: { disk: null, spoke: null, flange: B_STD }, thickness: T_STD_35, gloss: { machining: null, casting: null } },
  "15X5.5A1-AWG-PMS-GY02F": { brightness: { disk: B_STD, spoke: B_STD, flange: B_STD }, thickness: T_135, gloss: { machining: null, casting: null } },
};

function parseSpec(spec: string | null): { type: 'max' | 'min' | 'range'; limit?: number; min?: number; max?: number } | null {
  if (!spec) return null;
  if (spec === "-2 ~ +6") return { type: 'range', min: -2, max: 6 };
  const maxMatch = spec.match(/^Max\.\s*([\d.]+)$/);
  if (maxMatch) return { type: 'max', limit: parseFloat(maxMatch[1]) };
  const minMatch = spec.match(/^Min\.\s*([\d.]+)$/);
  if (minMatch) return { type: 'min', limit: parseFloat(minMatch[1]) };
  return null;
}

function isOutOfSpec(value: number | string | undefined | null, spec: string | null): boolean {
  if (value === undefined || value === null || value === '' || !spec) return false;
  const numVal = typeof value === 'number' ? value : parseFloat(String(value));
  if (isNaN(numVal)) return false;
  const p = parseSpec(spec);
  if (!p) return false;
  if (p.type === 'max') return numVal > p.limit!;
  if (p.type === 'min') return numVal < p.limit!;
  if (p.type === 'range') return numVal < p.min! || numVal > p.max!;
  return false;
}
// ──────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useCallback, useRef } from "react";
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

interface Approval {
  id: number;
  inspection_id: number;
  role: string;
  action: "approved" | "rejected";
  comment: string;
  approved_by: number;
  approver_name: string;
  created_at: string;
}

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
  approvals: Approval[];
  start_check: string | null;
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
  const [statsData, setStatsData] = useState<PaintingInspection[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterResult, setFilterResult] = useState("All");
  const [filterWheelType, setFilterWheelType] = useState("All");
  const [filterInspector, setFilterInspector] = useState("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [wheelTypeSearch, setWheelTypeSearch] = useState("");
  const [wheelTypeOpen, setWheelTypeOpen] = useState(false);
  const wheelTypeRef = useRef<HTMLDivElement>(null);
  const datePickerRef = useRef<HTMLInputElement>(null);
  const fpInstanceRef = useRef<flatpickr.Instance | null>(null);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const INSPECTORS = ['ARA R. M.', 'NURHADI', 'A. GINANJAR', 'RIAN M.', 'HAFIZ L. U.'];

  const toYMD = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };
  const todayStr = () => toYMD(new Date());
  const daysAgoStr = (n: number) => {
    const d = new Date(); d.setDate(d.getDate() - n);
    return toYMD(d);
  };
  const firstDayOfMonthStr = () => {
    const d = new Date(); d.setDate(1);
    return toYMD(d);
  };

  // Init flatpickr range picker
  useEffect(() => {
    if (!datePickerRef.current) return;
    const fp = flatpickr(datePickerRef.current, {
      mode: "range",
      dateFormat: "Y-m-d",
      static: false,
      monthSelectorType: "static",
      showMonths: 1,
      disableMobile: true,
      onChange: (selectedDates) => {
        if (selectedDates.length === 1) {
          // Saat klik 1 hari saja, asumsikan user ingin filter 1 hari itu
          const date = toYMD(selectedDates[0]);
          setDateFrom(date);
          setDateTo(date);
        } else if (selectedDates.length === 2) {
          // Saat range lengkap
          setDateFrom(toYMD(selectedDates[0]));
          setDateTo(toYMD(selectedDates[1]));
        } else {
          // Reset ketika dikosongkan
          setDateFrom("");
          setDateTo("");
        }
      },
    }) as flatpickr.Instance;
    fpInstanceRef.current = fp;
    return () => { fp.destroy(); fpInstanceRef.current = null; };
  }, []);

  const applyPreset = (preset: 'today' | '7d' | '30d' | 'month') => {
    const today = todayStr();
    let from = today;
    const to = today;
    if (preset === '7d') from = daysAgoStr(6);
    else if (preset === '30d') from = daysAgoStr(29);
    else if (preset === 'month') from = firstDayOfMonthStr();
    setDateFrom(from);
    setDateTo(to);
    fpInstanceRef.current?.setDate([from, to], false);
  };

  const clearDateFilter = () => {
    setDateFrom('');
    setDateTo('');
    fpInstanceRef.current?.clear();
  };

  // Detail modal
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailData, setDetailData] = useState<PaintingInspection | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  // Approval
  const user = useAuthStore((s) => s.user);
  const [approveLoading, setApproveLoading] = useState(false);
  const [rejectMode, setRejectMode] = useState(false);
  const [rejectComment, setRejectComment] = useState("");

  const WHEEL_TYPES = [
    "18X7A1-CUA-PMS-GY45CLF", "18X7.5A1-CTM-PMS-GY45MF",
    "17X6A1-CDL-GY45CLF", "17X6A1-CDL-BK01CLF",
    "D17X6.5A1-DF-PMS-BK01F-ZJ", "D17X6.5A1-DF-PMS-BK01CLF-ZJ",
    "A17X6.5A1-TM-PMS-GY52F", "A18X7A1-TN1-PMS-BK01CLF",
    "16X6A1-BGX-PMS-BK01F", "16X6A1-BGX-PMS-GY45CLF",
    "D18X7A1-DU-PMS-BK01CLF", "D17X6.5A1-DN-PMS-BK01CLF",
    "A17X6.5A1-TH2-PMS-GY52CLF", "18X7A1-BTY-PMS-GY45CLF-ZJ",
    "16X7A1-CME-PMS-SV14F", "18X7A1-CHH-PMS-CR08F",
    "17X6.5A1-CHF-PMS-SV14F-ZJ", "16X6A1-CHC-PMS-SV14F-ZJ",
    "17X6.5A1-L19-PMS-BK01CLF-ZJ", "16X6A1-CCN-PMS-GY45CLF-ZJ",
    "A17X6.5A1-SW1-PMS-BK01CLF-ZJ", "A16X6.5A1-SV1-PMS-BK01CLF-ZJ",
    "18X7.5A1-BQQ-PMS-CR08F-ZJ", "15X5A1-DP-PMS-GY45CLF",
    "16X6A1-RST-PMS-GY02CLF", "16X6A1-RST-PMS-BK01CLF",
    "17X7A1-APH-PMS-SV14F", "17X7.5A1-AUQ-PMS-GY45CLF",
    "16X6A1-AWJ-PMS-GY45CLF", "16X6A1-ATW-PMS-SV14F",
    "15X5.5A1-DJ-PMS-GY45CLF", "15X5.5A1-AWG-PMS-GY02F",
  ];

  const filteredWheelTypes = WHEEL_TYPES.filter(wt =>
    wt.toLowerCase().includes(wheelTypeSearch.toLowerCase())
  );

  // Close wheel type dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wheelTypeRef.current && !wheelTypeRef.current.contains(e.target as Node)) {
        setWheelTypeOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
      if (filterWheelType !== "All") params.wheel_type = filterWheelType;
      if (filterInspector !== "All") params.inspector = filterInspector;
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;

      const res = await apiClient.get<ApiResponse>("/painting-inspections", { params });
      setData(res.data.data || []);
      setTotal(res.data.total);
    } catch {
      setData([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, rowsPerPage, searchTerm, filterStatus, filterResult, filterWheelType, filterInspector, dateFrom, dateTo]);

  const fetchStats = useCallback(async () => {
    try {
      const params: Record<string, string | number> = {
        limit: 10000,
      };
      if (searchTerm) params.search = searchTerm;
      if (filterStatus !== "All") params.status = filterStatus;
      if (filterResult !== "All") params.judgement = filterResult;
      if (filterWheelType !== "All") params.wheel_type = filterWheelType;
      if (filterInspector !== "All") params.inspector = filterInspector;
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;

      const res = await apiClient.get<ApiResponse>("/painting-inspections", { params });
      setStatsData(res.data.data || []);
    } catch {
      setStatsData([]);
    }
  }, [searchTerm, filterStatus, filterResult, filterWheelType, filterInspector, dateFrom, dateTo]);

  useEffect(() => {
    fetchData();
    fetchStats();
  }, [fetchData, fetchStats]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, filterResult, filterWheelType, filterInspector, dateFrom, dateTo, rowsPerPage]);

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
    const headers = [
      "Date", "Time", "Shift", "Group", "Inspector", "Painting Status", "Line FI", "Wheel Type",
      "Brightness Disk L", "Brightness Disk a", "Brightness Disk b", "Brightness Disk △E", "Brightness Disk △L",
      "Brightness Spoke L", "Brightness Spoke a", "Brightness Spoke b", "Brightness Spoke △E", "Brightness Spoke △L",
      "Brightness Flange L", "Brightness Flange a", "Brightness Flange b", "Brightness Flange △E", "Brightness Flange △L",
      "Thickness Disk", "Thickness Spoke", "Thickness Flange", "Thickness Spoke Vert A", "Thickness Spoke Vert B",
      "Thickness Bead Inner", "Thickness Bead Outer", "Thickness Back Rim Inner", "Thickness Back Rim Outer",
      "Thickness Back Spoke Inner", "Thickness Back Spoke Outer",
      "Gloss Machining 1", "Gloss Machining 2", "Gloss Machining 3", "Gloss Machining 4", "Gloss Machining 5",
      "Gloss Casting 1", "Gloss Casting 2", "Gloss Casting 3", "Gloss Casting 4", "Gloss Casting 5",
      "Result", "Status", "Komentar User",
      "GL Action", "GL Komentar",
      "SPV Action", "SPV Komentar",
      "AMG Action", "AMG Komentar",
      "Photos", "Attachments"
    ];

    const escapeCSV = (val: any) => {
      if (val === null || val === undefined || val === "") return "-";
      const str = String(val);
      if (str.includes(",") || str.includes("\"") || str.includes("\n")) {
        return `"${str.replace(/"/g, '""').replace(/\n/g, ' ')}"`;
      }
      return str;
    };

    const dataToExport = selectedRows.size > 0
      ? statsData.filter(row => selectedRows.has(row.id))
      : statsData;

    const baseOrigin = typeof window !== 'undefined' ? window.location.origin : "";

    const csvContent = [
      headers.join(","),
      ...dataToExport.map((row: any) => {
        const time = row.created_at ? new Date(row.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }).replace('.', ':') : "-";
        
        // Brightness
        const b = row.brightness || {};
        const bDisk = b.disk || {};
        const bSpoke = b.spoke || {};
        const bFlange = b.flange || {};

        // Thickness
        const t = row.thickness || {};

        // Gloss
        const g = row.gloss || {};
        const gMach = g.machining || {};
        const gCast = g.casting || {};

        // Approvals
        const gl = row.approvals?.find((a: any) => a.role === "GL");
        const spv = row.approvals?.find((a: any) => a.role === "SPV");
        const amg = row.approvals?.find((a: any) => a.role === "AMG");

        // Media Links
        const getLinks = (arr: string[]) => arr && arr.length > 0 ? arr.map(u => (u.startsWith("http") ? u : baseOrigin + u)).join(" ; ") : "-";

        return [
          escapeCSV(row.date),
          escapeCSV(time),
          escapeCSV(row.shift),
          escapeCSV(row.group),
          escapeCSV(row.inspector),
          escapeCSV(row.painting_status),
          escapeCSV(row.line),
          escapeCSV(row.wheel_type),

          escapeCSV(bDisk.L), escapeCSV(bDisk.a), escapeCSV(bDisk.b), escapeCSV(bDisk['△E']), escapeCSV(bDisk['△L']),
          escapeCSV(bSpoke.L), escapeCSV(bSpoke.a), escapeCSV(bSpoke.b), escapeCSV(bSpoke['△E']), escapeCSV(bSpoke['△L']),
          escapeCSV(bFlange.L), escapeCSV(bFlange.a), escapeCSV(bFlange.b), escapeCSV(bFlange['△E']), escapeCSV(bFlange['△L']),

          escapeCSV(t.disk), escapeCSV(t.spoke), escapeCSV(t.flange), escapeCSV(t.spokeVertA), escapeCSV(t.spokeVertB),
          escapeCSV(t.beadInner), escapeCSV(t.beadOuter), escapeCSV(t.backRimInner), escapeCSV(t.backRimOuter),
          escapeCSV(t.backSpokeIn), escapeCSV(t.backSpokeOut),

          escapeCSV(gMach.pos1), escapeCSV(gMach.pos2), escapeCSV(gMach.pos3), escapeCSV(gMach.pos4), escapeCSV(gMach.pos5),
          escapeCSV(gCast.pos1), escapeCSV(gCast.pos2), escapeCSV(gCast.pos3), escapeCSV(gCast.pos4), escapeCSV(gCast.pos5),

          escapeCSV(row.judgement),
          escapeCSV(row.status),
          escapeCSV(row.comment),

          escapeCSV(gl ? gl.action : "Menunggu"), escapeCSV(gl?.comment || ""),
          escapeCSV(spv ? spv.action : "Menunggu"), escapeCSV(spv?.comment || ""),
          escapeCSV(amg ? amg.action : "Menunggu"), escapeCSV(amg?.comment || ""),

          escapeCSV(getLinks(row.photos)),
          escapeCSV(getLinks(row.attachments))
        ].join(",");
      })
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

  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return "-";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
    } catch {
      return dateStr;
    }
  };

  const formatTimeOnly = (dateStr: string) => {
    if (!dateStr) return "-";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return "";
      return d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }).replace('.', ':');
    } catch {
      return "";
    }
  };

  // Get approval record for a specific role from an inspection
  const getApprovalForRole = (approvals: Approval[] | null | undefined, role: string): Approval | undefined => {
    if (!approvals) return undefined;
    return approvals.find(a => a.role === role);
  };

  // Check if current user can approve/reject the current inspection
  const canUserApprove = (status: string): boolean => {
    if (!user?.roles) return false;
    const roleMap: Record<string, string> = {
      "Pending GL": "gl",
      "Pending SPV": "spv",
      "Pending AMG": "amg",
    };
    const requiredRole = roleMap[status];
    if (!requiredRole) return false;
    return user.roles.includes(requiredRole) || user.roles.includes("superadmin") || user.roles.includes("admin");
  };

  const handleApproval = async (action: "approved" | "rejected", comment?: string) => {
    if (!detailData) return;
    setApproveLoading(true);
    try {
      await apiClient.put(`/painting-inspections/${detailData.id}/approve`, { action, comment: comment || "" });
      // Refresh detail
      const res = await apiClient.get<{ data: PaintingInspection }>(`/painting-inspections/${detailData.id}`);
      setDetailData(res.data.data);
      setRejectMode(false);
      setRejectComment("");
      // Refresh table
      fetchData();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Gagal memproses approval";
      alert(msg);
    } finally {
      setApproveLoading(false);
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
    s === "Approved" ? "bg-green-500" : s.startsWith("Rejected") ? "bg-red-500" : s === "Pending GL" ? "bg-blue-500" : s === "Pending SPV" ? "bg-yellow-500" : s === "Pending AMG" ? "bg-orange-500" : "bg-gray-400";

  const statusBadge = (s: string) => {
    if (s === "Approved") return "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-900/30 dark:text-emerald-400";
    if (s.startsWith("Rejected")) return "bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-900/30 dark:text-red-400";
    if (s === "Pending GL") return "bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-900/30 dark:text-blue-400";
    if (s === "Pending SPV") return "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-900/30 dark:text-amber-400";
    if (s === "Pending AMG") return "bg-orange-50 text-orange-700 ring-orange-600/20 dark:bg-orange-900/30 dark:text-orange-400";
    return "bg-gray-50 text-gray-700 ring-gray-600/20";
  };

  const getOverviewData = () => {
    const totalCount = statsData.length;
    const grouped: Record<string, { total: number; ok: number; ng: number }> = {};
    
    statsData.forEach(item => {
      let typeName = "Other";
      if (item.wheel_type.includes("-")) {
        const parts = item.wheel_type.split("-");
        if (parts.length > 1) {
          typeName = parts[1];
        }
      } else {
        typeName = item.wheel_type;
      }

      if (!grouped[typeName]) grouped[typeName] = { total: 0, ok: 0, ng: 0 };
      grouped[typeName].total++;
      if (item.judgement === "OK") grouped[typeName].ok++;
      else grouped[typeName].ng++;
    });

    return { totalCount, grouped };
  };

  const { totalCount, grouped } = getOverviewData();

  return (
    <div className="flex flex-col gap-6">
      {/* Overview Cards */}
      <div className="flex flex-col md:flex-row w-full gap-4">
        {/* Total Card */}
        <div className="flex-none bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/10 rounded-2xl p-6 w-full md:w-64 flex flex-col justify-center">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-xs font-bold text-gray-500 tracking-wider">TOTAL CHECKED</h3>
            <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            </div>
          </div>
          <div className="text-4xl font-black text-gray-900 dark:text-white mb-2">{totalCount}</div>
          <div className="text-xs font-medium text-gray-400">Total seluruh data inspeksi</div>
        </div>

        {/* Breakdown by Wheel Family Type - Compact Scrollable List */}
        <div className="flex-1 bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/10 rounded-2xl p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-gray-500 tracking-wider">STATISTIK PER TIPE WHEEL</h3>
            <span className="text-[10px] font-bold bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400 px-2 py-1 rounded-full">{Object.keys(grouped).length} Tipe Ditemukan</span>
          </div>
          
          {/* Scrollable Container */}
          <div className="flex-1 overflow-y-auto pr-2 max-h-[120px] custom-scrollbar">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
              {Object.entries(grouped)
                .sort((a, b) => b[1].total - a[1].total) // Sort by most tested
                .map(([familyType, stats]) => {
                  const okPercent = stats.total > 0 ? (stats.ok / stats.total) * 100 : 0;
                  const ngPercent = stats.total > 0 ? (stats.ng / stats.total) * 100 : 0;
                  return (
                    <div key={familyType} className="flex flex-col gap-1.5 p-3 rounded-xl bg-gray-50/50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 hover:border-gray-200 dark:hover:border-white/10 transition-colors">
                      <div className="flex items-end justify-between">
                        <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{familyType}</span>
                        <span className="text-[11px] font-bold text-gray-500">{stats.total} PCS</span>
                      </div>
                      
                      <div className="flex h-1.5 w-full rounded-full overflow-hidden bg-gray-200 dark:bg-white/10 my-1">
                        {stats.ok > 0 && <div className="bg-emerald-500 h-full transition-all" style={{ width: `${okPercent}%` }} />}
                        {stats.ng > 0 && <div className="bg-red-500 h-full transition-all" style={{ width: `${ngPercent}%` }} />}
                      </div>
                      
                      <div className="flex justify-between text-[9px] font-extrabold tracking-widest">
                        <span className="text-emerald-600 dark:text-emerald-400">OK: {stats.ok}</span>
                        <span className="text-red-500 dark:text-red-400">NG: {stats.ng}</span>
                      </div>
                    </div>
                  );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Top Action Bar */}
      <div className="flex flex-col gap-4">
        <style>{`
          .custom-scrollbar::-webkit-scrollbar { width: 4px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #d1d5db; border-radius: 9999px; }
          .dark .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #4b5563; }
          input[type="date"]::-webkit-calendar-picker-indicator { opacity: 0.5; cursor: pointer; }
        `}</style>

        {/* Row 1: Search + Action Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </div>
            <input
              type="text"
              className="block w-full p-2.5 pl-9 text-sm text-gray-900 border border-gray-200 rounded-lg bg-white focus:ring-blue-500 focus:border-blue-500 dark:bg-[#121212] dark:border-white/10 dark:placeholder-gray-500 dark:text-white outline-none transition-colors"
              placeholder="Search inspector or wheel type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Inspector Dropdown */}
            <div className="relative border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-[#121212] overflow-hidden">
              <select
                value={filterInspector}
                onChange={(e) => setFilterInspector(e.target.value)}
                className={`appearance-none block w-full px-3 py-2.5 pr-8 text-sm bg-transparent focus:outline-none cursor-pointer ${
                  filterInspector !== 'All' ? 'text-blue-700 dark:text-blue-300 font-semibold' : 'text-gray-900 dark:text-white'
                }`}
              >
                <option value="All">Inspector</option>
                {INSPECTORS.map(ins => <option key={ins} value={ins}>{ins}</option>)}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg>
              </div>
            </div>

            {/* Status Dropdown */}
            <div className="relative border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-[#121212] overflow-hidden">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="appearance-none block w-full px-3 py-2.5 pr-8 text-sm text-gray-900 bg-transparent focus:outline-none dark:text-white cursor-pointer"
              >
                <option value="All">Status</option>
                <option value="Pending GL">Pending GL</option>
                <option value="Pending SPV">Pending SPV</option>
                <option value="Pending AMG">Pending AMG</option>
                <option value="Approved">Approved</option>
                <option value="Rejected by GL">Rejected by GL</option>
                <option value="Rejected by SPV">Rejected by SPV</option>
                <option value="Rejected by AMG">Rejected by AMG</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg>
              </div>
            </div>

            {/* Result Dropdown */}
            <div className="relative border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-[#121212] overflow-hidden">
              <select
                value={filterResult}
                onChange={(e) => setFilterResult(e.target.value)}
                className="appearance-none block w-full px-3 py-2.5 pr-8 text-sm text-gray-900 bg-transparent focus:outline-none dark:text-white cursor-pointer"
              >
                <option value="All">Result</option>
                <option value="OK">OK</option>
                <option value="NG">NG</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg>
              </div>
            </div>

            {/* Wheel Type Searchable Dropdown */}
            <div className="relative" ref={wheelTypeRef}>
              <button
                type="button"
                onClick={() => { setWheelTypeOpen(o => !o); setWheelTypeSearch(""); }}
                className={`flex items-center gap-2 px-3 py-2.5 pr-8 text-sm rounded-lg border transition-colors w-[160px] text-left ${
                  filterWheelType !== "All"
                    ? "border-violet-400 bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-600"
                    : "border-gray-200 bg-white text-gray-900 dark:bg-[#121212] dark:text-white dark:border-white/10"
                }`}
              >
                <span className="truncate flex-1 text-sm">{filterWheelType === "All" ? "Wheel Type" : filterWheelType}</span>
                <svg className={`w-4 h-4 shrink-0 transition-transform absolute right-2 ${wheelTypeOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg>
              </button>
              {wheelTypeOpen && (
                <div className="absolute top-[calc(100%+6px)] right-0 z-50 w-72 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 rounded-xl shadow-xl overflow-hidden">
                  <div className="p-2 border-b border-gray-100 dark:border-white/5">
                    <div className="relative">
                      <svg className="w-4 h-4 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                      <input autoFocus type="text" placeholder="Cari wheel type..." value={wheelTypeSearch} onChange={(e) => setWheelTypeSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-400 text-gray-800 dark:text-white placeholder-gray-400 transition-all"
                      />
                    </div>
                  </div>
                  <div className="max-h-52 overflow-y-auto custom-scrollbar">
                    <button type="button" onClick={() => { setFilterWheelType("All"); setWheelTypeOpen(false); }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${filterWheelType === "All" ? "bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300 font-semibold" : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"}`}>
                      Semua Tipe
                    </button>
                    {filteredWheelTypes.length > 0 ? filteredWheelTypes.map(wt => (
                      <button key={wt} type="button" onClick={() => { setFilterWheelType(wt); setWheelTypeOpen(false); setWheelTypeSearch(""); }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors border-t border-gray-50 dark:border-white/5 ${filterWheelType === wt ? "bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300 font-semibold" : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"}`}>
                        {wt}
                      </button>
                    )) : <div className="px-4 py-4 text-sm text-gray-400 text-center italic">Tidak ditemukan</div>}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200 transition-colors whitespace-nowrap"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
              Export
            </button>
          </div>
        </div>

        {/* Row 2: Date Range Filter (flatpickr) */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/10 rounded-xl">
          <div className="flex items-center gap-1.5 shrink-0">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tanggal</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap flex-1">
            {/* Flatpickr Range Input */}
            <div className={`relative flex items-center gap-2 border rounded-lg px-3 py-2 min-w-[240px] transition-colors cursor-pointer ${
              (dateFrom || dateTo)
                ? 'border-sky-400 bg-sky-50 dark:bg-sky-900/20 dark:border-sky-600'
                : 'border-gray-200 dark:border-white/10 bg-white dark:bg-[#1a1a1a] hover:border-gray-300 dark:hover:border-white/20'
            }`}>
              <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
              <input
                ref={datePickerRef}
                type="text"
                readOnly
                placeholder="Pilih rentang tanggal..."
                className={`flex-1 text-sm font-medium bg-transparent outline-none cursor-pointer min-w-0 ${
                  (dateFrom || dateTo) ? 'text-sky-700 dark:text-sky-300' : 'text-gray-400 dark:text-gray-500'
                }`}
              />
              {(dateFrom || dateTo) && (
                <button
                  onClick={(e) => { e.stopPropagation(); clearDateFilter(); }}
                  className="shrink-0 text-sky-400 hover:text-sky-600 dark:hover:text-sky-200 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              )}
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-400 font-medium hidden sm:block">Cepat:</span>
              {([['today', 'Hari Ini'], ['7d', '7 Hari'], ['30d', '30 Hari'], ['month', 'Bulan Ini']] as const).map(([preset, label]) => (
                <button
                  key={preset}
                  onClick={() => applyPreset(preset)}
                  className="px-2.5 py-1.5 text-xs font-semibold rounded-md border transition-all border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:border-sky-400 hover:bg-sky-50 hover:text-sky-700 dark:hover:border-sky-600 dark:hover:bg-sky-900/20 dark:hover:text-sky-300"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Row 3: Stats + Chips + Rows per page */}
        <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-2 flex-wrap">
            <span>Total {total} records</span>

            {/* Date chip */}
            {(dateFrom || dateTo) && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300 text-xs font-semibold ring-1 ring-sky-200 dark:ring-sky-700">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                {dateFrom && dateTo ? (dateFrom === dateTo ? dateFrom : `${dateFrom} — ${dateTo}`) : dateFrom ? `Dari ${dateFrom}` : `Sampai ${dateTo}`}
                <button onClick={clearDateFilter} className="hover:text-sky-900 dark:hover:text-white transition-colors">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </span>
            )}

            {/* Inspector chip */}
            {filterInspector !== 'All' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 text-xs font-semibold ring-1 ring-blue-200 dark:ring-blue-700">
                Inspector: {filterInspector}
                <button onClick={() => setFilterInspector('All')} className="hover:text-blue-900 dark:hover:text-white transition-colors">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </span>
            )}

            {filterStatus !== "All" && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 text-xs font-semibold ring-1 ring-blue-200 dark:ring-blue-700">
                Status: {filterStatus}
                <button onClick={() => setFilterStatus("All")} className="hover:text-blue-900 dark:hover:text-white transition-colors">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </span>
            )}
            {filterResult !== "All" && (
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ${
                filterResult === "OK"
                  ? "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:ring-emerald-700"
                  : "bg-red-50 text-red-700 ring-red-200 dark:bg-red-900/30 dark:text-red-300 dark:ring-red-700"
              }`}>
                Result: {filterResult}
                <button onClick={() => setFilterResult("All")} className="hover:opacity-70 transition-opacity">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </span>
            )}
            {filterWheelType !== "All" && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300 text-xs font-semibold ring-1 ring-violet-200 dark:ring-violet-700 max-w-[200px]">
                <span className="truncate">{filterWheelType}</span>
                <button onClick={() => setFilterWheelType("All")} className="shrink-0 hover:text-violet-900 dark:hover:text-white transition-colors">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </span>
            )}
            {(filterStatus !== "All" || filterResult !== "All" || filterWheelType !== "All" || filterInspector !== "All" || dateFrom || dateTo) && (
              <button
                onClick={() => { setFilterStatus("All"); setFilterResult("All"); setFilterWheelType("All"); setFilterInspector("All"); clearDateFilter(); }}
                className="text-xs text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 underline underline-offset-2 transition-colors"
              >
                Reset semua
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
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
                  <TableCell isHeader className="px-4 py-4 font-semibold text-gray-500 text-xs tracking-wider uppercase dark:text-gray-400 text-center w-12">
                    NO
                  </TableCell>
                  {["DATE & TIME", "INSPECTOR", "LINE", "WHEEL TYPE", "RESULT", "STATUS", "APPROVAL", "ACTIONS"].map(h => (
                    <TableCell
                      key={h}
                      isHeader
                      className={`px-5 py-4 font-semibold text-gray-500 text-xs tracking-wider uppercase dark:text-gray-400 ${h === "ACTIONS" ? "text-end" : h === "APPROVAL" ? "text-center" : "text-start"}`}
                    >
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={10} className="px-5 py-12 text-center text-gray-400">
                      <div className="flex items-center justify-center gap-2">
                        <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                        Loading...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : data.length > 0 ? (
                  data.map((row, index) => (
                    <TableRow key={row.id} className="hover:bg-gray-50 dark:hover:bg-white/2 transition-colors group">
                      <TableCell className="px-5 py-4 w-12">
                        <input
                          type="checkbox"
                          checked={selectedRows.has(row.id)}
                          onChange={() => toggleSelectRow(row.id)}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                        />
                      </TableCell>
                      <TableCell className="px-4 py-4 text-center">
                        <span className="text-xs font-bold text-gray-400 dark:text-gray-500 tabular-nums">
                          {(currentPage - 1) * rowsPerPage + index + 1}
                        </span>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start font-medium text-gray-900 dark:text-white">
                        <div className="flex flex-col">
                          <span className="font-bold">{formatDate(row.date)}</span>
                          <span className="text-sm text-gray-500 font-normal mt-0.5">{formatTimeOnly(row.created_at)}</span>
                        </div>
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
                      <TableCell className="px-5 py-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {["GL", "SPV", "AMG"].map((role) => {
                            const approval = getApprovalForRole(row.approvals, role);
                            const isApproved = approval?.action === "approved";
                            const isRejected = approval?.action === "rejected";
                            return (
                              <span
                                key={role}
                                title={approval ? `${role}: ${approval.action} oleh ${approval.approver_name}` : `${role}: Belum diproses`}
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
                    <TableCell colSpan={10} className="px-5 py-12 text-center text-gray-500 dark:text-gray-400">
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
                  <p className="text-sm text-gray-500 mt-1">{formatDate(detailData.date)} {formatTimeOnly(detailData.created_at)} &middot; Shift {detailData.shift} &middot; Group {detailData.group}</p>
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

                    {/* Time Tracking */}
                    {(() => {
                      const start = detailData.start_check ? new Date(detailData.start_check) : null;
                      const finish = detailData.created_at ? new Date(detailData.created_at) : null;
                      const durationMs = start && finish ? finish.getTime() - start.getTime() : null;
                      const formatDuration = (ms: number) => {
                        const totalSec = Math.floor(ms / 1000);
                        const hrs = Math.floor(totalSec / 3600);
                        const mins = Math.floor((totalSec % 3600) / 60);
                        const secs = totalSec % 60;
                        if (hrs > 0) return `${hrs} jam ${mins} mnt ${secs} dtk`;
                        if (mins > 0) return `${mins} mnt ${secs} dtk`;
                        return `${secs} dtk`;
                      };
                      const fmtTime = (d: Date | null) => d
                        ? d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" }).replace(/\./g, ':')
                        : "-";
                      return (
                        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/5">
                          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Waktu Pengecekan</p>
                          <div className="grid grid-cols-3 gap-3">
                            <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/2 px-4 py-3">
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Start Check</p>
                              <p className="text-sm font-bold text-gray-900 dark:text-white tabular-nums">{fmtTime(start)}</p>
                            </div>
                            <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/2 px-4 py-3">
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Finish Check</p>
                              <p className="text-sm font-bold text-gray-900 dark:text-white tabular-nums">{fmtTime(finish)}</p>
                            </div>
                            <div className={`rounded-xl border px-4 py-3 ${
                              durationMs !== null
                                ? 'border-blue-200 dark:border-blue-800/50 bg-blue-50/50 dark:bg-blue-900/10'
                                : 'border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/2'
                            }`}>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Durasi</p>
                              <p className={`text-sm font-bold tabular-nums ${
                                durationMs !== null ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'
                              }`}>
                                {durationMs !== null ? formatDuration(durationMs) : "-"}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </section>

                  {/* Brightness */}
                  {detailData.brightness && Object.keys(detailData.brightness).length > 0 && (() => {
                    const partSpec = PART_SPECS[detailData.wheel_type];
                    // Maps area name → brightness spec (disk, spoke, flange)
                    const brightnessSpecMap: Record<string, BrightnessSpec | null> = {
                      disk: partSpec?.brightness?.disk ?? null,
                      spoke: partSpec?.brightness?.spoke ?? null,
                      flange: partSpec?.brightness?.flange ?? null,
                    };
                    // Maps display header key → spec field key
                    const keyToSpec: Record<string, keyof Pick<BrightnessSpec, 'dE' | 'dL'> | null> = {
                      "L": null, "a": null, "b": null,
                      "△E": "dE",
                      "△L": "dL",
                    };
                    return (
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
                              {Object.entries(detailData.brightness).map(([area, vals]) => {
                                const areaSpec = brightnessSpecMap[area] ?? null;
                                return (
                                  <tr key={area} className="hover:bg-gray-50/50 dark:hover:bg-white/2">
                                    <td className="px-4 py-3 font-semibold text-gray-800 dark:text-gray-200 capitalize">{area}</td>
                                    {["L", "a", "b", "△E", "△L"].map(k => {
                                      const cellVal = typeof vals === "object" && vals !== null
                                        ? (vals as Record<string, string | number>)[k]
                                        : undefined;
                                      const specFieldKey = keyToSpec[k];
                                      const specStr = specFieldKey && areaSpec ? areaSpec[specFieldKey] : null;
                                      const isNG = cellVal !== undefined && cellVal !== '' && specStr
                                        ? isOutOfSpec(cellVal, specStr)
                                        : false;
                                      return (
                                        <td
                                          key={k}
                                          className={`px-3 py-3 text-center tabular-nums transition-colors ${
                                            isNG
                                              ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-bold'
                                              : 'text-gray-600 dark:text-gray-400'
                                          }`}
                                        >
                                          {cellVal !== undefined && cellVal !== '' && cellVal !== null
                                            ? (
                                              <span className="flex items-center justify-center gap-1">
                                                {isNG && (
                                                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                                                )}
                                                {cellVal}
                                              </span>
                                            )
                                            : <span className="text-gray-300">-</span>
                                          }
                                        </td>
                                      );
                                    })}
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </section>
                    );
                  })()}

                  {/* Thickness */}
                  {detailData.thickness && Object.keys(detailData.thickness).length > 0 && (() => {
                    const thicknessLabels: Record<string, string> = {
                      disk: "Disk", spoke: "Spoke", flange: "Flange",
                      spokeVertA: "Spoke Vertical A", spokeVertB: "Spoke Vertical B",
                      beadInner: "Bead Inner", beadOuter: "Bead Outer",
                      backRimInner: "Back Rim (Inner)", backRimOuter: "Back Rim (Outer)",
                      backSpokeIn: "Back Spoke (Inner)", backSpokeOut: "Back Spoke (Outer)",
                    };
                    const partSpec = PART_SPECS[detailData.wheel_type];
                    // Maps API payload key → ThicknessSpec field
                    const thicknessKeyToSpecField: Record<string, keyof ThicknessSpec | null> = {
                      disk: "disk",
                      spoke: "spoke",
                      flange: "flange",
                      spokeVertA: "spokeVerticalA",
                      spokeVertB: "spokeVerticalB",
                      beadInner: "beadOuter",     // beadInner uses beadOuter spec
                      beadOuter: "beadOuter2",    // beadOuter uses beadOuter2 spec
                      backRimInner: "backRimInner",
                      backRimOuter: "backRimOuter",
                      backSpokeIn: "backSpokeInner",
                      backSpokeOut: "backSpokeOuter",
                    };
                    return (
                      <section>
                        <h3 className="text-[11px] font-bold text-gray-400 tracking-widest mb-3">THICKNESS (µm)</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {Object.entries(detailData.thickness).map(([key, val]) => {
                            const specField = thicknessKeyToSpecField[key];
                            const minVal = specField && partSpec ? partSpec.thickness[specField] : null;
                            const specStr = minVal !== null && minVal !== undefined ? `Min. ${minVal}` : null;
                            const isNG = specStr ? isOutOfSpec(val, specStr) : false;
                            return (
                              <div
                                key={key}
                                className={`rounded-xl px-4 py-3 transition-colors ${
                                  isNG
                                    ? 'border-2 border-red-400 dark:border-red-600 bg-red-50 dark:bg-red-900/20'
                                    : 'border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/2'
                                }`}
                              >
                                <div className="flex items-center justify-between gap-1">
                                  <p className={`text-[11px] font-semibold uppercase tracking-wide ${
                                    isNG ? 'text-red-500 dark:text-red-400' : 'text-gray-400'
                                  }`}>
                                    {thicknessLabels[key] ?? key.replace(/_/g, " ")}
                                  </p>
                                  {isNG && (
                                    <span className="shrink-0 text-[9px] font-black uppercase tracking-wider text-red-500 dark:text-red-400 bg-red-100 dark:bg-red-900/40 px-1.5 py-0.5 rounded-full">NG</span>
                                  )}
                                </div>
                                <p className={`text-lg font-bold mt-0.5 tabular-nums ${
                                  isNG ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'
                                }`}>
                                  {val || "-"}
                                </p>
                                {isNG && minVal !== null && (
                                  <p className="text-[9px] text-red-400 dark:text-red-500 mt-0.5">Min: {minVal} µm</p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </section>
                    );
                  })()}

                  {/* Gloss */}
                  {detailData.gloss && Object.keys(detailData.gloss).length > 0 && (() => {
                    const partSpec = PART_SPECS[detailData.wheel_type];
                    // Gloss data: { machining: {pos1, pos2, ...}, casting: {pos1, ...} }
                    // We display each surface group as a card, marking NG if any position is out-of-spec
                    return (
                      <section>
                        <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Gloss</h3>
                        <div className="flex flex-col gap-4">
                          {Object.entries(detailData.gloss).map(([surface, positions]) => {
                            const specStr = surface === 'machining'
                              ? (partSpec?.gloss?.machining ?? null)
                              : surface === 'casting'
                              ? (partSpec?.gloss?.casting ?? null)
                              : null;

                            // positions can be an object { pos1, pos2, ... } or a raw value
                            const posEntries = typeof positions === 'object' && positions !== null
                              ? Object.entries(positions as Record<string, string | number>)
                              : [];

                            const hasAnyNG = posEntries.some(([, v]) => isOutOfSpec(v, specStr));

                            return (
                              <div key={surface}>
                                <div className="flex items-center gap-2 mb-2">
                                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                                    {surface.replace(/_/g, " ")} Surface
                                  </p>
                                  {specStr && (
                                    <span className="text-[10px] text-gray-400 font-medium">({specStr})</span>
                                  )}
                                  {hasAnyNG && (
                                    <span className="text-[9px] font-black uppercase tracking-wider text-red-500 dark:text-red-400 bg-red-100 dark:bg-red-900/40 px-1.5 py-0.5 rounded-full">NG</span>
                                  )}
                                </div>
                                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                                  {posEntries.length > 0 ? posEntries.map(([posKey, posVal]) => {
                                    const isNG = isOutOfSpec(posVal, specStr);
                                    return (
                                      <div
                                        key={posKey}
                                        className={`rounded-xl px-3 py-3 flex flex-col items-center gap-1 transition-colors ${
                                          isNG
                                            ? 'border-2 border-red-400 dark:border-red-600 bg-red-50 dark:bg-red-900/20'
                                            : 'border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/2'
                                        }`}
                                      >
                                        <p className={`text-[10px] font-semibold uppercase tracking-wide ${
                                          isNG ? 'text-red-400 dark:text-red-500' : 'text-gray-400'
                                        }`}>
                                          {posKey.replace('pos', 'Pos ')}
                                        </p>
                                        <p className={`text-base font-bold tabular-nums ${
                                          isNG ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'
                                        }`}>
                                          {posVal || "-"}
                                        </p>
                                        {isNG && (
                                          <span className="text-[8px] font-black text-red-500">▲ NG</span>
                                        )}
                                      </div>
                                    );
                                  }) : (
                                    <div className="col-span-full text-sm text-gray-400">-</div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </section>
                    );
                  })()}

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

                  {/* Daftar Persetujuan */}
                  <section>
                    <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4">Daftar Persetujuan</h3>
                    <div className="space-y-0">
                      {["GL", "SPV", "AMG"].map((role, idx) => {
                        const approval = getApprovalForRole(detailData.approvals, role);
                        const isApproved = approval?.action === "approved";
                        const isRejected = approval?.action === "rejected";
                        const isPending = !approval;
                        const roleFull: Record<string, string> = { GL: "Group Leader", SPV: "Supervisor", AMG: "Asst. Manager" };

                        return (
                          <div key={role} className="relative">
                            {/* Connector line */}
                            {idx < 2 && (
                              <div className={`absolute left-5 top-12 w-0.5 h-8 ${isPending ? "bg-gray-200 dark:bg-white/10" : isApproved ? "bg-emerald-300 dark:bg-emerald-700" : "bg-red-300 dark:bg-red-700"}`} />
                            )}
                            <div className={`flex items-start gap-4 p-4 rounded-xl mb-2 transition-colors ${isPending ? "bg-gray-50/50 dark:bg-white/2" : isApproved ? "bg-emerald-50/50 dark:bg-emerald-900/10" : "bg-red-50/50 dark:bg-red-900/10"}`}>
                              {/* Avatar */}
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                                isPending
                                  ? "bg-gray-200 text-gray-500 dark:bg-white/10 dark:text-gray-400"
                                  : isApproved
                                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
                                  : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400"
                              }`}>
                                {approval ? approval.approver_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : role}
                              </div>
                              {/* Info */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-baseline gap-2">
                                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                    {approval ? approval.approver_name : `Menunggu ${role}`}
                                  </p>
                                </div>
                                <p className="text-[11px] text-gray-500 dark:text-gray-400">{roleFull[role]}</p>
                                {approval?.comment && (
                                  <div className="mt-2 rounded-lg bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 px-3 py-2">
                                    <p className="text-xs text-gray-600 dark:text-gray-300 whitespace-pre-wrap">&ldquo;{approval.comment}&rdquo;</p>
                                  </div>
                                )}
                              </div>
                              {/* Status & Date */}
                              <div className="text-right shrink-0">
                                <span className={`inline-flex px-2.5 py-1 text-[10px] font-bold rounded-full ${
                                  isPending
                                    ? "bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-gray-400"
                                    : isApproved
                                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                    : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                }`}>
                                  {isPending ? "Menunggu" : isApproved ? "Disetujui" : "Ditolak"}
                                </span>
                                {approval && (
                                  <p className="text-[10px] text-gray-400 mt-1">{formatDateTime(approval.created_at)}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>

                  {/* Approve / Reject Actions */}
                  {canUserApprove(detailData.status) && (
                    <section className="border-t border-gray-200 dark:border-white/10 pt-6">
                      <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4">Aksi Persetujuan</h3>
                      
                      {!rejectMode ? (
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleApproval("approved")}
                            disabled={approveLoading}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50"
                          >
                            {approveLoading ? (
                              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"/></svg>
                            )}
                            Setujui
                          </button>
                          <button
                            onClick={() => setRejectMode(true)}
                            disabled={approveLoading}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold text-sm rounded-xl shadow-lg shadow-red-600/20 transition-all disabled:opacity-50"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
                            Tolak
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <textarea
                            value={rejectComment}
                            onChange={(e) => setRejectComment(e.target.value)}
                            placeholder="Tulis alasan penolakan (wajib)..."
                            rows={3}
                            className="w-full px-4 py-3 rounded-xl border border-red-200 dark:border-red-800/40 bg-red-50/30 dark:bg-red-900/10 text-sm text-gray-900 dark:text-white placeholder:text-red-300 focus:outline-none focus:ring-2 focus:ring-red-500/30 resize-none"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApproval("rejected", rejectComment)}
                              disabled={approveLoading || !rejectComment.trim()}
                              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold text-sm rounded-xl transition-all disabled:opacity-50"
                            >
                              {approveLoading ? (
                                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                              ) : null}
                              Kirim Penolakan
                            </button>
                            <button
                              onClick={() => { setRejectMode(false); setRejectComment(""); }}
                              className="px-4 py-2.5 text-gray-500 hover:text-gray-800 dark:hover:text-white font-medium text-sm rounded-xl border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
                            >
                              Batal
                            </button>
                          </div>
                        </div>
                      )}
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
