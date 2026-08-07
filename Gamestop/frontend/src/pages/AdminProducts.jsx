import { useEffect, useState } from "react";
import AdminLayout from "../components/admin/AdminLayout";
import {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../services/productService";
import { getAllCategories } from "../services/categoryService";
import {
  FaPlus,
  FaEye,
  FaEdit,
  FaTrash,
  FaStar,
  FaSearch,
  FaTimes,
  FaBoxOpen,
  FaImage,
} from "react-icons/fa";

const DEFAULT_PLACEHOLDER =
  "https://ik.imagekit.io/stringstackSG/Games%20Category.png";

function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Selected product state
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Form data for Add / Edit
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    categoryId: "",
    rating: "4.8",
    image: "",
  });

  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  async function fetchInitialData() {
    try {
      setLoading(true);
      setError("");
      const [productData, categoryData] = await Promise.all([
        getAllProducts(),
        getAllCategories(),
      ]);
      setProducts(productData || []);
      setCategories(categoryData || []);
    } catch (err) {
      console.error("Error loading products/categories:", err);
      setError("Failed to fetch product catalog. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Filter products by search
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.category?.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    String(p.productId).includes(searchQuery)
  );

  // Open Add Modal
  const handleOpenAddModal = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      stock: "10",
      categoryId: categories[0]?.categoryId || "",
      rating: "4.8",
      image: "",
    });
    setFormErrors({});
    setIsAddModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name || "",
      description: product.description || "",
      price: product.price ? String(product.price) : "",
      stock: product.stock !== undefined ? String(product.stock) : "0",
      categoryId: product.category?.categoryId || (categories[0]?.categoryId || ""),
      rating: product.rating ? String(product.rating) : "4.8",
      image: product.image || "",
    });
    setFormErrors({});
    setIsEditModalOpen(true);
  };

  // Open View Modal
  const handleOpenViewModal = (product) => {
    setSelectedProduct(product);
    setIsViewModalOpen(true);
  };

  // Open Delete Modal
  const handleOpenDeleteModal = (product) => {
    setSelectedProduct(product);
    setIsDeleteModalOpen(true);
  };

  // Form Validation
  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = "Product Name is required";
    if (!formData.description.trim()) errors.description = "Description is required";
    
    if (!formData.price) {
      errors.price = "Price is required";
    } else if (isNaN(formData.price) || Number(formData.price) <= 0) {
      errors.price = "Enter a valid positive price";
    }

    if (!formData.stock && formData.stock !== "0") {
      errors.stock = "Stock quantity is required";
    } else if (isNaN(formData.stock) || Number(formData.stock) < 0) {
      errors.stock = "Enter a valid non-negative integer for stock";
    }

    if (!formData.categoryId) {
      errors.categoryId = "Category selection is required";
    }

    if (!formData.image.trim()) {
      errors.image = "Product Image URL is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle Add Product Submit
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: Number(formData.price),
        stock: Number(formData.stock),
        rating: Number(formData.rating) || 4.8,
        image: formData.image.trim(),
        category: {
          categoryId: Number(formData.categoryId),
        },
      };

      await createProduct(payload);
      setIsAddModalOpen(false);
      await fetchInitialData();
    } catch (err) {
      console.error("Failed to add product:", err);
      alert(err.message || "Failed to create product");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Edit Product Submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm() || !selectedProduct) return;

    try {
      setSubmitting(true);
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: Number(formData.price),
        stock: Number(formData.stock),
        rating: Number(formData.rating) || 4.8,
        image: formData.image.trim(),
        category: {
          categoryId: Number(formData.categoryId),
        },
      };

      await updateProduct(selectedProduct.productId, payload);
      setIsEditModalOpen(false);
      setSelectedProduct(null);
      await fetchInitialData();
    } catch (err) {
      console.error("Failed to update product:", err);
      alert(err.message || "Failed to update product");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete Product Confirm
  const handleDeleteConfirm = async () => {
    if (!selectedProduct) return;

    try {
      setSubmitting(true);
      await deleteProduct(selectedProduct.productId);
      setIsDeleteModalOpen(false);
      setSelectedProduct(null);
      await fetchInitialData();
    } catch (err) {
      console.error("Failed to delete product:", err);
      alert(err.message || "Failed to delete product");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Bar & Actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Product Management</h1>
            <p className="text-zinc-400 text-sm mt-1">
              Manage product catalog items, pricing, inventory, and categories
            </p>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-5 py-3 rounded-xl transition shadow-lg shadow-red-600/30 text-sm"
          >
            <FaPlus /> Add Product
          </button>
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
              placeholder="Search by ID, product name, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent outline-none text-white text-sm w-full placeholder-zinc-500"
            />
          </div>

          <div className="text-sm text-zinc-400 font-medium">
            Total Products: <span className="text-white font-bold">{filteredProducts.length}</span>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
          {loading ? (
            <div className="p-12 text-center text-zinc-400">Loading product catalog...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-12 text-center text-zinc-400 flex flex-col items-center">
              <FaBoxOpen className="text-4xl text-zinc-600 mb-3" />
              <p className="font-semibold">No products found</p>
              <p className="text-xs text-zinc-500 mt-1">Try adjusting your search filter or add a new product.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-zinc-800/80 text-zinc-300 border-b border-zinc-800 uppercase text-xs tracking-wider">
                    <th className="py-4 px-6">ID</th>
                    <th className="py-4 px-6">Image</th>
                    <th className="py-4 px-6">Product Name</th>
                    <th className="py-4 px-6">Category</th>
                    <th className="py-4 px-6">Price</th>
                    <th className="py-4 px-6">Stock</th>
                    <th className="py-4 px-6">Rating</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                  {filteredProducts.map((product) => {
                    const categoryName = product.category?.name || "Uncategorized";
                    const priceFormatted = Number(product.price || 0).toLocaleString("en-IN");
                    const imgUrl = product.image || DEFAULT_PLACEHOLDER;

                    return (
                      <tr key={product.productId} className="hover:bg-zinc-800/40 transition">
                        <td className="py-4 px-6 font-mono text-zinc-400 font-semibold">
                          #{product.productId}
                        </td>
                        <td className="py-4 px-6">
                          <div className="w-12 h-12 rounded-lg bg-zinc-950 p-1 border border-zinc-800 flex items-center justify-center overflow-hidden">
                            <img
                              src={imgUrl}
                              alt={product.name}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = DEFAULT_PLACEHOLDER;
                              }}
                              className="w-full h-full object-contain"
                            />
                          </div>
                        </td>
                        <td className="py-4 px-6 font-semibold text-white max-w-xs truncate">
                          {product.name}
                        </td>
                        <td className="py-4 px-6">
                          <span className="bg-zinc-800 text-zinc-300 text-xs px-2.5 py-1 rounded-lg border border-zinc-700">
                            {categoryName}
                          </span>
                        </td>
                        <td className="py-4 px-6 font-bold text-red-400">
                          ₹{priceFormatted}
                        </td>
                        <td className="py-4 px-6">
                          {product.stock > 0 ? (
                            <span className="bg-green-500/10 text-green-400 border border-green-500/30 text-xs font-semibold px-2.5 py-1 rounded-full">
                              In Stock ({product.stock})
                            </span>
                          ) : (
                            <span className="bg-red-500/10 text-red-400 border border-red-500/30 text-xs font-semibold px-2.5 py-1 rounded-full">
                              Out of Stock
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-1 text-yellow-400 font-semibold">
                            <FaStar className="text-xs" />
                            <span>{product.rating ?? "4.8"}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenViewModal(product)}
                              title="View Details"
                              className="p-2 bg-zinc-800 hover:bg-zinc-700 text-blue-400 rounded-lg transition"
                            >
                              <FaEye />
                            </button>
                            <button
                              onClick={() => handleOpenEditModal(product)}
                              title="Edit Product"
                              className="p-2 bg-zinc-800 hover:bg-zinc-700 text-amber-400 rounded-lg transition"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleOpenDeleteModal(product)}
                              title="Delete Product"
                              className="p-2 bg-zinc-800 hover:bg-red-600/20 text-red-400 rounded-lg transition"
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

      {/* VIEW PRODUCT MODAL */}
      {isViewModalOpen && selectedProduct && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <FaEye className="text-red-500" /> Product Details (#{selectedProduct.productId})
              </h3>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="text-zinc-400 hover:text-white transition p-2 rounded-lg hover:bg-zinc-800"
              >
                <FaTimes />
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 flex items-center justify-center h-64">
                <img
                  src={selectedProduct.image || DEFAULT_PLACEHOLDER}
                  alt={selectedProduct.name}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = DEFAULT_PLACEHOLDER;
                  }}
                  className="max-h-full max-w-full object-contain"
                />
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-2xl font-bold text-white">{selectedProduct.name}</h4>
                  <span className="inline-block mt-2 bg-zinc-800 text-zinc-300 text-xs px-3 py-1 rounded-full border border-zinc-700 font-semibold">
                    {selectedProduct.category?.name || "Uncategorized"}
                  </span>
                </div>

                <div className="text-3xl font-extrabold text-red-500">
                  ₹{Number(selectedProduct.price || 0).toLocaleString("en-IN")}
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 text-yellow-400 font-bold">
                    <FaStar />
                    <span>{selectedProduct.rating ?? "4.8"}</span>
                  </div>
                  <div>
                    {selectedProduct.stock > 0 ? (
                      <span className="text-green-400 font-semibold">In Stock ({selectedProduct.stock})</span>
                    ) : (
                      <span className="text-red-400 font-semibold">Out of Stock</span>
                    )}
                  </div>
                </div>

                <div>
                  <h5 className="text-xs uppercase text-zinc-500 font-bold tracking-wider mb-1">Description</h5>
                  <p className="text-zinc-300 text-sm leading-relaxed max-h-40 overflow-y-auto">
                    {selectedProduct.description || "No description provided."}
                  </p>
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

      {/* ADD / EDIT PRODUCT MODAL */}
      {(isAddModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl my-8">
            <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                {isAddModalOpen ? (
                  <>
                    <FaPlus className="text-red-500" /> Add New Product
                  </>
                ) : (
                  <>
                    <FaEdit className="text-amber-500" /> Edit Product (#{selectedProduct?.productId})
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Product Name */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. PlayStation 5 Pro"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-red-500 text-white text-sm"
                  />
                  {formErrors.name && <p className="text-red-400 text-xs mt-1">{formErrors.name}</p>}
                </div>

                {/* Category Selection */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-red-500 text-white text-sm"
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c.categoryId} value={c.categoryId}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  {formErrors.categoryId && (
                    <p className="text-red-400 text-xs mt-1">{formErrors.categoryId}</p>
                  )}
                </div>

                {/* Price */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="49990"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-red-500 text-white text-sm"
                  />
                  {formErrors.price && <p className="text-red-400 text-xs mt-1">{formErrors.price}</p>}
                </div>

                {/* Stock */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    placeholder="10"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-red-500 text-white text-sm"
                  />
                  {formErrors.stock && <p className="text-red-400 text-xs mt-1">{formErrors.stock}</p>}
                </div>

                {/* Rating */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                    Rating (1.0 - 5.0)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    placeholder="4.8"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-red-500 text-white text-sm"
                  />
                </div>

                {/* Image URL & Live Preview */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                    Image URL *
                  </label>
                  <input
                    type="text"
                    placeholder="https://ik.imagekit.io/..."
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-red-500 text-white text-sm"
                  />
                  {formErrors.image && <p className="text-red-400 text-xs mt-1">{formErrors.image}</p>}

                  {/* Live Image Preview Container */}
                  <div className="mt-3 bg-zinc-950 border border-zinc-800 rounded-xl p-3 flex items-center gap-4">
                    <div className="w-16 h-16 bg-zinc-900 rounded-lg border border-zinc-800 p-1 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {formData.image ? (
                        <img
                          src={formData.image}
                          alt="Preview"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = DEFAULT_PLACEHOLDER;
                          }}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <FaImage className="text-zinc-600 text-2xl" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                        Image Preview
                      </p>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        {formData.image ? "Live URL preview" : "Enter an image URL above to view preview"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                    Description *
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Provide a detailed description of the product..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 outline-none focus:border-red-500 text-white text-sm"
                  />
                  {formErrors.description && (
                    <p className="text-red-400 text-xs mt-1">{formErrors.description}</p>
                  )}
                </div>
              </div>

              <div className="p-4 border-t border-zinc-800 flex justify-end gap-3 pt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setIsEditModalOpen(false);
                  }}
                  className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold px-6 py-2.5 rounded-xl transition text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2.5 rounded-xl transition shadow-lg shadow-red-600/30 text-sm disabled:opacity-50"
                >
                  {submitting
                    ? "Saving..."
                    : isAddModalOpen
                    ? "Add Product"
                    : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {isDeleteModalOpen && selectedProduct && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-6 shadow-2xl text-center">
            <div className="w-16 h-16 bg-red-600/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl border border-red-500/30">
              <FaTrash />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Delete Product</h3>
            <p className="text-zinc-400 text-sm mb-6">
              Are you sure you want to delete <span className="text-white font-bold">"{selectedProduct.name}"</span>? This action cannot be undone.
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
                {submitting ? "Deleting..." : "Yes, Delete Product"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default AdminProducts;
