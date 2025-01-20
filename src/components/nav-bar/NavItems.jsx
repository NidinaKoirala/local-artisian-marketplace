import { NavLink, useLocation } from "react-router-dom";

const NavItems = ({ navItems, isSeller }) => {
  const location = useLocation();

  if (isSeller) {
    // Return null or an empty fragment for sellers to prevent rendering buyer-specific navigation
    return null;
  }

  return (
    <ul className="flex gap-3 sm:gap-6 items-center text-xs sm:text-sm md:text-base font-medium">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `relative flex items-center transition-colors duration-200 ${
              isActive ? "font-semibold text-black" : "text-gray-700"
            }`
          }
        >
          <p>{item.label}</p>
          <span
            className={`absolute bottom-[-2px] left-0 right-0 h-[2px] mx-auto bg-black transition-transform duration-300 ${
              location.pathname === item.to ? "scale-x-100" : "scale-x-0"
            }`}
            style={{ width: "50%", transformOrigin: "center" }}
          ></span>
        </NavLink>
      ))}
    </ul>
  );
};

export default NavItems;