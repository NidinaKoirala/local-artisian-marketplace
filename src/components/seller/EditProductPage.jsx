import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const EditProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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
        toast.error(err.message);
        navigate('/seller');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProduct((prevProduct) => ({ ...prevProduct, [name]: value }));
  };

  const handleImageUpload = async (files) => {
    setIsUploading(true);
    const toastId = toast.loading('Uploading images...', { autoClose: false });

    try {
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

        const response = await axios.post(
          `https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/image/upload`,
          formData
        );

        if (response.data.secure_url) {
          uploadedImages.push(response.data.secure_url);
        }
      }

      setProduct((prevProduct) => ({
        ...prevProduct,
        imageUrls: [...prevProduct.imageUrls, ...uploadedImages],
      }));

      toast.update(toastId, {
        render: 'Images uploaded successfully!',
        type: 'success',
        isLoading: false,
        autoClose: 3000
      });
    } catch (err) {
      console.error('Error uploading image:', err);
      toast.update(toastId, {
        render: 'Error uploading images. Please try again.',
        type: 'error',
        isLoading: false,
        autoClose: 3000
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImageUrl = async (index) => {
    const imageUrl = product.imageUrls[index];
    const toastId = toast.loading('Removing image...', { autoClose: false });

    try {
      const publicId = imageUrl.split('/').pop().split('.')[0];
      await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/image/destroy`,
        {
          public_id: publicId,
          api_key: cloudinaryApiKey,
          timestamp: Math.round(Date.now() / 1000),
          signature: await generateCloudinarySignature(publicId),
        }
      );

      setProduct((prevProduct) => {
        const updatedImageUrls = [...prevProduct.imageUrls];
        updatedImageUrls.splice(index, 1);
        return {
          ...prevProduct,
          imageUrls: updatedImageUrls,
          removedImages: [...prevProduct.removedImages, imageUrl],
        };
      });

      toast.update(toastId, {
        render: 'Image removed successfully!',
        type: 'success',
        isLoading: false,
        autoClose: 3000
      });
    } catch (err) {
      console.error('Error deleting image:', err);
      toast.update(toastId, {
        render: 'Failed to remove image. Please try again.',
        type: 'error',
        isLoading: false,
        autoClose: 3000
      });
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
    setIsSaving(true);
    const toastId = toast.loading('Saving changes...', { autoClose: false });

    try {
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

      if (!response.ok) throw new Error('Failed to update product');

      toast.update(toastId, {
        render: 'Product updated successfully!',
        type: 'success',
        isLoading: false,
        autoClose: 3000
      });

      setTimeout(() => navigate('/seller'), 2000);
    } catch (err) {
      toast.update(toastId, {
        render: `Error: ${err.message}`,
        type: 'error',
        isLoading: false,
        autoClose: 3000
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <ToastContainer position="top-right" autoClose={3000} />
      <h1 className="text-2xl font-semibold mb-4">Edit Product</h1>
      
      <div className="bg-white shadow-lg rounded-lg p-6 space-y-4">
        <label className="block text-gray-700">Title</label>
        <input
          type="text"
          name="title"
          value={product.title || ''}
          onChange={handleInputChange}
          className="w-full border border-gray-300 rounded-lg p-2"
        />

        <label className="block text-gray-700">Price</label>
        <input
          type="number"
          name="price"
          value={product.price || ''}
          onChange={handleInputChange}
          className="w-full border border-gray-300 rounded-lg p-2"
        />

        <label className="block text-gray-700">Stock</label>
        <input
          type="number"
          name="inStock"
          value={product.inStock || ''}
          onChange={handleInputChange}
          className="w-full border border-gray-300 rounded-lg p-2"
        />

        <label className="block text-gray-700">Description</label>
        <textarea
          name="description"
          value={product.description || ''}
          onChange={handleInputChange}
          className="w-full border border-gray-300 rounded-lg p-2"
        ></textarea>

        <label className="block text-gray-700">Upload New Images</label>
        <div className="flex items-center gap-2">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => handleImageUpload(e.target.files)}
            className="mb-2"
            disabled={isUploading}
          />
          {isUploading && (
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
          )}
        </div>

        <label className="block text-blue-600 font-bold">Existing Photos</label>
        <div className="flex flex-wrap gap-2">
          {product.imageUrls.map((url, index) => (
            <div key={index} className="flex flex-col items-center">
              <img
                src={url}
                alt="Product preview"
                className="w-20 h-20 object-cover border rounded-lg"
              />
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

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors disabled:bg-green-300 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Saving...
            </div>
          ) : (
            'Save Changes'
          )}
        </button>
      </div>
    </div>
  );
};

export default EditProductPage;
