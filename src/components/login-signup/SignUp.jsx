import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5174';

const Signup = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
  });
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate password and confirm password match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const response = await fetch(`${backendUrl}/auth/sign-up`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Signup failed. Please try again.');
      }

      const data = await response.json();
      console.log('Signup successful:', data);

      // Show success message and reset form fields
      setShowSuccess(true);
      setFormData({
        firstName: '',
        middleName: '',
        lastName: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        phoneNumber: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
      });
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-lg w-full">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Create an Account</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <label className="block text-gray-600 mb-2">First Name</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md text-gray-700 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />

          <label className="block text-gray-600 mb-2">Middle Name (Optional)</label>
          <input
            type="text"
            name="middleName"
            value={formData.middleName}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md text-gray-700 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <label className="block text-gray-600 mb-2">Last Name</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md text-gray-700 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />

          <label className="block text-gray-600 mb-2">Username</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md text-gray-700 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />

          <label className="block text-gray-600 mb-2">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md text-gray-700 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />

          <label className="block text-gray-600 mb-2">Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md text-gray-700 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />

          <label className="block text-gray-600 mb-2">Confirm Password</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md text-gray-700 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />

          <label className="block text-gray-600 mb-2">Phone Number</label>
          <input
            type="text"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md text-gray-700 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <label className="block text-gray-600 mb-2">Address Line 1</label>
          <input
            type="text"
            name="addressLine1"
            value={formData.addressLine1}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md text-gray-700 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />

          <label className="block text-gray-600 mb-2">Address Line 2 (Optional)</label>
          <input
            type="text"
            name="addressLine2"
            value={formData.addressLine2}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md text-gray-700 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <label className="block text-gray-600 mb-2">City</label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md text-gray-700 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />

          <label className="block text-gray-600 mb-2">State</label>
          <input
            type="text"
            name="state"
            value={formData.state}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md text-gray-700 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />

          <label className="block text-gray-600 mb-2">Postal Code</label>
          <input
            type="text"
            name="postalCode"
            value={formData.postalCode}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md text-gray-700 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />

          <label className="block text-gray-600 mb-2">Country</label>
          <input
            type="text"
            name="country"
            value={formData.country}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md text-gray-700 mb-6 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />

          <button
            type="submit"
            className="w-full py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-500 transition-colors"
          >
            Sign Up
          </button>
        </form>
        <p className="text-gray-500 text-sm mt-4 text-center">
          Already have an account? <Link to="/login" className="text-indigo-600 hover:underline">Log in</Link>
        </p>
      </div>

      {showSuccess && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full text-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">User created successfully!</h3>
            <p className="text-gray-600 mb-4">Please go to the login page to log in.</p>
            <Link to="/login" className="text-indigo-600 hover:underline font-medium">Go to Login</Link>
            <button
              onClick={() => setShowSuccess(false)}
              className="mt-4 py-2 px-4 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-500 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Signup;
