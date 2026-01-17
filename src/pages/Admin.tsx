import { useState, useEffect } from "react";
// @ts-ignore
import * as XLSX from "xlsx";
import { Link } from "react-router-dom";
import { db, reloadProducts } from "../db";
import type { Product, SpinLog } from "../types";

export function Admin() {
  const [products, setProducts] = useState<Product[]>([]);
  const [logs, setLogs] = useState<SpinLog[]>([]);
  const [activeTab, setActiveTab] = useState<"products" | "logs">("products");
  const [editingQuantity, setEditingQuantity] = useState<{
    id: number;
    value: number;
  } | null>(null);
  const [editingProbability, setEditingProbability] = useState<{
    id: number;
    value: number;
  } | null>(null);

  function handleExportLogsToExcel() {
    if (logs.length === 0) return;
    const data = logs.map((log: SpinLog) => ({
      Product: log.productName,
      Date: new Date(log.date).toLocaleDateString(),
      Time: new Date(log.date).toLocaleTimeString(),
      'Stock After Spin': log.remaining ?? '',
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Spin History");
    XLSX.writeFile(workbook, "spin_history.xlsx");
  }

  useEffect(() => {
    loadProducts();
    loadLogs();
  }, []);

  async function loadProducts() {
    const allProducts = await db.products.toArray();
    setProducts(allProducts);
  }

  async function loadLogs() {
    const allLogs = await db.logs.orderBy("date").reverse().toArray();
    setLogs(allLogs);
  }

  async function handleUpdateQuantity(id: number, newQuantity: number) {
    if (newQuantity < 0) return;
    await db.products.update(id, { remaining: newQuantity });
    await loadProducts();
    setEditingQuantity(null);
  }

  async function handleUpdateProbability(id: number, newProbability: number) {
    if (newProbability < 0) return;
    await db.products.update(id, { probability: newProbability });
    await loadProducts();
    setEditingProbability(null);
  }

  async function handleToggleActive(id: number, currentActive: boolean) {
    await db.products.update(id, { active: !currentActive });
    await loadProducts();
  }

  async function handleClearLogs() {
    if (confirm("Clear all spin history?")) {
      await db.logs.clear();
      await loadLogs();
    }
  }

  async function handleReloadProducts() {
    if (
      confirm(
        "Reload products from code? This will delete all current products and quantities!"
      )
    ) {
      await reloadProducts();
      await loadProducts();
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-purple-50 p-4 md:p-6 lg:p-8 xl:p-10">
      <div className="max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-4 md:p-6 lg:p-8 mb-6 md:mb-8 border border-gray-100">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold bg-linear-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                ⚙️ Admin Panel
              </h1>
              <p className="text-sm md:text-base lg:text-lg text-gray-600 mt-2">
                Manage your prizes and view statistics
              </p>
            </div>
            <Link
              to="/"
              className="bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 md:px-6 md:py-3 lg:px-8 lg:py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2 text-sm md:text-base lg:text-lg"
            >
              ← Back to Game
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 md:gap-4 mb-6 md:mb-8">
          <button
            className={`flex-1 py-3 md:py-4 px-4 md:px-6 rounded-xl font-semibold transition-all duration-300 text-sm md:text-base lg:text-lg ${
              activeTab === "products"
                ? "bg-white shadow-lg text-purple-600 border-2 border-purple-600"
                : "bg-white/50 text-gray-600 hover:bg-white hover:shadow-md"
            }`}
            onClick={() => setActiveTab("products")}
          >
            📦 Products
          </button>
          <button
            className={`flex-1 py-3 md:py-4 px-4 md:px-6 rounded-xl font-semibold transition-all duration-300 text-sm md:text-base lg:text-lg ${
              activeTab === "logs"
                ? "bg-white shadow-lg text-purple-600 border-2 border-purple-600"
                : "bg-white/50 text-gray-600 hover:bg-white hover:shadow-md"
            }`}
            onClick={() => setActiveTab("logs")}
          >
            📊 Spin History
          </button>
        </div>

        {activeTab === "products" && (
          <div>
            {/* Probability Total Info */}
            <div className="mb-4 md:mb-6 text-sm md:text-base lg:text-lg">
              <span className="font-semibold text-gray-700">
                Total Probability:{" "}
              </span>
              <span
                className={
                  Math.abs(
                    products.reduce((sum, p) => sum + (p.probability ?? 0), 0) -
                      100
                  ) < 0.01
                    ? "text-green-600 font-bold"
                    : "text-red-600 font-bold"
                }
              >
                {products
                  .reduce((sum, p) => sum + (p.probability ?? 0), 0)
                  .toFixed(2)}
                %
              </span>
              <span className="ml-2 text-xs md:text-sm text-gray-500">
                (should be 100%)
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 md:gap-4 mb-6">
              <button
                onClick={handleReloadProducts}
                className="bg-linear-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-4 py-2 md:px-6 md:py-3 lg:px-8 lg:py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 text-sm md:text-base lg:text-lg"
              >
                Reload Products
              </button>
            </div>

            {/* Products Grid */}
            {products.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center">
                <div className="text-4xl md:text-6xl mb-4">📦</div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">
                  No Products Yet
                </h3>
                <p className="text-sm md:text-base text-gray-600">
                  Products will be automatically loaded when you start the app.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-6">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className={`bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 ${
                      product.active ? "border-green-300" : "border-gray-300"
                    }`}
                  >
                    <div className="relative h-40 md:h-48 lg:h-56 bg-linear-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="max-h-32 md:max-h-40 lg:max-h-48 max-w-full object-contain p-3 md:p-4"
                      />
                      <button
                        onClick={() =>
                          handleToggleActive(product.id!, product.active)
                        }
                        className={`absolute top-2 md:top-3 right-2 md:right-3 px-2 md:px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                          product.active
                            ? "bg-green-500 hover:bg-green-600 text-white"
                            : "bg-gray-400 hover:bg-gray-500 text-white"
                        }`}
                      >
                        {product.active ? "✓ Active" : "✗ Inactive"}
                      </button>
                    </div>
                    <div className="p-4 md:p-6">
                      <h3 className="text-base md:text-lg lg:text-xl font-bold text-gray-800 mb-3 md:mb-4 line-clamp-2">
                        {product.name}
                      </h3>

                      {/* Quantity Management */}
                      <div className="mb-3 md:mb-4">
                        <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">
                          Remaining Quantity
                        </label>
                        {editingQuantity?.id === product.id &&
                        editingQuantity ? (
                          <div className="flex gap-2">
                            <input
                              type="number"
                              min="0"
                              value={editingQuantity.value}
                              onChange={(e) =>
                                setEditingQuantity({
                                  id: product.id!,
                                  value: Number(e.target.value),
                                })
                              }
                              className="flex-1 px-2 md:px-3 py-1 md:py-2 text-sm md:text-base border-2 border-purple-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
                              autoFocus
                            />
                            <button
                              onClick={() =>
                                handleUpdateQuantity(
                                  product.id!,
                                  editingQuantity.value
                                )
                              }
                              className="px-3 md:px-4 py-1 md:py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-all text-sm md:text-base"
                            >
                              ✓
                            </button>
                            <button
                              onClick={() => setEditingQuantity(null)}
                              className="px-3 md:px-4 py-1 md:py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg font-semibold transition-all text-sm md:text-base"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <div
                            className="flex items-center justify-between px-3 md:px-4 py-2 md:py-3 bg-linear-to-r from-purple-100 to-pink-100 rounded-lg cursor-pointer hover:from-purple-200 hover:to-pink-200 transition-all"
                            onClick={() =>
                              setEditingQuantity({
                                id: product.id!,
                                value: product.remaining,
                              })
                            }
                          >
                            <span className="text-2xl md:text-3xl font-bold text-purple-600">
                              {product.remaining}
                            </span>
                            <button className="text-xs md:text-sm text-purple-600 hover:text-purple-800 font-semibold">
                              ✏️ Edit
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Probability Management */}
                      <div className="mb-3 md:mb-4">
                        <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">
                          Probability (%)
                        </label>
                        {editingProbability?.id === product.id &&
                        editingProbability ? (
                          <div className="flex gap-2">
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={editingProbability.value}
                              onChange={(e) =>
                                setEditingProbability({
                                  id: product.id!,
                                  value: Number(e.target.value),
                                })
                              }
                              className="flex-1 px-2 md:px-3 py-1 md:py-2 text-sm md:text-base border-2 border-pink-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                              autoFocus
                            />
                            <button
                              onClick={() =>
                                handleUpdateProbability(
                                  product.id!,
                                  editingProbability.value
                                )
                              }
                              className="px-3 md:px-4 py-1 md:py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-all text-sm md:text-base"
                            >
                              ✓
                            </button>
                            <button
                              onClick={() => setEditingProbability(null)}
                              className="px-3 md:px-4 py-1 md:py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg font-semibold transition-all text-sm md:text-base"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <div
                            className="flex items-center justify-between px-3 md:px-4 py-2 md:py-3 bg-linear-to-r from-pink-100 to-purple-100 rounded-lg cursor-pointer hover:from-pink-200 hover:to-purple-200 transition-all"
                            onClick={() =>
                              setEditingProbability({
                                id: product.id!,
                                value: product.probability ?? 0,
                              })
                            }
                          >
                            <span className="text-xl md:text-2xl font-bold text-pink-600">
                              {product.probability?.toFixed(2) ?? "0.00"}%
                            </span>
                            <button className="text-xs md:text-sm text-pink-600 hover:text-pink-800 font-semibold">
                              ✏️ Edit
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "logs" && (
          <div>
            <div className="flex flex-wrap gap-3 md:gap-4 justify-between items-center mb-6">
              <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-800">
                Total Spins: {logs.length}
              </h2>
              <div className="flex gap-2 md:gap-3">
                <button
                  onClick={handleExportLogsToExcel}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 md:px-6 md:py-3 lg:px-8 lg:py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 text-sm md:text-base lg:text-lg"
                >
                  📥 Export to Excel
                </button>
                <button
                  onClick={handleClearLogs}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 md:px-6 md:py-3 lg:px-8 lg:py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 text-sm md:text-base lg:text-lg"
                >
                  🗑️ Clear History
                </button>
              </div>
            </div>

            {logs.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center">
                <div className="text-4xl md:text-6xl mb-4">📊</div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">
                  No Spins Yet
                </h3>
                <p className="text-sm md:text-base text-gray-600">
                  History will appear here after the first spin!
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-linear-to-r from-purple-600 to-pink-600 text-white">
                      <tr>
                        <th className="px-4 md:px-6 py-3 md:py-4 text-left font-semibold text-sm md:text-base lg:text-lg">
                          Product
                        </th>
                        <th className="px-4 md:px-6 py-3 md:py-4 text-left font-semibold text-sm md:text-base lg:text-lg">
                          Date
                        </th>
                        <th className="px-4 md:px-6 py-3 md:py-4 text-left font-semibold text-sm md:text-base lg:text-lg">
                          Time
                        </th>
                        <th className="px-4 md:px-6 py-3 md:py-4 text-left font-semibold text-sm md:text-base lg:text-lg">
                          Stock After Spin
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {logs.map((log, index) => (
                        <tr
                          key={log.id}
                          className={`hover:bg-purple-50 transition-colors duration-150 ${
                            index % 2 === 0 ? "bg-white" : "bg-gray-50"
                          }`}
                        >
                          <td className="px-4 md:px-6 py-3 md:py-4 font-medium text-gray-800 text-sm md:text-base">
                            {log.productName}
                          </td>
                          <td className="px-4 md:px-6 py-3 md:py-4 text-gray-600 text-sm md:text-base">
                            {new Date(log.date).toLocaleDateString()}
                          </td>
                          <td className="px-4 md:px-6 py-3 md:py-4 text-gray-600 text-sm md:text-base">
                            {new Date(log.date).toLocaleTimeString()}
                          </td>
                          <td className="px-4 md:px-6 py-3 md:py-4 text-gray-600 text-sm md:text-base">
                            {log.remaining ?? ''}
                          </td>
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