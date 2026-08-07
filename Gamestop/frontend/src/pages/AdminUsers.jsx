import { useEffect, useState } from "react";
import AdminLayout from "../components/admin/AdminLayout";
import {
  getAllUsers,
  updateUserRole,
  deleteUser,
} from "../services/userService";
import {
  FaUsers,
  FaSearch,
  FaEye,
  FaTrash,
  FaUserShield,
  FaUserCog,
  FaTimes,
  FaExclamationTriangle,
  FaCheckCircle,
  FaCalendarAlt,
  FaEnvelope,
  FaUser,
} from "react-icons/fa";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");

  // Currently logged in admin email
  const currentAdminEmail = (localStorage.getItem("username") || "").toLowerCase();

  // Modals state
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isBlockedModalOpen, setIsBlockedModalOpen] = useState(false);

  // Selected user for action
  const [selectedUser, setSelectedUser] = useState(null);
  const [targetRole, setTargetRole] = useState("");
  const [blockedReason, setBlockedReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      setLoading(true);
      setError("");
      const data = await getAllUsers();
      setUsers(data || []);
    } catch (err) {
      console.error("Error loading users:", err);
      setError("Failed to load user records. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Count total admins
  const totalAdmins = users.filter(
    (u) => (u.role || "").toUpperCase().includes("ADMIN")
  ).length;

  // Filter users by search
  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    return (
      (u.username || "").toLowerCase().includes(q) ||
      (u.email || "").toLowerCase().includes(q) ||
      String(u.userId).includes(q)
    );
  });

  // Open View User Modal
  const handleOpenViewModal = (user) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  };

  // Open Change Role Confirmation Modal
  const handleOpenRoleModal = (user) => {
    setSelectedUser(user);
    const currentRoleNorm = (user.role || "").toUpperCase().includes("ADMIN")
      ? "ROLE_ADMIN"
      : "ROLE_USER";
    const nextRole = currentRoleNorm === "ROLE_ADMIN" ? "ROLE_USER" : "ROLE_ADMIN";

    // Block demotion if last admin
    if (currentRoleNorm === "ROLE_ADMIN" && nextRole === "ROLE_USER" && totalAdmins <= 1) {
      setBlockedReason(
        `Cannot demote "${user.username || user.email}". This is the last remaining administrator account.`
      );
      setIsBlockedModalOpen(true);
      return;
    }

    setTargetRole(nextRole);
    setIsRoleModalOpen(true);
  };

  // Open Delete User Confirmation Modal
  const handleOpenDeleteModal = (user) => {
    setSelectedUser(user);
    const userEmailNorm = (user.email || "").toLowerCase().trim();
    const isAdmin = (user.role || "").toUpperCase().includes("ADMIN");

    // Check 1: Prevent deleting currently logged in admin account
    if (userEmailNorm === currentAdminEmail && currentAdminEmail.length > 0) {
      setBlockedReason(
        "You cannot delete your currently logged-in administrator account."
      );
      setIsBlockedModalOpen(true);
      return;
    }

    // Check 2: Prevent deleting last remaining admin
    if (isAdmin && totalAdmins <= 1) {
      setBlockedReason(
        `Cannot delete "${user.username || user.email}". This is the last remaining administrator account.`
      );
      setIsBlockedModalOpen(true);
      return;
    }

    setIsDeleteModalOpen(true);
  };

  // Execute Role Update
  const handleRoleConfirm = async () => {
    if (!selectedUser || !targetRole) return;

    try {
      setSubmitting(true);
      await updateUserRole(selectedUser.userId, targetRole);
      setIsRoleModalOpen(false);
      setSelectedUser(null);
      await fetchUsers();
    } catch (err) {
      console.error("Failed to update user role:", err);
      alert(err.message || "Failed to update role");
    } finally {
      setSubmitting(false);
    }
  };

  // Execute User Deletion
  const handleDeleteConfirm = async () => {
    if (!selectedUser) return;

    try {
      setSubmitting(true);
      await deleteUser(selectedUser.userId);
      setIsDeleteModalOpen(false);
      setSelectedUser(null);
      await fetchUsers();
    } catch (err) {
      console.error("Failed to delete user:", err);
      alert(err.message || "Failed to delete user");
    } finally {
      setSubmitting(false);
    }
  };

  // Format Registration Date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <FaUsers className="text-red-500 text-2xl" /> User Management
            </h1>
            <p className="text-zinc-400 text-sm mt-1">
              Manage registered user accounts, assign admin privileges, and monitor registrations
            </p>
          </div>

          <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-xl">
            <FaUserShield className="text-red-500 text-lg" />
            <div className="text-xs text-zinc-400">
              Admin Accounts: <span className="text-white font-bold text-sm ml-1">{totalAdmins}</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* Search Bar */}
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 bg-zinc-800 px-4 py-2.5 rounded-xl border border-zinc-700 flex-1 max-w-md">
            <FaSearch className="text-zinc-400" />
            <input
              type="text"
              placeholder="Search user by ID, username, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent outline-none text-white text-sm w-full placeholder-zinc-500"
            />
          </div>

          <div className="text-sm text-zinc-400 font-medium">
            Total Registered Users: <span className="text-white font-bold">{filteredUsers.length}</span>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
          {loading ? (
            <div className="p-12 text-center text-zinc-400">Loading user catalog...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-12 text-center text-zinc-400 flex flex-col items-center">
              <FaUsers className="text-4xl text-zinc-600 mb-3" />
              <p className="font-semibold">No users found</p>
              <p className="text-xs text-zinc-500 mt-1">Try adjusting your search query.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-zinc-800/80 text-zinc-300 border-b border-zinc-800 uppercase text-xs tracking-wider">
                    <th className="py-4 px-6">User ID</th>
                    <th className="py-4 px-6">Username</th>
                    <th className="py-4 px-6">Email Address</th>
                    <th className="py-4 px-6">Role</th>
                    <th className="py-4 px-6">Joined Date</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                  {filteredUsers.map((user) => {
                    const isAdmin = (user.role || "").toUpperCase().includes("ADMIN");
                    const isCurrentAccount = (user.email || "").toLowerCase().trim() === currentAdminEmail;

                    return (
                      <tr key={user.userId} className="hover:bg-zinc-800/40 transition">
                        <td className="py-4 px-6 font-mono text-zinc-400 font-semibold">
                          #{user.userId}
                        </td>
                        <td className="py-4 px-6 font-bold text-white flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 text-xs">
                            <FaUser />
                          </div>
                          <span>{user.username || "User"}</span>
                          {isCurrentAccount && (
                            <span className="bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">
                              You
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-zinc-300 font-medium">
                          {user.email}
                        </td>
                        <td className="py-4 px-6">
                          {isAdmin ? (
                            <span className="bg-purple-500/10 text-purple-400 border border-purple-500/30 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 w-fit">
                              <FaUserShield className="text-xs" /> ROLE_ADMIN
                            </span>
                          ) : (
                            <span className="bg-blue-500/10 text-blue-400 border border-blue-500/30 text-xs font-semibold px-3 py-1 rounded-full w-fit">
                              ROLE_USER
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-zinc-400 text-xs">
                          {formatDate(user.createdAt)}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenViewModal(user)}
                              title="View Details"
                              className="p-2.5 bg-zinc-800 hover:bg-zinc-700 text-blue-400 rounded-xl transition"
                            >
                              <FaEye />
                            </button>

                            <button
                              onClick={() => handleOpenRoleModal(user)}
                              title="Toggle User Role"
                              className="p-2.5 bg-zinc-800 hover:bg-zinc-700 text-purple-400 rounded-xl transition flex items-center gap-1 text-xs font-semibold px-3"
                            >
                              <FaUserCog /> Change Role
                            </button>

                            <button
                              onClick={() => handleOpenDeleteModal(user)}
                              title="Delete User"
                              disabled={isCurrentAccount}
                              className={`p-2.5 rounded-xl transition ${
                                isCurrentAccount
                                  ? "bg-zinc-800/40 text-zinc-600 cursor-not-allowed"
                                  : "bg-zinc-800 hover:bg-red-600/20 text-red-400"
                              }`}
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* VIEW USER DETAILS MODAL */}
      {isViewModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <FaEye className="text-red-500" /> User Profile (#{selectedUser.userId})
              </h3>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="text-zinc-400 hover:text-white transition p-2 rounded-lg hover:bg-zinc-800"
              >
                <FaTimes />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4 bg-zinc-950 p-4 rounded-xl border border-zinc-800">
                <div className="w-14 h-14 rounded-full bg-red-600/20 text-red-500 border border-red-500/30 flex items-center justify-center text-2xl font-bold">
                  {selectedUser.username ? selectedUser.username[0].toUpperCase() : "U"}
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white">{selectedUser.username}</h4>
                  <span className="text-xs text-zinc-400 font-mono">{selectedUser.email}</span>
                </div>
              </div>

              <div className="space-y-3 bg-zinc-950 p-4 rounded-xl border border-zinc-800 text-sm">
                <div className="flex justify-between items-center pb-2 border-b border-zinc-800/80">
                  <span className="text-zinc-400 flex items-center gap-2"><FaUserShield className="text-red-500" /> Role</span>
                  <span className="font-bold text-white">
                    {selectedUser.role || "ROLE_USER"}
                  </span>
                </div>

                <div className="flex justify-between items-center pb-2 border-b border-zinc-800/80">
                  <span className="text-zinc-400 flex items-center gap-2"><FaEnvelope className="text-blue-500" /> Email</span>
                  <span className="font-mono text-zinc-300 text-xs">{selectedUser.email}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-zinc-400 flex items-center gap-2"><FaCalendarAlt className="text-green-500" /> Joined On</span>
                  <span className="text-zinc-300 text-xs">{formatDate(selectedUser.createdAt)}</span>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-zinc-800 text-right bg-zinc-900/50">
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold px-6 py-2.5 rounded-xl transition text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CHANGE ROLE CONFIRMATION MODAL */}
      {isRoleModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-6 shadow-2xl text-center">
            <div className="w-16 h-16 bg-purple-600/20 text-purple-400 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl border border-purple-500/30">
              <FaUserCog />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Confirm Role Change</h3>
            <p className="text-zinc-300 text-sm leading-relaxed mb-6">
              Are you sure you want to change the role of user{" "}
              <span className="text-white font-bold">"{selectedUser.username || selectedUser.email}"</span> to{" "}
              <span className="text-purple-400 font-bold">{targetRole}</span>?
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setIsRoleModalOpen(false)}
                className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold px-6 py-2.5 rounded-xl transition text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleRoleConfirm}
                disabled={submitting}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-6 py-2.5 rounded-xl transition shadow-lg shadow-purple-600/30 text-sm disabled:opacity-50"
              >
                {submitting ? "Updating..." : "Yes, Update Role"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {isDeleteModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-6 shadow-2xl text-center">
            <div className="w-16 h-16 bg-red-600/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl border border-red-500/30">
              <FaTrash />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Delete User Account</h3>
            <p className="text-zinc-400 text-sm mb-6">
              Are you sure you want to delete user <span className="text-white font-bold">"{selectedUser.username || selectedUser.email}"</span>? This action cannot be undone.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold px-6 py-2.5 rounded-xl transition text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={submitting}
                className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2.5 rounded-xl transition shadow-lg shadow-red-600/30 text-sm disabled:opacity-50"
              >
                {submitting ? "Deleting..." : "Yes, Delete User"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ACTION BLOCKED MODAL (Last Admin / Logged-in Admin Guard) */}
      {isBlockedModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-amber-500/50 rounded-2xl max-w-md w-full p-6 shadow-2xl text-center">
            <div className="w-16 h-16 bg-amber-500/20 text-amber-400 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl border border-amber-500/30">
              <FaExclamationTriangle />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Action Blocked</h3>
            <p className="text-zinc-300 text-sm leading-relaxed mb-6">
              {blockedReason}
            </p>
            <div className="flex justify-center">
              <button
                onClick={() => setIsBlockedModalOpen(false)}
                className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold px-8 py-2.5 rounded-xl transition text-sm"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default AdminUsers;
