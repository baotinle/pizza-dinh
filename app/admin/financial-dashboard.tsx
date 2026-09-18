"use client";

import { useEffect, useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import type { FinanceRow } from "@/lib/google-sheets-finance";
import { currentPayrollPeriodVn } from "@/lib/date";

const currency = new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 });
const money = (value: number | null) => value === null ? "—" : `${currency.format(value)} đ`;

function ChartFrame({ children, height = 260 }: { children: React.ReactNode; height?: number }) {
  return <div className="overflow-x-auto"><svg viewBox={`0 0 760 ${height}`} className="min-w-[700px] w-full" role="img">{children}</svg></div>;
}

function RevenueChart({ rows }: { rows: FinanceRow[] }) {
  if (!rows.length) return <p className="py-16 text-center text-sm text-muted-foreground">Chưa có dữ liệu doanh thu trong khoảng này.</p>;
  const values = rows.map((row) => row.revenue ?? 0);
  const max = Math.max(...values, 1);
  const average = values.reduce((sum, value) => sum + value, 0) / values.length;
  const chartLeft = 92;
  const chartRight = 732;
  const chartWidth = chartRight - chartLeft;
  const barWidth = Math.max(8, Math.min(42, chartWidth / rows.length - 8));
  const x = (index: number) => chartLeft + (index * chartWidth) / Math.max(rows.length, 1) + (chartWidth / Math.max(rows.length, 1) - barWidth) / 2;
  const y = (value: number) => 210 - (value / max) * 165;
  const yTicks = [0, 0.25, 0.5, 0.75, 1];
  return <ChartFrame><g className="fill-muted-foreground text-[10px]">{yTicks.map((ratio) => { const value = max * ratio; const yPosition = y(value); return <g key={ratio}><line x1={chartLeft} x2={chartRight} y1={yPosition} y2={yPosition} stroke="#e5e7eb" /><text x={chartLeft - 8} y={yPosition + 3} textAnchor="end">{currency.format(value)}</text></g>; })}</g><line x1={chartLeft} x2={chartRight} y1={y(average)} y2={y(average)} stroke="#f59e0b" strokeDasharray="6 6" /><text x={chartRight} y={y(average) - 8} textAnchor="end" className="fill-amber-600 text-[11px]">TB {currency.format(average)}</text>{rows.map((row, index) => { const value = values[index]; const barY = y(value); return <g key={`${row.date}-${index}`}><title>{`${row.dateLabel}: ${currency.format(value)} đ`}</title><rect x={x(index)} y={barY} width={barWidth} height={210 - barY} rx="2" fill="#ea580c" className="cursor-pointer opacity-90 hover:opacity-100" /><text x={x(index) + barWidth / 2} y={Math.max(barY - 5, 12)} textAnchor="middle" className="fill-foreground text-[10px]">{currency.format(value)}</text><text x={x(index) + barWidth / 2} y="237" textAnchor="middle" className="fill-muted-foreground text-[10px]">{row.dateLabel.slice(0, 5)}</text></g>; })}</ChartFrame>;
}

function NavChart({ rows }: { rows: FinanceRow[] }) {
  if (!rows.length || !rows.some((row) => row.nav !== null)) return <p className="py-16 text-center text-sm text-muted-foreground">Chưa có dữ liệu Nav trong khoảng này.</p>;
  const validNav = rows.map((row) => row.nav ?? 0);
  const navMin = Math.min(...validNav);
  const navMax = Math.max(...validNav, navMin + 1);
  const growthValues = rows.map((row) => row.navGrowthPct ?? 0);
  const growthMax = Math.max(...growthValues.map(Math.abs), 1);
  const chartLeft = 92;
  const chartRight = 732;
  const chartWidth = chartRight - chartLeft;
  const barWidth = Math.max(8, Math.min(42, chartWidth / rows.length - 8));
  const x = (index: number) => chartLeft + (index * chartWidth) / Math.max(rows.length, 1) + (chartWidth / Math.max(rows.length, 1) - barWidth) / 2;
  const navY = (value: number) => 210 - ((value - navMin) / (navMax - navMin)) * 165;
  const growthY = (value: number) => 125 - (value / growthMax) * 85;
  const navTicks = [0, 0.25, 0.5, 0.75, 1];
  const growthPoints = growthValues.map((value, index) => `${x(index)},${growthY(value)}`).join(" ");
  return <ChartFrame><g className="fill-muted-foreground text-[10px]">{navTicks.map((ratio) => { const value = navMin + (navMax - navMin) * ratio; const yPosition = navY(value); return <g key={ratio}><line x1={chartLeft} x2={chartRight} y1={yPosition} y2={yPosition} stroke="#e5e7eb" /><text x={chartLeft - 8} y={yPosition + 3} textAnchor="end">{currency.format(value)}</text></g>; })}</g><polyline points={growthPoints} fill="none" stroke="#2563eb" strokeWidth="2" strokeDasharray="5 4" />{rows.map((row, index) => { const value = validNav[index]; const barY = navY(value); return <g key={`${row.date}-${index}`}><title>{`${row.dateLabel}: Nav ${currency.format(value)} đ${row.navGrowthPct === null ? "" : `, tăng trưởng ${row.navGrowthPct.toFixed(2)}%`}`}</title><rect x={x(index)} y={barY} width={barWidth} height={210 - barY} rx="2" fill="#0f766e" className="cursor-pointer opacity-90 hover:opacity-100" /><text x={x(index) + barWidth / 2} y={Math.max(barY - 5, 12)} textAnchor="middle" className="fill-foreground text-[10px]">{currency.format(value)}</text><text x={x(index) + barWidth / 2} y="237" textAnchor="middle" className="fill-muted-foreground text-[10px]">{row.dateLabel.slice(0, 5)}</text></g>; })}<text x="92" y="18" className="fill-teal-700 text-[11px]">Nav (cột)</text><text x="162" y="18" className="fill-blue-600 text-[11px]">Tăng trưởng Nav % (nét đứt)</text></ChartFrame>;
}

