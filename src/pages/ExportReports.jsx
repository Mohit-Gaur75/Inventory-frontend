import { useState } from "react";
import { FileText, FileSpreadsheet, Download, AlertTriangle, Package, TrendingDown } from "lucide-react";

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
      iconBg:   "bg-green-100",
      iconColor:"text-green-600",
      format:   "CSV",
      badge:    "bg-green-100 text-green-700",
      url:      () => `${BASE}/export/products.csv`,
      filename: "products.csv",
    },
    {
      key:      "low_stock_csv",
      title:    "Low Stock Report",
      desc:     `Products with stock at or below ${threshold} units`,
      icon:     AlertTriangle,
      iconBg:   "bg-amber-100",
      iconColor:"text-amber-600",
      format:   "CSV",
      badge:    "bg-amber-100 text-amber-700",
      url:      () => `${BASE}/export/low-stock.csv?threshold=${threshold}`,
      filename: "low-stock.csv",
      extra: (
        <div className="flex items-center gap-2 mt-2">
          <label className="text-xs text-stone-500">Threshold:</label>
          <input
            type="number"
            min="1"
            max="100"
            value={threshold}
            onChange={(e) => setThreshold(parseInt(e.target.value) || 5)}
            className="w-16 px-2 py-1 text-xs border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-400"
          />
          <span className="text-xs text-stone-400">units</span>
        </div>
      ),
    },
    {
      key:      "inventory_pdf",
      title:    "Inventory Value Report",
      desc:     "Full inventory report with value, summary stats, and per-product breakdown",
      icon:     FileText,
      iconBg:   "bg-red-100",
      iconColor:"text-red-600",
      format:   "PDF",
      badge:    "bg-red-100 text-red-700",
      url:      () => `${BASE}/export/inventory.pdf`,
      filename: "inventory.pdf",
    },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
          <TrendingDown className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <h1 className="font-display font-bold text-2xl text-stone-800">Export & Reports</h1>
          <p className="text-stone-500 text-sm">Download your inventory data for offline use or accounting</p>
        </div>
      </div>

      <div className="space-y-4">
        {reports.map((r) => {
          const Icon = r.icon;
          return (
            <div
              key={r.key}
              className="bg-white border border-stone-200 rounded-2xl p-5 flex items-start justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${r.iconBg}`}>
                  <Icon className={`w-5 h-5 ${r.iconColor}`} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="font-semibold text-stone-800 text-sm">{r.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${r.badge}`}>
                      {r.format}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500">{r.desc}</p>
                  {r.extra}
                </div>
              </div>

              <button
                onClick={() => trigger(r.key, r.url(), r.filename)}
                disabled={loading[r.key]}
                className="shrink-0 flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-600
                           disabled:bg-orange-300 text-white text-sm font-semibold rounded-xl transition-colors"
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

      <p className="text-center text-xs text-stone-400 mt-8">
        Reports contain data from your shop only · For accounting, consult a financial advisor
      </p>
    </div>
  );
};

export default ExportReports;
