import { OrbitControls, PerspectiveCamera } from "@react-three/drei"
import { Canvas } from "@react-three/fiber"
import { Suspense, useState, useEffect } from "react"
import CanvasLoader from "../sections/CanvasLoader"
import { CoffeeShopNew } from "../sections/CoffeeShopNew.tsx"
import { useMediaQuery } from 'react-responsive';
import { calculateSizes } from "../constants/index.ts"
import { CoffeeCup } from "../sections/CoffeeCup.tsx"
import { CatBookShelf } from "../sections/CatBookself.tsx"
import { Character } from "../sections/Character.tsx"
import Button from '../sections/Button.tsx'

const Hero = () => {
  const [showCharacter, setShowCharacter] = useState(false);

  const isMobile = useMediaQuery({ maxWidth: 768 });
  const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 1024 });
  const isSmall = useMediaQuery({ maxWidth: 440 });

  const sizes = calculateSizes(isSmall, isMobile, isTablet);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowCharacter(true);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="min-h-screen w-full flex flex-col relative" id="home">
      {/* Text Content - Positioned to avoid 3D model */}
      <div className="w-full mx-auto flex flex-col sm:mt-28 mt-20 c-space gap-2 z-10 relative">
        {/* Greeting */}
        <p className="text-lg sm:text-xl text-white/80 text-center font-generalsans">
          Hi, I'm Rowan <span className="waving-hand">☕</span>
        </p>
        
        {/* Title - Smaller, cleaner */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-white text-center max-w-2xl mx-auto leading-tight">
          Software Developer
        </h1>
        <p className="text-lg sm:text-xl text-white/60 text-center">
          specializing in user-centered applications
        </p>

        {/* Quick info row */}
        <div className="flex flex-wrap justify-center gap-3 mt-4">
          <span className="px-3 py-1 bg-white/10 rounded-full text-white/70 text-sm">
            MS Computer Science
          </span>
          <span className="px-3 py-1 bg-white/10 rounded-full text-white/70 text-sm">
            HCI Research
          </span>
          <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
            Open to opportunities
          </span>
        </div>

        {/* Quick links */}
        <div className="flex justify-center gap-4 mt-3">
          <a 
            href="https://github.com/roesorcerer" 
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/60 hover:text-white transition-colors"
            aria-label="GitHub"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
            </svg>
          </a>
          <a 
            href="https://linkedin.com/in/YOUR_LINKEDIN" 
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/60 hover:text-white transition-colors"
            aria-label="LinkedIn"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
          </a>
          <a 
            href="/resume.pdf" 
            target="_blank"
            className="text-white/60 hover:text-white transition-colors flex items-center gap-1 text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Resume
          </a>
        </div>
      </div>

      {/* 3D Canvas - Behind text */}
      <div className="w-full h-full absolute inset-0">
        <Canvas className="w-full h-full">
          <OrbitControls enableZoom={false} />
          <Suspense fallback={<CanvasLoader />}>
            <directionalLight position={[0, 0, 20]} intensity={0.25} />
            <PerspectiveCamera makeDefault position={[sizes.cameraPositionX, sizes.cameraPositionY, sizes.cameraPositionZ]} />
            
            <CoffeeShopNew 
              scale={sizes.shopScale} 
              position={[sizes.shopPositionX, sizes.shopPositionY, sizes.shopPositionZ]} 
              rotation={[sizes.shopRotationX, sizes.shopRotationY, sizes.shopRotationZ]}
            >
              {showCharacter && (
                <Character 
                  scale={[0.02, 0.02, 0.02]} 
                  position={[-10, 0, 5]} 
                />
              )}
            </CoffeeShopNew>

            <group>
              <CoffeeCup 
                scale={sizes.coffeeCupScale} 
                position={[sizes.coffeCupPositionX, sizes.coffeeCupPositionY, sizes.coffeeCupPositionZ]} 
                rotation={[sizes.coffeCupRotationX, sizes.coffeCupRotationY, sizes.coffeCupRotationZ]}
              />
            </group>
            <group>
              <CatBookShelf 
                scale={sizes.catShelfScale} 
                position={[sizes.catShelfPositionX, sizes.catShelfPositionY, sizes.catShelfPositionZ]} 
                rotation={[sizes.catShelfRotationX, sizes.catShelfRotationY, sizes.catShelfRotationZ]}
              />
            </group>

            <ambientLight intensity={1} />
          </Suspense>
        </Canvas>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 text-white/40 text-sm flex flex-col items-center gap-2 z-10">
        <span>Scroll to explore</span>
        <svg className="w-4 h-4 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>

      {/* CTA Button */}
      <div className="absolute bottom-7 left-0 w-full z-10 c-space">
        <a href="#projects" className="w-fit">
          <Button name="View My Work" isBeam containerClass="sm:w-fit sm:min-w-48" />
        </a>
      </div>
    </section>
  )
}

export default Hero;