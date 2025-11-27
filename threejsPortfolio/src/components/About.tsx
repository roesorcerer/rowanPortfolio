import { useState } from 'react'
import Button from '../sections/Button'
import AxolotlScene from '../sections/Axolotl';
import { OrbitControls } from "@react-three/drei"
import { Canvas } from "@react-three/fiber"
import { Suspense } from "react"
import CanvasLoader from "../sections/CanvasLoader"

const techIcons = [
  { name: 'React', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg' },
  { name: 'TypeScript', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg' },
  { name: 'Python', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg' },
  { name: 'Django', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/django/django-plain.svg' },
  { name: 'Unity', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/unity/unity-original.svg' },
  { name: 'Godot', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/godot/godot-original.svg' },
];

const About: React.FC = () => {
  const [hasCopied, setHasCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText('rowanstratton1@gmail.com');
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };

  return (
    <section className="c-space my-20" id="about">
      <div className="grid lg:grid-cols-3 gap-5">
        
        {/* Card 1: Who I am */}
        <div className="bg-black-200 rounded-xl p-6 border border-black-300">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-2xl font-bold text-white">RS</span>
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg">Rowan Stratton</h3>
              <p className="text-white-600 text-sm">MS Computer Science @ UMD</p>
            </div>
          </div>
          
          <p className="text-white-600 text-sm mb-4">
            Graduate researcher exploring how game design principles can create 
            meaningful, user-centered experiences for digital wellness.
          </p>

          <div className="flex gap-3">
            <a href="https://github.com/roesorcerer" target="_blank" rel="noopener noreferrer"
               className="p-2 bg-black-300 rounded-lg hover:bg-black-200 transition-colors">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
            </a>
            <a href="https://linkedin.com/in/YOUR_LINKEDIN" target="_blank" rel="noopener noreferrer"
               className="p-2 bg-black-300 rounded-lg hover:bg-black-200 transition-colors">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
            <a href="/resume.pdf" target="_blank"
               className="p-2 bg-black-300 rounded-lg hover:bg-black-200 transition-colors">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Card 2: Tech Stack - Icons only */}
        <div className="bg-black-200 rounded-xl p-6 border border-black-300">
          <h3 className="text-white font-semibold mb-4">Tech Stack</h3>
          <div className="grid grid-cols-3 gap-3">
            {techIcons.map(tech => (
              <div key={tech.name} className="flex flex-col items-center p-2">
                <img src={tech.icon} alt={tech.name} className="w-8 h-8" />
                <span className="text-white-600 text-xs mt-1">{tech.name}</span>
              </div>
            ))}
          </div>
          <a href="#skills" className="text-white-500 hover:text-white text-sm mt-4 inline-flex items-center gap-1">
            All skills →
          </a>
        </div>

        {/* Card 3: Location + CTA */}
        <div className="bg-black-200 rounded-xl p-6 border border-black-300 flex flex-col">
          <div className="flex-1 min-h-[150px] rounded-lg overflow-hidden bg-black-300 mb-4">
            <Canvas camera={{ position: [5, 5, 20], fov: 25 }} gl={{ alpha: true }}>
              <Suspense fallback={<CanvasLoader />}>
                <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={2} />
                <ambientLight intensity={0.8} />
                <directionalLight position={[5, 5, 5]} />
                <AxolotlScene scale={[40, 40, 40]} />
              </Suspense>
            </Canvas>
          </div>
          
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-white text-sm">Open to opportunities</span>
          </div>
          <p className="text-white-600 text-sm mb-4">Minnesota • Remote OK</p>
          
          <a href="#contact" className="w-full">
            <Button name="Contact Me" isBeam containerClass="w-full" />
          </a>
        </div>

        {/* Card 4: Email copy - spans 2 columns on larger screens */}
        <div className="lg:col-span-2 bg-black-200 rounded-xl p-6 border border-black-300">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-semibold mb-1">Get in touch</h3>
              <p className="text-white-600 text-sm">Available for full-time roles starting Spring 2026</p>
            </div>
            <button 
              onClick={handleCopy}
              className="flex items-center gap-2 px-4 py-2 bg-black-300 rounded-lg hover:bg-black-200 transition-colors"
            >
              {hasCopied ? (
                <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
              )}
              <span className="text-white text-sm">rowanstratton1@gmail.com</span>
            </button>
          </div>
        </div>

        {/* Card 5: Focus areas - single column */}
        <div className="bg-black-200 rounded-xl p-6 border border-black-300">
          <h3 className="text-white font-semibold mb-3">Focus Areas</h3>
          <div className="space-y-2">
            {['HCI Research', 'Game Design', 'Digital Wellness'].map(area => (
              <div key={area} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                <span className="text-white-600 text-sm">{area}</span>
              </div>
            ))}
          </div>
          <a href="#research" className="text-white-500 hover:text-white text-sm mt-3 inline-flex items-center gap-1">
            View research →
          </a>
        </div>

      </div>
    </section>
  );
};

export default About;