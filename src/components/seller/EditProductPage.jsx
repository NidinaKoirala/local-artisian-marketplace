import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const EditProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5174'}/items/${id}`
        );
        if (!response.ok) {
          throw new Error('Failed to fetch product details');
        }
        const data = await response.json();

        // Ensure product and imageUrls are properly set
        setProduct({
          ...data,
          imageUrls: data.photos ? data.photos.map((photo) => photo.url) : [''], // Extract photo URLs
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProduct((prevProduct) => ({ ...prevProduct, [name]: value }));
  };

  const handleImageUrlChange = (index, value) => {
    setProduct((prevProduct) => {
      const updatedImageUrls = [...prevProduct.imageUrls];
      updatedImageUrls[index] = value;
      return { ...prevProduct, imageUrls: updatedImageUrls };
    });
  };

  const handleAddImageUrl = () => {
    setProduct((prevProduct) => ({
      ...prevProduct,
      imageUrls: [...prevProduct.imageUrls, ''],
    }));
  };

  const handleRemoveImageUrl = (index) => {
    setProduct((prevProduct) => {
      const updatedImageUrls = [...prevProduct.imageUrls];
      updatedImageUrls.splice(index, 1);
      return { ...prevProduct, imageUrls: updatedImageUrls };
    });
  };

  const handleSave = async () => {
    try {
      setMessage(null);
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5174'}/products/edit/${product.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(product),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update product');
      }

      setMessage({ type: 'success', text: 'Product updated successfully!' });

      // Redirect to /seller page after a short delay
      setTimeout(() => {
        navigate('/seller');
      }, 2000);
    } catch (err) {
      setMessage({ type: 'error', text: 'Error updating product: ' + err.message });
    }
  };

  if (loading) {
    return <p>Loading product details...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-semibold mb-4">Edit Product</h1>
      {message && (
        <div
          className={`p-4 rounded-lg mb-4 ${
            message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}
      <div className="bg-white shadow-lg rounded-lg p-6 space-y-4">
        <div>
          <label className="block text-gray-700">Title</label>
          <input
            type="text"
            name="title"
            value={product.title || ''}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-lg p-2"
          />
        </div>
        <div>
          <label className="block text-gray-700">Price</label>
          <input
            type="number"
            name="price"
            value={product.price || ''}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-lg p-2"
          />
        </div>
        <div>
          <label className="block text-gray-700">Stock</label>
          <input
            type="number"
            name="inStock"
            value={product.inStock || ''}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-lg p-2"
          />
        </div>
        <div>
          <label className="block text-gray-700">Description</label>
          <textarea
            name="description"
            value={product.description || ''}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-lg p-2"
          ></textarea>
        </div>
        <div>
          <label className="block text-gray-700">Image URLs</label>
          {product.imageUrls.map((url, index) => (
            <div key={index} className="flex items-center space-x-2 mb-2">
              <input
                type="text"
                value={url}
                onChange={(e) => handleImageUrlChange(index, e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2"
              />
              <button
                type="button"
                onClick={() => handleRemoveImageUrl(index)}
                className="bg-red-500 text-white px-2 py-1 rounded-lg hover:bg-red-600"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddImageUrl}
            className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            Add Another URL
          </button>
        </div>
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProductPage;
