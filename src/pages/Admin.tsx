import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../db';
import type { Product, SpinLog } from '../types';

export function Admin() {
  const [products, setProducts] = useState<Product[]>([]);
  const [logs, setLogs] = useState<SpinLog[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'products' | 'logs'>('products');

  const [formData, setFormData] = useState<Omit<Product, 'id'>>({
    name: '',
    image: '',
    remaining: 0,
    active: true
  });

  useEffect(() => {
    loadProducts();
    loadLogs();
  }, []);

  async function loadProducts() {
    const allProducts = await db.products.toArray();
    setProducts(allProducts);
  }

  async function loadLogs() {
    const allLogs = await db.logs.orderBy('date').reverse().toArray();
    setLogs(allLogs);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (editingProduct && editingProduct.id) {
      await db.products.update(editingProduct.id, formData);
    } else {
      await db.products.add(formData);
    }
    
    resetForm();
    await loadProducts();
  }

  function resetForm() {
    setFormData({
      name: '',
      image: '',
      remaining: 0,
      active: true
    });
    setEditingProduct(null);
    setShowAddForm(false);
  }

  function handleEdit(product: Product) {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      image: product.image,
      remaining: product.remaining,
      active: product.active
    });
    setShowAddForm(true);
  }

  async function handleDelete(id: number) {
    if (confirm('Are you sure you want to delete this product?')) {
      await db.products.delete(id);
      await loadProducts();
    }
  }

  async function handleResetQuantities() {
    if (confirm('Reset all product quantities to their original values?')) {
      const updates = products.map(p => 
        db.products.update(p.id!, { remaining: 10 })
      );
      await Promise.all(updates);
      await loadProducts();
    }
  }

  async function handleClearLogs() {
    if (confirm('Clear all spin history?')) {
      await db.logs.clear();
      await loadLogs();
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-gray-100">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                ⚙️ Admin Panel
              </h1>
              <p className="text-gray-600 mt-2">Manage your prizes and view statistics</p>
            </div>
            <Link 
              to="/" 
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              ← Back to Game
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <button 
            className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all duration-300 ${
              activeTab === 'products'
                ? 'bg-white shadow-lg text-purple-600 border-2 border-purple-600'
                : 'bg-white/50 text-gray-600 hover:bg-white hover:shadow-md'
            }`}
            onClick={() => setActiveTab('products')}
          >
            📦 Products
          </button>
          <button 
            className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all duration-300 ${
              activeTab === 'logs'
                ? 'bg-white shadow-lg text-purple-600 border-2 border-purple-600'
                : 'bg-white/50 text-gray-600 hover:bg-white hover:shadow-md'
            }`}
            onClick={() => setActiveTab('logs')}
          >
            📊 Spin History
          </button>
        </div>

        {activeTab === 'products' && (
          <div>
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 mb-6">
              <button 
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {showAddForm ? '✕ Cancel' : '+ Add Product'}
              </button>
              <button 
                onClick={handleResetQuantities}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                🔄 Reset Quantities
              </button>
            </div>

            {/* Add/Edit Form */}
            {showAddForm && (
              <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                  {editingProduct ? '✏️ Edit Product' : '➕ Add New Product'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Product Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring focus:ring-purple-200 transition-all duration-200"
                      placeholder="Enter product name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Image URL</label>
                    <input
                      type="text"
                      name="image"
                      value={formData.image}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring focus:ring-purple-200 transition-all duration-200"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Remaining Quantity</label>
                    <input
                      type="number"
                      name="remaining"
                      value={formData.remaining}
                      onChange={handleInputChange}
                      required
                      min="0"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring focus:ring-purple-200 transition-all duration-200"
                    />
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      name="active"
                      id="active"
                      checked={formData.active}
                      onChange={handleInputChange}
                      className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <label htmlFor="active" className="text-sm font-semibold text-gray-700">
                      Active (Available on wheel)
                    </label>
                  </div>
                  
                  <div className="flex gap-4 pt-4">
                    <button 
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      {editingProduct ? 'Update Product' : 'Add Product'}
                    </button>
                    <button 
                      type="button"
                      onClick={resetForm}
                      className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-semibold transition-all duration-300"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Products Grid */}
            {products.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
                <div className="text-6xl mb-4">📦</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">No Products Yet</h3>
                <p className="text-gray-600">Add your first product to get started!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map(product => (
                  <div 
                    key={product.id} 
                    className={`bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 ${
                      product.active ? 'border-green-300' : 'border-gray-300'
                    }`}
                  >
                    <div className="relative h-48 bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="max-h-40 max-w-full object-contain p-4"
                      />
                      <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold ${
                        product.active ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'
                      }`}>
                        {product.active ? '✓ Active' : '✗ Inactive'}
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-800 mb-2">{product.name}</h3>
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-2xl font-bold text-purple-600">{product.remaining}</span>
                        <span className="text-gray-600">remaining</span>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleEdit(product)}
                          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-semibold transition-all duration-200"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(product.id!)}
                          className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg font-semibold transition-all duration-200"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'logs' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                Total Spins: {logs.length}
              </h2>
              <button 
                onClick={handleClearLogs}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                🗑️ Clear History
              </button>
            </div>

            {logs.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">No Spins Yet</h3>
                <p className="text-gray-600">History will appear here after the first spin!</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                      <tr>
                        <th className="px-6 py-4 text-left font-semibold">Product</th>
                        <th className="px-6 py-4 text-left font-semibold">Date</th>
                        <th className="px-6 py-4 text-left font-semibold">Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {logs.map((log, index) => (
                        <tr 
                          key={log.id}
                          className={`hover:bg-purple-50 transition-colors duration-150 ${
                            index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                          }`}
                        >
                          <td className="px-6 py-4 font-medium text-gray-800">{log.productName}</td>
                          <td className="px-6 py-4 text-gray-600">{new Date(log.date).toLocaleDateString()}</td>
                          <td className="px-6 py-4 text-gray-600">{new Date(log.date).toLocaleTimeString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
