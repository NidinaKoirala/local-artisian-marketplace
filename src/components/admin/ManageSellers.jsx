import React, { useEffect, useState } from "react";
import { fetchData } from "./utils/api"; // Ensure the fetchData utility is imported
import AdminSidebar from "./AdminSidebar"; // Sidebar for consistent navigation

const ManageSellers = () => {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);

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
        setLoading(false);
      });
  };

  // Remove seller by ID
  const removeSeller = (id) => {
    fetch(`/admin/sellers/${id}`, {
      method: "DELETE",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to delete seller");
        }
        console.log(`Seller with ID ${id} deleted`);
        fetchSellers(); // Refresh sellers after deletion
      })
      .catch((error) => {
        console.error("Error deleting seller:", error);
      });
  };

  if (loading) {
    return (
      <div className="flex">
        <AdminSidebar />
        <div className="flex-grow flex justify-center items-center min-h-screen">
          <div className="text-blue-500 text-lg">Loading sellers...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-grow flex flex-col bg-gray-100 min-h-screen p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Manage Sellers</h2>
        {sellers.length === 0 ? (
          <p className="text-gray-600 text-lg">No sellers found.</p>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full border-collapse">
              <thead className="bg-gray-200">
                <tr>
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
                    <td className="p-4 text-gray-700">{seller.shopName}</td>
                    <td className="p-4 text-gray-700">{seller.email}</td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => removeSeller(seller.id)}
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
      </div>
    </div>
  );
};

export default ManageSellers;
