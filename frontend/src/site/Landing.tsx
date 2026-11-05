import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import ContactPanel from "./ContactPanel";
import HeroCorridor from "./HeroCorridor";
import StairsSection from "./StairsSection";
import WorkSection from "./WorkSection";

const FACTS = [
  { label: "Location", value: "Coleraine, MN" },
  {
    label: "Education",
    value: "MS Computer Science, UMN Duluth, 2026. BS Computer Science, SNHU, 2023.",
  },
  { label: "Research", value: "Five peer-reviewed papers across CSCW, HCII and HealthInf." },
  { label: "Also worked with", value: "C++, Angular, Vue 3, Next.js, Azure Key Vault" },
];

function Landing() {
  const { hash } = useLocation();

  useEffect(() => {
    document.title = "Rowan Stratton | Software engineer and game developer";
  }, []);

  // The router doesn't scroll to a hash, and links here come from other pages.
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView();
  }, [hash]);

  return (
    <div className="stack-page">
      <section className="sec hero" aria-labelledby="hero-name">
        <div className="hero-text">
          <p className="hero-kicker">Open to software and game development roles</p>
          <h1 id="hero-name" className="d hero-name">
            <span>Rowan</span>
            <span>Stratton</span>
          </h1>
          <p className="hero-lede">
            Software engineer, game developer and HCI researcher. I build full stack
            applications and games.
          </p>
          <div className="actions">
            <Link className="cmd primary" to="/play">
              Play my story
            </Link>
            <Link className="cmd" to="/resume">
              View resume
            </Link>
            <a className="cmd" href="#contact">
              Contact me
            </a>
          </div>
        </div>
        <HeroCorridor />
      </section>

      <section id="about" className="sec" aria-labelledby="about-h">
        <h2 id="about-h" className="d strip">
          At a glance
        </h2>
        <dl className="sec-body facts">
          {FACTS.map((fact) => (
            <div key={fact.label}>
              <dt>{fact.label}</dt>
              <dd>{fact.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <WorkSection />
      <StairsSection />
      <ContactPanel />
    </div>
  );
}

export default Landing;
