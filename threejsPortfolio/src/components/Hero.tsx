import { PerspectiveCamera } from "@react-three/drei"
import { Canvas } from "@react-three/fiber"
import {CoffeeShop} from "../sections/CoffeeShop"
import { Suspense } from "react"
import CanvasLoader from "../sections/CanvasLoader"



const Hero = () => {
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
<Canvas className="w-full h-full">
    <Suspense fallback={<CanvasLoader/>}>

    <PerspectiveCamera makeDefault position={[0, 0, 30]}/>
    <CoffeeShop scale = {0.05} position={[0,0,0]} rotation={[0,Math.PI / 2, 0]} />
    <ambientLight intensity={1} />
    <directionalLight position={[10, 10, 10]} intensity = {0.5} />
    </Suspense>
</Canvas>


        </div>
    </section>
  )
}

export default Hero