import { Link } from "react-router-dom";

// Resume page recreated to match the LaTeX-style PDF layout.
// Serif typography, horizontal-rule section headers, two-column rows.

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="mt-5">
      <h2 className="text-[15px] font-bold tracking-wide text-black uppercase">
        {title}
      </h2>
      <hr className="border-t border-black mt-1" />
    </div>
  );
}

function Row({
  left,
  right,
  leftClass = "font-bold",
  rightClass = "italic",
}: {
  left: React.ReactNode;
  right: React.ReactNode;
  leftClass?: string;
  rightClass?: string;
}) {
  return (
    <div className="flex justify-between items-baseline gap-4">
      <div className={leftClass}>{left}</div>
      <div className={rightClass}>{right}</div>
    </div>
  );
}

function Resume() {
  return (
    <div className="min-h-screen bg-[#E8E6E1] py-8 px-4 print:bg-white print:py-0 print:px-0">
      {/* Toolbar (hidden on print) */}
      <div className="max-w-[850px] mx-auto mb-4 flex justify-between items-center print:hidden">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-[#0F6E56] text-sm hover:text-[#085041] transition-colors"
        >
          <span className="text-xs">←</span>
          Back to portfolio
        </Link>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center justify-center px-4 py-2 bg-[#2C2C2A] text-[#FAF9F7] text-sm rounded-lg hover:bg-[#1a1a1a] transition-colors"
        >
          Print / Save as PDF
        </button>
      </div>

      {/* Page */}
      <article
        className="max-w-[850px] mx-auto bg-white shadow-md print:shadow-none px-12 py-10 text-black font-serif text-[11.5pt] leading-[1.35]"
        style={{ fontFamily: '"Latin Modern Roman", "Computer Modern Serif", "Times New Roman", Times, serif' }}
      >
        {/* Header */}
        <header className="text-center">
          <h1 className="text-[22pt] font-bold tracking-wide">ROWAN STRATTON</h1>
          <p className="mt-1 text-[11pt]">
            +1 (612) 750-5735 <span className="mx-1">⋄</span> Duluth, MN
          </p>
          <p className="text-[11pt]">
            <a href="mailto:rowanstratton1@gmail.com" className="text-[#0000EE] underline">
              rowanstratton1@gmail.com
            </a>
            <span className="mx-1 text-black no-underline">⋄</span>
            <a
              href="https://linkedin.com/in/rowan-stratton-611247247"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#0000EE] underline"
            >
              linkedin.com/in/rowan-stratton-611247247
            </a>
            <span className="mx-1 text-black no-underline">⋄</span>
            <a
              href="https://rowan.page/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#0000EE] underline"
            >
              https://rowan.page/
            </a>
          </p>
        </header>

        {/* Summary */}
        <SectionHeader title="Summary" />
        <p className="mt-2 text-justify">
          Fullstack developer with experience building and deploying production applications in
          React, React Native, TypeScript, Django, and Express. Delivered client-facing software
          used in real-world settings, including an active research study and a client-delivered
          mobile application. Experienced working across the full stack from database design to UI
          implementation.
        </p>

        {/* Education */}
        <SectionHeader title="Education" />
        <div className="mt-2 space-y-1">
          <Row
            left={
              <>
                <span className="font-bold">Master of Science in Computer Science</span>
                , University of Minnesota Duluth
              </>
            }
            right="Expected 2026"
            leftClass=""
            rightClass=""
          />
          <Row
            left={
              <>
                <span className="font-bold">Bachelor of Science in Computer Science</span>
                , Southern New Hampshire University
              </>
            }
            right="2023"
            leftClass=""
            rightClass=""
          />
        </div>

        {/* Skills */}
        <SectionHeader title="Skills" />
        <div className="mt-2 grid grid-cols-[110px_1fr] gap-y-1 gap-x-4">
          <div className="font-bold">Frontend</div>
          <div>React, React Native, TypeScript, JavaScript, Three.js, Tailwind, GSAP, Framer Motion</div>
          <div className="font-bold">Backend</div>
          <div>Django, Django REST Framework, Express, Node.js, REST APIs</div>
          <div className="font-bold">Database</div>
          <div>PostgreSQL, SQLite</div>
          <div className="font-bold">Tools</div>
          <div>Git, GitHub, Docker, Vite, CI/CD, Jest, pytest</div>
        </div>

        {/* Experience */}
        <SectionHeader title="Experience" />

        <div className="mt-2">
          <Row left="Graduate Researcher & Lead Developer" right="May 2024 – Present" />
          <Row
            left="University of Minnesota Duluth"
            right="Duluth, MN"
            leftClass=""
            rightClass="italic"
          />
          <ul className="list-disc pl-6 mt-1 space-y-1">
            <li>
              Architected and built a fullstack mobile application in React Native and Django
              supporting secure data collection, user progression, and administrative workflows
              across an active research study.
            </li>
            <li>
              Designed and implemented 140+ REST API endpoints across a Django/PostgreSQL backend
              supporting longitudinal data capture and structured user records.
            </li>
            <li>
              Led a participatory design process with 3 undergraduate co-developers, coordinating
              frontend and backend development from research findings through deployment.
            </li>
            <li>
              Wrote unit and integration tests across the Django backend (pytest) and React Native
              frontend (Jest) to validate API behavior and component functionality.
            </li>
          </ul>
        </div>

        <div className="mt-3">
          <Row left="Teaching Assistant" right="Aug 2024 – May 2025" />
          <Row
            left="University of Minnesota Duluth"
            right="Duluth, MN"
            leftClass=""
            rightClass="italic"
          />
          <ul className="list-disc pl-6 mt-1 space-y-1">
            <li>
              Led lab sections of 30+ students across 3 semesters for Introduction to Computer
              Science, Python Programming, and Object-Oriented Programming with Java.
            </li>
            <li>
              Taught core programming concepts including debugging, control flow, data structures,
              and object-oriented design.
            </li>
          </ul>
        </div>

        {/* Projects */}
        <SectionHeader title="Projects" />

        <div className="mt-2">
          <Row left="Food Forward" right="React Native, TypeScript, Express, SQLite" />
          <ul className="list-disc pl-6 mt-1 space-y-1">
            <li>
              Built and delivered a time management mobile application for food service employees,
              managing shift workflows and task tracking.
            </li>
            <li>
              Designed a REST API backend in Express with SQLite for structured employee and task
              data, delivered to and actively used by the client.
            </li>
          </ul>
        </div>

        <div className="mt-3">
          <Row left="Itasca Trails" right="React, TypeScript, Vite, Google Maps API" />
          <ul className="list-disc pl-6 mt-1 space-y-1">
            <li>
              Built a community trail information site with geolocation features using the Google
              Maps API, allowing users to explore and contribute local trail data.
            </li>
            <li>
              Deployed live with React Router and Bootstrap for responsive navigation across trail
              listings and community content.
            </li>
          </ul>
        </div>

        <div className="mt-3">
          <Row
            left="Portfolio Site"
            right="React, TypeScript, Three.js, GSAP, Framer Motion, Tailwind"
          />
          <ul className="list-disc pl-6 mt-1 space-y-1">
            <li>
              Built an interactive 3D portfolio site using React Three Fiber and Three.js with GSAP
              and Framer Motion animations.
            </li>
            <li>
              Integrated EmailJS for live contact form functionality and deployed on Vercel.
            </li>
          </ul>
        </div>
      </article>
    </div>
  );
}

export default Resume;
