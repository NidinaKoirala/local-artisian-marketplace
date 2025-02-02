import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const EditProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  // Cloudinary configuration from environment variables
  const cloudinaryCloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const cloudinaryApiKey = import.meta.env.VITE_CLOUDINARY_API_KEY;
  const cloudinaryUploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

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
    const { signature, timestamp } = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/upload/signature`
    ).then(res => res.json());
    for (let file of files) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', cloudinaryUploadPreset);
      formData.append('api_key', cloudinaryApiKey);
      formData.append('signature', signature);
      formData.append('timestamp', timestamp);

      try {
        const response = await axios.post(
          `https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/image/upload`,
          formData
        );

        if (response.data.secure_url) {
          uploadedImages.push(response.data.secure_url);
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

  const handleRemoveImageUrl = async (index) => {
    const imageUrl = product.imageUrls[index];

    // Delete image from Cloudinary
    try {
      const publicId = imageUrl.split('/').pop().split('.')[0]; // Extract public ID from URL
      await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/image/destroy`,
        {
          public_id: publicId,
          api_key: cloudinaryApiKey,
          timestamp: Math.round(Date.now() / 1000),
          signature: await generateCloudinarySignature(publicId),
        }
      );

      // Remove image URL from state
      setProduct((prevProduct) => {
        const updatedImageUrls = [...prevProduct.imageUrls];
        updatedImageUrls.splice(index, 1);

        return {
          ...prevProduct,
          imageUrls: updatedImageUrls,
          removedImages: [...prevProduct.removedImages, imageUrl],
        };
      });

      setMessage({ type: 'success', text: 'Image removed successfully!' });
    } catch (err) {
      console.error('Error deleting image from Cloudinary:', err);
      setMessage({ type: 'error', text: 'Failed to remove image. Please try again.' });
    }
  };

  const generateCloudinarySignature = async (publicId) => {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5174'}/upload/signature`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ publicId }),
      }
    );
    const data = await response.json();
    return data.signature;
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