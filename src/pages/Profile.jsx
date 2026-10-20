import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { updateProfile, changePassword } from "../api/axios";
import toast from "react-hot-toast";
import {
  User, Mail, Phone, Lock, ShoppingBag,
  Store, Eye, EyeOff, Save, KeyRound
} from "lucide-react";

const Profile = () => {
  const { user, login } = useAuth();

  // Profile form
  const [profileForm, setProfileForm] = useState({
    name:  user?.name  || "",
    phone: user?.phone || "",
  });
  const [profileLoading, setProfileLoading] = useState(false);

  // Password form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword:     "",
    confirmPassword: "",
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew]         = useState(false);

  const handleProfileChange = (e) =>
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });

  const handlePasswordChange = (e) =>
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });

  // Save profile
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!profileForm.name.trim()) return toast.error("Name cannot be empty");
    setProfileLoading(true);
    try {
      const { data } = await updateProfile(profileForm);
      login(data); 
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setProfileLoading(false);
    }
  };

  // Change password
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword.length < 6)
      return toast.error("New password must be at least 6 characters");
    if (passwordForm.newPassword !== passwordForm.confirmPassword)
      return toast.error("Passwords do not match");

    setPasswordLoading(true);
    try {
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword:     passwordForm.newPassword,
      });
      toast.success("Password changed successfully!");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password");
    } finally {
      setPasswordLoading(false);
    }
  };

  const roleColors = {
    customer:    { bg: "bg-emerald-50 text-emerald-800 border-emerald-200", icon: User  },
    shopkeeper:  { bg: "bg-teal-50 text-teal-800 border-teal-200", icon: Store },
    admin:       { bg: "bg-purple-50 text-purple-800 border-purple-200", icon: ShoppingBag },
  };
  const roleStyle = roleColors[user?.role] || roleColors.customer;
  const RoleIcon  = roleStyle.icon;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">

      {/* ── Profile Header ── */}
      <div className="bg-gradient-to-br from-teal-600 via-teal-700 to-emerald-700 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="flex items-center gap-5">
          {/* Avatar */}
          <div className="w-20 h-20 bg-white/20 backdrop-blur-md border border-white/20 rounded-2xl flex items-center justify-center text-3xl font-display font-bold text-white shrink-0">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="font-display font-bold text-2xl">{user?.name}</h1>
            <p className="text-teal-100 text-sm mt-0.5">{user?.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${roleStyle.bg}`}>
                <RoleIcon className="w-3.5 h-3.5" />
                {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
              </span>
              {user?.phone && (
                <span className="flex items-center gap-1 text-xs text-teal-100">
                  <Phone className="w-3 h-3" /> {user.phone}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Edit Profile ── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h2 className="font-display font-semibold text-lg text-slate-800 mb-5 flex items-center gap-2">
          <User className="w-5 h-5 text-teal-600" />
          Edit Profile
        </h2>

        <form onSubmit={handleProfileSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Full Name *
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text" name="name"
                value={profileForm.name}
                onChange={handleProfileChange} required
                placeholder="Your full name"
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition"
              />
            </div>
          </div>

          {/* Email — read only */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email" value={user?.email} disabled
                className="w-full pl-10 pr-4 py-3 border border-slate-100 rounded-xl text-sm bg-slate-50 text-slate-400 cursor-not-allowed"
              />
            </div>
            <p className="text-xs text-slate-400 mt-1">Email cannot be changed</p>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="tel" name="phone"
                value={profileForm.phone}
                onChange={handleProfileChange}
                placeholder="9876543210"
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition"
              />
            </div>
          </div>

          <button type="submit" disabled={profileLoading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-300 text-white font-semibold rounded-xl transition-colors text-sm shadow-sm">
            <Save className="w-4 h-4" />
            {profileLoading ? "Saving..." : "Save Profile Details"}
          </button>
        </form>
      </div>

      {/* ── Change Password ── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h2 className="font-display font-semibold text-lg text-slate-800 mb-5 flex items-center gap-2">
          <KeyRound className="w-5 h-5 text-teal-600" />
          Change Password
        </h2>

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          {/* Current password */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Current Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type={showCurrent ? "text" : "password"}
                name="currentPassword"
                value={passwordForm.currentPassword}
                onChange={handlePasswordChange} required
                placeholder="Enter current password"
                className="w-full pl-10 pr-11 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition"
              />
              <button type="button" onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* New password */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type={showNew ? "text" : "password"}
                name="newPassword"
                value={passwordForm.newPassword}
                onChange={handlePasswordChange} required
                placeholder="Min. 6 characters"
                className="w-full pl-10 pr-11 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition"
              />
              <button type="button" onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm new password */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Confirm New Password
            </label>
            <input
              type={showNew ? "text" : "password"}
              name="confirmPassword"
              value={passwordForm.confirmPassword}
              onChange={handlePasswordChange} required
              placeholder="Repeat new password"
              className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition
                ${passwordForm.confirmPassword && passwordForm.confirmPassword !== passwordForm.newPassword
                  ? "border-red-300 bg-red-50"
                  : "border-slate-200"}`}
            />
            {passwordForm.confirmPassword &&
             passwordForm.confirmPassword !== passwordForm.newPassword && (
              <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
            )}
          </div>

          <button type="submit" disabled={passwordLoading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-300 text-white font-semibold rounded-xl transition-colors text-sm shadow-sm">
            <KeyRound className="w-4 h-4" />
            {passwordLoading ? "Changing..." : "Update Password"}
          </button>
        </form>
      </div>

      {/* ── Account Info ── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h2 className="font-display font-semibold text-lg text-slate-800 mb-4 flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-slate-400" />
          Account Information
        </h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b border-slate-100">
            <span className="text-slate-500">Account Type</span>
            <span className={`font-semibold capitalize px-2.5 py-0.5 rounded-full text-xs border ${roleStyle.bg}`}>
              {user?.role}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-100">
            <span className="text-slate-500">Member Since</span>
            <span className="font-medium text-slate-700">
              {user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric", month: "long", year: "numeric",
                  })
                : "N/A"}
            </span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-slate-500">Account Status</span>
            <span className="font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full text-xs">
              Active
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
