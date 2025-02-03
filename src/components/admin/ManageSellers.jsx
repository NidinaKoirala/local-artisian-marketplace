import React, { useEffect, useState } from "react";
import { fetchData } from "./utils/api";
import AdminSidebar from "./AdminSidebar";
import { FiTrash2, FiX, FiAlertTriangle } from "react-icons/fi";

const ManageSellers = () => {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({ message: "", type: "" });
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    fetchSellers();
  }, []);

  const fetchSellers = () => {
    setLoading(true);
    fetchData("/admin/sellers")
      .then((data) => {
        setSellers(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching sellers:", error);
        setFeedback({ message: "Error fetching sellers", type: "error" });
        setLoading(false);
      });
  };

  const removeSeller = (id) => {
    fetchData(`/admin/sellers/${id}`, { method: "DELETE" })
      .then((data) => {
        if (data?.message && !data.error) {
          setSellers(sellers.filter((seller) => seller.id !== id));
          setFeedback({ message: data.message, type: "success" });
        } else {
          throw new Error(data.error || "Failed to delete seller");
        }
      })
      .catch((error) => {
        console.error("Error deleting seller:", error);
        setFeedback({ message: error.message || "Failed to delete seller", type: "error" });
      })
      .finally(() => setConfirmDelete(null));
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <AdminSidebar />
      <div className="flex-grow">
        <div className="p-6 xl:p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Manage Sellers</h2>
          
          {loading ? (
            <div className="flex h-96 items-center justify-center">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
            </div>
          ) : sellers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-96 text-gray-500">
              <FiAlertTriangle className="w-16 h-16 mb-4" />
              <p className="text-lg">No sellers found</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Seller ID</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Shop Name</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Email</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {sellers.map((seller) => (
                      <tr key={seller.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm text-gray-700">{seller.id}</td>
                        <td className="px-6 py-4 text-sm text-gray-700 font-medium">{seller.shopName}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{seller.email}</td>
                        <td className="px-6 py-4 text-sm">
                          <button
                            onClick={() => setConfirmDelete(seller.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <FiTrash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Feedback Modal */}
          {feedback.message && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <div className={`bg-white p-6 rounded-lg shadow-lg w-96 text-center ${feedback.type === "success" ? "border-green-500" : "border-red-500"}`}>
                <h3 className={`text-lg font-bold ${feedback.type === "success" ? "text-green-500" : "text-red-500"}`}>
                  {feedback.type === "success" ? "Success" : "Error"}
                </h3>
                <p className="mt-2 text-gray-600">{feedback.message}</p>
                <button
                  className="mt-4 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  onClick={() => setFeedback({ message: "", type: "" })}
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {confirmDelete && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white p-6 rounded-lg shadow-lg w-96 text-center">
                <h3 className="text-lg font-bold text-red-500 flex items-center justify-center gap-2">
                  <FiAlertTriangle /> Confirm Deletion
                </h3>
                <p className="mt-2 text-gray-600">Are you sure you want to remove this seller?</p>
                <div className="mt-4 flex justify-center gap-4">
                  <button
                    className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    onClick={() => setConfirmDelete(null)}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    onClick={() => removeSeller(confirmDelete)}
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageSellers;
