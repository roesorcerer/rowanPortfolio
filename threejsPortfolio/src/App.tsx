//import { OrbitControls, Sparkles } from "@react-three/drei";
//import { Canvas, useFrame } from "@react-three/fiber";
//import React, { MutableRefObject, useRef } from "react";
//import { Mesh } from "three";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import About from "./components/About";
import Project from "./components/Projects";
import Teaching from "./components/Teaching";
import Contact from "./components/Contact";

const App = () => {
  return (
    <main className="max-w-7xl mx-auto relative">
      <Navbar />
      <Hero />
      <About />
      <Project />
      <Teaching />
      <Contact />
    </main>
  );
};

export default App;
