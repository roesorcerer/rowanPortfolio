import { useState } from "react";
import logo1 from "../public/assets/menuopen.png";
import logo2 from "../public/assets/menuclose.png";
import {navLinks} from "../constants/index.ts"

{/**Nav Items for Nav Bar pulling from Index from Contastants using map */}
const NavItems = () => {
  return (
    <ul className="nav-ul">
      
      {navLinks.map(({id, href, name }) => (
        <li key={id} className="nav-li">
          <a href={href} className="nav-li_a" onClick={() => {}}>
            {name}
          </a>
        </li>
      ))}

    </ul>
  )
}

{/**Navbar handling toggling  */}
const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen((prevIsOpen) => !prevIsOpen);

  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/90">{/**Header for Navbar */}
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center py-5 mx-auto c-space">
        <a
          href="/"
          className="text-neutral-400 font-bold text-xl hover:text-white transition-colors"
        >{/**Name as Logo  */}
          Rowan
        </a>
        <button 
          onClick={toggleMenu}
          className="text-neutral-400 hover:text-white-500 focus:outline-none sm:hidden flex"
          aria-label="toggle menu"
        >{/**Button for mobile coffee mug/glass  */}
          <img
            src={isOpen ? logo1 : logo2}
            alt="toggle"
            className="w-6 h-6 object-contain"
          />
        </button>

        <nav className="sm:flex hidden">{/**If mobile menu hidden show nav items  */}
          <NavItems/>
        </nav>
        </div>
      </div>

    <div className={`nav-sidebar ${isOpen ? 'max-h-screen' : 'max-h-0'}`}>
    <nav className="p-5">
      <NavItems />
    </nav>
    </div>

    </header>
  );
};

export default Navbar;
