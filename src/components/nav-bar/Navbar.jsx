import React, { useState, useEffect } from "react";
import { assets } from "../../assets/assets";
import { Link, useNavigate } from "react-router-dom";
import NavItems from "./NavItems";
import CartIcon from "./CartIcon";
import AuthButtons from "./AuthButtons";
import UserMenu from "./UserMenu";

const Navbar = ({ cartItems }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSeller, setIsSeller] = useState(false);
  const navigate = useNavigate();

  const navbarBackgroundColor = "bg-[#d2cff9]";

  const navItems = [
    { to: "/", label: "HOME" },
    { to: "/collection", label: "COLLECTION" },
    { to: "/about", label: "ABOUT" },
    { to: "/contact", label: "CONTACT" },
  ];

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    setIsLoggedIn(!!user);
    setIsSeller(localStorage.getItem("isSeller") === "true");

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavigateToLogin = (redirectTo) => {
    navigate("/login", { state: { redirectTo } });
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

  // Dynamically calculate cart count based on items passed as a prop
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className="relative">
      <div
        className={`navbar fixed top-0 left-0 right-0 z-50 ${navbarBackgroundColor} transition-all duration-300 shadow-md ${
          isScrolled ? "h-16 py-0" : "h-20 py-3"
        }`}
      >
        <div className="container mx-auto flex items-center justify-between px-4 md:px-6 lg:px-8">
          {/* Left Section - Logo, always on the left */}
          <Link to={isSeller ? "/seller" : "/"} className="flex-shrink-0">
            <img
              src={assets.logo}
              className={`w-12 h-auto md:w-16 ${isScrolled ? "hidden md:block" : ""}`}
              alt="Logo"
            />
          </Link>

          {/* Centered Navigation Items - Hidden on smaller screens */}
          <div className="hidden md:flex flex-grow justify-center">
            <NavItems navItems={navItems} isSeller={isSeller} />
          </div>

          {/* Right Section - AuthButtons/UserMenu and CartIcon */}
          <div className="flex items-center gap-0 md:gap-4">
            {isLoggedIn ? (
              <UserMenu isLoggedIn={isLoggedIn} handleLogout={handleLogout} />
            ) : (
              <div className="hidden md:flex space-x-2">
                <AuthButtons handleNavigateToLogin={handleNavigateToLogin} />
              </div>
            )}

            {/* Cart Icon */}
            <CartIcon cartCount={cartCount} />
          </div>
        </div>

        {/* Auth and Navigation Items for smaller screens */}
        <div
          className={`md:hidden flex flex-col items-center ${
            isScrolled ? "-mt-1 space-y-4" : "-mt-8 space-y-3"
          }`}
        >
          {/* Conditionally render AuthButtons based on scroll */}
          {!isScrolled && !isLoggedIn && (
            <AuthButtons handleNavigateToLogin={handleNavigateToLogin} />
          )}
          <NavItems navItems={navItems} isSeller={isSeller} />
        </div>
      </div>
    </div>
  );
};

export default Navbar;
