import { useState } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";
import { Clock, Calendar, X, CheckCircle2, XCircle, Power } from "lucide-react";

const DAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

const ShopStatusPanel = ({ shop, onUpdate }) => {
  const [toggling, setToggling]       = useState(false);
  const [savingHours, setSavingHours] = useState(false);
  const [savingHols, setSavingHols]   = useState(false);
  const [hours, setHours]             = useState(
    shop.businessHours || Array.from({ length: 7 }, (_, i) => ({
      isOpen: i !== 0,
      open: "09:00",
      close: "21:00",
    }))
  );
  const [holidays, setHolidays]       = useState(shop.holidays || []);
  const [newHoliday, setNewHoliday]   = useState("");

  const computedIsOpen = shop.computedIsOpen ?? shop.isOpen;

  const handleToggle = async () => {
    setToggling(true);
    try {
      await API.put(`/shops/${shop._id}/toggle-open`);
      toast.success(shop.isOpen ? "Shop marked as Closed" : "Shop marked as Open");
      onUpdate?.();
    } catch {
      toast.error("Failed to update status");
    } finally {
      setToggling(false);
    }
  };

  const updateDay = (idx, field, value) => {
    setHours((h) => h.map((d, i) => i === idx ? { ...d, [field]: value } : d));
  };

  const saveHours = async () => {
    setSavingHours(true);
    try {
      await API.put(`/shops/${shop._id}/business-hours`, { businessHours: hours });
      toast.success("Business hours saved!");
      onUpdate?.();
    } catch {
      toast.error("Failed to save hours");
    } finally {
      setSavingHours(false);
    }
  };

  const addHoliday = () => {
    if (!newHoliday) return;
    if (holidays.includes(newHoliday)) { toast.error("Already added"); return; }
    setHolidays([...holidays, newHoliday].sort());
    setNewHoliday("");
  };

  const removeHoliday = (d) => setHolidays(holidays.filter((h) => h !== d));

  const saveHolidays = async () => {
    setSavingHols(true);
    try {
      await API.put(`/shops/${shop._id}/holidays`, { holidays });
      toast.success("Holidays saved!");
      onUpdate?.();
    } catch {
      toast.error("Failed to save holidays");
    } finally {
      setSavingHols(false);
    }
  };

  return (
    <div className="space-y-6">

      <div className="bg-white border border-stone-200 rounded-2xl p-5">
        <h3 className="font-semibold text-stone-800 mb-4 flex items-center gap-2">
          <Power className="w-4 h-4" /> Shop Status
        </h3>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              {computedIsOpen ? (
                <span className="flex items-center gap-1.5 text-sm font-semibold text-green-600">
                  <CheckCircle2 className="w-4 h-4" /> Open Now
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-sm font-semibold text-red-500">
                  <XCircle className="w-4 h-4" /> Closed
                </span>
              )}
            </div>
            <p className="text-xs text-stone-400">
              {shop.isOpen
                ? "Shop is set to open (auto-closes per business hours)"
                : "Shop is manually closed — customers see it as closed"}
            </p>
          </div>
          <button
            onClick={handleToggle}
            disabled={toggling}
            className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors
              ${shop.isOpen
                ? "bg-red-500 hover:bg-red-600 text-white"
                : "bg-green-600 hover:bg-green-700 text-white"}`}
          >
            {toggling ? "Updating..." : shop.isOpen ? "Close Shop" : "Open Shop"}
          </button>
        </div>
      </div>

     
      <div className="bg-white border border-stone-200 rounded-2xl p-5">
        <h3 className="font-semibold text-stone-800 mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4" /> Business Hours
        </h3>
        <div className="space-y-3">
          {DAYS.map((day, i) => (
            <div key={day} className="flex items-center gap-3">
              
              <button
                type="button"
                onClick={() => updateDay(i, "isOpen", !hours[i].isOpen)}
                className={`w-10 h-5 rounded-full transition-colors relative flex-shrink-0
                  ${hours[i].isOpen ? "bg-green-500" : "bg-stone-200"}`}
              >
                <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all
                  ${hours[i].isOpen ? "left-5" : "left-0.5"}`} />
              </button>

              <span className={`text-sm w-20 font-medium ${hours[i].isOpen ? "text-stone-700" : "text-stone-400"}`}>
                {day}
              </span>

              {hours[i].isOpen ? (
                <div className="flex items-center gap-2 text-sm">
                  <input
                    type="time"
                    value={hours[i].open}
                    onChange={(e) => updateDay(i, "open", e.target.value)}
                    className="px-2 py-1 border border-stone-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-orange-400"
                  />
                  <span className="text-stone-400 text-xs">to</span>
                  <input
                    type="time"
                    value={hours[i].close}
                    onChange={(e) => updateDay(i, "close", e.target.value)}
                    className="px-2 py-1 border border-stone-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-orange-400"
                  />
                </div>
              ) : (
                <span className="text-xs text-stone-400 italic">Closed</span>
              )}
            </div>
          ))}
        </div>
        <button
          onClick={saveHours}
          disabled={savingHours}
          className="mt-4 w-full py-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold rounded-xl text-sm transition-colors"
        >
          {savingHours ? "Saving..." : "Save Business Hours"}
        </button>
      </div>

      <div className="bg-white border border-stone-200 rounded-2xl p-5">
        <h3 className="font-semibold text-stone-800 mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4" /> Holiday Closures
        </h3>
        <div className="flex gap-2 mb-3">
          <input
            type="date"
            value={newHoliday}
            min={new Date().toISOString().slice(0, 10)}
            onChange={(e) => setNewHoliday(e.target.value)}
            className="flex-1 px-3 py-2 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
          <button
            onClick={addHoliday}
            className="px-4 py-2 bg-stone-800 hover:bg-stone-900 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            Add
          </button>
        </div>
        {holidays.length > 0 ? (
          <div className="flex flex-wrap gap-2 mb-3">
            {holidays.map((d) => (
              <span key={d} className="flex items-center gap-1.5 text-xs bg-stone-100 text-stone-700 px-3 py-1 rounded-full">
                {new Date(d + "T00:00:00").toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" })}
                <button onClick={() => removeHoliday(d)} className="hover:text-red-500">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs text-stone-400 mb-3">No holidays scheduled</p>
        )}
        <button
          onClick={saveHolidays}
          disabled={savingHols}
          className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold rounded-xl text-sm transition-colors"
        >
          {savingHols ? "Saving..." : "Save Holidays"}
        </button>
      </div>
    </div>
  );
};

export default ShopStatusPanel;
