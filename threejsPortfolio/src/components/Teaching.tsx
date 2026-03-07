import React from 'react';

type Course = {
  id: number;
  name: string;
  code?: string;
  instructor: string;
  instructorUrl?: string;
  semester?: string;
};

const courses: Course[] = [
  {
    id: 1,
    name: "Object Oriented Programming and Design",
    instructor: "Eleazar Leal",
    instructorUrl: "https://www.d.umn.edu/~eleal/",
  },
  {
    id: 2,
    name: "Intro to Programming in Python",
    instructor: "Steven Holtz",
    instructorUrl: "https://www.d.umn.edu/~sholtz/",
  },
  {
    id: 3,
    name: "Intro to Computer Science",
    instructor: "Dr. Thomas Buck",
    instructorUrl: "https://www.d.umn.edu/~tbuck/",
  },
];

const Teaching: React.FC = () => {
  return (
    <section className="c-space my-20" id="teaching">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="head-text">Teaching</h2>
          <p className="text-white-600 mt-2">
            Graduate Teaching Assistant at UMD
          </p>
        </div>

        {/* Role summary */}
        <div className="bg-black-200 rounded-xl p-6 border border-black-300 mb-6">
          <p className="text-white-600 text-sm text-center">
            Led lab sessions • Office hours • Grading • Student mentorship
          </p>
        </div>

        {/* Course list - compact */}
        <div className="space-y-3">
          {courses.map(course => (
            <div 
              key={course.id}
              className="flex items-center justify-between p-4 bg-black-200 rounded-lg border border-black-300"
            >
              <div>
                <h3 className="text-white font-medium">{course.name}</h3>
                <p className="text-white-600 text-sm">
                  Instructor: {course.instructorUrl ? (
                    <a 
                      href={course.instructorUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline"
                    >
                      {course.instructor}
                    </a>
                  ) : course.instructor}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Teaching;