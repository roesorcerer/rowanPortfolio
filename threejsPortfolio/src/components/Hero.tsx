import { OrbitControls, PerspectiveCamera } from "@react-three/drei"
import { Canvas } from "@react-three/fiber"
//import CoffeeShop from "../sections/CoffeeShop.tsx"
import { Suspense, useState, useEffect } from "react"
import CanvasLoader from "../sections/CanvasLoader"
import { CoffeeShopNew } from "../sections/CoffeeShopNew.tsx"
import {useMediaQuery} from 'react-responsive';
import { calculateSizes } from "../constants/index.ts"
import { CoffeeCup } from "../sections/CoffeeCup.tsx"
import { CatBookShelf } from "../sections/CatBookself.tsx"
import { Character } from "../sections/Character.tsx"
import  { default as  Button }  from '../sections/Button.tsx'
import { ChatbotWindow } from "./ChatbotWindow"



type DialogueChoice = {
  text: string;
  nextDialogue?: number;
  action?: "NAVIGATE" | "CLOSE" | "OPEN_PROJECT";
  payload?: any;
};

type DialogueLine = {
  id: number;
  speaker: "Rowan";
  text: string;
  tags?: string[]; // helpful for analytics or “already-seen” logic
    choices?: DialogueChoice[];
};

export const dialogue: DialogueLine[] = [
  {
    id: 0,
    speaker: "Rowan",
    text:
      "Hey, welcome to my little cyber coffee shop ☕️\n" +
      "I’m Rowan — a software engineer and HCI researcher building narrative-driven systems.\n" +
      "Want the quick tour, or do you feel like chatting?",
    tags: ["intro"],
    choices: [
      { text: "Quick tour (60 seconds).", nextDialogue: 10 },
      { text: "Let’s chat — start with your research.", nextDialogue: 1 },
      { text: "Let’s chat — start with your engineering work.", nextDialogue: 2 },
      { text: "Maybe later, I just want to look around.", nextDialogue: 3 }
    ]
  },

  {
    id: 1,
    speaker: "Rowan",
    text:
      "Research it is. My main work explores how *game narrative and design choices* can support stress management.\n" +
      "The project I’m most proud of is **The Archive** — a story-driven system built to study how narrative structure affects meaning and coping.\n" +
      "Want the concept, the tech stack, or the study angle?",
    tags: ["research", "archive"],
    choices: [
      { text: "Concept first — what is The Archive?", nextDialogue: 4 },
      { text: "Tech stack — how did you build it?", nextDialogue: 5 },
      { text: "Study angle — what are you measuring?", nextDialogue: 6 },
      { text: "Hit me with a fun fact instead.", nextDialogue: 7 },
      { text: "Show me the projects section.", action: "NAVIGATE", payload: { section: "projects" } }
    ]
  },

  {
    id: 2,
    speaker: "Rowan",
    text:
      "Engineering tour — love it.\n" +
      "I build full-stack apps, game-like interactions, and research prototypes.\n" +
      "Do you want to see **production-style engineering**, **UI/game-feel work**, or **teaching + mentoring**?",
    tags: ["engineering"],
    choices: [
      { text: "Production engineering (APIs, data, deployment).", nextDialogue: 8 },
      { text: "UI + game-feel (interactive systems).", nextDialogue: 9 },
      { text: "Teaching + mentoring.", nextDialogue: 11 },
      { text: "Fun fact!", nextDialogue: 7 },
      { text: "Show me the projects section.", action: "NAVIGATE", payload: { section: "projects" } }
    ]
  },

  {
    id: 3,
    speaker: "Rowan",
    text:
      "Totally fair. Wander around.\n" +
      "If you click something and want context, come back and I’ll act like your in-shop tour guide 😄",
    tags: ["browse"],
    choices: [
      { text: "Actually, give me the quick tour.", nextDialogue: 10 },
      { text: "Okay, tell me about your research.", nextDialogue: 1 },
      { text: "Close chat.", action: "CLOSE" }
    ]
  },

  {
    id: 4,
    speaker: "Rowan",
    text:
      "**The Archive** is a mysterious library of memories — a narrative space where stress changes what you can access and how the world behaves.\n" +
      "It’s built to help players practice coping skills inside a story, then reflect on how that transfers to real life.\n" +
      "Want to see what makes it different from typical “wellness apps”?",
    tags: ["archive", "concept"],
    choices: [
      { text: "Yes — what makes it different?", nextDialogue: 12 },
      { text: "Show me the project page.", action: "OPEN_PROJECT", payload: { slug: "the-archive" } },
      { text: "Let’s talk tech stack.", nextDialogue: 5 },
      { text: "Fun fact!", nextDialogue: 7 }
    ]
  },

  {
    id: 5,
    speaker: "Rowan",
    text:
      "Tech stack time 🔧\n" +
      "I work across frontend + backend, and I’m comfortable shipping systems end-to-end.\n" +
      "For The Archive, think: mobile UI, a story engine, persistence, and structured content delivery.\n" +
      "Do you want a frontend view, backend view, or architecture view?",
    tags: ["archive", "tech"],
    choices: [
      { text: "Frontend view.", nextDialogue: 13 },
      { text: "Backend view.", nextDialogue: 14 },
      { text: "Architecture overview.", nextDialogue: 15 },
      { text: "Show projects.", action: "NAVIGATE", payload: { section: "projects" } }
    ]
  },

  {
    id: 6,
    speaker: "Rowan",
    text:
      "Research angle 🧪\n" +
      "I care less about “engagement” and more about whether people actually *feel better* and can carry skills into daily life.\n" +
      "That means measuring perceived stress, reflection, and what players say they learned — not just clicks.\n" +
      "Want the metrics philosophy, the method, or what I’m testing with narrative endings?",
    tags: ["research", "methods"],
    choices: [
      { text: "Metrics philosophy.", nextDialogue: 16 },
      { text: "Methods (surveys/interviews).", nextDialogue: 17 },
      { text: "Narrative endings — what’s the hypothesis?", nextDialogue: 18 },
      { text: "Fun fact!", nextDialogue: 7 }
    ]
  },

  {
    id: 7,
    speaker: "Rowan",
    text:
      "Fun fact menu ☕️✨ Pick one:\n" +
      "1) My work focuses on *meaningful outcomes*, not retention.\n" +
      "2) I build game systems where story structure affects user experience.\n" +
      "3) I teach programming with an accessibility-first mindset.\n" +
      "4) I build community tools (including Discord bots) because I like software that helps people.",
    tags: ["funfact"],
    choices: [
      { text: "Give me another fun fact.", nextDialogue: 7 },
      { text: "Back to research.", nextDialogue: 1 },
      { text: "Back to engineering.", nextDialogue: 2 },
      { text: "Show projects.", action: "NAVIGATE", payload: { section: "projects" } }
    ]
  },

  {
    id: 8,
    speaker: "Rowan",
    text:
      "Production-style work: I’m comfortable with APIs, data storage, auth, and deployment planning.\n" +
      "I’ve built systems using modern web stacks, database-backed workflows, and automation-style features like reports.\n" +
      "Want to see a project that demonstrates backend reliability, or one that demonstrates end-to-end product thinking?",
    tags: ["engineering", "production"],
    choices: [
      { text: "Backend reliability.", nextDialogue: 19 },
      { text: "End-to-end product thinking.", nextDialogue: 20 },
      { text: "Show projects.", action: "NAVIGATE", payload: { section: "projects" } }
    ]
  },

  {
    id: 9,
    speaker: "Rowan",
    text:
      "UI + game-feel is where I’m happiest.\n" +
      "I build interactive flows that feel responsive, playful, and intentional — the kind of UI that gently guides instead of shouting.\n" +
      "Want to see how I design interaction, or how I engineer it?",
    tags: ["engineering", "ui"],
    choices: [
      { text: "Interaction design approach.", nextDialogue: 21 },
      { text: "Engineering the UI.", nextDialogue: 22 },
      { text: "Fun fact!", nextDialogue: 7 }
    ]
  },

  {
    id: 10,
    speaker: "Rowan",
    text:
      "Quick tour: here’s the highlight reel.\n" +
      "• **The Archive** — narrative-driven stress-management research app\n" +
      "• Teaching + mentoring in CS\n" +
      "• Full-stack development across modern frameworks\n" +
      "• Community-centered tools (games, bots, location-based experiences)\n" +
      "Want to dive deeper into research, engineering, or teaching?",
    tags: ["tour"],
    choices: [
      { text: "Research.", nextDialogue: 1 },
      { text: "Engineering.", nextDialogue: 2 },
      { text: "Teaching + mentoring.", nextDialogue: 11 },
      { text: "Show projects.", action: "NAVIGATE", payload: { section: "projects" } }
    ]
  },

  {
    id: 11,
    speaker: "Rowan",
    text:
      "Teaching + mentoring is a big part of my identity.\n" +
      "I focus on making programming feel learnable — and on helping students build good habits around design, testing, and debugging.\n" +
      "Want the teaching philosophy, or examples of what I mentor students through?",
    tags: ["teaching"],
    choices: [
      { text: "Teaching philosophy.", nextDialogue: 23 },
      { text: "Mentoring examples.", nextDialogue: 24 },
      { text: "Back to the main menu.", nextDialogue: 0 }
    ]
  }
];

