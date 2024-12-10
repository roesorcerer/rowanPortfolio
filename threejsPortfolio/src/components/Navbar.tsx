import { useState } from "react";
import logo1 from "../public/assets/menuopen.png";
import logo2 from "../public/assets/menuclose.png";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen((prevIsOpen) => !prevIsOpen);
  };

  return (
    <header className="fixed to top-0 left-0 right-0 z-50 bg-black/50">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center py-5 mx-auto c-space"></div>
        <a
          href="/"
          className="text-neutral-400 font-bold text-xl hover:text-white transition-colors"
        >
          Rowan
        </a>
        <button
          onClick={toggleMenu}
          className="text-neutral-400 hover:text-white-500 focus:outline-none sm:hidden flex"
          aria-label="toggle menu"
        >
          <img
            src={isOpen ? logo1 : logo2}
            alt="toggle"
            className="w-6 h-6 object-contain"
          />
        </button>
      </div>
    </header>
  );
};

export default Navbar;
