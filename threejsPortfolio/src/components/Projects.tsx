import { Suspense, useState } from 'react'
import { myProjects } from '../constants'
import { Canvas } from '@react-three/fiber';
import { Center, OrbitControls } from '@react-three/drei';
import CanvasLoader from '../sections/CanvasLoader';
import DemoComputer from '../sections/DemoComputer';

const projectCount = myProjects.length;

const Projects = () => {

  const [selectedProjectIndex, setSelectedProjectIndex ] = useState(0);
  const currentProject = myProjects[selectedProjectIndex]; {/**Project I am currently looking at will change later */}

  const handleNavigation = (direction: string) => {
      setSelectedProjectIndex((prevIndex) => {
        if(direction === 'previous') {
          return prevIndex === 0 ? projectCount - 1 : prevIndex - 1;
        }else{
          return prevIndex === projectCount -1 ? 0 : prevIndex + 1;
        }
      });
  };

  return (
    <section id="projects" className='c-space my-20'>
        <p className="head-text">Featured Projects</p>

        <div className="grid lg:grid-cols-2 grid-cols-1 mt-12 gap-5 w-full">
            <div className="flex flex-col gap-5 relative sm:p-10 px-5 py-8 shadow-2xl shadow-black-200 border border-black-300 bg-black-200 rounded-lg">
                <div className='absolute top-0 right-0 w-full h-full overflow-hidden rounded-lg opacity-20'>
                    <img src={currentProject.spotlight} alt="spotlight" className="w-full h-full object-cover" />
                </div>

                <div className="p-3 backdrop-filter backdrop-blur-3xl w-fit rounded-lg relative z-10" style={currentProject.logoStyle} >
                  <img src={currentProject.logo} alt="logo" className='w-10 h-10 shadow-sm' />
                </div>

                <div className='flex flex-col gap-4 text-white-600 my-3 relative z-10'>
                  <p className='text-white text-3xl font-bold'>{currentProject.title}</p>
                  <p className='text-white-600 text-sm leading-relaxed'>{currentProject.desc}</p>
                  <p className='text-white-700 text-xs leading-relaxed'>{currentProject.subdesc}</p>
                </div>

                <div className="flex flex-col gap-5 relative z-10">
                  <div className="flex items-center gap-3 flex-wrap">
                    {currentProject.tags.map((tag, index) => (
                      <div key={index} className="tech-logo">
                        <img src={tag.path} alt={tag.name} />
                      </div>
                    ))}
                  </div>
                
                  <a className='flex items-center gap-2 cursor-pointer text-white-600 hover:text-white transition-colors w-fit' href={currentProject.href} target='_blank' rel="noreferrer">
                    <p className='text-sm font-medium'>See More Info</p>
                    <img src="/assets/coffee-cup-to-go.png" className='w-3 h-3' alt="arrow" />
                  </a>
                </div>

                <div className='flex justify-between items-center mt-auto pt-5 relative z-10 border-t border-black-300'>
                  <span className='text-white-600 text-xs'>
                    {selectedProjectIndex + 1} / {projectCount}
                  </span>
                  <div className='flex gap-3'>
                    <button className='arrow-btn' onClick={() => handleNavigation('previous')} aria-label="Previous project">
                      <img src="https://img.icons8.com/?size=100&id=aJ5oE5rWM1Mv&format=png&color=000000" alt="left arrow" className="w-4 h-4" />
                    </button>
                    <button className='arrow-btn' onClick={() => handleNavigation('next')} aria-label="Next project">
                      <img src="https://img.icons8.com/?size=100&id=DEaVg54CVcX4&format=png&color=000000" alt="right arrow" className="w-4 h-4" />
                    </button>
                  </div>
                </div>
            </div>

            <div className='border border-black-300 bg-black-200 rounded-lg h-96 md:h-full'>
              <Canvas>
                <ambientLight intensity={Math.PI / 2} />
                <directionalLight position={[10, 10, 5]} />
                <Center>
                  <Suspense fallback={<CanvasLoader/>}>
                    <group scale={1.5} position={[0, -2, 0]} rotation={[0, -0.1, 0]}>
                      <DemoComputer texture={currentProject.texture}/>
                    </group>
                  </Suspense>
                </Center>
                <OrbitControls maxPolarAngle={Math.PI / 2} enableZoom={false}/>
              </Canvas>
            </div>
        </div>
    </section>
  )
}

export default Projects