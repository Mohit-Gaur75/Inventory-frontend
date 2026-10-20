import { useState } from "react";
import { FileText, FileSpreadsheet, Download, AlertTriangle, TrendingDown } from "lucide-react";

const BASE = process.env.REACT_APP_API_URL;

const getToken = () => {
  try { return JSON.parse(localStorage.getItem("userInfo"))?.token || ""; }
  catch { return ""; }
};

const downloadFile = async (url, filename) => {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) throw new Error("Export failed");
  const blob = await res.blob();
  const href  = URL.createObjectURL(blob);
  const a     = document.createElement("a");
  a.href     = href;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(href);
};

const ExportReports = () => {
  const [loading, setLoading] = useState({});
  const [threshold, setThreshold] = useState(5);

  const trigger = async (key, url, filename) => {
    setLoading((l) => ({ ...l, [key]: true }));
    try {
      await downloadFile(url, filename);
    } catch {
      alert("Download failed. Please try again.");
    } finally {
      setLoading((l) => ({ ...l, [key]: false }));
    }
  };

  const reports = [
    {
      key:      "products_csv",
      title:    "Full Product List",
      desc:     "All your products with price, stock, category and description",
      icon:     FileSpreadsheet,
      iconBg:   "bg-emerald-50 border border-emerald-100",
      iconColor:"text-emerald-600",
      format:   "CSV",
      badge:    "bg-emerald-50 text-emerald-700 border border-emerald-200",
      url:      () => `${BASE}/export/products.csv`,
      filename: "products.csv",
    },
    {
      key:      "low_stock_csv",
      title:    "Low Stock Report",
      desc:     `Products with stock at or below ${threshold} units`,
      icon:     AlertTriangle,
      iconBg:   "bg-amber-50 border border-amber-100",
      iconColor:"text-amber-600",
      format:   "CSV",
      badge:    "bg-amber-50 text-amber-700 border border-amber-200",
      url:      () => `${BASE}/export/low-stock.csv?threshold=${threshold}`,
      filename: "low-stock.csv",
      extra: (
        <div className="flex items-center gap-2 mt-2">
          <label className="text-xs text-slate-500 font-medium">Threshold:</label>
          <input
            type="number"
            min="1"
            max="100"
            value={threshold}
            onChange={(e) => setThreshold(parseInt(e.target.value) || 5)}
            className="w-16 px-2 py-1 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <span className="text-xs text-slate-400">units</span>
        </div>
      ),
    },
    {
      key:      "inventory_pdf",
      title:    "Inventory Value Report",
      desc:     "Full inventory report with value, summary stats, and per-product breakdown",
      icon:     FileText,
      iconBg:   "bg-rose-50 border border-rose-100",
      iconColor:"text-rose-600",
      format:   "PDF",
      badge:    "bg-rose-50 text-rose-700 border border-rose-200",
      url:      () => `${BASE}/export/inventory.pdf`,
      filename: "inventory.pdf",
    },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-teal-50 border border-teal-100 rounded-2xl flex items-center justify-center">
          <TrendingDown className="w-6 h-6 text-teal-600" />
        </div>
        <div>
          <h1 className="font-display font-bold text-2xl text-slate-900">Export & Reports</h1>
          <p className="text-slate-500 text-sm">Download your inventory and store data for offline records or accounting</p>
        </div>
      </div>

      <div className="space-y-4">
        {reports.map((r) => {
          const Icon = r.icon;
          return (
            <div
              key={r.key}
              className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm hover:border-teal-200 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${r.iconBg}`}>
                  <Icon className={`w-5 h-5 ${r.iconColor}`} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="font-semibold text-slate-800 text-sm">{r.title}</h3>
                    <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${r.badge}`}>
                      {r.format}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">{r.desc}</p>
                  {r.extra}
                </div>
              </div>

              <button
                onClick={() => trigger(r.key, r.url(), r.filename)}
                disabled={loading[r.key]}
                className="shrink-0 flex items-center justify-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700
                           disabled:bg-slate-300 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
              >
                {loading[r.key] ? (
                  <span className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Preparing...
                  </span>
                ) : (
                  <><Download className="w-3.5 h-3.5" /> Download</>
                )}
              </button>
            </div>
          );
        })}
      </div>

      <p className="text-center text-xs text-slate-400 mt-8">
        Reports contain data from your shop only · Real-time inventory calculation
      </p>
    </div>
  );
};

export default ExportReports;