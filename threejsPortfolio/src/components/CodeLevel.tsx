import React, { useState } from 'react';
import RatingComponent from 'react-rating';
import { codingLevel } from '../constants';
 // Ensure you have installed react-rating
 const Rating = RatingComponent as any;
// Define a type for a rating entry
type RatingEntry = {
  technology: string;
  rating: number;
};

const TechRatingComponent: React.FC = () => {
  // List the technologies you want to rate
  const technologies = ['JavaScript', 'TypeScript', 'React', 'Node.js'];

  // State to track the current form ratings (keyed by technology name)
  const [ratings, setRatings] = useState<{ [tech: string]: number }>({});

  // State for ratings that have been submitted (but not yet approved)
  const [pendingRatings, setPendingRatings] = useState<RatingEntry[]>([]);

  // State for ratings that have been approved
  const [approvedRatings, setApprovedRatings] = useState<RatingEntry[]>([]);

  // Update the rating for a particular technology
  const handleRatingChange = (tech: string, rating: number) => {
    setRatings(prev => ({ ...prev, [tech]: rating }));
  };

  // When the form is submitted, add all rated technologies to the pending list.
  // In a production app you might send this data to an API for moderation.
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newPending = technologies
      .filter(tech => ratings[tech] !== undefined)
      .map(tech => ({ technology: tech, rating: ratings[tech] }));

    setPendingRatings(newPending);
    // Optionally, reset the form ratings
    setRatings({});
  };

  // Approve a specific pending rating
  const handleApprove = (tech: string) => {
    const approvedEntry = pendingRatings.find(entry => entry.technology === tech);
    if (approvedEntry) {
      setApprovedRatings(prev => [...prev, approvedEntry]);
      setPendingRatings(prev =>
        prev.filter(entry => entry.technology !== tech)
      );
    }
  };

  return (
    <section className="c-space my-20">
      <h3 className='head-text'>My coding level - Profissency at different technologies(Rate if you worked with me!)</h3>
    
    <div className='level-container'>
      {codingLevel.map((item) => (
        <div key={`review-${item.id}`} className="level-review">
            <div className="flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-3">
                  <img src={item.img} alt="level" className="w-12 h-12 rounded-full" />
                  <div className="flex flex-col">
                    <a
                      href=''
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-white-800 hover:underline"
                      >
                         {/* Rating Form */}
      <form onSubmit={handleSubmit}>
        {technologies.map(tech => (
          <div key={tech} style={{ marginBottom: '1rem' }}>
            <label style={{ marginRight: '1rem' }}>{tech}:</label>
            <Rating
              initialRating={ratings[tech] || 0}
              onChange={(rate: number) => handleRatingChange(tech, rate)}
              emptySymbol="fa fa-star-o fa-2x"   // Using FontAwesome classes for empty star
              fullSymbol="fa fa-star fa-2x"        // and full star
              fractions={1}                       // one fraction means integer ratings (1-5)
            />
          </div>
        ))}
        <button type="submit">Submit Ratings</button>
      </form>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
        </div>
      ))}
   

     
    
    </div>
    </section>
  );
};

export default TechRatingComponent;
