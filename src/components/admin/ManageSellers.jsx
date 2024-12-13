import React, { useEffect, useState } from "react";
import { fetchData } from "./utils/api"; // Ensure the fetchData utility is imported
import AdminSidebar from "./AdminSidebar"; // Sidebar for consistent navigation

const ManageSellers = () => {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({ message: "", type: "" }); // Feedback modal state
  const [confirmDelete, setConfirmDelete] = useState(null); // Seller ID for delete confirmation

  // Fetch sellers on component mount
  useEffect(() => {
    fetchSellers();
  }, []);

  // Fetch all sellers from the backend
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
// Remove seller by ID
const removeSeller = (id) => {
  fetchData(`/admin/sellers/${id}`, {
    method: "DELETE",
  })
    .then((data) => {
      // Check if the backend response indicates success
      if (data?.message && !data.error) {
        setSellers(sellers.filter((seller) => seller.id !== id));
        setFeedback({ message: data.message, type: "success" });
      } else {
        // Handle case where response does not indicate success
        throw new Error(data.error || "Failed to delete seller");
      }
    })
    .catch((error) => {
      // Log and display error messages from backend or fallback message
      console.error("Error deleting seller:", error);
      setFeedback({ message: error.message || "Failed to delete seller", type: "error" });
    })
    .finally(() => {
      // Clear confirmation state
      setConfirmDelete(null);
    });
};
  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-grow flex flex-col bg-gray-100 min-h-screen p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Manage Sellers</h2>
        {loading ? (
          <div className="flex justify-center items-center">
            <div className="text-blue-500 text-lg">Loading sellers...</div>
          </div>
        ) : sellers.length === 0 ? (
          <p className="text-gray-600 text-lg">No sellers found.</p>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full border-collapse">
              <thead className="bg-gray-200">
                <tr>
                  <th className="text-left p-4 text-gray-800 font-semibold">
                    Seller ID
                  </th>
                  <th className="text-left p-4 text-gray-800 font-semibold">
                    Name
                  </th>
                  <th className="text-left p-4 text-gray-800 font-semibold">
                    Email
                  </th>
                  <th className="text-center p-4 text-gray-800 font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {sellers.map((seller) => (
                  <tr key={seller.id} className="border-t hover:bg-gray-100">
                    <td className="p-4 text-gray-700">{seller.id}</td>
                    <td className="p-4 text-gray-700">{seller.shopName}</td>
                    <td className="p-4 text-gray-700">{seller.email}</td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => setConfirmDelete(seller.id)}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Feedback Modal */}
        {feedback.message && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div
              className={`bg-white p-6 rounded shadow-lg w-1/3 text-center ${
                feedback.type === "success" ? "border-green-500" : "border-red-500"
              }`}
            >
              <h3
                className={`text-lg font-bold ${
                  feedback.type === "success" ? "text-green-500" : "text-red-500"
                }`}
              >
                {feedback.type === "success" ? "Success" : "Error"}
              </h3>
              <p className="mt-2">{feedback.message}</p>
              <button
                className="mt-4 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
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
            <div className="bg-white p-6 rounded shadow-lg w-1/3 text-center">
              <h3 className="text-lg font-bold text-red-500">Confirm Deletion</h3>
              <p className="mt-2">
                Are you sure you want to remove this seller?
              </p>
              <div className="mt-4 flex justify-center gap-4">
                <button
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                  onClick={() => setConfirmDelete(null)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
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
  );
};

export default ManageSellers;
