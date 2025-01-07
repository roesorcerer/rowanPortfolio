import { classesTaught } from "../constants"

const Teaching = () => {
    return (
      <section className="c-space my-20">
          <h3 className="head-text">Classes at University of Minnesota Duluth I assisted teaching</h3>
  
          <div className="client-container">
              {classesTaught.map((item) => (
                  <div key={`review-${item.id}`} className="client-review">
                      <div className="flex flex-col">
                          <div className="flex justify-between items-start mb-4">
                              <div className="flex gap-3">
                                  <img src={item.img} alt="reviewer" className="w-12 h-12 rounded-full" />
                                  <div className="flex flex-col">
                                      <a 
                                          href={item.link}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="font-semibold text-white-800 hover:underline"
                                      >
                                          {item.name}
                                      </a>
                                      {Array.isArray(item.position) ? (
                                          <>
                                              <p className="text-white-500 md:text-base text-sm font-light">
                                                  {item.position[0].teacher}
                                              </p>
                                              {item.position[0].teacherWeb && (
                                                  <a 
                                                      href={item.position[0].teacherWeb} 
                                                      className="text-blue-500 hover:text-blue-600 underline"
                                                      target="_blank"
                                                      rel="noopener noreferrer"
                                                  >
                                                      Visit Professor Website
                                                  </a>
                                              )}
                                          </>
                                      ) : (
                                          <p className="text-white-500 md:text-base text-sm font-light">
                                              {item.position}
                                          </p>
                                      )}
                                  </div>
                              </div>
  
                              {/* Responsibilities Section */}
                              <div className="flex flex-col gap-1 text-right text-sm text-white-500">
                                  {item.responsibilities?.map((responsibility, index) => (
                                      <p key={index} className="flex items-center justify-end">
                                          <span>{responsibility}</span>
                                      </p>
                                  ))}
                              </div>
                          </div>
  
                          {/* Review Section */}
                          <p className="text-white-800 font-light">{item.description}</p>
                      </div>
                  </div>
              ))}
          </div>
      </section>
    );
  };

export default Teaching