export function FinancialDashboard() {
  const defaultRange = currentPayrollPeriodVn();
  const defaultFrom = defaultRange.from;
  const defaultTo = defaultRange.to;
  const [rows, setRows] = useState<FinanceRow[]>([]);
  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(defaultTo);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const fetchRows = async (rangeFrom?: string, rangeTo?: string) => {
    const query = new URLSearchParams();
    if (rangeFrom) query.set("from", rangeFrom);
    if (rangeTo) query.set("to", rangeTo);
    const response = await fetch(`/api/admin/financial-dashboard?${query}`, { cache: "no-store" });
    const payload = await response.json() as { rows?: FinanceRow[]; error?: string };
    if (!response.ok) throw new Error(payload.error || "Không thể tải dữ liệu.");
    return payload.rows ?? [];
  };
  const load = async () => {
    setLoading(true); setError("");
    try {
      setRows(await fetchRows(from, to));
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Không thể tải dữ liệu."); } finally { setLoading(false); }
  };
  useEffect(() => {
    let cancelled = false;
    const initialLoad = async () => {
      setLoading(true); setError("");
      try {
        const allRows = await fetchRows();
        const latestRevenueRow = allRows.filter((row) => row.revenue !== null).at(-1);
        const initialTo = latestRevenueRow?.date ?? defaultTo;
        const nextRows = await fetchRows(defaultFrom, initialTo);
        if (!cancelled) {
          setRows(nextRows);
          setTo(initialTo);
        }
      } catch (caught) {
        if (!cancelled) setError(caught instanceof Error ? caught.message : "Không thể tải dữ liệu.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void initialLoad();
    return () => { cancelled = true; };
  }, [defaultFrom, defaultTo]);
  const latest = rows.at(-1);
  const averageRevenue = useMemo(() => rows.length ? rows.reduce((sum, row) => sum + (row.revenue ?? 0), 0) / rows.length : null, [rows]);
  return <section className="flex flex-col gap-4 border-t pt-6">
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><h2 className="text-lg font-semibold">Tài chính</h2><p className="text-sm text-muted-foreground">Dữ liệu trực tiếp từ Google Sheets · Hàng ngày</p></div><div className="flex flex-wrap gap-2"><Link href="/api/admin/google/oauth/start" className="inline-flex h-8 items-center rounded-lg border border-border px-2.5 text-sm font-medium hover:bg-muted">Kết nối Google</Link><Button variant="outline" onClick={() => void load()} disabled={loading}><RefreshCw className={loading ? "animate-spin" : ""} /> Làm mới</Button></div></div>
    <form className="flex flex-wrap items-end gap-3 rounded-lg border p-4" onSubmit={(event) => { event.preventDefault(); void load(); }}><div className="flex flex-col gap-2"><Label htmlFor="finance-from">Từ ngày</Label><Input id="finance-from" type="date" value={from} onChange={(event) => setFrom(event.target.value)} /></div><div className="flex flex-col gap-2"><Label htmlFor="finance-to">Đến ngày</Label><Input id="finance-to" type="date" value={to} onChange={(event) => setTo(event.target.value)} /></div><Button type="submit">Lọc</Button></form>
    {error ? <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">{error}</div> : loading ? <div className="rounded-lg border p-8 text-center text-sm text-muted-foreground">Đang tải dữ liệu tài chính...</div> : <><div className="grid grid-cols-1 gap-4 sm:grid-cols-3"><Card><CardHeader><CardTitle className="text-sm text-muted-foreground">Doanh thu</CardTitle></CardHeader><CardContent className="text-2xl font-semibold">{money(latest?.revenue ?? null)}<p className="mt-1 text-xs font-normal text-muted-foreground">{latest?.dateLabel ?? "Chưa có dữ liệu"}</p></CardContent></Card><Card><CardHeader><CardTitle className="text-sm text-muted-foreground">Nav</CardTitle></CardHeader><CardContent className="text-2xl font-semibold">{money(latest?.nav ?? null)}</CardContent></Card><Card><CardHeader><CardTitle className="text-sm text-muted-foreground">Chi phí</CardTitle></CardHeader><CardContent className="text-2xl font-semibold">{money(latest?.expense ?? null)}</CardContent></Card></div><div className="grid grid-cols-1 gap-4"><Card><CardHeader><CardTitle>Doanh thu theo ngày</CardTitle><p className="text-sm text-muted-foreground">Đường nét đứt: trung bình {money(averageRevenue)}</p></CardHeader><CardContent><RevenueChart rows={rows} /></CardContent></Card><Card><CardHeader><CardTitle>Nav và tăng trưởng ngày</CardTitle><p className="text-sm text-muted-foreground">Nav (cột) · tăng trưởng % (đường nét đứt)</p></CardHeader><CardContent><NavChart rows={rows} /></CardContent></Card></div></>}
  </section>;
}