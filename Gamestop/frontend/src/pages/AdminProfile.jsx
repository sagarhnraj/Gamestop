import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../components/admin/AdminLayout";
import { getAdminProfile, updateAdminProfile } from "../services/userService";
import {
  FaUserShield,
  FaUser,
  FaEnvelope,
  FaCalendarAlt,
  FaKey,
  FaLock,
  FaSignOutAlt,
  FaCheckCircle,
  FaExclamationTriangle,
  FaSave,
} from "react-icons/fa";

function AdminProfile() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [username, setUsername] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Feedback states
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      setLoading(true);
      setError("");
      const data = await getAdminProfile();
      setProfile(data);
      setUsername(data.username || "");
      if (data.username) {
        localStorage.setItem("username", data.username);
      }
    } catch (err) {
      console.error("Failed to load admin profile:", err);
      setError("Failed to load profile details.");
    } finally {
      setLoading(false);
    }
  }

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    navigate("/admin/login");
  };

  // Handle Form Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    // 1. Validate username
    if (!username || !username.trim()) {
      setError("Username cannot be empty.");
      return;
    }

    // 2. Validate password fields if attempting password change
    if (newPassword || confirmPassword || currentPassword) {
      if (!currentPassword) {
        setError("Current password is required to update your password.");
        return;
      }

      if (!newPassword || newPassword.length < 6) {
        setError("New password must be at least 6 characters long.");
        return;
      }

      if (newPassword !== confirmPassword) {
        setError("New password and confirmation password do not match.");
        return;
      }
    }

    try {
      setSubmitting(true);
      const payload = {
        username: username.trim(),
        currentPassword: currentPassword ? currentPassword.trim() : null,
        newPassword: newPassword ? newPassword.trim() : null,
      };

      const updated = await updateAdminProfile(payload);
      setProfile(updated);
      setUsername(updated.username || "");
      localStorage.setItem("username", updated.username);

      // Reset password fields
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setSuccessMessage("Admin profile updated successfully!");
    } catch (err) {
      console.error("Profile update error:", err);
      setError(err.message || "Failed to update profile.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <FaUserShield className="text-red-500 text-2xl" /> Admin Profile
            </h1>
            <p className="text-zinc-400 text-sm mt-1">
              Manage your administrator credentials, account details, and password security
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-600/10 border border-red-500/30 hover:bg-red-600 text-red-400 hover:text-white font-bold px-4 py-2.5 rounded-xl transition text-sm shadow-md"
          >
            <FaSignOutAlt /> Logout
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl text-sm flex items-center gap-3">
            <FaExclamationTriangle className="text-xl flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="bg-green-500/10 border border-green-500/50 text-green-400 p-4 rounded-xl text-sm flex items-center gap-3">
            <FaCheckCircle className="text-xl flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {loading ? (
          <div className="p-12 text-center text-zinc-400">Loading profile details...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Column: Account Information Card */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-6 h-fit">
              <div className="text-center pb-6 border-b border-zinc-800">
                <div className="w-20 h-20 bg-red-600/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-3 text-3xl border border-red-500/30 font-bold">
                  {(profile?.username || "A").substring(0, 2).toUpperCase()}
                </div>
                <h3 className="text-lg font-bold text-white">{profile?.username || "Admin"}</h3>
                <span className="inline-block mt-1 bg-red-600/30 text-red-400 border border-red-500/30 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                  {profile?.role || "ROLE_ADMIN"}
                </span>
              </div>

              <div className="space-y-4 text-sm">
                <div>
                  <span className="text-xs uppercase font-bold text-zinc-500 flex items-center gap-1.5 mb-1">
                    <FaEnvelope className="text-zinc-400" /> Email Address
                  </span>
                  <p className="text-zinc-200 font-mono text-xs bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 truncate">
                    {profile?.email || "N/A"}
                  </p>
                </div>

                <div>
                  <span className="text-xs uppercase font-bold text-zinc-500 flex items-center gap-1.5 mb-1">
                    <FaUser className="text-zinc-400" /> Account ID
                  </span>
                  <p className="text-zinc-200 font-mono text-xs bg-zinc-950 p-2.5 rounded-lg border border-zinc-800">
                    #{profile?.userId || "1"}
                  </p>
                </div>

                <div>
                  <span className="text-xs uppercase font-bold text-zinc-500 flex items-center gap-1.5 mb-1">
                    <FaCalendarAlt className="text-zinc-400" /> Account Created
                  </span>
                  <p className="text-zinc-200 text-xs bg-zinc-950 p-2.5 rounded-lg border border-zinc-800">
                    {formatDate(profile?.createdAt)}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Update Profile & Change Password Form */}
            <div className="md:col-span-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-6">
              <h3 className="text-lg font-bold text-white border-b border-zinc-800 pb-4">
                Update Account Settings
              </h3>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Username Section */}
                <div className="space-y-2">
                  <label className="block text-xs uppercase font-bold text-zinc-300 tracking-wider">
                    Admin Username
                  </label>
                  <div className="flex items-center gap-3 bg-zinc-800 px-4 py-2.5 rounded-xl border border-zinc-700 focus-within:border-red-500 transition">
                    <FaUser className="text-zinc-400" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter new username"
                      className="bg-transparent outline-none text-white text-sm w-full"
                      required
                    />
                  </div>
                </div>

                <div className="border-t border-zinc-800 pt-6 space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <FaLock className="text-red-500" /> Change Password
                    </h4>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Leave blank if you do not wish to change your password.
                    </p>
                  </div>

                  {/* Current Password */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-zinc-400">
                      Current Password (Required for password change)
                    </label>
                    <div className="flex items-center gap-3 bg-zinc-800 px-4 py-2.5 rounded-xl border border-zinc-700 focus-within:border-red-500 transition">
                      <FaKey className="text-zinc-400" />
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter current password"
                        className="bg-transparent outline-none text-white text-sm w-full"
                      />
                    </div>
                  </div>

                  {/* New Password */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-zinc-400">
                      New Password (Min 6 characters)
                    </label>
                    <div className="flex items-center gap-3 bg-zinc-800 px-4 py-2.5 rounded-xl border border-zinc-700 focus-within:border-red-500 transition">
                      <FaLock className="text-zinc-400" />
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        className="bg-transparent outline-none text-white text-sm w-full"
                      />
                    </div>
                  </div>

                  {/* Confirm New Password */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-zinc-400">
                      Confirm New Password
                    </label>
                    <div className="flex items-center gap-3 bg-zinc-800 px-4 py-2.5 rounded-xl border border-zinc-700 focus-within:border-red-500 transition">
                      <FaLock className="text-zinc-400" />
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        className="bg-transparent outline-none text-white text-sm w-full"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-zinc-800 pt-6 flex justify-end">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-xl transition shadow-lg shadow-red-600/30 text-sm disabled:opacity-50"
                  >
                    <FaSave />
                    <span>{submitting ? "Saving Changes..." : "Save Profile Changes"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default AdminProfile;
