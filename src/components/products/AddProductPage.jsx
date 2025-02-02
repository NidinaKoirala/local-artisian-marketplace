import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AddProductPage = () => {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [stock, setStock] = useState('');
  const [imageUrls, setImageUrls] = useState([]);
  const [error, setError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate();
  const imgbbApiKey = import.meta.env.VITE_IMGBB_API_KEY;

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5174'}/categories`);
        if (!response.ok) throw new Error('Failed to fetch categories');
        const data = await response.json();
        setCategories(data);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  const handleImageUpload = async (files) => {
    setIsUploading(true);
    setPopupMessage('Uploading images...');
    setShowPopup(true);
  
    const uploadedImages = [];
    for (let file of files) {
      const formData = new FormData();
      formData.append('image', file);
  
      try {
        const response = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbApiKey}`, {
          method: 'POST',
          body: formData,
        });
        const data = await response.json();
  
        if (data.success) {
          uploadedImages.push(data.data.url);
        } else {
          setPopupMessage('Image upload failed for one or more files. Please try again.');
          setShowPopup(true);
        }
      } catch (err) {
        console.error('Error uploading image:', err);
        setPopupMessage('Error uploading one or more images. Please try again.');
        setShowPopup(true);
      }
    }
  
    setIsUploading(false);
    setImageUrls((prev) => [...prev, ...uploadedImages]); // Append new images to the existing ones
    setPopupMessage('Images uploaded successfully!');
    setShowPopup(true);
  };
  

  const handleAddProduct = async (e) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem('user'));
    const sellerId = user?.id;
    if (!sellerId) {
      setPopupMessage('Unauthorized: Seller not logged in');
      setShowPopup(true);
      return;
    }
  
    if (imageUrls.length === 0) {
      setPopupMessage('Please upload at least one image.');
      setShowPopup(true);
      return;
    }
  
    setPopupMessage('Adding Product...');
    setShowPopup(true);
  
    const finalCategory = category === 'add-new' ? newCategory : category;
    const newProduct = {
      title,
      price,
      description,
      category: finalCategory,
      stock,
      imageUrls, // ✅ Ensuring all images are sent
      sellerId,
    };
  
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5174'}/products/add`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newProduct),
        }
      );
  
      if (!response.ok) {
        throw new Error('Failed to add product');
      }
  
      setPopupMessage('Product added successfully!');
      setShowPopup(true);
  
      // ✅ Clear fields & uploaded images
      setTitle('');
      setPrice('');
      setDescription('');
      setCategory('');
      setNewCategory('');
      setStock('');
      setImageUrls([]);
  
    } catch (err) {
      console.error('Error adding product:', err);
      setPopupMessage('Failed to add product. Please try again.');
      setShowPopup(true);
    }
  };
  
  const closeModalAndRedirect = () => {
    setShowSuccessModal(false);
    navigate('/seller');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg">
        <h2 className="text-3xl font-semibold mb-6 text-center">Add New Product</h2>
        {showPopup && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
    <div className="bg-white p-6 rounded-lg shadow-lg text-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
      <p className="text-lg font-semibold">{popupMessage}</p>
      <button onClick={() => setShowPopup(false)} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg">OK</button>
    </div>
  </div>
)}
        <form onSubmit={handleAddProduct} className="space-y-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-indigo-500" required />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Price</label>
            <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-indigo-500" required />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-indigo-500" required />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-indigo-500">
              <option value="">Select a category</option>
              {categories.map((cat, index) => (
                <option key={index} value={cat}>{cat}</option>
              ))}
              <option value="add-new">Add New Category</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Stock</label>
            <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-indigo-500" required />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Upload Image</label>
            <input type="file" accept="image/*" multiple onChange={(e) => handleImageUpload(e.target.files)} />
            </div>
          <div className="flex justify-between">
            <button type="button" onClick={() => navigate('/seller')} className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500" disabled={isUploading}>Add Product</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductPage;
