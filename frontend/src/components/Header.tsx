import '../index.css'
import { Link } from 'react-router-dom'

// Redesigned Header - Eudaimonic minimal style with teal accent
// Clean, warm, purposeful navigation. Padding and link gap step up at md:.

function Navigation() {
  return (
    <header className="px-5 md:px-10 py-6 md:py-7 flex justify-between items-center bg-paper lg:w-full">
      <div className="flex items-center gap-3">
        <Link to="/admin/login" aria-label="Admin login">
          <img
            src="/assets/justme.jpg"
            alt="Rowan Stratton"
            className="w-8 h-10 object-cover rounded-[50%] border border-rule hover:border-accent transition-colors"
          />
        </Link>
        <Link
          to="/"
          className="text-ink font-medium text-base tracking-tight hover:text-accent-dark transition-colors"
        >
          Rowan Stratton
        </Link>
      </div>

      {/* Root-relative hashes, not bare "#about": the header also renders on
          project permalinks, where those sections aren't on the page. */}
      <nav className="flex gap-6 md:gap-8 text-sm">
        <a
          href="/"
          className="text-accent-dark hover:text-accent-darker transition-colors"
        >
          Work
        </a>
        <a
          href="/#about"
          className="text-body hover:text-ink transition-colors"
        >
          About
        </a>
        <a
          href="/#contact"
          className="text-body hover:text-ink transition-colors"
        >
          Contact
        </a>
      </nav>
    </header>
  );
}

export default Navigation;
