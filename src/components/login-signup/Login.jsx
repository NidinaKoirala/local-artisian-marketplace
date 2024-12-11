import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5174';

const Login = ({ setIsLoggedIn, setRole }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${backendUrl}/auth/log-in`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Login failed. Please check your credentials.');
      }

      const data = await response.json();
      const { user, token } = data;

      if (!token) {
        throw new Error('No token received. Authentication failed.');
      }
      // Save token and user details to localStorage
      localStorage.setItem('token', token);
      localStorage.setItem(
        'user',
        JSON.stringify({
          id: user.id,
          fullName: `${user.firstName || ''} ${user.middleName || ''} ${user.lastName || ''}`.trim(),
          email: user.email,
          role: user.role,
        })
      );

      setIsLoggedIn(true);
      setRole(user.role);
      localStorage.setItem('isSeller', user.role === 'seller'); // Save isSeller as "true" or "false"  
      localStorage.setItem('isAdmin', user.role === 'admin'); // Save isAdmin as "true" or "false"
      // Redirect based on role
      if (user.role === 'admin') {
        navigate('/');
        window.location.reload(); // Refresh the page to apply changes
      } else if (user.role === 'seller') {
        navigate('/');
        window.location.reload(); // Refresh the page to apply changes
      } else {
        const redirectTo = location.state?.redirectTo || '/';
        navigate(redirectTo);
        window.location.reload(); // Refresh the page to apply changes
      }

      window.scrollTo(0, 0);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="p-8 bg-white rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-3xl font-semibold text-gray-800 mb-6 text-center">Login</h2>

        <form onSubmit={handleSubmit}>
          <label className="block text-gray-600 mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter your email"
            required
          />

          <label className="block text-gray-600 mb-2">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 mb-6 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter your password"
            required
          />

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          <button
            type="submit"
            className="w-full py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-500 transition-colors"
          >
            Log In
          </button>
        </form>

        <p className="text-gray-500 text-sm mt-4 text-center">
          Don’t have an account?{' '}
          <Link to="/signup" className="text-indigo-600 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
