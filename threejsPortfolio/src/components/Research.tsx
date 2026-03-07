import { useState } from 'react';
import { researchPapers } from '../constants';

const Research = () => {
  const [selectedPaperIndex, setSelectedPaperIndex] = useState(0);
  const currentPaper = researchPapers[selectedPaperIndex];
  const paperCount = researchPapers.length;

  const handleNavigation = (direction: string) => {
    setSelectedPaperIndex((prevIndex) => {
      if (direction === 'previous') {
        return prevIndex === 0 ? paperCount - 1 : prevIndex - 1;
      } else {
        return prevIndex === paperCount - 1 ? 0 : prevIndex + 1;
      }
    });
  };

  const getStatusBadge = (type: string) => {
    const badges = {
      'Published': 'bg-green-500/20 text-green-400 border-green-500/30',
      'Thesis': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      'In Progress': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    };
    return badges[type as keyof typeof badges] || badges['Published'];
  };

  return (
    <section id="research" className="c-space my-20">
      <p className="head-text">Research & Publications</p>

      <div className="grid lg:grid-cols-2 grid-cols-1 mt-12 gap-5 w-full">
        {/* Left Column - Paper Details */}
        <div className="flex flex-col gap-5 relative sm:p-10 px-5 py-8 shadow-2xl shadow-black-200 border border-black-300 bg-black-200 rounded-lg">
          {/* Spotlight Background */}
          {currentPaper.spotlight && (
            <div className="absolute top-0 right-0 w-full h-full overflow-hidden rounded-lg opacity-30">
              <img
                src={currentPaper.spotlight}
                alt="spotlight"
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Icon and Status Badge */}
          <div className="flex items-center justify-between relative z-10">
            <div
              className="p-3 backdrop-filter backdrop-blur-3xl w-fit rounded-lg"
              style={currentPaper.iconStyle}
            >
              <img src={currentPaper.icon} alt="icon" className="w-10 h-10" />
            </div>
            <span
              className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusBadge(
                currentPaper.type
              )}`}
            >
              {currentPaper.type}
            </span>
          </div>

          {/* Paper Title */}
          <div className="relative z-10">
            <h3 className="text-white text-2xl font-semibold mb-3">
              {currentPaper.title}
            </h3>

            {/* Authors */}
            <p className="text-white-600 text-sm mb-2">
              <span className="font-semibold text-white">Authors:</span>{' '}
              {currentPaper.authors.join(', ')}
            </p>

            {/* Venue and Year */}
            <p className="text-white-600 text-sm mb-4">
              <span className="font-semibold text-white">Published in:</span>{' '}
              {currentPaper.venue} ({currentPaper.year})
            </p>

            {/* DOI if available */}
            {currentPaper.doi && (
              <p className="text-white-600 text-sm mb-4">
                <span className="font-semibold text-white">DOI:</span>{' '}
                <a
                  href={`https://doi.org/${currentPaper.doi}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  {currentPaper.doi}
                </a>
              </p>
            )}

            {/* Abstract */}
            <div className="mb-4">
              <p className="text-white font-semibold mb-2">Abstract:</p>
              <p className="text-white-600 text-sm leading-relaxed">
                {currentPaper.abstract}
              </p>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {currentPaper.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-black-300 text-white-600 text-xs rounded-full border border-black-500"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Link to Paper */}
            {currentPaper.link && (
              <a
                href={currentPaper.link}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-white-600 hover:text-white transition-colors w-fit"
              >
                <img
                  src="https://img.icons8.com/?size=100&id=85185&format=png&color=FFFFFF"
                  alt="link"
                  className="w-4 h-4"
                />
                <span>View Paper</span>
              </a>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-7 relative z-10">
            <button
              className="arrow-btn"
              onClick={() => handleNavigation('previous')}
              aria-label="Previous paper"
            >
              <img
                src="https://img.icons8.com/?size=100&id=aJ5oE5rWM1Mv&format=png&color=000000"
                alt="left arrow"
                className="w-4 h-4"
              />
            </button>

            <span className="text-white-600 text-sm">
              {selectedPaperIndex + 1} / {paperCount}
            </span>

            <button
              className="arrow-btn"
              onClick={() => handleNavigation('next')}
              aria-label="Next paper"
            >
              <img
                src="https://img.icons8.com/?size=100&id=DEaVg54CVcX4&format=png&color=000000"
                alt="right arrow"
                className="w-4 h-4"
              />
            </button>
          </div>
        </div>

        {/* Right Column - Visual Representation */}
        <div className="border border-black-300 bg-black-200 rounded-lg h-96 md:h-full flex items-center justify-center p-10">
          <div className="text-center space-y-6">
            {/* Large Icon Display */}
            <div
              className="w-32 h-32 mx-auto rounded-2xl flex items-center justify-center"
              style={currentPaper.iconStyle}
            >
              <img
                src={currentPaper.icon}
                alt="research icon"
                className="w-20 h-20"
              />
            </div>

            {/* Quick Stats */}
            <div className="space-y-3">
              <div className="bg-black-300 rounded-lg p-4 border border-black-500">
                <p className="text-white-600 text-sm">Publication Year</p>
                <p className="text-white text-2xl font-bold">
                  {currentPaper.year}
                </p>
              </div>

              <div className="bg-black-300 rounded-lg p-4 border border-black-500">
                <p className="text-white-600 text-sm">Co-Authors</p>
                <p className="text-white text-2xl font-bold">
                  {currentPaper.authors.length}
                </p>
              </div>

              <div className="bg-black-300 rounded-lg p-4 border border-black-500">
                <p className="text-white-600 text-sm">Research Areas</p>
                <p className="text-white text-2xl font-bold">
                  {currentPaper.tags.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Total Publications Summary */}
      <div className="mt-8 p-6 bg-black-200 border border-black-300 rounded-lg">
        <div className="flex flex-wrap justify-around gap-4 text-center">
          <div>
            <p className="text-white-600 text-sm mb-1">Total Publications</p>
            <p className="text-white text-3xl font-bold">{paperCount}</p>
          </div>
          <div>
            <p className="text-white-600 text-sm mb-1">Published Papers</p>
            <p className="text-white text-3xl font-bold">
              {researchPapers.filter((p) => p.type === 'Published').length}
            </p>
          </div>
          <div>
            <p className="text-white-600 text-sm mb-1">In Progress</p>
            <p className="text-white text-3xl font-bold">
              {
                researchPapers.filter((p) => p.type !== 'Published')
                  .length
              }
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Research;