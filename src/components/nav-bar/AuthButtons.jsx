import { Link } from "react-router-dom";

const AuthButtons = ({ handleNavigateToLogin }) => {
  return (
    <div className="flex flex-row gap-2 items-center">
      <button
        onClick={handleNavigateToLogin}
        className="text-xs sm:text-sm text-black transition-colors hover:text-gray-700"
      >
        Login
      </button>
      <Link
        to="/signup/user"
        className="text-xs sm:text-sm text-black transition-colors hover:text-gray-700"
      >
        Signup as Buyer
      </Link>
      <Link
        to="/signup/seller"
        className="text-xs sm:text-sm text-black transition-colors hover:text-gray-700"
      >
        Signup as Seller
      </Link>
    </div>
  );
};

export default AuthButtons;
