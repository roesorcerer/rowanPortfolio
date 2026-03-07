import { useState } from 'react'
//import { CatCapachinno } from '../sections/CatCappichino'
import Button from '../sections/Button'
import { gitLinks } from '../constants'
import { Project, Tag } from '../types/constants'
import  AxolotlScene  from '../sections/Axolotl';
import { OrbitControls, PerspectiveCamera } from "@react-three/drei"
import { Canvas } from "@react-three/fiber"
//import CoffeeShop from "../sections/CoffeeShop.tsx"
import { Suspense } from "react"
import CanvasLoader from "../sections/CanvasLoader"

const About: React.FC = () => {
    //const projectCount = gitLinks.length;
    const [selectedProjectIndex,  ] = useState<number>(0);
    const [hasCopied, setHasCopied] = useState(false);


    const currentProject: Project = gitLinks[selectedProjectIndex];

    const handleCopy = () => {
        navigator.clipboard.writeText(' rowanstratton1@gmail.com');
        setHasCopied(true);

        setTimeout(() => {
            setHasCopied(false);
        }, 2000);
    };
        
        function handleTechClick(tag: Tag): void {
            const githubURL = tag.githubLink || `https://github.com/rowan/${tag.name.toLowerCase()}-projects}`
            window.open(githubURL, '_blank');
        };
    
        
    return (
        <section className="c-space my-20" id="about">
                        <p className="head-text mb-12">About Me</p>
            <div className="grid xl:grid-cols-3 xl:grid-rows-6 md:grid-cols-2 grid-cols-1 gap-5 h-full">

                {/** First Card Avatar with intro */}
                <div className="col-span-1 xl:row-span-3">
                    <div className="grid-container">
                        <img src="https://utfs.io/f/LHwfoeNVr61iwKRHIADceaNAfKUkhiIoPl7L2F93dZHyT16b" alt="grid-1" className="w-full sm:h-[276px] h-fit object-contain rounded-lg" />



                        <div className="space-y-4">
                            <p className="grid-headtext text-center">Hi, I'm Rowan</p>
                            <p className="grid-subtext text-sm leading-relaxed">
                              With 4 years of development experience, I'm passionate about creating meaningful user experiences. I focus on Human-Computer Interactions through game design, believing that everything we build should center on enriching people's lives.
                            </p>
                        </div>
                    </div>
                </div>

                {/**Second Card Tech Stack with info on tech experience. Change from image to buttons later possibly? */}
                                <div className="col-span-1 xl:row-span-3">
                                    <div className="grid-container">                        
                                        <p className="grid-headtext text-center">Tech Stack</p>
                                        <div className="space-y-5">                            
                                            <p className="grid-subtext text-sm">I specialize in JavaScript/TypeScript with a focus on React. I learn by doing—explore the technologies I've worked with.</p>  
                      
                                            {/* Tech stack grid - Buttons that take you to my GitHub */}
                                            <div className="grid grid-cols-3 gap-3">
            {currentProject.tags.map((tag: Tag) => (
                                                    <button
                                                        key={tag.id}
                                                        onClick={() => handleTechClick(tag)}
                                                        className="tech-button p-3 rounded-lg bg-black-300 hover:bg-black-200 border border-black-500 hover:border-black-400 transition-all duration-200 flex flex-col items-center justify-center gap-2 group">
                                                        <img 
                                                            src={tag.path} 
                                                            alt={tag.name}
                                                            className="w-10 h-10 object-contain group-hover:scale-110 transition-transform" 
                                                        />
                                                        <span className="text-xs font-medium text-white-600 group-hover:text-white transition-colors">{tag.name}</span>
                                                    </button>
            ))}
                                            </div>
                      
                                            <p className="grid-subtext text-sm font-medium text-white">
                                                Currently pursuing a Master's in Computer Science, exploring how gamification improves wellness and user engagement.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                {/**3d image embedded with work preference(remote) */}

                        {/* 3D Model - Axolotl */}
                        <div className="col-span-1 xl:row-span-4">
                            <div className="grid-container">
                                <div className="w-full h-96">
                                    <Canvas
                                                                            camera={{ position: [5, 5, 20], fov: 25 }}
                                        style={{ width: '100%', height: '100%' }}
                                                                            gl={{ alpha: true }}
                                    >

                                        <Suspense fallback={<CanvasLoader />}>
                                            <OrbitControls 
                                                                                            enableZoom={true}
                                                                                            enablePan={true}
                                                                                            enableRotate={true}
                                                                                            minDistance={5}
                                                                                            maxDistance={10} 
                                            />
                                            <ambientLight intensity={0.8} />
                                            <directionalLight position={[5, 5, 5]} />
                                            <AxolotlScene scale={[40, 40, 40]}/>
                                        </Suspense>
                                    </Canvas>
                                </div>
                                                                <p className="grid-headtext text-lg">
                                                                    I work remotely focusing on education to bolster my experience.
                                </p>
                                <p className="grid-subtext text-sm">I'm based in Minnesota and studying at the University of Minnesota Duluth.</p>
                                <a href="#contact" className="w-full">
                                    <Button name="Contact Me" isBeam containerClass="w-full mt-10" />
                                </a>
                            </div>
                        </div>

                {/**Why do I like to code */}
                <div className="xl:col-span-2 xl:row-span-3 col-span-1">
                    <div className="grid-container">
                                                <p className="grid-headtext text-xl">Gamification Research Focus</p>
                                                <img src="https://utfs.io/f/LHwfoeNVr61i1boCnB0NaX5s7P2ClbYRvo9kzFAwHBuZ6mV4" alt="grid-3" className="w-full sm:h-[266px] h-fit object-contain rounded-lg" />
                                                <div className="space-y-3">
                                                    <p className="grid-subtext text-sm leading-relaxed">My research focuses on how gamification can benefit from immersive affordances and personalized experiences, exploring co-design processes that positively influence Wellness Tools.</p>
                                                    <p className="grid-subtext text-sm leading-relaxed">By understanding user motivations and behaviors, I create engaging applications that promote well-being and personal growth.</p>
                                                </div>
                                                <Button name="Learn More about Research" isBeam containerClass="w-full mt-10" />
                    </div>
                </div>

                {/**Contact options email can be copied but the tick replacements do not work yet. */}
                <div className="xl:col-span-1 xl:row-span-2 col-span-1">
                    <div className="grid-container">
                        <img src="https://utfs.io/f/LHwfoeNVr61ixzzP4pwJgUdiHGFDN1aYuSmtXLZy96kjbhVp" alt="grid-4" className="w-full md:h-[326px] sm:h-[326px] h-fit object-cover sm:object-top rounded-lg" />

                        <div className="space-y-2">
                            <p className="grid-headtext text-center text-lg">Contact Me</p>
                            <div className="copy-container" onClick={handleCopy}>
                                <img 
                                                                    src={hasCopied ? 'https://media.tenor.com/GdayJLTw8hcAAAAj/dab-dance.gif' : '/assets/cat-footprint.png'} 
                                    alt="copy" 
                                                                    className={hasCopied ? "w-12 h-12" : "w-6 h-6"}
                                />
                                <p className="lg:text-xl md:text-lg font-medium text-gray_gradient text-white break-words">rowanstratton1@gmail.com</p>
                            </div>
                        </div>

                    </div>
                </div>

            </div>



        </section>
    );

};
export default About;
