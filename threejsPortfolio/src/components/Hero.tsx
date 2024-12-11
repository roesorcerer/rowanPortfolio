import { OrbitControls, PerspectiveCamera, useFaceControls } from "@react-three/drei"
import { Canvas } from "@react-three/fiber"
import CoffeeShop from "../sections/CoffeeShop.tsx"
import { Suspense } from "react"
import CanvasLoader from "../sections/CanvasLoader"
import { CoffeeShopNew } from "../sections/CoffeeShopNew.tsx"
import {Leva, useControls } from 'leva';
import {useMediaQuery} from 'react-responsive';
import { calculateSizes } from "../constants/index.ts"
import Target from "../sections/Target.tsx"

const Hero = () => {

  const x = useControls('threejsPortfolio', 
    {
      positionX: {
        value: 0.3,
        min: -10,
        max: 10
      },
      positionY: {
        value: -3.5,
        min: -10,
        max: 10
      },
      positionZ: {
        value: -5.5,
        min: -10,
        max: 10
      },

      rotationX: {
        value: 3.3,
        min: -10,
        max: 10
      },
      rotationY: {
        value: 2.1,
        min: -10,
        max: 10
      },
      rotationZ: {
        value: 3.1,
        min: -10,
        max: 10
      },
      scale: {
        value: 2.4,
        min: 0.1,
        max: 10,
      },
      scaleMobile: {
        value: 1,
        min: 0.1,
        max: 10,
      },
    }
  )

  const isMobile = useMediaQuery( { maxWidth: 768});

  const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 1024});

  const isSmall = useMediaQuery({ maxWidth: 440});

  const sizes = calculateSizes(isSmall, isMobile, isTablet);
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
    <Leva />
<Canvas className="w-full h-full mt-12">
    <OrbitControls enableZoom={false} />
    <Suspense fallback={<CanvasLoader/>}>
    <directionalLight position={[0, 0, 20]} intensity = {0.25} />

    <PerspectiveCamera makeDefault position={[0, 0, 5]}/>
    <CoffeeShopNew scale={sizes.shopScale} position={[x.positionX, x.positionY, x.positionZ]} rotation={[x.rotationX, x.rotationY, x.rotationZ]}/>

{/**This is where you stopped 12/11 */} 

    <group>
      <Target position={sizes.targetPosition}/>
    </group>
    
    <ambientLight intensity={1} />
    </Suspense>
</Canvas>
        </div>


    </section>
  )
}

export default Hero