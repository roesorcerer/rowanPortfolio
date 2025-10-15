import React, { useState, useEffect, useRef } from 'react';
import ReactStars from 'react-rating-stars-component';
import { motion } from 'framer-motion';

// Define types for our data structures
type Review = {
  id: string;
  technology: string;
  rating: number;
  comment?: string;
  reviewer: string;
  date: string;
  isApproved: boolean;
};

type CodingChallenge = {
  platform: 'LeetCode' | 'Edabit';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  completed: number;
  total: number;
  lastUpdated: string;
};

type Technology = {
  name: string;
  icon?: string;
  category: 'Frontend' | 'Backend' | 'Database' | 'DevOps' | 'Other';
  description: string;
  color: string;
  challenges?: CodingChallenge[];
};

const CodeLevel: React.FC = () => {
  const technologies: Technology[] = [
    { 
      name: 'JavaScript', 
      category: 'Frontend',
      description: 'The foundation of modern web development',
      color: '#f7df1e'
    },
    { 
      name: 'TypeScript', 
      category: 'Frontend',
      description: 'Type-safe JavaScript for robust applications',
      color: '#3178c6'
    },
    { 
      name: 'React', 
      category: 'Frontend',
      description: 'Building dynamic user interfaces',
      color: '#61dafb'
    },
    { 
      name: 'Node.js', 
      category: 'Backend',
      description: 'Server-side JavaScript runtime',
      color: '#339933'
    },
    { 
      name: 'Python', 
      category: 'Backend',
      description: 'Versatile programming language for various applications',
      color: '#3776ab'
    },
    { 
      name: 'SQL', 
      category: 'Database',
      description: 'Managing and manipulating databases',
      color: '#336791'
    },
    { 
      name: 'MongoDB', 
      category: 'Database',
      description: 'NoSQL database for modern applications',
      color: '#47a248'
    },
    { 
      name: 'Docker', 
      category: 'DevOps',
      description: 'Containerization and deployment',
      color: '#2496ed'
    },
    { 
      name: 'Git', 
      category: 'DevOps',
      description: 'Version control and collaboration',
      color: '#f05032'
    },
  ];

  // State management
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReview, setNewReview] = useState<{
    technology: string;
    rating: number;
    comment: string;
    reviewer: string;
  }>({
    technology: '',
    rating: 0,
    comment: '',
    reviewer: '',
  });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Add state for coding challenges
  const [codingChallenges, setCodingChallenges] = useState<{ [key: string]: CodingChallenge[] }>({});

  // Add new state for detailed LeetCode data
  const [leetCodeDetailedData, setLeetCodeDetailedData] = useState<any>(null);

  // Add loading and error states
  const [isLoadingLeetCode, setIsLoadingLeetCode] = useState(false);
  const [leetCodeError, setLeetCodeError] = useState<string | null>(null);

  // Auto-scroll functionality
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = prevIndex + 1;
        return nextIndex >= Math.ceil(technologies.length / 3) ? 0 : nextIndex;
      });
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(timer);
  }, [isPaused]);

  // Handle manual navigation
  const handlePrev = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? Math.ceil(technologies.length / 3) - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === Math.ceil(technologies.length / 3) - 1 ? 0 : prevIndex + 1
    );
  };

  // Calculate visible technologies
  const getVisibleTechnologies = () => {
    const start = currentIndex * 3;
    return technologies.slice(start, start + 3);
  };

  // Handle review submission
  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const review: Review = {
      id: Date.now().toString(),
      ...newReview,
      date: new Date().toISOString(),
      isApproved: true, // For demo, auto-approve
    };
    setReviews(prev => [...prev, review]);
    setNewReview({
      technology: '',
      rating: 0,
      comment: '',
      reviewer: '',
    });
  };

  // Calculate average rating for a technology
  const getAverageRating = (tech: string) => {
    const techReviews = reviews.filter(r => r.technology === tech && r.isApproved);
    if (techReviews.length === 0) return 0;
    const sum = techReviews.reduce((acc, curr) => acc + curr.rating, 0);
    return (sum / techReviews.length);
  };

  // Add thought cabinet style descriptions
  const getSkillThought = (skill: string, rating: number): string => {
    const thoughts: { [key: string]: { low: string; medium: string; high: string } } = {
      'React': {
        low: "The virtual DOM remains a mystery, like shadows in the night. Components are scattered fragments of a greater whole.",
        medium: "The component lifecycle flows through your mind like a river. Props and state dance in perfect harmony.",
        high: "You've mastered the art of component composition. The virtual DOM bends to your will, rendering reality from pure thought."
      },
      'TypeScript': {
        low: "Type definitions are like ancient runes, their meaning just beyond reach. The compiler's warnings echo in your mind.",
        medium: "Types flow through your code like water through a stream. Interfaces and generics form a protective shield around your logic.",
        high: "You've achieved type enlightenment. The compiler bows before your mastery, and type safety is your eternal companion."
      },
      'Node.js': {
        low: "The event loop remains an enigma, its secrets hidden in the depths of asynchronous chaos.",
        medium: "The event loop pulses in your mind, a steady rhythm of callbacks and promises. The server responds to your every command.",
        high: "You've become one with the event loop. Asynchronous operations flow like water, and the server bends to your will."
      },
      'Python': {
        low: "The Zen of Python whispers in the distance, its wisdom just beyond your grasp.",
        medium: "Python's elegance flows through your code. The language's simplicity reveals its hidden power.",
        high: "You've achieved Pythonic enlightenment. Your code is poetry in motion, each line a perfect expression of computational beauty."
      },
      'SQL': {
        low: "Database tables stretch before you like an endless maze. Queries are riddles waiting to be solved.",
        medium: "Tables and relationships form a perfect dance in your mind. Queries flow like water, finding data with precision.",
        high: "You've mastered the art of data manipulation. The database speaks to you in its native tongue, revealing all its secrets."
      },
      'AWS': {
        low: "The cloud remains a vast, unknown territory. Services drift like islands in a digital sea.",
        medium: "The cloud's architecture unfolds before you. Services connect like constellations in the digital sky.",
        high: "You've become a cloud architect. The digital heavens bend to your will, and infrastructure flows like water."
      },
      'Docker': {
        low: "Containers float in the digital void, their secrets locked away. The Dockerfile remains a cryptic scroll.",
        medium: "Containers dance at your command. Images build and deploy like clockwork, each layer a perfect piece of the puzzle.",
        high: "You've mastered the art of containerization. The digital world is your oyster, and Docker is your pearl."
      },
      'Git': {
        low: "The repository stretches before you like an ancient forest. Branches twist and turn in mysterious ways.",
        medium: "The repository flows through your mind. Commits tell stories, and branches weave tales of development.",
        high: "You've achieved Git mastery. The repository is your canvas, and each commit is a stroke of genius."
      }
    };

    if (rating <= 2) return thoughts[skill]?.low || "The path to mastery is long and winding.";
    if (rating <= 4) return thoughts[skill]?.medium || "Progress is made, one step at a time.";
    return thoughts[skill]?.high || "Mastery achieved, but the journey never truly ends.";
  };

  // Function to fetch detailed LeetCode data using GraphQL API
  const fetchLeetCodeDetailedData = async (username: string) => {
    try {
      const response = await fetch('https://leetcode.com/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query userProfile($username: String!) {
              matchedUser(username: $username) {
                username
                profile {
                  ranking
                  realName
                  countryName
                  starRating
                  aboutMe
                  userAvatar
                  reputation
                  postViewCount
                  postViewCountDiff
                  solutionCount
                  solutionCountDiff
                  categoryDiscussCount
                  categoryDiscussCountDiff
                }
                submitStats {
                  acSubmissionNum {
                    difficulty
                    count
                    submissions
                  }
                  totalSubmissionNum {
                    difficulty
                    count
                    submissions
                  }
                }
                badges {
                  id
                  displayName
                  icon
                  category
                }
                upcomingBadges {
                  name
                  icon
                }
                activeBadge {
                  id
                }
              }
            }
          `,
          variables: {
            username: username
          }
        })
      });

      const data = await response.json();
      return data.data.matchedUser;
    } catch (error) {
      console.error('Error fetching detailed LeetCode data:', error);
      return null;
    }
  };

  // Update the existing fetchLeetCodeData function
  const fetchLeetCodeData = async (username: string) => {
    setIsLoadingLeetCode(true);
    setLeetCodeError(null);
    
    try {
      // Fetch basic stats
      const basicStatsResponse = await fetch(`https://leetcode-stats-api.herokuapp.com/${username}`);
      if (!basicStatsResponse.ok) {
        throw new Error('Failed to fetch basic LeetCode stats');
      }
      const basicStats = await basicStatsResponse.json();
      
      // Fetch detailed data
      const detailedData = await fetchLeetCodeDetailedData(username);
      setLeetCodeDetailedData(detailedData);
      
      // Transform LeetCode data into our format
      const challenges: CodingChallenge[] = [
        {
          platform: 'LeetCode',
          difficulty: 'Easy',
          category: 'All',
          completed: basicStats.easySolved,
          total: basicStats.totalEasy,
          lastUpdated: new Date().toISOString()
        },
        {
          platform: 'LeetCode',
          difficulty: 'Medium',
          category: 'All',
          completed: basicStats.mediumSolved,
          total: basicStats.totalMedium,
          lastUpdated: new Date().toISOString()
        },
        {
          platform: 'LeetCode',
          difficulty: 'Hard',
          category: 'All',
          completed: basicStats.hardSolved,
          total: basicStats.totalHard,
          lastUpdated: new Date().toISOString()
        }
      ];

      // Add detailed stats if available
      if (detailedData) {
        const detailedChallenges = detailedData.submitStats.acSubmissionNum.map((stat: any) => ({
          platform: 'LeetCode',
          difficulty: stat.difficulty,
          category: 'All',
          completed: stat.count,
          total: detailedData.submitStats.totalSubmissionNum.find((t: any) => t.difficulty === stat.difficulty)?.count || 0,
          lastUpdated: new Date().toISOString()
        }));

        // Merge detailed challenges with basic challenges
        challenges.push(...detailedChallenges);
      }

      setCodingChallenges(prev => ({
        ...prev,
        'LeetCode': challenges
      }));
    } catch (error) {
      console.error('Error fetching LeetCode data:', error);
      setLeetCodeError(error instanceof Error ? error.message : 'Failed to fetch LeetCode data');
    } finally {
      setIsLoadingLeetCode(false);
    }
  };

  // Function to fetch Edabit data
  const fetchEdabitData = async (username: string) => {
    try {
      // Note: Edabit doesn't have a public API, so you'll need to use their official API
      // or implement web scraping. This is a placeholder for the structure.
      const response = await fetch(`https://edabit.com/api/users/${username}/stats`);
      const data = await response.json();
      
      const challenges: CodingChallenge[] = [
        {
          platform: 'Edabit',
          difficulty: 'Easy',
          category: 'All',
          completed: data.easyCompleted,
          total: data.totalEasy,
          lastUpdated: new Date().toISOString()
        },
        {
          platform: 'Edabit',
          difficulty: 'Medium',
          category: 'All',
          completed: data.mediumCompleted,
          total: data.totalMedium,
          lastUpdated: new Date().toISOString()
        },
        {
          platform: 'Edabit',
          difficulty: 'Hard',
          category: 'All',
          completed: data.hardCompleted,
          total: data.totalHard,
          lastUpdated: new Date().toISOString()
        }
      ];

      setCodingChallenges(prev => ({
        ...prev,
        'Edabit': challenges
      }));
    } catch (error) {
      console.error('Error fetching Edabit data:', error);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    // Replace with your actual usernames
    fetchLeetCodeData('roesorcerer');
    fetchEdabitData('your-edabit-username');
  }, []);

  // Function to get challenge completion rate
  const getChallengeCompletionRate = (platform: string, difficulty: string) => {
    const challenges = codingChallenges[platform];
    if (!challenges) return 0;
    
    const challenge = challenges.find(c => c.difficulty === difficulty);
    if (!challenge) return 0;
    
    return (challenge.completed / challenge.total) * 100;
  };

  // Update the technology cards to show challenge data
  const renderChallengeData = (tech: Technology) => {
    const leetCodeData = codingChallenges['LeetCode'];
    const edabitData = codingChallenges['Edabit'];

    return (
      <div className="mt-4 space-y-2">
        {isLoadingLeetCode ? (
          <div className="p-3 bg-[#3a3a3a]/50 rounded-lg border border-[#e0c9a6]/20">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-[#e0c9a6] border-t-transparent rounded-full animate-spin"></div>
              <span className="text-[#e0c9a6]">Loading LeetCode data...</span>
            </div>
          </div>
        ) : leetCodeError ? (
          <div className="p-3 bg-[#3a3a3a]/50 rounded-lg border border-red-500/20">
            <div className="flex items-center space-x-2 text-red-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{leetCodeError}</span>
            </div>
          </div>
        ) : leetCodeData && (
          <div className="p-3 bg-[#3a3a3a]/50 rounded-lg border border-[#e0c9a6]/20">
            <h4 className="text-[#e0c9a6] font-medium mb-2">LeetCode Progress</h4>
            
            {/* Detailed Stats Section */}
            {leetCodeDetailedData && (
              <div className="mb-4 p-3 bg-[#2a2a2a]/50 rounded-lg border border-[#e0c9a6]/10">
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <span className="text-sm text-[#a67c52]">Ranking</span>
                    <p className="text-lg font-bold text-[#e0c9a6]">
                      #{leetCodeDetailedData.profile.ranking}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-[#a67c52]">Reputation</span>
                    <p className="text-lg font-bold text-[#e0c9a6]">
                      {leetCodeDetailedData.profile.reputation}
                    </p>
                  </div>
                </div>
                
                {/* Badges Section */}
                {leetCodeDetailedData.badges && leetCodeDetailedData.badges.length > 0 && (
                  <div className="mt-3">
                    <span className="text-sm text-[#a67c52] block mb-2">Badges</span>
                    <div className="flex flex-wrap gap-2">
                      {leetCodeDetailedData.badges.map((badge: any) => (
                        <div
                          key={badge.id}
                          className="px-2 py-1 bg-[#3a3a3a] rounded-full text-xs text-[#e0c9a6] border border-[#e0c9a6]/20"
                          title={badge.displayName}
                        >
                          {badge.displayName}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Challenge Progress Section */}
            <div className="space-y-2">
              {leetCodeData.map(challenge => (
                <div key={challenge.difficulty} className="flex items-center justify-between">
                  <span className="text-sm text-[#a67c52]">{challenge.difficulty}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-[#e0c9a6]">
                      {challenge.completed}/{challenge.total}
                    </span>
                    <div className="w-24 h-2 bg-[#3a3a3a] rounded-full">
                      <div
                        className="h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${(challenge.completed / challenge.total) * 100}%`,
                          background: `linear-gradient(90deg, #e0c9a6 0%, #a67c52 100%)`
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {edabitData && (
          <div className="p-3 bg-[#3a3a3a]/50 rounded-lg border border-[#e0c9a6]/20">
            <h4 className="text-[#e0c9a6] font-medium mb-2">Edabit Progress</h4>
            <div className="space-y-2">
              {edabitData.map(challenge => (
                <div key={challenge.difficulty} className="flex items-center justify-between">
                  <span className="text-sm text-[#a67c52]">{challenge.difficulty}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-[#e0c9a6]">
                      {challenge.completed}/{challenge.total}
                    </span>
                    <div className="w-24 h-2 bg-[#3a3a3a] rounded-full">
                      <div
                        className="h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${(challenge.completed / challenge.total) * 100}%`,
                          background: `linear-gradient(90deg, #e0c9a6 0%, #a67c52 100%)`
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-[#e0c9a6] p-6 relative overflow-hidden">
      {/* Coffee Shop Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23e0c9a6' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="max-w-7xl mx-auto relative">
        {/* Title with Coffee Shop style */}
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold mb-4 text-[#e0c9a6] font-serif">
            Developer's Brew
          </h2>
          <p className="text-[#a67c52] italic">A collection of thoughts and experiences</p>
        </div>

        {/* Carousel Container */}
        <div 
          className="relative mb-12"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Navigation Buttons with Coffee Shop style */}
          <button
            onClick={handlePrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-[#2a2a2a] rounded-full p-3 shadow-lg hover:bg-[#3a3a3a] transition-colors border border-[#e0c9a6]/30"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#e0c9a6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={handleNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-[#2a2a2a] rounded-full p-3 shadow-lg hover:bg-[#3a3a3a] transition-colors border border-[#e0c9a6]/30"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#e0c9a6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Carousel Content */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {getVisibleTechnologies().map(tech => (
              <motion.div
                key={tech.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-[#2a2a2a]/90 rounded-lg shadow-lg p-6 hover:shadow-xl transition-all border border-[#e0c9a6]/20 relative overflow-hidden group"
              >
                {/* Coffee Cup Header */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#e0c9a6] to-transparent opacity-50" />

                {/* Skill Category Badge */}
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-[#3a3a3a] text-[#e0c9a6] border border-[#e0c9a6]/30">
                    {tech.category}
                  </span>
                </div>

                {/* Coffee Cup Icon and Skill Name */}
                <div className="flex items-center mb-6">
                  <div className="relative w-16 h-16 mr-4">
                    {/* Coffee Cup SVG */}
                    <svg viewBox="0 0 24 24" className="w-full h-full">
                      <path
                        fill={tech.color}
                        d="M2 21h18v-2H2v2zm6-4h12v-2H8v2zm-6-4h16v-2H2v2zm0-4h18V7H2v2zm0-4h18V3H2v2z"
                      />
                      {/* Coffee Steam */}
                      <path
                        fill={tech.color}
                        d="M4 3h2v2H4zM6 1h2v2H6zM8 3h2v2H8z"
                        className="opacity-50"
                      />
                    </svg>
                    {/* Fill Level based on Rating */}
                    <div 
                      className="absolute bottom-0 left-0 right-0 bg-[#e0c9a6] rounded-b-lg transition-all duration-500"
                      style={{ 
                        height: `${(getAverageRating(tech.name) / 5) * 100}%`,
                        opacity: 0.3
                      }}
                    />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-[#e0c9a6]">
                      {tech.name}
                    </h3>
                    <p className="text-sm text-[#a67c52] mt-1">{tech.description}</p>
                  </div>
                </div>

                {/* Thought Cabinet Style Description */}
                <div className="mb-6 p-4 bg-[#3a3a3a]/50 rounded-lg border border-[#e0c9a6]/20">
                  <p className="text-[#e0c9a6] italic text-sm">
                    {getSkillThought(tech.name, getAverageRating(tech.name))}
                  </p>
                </div>

                {/* Mastery Level with Coffee Shop style */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-[#a67c52]">MASTERY LEVEL</span>
                    <span className="text-lg font-bold text-[#e0c9a6]">
                      {getAverageRating(tech.name).toFixed(1)}/5
                    </span>
                  </div>
                  <div className="w-full bg-[#3a3a3a]/50 rounded-full h-3 border border-[#e0c9a6]/20">
                    <div 
                      className="h-3 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${(getAverageRating(tech.name) / 5) * 100}%`,
                        background: `linear-gradient(90deg, #e0c9a6 0%, #a67c52 100%)`
                      }}
                    />
                  </div>
                </div>

                {/* Reviews Section */}
                {(() => {
                  const latestReview = reviews
                    .filter(r => r.technology === tech.name && r.isApproved)
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

                  const getThoughtIntensity = (rating: number): string => {
                    if (rating <= 2) return "A FLEETING THOUGHT";
                    if (rating <= 4) return "A DEEP THOUGHT";
                    return "AN ENLIGHTENED THOUGHT";
                  };

                  const getEmptyThought = (tech: Technology): string => {
                    const emptyThoughts = [
                      `The void of ${tech.name} knowledge stretches before you. A blank canvas awaiting the brushstrokes of experience.`,
                      `In the silence of ${tech.name}, wisdom lies dormant. Waiting for the spark of insight to ignite its potential.`,
                      `The ${tech.name} thought cabinet stands empty. A testament to the journey that lies ahead.`,
                      `No thoughts have crystallized around ${tech.name} yet. The digital ether awaits your contribution.`
                    ];
                    return emptyThoughts[Math.floor(Math.random() * emptyThoughts.length)];
                  };

                  if (!latestReview) {
                    return (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative"
                      >
                        <div className="absolute -top-2 left-4 px-2 bg-[#2a2a2a] text-[#e0c9a6] text-xs font-bold tracking-wider">
                          AWAITING THOUGHT
                        </div>
                        <div className="p-4 bg-[#3a3a3a]/50 rounded-lg border border-[#e0c9a6]/20">
                          <p className="text-[#e0c9a6] italic text-sm leading-relaxed">
                            "{getEmptyThought(tech)}"
                          </p>
                        </div>
                      </motion.div>
                    );
                  }

                  return (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="relative"
                    >
                      <div className="absolute -top-2 left-4 px-2 bg-[#2a2a2a] text-[#e0c9a6] text-xs font-bold tracking-wider">
                        {getThoughtIntensity(latestReview.rating)}
                      </div>
                      <div className="p-4 bg-[#3a3a3a]/50 rounded-lg border border-[#e0c9a6]/20">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[#e0c9a6] text-sm font-medium">
                            {latestReview.reviewer}
                          </span>
                          <span className="text-[#a67c52] text-xs">
                            {new Date(latestReview.date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex mb-2">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`w-4 h-4 ${i < latestReview.rating ? 'text-[#e0c9a6]' : 'text-[#3a3a3a]'}`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        {latestReview.comment && (
                          <div className="relative">
                            <div className="absolute -left-2 top-0 bottom-0 w-0.5 bg-[#e0c9a6]/20"></div>
                            <p className="text-[#e0c9a6] italic text-sm leading-relaxed pl-4">
                              "{latestReview.comment}"
                            </p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })()}
              </motion.div>
            ))}
          </div>

          {/* Carousel Indicators */}
          <div className="flex justify-center mt-6 space-x-2">
            {Array.from({ length: Math.ceil(technologies.length / 3) }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-[#e0c9a6]' : 'bg-[#3a3a3a]'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Coding Challenge Progress and Review Form Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* LeetCode Progress */}
          <div className="bg-[#2a2a2a]/90 rounded-lg shadow-lg p-6 border border-[#e0c9a6]/20">
            <h3 className="text-2xl font-bold text-[#e0c9a6] mb-4">LeetCode Progress</h3>
            <p className="text-xs text-[#a67c52] mb-4">
              Overall problems solved by difficulty. Not filtered by language or technology.
            </p>
            {isLoadingLeetCode ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-[#e0c9a6] border-t-transparent rounded-full animate-spin"></div>
                <span className="text-[#e0c9a6]">Loading...</span>
              </div>
            ) : leetCodeError ? (
              <div className="text-red-500">
                <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {leetCodeError}
              </div>
            ) : (
              <>
                {leetCodeDetailedData && (
                  <div className="mb-4 p-3 bg-[#3a3a3a]/50 rounded-lg border border-[#e0c9a6]/10">
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <span className="text-sm text-[#a67c52]">Ranking</span>
                        <p className="text-lg font-bold text-[#e0c9a6]">
                          #{leetCodeDetailedData.profile.ranking}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-[#a67c52]">Reputation</span>
                        <p className="text-lg font-bold text-[#e0c9a6]">
                          {leetCodeDetailedData.profile.reputation}
                        </p>
                      </div>
                    </div>
                    
                    {leetCodeDetailedData.badges && leetCodeDetailedData.badges.length > 0 && (
                      <div className="mt-3">
                        <span className="text-sm text-[#a67c52] block mb-2">Badges</span>
                        <div className="flex flex-wrap gap-2">
                          {leetCodeDetailedData.badges.map((badge: any) => (
                            <div
                              key={badge.id}
                              className="px-2 py-1 bg-[#3a3a3a] rounded-full text-xs text-[#e0c9a6] border border-[#e0c9a6]/20"
                              title={badge.displayName}
                            >
                              {badge.displayName}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-4">
                  {codingChallenges['LeetCode']?.map(challenge => (
                    <div key={challenge.difficulty} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-[#a67c52]">{challenge.difficulty}</span>
                        <span className="text-sm text-[#e0c9a6]">
                          {challenge.completed}/{challenge.total}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-[#3a3a3a] rounded-full">
                        <div
                          className="h-2 rounded-full transition-all duration-500"
                          style={{
                            width: `${(challenge.completed / challenge.total) * 100}%`,
                            background: `linear-gradient(90deg, #e0c9a6 0%, #a67c52 100%)`
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Review Form */}
          <div className="bg-[#2a2a2a]/90 rounded-lg shadow-lg p-8 border border-[#e0c9a6]/20">
            <h3 className="text-2xl font-semibold mb-6 text-center text-[#e0c9a6]">Share Your Thoughts</h3>
            <form onSubmit={handleReviewSubmit} className="space-y-6">
              <div>
                <label className="block mb-2 font-medium text-[#e0c9a6]">Select Technology:</label>
                <select
                  value={newReview.technology}
                  onChange={(e) => setNewReview(prev => ({ ...prev, technology: e.target.value }))}
                  className="w-full p-3 bg-[#3a3a3a] border border-[#e0c9a6]/30 rounded-lg focus:ring-2 focus:ring-[#e0c9a6] focus:border-[#e0c9a6] text-[#e0c9a6]"
                  required
                >
                  <option value="">Select a technology</option>
                  {technologies.map(tech => (
                    <option key={tech.name} value={tech.name}>{tech.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-2 font-medium text-[#e0c9a6]">Your Rating:</label>
                <div className="flex justify-center">
                  <ReactStars
                    count={5}
                    value={newReview.rating}
                    onChange={(rate: number) => setNewReview(prev => ({ ...prev, rating: rate }))}
                    size={40}
                    isHalf={false}
                    activeColor="#e0c9a6"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-2 font-medium text-[#e0c9a6]">Your Name:</label>
                <input
                  type="text"
                  value={newReview.reviewer}
                  onChange={(e) => setNewReview(prev => ({ ...prev, reviewer: e.target.value }))}
                  className="w-full p-3 bg-[#3a3a3a] border border-[#e0c9a6]/30 rounded-lg focus:ring-2 focus:ring-[#e0c9a6] focus:border-[#e0c9a6] text-[#e0c9a6]"
                  required
                />
              </div>

              <div>
                <label className="block mb-2 font-medium text-[#e0c9a6]">Comment (Optional):</label>
                <textarea
                  value={newReview.comment}
                  onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                  className="w-full p-3 bg-[#3a3a3a] border border-[#e0c9a6]/30 rounded-lg focus:ring-2 focus:ring-[#e0c9a6] focus:border-[#e0c9a6] text-[#e0c9a6]"
                  rows={3}
                  placeholder="Share your thoughts about my skills..."
                />
              </div>

              <div className="flex justify-center">
                <button
                  type="submit"
                  className="bg-[#e0c9a6] text-[#1a1a1a] px-8 py-3 rounded-lg hover:bg-[#a67c52] transition-colors font-medium text-lg"
                >
                  Submit Review
                </button>
              </div>
            </form>
          </div>

          {/* Edabit Progress */}
          <div className="bg-[#2a2a2a]/90 rounded-lg shadow-lg p-6 border border-[#e0c9a6]/20">
            <h3 className="text-2xl font-bold text-[#e0c9a6] mb-4">Edabit Progress</h3>
            <div className="space-y-4">
              {codingChallenges['Edabit']?.map(challenge => (
                <div key={challenge.difficulty} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#a67c52]">{challenge.difficulty}</span>
                    <span className="text-sm text-[#e0c9a6]">
                      {challenge.completed}/{challenge.total}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[#3a3a3a] rounded-full">
                    <div
                      className="h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${(challenge.completed / challenge.total) * 100}%`,
                        background: `linear-gradient(90deg, #e0c9a6 0%, #a67c52 100%)`
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
    </section>
  );
};

export default CodeLevel;
