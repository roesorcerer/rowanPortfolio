import React, { useState } from 'react'

type Props = {}

  const ResearchInfo = (props: Props) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState({
      researchFocus: "",
      methodInterest: "",
      designElement: "",
      learningMode: "",
      outcomePreference: "",
    });
    const [showStory, setShowStory] = useState(false);
    const [unlockedParts, setUnlockedParts] = useState<number[]>([]);
  
    // Player-facing questions drawn from The Archive project
    const questions = [
      {
        key: "researchFocus",
        question: "What part of The Archive do you want to explore first?",
        options: [
          "Narrative Endings & Closure",
          "Goal-Setting System",
          "Adaptive Story Engine",
          "Personality-Aligned Paths (Big Five)",
          "Co-Design Findings with Students",
          "Stress Tracking & Reflection",
        ],
      },
      {
        key: "methodInterest",
        question: "How do we evaluate impact in this study?",
        options: [
          "Pre/Post Surveys (PSS-10)",
          "In-Game Telemetry (choices, time, paths)",
          "Weekly Reflection/Usage Diaries",
          "Focus Groups & Interviews",
          "Qualitative Coding & Thematic Analysis",
        ],
      },
      {
        key: "designElement",
        question: "Which game mechanic should your tour emphasize?",
        options: [
          "Branching Choices & Endings",
          "Coping Tools & Rewards",
          "The Curator (NPC Guide)",
          "The Archive Environment (shifting library)",
          "Mystery/Progression Mechanics",
        ],
      },
      {
        key: "learningMode",
        question: "Pick your learning mode:",
        options: [
          "Quick Overview (2 min)",
          "Deep Dive (5 min)",
          "Hands-On Demo (play a passage)",
          "Evidence First (jump to results)",
        ],
      },
      {
        key: "outcomePreference",
        question: "Which outcome matters most to you?",
        options: [
          "Reduced Perceived Stress",
          "Sense of Meaning / Eudaimonia",
          "Skill Transfer to Real Life",
          "Autonomy & Personalization",
          "Acceptance & Trust in the System",
        ],
      },
    ];
  
    // Map answers to unlockable sections of the research walkthrough
    const UNLOCK_MAP: Record<string, number[]> = {
      "Narrative Endings & Closure": [101],          // findings on narrative closure vs open-ended
      "Goal-Setting System": [102],                  // sub-hypothesis details
      "Adaptive Story Engine": [103],                // React Native + Django, dynamic passages
      "Personality-Aligned Paths (Big Five)": [104], // trait-guided pathing overview
      "Co-Design Findings with Students": [105],     // insights from workshops/focus groups
      "Stress Tracking & Reflection": [106],         // reflection UI & variable tracking
  
      "Pre/Post Surveys (PSS-10)": [201],
      "In-Game Telemetry (choices, time, paths)": [202],
      "Weekly Reflection/Usage Diaries": [203],
      "Focus Groups & Interviews": [204],
      "Qualitative Coding & Thematic Analysis": [205],
  
      "Branching Choices & Endings": [301],
      "Coping Tools & Rewards": [302],
      "The Curator (NPC Guide)": [303],
      "The Archive Environment (shifting library)": [304],
      "Mystery/Progression Mechanics": [305],
  
      "Quick Overview (2 min)": [401],
      "Deep Dive (5 min)": [402],
      "Hands-On Demo (play a passage)": [403],
      "Evidence First (jump to results)": [404],
  
      "Reduced Perceived Stress": [501],
      "Sense of Meaning / Eudaimonia": [502],
      "Skill Transfer to Real Life": [503],
      "Autonomy & Personalization": [504],
      "Acceptance & Trust in the System": [505],
    };
  
    // Optional combo unlocks for special paths (tailored to your thesis)
    const comboUnlocks = (a: typeof answers): number[] => {
      const extras: number[] = [];
  
      // Core thesis path: Narrative Endings + Eudaimonia
      if (
        a.researchFocus === "Narrative Endings & Closure" &&
        a.outcomePreference === "Sense of Meaning / Eudaimonia"
      ) {
        extras.push(900); // “Why Endings Matter” — key argument + sample findings
      }
  
      // Methods-first path: Evidence First + PSS-10
      if (
        a.learningMode === "Evidence First (jump to results)" &&
        a.methodInterest === "Pre/Post Surveys (PSS-10)"
      ) {
        extras.push(901); // “Results Snapshot” — pre/post effect overview
      }
  
      // System design path: Adaptive Engine + Hands-On Demo
      if (
        a.designElement === "Branching Choices & Endings" &&
        a.learningMode === "Hands-On Demo (play a passage)"
      ) {
        extras.push(902); // “Play a Passage” — loads demo content
      }
  
      return extras;
    };
  
    const handleOptionSelect = (key: string, option: string) => {
      const next = { ...answers, [key]: option };
      setAnswers(next);
  
      // unlock sections tied to this choice
      const newlyUnlocked = UNLOCK_MAP[option] ?? [];
      setUnlockedParts((prev) => Array.from(new Set([...prev, ...newlyUnlocked])));
  
      // when a page is fully answered, compute combo unlocks
      if (currentStep === questions.length - 1) {
        const extra = comboUnlocks(next);
        setUnlockedParts((prev) => Array.from(new Set([...prev, ...extra])));
        setShowStory(true); // move to the research tour
      } else {
        setCurrentStep((s) => s + 1);
      }
    };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      setShowStory(true);
    }
  };

  const resetGame = () => {
    setCurrentStep(0);
    setAnswers({
      researchFocus: "",
      methodInterest: "",
      designElement: "",
      learningMode: "",
      outcomePreference: "",
    });
    setShowStory(false);
    setUnlockedParts([]);
  };

  return (
    <section className="c-space my-20" id="research">
      <div className="w-full">
        {/* Section Header */}
        <div className="flex justify-between items-center mb-8">
          <h3 className="head-text">Explore My Research: The Archive</h3>
          <button 
            onClick={resetGame}
            className="text-white-600 hover:text-white transition-colors text-sm"
          >
            ↺ Restart Tour
          </button>
        </div>

        {/* Content Area */}
        <div className="grid-container min-h-[500px]">
          {!showStory ? (
            <div className="flex flex-col">
              <p className="grid-subtext mb-6 text-center">
                Answer questions to unlock a personalized tour of my thesis research on gamified student wellness
              </p>
              
              <div className="flex-1 flex flex-col justify-center">
                <h4 className="grid-headtext text-center mb-6">
                  {questions[currentStep].question}
                </h4>
                
                <div className="grid md:grid-cols-2 grid-cols-1 gap-3 mb-8">
                  {questions[currentStep].options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleOptionSelect(questions[currentStep].key, option)}
                      className={`p-4 rounded-lg transition-all duration-200 text-left ${
                        answers[questions[currentStep].key as keyof typeof answers] === option
                          ? 'bg-black-500 text-white border border-white/20'
                          : 'bg-black-300 text-white-600 hover:bg-black-500 hover:text-white border border-black-200'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                
                <div className="flex justify-center items-center gap-2">
                  <div className="flex gap-2">
                    {questions.map((_, idx) => (
                      <div
                        key={idx}
                        className={`h-2 w-2 rounded-full transition-colors ${
                          idx === currentStep
                            ? 'bg-white'
                            : idx < currentStep
                            ? 'bg-white/50'
                            : 'bg-black-300'
                        }`}
                      />
                    ))}
                  </div>
                  
                  <button
                    onClick={handleNext}
                    disabled={!answers[questions[currentStep].key as keyof typeof answers]}
                    className={`ml-4 px-6 py-2 rounded-lg transition-colors ${
                      answers[questions[currentStep].key as keyof typeof answers]
                        ? 'bg-black-500 hover:bg-black-600 text-white'
                        : 'bg-black-200 text-white-600 cursor-not-allowed'
                    }`}
                  >
                    {currentStep < questions.length - 1 ? 'Next →' : 'View Results'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h4 className="grid-headtext mb-2">Your Personalized Research Tour</h4>
                <p className="grid-subtext">Based on your selections, here's what The Archive is about:</p>
              </div>
              
              <div className="grid md:grid-cols-2 grid-cols-1 gap-4">
                {answers.researchFocus && (
                  <div className="bg-black-300 p-5 rounded-lg border border-black-200 hover:border-white/20 transition-colors">
                    <h5 className="text-white font-semibold mb-2">📚 Research Focus</h5>
                    <p className="text-sm text-white-600 mb-2">{answers.researchFocus}</p>
                    <p className="text-xs text-white-500">The Archive explores this through narrative-driven gameplay that adapts to student needs.</p>
                  </div>
                )}
                
                {answers.methodInterest && (
                  <div className="bg-black-300 p-5 rounded-lg border border-black-200 hover:border-white/20 transition-colors">
                    <h5 className="text-white font-semibold mb-2">📊 Evaluation Method</h5>
                    <p className="text-sm text-white-600 mb-2">{answers.methodInterest}</p>
                    <p className="text-xs text-white-500">Rigorous mixed-methods research to understand impact on student wellness.</p>
                  </div>
                )}
                
                {answers.designElement && (
                  <div className="bg-black-300 p-5 rounded-lg border border-black-200 hover:border-white/20 transition-colors">
                    <h5 className="text-white font-semibold mb-2">🎮 Design Element</h5>
                    <p className="text-sm text-white-600 mb-2">{answers.designElement}</p>
                    <p className="text-xs text-white-500">Creates meaningful engagement and helps develop real-world coping strategies.</p>
                  </div>
                )}
                
                {answers.learningMode && (
                  <div className="bg-black-300 p-5 rounded-lg border border-black-200 hover:border-white/20 transition-colors">
                    <h5 className="text-white font-semibold mb-2">🔍 Learning Mode</h5>
                    <p className="text-sm text-white-600 mb-2">{answers.learningMode}</p>
                    <p className="text-xs text-white-500">Your preferred approach to understanding the research.</p>
                  </div>
                )}
                
                {answers.outcomePreference && (
                  <div className="bg-black-300 p-5 rounded-lg border border-black-200 hover:border-white/20 transition-colors">
                    <h5 className="text-white font-semibold mb-2">🎯 Primary Outcome</h5>
                    <p className="text-sm text-white-600 mb-2">{answers.outcomePreference}</p>
                    <p className="text-xs text-white-500">How The Archive measures success and impact on student well-being.</p>
                  </div>
                )}
              </div>
              
              {(unlockedParts.includes(900) || unlockedParts.includes(901) || unlockedParts.includes(902)) && (
                <div className="mt-6 space-y-3">
                  <h5 className="text-white font-semibold text-center mb-4">✨ Special Insights Unlocked</h5>
                  
                  {unlockedParts.includes(900) && (
                    <div className="bg-black-500 p-5 rounded-lg border-2 border-white/30">
                      <h6 className="text-white font-semibold mb-2">🔓 Why Endings Matter</h6>
                      <p className="text-sm text-white-600">Your combination unlocked a core thesis insight: Narrative closure provides a sense of meaning and eudaimonia, 
                      helping students find purpose even in challenging experiences.</p>
                    </div>
                  )}
                  
                  {unlockedParts.includes(901) && (
                    <div className="bg-black-500 p-5 rounded-lg border-2 border-white/30">
                      <h6 className="text-white font-semibold mb-2">🔓 Results Snapshot</h6>
                      <p className="text-sm text-white-600">Pre/post surveys show measurable reductions in perceived stress (PSS-10) among students who engaged 
                      with narrative-based stress management tools.</p>
                    </div>
                  )}
                  
                  {unlockedParts.includes(902) && (
                    <div className="bg-black-500 p-5 rounded-lg border-2 border-white/30">
                      <h6 className="text-white font-semibold mb-2">🔓 Interactive Demo</h6>
                      <p className="text-sm text-white-600">Experience how branching narratives create meaningful choices that help students process stress 
                      and build resilience through gameplay.</p>
                    </div>
                  )}
                </div>
              )}
              
              <div className="text-center mt-6 pt-6 border-t border-black-300">
                <p className="grid-subtext">
                  This personalized tour reflects your interests in student wellness research and gamification. 
                  The Archive combines these elements to create meaningful experiences for student stress management.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default ResearchInfo 