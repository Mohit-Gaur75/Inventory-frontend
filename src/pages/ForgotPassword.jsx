import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { forgotPassword, resetPassword } from "../api/axios";
import toast from "react-hot-toast";
import { ShoppingBag, Mail, KeyRound, Eye, EyeOff, ArrowLeft } from "lucide-react";

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [step, setStep]           = useState(1);
  const [email, setEmail]         = useState("");
  const [otp, setOtp]             = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [devOtp, setDevOtp]       = useState(""); 

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!email) return toast.error("Enter your email");
    setLoading(true);
    try {
      const { data } = await forgotPassword(email);
      toast.success("OTP sent! Check your server console.");
      if (data.devOtp) {
        setDevOtp(data.devOtp);
        toast("Dev mode: OTP is " + data.devOtp, { icon: "🔑", duration: 10000 });
      }
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!otp) return toast.error("Enter the OTP");
    if (newPassword.length < 6) return toast.error("Password must be at least 6 characters");
    if (newPassword !== confirmPassword) return toast.error("Passwords do not match");

    setLoading(true);
    try {
      await resetPassword(email, otp, newPassword);
      toast.success("Password reset successfully! Please login.");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-orange-500 rounded-2xl mb-4 shadow-lg shadow-orange-200">
            <ShoppingBag className="w-7 h-7 text-white" />
          </div>
          <h1 className="font-display font-bold text-3xl text-stone-800">
            {step === 1 ? "Forgot Password" : "Reset Password"}
          </h1>
          <p className="text-stone-500 mt-1 text-sm">
            {step === 1
              ? "Enter your email to receive an OTP"
              : `OTP sent to ${email}`}
          </p>
        </div>
        <div className="flex items-center gap-2 mb-6">
          {[1, 2].map((s) => (
            <div key={s} className={`flex-1 h-1.5 rounded-full transition-colors
              ${s <= step ? "bg-orange-500" : "bg-stone-200"}`} />
          ))}
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-stone-100 border border-stone-100 p-8">

          {step === 1 && (
            <form onSubmit={handleRequestOtp} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">
                  Registered Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="email" value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
                  />
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold rounded-xl transition-colors text-sm">
                {loading ? "Sending OTP..." : "Send OTP"}
              </button>
            </form>
          )}
          {step === 2 && (
            <form onSubmit={handleResetPassword} className="space-y-5">

              {devOtp && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-amber-600 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-amber-700">Development Mode</p>
                    <p className="text-sm font-bold text-amber-800 tracking-widest">{devOtp}</p>
                    <p className="text-xs text-amber-600">This won't show in production</p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">
                  Enter OTP
                </label>
                <input
                  type="text" value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  required placeholder="6-digit OTP"
                  maxLength={6}
                  className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm text-center tracking-[0.5em] font-bold focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
                />
                <p className="text-xs text-stone-400 mt-1">
                  Valid for 15 minutes.{" "}
                  <button type="button" onClick={() => setStep(1)}
                    className="text-orange-500 hover:underline">
                    Resend OTP
                  </button>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required placeholder="Min. 6 characters"
                    className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 transition pr-11"
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">
                  Confirm New Password
                </label>
                <input
                  type={showPass ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required placeholder="Repeat new password"
                  className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 transition
                    ${confirmPassword && confirmPassword !== newPassword
                      ? "border-red-300 bg-red-50"
                      : "border-stone-200"}`}
                />
                {confirmPassword && confirmPassword !== newPassword && (
                  <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                )}
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold rounded-xl transition-colors text-sm">
                {loading ? "Resetting..." : "Reset Password"}
              </button>

              <button type="button" onClick={() => setStep(1)}
                className="w-full flex items-center justify-center gap-2 text-sm text-stone-500 hover:text-stone-700 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to email
              </button>
            </form>
          )}

          <p className="text-center text-sm text-stone-500 mt-6">
            Remember your password?{" "}
            <Link to="/login" className="text-orange-500 font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;