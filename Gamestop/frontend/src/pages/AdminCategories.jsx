import { useEffect, useState } from "react";
import AdminLayout from "../components/admin/AdminLayout";
import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../services/categoryService";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaTimes,
  FaTags,
  FaExclamationTriangle,
  FaBoxOpen,
} from "react-icons/fa";

function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isBlockedDeleteModalOpen, setIsBlockedDeleteModalOpen] = useState(false);

  // Selected category & form state
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryName, setCategoryName] = useState("");
  const [nameError, setNameError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    try {
      setLoading(true);
      setError("");
      const data = await getAllCategories();
      setCategories(data || []);
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError("Failed to load categories catalog.");
    } finally {
      setLoading(false);
    }
  }

  // Filter categories by search query
  const filteredCategories = categories.filter((c) => {
    const nameStr = (c.name || c.categoryName || c.category_name || "").toLowerCase();
    return (
      nameStr.includes(searchQuery.toLowerCase()) ||
      String(c.categoryId).includes(searchQuery)
    );
  });

  // Open Add Category Modal
  const handleOpenAddModal = () => {
    setCategoryName("");
    setNameError("");
    setIsAddModalOpen(true);
  };

  // Open Edit Category Modal
  const handleOpenEditModal = (category) => {
    setSelectedCategory(category);
    setCategoryName(category.name || "");
    setNameError("");
    setIsEditModalOpen(true);
  };

  // Click Delete Handler (Validates Product Count)
  const handleOpenDelete = (category) => {
    setSelectedCategory(category);
    if ((category.productCount || 0) > 0) {
      setIsBlockedDeleteModalOpen(true);
    } else {
      setIsDeleteModalOpen(true);
    }
  };

  // Validate Name Uniqueness
  const validateCategoryName = (name, currentId = null) => {
    const trimmed = name.trim();
    if (!trimmed) {
      setNameError("Category Name is required");
      return false;
    }

    const isDuplicate = categories.some(
      (c) =>
        c.name.toLowerCase() === trimmed.toLowerCase() &&
        (currentId === null || c.categoryId !== currentId)
    );

    if (isDuplicate) {
      setNameError(`A category named "${trimmed}" already exists.`);
      return false;
    }

    setNameError("");
    return true;
  };

  // Submit Add Category
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!validateCategoryName(categoryName)) return;

    try {
      setSubmitting(true);
      await createCategory({ name: categoryName.trim() });
      setIsAddModalOpen(false);
      await fetchCategories();
    } catch (err) {
      console.error("Error creating category:", err);
      setNameError(err.message || "Failed to create category");
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Edit Category
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCategory || !validateCategoryName(categoryName, selectedCategory.categoryId)) return;

    try {
      setSubmitting(true);
      await updateCategory(selectedCategory.categoryId, { name: categoryName.trim() });
      setIsEditModalOpen(false);
      setSelectedCategory(null);
      await fetchCategories();
    } catch (err) {
      console.error("Error updating category:", err);
      setNameError(err.message || "Failed to update category");
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Delete Category
  const handleDeleteConfirm = async () => {
    if (!selectedCategory) return;

    try {
      setSubmitting(true);
      await deleteCategory(selectedCategory.categoryId);
      setIsDeleteModalOpen(false);
      setSelectedCategory(null);
      await fetchCategories();
    } catch (err) {
      console.error("Error deleting category:", err);
      alert(err.message || "Failed to delete category");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <FaTags className="text-red-500 text-2xl" /> Category Management
            </h1>
            <p className="text-zinc-400 text-sm mt-1">
              Organize product categories, manage catalog sections, and monitor product distributions
            </p>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-5 py-3 rounded-xl transition shadow-lg shadow-red-600/30 text-sm"
          >
            <FaPlus /> Add Category
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* Search & Count Bar */}
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 bg-zinc-800 px-4 py-2.5 rounded-xl border border-zinc-700 flex-1 max-w-md">
            <FaSearch className="text-zinc-400" />
            <input
              type="text"
              placeholder="Search category by ID or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent outline-none text-white text-sm w-full placeholder-zinc-500"
            />
          </div>

          <div className="text-sm text-zinc-400 font-medium">
            Total Categories: <span className="text-white font-bold">{filteredCategories.length}</span>
          </div>
        </div>

        {/* Categories Table */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
          {loading ? (
            <div className="p-12 text-center text-zinc-400">Loading categories...</div>
          ) : filteredCategories.length === 0 ? (
            <div className="p-12 text-center text-zinc-400 flex flex-col items-center">
              <FaTags className="text-4xl text-zinc-600 mb-3" />
              <p className="font-semibold">No categories found</p>
              <p className="text-xs text-zinc-500 mt-1">Try another search or add a new category.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-zinc-800/80 text-zinc-300 border-b border-zinc-800 uppercase text-xs tracking-wider">
                    <th className="py-4 px-6">Category ID</th>
                    <th className="py-4 px-6">Category Name</th>
                    <th className="py-4 px-6">Total Products</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                  {filteredCategories.map((category) => {
                    const count = category.productCount || 0;
                    const catName =
                      category.name ||
                      category.categoryName ||
                      category.category_name ||
                      `Category #${category.categoryId}`;

                    return (
                      <tr key={category.categoryId} className="hover:bg-zinc-800/40 transition">
                        <td className="py-4 px-6 font-mono text-zinc-400 font-semibold">
                          #{category.categoryId}
                        </td>
                        <td className="py-4 px-6 font-bold text-white text-base">
                          {catName}
                        </td>
                        <td className="py-4 px-6">
                          {count > 0 ? (
                            <span className="bg-blue-500/10 text-blue-400 border border-blue-500/30 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 w-fit">
                              <FaBoxOpen className="text-xs" /> {count} Product{count > 1 ? "s" : ""}
                            </span>
                          ) : (
                            <span className="bg-zinc-800 text-zinc-400 border border-zinc-700 text-xs font-semibold px-3 py-1 rounded-full w-fit">
                              0 Products
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenEditModal(category)}
                              title="Edit Category"
                              className="p-2.5 bg-zinc-800 hover:bg-zinc-700 text-amber-400 rounded-xl transition"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleOpenDelete(category)}
                              title="Delete Category"
                              className="p-2.5 bg-zinc-800 hover:bg-red-600/20 text-red-400 rounded-xl transition"
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

      {/* ADD / EDIT CATEGORY MODAL */}
      {(isAddModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                {isAddModalOpen ? (
                  <>
                    <FaPlus className="text-red-500" /> Add New Category
                  </>
                ) : (
                  <>
                    <FaEdit className="text-amber-500" /> Edit Category (#{selectedCategory?.categoryId})
                  </>
                )}
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setIsEditModalOpen(false);
                }}
                className="text-zinc-400 hover:text-white transition p-2 rounded-lg hover:bg-zinc-800"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={isAddModalOpen ? handleAddSubmit : handleEditSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                  Category Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. VR & Mixed Reality"
                  value={categoryName}
                  onChange={(e) => {
                    setCategoryName(e.target.value);
                    if (nameError) setNameError("");
                  }}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-red-500 text-white text-sm"
                  autoFocus
                />
                {nameError && <p className="text-red-400 text-xs mt-1.5">{nameError}</p>}
              </div>

              <div className="pt-4 border-t border-zinc-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setIsEditModalOpen(false);
                  }}
                  className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold px-5 py-2.5 rounded-xl transition text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold px-5 py-2.5 rounded-xl transition shadow-lg shadow-red-600/30 text-sm disabled:opacity-50"
                >
                  {submitting
                    ? "Saving..."
                    : isAddModalOpen
                    ? "Add Category"
                    : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL (When productCount === 0) */}
      {isDeleteModalOpen && selectedCategory && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-6 shadow-2xl text-center">
            <div className="w-16 h-16 bg-red-600/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl border border-red-500/30">
              <FaTrash />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Delete Category</h3>
            <p className="text-zinc-400 text-sm mb-6">
              Are you sure you want to delete category <span className="text-white font-bold">"{selectedCategory.name}"</span>? This action cannot be undone.
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
                {submitting ? "Deleting..." : "Yes, Delete Category"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BLOCKED DELETE MODAL (When productCount > 0) */}
      {isBlockedDeleteModalOpen && selectedCategory && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-amber-500/50 rounded-2xl max-w-md w-full p-6 shadow-2xl text-center">
            <div className="w-16 h-16 bg-amber-500/20 text-amber-400 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl border border-amber-500/30">
              <FaExclamationTriangle />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Cannot Delete Category</h3>
            <p className="text-zinc-300 text-sm leading-relaxed mb-6">
              Category <span className="text-amber-400 font-bold">"{selectedCategory.name}"</span> contains{" "}
              <span className="text-white font-bold">{selectedCategory.productCount} product(s)</span>.
              <br />
              <span className="text-zinc-400 text-xs mt-2 block">
                To delete this category, you must first delete or reassign all products assigned to it in the Product Management page.
              </span>
            </p>
            <div className="flex justify-center">
              <button
                onClick={() => setIsBlockedDeleteModalOpen(false)}
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

export default AdminCategories;
