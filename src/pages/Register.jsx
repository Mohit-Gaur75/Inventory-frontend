import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../api/axios";
import toast from "react-hot-toast";
import { ShoppingBag, Eye, EyeOff, User, Store, AlertCircle } from "lucide-react";
import PasswordStrength from "../components/PasswordStrength";

const Register = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "customer", phone: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorBanner, setErrorBanner] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    if (errorBanner) setErrorBanner("");
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorBanner("");

    const emailTrim = form.email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrim)) {
      const err = "Please enter a valid email address with a valid domain (e.g. name@gmail.com)";
      setErrorBanner(err);
      toast.error(err);
      return;
    }

    setLoading(true);
    try {
      await registerUser({ ...form, email: emailTrim });
      toast.success("Account created successfully! Please sign in with your credentials.");
      navigate("/login");
    } catch (err) {
      const data = err.response?.data;
      let msg = "Registration failed. Please check your details.";

      if (data?.message) {
        msg = data.message;
      } else if (Array.isArray(data?.errors) && data.errors.length > 0) {
        const first = data.errors[0];
        msg = typeof first === "string" ? first : (first.msg || first.message || msg);
      } else if (typeof data === "string" && data.trim()) {
        msg = data.includes("Cannot POST")
          ? "Cannot reach server API. Please ensure the backend is running on port 1000."
          : data;
      } else if (err.message) {
        msg = err.message === "Network Error"
          ? "Cannot connect to server. Please ensure the backend is running."
          : err.message;
      }

      setErrorBanner(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-emerald-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-teal-600 rounded-2xl mb-4 shadow-lg shadow-teal-200">
            <ShoppingBag className="w-7 h-7 text-white" />
          </div>
          <h1 className="font-display font-bold text-3xl text-slate-800">Create account</h1>
          <p className="text-slate-500 mt-1 text-sm">Join LocalMart today</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-slate-100 border border-slate-100 p-8">

          {/* Role selector */}
          <div className="flex gap-3 mb-6">
            {["customer", "shopkeeper"].map((r) => (
              <button key={r} type="button" onClick={() => setForm({ ...form, role: r })}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 text-sm font-medium transition-all
                  ${form.role === r
                    ? "border-teal-600 bg-teal-50 text-teal-700"
                    : "border-slate-200 text-slate-500 hover:border-slate-300"}`}>
                {r === "customer" ? <User className="w-4 h-4" /> : <Store className="w-4 h-4" />}
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>

          {/* Error Banner */}
          {errorBanner && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium leading-relaxed">
                <span>{errorBanner}</span>
                {errorBanner.toLowerCase().includes("already exists") && (
                  <div className="mt-1.5">
                    <Link to="/login" className="font-semibold underline text-rose-800 hover:text-rose-950 inline-flex items-center gap-1">
                      Go to Login &rarr;
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
              <input type="text" name="name" value={form.name} onChange={handleChange} required
                placeholder="John Doe"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 transition" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} required
                placeholder="you@gmail.com"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 transition" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone (optional)</label>
              <input type="tel" name="phone" value={form.phone} onChange={handleChange}
                placeholder="9876543210"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 transition" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <input type={showPass ? "text" : "password"} name="password" value={form.password}
                  onChange={handleChange} required placeholder="Min. 6 chars with letters, numbers, symbols"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 transition pr-11" />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <PasswordStrength password={form.password} />
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-300 text-white font-semibold rounded-xl transition-colors text-sm mt-2 shadow-sm">
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-teal-600 font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
