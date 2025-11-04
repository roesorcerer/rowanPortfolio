import React from 'react';

const CodeLevel: React.FC = () => {
  // Temporarily simplified component due to CORS issues with external APIs
  return (
    <section className="c-space my-20" id="coding">
      <div className="w-full text-center">
        <h3 className="head-text mb-8">Coding Challenge Progress</h3>
        <p className="grid-subtext">
          This section is currently being updated. External API integrations are being reworked to resolve CORS restrictions.
        </p>
        <div className="grid md:grid-cols-2 grid-cols-1 gap-6 mt-8">
          <div className="bg-black-300 p-6 rounded-lg">
            <h4 className="text-white font-semibold mb-2">LeetCode</h4>
            <p className="text-white-600 text-sm">Problem-solving challenges in progress</p>
          </div>
          <div className="bg-black-300 p-6 rounded-lg">
            <h4 className="text-white font-semibold mb-2">Development Skills</h4>
            <p className="text-white-600 text-sm">Continuous learning and improvement</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CodeLevel;