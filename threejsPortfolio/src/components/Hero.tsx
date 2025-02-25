import { OrbitControls, PerspectiveCamera } from "@react-three/drei"
import { Canvas } from "@react-three/fiber"
//import CoffeeShop from "../sections/CoffeeShop.tsx"
import { Suspense } from "react"
import CanvasLoader from "../sections/CanvasLoader"
import { CoffeeShopNew } from "../sections/CoffeeShopNew.tsx"
import {Leva, useControls } from 'leva';
import {useMediaQuery} from 'react-responsive';
import { calculateSizes } from "../constants/index.ts"
import { CoffeeCup } from "../sections/CoffeeCup.tsx"
import { CatBookShelf } from "../sections/CatBookself.tsx"
import  { default as  Button }  from '../sections/Button.tsx'
const Hero = () => {

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
    {/*<Leva /> Might need later */}
<Canvas className="w-full h-full mt-12">
    <OrbitControls enableZoom={false} />
    <Suspense fallback={<CanvasLoader/>}>
    <directionalLight position={[0, 0, 20]} intensity = {0.25} />

    <PerspectiveCamera makeDefault position={[sizes.cameraPositionX, sizes.cameraPositionY, sizes.cameraPositionZ]}/>
    
    {/**Component for the entire coffee shop - to make it prettier later */}
    <CoffeeShopNew scale={sizes.shopScale} position={[sizes.shopPositionX, sizes.shopPositionY, sizes.shopPositionZ]} rotation={[sizes.shopRotationX, sizes.shopRotationY, sizes.shopRotationZ]}/>

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