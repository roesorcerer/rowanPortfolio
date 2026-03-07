import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type ResearchProject = {
  id: number;
  title: string;
  role: string;
  timeline: string;
  oneLiner: string; // Short description shown by default
  methods?: string[];
  findings?: string[];
  status: 'active' | 'completed' | 'thesis';
};

const Research: React.FC = () => {
  const [expandedProject, setExpandedProject] = useState<number | null>(null);

  const researchProjects: ResearchProject[] = [
    {
      id: 1,
      title: "The Archive",
      role: "Principal Researcher",
      timeline: "2024 - Present",
      oneLiner: "Mobile app using narrative game mechanics for personalized wellness interventions.",
      methods: ["Mixed-methods design", "Big Five personality integration", "React Native + Django", "A/B testing"],
      findings: ["Narrative delivery outperforms traditional gamification", "Personality-based matching improves retention"],
      status: 'active'
    },
    {
      id: 2,
      title: "Gamification & Community-Centered Design",
      role: "Lead Researcher",
      timeline: "2023 - 2024",
      oneLiner: "Thesis research on game design elements in stress management apps using participatory methods.",
      methods: ["Focus groups with TTRPG probes", "Thematic analysis", "Self-Determination Theory framework"],
      findings: ["Students prefer narrative over points/badges", "Community involvement increases perceived value"],
      status: 'thesis'
    }
  ];

  const interests = [
    "Human-Computer Interaction",
    "Games & Gamification", 
    "Digital Mental Health",
    "Self-Determination Theory"
  ];

  return (
    <section className="c-space my-20" id="research">
      <div className="max-w-4xl mx-auto">
        {/* Header - Concise */}
        <div className="text-center mb-12">
          <h2 className="head-text">Research</h2>
          <p className="text-white-600 mt-2">
            How narrative game design can support user wellbeing.
          </p>
        </div>

        {/* Research Interests - Compact pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {interests.map((interest, i) => (
            <span 
              key={i}
              className="px-4 py-2 bg-black-200 text-white-600 rounded-full text-sm border border-black-300"
            >
              {interest}
            </span>
          ))}
        </div>

        {/* Projects - Expandable cards */}
        <div className="space-y-4 mb-12">
          {researchProjects.map((project) => (
            <motion.div
              key={project.id}
              className="bg-black-200 rounded-xl border border-black-300 overflow-hidden"
            >
              {/* Always visible header */}
              <button
                onClick={() => setExpandedProject(expandedProject === project.id ? null : project.id)}
                className="w-full p-6 text-left flex items-start justify-between gap-4 hover:bg-black-300/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-white font-semibold">{project.title}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      project.status === 'active' ? 'bg-green-500/20 text-green-400' :
                      project.status === 'thesis' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-white/10 text-white-600'
                    }`}>
                      {project.status === 'thesis' ? 'Thesis' : project.status === 'active' ? 'Active' : 'Completed'}
                    </span>
                  </div>
                  <p className="text-white-600 text-sm">{project.oneLiner}</p>
                </div>
                
                <div className="flex items-center gap-3">
                  <span className="text-white-500 text-sm hidden sm:block">{project.timeline}</span>
                  <svg 
                    className={`w-5 h-5 text-white-500 transition-transform ${expandedProject === project.id ? 'rotate-180' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {/* Expandable details */}
              <AnimatePresence>
                {expandedProject === project.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="border-t border-black-300"
                  >
                    <div className="p-6 grid md:grid-cols-2 gap-6">
                      {project.methods && (
                        <div>
                          <h4 className="text-white text-sm font-medium mb-2">Methods</h4>
                          <ul className="space-y-1">
                            {project.methods.map((m, i) => (
                              <li key={i} className="text-white-600 text-sm flex items-center gap-2">
                                <span className="w-1 h-1 bg-blue-400 rounded-full" />
                                {m}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {project.findings && (
                        <div>
                          <h4 className="text-white text-sm font-medium mb-2">Key Findings</h4>
                          <ul className="space-y-1">
                            {project.findings.map((f, i) => (
                              <li key={i} className="text-white-600 text-sm flex items-center gap-2">
                                <span className="w-1 h-1 bg-green-400 rounded-full" />
                                {f}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Skills - Inline instead of grid */}
        <div className="text-center">
          <p className="text-white-600 text-sm mb-3">Research methods:</p>
          <p className="text-white-500 text-sm">
            Focus Groups • Thematic Analysis • Survey Design • A/B Testing • Participatory Design
          </p>
        </div>
      </div>
    </section>
  );
};

export default Research;