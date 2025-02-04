import React, { useState, useEffect } from "react";
import { assets } from "../../assets/assets";
import { Link, useNavigate, useLocation } from "react-router-dom";
import CartIcon from "./CartIcon";
import AuthButtons from "./AuthButtons";
import UserMenu from "./UserMenu";

const Navbar = ({ cartItems }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSeller, setIsSeller] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchHistory, setSearchHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    setIsLoggedIn(!!user);
    setIsSeller(user?.role === "seller");
    setIsAdmin(user?.role === "admin");

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    const handleResize = () => {
      if (window.innerWidth >= 768) setIsMenuOpen(false);
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/collection?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchHistory((prev) => {
        const updatedHistory = [
          searchQuery.trim(),
          ...prev.filter((q) => q !== searchQuery.trim()),
        ];
        return updatedHistory.slice(0, 5);
      });
      setSearchQuery("");
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL || "http://localhost:5174"}/auth/log-out`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      if (response.ok) {
        localStorage.removeItem("user");
        localStorage.removeItem("isSeller");
        setIsLoggedIn(false);
        setIsSeller(false);
        navigate("/");
        window.location.reload();
      } else {
        console.error("Logout failed with status:", response.status);
      }
    } catch (error) {
      console.error("An error occurred during logout:", error);
    }
  };

  const handleHistoryClick = (query) => {
    navigate(`/collection?search=${encodeURIComponent(query)}`);
    setSearchQuery("");
    setShowHistory(false);
  };
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className="relative">
      {/* Main Navbar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-100 transition-all duration-300 ${
          isScrolled ? "py-3" : "py-4"
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-12">
            {/* Left Section */}
            <div className="flex items-center">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 mr-2"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>

              {/* Logo */}
              <Link
                to={isSeller ? "/seller" : "/"}
                className="flex items-center space-x-2"
              >
                <img
                  src={assets.logo}
                  alt="Logo"
                  className="w-10 h-10 transition-transform duration-300 hover:scale-105"
                />
                <span className="text-xl font-bold text-gray-800 hidden sm:block">
                  Nepali Hastakala
                </span>
              </Link>
            </div>

            {/* Middle Section - Search (Desktop) */}
            {location.pathname === "/" && (
              <div className="hidden md:block flex-1 max-w-2xl mx-8">
                <form onSubmit={handleSearch}>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => setShowHistory(true)}
                      className="w-full px-5 py-2.5 rounded-full border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 outline-none transition-all"
                    />
                    <button
                      type="submit"
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-gray-50 rounded-full"
                    >
                      <svg
                        className="w-5 h-5 text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </button>
                  </div>
                </form>

                {/* Search History Dropdown */}
                {showHistory && searchHistory.length > 0 && (
                  <div className="absolute mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                    <div className="px-4 py-2.5 border-b border-gray-100 bg-gray-50">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Recent Searches
                      </span>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {searchHistory.map((query, index) => (
                        <button
                          key={index}
                          onClick={() => handleHistoryClick(query)}
                          className="block w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 text-left"
                        >
                          {query}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Right Section */}
            <div className="flex items-center space-x-4">
              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-5">
                <Link
                  to="/"
                  className="text-gray-600 hover:text-indigo-600 transition-colors font-medium text-sm"
                >
                  Home
                </Link>
                {!isSeller && !isAdmin && (
                  <Link
                    to="/collection"
                    className="text-gray-600 hover:text-indigo-600 transition-colors font-medium text-sm"
                  >
                    Shop
                  </Link>
                )}
                <Link
                  to="/contact"
                  className="text-gray-600 hover:text-indigo-600 transition-colors font-medium text-sm"
                >
                  Contact
                </Link>
              </div>

              {/* User Actions */}
              <div className="flex items-center space-x-3">
                {isLoggedIn ? (
                  <UserMenu
                    isLoggedIn={isLoggedIn}
                    handleLogout={handleLogout}
                  />
                ) : (
                  <AuthButtons handleNavigateToLogin={() => navigate("/login")} />
                )}

                {/* Cart Icon */}
                {!isSeller && !isAdmin && <CartIcon cartCount={cartCount} />}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 md:hidden ${
          isMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsMenuOpen(false)}
      >
        <div
          className={`absolute right-0 top-0 h-full w-64 bg-white shadow-xl transform transition-transform duration-300 ${
            isMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-semibold text-gray-800">Menu</span>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Mobile Search */}
            {location.pathname === "/" && (
              <div className="mb-4">
                <form onSubmit={handleSearch}>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    />
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Mobile Navigation Links */}
          <div className="p-4 space-y-3">
            <Link
              to="/"
              onClick={() => setIsMenuOpen(false)}
              className="block px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-700 font-medium"
            >
              Home
            </Link>
            {!isSeller && !isAdmin && (
              <Link
                to="/collection"
                onClick={() => setIsMenuOpen(false)}
                className="block px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-700 font-medium"
              >
                Shop
              </Link>
            )}
            <Link
              to="/contact"
              onClick={() => setIsMenuOpen(false)}
              className="block px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-700 font-medium"
            >
              Contact
            </Link>

            {/* Mobile Auth/Cart */}
            <div className="pt-4 border-t border-gray-100">
              {!isLoggedIn ? (
                <AuthButtons
                  mobileView
                  handleNavigateToLogin={() => {
                    navigate("/login");
                    setIsMenuOpen(false);
                  }}
                />
              ) : (
                <button
                  onClick={handleLogout}
                  className="w-full px-3 py-2 text-left rounded-lg hover:bg-gray-50 text-red-600 font-medium"
                >
                  Log Out
                </button>
              )}

              {!isSeller && !isAdmin && (
                <div className="mt-3">
                  <CartIcon
                    mobileView
                    cartCount={cartCount}
                    onClick={() => setIsMenuOpen(false)}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
