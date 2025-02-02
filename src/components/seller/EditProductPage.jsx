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

        setProduct({
          ...data,
          imageUrls: data.photos ? data.photos.map((photo) => photo.url) : [],
          removedImages: [],
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

  const handleImageUpload = async (files) => {
    setMessage({ type: 'info', text: 'Uploading images...' });

    const uploadedImages = [];
    for (let file of files) {
      const formData = new FormData();
      formData.append('image', file);

      try {
        const response = await fetch(`https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_IMGBB_API_KEY}`, {
          method: 'POST',
          body: formData,
        });
        const data = await response.json();

        if (data.success) {
          uploadedImages.push(data.data.url);
        } else {
          setMessage({ type: 'error', text: 'Image upload failed. Please try again.' });
        }
      } catch (err) {
        console.error('Error uploading image:', err);
        setMessage({ type: 'error', text: 'Error uploading one or more images. Please try again.' });
      }
    }

    setProduct((prevProduct) => ({
      ...prevProduct,
      imageUrls: [...prevProduct.imageUrls, ...uploadedImages],
    }));

    setMessage({ type: 'success', text: 'Images uploaded successfully!' });
  };

  const handleRemoveImageUrl = (index) => {
    setProduct((prevProduct) => {
      const updatedImageUrls = [...prevProduct.imageUrls];
      const removedImage = updatedImageUrls.splice(index, 1);

      return {
        ...prevProduct,
        imageUrls: updatedImageUrls,
        removedImages: [...prevProduct.removedImages, removedImage[0]],
      };
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
          body: JSON.stringify({ ...product, removedImages: product.removedImages }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update product');
      }

      setMessage({ type: 'success', text: 'Product updated successfully!' });

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
        <div className={`p-4 rounded-lg mb-4 ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message.text}
        </div>
      )}
      <div className="bg-white shadow-lg rounded-lg p-6 space-y-4">
        <label className="block text-gray-700">Title</label>
        <input type="text" name="title" value={product.title || ''} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg p-2" />
        <label className="block text-gray-700">Price</label>
        <input type="number" name="price" value={product.price || ''} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg p-2" />
        <label className="block text-gray-700">Stock</label>
        <input type="number" name="inStock" value={product.inStock || ''} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg p-2" />
        <label className="block text-gray-700">Description</label>
        <textarea name="description" value={product.description || ''} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg p-2"></textarea>
        <label className="block text-gray-700">Upload New Images</label>
        <input type="file" accept="image/*" multiple onChange={(e) => handleImageUpload(e.target.files)} className="mb-2" />
        <label className="block text-blue-600 font-bold">Existing Photos</label>
        <div className="flex flex-wrap gap-2">
          {product.imageUrls.map((url, index) => (
            <div key={index} className="flex flex-col items-center">
              <img src={url} alt="Product preview" className="w-20 h-20 object-cover border rounded-lg" />
              <button
                type="button"
                onClick={() => handleRemoveImageUrl(index)}
                className="mt-1 bg-red-500 text-white px-2 py-1 rounded-lg hover:bg-red-600"
              >
                Remove
              </button>
            </div>
          ))}
        </div>        
        <button onClick={handleSave} className="bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors">Save Changes</button>
      </div>
    </div>
  );
};

export default EditProductPage;