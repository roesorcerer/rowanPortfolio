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
            <div className="grid xl:grid-cols-3 xl:grid-rows-6 md:grid-cols-2 grid-cols-1 gap-5 h-full">

                {/** First Card Avatar with intro */}
                <div className="col-spam-1 xl:row-span-3">
                    <div className="grid-container">
                        <img src="https://utfs.io/f/LHwfoeNVr61iwKRHIADceaNAfKUkhiIoPl7L2F93dZHyT16b" alt="grid-1" className="w-full sm:h-[276px] h-fit object-contain" />



                        <div>
                            <p className="grid-headtext text-center"> Hi, I'm Rowan</p>
                            <p className="grid-subtext"> Check out my current projects and come back to see as I grow with development experience. With 4 years of experience
                                in development I am honing my skills in Human Computer Interactions through games. Everything we create as developers beings and ends with the user, thus providing 
                                an enriching and meaningful experience is at the heart of everything I do as an engineer. 
                            </p>
                        </div>
                    </div>
                </div>

                {/**Second Card Tech Stack with info on tech experience. Change from image to buttons later possibly? */}
                <div className="col-span-1 xl:row-span-3">
                <div className="grid-container">                        
                    <p className="grid-headtext text-center">Tech Stacks I have worked on</p>
                    <div className="space y-3">                            
                        <p className="grid-subtext">I specialize in Javascript/TypeScript with a Focus on React. I learn by doing and I invite you to take a look around and explore some of the languages and technologies I have worked with </p>  
                           
        {/* Tech stack grid - Buttons that take you to my GitHub to show what I have worked on */}
          <div className="grid grid-cols-3 gap-4 mt-4">
            {currentProject.tags.map((tag: Tag) => (
              <button
                key={tag.id}
                onClick={() => handleTechClick(tag)}
                className="tech-button p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 flex flex-col items-center">
                <img 
                  src={tag.path} 
                  alt={tag.name}
                  className="w-12 h-12 object-contain" 
                />
                <span className="text-sm mt-1">{tag.name}</span>
              </button>
            ))}
            
          </div> 
          <p className="grid-subtext"> Blending developed works with what works for people. Working on Masters in Computer Science with a focus on game elements that improve users lives.</p>
                             
                            
                       
                                
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
                                                minDistance={5}  // Add min zoom distance
                                                maxDistance={10} 
                                            />
                                            <ambientLight intensity={0.8} />
                                            <directionalLight position={[5, 5, 5]} />
                                            <AxolotlScene scale={[40, 40, 40]}/>
                                        </Suspense>
                                    </Canvas>
                                </div>
                                <p className="grid-headtext">
                                    I work remotely focusing on education to bolster my working experience.
                                </p>
                                <p className="grid-subtext">I'm based in Minnesota and go to school at the University of Minnesota Duluth</p>
                                <Button name="Contact Me" isBeam containerClass="w-full mt-10" />
                            </div>
                        </div>

                {/**Why do I like to code */}
                <div className="xl:col-span-2 xl:row-span-3">
                    <div className="grid-container">
                        <img src="https://utfs.io/f/LHwfoeNVr61i1boCnB0NaX5s7P2ClbYRvo9kzFAwHBuZ6mV4" alt="grid-3" className="w-full sm:h-[266px] h-fit object-contain" />
                        <p className="grid-headtext">I like making things and problem solving</p>
                        <p className="grid-subtext">Through development and coding I am able to flex the bounds of my creativity and applying creative solutions. From embedded programming through a Rasberry Pi, to game development I spend my time honing my craft.  </p>
                    </div>
                </div>

                {/**Contact options email can be copied but the tick replacements do not work yet. */}
                <div className="xl:col-span-1 xl:row-span-2">
                    <div className="grid-container">
                        <img src="https://utfs.io/f/LHwfoeNVr61ixzzP4pwJgUdiHGFDN1aYuSmtXLZy96kjbhVp" alt="grid-4" className="w-full md:h-[326px] sm:h-[326px] h-fit object-cover sm:object-top" />

                        <div className="space-y-2">
                            <p className="grid-subtext text-center">Contact Me</p>
                            <div className="copy-container" onClick={handleCopy}>
                                <img src={hasCopied ? 'assets/cat-move.gif' : 'assets/cat-footprint.png'} alt="copy" />
                                <p className="lg:text-2xl md:text-xl font-medium text-gray_gradient text-white">rowanstratton1@gmail.com</p>
                            </div>
                        </div>

                    </div>
                </div>

            </div>



        </section>
    );

};
export default About;
