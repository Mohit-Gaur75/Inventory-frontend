const PasswordStrength = ({ password }) => {
  if (!password) return null;

  const checks = [
    { label: "length min 6 ",        pass: password.length >= 6 },
    { label: "min one letter",      pass: /[a-zA-Z]/.test(password) },
    { label: "min one Number",                pass: /[0-9]/.test(password) },
    { label: "min one Special character",     pass: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) },
  ];

  const passed   = checks.filter((c) => c.pass).length;
  const strength = passed <= 1? "weak" : passed <= 3 ? "medium" : "strong";

  const colors = {
    weak:   { bar: "bg-red-400",   text: "text-red-500",   label: "Weak"   },
    medium: { bar: "bg-amber-400", text: "text-amber-500", label: "Medium" },
    strong: { bar: "bg-green-500", text: "text-green-600", label: "Strong" },
  };

  const style = colors[strength];

  return (
    <div className="mt-2 space-y-2">
    
      <div className="flex items-center gap-2">
        <div className="flex-1 flex gap-1">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300
                ${i <= passed ? style.bar : "bg-stone-200"}`}
            />
          ))}
        </div>
        <span className={`text-xs font-semibold ${style.text}`}>
          {style.label}
        </span>
      </div>


      <div className="grid grid-cols-2 gap-1">
        {checks.map(({ label, pass }) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className={`text-xs ${pass ? "text-green-500" : "text-stone-400"}`}>
              {pass ? "✓" : "○"}
            </span>
            <span className={`text-xs ${pass ? "text-stone-600" : "text-stone-400"}`}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PasswordStrength;