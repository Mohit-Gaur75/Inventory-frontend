import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import toast from "react-hot-toast";
import {
  FileSpreadsheet, Upload, Download, CheckCircle2,
  AlertTriangle, ChevronRight, RotateCcw, Loader2,
} from "lucide-react";

const BulkImport = () => {
  const navigate  = useNavigate();
  const fileRef   = useRef(null);

  const [file, setFile]         = useState(null);
  const [step, setStep]         = useState("upload"); 
  const [preview, setPreview]   = useState(null);
  const [result, setResult]     = useState(null);
  const [mode, setMode]         = useState("skip");   
  const [loading, setLoading]   = useState(false);
  const [dragging, setDragging] = useState(false);

  const reset = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setStep("upload");
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleFileSelect = async (selected) => {
    if (!selected) return;
    const ext = selected.name.split(".").pop().toLowerCase();
    if (!["csv", "xlsx", "xls"].includes(ext)) {
      toast.error("Only CSV or Excel files are accepted");
      return;
    }
    setFile(selected);
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("file", selected);
      const { data } = await API.post("/import/preview", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setPreview(data);
      setStep("preview");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to parse file");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("mode", mode);
      const { data } = await API.post("/import/confirm", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(data);
      setStep("done");
      toast.success(`Import complete! ${data.inserted} products added.`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Import failed");
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    window.open(
      `${process.env.REACT_APP_API_URL}/import/template`,
      "_blank"
    );
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-teal-50 border border-teal-100 rounded-2xl flex items-center justify-center">
          <FileSpreadsheet className="w-6 h-6 text-teal-600" />
        </div>
        <div>
          <h1 className="font-display font-bold text-2xl text-slate-900">Bulk Import Products</h1>
          <p className="text-slate-500 text-sm">Upload a CSV or Excel spreadsheet to add inventory in batches</p>
        </div>
      </div>

      {step === "upload" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-teal-50/60 border border-teal-200/80 rounded-2xl">
            <div>
              <p className="text-sm font-semibold text-teal-900">Need a template?</p>
              <p className="text-xs text-teal-700 mt-0.5">
                Download the structured CSV template with standard column headers
              </p>
            </div>
            <button
              onClick={downloadTemplate}
              className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
            >
              <Download className="w-4 h-4" /> Download Template
            </button>
          </div>

          <div
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              handleFileSelect(e.dataTransfer.files[0]);
            }}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onClick={() => fileRef.current?.click()}
            className={`relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all
              ${dragging ? "border-teal-500 bg-teal-50/50 scale-[1.01]" : "border-slate-300 hover:border-teal-400 hover:bg-teal-50/20"}`}
          >
            {loading ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-10 h-10 text-teal-600 animate-spin" />
                <p className="text-slate-600 text-sm font-medium">Analysing file contents...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 bg-teal-50 border border-teal-100 rounded-2xl flex items-center justify-center">
                  <Upload className="w-7 h-7 text-teal-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800">Drop your CSV or Excel file here</p>
                  <p className="text-sm text-slate-500 mt-1">or click to browse from device · Max 500 rows · 10MB</p>
                </div>
                <div className="flex gap-2 text-xs font-medium text-slate-500">
                  <span className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-lg">.csv</span>
                  <span className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-lg">.xlsx</span>
                  <span className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-lg">.xls</span>
                </div>
              </div>
            )}
          </div>

          <input
            ref={fileRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files[0])}
          />

          <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl">
            <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-3">Required & Optional Columns:</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {[
                { col: "name", req: true },
                { col: "category", req: true },
                { col: "price", req: true },
                { col: "stock", req: true },
                { col: "unit", req: false },
                { col: "description", req: false },
              ].map(({ col, req }) => (
                <div key={col} className="flex items-center gap-2 text-xs font-medium text-slate-600">
                  <span className={`w-2 h-2 rounded-full ${req ? "bg-teal-600" : "bg-slate-300"}`} />
                  <span className="capitalize">{col}</span> {req && <span className="text-teal-600 font-bold">*</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {step === "preview" && preview && (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Total rows",    value: preview.total,   color: "text-slate-800" },
              { label: "Valid rows",    value: preview.valid,   color: "text-emerald-600" },
              { label: "Error rows",   value: preview.invalid, color: "text-rose-600"   },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-white border border-slate-200 rounded-2xl p-4 text-center shadow-sm">
                <p className={`text-2xl font-display font-bold ${color}`}>{value}</p>
                <p className="text-xs font-medium text-slate-500 mt-1">{label}</p>
              </div>
            ))}
          </div>

          {preview.errors.length > 0 && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl space-y-1.5 max-h-48 overflow-y-auto">
              <p className="text-sm font-semibold text-rose-800 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" /> Validation Errors ({preview.errors.length} rows)
              </p>
              {preview.errors.map((e, i) => (
                <p key={i} className="text-xs text-rose-700">
                  Row {e.row}: {e.errors.join(" · ")}
                </p>
              ))}
            </div>
          )}

          {preview.preview.length > 0 && (
            <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm bg-white">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    {["Name","Category","Price","Stock","Unit","Description"].map(h => (
                      <th key={h} className="px-3.5 py-3 text-left font-semibold text-slate-700">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {preview.preview.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-3.5 py-2.5 font-medium text-slate-900">{row.name}</td>
                      <td className="px-3.5 py-2.5 text-slate-600">{row.category}</td>
                      <td className="px-3.5 py-2.5 font-semibold text-teal-700">₹{row.price}</td>
                      <td className="px-3.5 py-2.5 text-slate-600">{row.stock}</td>
                      <td className="px-3.5 py-2.5 text-slate-500">{row.unit}</td>
                      <td className="px-3.5 py-2.5 text-slate-400 max-w-[160px] truncate">{row.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {preview.valid > 10 && (
                <p className="text-center text-xs text-slate-400 py-2.5 bg-slate-50 border-t border-slate-100">
                  …and {preview.valid - 10} more valid rows
                </p>
              )}
            </div>
          )}

          <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl">
            <p className="text-sm font-semibold text-slate-800 mb-3">If a product name already exists:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { value: "skip",   label: "Skip duplicate",   desc: "Keep existing product details unchanged" },
                { value: "update", label: "Update existing",  desc: "Overwrite price, stock, and descriptions" },
              ].map(({ value, label, desc }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setMode(value)}
                  className={`p-3.5 rounded-xl border-2 text-left transition-all
                    ${mode === value ? "border-teal-600 bg-teal-50/50" : "border-slate-200 bg-white hover:border-slate-300"}`}
                >
                  <p className="text-sm font-semibold text-slate-800">{label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={reset}
              className="flex items-center gap-2 px-5 py-3 border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors text-sm">
              <RotateCcw className="w-4 h-4" /> Choose Different File
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading || preview.valid === 0}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 text-white font-semibold rounded-xl transition-colors text-sm shadow-sm"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Importing...</>
              ) : (
                <><CheckCircle2 className="w-4 h-4" /> Import {preview.valid} Products <ChevronRight className="w-4 h-4" /></>
              )}
            </button>
          </div>
        </div>
      )}

      {step === "done" && result && (
        <div className="space-y-6">
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="font-display font-bold text-2xl text-slate-900">Import Complete!</h2>
            <p className="text-slate-500 text-sm mt-1">Your store inventory has been updated successfully</p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Products Added",   value: result.inserted, color: "text-emerald-700 bg-emerald-50/80 border-emerald-200" },
              { label: "Products Updated", value: result.updated,  color: "text-teal-700 bg-teal-50/80 border-teal-200" },
              { label: "Skipped",          value: result.skipped,  color: "text-slate-600 bg-slate-50 border-slate-200" },
            ].map(({ label, value, color }) => (
              <div key={label} className={`border rounded-2xl p-4 text-center ${color}`}>
                <p className="text-2xl font-display font-bold">{value}</p>
                <p className="text-xs mt-1 font-medium opacity-80">{label}</p>
              </div>
            ))}
          </div>

          {result.errors?.length > 0 && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl">
              <p className="text-sm font-semibold text-rose-800 mb-2">
                {result.errors.length} rows had errors and were skipped
              </p>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {result.errors.map((e, i) => (
                  <p key={i} className="text-xs text-rose-700">{e}</p>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={reset}
              className="flex-1 py-3 border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors text-sm">
              Import Another File
            </button>
            <button onClick={() => navigate("/dashboard")}
              className="flex-1 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl transition-colors text-sm shadow-sm">
              Back to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkImport;