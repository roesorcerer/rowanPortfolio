import React, { useState } from 'react'

type Props = {}

const ResearchInfo = (props: Props) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({
    stressTrigger: '',
    copingMethod: '',
    gameFeature: '',
    wellnessGoal: '',
    userPreference: ''
  });
  const [showStory, setShowStory] = useState(false);
  const [unlockedParts, setUnlockedParts] = useState<number[]>([]);

  const questions = [
    {
      key: 'stressTrigger',
      question: 'What triggers your stress the most?',
      options: [
        'Exam pressure',
        'Assignment deadlines',
        'Social anxiety',
        'Future uncertainty',
        'Academic performance'
      ]
    },
    {
      key: 'copingMethod',
      question: 'How do you currently cope with stress?',
      options: [
        'Exercise',
        'Meditation',
        'Gaming',
        'Social activities',
        'Creative hobbies'
      ]
    },
    {
      key: 'gameFeature',
      question: 'What game feature would help you manage stress?',
      options: [
        'Guided breathing exercises',
        'Virtual study breaks',
        'Stress-relief mini-games',
        'Progress tracking',
        'Peer support features'
      ]
    },
    {
      key: 'wellnessGoal',
      question: 'What wellness goal would you like to achieve?',
      options: [
        'Better sleep',
        'Reduced anxiety',
        'Improved focus',
        'Emotional balance',
        'Academic confidence'
      ]
    },
    {
      key: 'userPreference',
      question: 'How would you prefer to engage with wellness activities?',
      options: [
        'Daily challenges',
        'Guided sessions',
        'Free exploration',
        'Social interaction',
        'Progress tracking'
      ]
    }
  ];

  const handleOptionSelect = (option: string) => {
    setAnswers(prev => ({
      ...prev,
      [questions[currentStep].key]: option
    }));
    
    // Unlock new story parts based on selections
    if (currentStep === 0 && option === 'Exam pressure') {
      setUnlockedParts(prev => [...prev, 1]);
    }
    if (currentStep === 1 && option === 'Gaming') {
      setUnlockedParts(prev => [...prev, 2]);
    }
    if (currentStep === 2 && option === 'Stress-relief mini-games') {
      setUnlockedParts(prev => [...prev, 3]);
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
      stressTrigger: '',
      copingMethod: '',
      gameFeature: '',
      wellnessGoal: '',
      userPreference: ''
    });
    setShowStory(false);
    setUnlockedParts([]);
  };

  return (
    <div className="w-full h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="w-[800px] h-[600px] bg-gray-800 rounded-lg shadow-2xl p-8 relative">
        {/* Title Bar */}
        <div className="bg-gray-700 rounded-t-lg p-4 mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-pink-200">Complete the story to find out more about my research</h2>
          <button 
            onClick={resetGame}
            className="text-pink-200 hover:text-pink-100 transition-colors"
          >
            Restart
          </button>
        </div>

        {/* Content Area */}
        <div className="bg-gray-700 rounded-lg p-6 h-[calc(100%-80px)]">
          {!showStory ? (
            <div className="text-center">
              <h3 className="text-xl text-pink-200 mb-6">
                {questions[currentStep].question}
              </h3>
              <div className="grid grid-cols-1 gap-3 mb-6">
                {questions[currentStep].options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleOptionSelect(option)}
                    className={`p-3 rounded-lg transition-colors ${
                      answers[questions[currentStep].key as keyof typeof answers] === option
                        ? 'bg-pink-500 text-white'
                        : 'bg-gray-600 text-pink-100 hover:bg-gray-500'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
              <button
                onClick={handleNext}
                disabled={!answers[questions[currentStep].key as keyof typeof answers]}
                className={`px-6 py-2 rounded-lg transition-colors ${
                  answers[questions[currentStep].key as keyof typeof answers]
                    ? 'bg-pink-500 hover:bg-pink-600 text-white'
                    : 'bg-gray-500 text-gray-400 cursor-not-allowed'
                }`}
              >
                {currentStep < questions.length - 1 ? 'Next' : 'Generate Story'}
              </button>
            </div>
          ) : (
            <div className="text-pink-100 space-y-4">
              <h3 className="text-2xl font-bold text-pink-200 mb-4">Your Student Wellness Journey</h3>
              <p>
                In my research, I'm developing a gamified approach to student stress management that addresses 
                {answers.stressTrigger === 'Exam pressure' ? ' academic pressure' : ' various student stress triggers'}. 
                By combining {answers.copingMethod} with interactive technology, we create engaging 
                solutions for student wellness.
              </p>
              {unlockedParts.includes(1) && (
                <p>
                  Our research shows that {answers.stressTrigger} can be effectively managed through 
                  gamified interventions, making stress management more engaging and accessible for students.
                </p>
              )}
              {unlockedParts.includes(2) && (
                <p>
                  By incorporating {answers.gameFeature}, we create an immersive experience that 
                  helps students achieve {answers.wellnessGoal} while maintaining engagement through 
                  {answers.userPreference}.
                </p>
              )}
              {unlockedParts.includes(3) && (
                <p>
                  The combination of stress-relief techniques with gaming elements has shown 
                  promising results in reducing student stress levels and improving academic well-being.
                </p>
              )}
              <p className="mt-6 text-pink-200">
                This interactive journey reflects our research in gamified wellness solutions for students, 
                where user preferences and engagement drive the development of effective stress 
                management tools in academic settings.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ResearchInfo 