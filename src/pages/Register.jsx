import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../api/axios";
import toast from "react-hot-toast";
import { ShoppingBag, Eye, EyeOff, User, Store } from "lucide-react";
import PasswordStrength from "../components/PasswordStrength";

const Register = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "customer", phone: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await registerUser(form);
      toast.success("Account created successfully! Please sign in with your credentials.");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || "Registration failed");
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
              <input type="text" name="name" value={form.name} onChange={handleChange} required
                placeholder="John Doe"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 transition" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} required
                placeholder="you@example.com"
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
                  onChange={handleChange} required placeholder="Min. 6 characters"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 transition pr-11" />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
               {/* ← ADD THIS */}
              <PasswordStrength password={form.password} />
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-300 text-white font-semibold rounded-xl transition-colors text-sm mt-2">
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
