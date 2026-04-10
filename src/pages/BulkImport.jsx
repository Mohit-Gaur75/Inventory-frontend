import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import toast from "react-hot-toast";
import {
  FileSpreadsheet, Upload, Download, CheckCircle2,
  XCircle, AlertTriangle, ChevronRight, RotateCcw, Loader2,
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
        <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
          <FileSpreadsheet className="w-5 h-5 text-green-600" />
        </div>
        <div>
          <h1 className="font-display font-bold text-2xl text-stone-800">Bulk Import Products</h1>
          <p className="text-stone-500 text-sm">Upload a CSV or Excel file to add many products at once</p>
        </div>
      </div>

      {step === "upload" && (
        <div className="space-y-5">
          <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-2xl">
            <div>
              <p className="text-sm font-semibold text-blue-800">Need a template?</p>
              <p className="text-xs text-blue-600 mt-0.5">
                Download the CSV template with correct column headers
              </p>
            </div>
            <button
              onClick={downloadTemplate}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              <Download className="w-4 h-4" /> Template
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
              ${dragging ? "border-orange-400 bg-orange-50" : "border-stone-300 hover:border-orange-400 hover:bg-orange-50"}`}
          >
            {loading ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-10 h-10 text-orange-400 animate-spin" />
                <p className="text-stone-500 text-sm">Analysing file...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center">
                  <Upload className="w-7 h-7 text-orange-500" />
                </div>
                <div>
                  <p className="font-semibold text-stone-700">Drop your CSV or Excel file here</p>
                  <p className="text-sm text-stone-400 mt-1">or click to browse · Max 500 rows · 10MB</p>
                </div>
                <div className="flex gap-2 text-xs text-stone-400">
                  <span className="px-2 py-1 bg-stone-100 rounded-lg">.csv</span>
                  <span className="px-2 py-1 bg-stone-100 rounded-lg">.xlsx</span>
                  <span className="px-2 py-1 bg-stone-100 rounded-lg">.xls</span>
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

          <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl">
            <p className="text-xs font-semibold text-stone-600 mb-2">Required columns:</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { col: "name", req: true },
                { col: "category", req: true },
                { col: "price", req: true },
                { col: "stock", req: true },
                { col: "unit", req: false },
                { col: "description", req: false },
              ].map(({ col, req }) => (
                <div key={col} className="flex items-center gap-1.5 text-xs text-stone-500">
                  <span className={`w-1.5 h-1.5 rounded-full ${req ? "bg-orange-500" : "bg-stone-300"}`} />
                  {col} {req && <span className="text-orange-500">*</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {step === "preview" && preview && (
        <div className="space-y-5">
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Total rows",    value: preview.total,   color: "text-stone-700" },
              { label: "Valid rows",    value: preview.valid,   color: "text-green-600" },
              { label: "Error rows",   value: preview.invalid, color: "text-red-500"   },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-white border border-stone-200 rounded-2xl p-4 text-center">
                <p className={`text-2xl font-display font-bold ${color}`}>{value}</p>
                <p className="text-xs text-stone-400 mt-1">{label}</p>
              </div>
            ))}
          </div>

          {preview.errors.length > 0 && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl space-y-1.5 max-h-48 overflow-y-auto">
              <p className="text-sm font-semibold text-red-700 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" /> Validation Errors ({preview.errors.length} rows)
              </p>
              {preview.errors.map((e, i) => (
                <p key={i} className="text-xs text-red-600">
                  Row {e.row}: {e.errors.join(" · ")}
                </p>
              ))}
            </div>
          )}

          {preview.preview.length > 0 && (
            <div className="overflow-x-auto rounded-2xl border border-stone-200">
              <table className="w-full text-xs">
                <thead className="bg-stone-50 border-b border-stone-200">
                  <tr>
                    {["Name","Category","Price","Stock","Unit","Description"].map(h => (
                      <th key={h} className="px-3 py-2.5 text-left font-semibold text-stone-600">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.preview.map((row, i) => (
                    <tr key={i} className="border-b border-stone-100 last:border-0">
                      <td className="px-3 py-2 font-medium text-stone-700">{row.name}</td>
                      <td className="px-3 py-2 text-stone-500">{row.category}</td>
                      <td className="px-3 py-2 text-stone-500">₹{row.price}</td>
                      <td className="px-3 py-2 text-stone-500">{row.stock}</td>
                      <td className="px-3 py-2 text-stone-500">{row.unit}</td>
                      <td className="px-3 py-2 text-stone-400 max-w-[160px] truncate">{row.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {preview.valid > 10 && (
                <p className="text-center text-xs text-stone-400 py-2">
                  …and {preview.valid - 10} more valid rows
                </p>
              )}
            </div>
          )}

          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl">
            <p className="text-sm font-semibold text-amber-800 mb-3">If a product name already exists:</p>
            <div className="flex gap-3">
              {[
                { value: "skip",   label: "Skip duplicate",   desc: "Keep existing product unchanged" },
                { value: "update", label: "Update existing",  desc: "Overwrite price, stock, etc." },
              ].map(({ value, label, desc }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setMode(value)}
                  className={`flex-1 p-3 rounded-xl border-2 text-left transition-all
                    ${mode === value ? "border-orange-500 bg-orange-50" : "border-stone-200 bg-white hover:border-stone-300"}`}
                >
                  <p className="text-sm font-semibold text-stone-700">{label}</p>
                  <p className="text-xs text-stone-400 mt-0.5">{desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={reset}
              className="flex items-center gap-2 px-5 py-3 border border-stone-200 text-stone-600 font-medium rounded-xl hover:bg-stone-50 transition-colors text-sm">
              <RotateCcw className="w-4 h-4" /> Choose Different File
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading || preview.valid === 0}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-600 hover:bg-green-700 disabled:bg-stone-300 text-white font-semibold rounded-xl transition-colors text-sm"
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
        <div className="space-y-5">
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="font-display font-bold text-2xl text-stone-800">Import Complete!</h2>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Products Added",   value: result.inserted, icon: CheckCircle2, color: "text-green-600 bg-green-50 border-green-200" },
              { label: "Products Updated", value: result.updated,  icon: CheckCircle2, color: "text-blue-600 bg-blue-50 border-blue-200" },
              { label: "Skipped",          value: result.skipped,  icon: XCircle,      color: "text-stone-500 bg-stone-50 border-stone-200" },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className={`border rounded-2xl p-4 text-center ${color}`}>
                <p className="text-2xl font-display font-bold">{value}</p>
                <p className="text-xs mt-1 opacity-70">{label}</p>
              </div>
            ))}
          </div>

          {result.errors?.length > 0 && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl">
              <p className="text-sm font-semibold text-red-700 mb-2">
                {result.errors.length} rows had errors and were skipped
              </p>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {result.errors.map((e, i) => (
                  <p key={i} className="text-xs text-red-600">{e}</p>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={reset}
              className="flex-1 py-3 border border-stone-200 text-stone-600 font-medium rounded-xl hover:bg-stone-50 transition-colors text-sm">
              Import Another File
            </button>
            <button onClick={() => navigate("/dashboard")}
              className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors text-sm">
              Back to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkImport;
