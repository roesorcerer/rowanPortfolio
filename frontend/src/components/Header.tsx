import '../index.css'
import useBreakpoint from '../utils/ScreenSize'

// Redesigned Header - Eudaimonic minimal style with teal accent
// Clean, warm, purposeful navigation

function NavigationMobile() {
  return (
    <header className="px-5 py-6 flex justify-between items-center bg-[#FAF9F7]">
      <a 
        href="/" 
        className="text-[#2C2C2A] font-medium text-base tracking-tight hover:text-[#0F6E56] transition-colors"
      >
        Rowan Stratton
      </a>
      
      <nav className="flex gap-6 text-sm">
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

function NavigationTablet() {
  return (
    <header className="px-10 py-7 flex justify-between items-center bg-[#FAF9F7]">
      <a 
        href="/" 
        className="text-[#2C2C2A] font-medium text-base tracking-tight hover:text-[#0F6E56] transition-colors"
      >
        Rowan Stratton
      </a>
      
      <nav className="flex gap-8 text-sm">
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

function NavigationDesktop() {
  return (
    <header className="px-10 py-7 flex justify-between items-center bg-[#FAF9F7] max-w-[1400px] mx-auto w-full">
      <a 
        href="/" 
        className="text-[#2C2C2A] font-medium text-base tracking-tight hover:text-[#0F6E56] transition-colors"
      >
        Rowan Stratton
      </a>
      
      <nav className="flex gap-8 text-sm">
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

function Navigation() {
  const { breakpoint } = useBreakpoint()

  if (breakpoint === "mobile") return <NavigationMobile />
  if (breakpoint === "tablet") return <NavigationTablet />
  return <NavigationDesktop />
}

export default Navigation;