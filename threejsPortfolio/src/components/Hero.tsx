import { OrbitControls, PerspectiveCamera } from "@react-three/drei"
import { Canvas } from "@react-three/fiber"
//import CoffeeShop from "../sections/CoffeeShop.tsx"
import { Suspense, useState, useEffect } from "react"
import CanvasLoader from "../sections/CanvasLoader"
import { CoffeeShopNew } from "../sections/CoffeeShopNew.tsx"
import {Leva, useControls } from 'leva';
import {useMediaQuery} from 'react-responsive';
import { calculateSizes } from "../constants/index.ts"
import { CoffeeCup } from "../sections/CoffeeCup.tsx"
import { CatBookShelf } from "../sections/CatBookself.tsx"
import { Character } from "../sections/Character.tsx"
import  { default as  Button }  from '../sections/Button.tsx'

// Dialogue system types
type DialogueLine = {
  speaker: string;
  text: string;
  choices?: {
    text: string;
    nextDialogue: number;
  }[];
}

const dialogue: DialogueLine[] = [
  {
    speaker: "Shop Owner",
    text: "Welcome to my coffee shop! I'm Rowan, a graduate student and developer. Would you like to hear about my work?",
    choices: [
      { text: "Yes, tell me more!", nextDialogue: 1 },
      { text: "Maybe later, I just want to look around.", nextDialogue: 2 }
    ]
  },
  {
    speaker: "Rowan",
    text: "Great! I've worked on several exciting projects. I'm particularly proud of my application The Archive. Would you like to know more about that?",
    choices: [
      { text: "Yes, tell me about that project!", nextDialogue: 3 },
      { text: "What other projects have you worked on?", nextDialogue: 4 }
    ]
  },
  {
    speaker: "Rowan",
    text: "Of course! Feel free to explore the shop. You'll find some of my work displayed around here. Let me know if you have any questions!",
    choices: [
      { text: "Actually, I'd like to hear about your work now.", nextDialogue: 1 },
      { text: "Thanks, I'll look around.", nextDialogue: 5 }
    ]
  },
  {
    speaker: "Rowan",
    text: "The Archive is a comprehensive application I built for managing academic resources and research materials. It features advanced search capabilities and collaborative tools. Check out the full project details below!",
    choices: [
      { text: "Show me your projects!", nextDialogue: 4 },
      { text: "Tell me more about your other work.", nextDialogue: 1 }
    ]
  },
  {
    speaker: "Rowan",
    text: "I'd love to show you my featured projects! Let me take you to the projects section where you can see all my work in detail.",
    choices: [
      { text: "Great, let's go!", nextDialogue: -1 }, // -1 will trigger navigation
      { text: "Actually, tell me more first.", nextDialogue: 1 }
    ]
  },
  {
    speaker: "Rowan",
    text: "Enjoy exploring! If you'd like to know more about anything you see, just let me know!",
    choices: [
      { text: "Tell me about your work.", nextDialogue: 1 },
      { text: "Close", nextDialogue: -2 } // -2 will close dialogue
    ]
  }
];

const Hero = () => {
  const [currentDialogue, setCurrentDialogue] = useState(0);
  const [showDialogue, setShowDialogue] = useState(false);
  const [showCharacter, setShowCharacter] = useState(false);

  const isMobile = useMediaQuery( { maxWidth: 768});

  const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 1024});

  const isSmall = useMediaQuery({ maxWidth: 440});

  const sizes = calculateSizes(isSmall, isMobile, isTablet);

  // Show character after a short delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowCharacter(true);
      setShowDialogue(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleChoice = (nextDialogue: number) => {
    if (nextDialogue === -1) {
      // Navigate to projects section
      const projectsSection = document.getElementById('projects');
      if (projectsSection) {
        projectsSection.scrollIntoView({ behavior: 'smooth' });
      }
      setShowDialogue(false);
    } else if (nextDialogue === -2) {
      // Close dialogue
      setShowDialogue(false);
    } else {
      setCurrentDialogue(nextDialogue);
    }
  };

  return (
    <section className="min-h-screen w-full flex flex-col relative">
        <div className="w-full mx-auto flex flex-col sm:mt-36 mt-20 c-space gap-3">
        <p className="sm:text-3xl text-2xl font-medium text-white text-center font-generalsans">Hi, I am Rowan!<span className="waving-hand">☕</span></p>
        <p className="hero_tag text-gray_gradient text-center">
            Graduate Student
        </p>
        </div>
        <div className="w-full h-full absolute inset-0">
{/**Start of the ThreeJS stuffs */}
    {/*<Leva /> Might need later */}
<Canvas className="w-full h-full mt-12">
    <OrbitControls enableZoom={false} />
    <Suspense fallback={<CanvasLoader/>}>
    <directionalLight position={[0, 0, 20]} intensity = {0.25} />

    <PerspectiveCamera makeDefault position={[sizes.cameraPositionX, sizes.cameraPositionY, sizes.cameraPositionZ]}/>
    
    {/**Component for the entire coffee shop - to make it prettier later */}
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

    {/**Items around coffee shop to make dynamic later */}
    <group>
      <CoffeeCup scale={sizes.coffeeCupScale} position={[sizes.coffeCupPositionX, sizes.coffeeCupPositionY, sizes.coffeeCupPositionZ]} rotation = {[sizes.coffeCupRotationX, sizes.coffeCupRotationY, sizes.coffeCupRotationZ]}/>
    </group>
    <group>
      <CatBookShelf scale={sizes.catShelfScale} position={[sizes.catShelfPositionX, sizes.catShelfPositionY, sizes.catShelfPositionZ]} rotation={[sizes.catShelfRotationX, sizes.catShelfRotationY, sizes.catShelfRotationZ]}/>
    </group>

    <ambientLight intensity={1} />
    </Suspense>
</Canvas>
        </div>

        {/* Dialogue System */}
        {showDialogue && (
          <div className="absolute bottom-32 left-0 w-full z-10 c-space">
            <div className="bg-black/80 p-6 rounded-lg max-w-2xl mx-auto">
              <div className="text-white mb-4">
                <span className="font-bold">{dialogue[currentDialogue].speaker}: </span>
                <span>{dialogue[currentDialogue].text}</span>
              </div>
              {dialogue[currentDialogue].choices && (
                <div className="flex flex-col gap-2">
                  {dialogue[currentDialogue].choices.map((choice, index) => (
                    <button
                      key={index}
                      onClick={() => handleChoice(choice.nextDialogue)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                    >
                      {choice.text}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

{/** Start of next section end of 3d images  */}
{/** Button for working together  */}
    <div className="absolute bottom-7 left-0 w-full z-10 c-space">
      <a href="#about" className="w-fit">
      <Button name="Let's work together" isBeam containerClass="sm:w-full sm:min-w-96"/>
      </a>
    </div>

    </section>
  )
}

export default Hero