const Hero = () => {
  const [showCharacter, setShowCharacter] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  const isMobile = useMediaQuery( { maxWidth: 768});

  const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 1024});

  const isSmall = useMediaQuery({ maxWidth: 440});

  const sizes = calculateSizes(isSmall, isMobile, isTablet);

  // Show character after a short delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowCharacter(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="hero-shell min-h-screen w-full flex flex-col relative mt-20 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-20 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-[#f59e0b]/20 blur-3xl" />
        <div className="absolute top-28 -left-16 h-64 w-64 rounded-full bg-[#38bdf8]/10 blur-3xl" />
      </div>

      <div className="relative z-20 c-space pt-1 sm:pt-4 pointer-events-none">
        <div className="hero-header-card max-w-2xl mx-auto rounded-xl px-4 py-3 sm:px-6 sm:py-4 text-center">
          <p className="sm:text-3xl text-2xl font-semibold text-white text-center font-generalsans">
            Hi, I am Rowan!<span className="waving-hand">☕</span>
          </p>
          <p className="hero_tag text-gray_gradient text-center mt-1">
            Graduate Student and Research Assistant
          </p>
          <p className="mt-2 text-xs sm:text-sm text-white-600 max-w-xl mx-auto leading-relaxed">
            I build narrative-driven software and human-centered interactive experiences.
          </p>
        </div>
      </div>

      <div className="w-full h-full absolute inset-0 z-0">
        <Canvas className="w-full h-full mt-14 sm:mt-20" dpr={[1, 1.5]} shadows>
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            maxPolarAngle={Math.PI / 2.2}
            minPolarAngle={Math.PI / 3.1}
          />
          <Suspense fallback={<CanvasLoader/>}>
            <hemisphereLight intensity={0.45} groundColor="#05070a" color="#fef3c7" />
            <directionalLight position={[0, 0, 20]} intensity={0.35} />
            <spotLight position={[6, 12, 10]} angle={0.35} penumbra={0.5} intensity={0.7} color="#fcd5b4" />

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

            <ambientLight intensity={0.85} />
          </Suspense>
        </Canvas>
      </div>

      <div className="absolute inset-x-0 top-0 h-24 sm:h-32 bg-gradient-to-b from-black/75 via-black/30 to-transparent pointer-events-none z-10" />
      <div className="absolute inset-x-0 bottom-0 h-40 sm:h-48 bg-gradient-to-t from-black/75 via-black/45 to-transparent pointer-events-none z-10" />

        {/* Chatbot Button and Window */}
        {!isChatbotOpen && (
          <button
            onClick={() => setIsChatbotOpen(true)}
            className="absolute bottom-32 left-1/2 transform -translate-x-1/2 z-20 bg-[#1b4466]/90 hover:bg-[#245a88] text-white px-6 py-3 rounded-full border border-[#7ec8f8]/40 font-semibold transition-all backdrop-blur-sm hover:shadow-lg hover:shadow-[#1f6ea1]/40"
          >
            💬 Chat with me
          </button>
        )}
        <ChatbotWindow isOpen={isChatbotOpen} onClose={() => setIsChatbotOpen(false)} />

{/** Start of next section end of 3d images  */}
{/** Button for working together  */}
    <div className="absolute bottom-7 left-0 w-full z-20 c-space">
      <a href="#contact" className="w-fit block mx-auto">
      <Button name="Let's work together" isBeam containerClass="sm:w-full sm:min-w-96"/>
      </a>
    </div>

    </section>
  )
}

export default Hero