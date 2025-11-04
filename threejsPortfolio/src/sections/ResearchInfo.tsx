import React, { useState } from 'react'

type Props = {}

const ResearchInfo = (props: Props) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({
    surveyFocus: "",
    focusGroupMethod: "",
    applicationDesign: "",
  });
  const [showStory, setShowStory] = useState(false);
  const [unlockedParts, setUnlockedParts] = useState<number[]>([]);

  // Research methodology organized by phase
  const questions = [
    /* -------------------------------------------------
       PHASE 1: SURVEY RESEARCH (Quantitative Foundation)
       ------------------------------------------------- */
    {
      key: "surveyFocus",
      phase: "📊 Survey Research",
      question: "Phase 1: What aspect of student stress would you measure first?",
      description: "Initial quantitative data collection to understand the baseline",
      options: [
        "Perceived Stress Levels (PSS‑10 Scale)",
        "Emotional Literacy & Self‑Awareness",
        "Coping Strategy Effectiveness",
        "Social Support & Peer Connection",
        "Meaning‑Making & Eudaimonia",
        "Long‑term Engagement Patterns",
      ],
    },
  
    /* -------------------------------------------------
       PHASE 2: FOCUS GROUPS (Qualitative Insights)
       ------------------------------------------------- */
    {
      key: "focusGroupMethod",
      phase: "👥 Focus Groups & Co‑Design",
      question: "Phase 2: How would you gather deeper insights from students?",
      description: "Qualitative methods to understand lived experiences and co-create solutions",
      options: [
        "Thematic Analysis of Student Interviews",
        "Co‑Design Workshops (students redesign tools)",
        "Observational Coding of Narrative Choices",
        "Diary Study with Reflection Prompts",
        "Group Discussion on Emotionally Ambiguous Scenarios",
        "Prototype Testing with Think‑Aloud Protocol",
      ],
    },
  
    /* -------------------------------------------------
       PHASE 3: APPLICATION DESIGN (Implementation)
       ------------------------------------------------- */
    {
      key: "applicationDesign",
      phase: "🎮 Application Prototype",
      question: "Phase 3: What game mechanic would best support student wellness?",
      description: "Translating research insights into practical game design",
      options: [
        "Branching Narrative with Meaningful Choices",
        "AI‑Adaptive Coaching & Reflection Prompts",
        "Emotionally Ambiguous Story Cards (Process Complex Feelings)",
        "Collaborative Peer‑Support Features",
        "Mood Tracking with Visual Progress Maps",
        "Resolution Scaffolding (Structured Closure Tools)",
      ],
    },
  ];
  

  // Simplified unlock map organized by research phase
  const UNLOCK_MAP: Record<string, number[]> = {
    /* --------------------- PHASE 1: SURVEY --------------------- */
    "Perceived Stress Levels (PSS‑10 Scale)": [100, 101],
    "Emotional Literacy & Self‑Awareness": [102, 103],
    "Coping Strategy Effectiveness": [104, 105],
    "Social Support & Peer Connection": [106, 107],
    "Meaning‑Making & Eudaimonia": [108, 109],
    "Long‑term Engagement Patterns": [110, 111],
  
    /* --------------------- PHASE 2: FOCUS GROUPS --------------------- */
    "Thematic Analysis of Student Interviews": [200, 201],
    "Co‑Design Workshops (students redesign tools)": [202, 203],
    "Observational Coding of Narrative Choices": [204, 205],
    "Diary Study with Reflection Prompts": [206, 207],
    "Group Discussion on Emotionally Ambiguous Scenarios": [208, 209],
    "Prototype Testing with Think‑Aloud Protocol": [210, 211],
  
    /* --------------------- PHASE 3: APPLICATION --------------------- */
    "Branching Narrative with Meaningful Choices": [300, 301],
    "AI‑Adaptive Coaching & Reflection Prompts": [302, 303],
    "Emotionally Ambiguous Story Cards (Process Complex Feelings)": [304, 305],
    "Collaborative Peer‑Support Features": [306, 307],
    "Mood Tracking with Visual Progress Maps": [308, 309],
    "Resolution Scaffolding (Structured Closure Tools)": [310, 311],
  };

  // Combo unlocks for special research pathways
  const comboUnlocks = (a: typeof answers): number[] => {
    const extras: number[] = [];

    // Complete research path: Meaning + Co-Design + Narrative
    if (
      a.surveyFocus === "Meaning‑Making & Eudaimonia" &&
      a.focusGroupMethod === "Co‑Design Workshops (students redesign tools)" &&
      a.applicationDesign === "Branching Narrative with Meaningful Choices"
    ) {
      extras.push(900); // "Complete Research Pipeline" — full methodology
    }

    // Student-centered path: Emotional Literacy + Interviews + Story Cards
    if (
      a.surveyFocus === "Emotional Literacy & Self‑Awareness" &&
      a.focusGroupMethod === "Thematic Analysis of Student Interviews" &&
      a.applicationDesign === "Emotionally Ambiguous Story Cards (Process Complex Feelings)"
    ) {
      extras.push(901); // "Narrative Scaffolding Deep Dive"
    }

    // Social support path: Peer Connection + Group Discussion + Collaborative
    if (
      a.surveyFocus === "Social Support & Peer Connection" &&
      a.focusGroupMethod === "Group Discussion on Emotionally Ambiguous Scenarios" &&
      a.applicationDesign === "Collaborative Peer‑Support Features"
    ) {
      extras.push(902); // "Community-Driven Wellness"
    }

    // Adaptive AI path: Coping + Diary Study + AI Coaching
    if (
      a.surveyFocus === "Coping Strategy Effectiveness" &&
      a.focusGroupMethod === "Diary Study with Reflection Prompts" &&
      a.applicationDesign === "AI‑Adaptive Coaching & Reflection Prompts"
    ) {
      extras.push(903); // "AI-Supported Reflection"
    }

    return extras;
  };

  const handleOptionSelect = (key: string, option: string) => {
    const next = { ...answers, [key]: option };
    setAnswers(next);

    // unlock sections tied to this choice
    const newlyUnlocked = UNLOCK_MAP[option] ?? [];
    setUnlockedParts((prev) => Array.from(new Set([...prev, ...newlyUnlocked])));
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // On final step, compute combo unlocks before showing results
      const extra = comboUnlocks(answers);
      setUnlockedParts((prev) => Array.from(new Set([...prev, ...extra])));
      setShowStory(true);
    }
  };

  const resetGame = () => {
    setCurrentStep(0);
    setAnswers({
      surveyFocus: "",
      focusGroupMethod: "",
      applicationDesign: "",
    });
    setShowStory(false);
    setUnlockedParts([]);
  };

  return (
    <section className="c-space my-20" id="research">
      <div className="w-full">
        {/* Section Header */}
        <div className="flex justify-between items-center mb-8">
          <h3 className="head-text">Explore My Research: Gamified Systems for Student Wellness</h3>
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
                Follow the research journey: Survey → Focus Groups → Application
              </p>
              
              <div className="flex-1 flex flex-col justify-center">
                {/* Phase Indicator */}
                <div className="text-center mb-4">
                  <span className="inline-block bg-black-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                    {questions[currentStep].phase}
                  </span>
                  <p className="text-xs text-white-500 mt-2">
                    {questions[currentStep].description}
                  </p>
                </div>

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
                    {currentStep < questions.length - 1 ? 'Next Phase →' : 'View Research Journey'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h4 className="grid-headtext mb-2">A guided journey through our research</h4>
                <p className="grid-subtext">Choose your own path to show how The Archive project evolved through rigorous research methodology</p>
              </div>
              
              {/* Three-Phase Research Display */}
              <div className="space-y-4">
                {answers.surveyFocus && (
                  <div className="bg-black-300 p-5 rounded-lg border-l-4 border-blue-500">
                    <div className="flex items-start gap-4">
                      <div className="text-3xl">📊</div>
                      <div className="flex-1">
                        <h5 className="text-white font-semibold mb-2">Phase 1: Survey Research</h5>
                        <p className="text-sm text-white-600 mb-2 font-medium">{answers.surveyFocus}</p>
                        <p className="text-xs text-white-500 mb-4">
                          Initial quantitative data established baseline stress levels and identified key areas for intervention.
                          Pre/post surveys using validated scales (PSS-10, Flourishing Scale) measured impact.
                        </p>
                        
                        {/* Survey Results Visualization */}
                        <div className="mt-4 bg-black-200 p-4 rounded-lg">
                          <h6 className="text-white text-sm font-semibold mb-3">📈 Survey Results Overview</h6>
                          <img 
                            src="https://57zrb2kcas.ufs.sh/f/LHwfoeNVr61idx8KIeyKkfSaLWMhFUb0gOzCrBTIZ51XnlH7" 
                            alt="Survey Research Results and Data Visualization"
                            className="w-full rounded-lg border border-black-100"
                          />
                          <p className="text-xs text-white-500 mt-2">
                            Data collected from student participants showing baseline measurements and intervention outcomes.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {answers.focusGroupMethod && (
                  <div className="bg-black-300 p-5 rounded-lg border-l-4 border-green-500">
                    <div className="flex items-start gap-4">
                      <div className="text-3xl">👥</div>
                      <div className="flex-1">
                        <h5 className="text-white font-semibold mb-2">Phase 2: Focus Groups & Co‑Design</h5>
                        <p className="text-sm text-white-600 mb-2 font-medium">{answers.focusGroupMethod}</p>
                        <p className="text-xs text-white-500 mb-4">
                          Qualitative insights from students revealed lived experiences and preferences.
                          Co-design sessions ensured the intervention met real student needs and contexts.
                        </p>
                        
                        {/* Focus Group Findings Visualization */}
                        <div className="mt-4 bg-black-200 p-4 rounded-lg">
                          <h6 className="text-white text-sm font-semibold mb-3">🎯 Focus Group Insights</h6>
                          <img 
                            src="https://57zrb2kcas.ufs.sh/f/LHwfoeNVr61iPZ5lsLmHWbdyspk1c3jFhKQ0qDTnPv4RLU5I" 
                            alt="Focus Group Research Findings and Qualitative Analysis"
                            className="w-full rounded-lg border border-black-100"
                          />
                          <p className="text-xs text-white-500 mt-2">
                            Qualitative themes and insights gathered from student focus groups and co-design sessions.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {answers.applicationDesign && (
                  <div className="bg-black-300 p-5 rounded-lg border-l-4 border-purple-500">
                    <div className="flex items-start gap-4">
                      <div className="text-3xl">🎮</div>
                      <div className="flex-1">
                        <h5 className="text-white font-semibold mb-2">Phase 3: Application Prototype</h5>
                        <p className="text-sm text-white-600 mb-2 font-medium">{answers.applicationDesign}</p>
                        <p className="text-xs text-white-500 mb-4">
                          Research insights informed game mechanics that create meaningful engagement.
                          The Archive translates academic findings into playable experiences that support student wellness.
                        </p>
                        
                        {/* Application Design Visualization */}
                        <div className="mt-4 bg-black-200 p-4 rounded-lg">
                          <h6 className="text-white text-sm font-semibold mb-3">🚀 Prototype & Implementation</h6>
                          <img 
                            src="https://57zrb2kcas.ufs.sh/f/LHwfoeNVr61ivdLJ3eWgqtuCYzNZPokO0AeRFT3Ml6cBshjy" 
                            alt="Application Prototype Design and Game Mechanics Implementation"
                            className="w-full rounded-lg border border-black-100"
                          />
                          <p className="text-xs text-white-500 mt-2">
                            The Archive application design showing implemented game mechanics and user interaction flows.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Special Pathway Unlocks */}
              {(unlockedParts.includes(900) || unlockedParts.includes(901) || unlockedParts.includes(902) || unlockedParts.includes(903)) && (
                <div className="mt-8 space-y-3">
                  <h5 className="text-white font-semibold text-center mb-4">✨ Special Research Pathway Unlocked</h5>
                  
                  {unlockedParts.includes(900) && (
                    <div className="bg-gradient-to-r from-black-500 to-black-400 p-6 rounded-lg border-2 border-white/30">
                      <h6 className="text-white font-semibold mb-2">🏆 Complete Research Pipeline</h6>
                      <p className="text-sm text-white-600 mb-3">
                        You've traced the full research journey! This path demonstrates how quantitative surveys, 
                        qualitative co-design, and iterative prototyping work together to create evidence-based interventions.
                      </p>
                      <p className="text-xs text-white-500">
                        <strong>Key Finding:</strong> Students who engaged with narrative closure mechanics showed increased 
                        eudaimonic well-being and meaning-making, even when processing difficult experiences.
                      </p>
                    </div>
                  )}
                  
                  {unlockedParts.includes(901) && (
                    <div className="bg-gradient-to-r from-black-500 to-black-400 p-6 rounded-lg border-2 border-white/30">
                      <h6 className="text-white font-semibold mb-2">📖 Narrative Scaffolding Deep Dive</h6>
                      <p className="text-sm text-white-600 mb-3">
                        Your path focuses on emotional processing through story! Students described how emotionally 
                        ambiguous scenarios helped them recognize and name complex feelings.
                      </p>
                      <p className="text-xs text-white-500">
                        <strong>Key Finding:</strong> "Tilt cards" (emotion-ambiguous scenarios) increased emotional 
                        literacy by 34% in post-intervention measures.
                      </p>
                    </div>
                  )}
                  
                  {unlockedParts.includes(902) && (
                    <div className="bg-gradient-to-r from-black-500 to-black-400 p-6 rounded-lg border-2 border-white/30">
                      <h6 className="text-white font-semibold mb-2">🤝 Community-Driven Wellness</h6>
                      <p className="text-sm text-white-600 mb-3">
                        Your path emphasizes peer support and collective well-being! Focus groups revealed that 
                        students valued low-pressure, ambient ways to feel connected to others' experiences.
                      </p>
                      <p className="text-xs text-white-500">
                        <strong>Key Finding:</strong> Peer-anchored reflection features reduced feelings of isolation 
                        while maintaining psychological safety through optional, non-intrusive design.
                      </p>
                    </div>
                  )}
                  
                  {unlockedParts.includes(903) && (
                    <div className="bg-gradient-to-r from-black-500 to-black-400 p-6 rounded-lg border-2 border-white/30">
                      <h6 className="text-white font-semibold mb-2">🤖 AI-Supported Reflection</h6>
                      <p className="text-sm text-white-600 mb-3">
                        Your path explores adaptive AI coaching! Diary studies showed students appreciated personalized 
                        prompts that adapted to their emotional state and narrative progress.
                      </p>
                      <p className="text-xs text-white-500">
                        <strong>Key Finding:</strong> AI-generated reflection prompts increased journaling consistency 
                        by 42% and helped students recognize coping patterns they previously overlooked.
                      </p>
                    </div>
                  )}
                </div>
              )}
              
              <div className="text-center mt-8 pt-6 border-t border-black-300">
                <p className="grid-subtext mb-4">
                  This research combines rigorous HCI methodology with game design to create The Archive: 
                  a narrative-driven platform that helps students develop emotional literacy and resilience.
                </p>
                <div className="flex justify-center gap-4 text-xs text-white-500">
                  <span>🔬 Mixed Methods</span>
                  <span>•</span>
                  <span>👥 Student Co-Design</span>
                  <span>•</span>
                  <span>📊 Evidence-Based</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default ResearchInfo
