import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const Signup = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('user');
  const [shopName, setShopName] = useState('');
  const [address, setAddress] = useState('');
  const [vehicle, setVehicle] = useState('');
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const roleSpecificData = {
      seller: { shopName, address },
      buyer: { address },
      deliverer: { vehicle },
    };

    const requestBody = {
      username,
      email,
      password,
      role,
      ...(role !== 'user' && roleSpecificData[role]),
    };

    try {
      const response = await fetch(`${backendUrl}/auth/sign-up`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const responseText = await response.text();
        console.error('Response body:', responseText);
        throw new Error('Signup failed. Please try again.');
      }

      setShowSuccess(true);
      setUsername('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setRole('user');
      setShopName('');
      setAddress('');
      setVehicle('');
      setError('');
    } catch (err) {
      console.error('Signup Error:', err.message);
      setError(err.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Create an Account</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          {/* Common Fields */}
          <label className="block text-gray-600 mb-2">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2 border rounded-md text-gray-700 mb-4"
            placeholder="Choose a username"
            required
          />
          <label className="block text-gray-600 mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border rounded-md text-gray-700 mb-4"
            placeholder="Enter your email"
            required
          />
          <label className="block text-gray-600 mb-2">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-md text-gray-700 mb-4"
            placeholder="Create a password"
            required
          />
          <label className="block text-gray-600 mb-2">Confirm Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-md text-gray-700 mb-6"
            placeholder="Confirm your password"
            required
          />
          <label className="block text-gray-600 mb-2">Select Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-4 py-2 border rounded-md text-gray-700 mb-4"
          >
            <option value="user">Guest</option>
            <option value="seller">Seller</option>
            <option value="buyer">Buyer</option>
            <option value="deliverer">Deliverer</option>
          </select>

          {/* Role-Specific Fields */}
          {role === 'seller' && (
            <>
              <label className="block text-gray-600 mb-2">Shop Name</label>
              <input
                type="text"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                className="w-full px-4 py-2 border rounded-md text-gray-700 mb-4"
                placeholder="Enter shop name"
                required
              />
              <label className="block text-gray-600 mb-2">Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-4 py-2 border rounded-md text-gray-700 mb-4"
                placeholder="Enter address"
                required
              />
            </>
          )}
          {role === 'buyer' && (
            <>
              <label className="block text-gray-600 mb-2">Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-4 py-2 border rounded-md text-gray-700 mb-4"
                placeholder="Enter address"
                required
              />
            </>
          )}
          {role === 'deliverer' && (
            <>
              <label className="block text-gray-600 mb-2">Vehicle</label>
              <input
                type="text"
                value={vehicle}
                onChange={(e) => setVehicle(e.target.value)}
                className="w-full px-4 py-2 border rounded-md text-gray-700 mb-4"
                placeholder="Enter vehicle details"
                required
              />
            </>
          )}

          <button
            type="submit"
            className="w-full py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-500"
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
