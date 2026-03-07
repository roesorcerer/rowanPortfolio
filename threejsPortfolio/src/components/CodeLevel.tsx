import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

type Skill = {
  name: string;
  level: 1 | 2 | 3 | 4 | 5;
  category: string;
};

const skills: Skill[] = [
  // Frontend
  { name: 'React', level: 4, category: 'Frontend' },
  { name: 'TypeScript', level: 4, category: 'Frontend' },
  { name: 'React Native', level: 3, category: 'Frontend' },
  { name: 'Three.js', level: 3, category: 'Frontend' },
  // Backend
  { name: 'Python', level: 4, category: 'Backend' },
  { name: 'Django', level: 4, category: 'Backend' },
  { name: 'Node.js', level: 3, category: 'Backend' },
  { name: 'SQL', level: 4, category: 'Database' },
  // Game Dev
  { name: 'Unity', level: 3, category: 'Game Dev' },
  { name: 'Godot', level: 3, category: 'Game Dev' },
  // Tools
  { name: 'Git', level: 4, category: 'Tools' },
];

const levelLabels = ['', 'Learning', 'Familiar', 'Proficient', 'Advanced', 'Expert'];

const Skills: React.FC = () => {
  const [leetCodeTotal, setLeetCodeTotal] = useState<number | null>(null);

  useEffect(() => {
    fetch('https://leetcode-stats-api.herokuapp.com/roesorcerer')
      .then(res => res.json())
      .then(data => setLeetCodeTotal(data.easySolved + data.mediumSolved + data.hardSolved))
      .catch(() => setLeetCodeTotal(null));
  }, []);

  const categories = [...new Set(skills.map(s => s.category))];

  return (
    <section className="c-space my-20" id="skills">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="head-text">Skills</h2>
        </div>

        {/* Compact skill grid by category */}
        <div className="space-y-8 mb-10">
          {categories.map(category => (
            <div key={category}>
              <h3 className="text-white-500 text-sm mb-3">{category}</h3>
              <div className="flex flex-wrap gap-2">
                {skills.filter(s => s.category === category).map(skill => (
                  <div
                    key={skill.name}
                    className="flex items-center gap-2 px-3 py-2 bg-black-200 rounded-lg border border-black-300"
                  >
                    <span className="text-white text-sm">{skill.name}</span>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map(i => (
                        <div
                          key={i}
                          className={`w-1.5 h-1.5 rounded-full ${i <= skill.level ? 'bg-white' : 'bg-white/20'}`}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Compact stats row */}
        <div className="flex flex-wrap justify-center gap-6 pt-6 border-t border-black-300">
          {leetCodeTotal !== null && (
            <a 
              href="https://leetcode.com/roesorcerer" 
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-white-600 hover:text-white transition-colors"
            >
              <img src="https://leetcode.com/static/images/LeetCode_logo_oj.png" alt="" className="w-4 h-4" />
              <span className="text-sm">{leetCodeTotal} LeetCode problems</span>
            </a>
          )}
          <a 
            href="https://github.com/roesorcerer" 
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-white-600 hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
            </svg>
            <span className="text-sm">View GitHub</span>
          </a>
        </div>
      </div>
    </section>
  );
};

export default Skills;