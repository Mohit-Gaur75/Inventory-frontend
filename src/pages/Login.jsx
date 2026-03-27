import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../api/axios";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { ShoppingBag, Eye, EyeOff } from "lucide-react";

const Login = () => {
    const [form, setForm] = useState({ email: "", password: "" });
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await loginUser(form);
            login(data); 

            toast.success(`Welcome back, ${data.name}!`);
            navigate(data.redirectTo || "/search");

        } catch (err) {
            toast.error(err.response?.data?.message || "Login failed");
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
                    <h1 className="font-display font-bold text-3xl text-stone-800">Welcome back</h1>
                    <p className="text-stone-500 mt-1 text-sm">Sign in to your LocalMart account</p>
                </div>

            
                <div className="bg-white rounded-3xl shadow-xl shadow-stone-100 border border-stone-100 p-8">
                    <form onSubmit={handleSubmit} className="space-y-5">

                        <div>
                            <label className="block text-sm font-medium text-stone-700 mb-1.5">Email</label>
                            <input
                                type="email" name="email" value={form.email}
                                onChange={handleChange} required
                                placeholder="you@example.com"
                                className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-stone-700 mb-1.5">Password</label>
                            <div className="relative">
                                <input
                                    type={showPass ? "text" : "password"}
                                    name="password" value={form.password}
                                    onChange={handleChange} required
                                    placeholder="••••••••"
                                    className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 transition pr-11"
                                />
                                <button type="button" onClick={() => setShowPass(!showPass)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
                                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                      
                      
                        <div className="text-right -mt-2">
                            <Link to="/forgot-password"
                                className="text-xs text-orange-500 hover:underline font-medium">
                                Forgot password?
                            </Link>
                        </div>

                        <button type="submit" disabled={loading}
                            className="w-full py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold rounded-xl transition-colors text-sm">
                            {loading ? "Signing in..." : "Sign In"}
                        </button>
                    </form>

                    <p className="text-center text-sm text-stone-500 mt-6">
                        Don't have an account?{" "}
                        <Link to="/register" className="text-orange-500 font-semibold hover:underline">
                            Register
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;