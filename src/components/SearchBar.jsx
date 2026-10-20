import { useState, useEffect, useRef, useCallback } from "react";
import { Search, Clock, TrendingUp, X, ArrowUp } from "lucide-react";
import API from "../api/axios";

const RECENT_KEY  = "lm_recent_searches";
const MAX_RECENT  = 8;
const DEBOUNCE_MS = 300;

const loadRecent = () => {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY)) || []; }
  catch { return []; }
};
const saveRecent = (items) => {
  localStorage.setItem(RECENT_KEY, JSON.stringify(items));
};
const addRecent = (q) => {
  if (!q?.trim()) return;
  let prev = loadRecent().filter((r) => r.toLowerCase() !== q.toLowerCase());
  prev.unshift(q.trim());
  saveRecent(prev.slice(0, MAX_RECENT));
};

const SearchBar = ({
  initialValue = "",
  onSearch,
  placeholder = "Search products…",
  className = "",
}) => {
  const [query,       setQuery]       = useState(initialValue);
  const [open,        setOpen]        = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [trending,    setTrending]    = useState([]);
  const [recent,      setRecent]      = useState(loadRecent);
  const [activeIdx,   setActiveIdx]   = useState(-1);
  const [loading,     setLoading]     = useState(false);

  const wrapperRef = useRef(null);
  const inputRef   = useRef(null);
  const timerRef   = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => { setQuery(initialValue); }, [initialValue]);

  
  const fetchSuggestions = useCallback((q) => {
    clearTimeout(timerRef.current);
    if (!q.trim()) {
      setSuggestions([]);
      return;
    }
    timerRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const { data } = await API.get("/search/autocomplete", { params: { q } });
        setSuggestions(data.suggestions || []);
        setTrending(data.trending     || []);
      } catch { /* silent */ }
      finally { setLoading(false); }
    }, DEBOUNCE_MS);
  }, []);

  const fetchTrending = useCallback(async () => {
    if (trending.length) return;
    try {
      const { data } = await API.get("/search/autocomplete", { params: { q: "" } });
      setTrending(data.trending || []);
    } catch {}
  }, [trending.length]);

  const handleChange = (e) => {
    const q = e.target.value;
    setQuery(q);
    setActiveIdx(-1);
    setOpen(true);
    fetchSuggestions(q);
  };

  const handleFocus = () => {
    setOpen(true);
    if (!query.trim()) fetchTrending();
  };

  const commit = (q) => {
    if (!q?.trim()) return;
    addRecent(q.trim());
    setRecent(loadRecent());
    setOpen(false);
    setQuery(q.trim());
    onSearch?.(q.trim());
  };

  const handleKeyDown = (e) => {
    const items = buildItems();
    if (!open || !items.length) {
      if (e.key === "Enter") commit(query);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, items.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIdx >= 0 && items[activeIdx]) {
        commit(items[activeIdx].label);
      } else {
        commit(query);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const clearHistory = (e) => {
    e.stopPropagation();
    saveRecent([]);
    setRecent([]);
  };

  const buildItems = () => {
    if (query.trim()) {
      return suggestions.map((s) => ({ label: s.name, type: "suggestion", data: s }));
    }
    const recItems     = recent.map((r) => ({ label: r,    type: "recent" }));
    const trendItems   = trending.map((t) => ({ label: t.name, type: "trending", data: t }));
    return [...recItems, ...trendItems];
  };

  const items = buildItems();
  const showDropdown = open && (items.length > 0 || loading);

  return (
    <div ref={wrapperRef} className={`relative w-full ${className}`}>

      <div className="relative flex items-center">
        <Search className="absolute left-3 w-4 h-4 text-teal-600 pointer-events-none transition-colors" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-slate-200 bg-white text-sm
                     focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 focus:shadow-md
                     placeholder:text-slate-400 transition-all duration-200"
        />
        {query && (
          <button
            type="button"
            onClick={() => { setQuery(""); setSuggestions([]); inputRef.current?.focus(); setOpen(true); fetchTrending(); }}
            className="absolute right-2.5 w-5 h-5 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all duration-200 hover:scale-110"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {showDropdown && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden max-h-[420px] overflow-y-auto">

          {loading && (
            <div className="flex items-center gap-2 px-4 py-3 text-xs text-slate-400">
              <span className="w-3 h-3 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
              Searching…
            </div>
          )}

          {!loading && query.trim() && suggestions.length > 0 && (
            <section>
              <p className="px-4 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Suggestions
              </p>
              {suggestions.map((s, i) => {
                const flatIdx = i;
                return (
                  <SuggestionRow
                    key={s._id}
                    icon={<Search className="w-3.5 h-3.5 text-slate-400" />}
                    label={s.name}
                    sub={s.category}
                    active={activeIdx === flatIdx}
                    onClick={() => commit(s.name)}
                  />
                );
              })}
            </section>
          )}

          {!loading && query.trim() && suggestions.length === 0 && (
            <div className="px-4 py-3 text-sm text-slate-400 flex items-center gap-2">
              <Search className="w-4 h-4" />
              No suggestions — press Enter to search
            </div>
          )}

          {!query.trim() && recent.length > 0 && (
            <section>
              <div className="flex items-center justify-between px-4 pt-3 pb-1">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Recent
                </p>
                <button
                  onClick={clearHistory}
                  className="text-[10px] text-slate-400 hover:text-red-500 transition-colors"
                >
                  Clear history
                </button>
              </div>
              {recent.map((r, i) => (
                <SuggestionRow
                  key={r}
                  icon={<Clock className="w-3.5 h-3.5 text-slate-400" />}
                  label={r}
                  active={activeIdx === i}
                  onClick={() => commit(r)}
                  onFill={() => { setQuery(r); inputRef.current?.focus(); fetchSuggestions(r); }}
                />
              ))}
            </section>
          )}

          {!query.trim() && trending.length > 0 && (
            <section className="border-t border-slate-100 mt-1">
              <p className="px-4 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-teal-600 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> Popular Right Now
              </p>
              {trending.map((t, i) => {
                const flatIdx = recent.length + i;
                return (
                  <SuggestionRow
                    key={t._id}
                    icon={<TrendingUp className="w-3.5 h-3.5 text-teal-600" />}
                    label={t.name}
                    sub={t.category}
                    active={activeIdx === flatIdx}
                    onClick={() => commit(t.name)}
                  />
                );
              })}
            </section>
          )}
        </div>
      )}
    </div>
  );
};

const SuggestionRow = ({ icon, label, sub, active, onClick, onFill }) => (
  <div
    onMouseDown={(e) => { e.preventDefault(); onClick(); }}
    className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-all duration-200 group
      ${active ? "bg-teal-50 shadow-sm" : "hover:bg-slate-50"}`}
  >
    <span className="shrink-0">{icon}</span>
    <span className="flex-1 min-w-0">
      <span className={`text-sm font-medium truncate block transition-colors ${active ? "text-teal-700" : "text-slate-700"}`}>
        {label}
      </span>
      {sub && <span className="text-xs text-slate-400 truncate block">{sub}</span>}
    </span>
    {onFill && (
      <button
        type="button"
        onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); onFill(); }}
        className="shrink-0 opacity-0 group-hover:opacity-100 transition-all duration-200 p-1 rounded hover:bg-slate-100 hover:scale-110"
        title="Fill search bar"
      >
        <ArrowUp className="w-3 h-3 text-slate-400 rotate-45" />
      </button>
    )}
  </div>
);

export default SearchBar;
