import '../index.css'
import { Link } from 'react-router-dom'

// Redesigned Header - Eudaimonic minimal style with teal accent
// Clean, warm, purposeful navigation. Padding and link gap step up at md:.

function Navigation() {
  return (
    <header className="px-5 md:px-10 py-6 md:py-7 flex justify-between items-center bg-[#FAF9F7] lg:w-full">
      <div className="flex items-center gap-3">
        <Link to="/admin/login" aria-label="Admin login">
          <img
            src="/assets/justme.jpg"
            alt="Rowan Stratton"
            className="w-8 h-10 object-cover rounded-[50%] border border-[#E8E6E1] hover:border-[#1D9E75] transition-colors"
          />
        </Link>
        <Link
          to="/"
          className="text-[#2C2C2A] font-medium text-base tracking-tight hover:text-[#0F6E56] transition-colors"
        >
          Rowan Stratton
        </Link>
      </div>

      <nav className="flex gap-6 md:gap-8 text-sm">
        <a
          href="/"
          className="text-[#0F6E56] hover:text-[#085041] transition-colors"
        >
          Work
        </a>
        <a
          href="#about"
          className="text-[#5F5E5A] hover:text-[#2C2C2A] transition-colors"
        >
          About
        </a>
        <a
          href="#contact"
          className="text-[#5F5E5A] hover:text-[#2C2C2A] transition-colors"
        >
          Contact
        </a>
      </nav>
    </header>
  );
}

export default Navigation;
