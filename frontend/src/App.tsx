import React from "react";
import Navigation from "./components/Header";
import Main from "./components/Main";

export function sum(a: number, b: number): number {
  return a + b
}
function App() {
  return (
    <>
      <Navigation />
      <Main />
    </>
  );
}

export default App;
