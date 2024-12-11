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
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    setIsLoggedIn(!!user);
    setIsSeller(localStorage.getItem("isSeller") === "true");
    setIsAdmin(localStorage.getItem("isAdmin") === "true");

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
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
      <div
        className={`navbar fixed top-0 left-0 right-0 z-50 bg-white shadow-lg transition-all duration-300 ${
          isScrolled ? "py-2" : "py-4"
        }`}
      >
        <div className="container mx-auto flex items-center justify-between px-6">
          {/* Logo Section */}
          <Link to={isSeller ? "/seller" : "/"} className="flex items-center">
            <img
              src={assets.logo}
              alt="Logo"
              className={`w-12 h-12 transition-transform duration-300 ${
                isScrolled ? "scale-90" : ""
              }`}
            />
            <span className="ml-2 text-lg font-bold text-gray-800 hidden sm:block">
              Nepali
              Hastakala
            </span>
          </Link>

          {/* Search Bar Section (visible only on homepage) */}
          {location.pathname === "/" && (
            <div className="relative flex-grow mx-6">
              <form onSubmit={handleSearch}>
                <input
                  type="text"
                  placeholder="Search for products, categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setShowHistory(true)}
                  className="w-full py-2 px-4 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </form>
              {showHistory && searchHistory.length > 0 && (
                <div
                  className="absolute mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg"
                  onMouseLeave={() => setShowHistory(false)}
                >
                  <p className="px-3 py-2 text-xs font-semibold text-gray-500 border-b">
                    Search History
                  </p>
                  {searchHistory.map((query, index) => (
                    <button
                      key={index}
                      onClick={() => handleHistoryClick(query)}
                      className="block w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-100"
                    >
                      {query}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Navigation and Actions Section */}
          <div className="flex items-center gap-6">
            <nav className="hidden md:flex items-center gap-4">
              <Link
                to="/"
                className="text-gray-700 font-medium hover:text-indigo-600 transition-colors"
              >
                Home
              </Link>
              {!isSeller && !isAdmin && (
                <Link
                  to="/collection"
                  className="text-gray-700 font-medium hover:text-indigo-600 transition-colors"
                >
                  Shop
                </Link>
              )}
              <Link
                to="/contact"
                className="text-gray-700 font-medium hover:text-indigo-600 transition-colors"
              >
                Contact
              </Link>
            </nav>

            {/* User Actions */}
            {isLoggedIn ? (
              <UserMenu isLoggedIn={isLoggedIn} handleLogout={handleLogout} />
            ) : (
            <AuthButtons handleNavigateToLogin={() => navigate("/login")} />
            )}

            {/* Cart Icon */}
            {!isSeller && !isAdmin && <CartIcon cartCount={cartCount} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
