import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./components/home/HomePage";
import Cart from "./components/cart/Cart";
import Collection from "./components/collection/Collection";
import About from "./components/details/AboutUs";
import Contact from "./components/details/Contact";
import Login from "./components/login-signup/Login";
import BuyerSignup from "./components/login-signup/BuyerSignUp";
import SellerSignup from "./components/login-signup/SellerSignup";
import PlaceOrder from "./components/order/PlaceOrder";
import "./index.css";
import Navbar from "./components/nav-bar/Navbar";
import Footer from "./components/footer/Footer";
import NotFoundPage from "./components/home/NotFoundPage";
import UserProfile from "./components/userprofile/UserProfile";
import ProductPage from "./components/products/ProductPage";
import Chatbot from "./components/chatbot/Chatbot";
import SearchResults from "./components/other/SearchResults";
import SellerPage from "./components/seller/SellerPage";
import SellerOrders from "./components/seller/SellerOrders";
import AddProductPage from "./components/products/AddProductPage";
import CategoryPage from "./components/collection/CategoryPage";
import AllReviews from "./components/products/AllReviews";
import EditProductPage from "./components/seller/EditProductPage";
import AdminDashboard from "./components/admin/AdminDashboard";
import ManageUsers from "./components/admin/ManageUsers";
import ManageProducts from "./components/admin/ManageProducts";
import ManageSellers from "./components/admin/ManageSellers";
import AccessDenied from "./AccessDenied";
import PrivateRoute from "./PrivateRoute";
import SellerProductsPage from './components/seller/SellerProductsPage';
import ManageOrders from "./components/admin/ManageOrders";
import ManageCategories from "./components/admin/ManageCategories";
const App = () => {
  const [cartItems, setCartItems] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");

    if (storedUser && token) {
      setIsLoggedIn(true);
      setRole(storedUser.role);
    } else {
      setIsLoggedIn(false);
      setRole(null);
    }
    setIsLoading(false);
  }, []);

  const addToCart = (product) => {
    setCartItems((prevItems) => {
      const isProductInCart = prevItems.find((item) => item.id === product.id);
      if (isProductInCart) {
        return prevItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevItems, { ...product, quantity: 1 }];
    });
  };

  const handleAddProduct = (newProduct) => {
    // Placeholder function for adding a product
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]">
      <Navbar cartItems={cartItems || []} />
      <main className="main-content">
        <Routes>
          {/* Home */}
          <Route
            path="/"
            element={
              role === "admin" ? (
                <Navigate to="/admin/dashboard" replace />
              ) : role === "seller" ? (
                <Navigate to="/seller" replace />
              ) : (
                <HomePage addToCart={addToCart} />
              )
            }
          />

          {/* Public Routes */}
          <Route
            path="/cart"
            element={
              <Cart cartItems={cartItems} setCartItems={setCartItems} />
            }
          />
          <Route path="/collection" element={<Collection addToCart={addToCart} />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/seller/:sellerId" element={<SellerProductsPage />} />
          <Route
            path="/product/:productName/:productId"
            element={
              <ProductPage
                addToCart={addToCart}
                cartItems={cartItems}
                setCartItems={setCartItems}
                isLoggedIn={isLoggedIn}
              />
            }
          />
          <Route path="/category/:category" element={<CategoryPage />} />
          <Route
            path="/login"
            element={<Login setIsLoggedIn={setIsLoggedIn} setRole={setRole} />}
          />
          <Route path="/signup/user" element={<BuyerSignup />} />
          <Route path="/signup/seller" element={<SellerSignup />} />

          {/* Protected Routes */}
          <Route
            path="/place-order"
            element={
              isLoggedIn ? (
                <PlaceOrder cartItems={cartItems} />
              ) : (
                <Navigate to="/login" state={{ redirectTo: "/place-order" }} />
              )
            }
          />
          <Route path="/profile" element={<UserProfile />} />

          {/* Seller Routes */}
          <Route path="/seller" element={<SellerPage />} />
          <Route path="/seller/orders" element={<SellerOrders />} />
          <Route
            path="/seller/add-product"
            element={<AddProductPage onAddProduct={handleAddProduct} />}
          />
          <Route
            path="/product/:productName/:productId/all-reviews"
            element={<AllReviews />}
          />
          <Route path="/products/:id/edit" element={<EditProductPage />} />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <PrivateRoute allowedRoles={["admin"]} userRole={role}>
                <AdminDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <PrivateRoute allowedRoles={["admin"]} userRole={role}>
                <ManageUsers />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/products"
            element={
              <PrivateRoute allowedRoles={["admin"]} userRole={role}>
                <ManageProducts />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/sellers"
            element={
              <PrivateRoute allowedRoles={["admin"]} userRole={role}>
                <ManageSellers />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <PrivateRoute allowedRoles={["admin"]} userRole={role}>
                <ManageOrders />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/categories"
            element={
              <PrivateRoute allowedRoles={["admin"]} userRole={role}>
                <ManageCategories />
              </PrivateRoute>
            }
          />          
          {/* Access Denied */}
          <Route path="/access-denied" element={<AccessDenied />} />

          {/* Fallback */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
      <Chatbot />
    </div>
  );
};

export default App;
