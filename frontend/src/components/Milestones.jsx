import React from 'react';

const Milestones = () => {
  const milestones = [
    {
      id: 1,
      title: "Get Built for Shopify Badge",
      description:
        "Achieve the Built for Shopify badge to establish credibility and trust with potential customers.",
      date: "Complete",
      icon: "🏆",
      color: "#4B0082",
      timeline: [
        "Refactor must be complete",
        "All side items must be complete",
        "Submit application for Built for Shopify program",
      ],
    },
    {
      id: 2,
      title: "Release Paid Version - $13.99 Plan",
      description:
        "Launch a paid version of the product at $13.99 per month to offset development and operational costs.",
      date: "Complete",
      icon: "💰",
      color: "#FFB6C1",
      timeline: [
        "Design pricing structure and feature tiers",
        "Implement payment processing system",
        "Create upgrade flow and user experience",
        "Launch beta testing with select users",
      ],
    },
    {
      id: 3,
      title: "60 reviews on Shopify App Store",
      description: "Prove we can keep users engaged and satisfied.",
      date: "In Progress",
      icon: "📈",
      color: "#00BFFF",
      timeline: [
        "Launch redesigned app",
        "Launch lifecycle emails",
        "Get the app to 60 reviews",
        "Figure out proactive support (propport) process to get a stream of reviews",
      ],
    },
    {
      id: 4,
      title: "Independent tech team that does engineering well",
      description:
        "We need a team that can do high quality engineering well and is independent from the business and that moves fast.",
      date: "Planned",
      icon: "🎥",
      color: "#4B0082",
      timeline: [],
    },
    {
      id: 4.1,
      title: "Weekly posts to the authority video top of funnel channel.",
      description:
        "Branding and content for the authority video top of funnel channel.",
      date: "Planned",
      icon: "🎥",
      color: "#4B0082",
      timeline: [
        "A website like ecom video ideas is created and populated with video ideas from merchants to have Videoselz look like the best product",
        "Videos are created and posted to the channel weekly",
        "Teardown of the videos and user exeperience is analyzed in videos",
        "website should look like https://ecomideas.com/featured-idea-gallery/shoppable-tiktok-widgets",
      ],
    },
    {
      id: 5,
      title: "Conversion to paid plan is high",
      description: "High conversion rate from free to paid plan.",
      date: "Planned",
      icon: "🎥",
      color: "#4B0082",
      timeline: [],
    },
    {
      id: 6,
      title:
        "Tech team that analyzes data, decides on future plans and executes them fast. ",
      description:
        "We need a team that can analyze data, decide on future plans and execute them fast.",
      date: "Planned",
      icon: "🎥",
      color: "#4B0082",
      timeline: [],
    },
    {
      id: 7,
      title: "Standalone B2B Video Generator",
      description:
        "Release a standalone product that generates videos for B2B selling and custom site users.",
      date: "Future",
      icon: "🚀",
      color: "#FFB6C1",
      timeline: [
        "Define B2B product requirements and features",
        "Develop standalone application architecture",
        "Create custom video templates for B2B use cases",
        "Launch beta program with enterprise customers",
      ],
    },
    {
      id: 7.1,
      title: "Plus shopify plan is created with bunch of custom features",
      description: "Cold emails is started.",
      date: "Future",
      icon: "🚀",
      color: "#FFB6C1",
      timeline: [
        "Cold emails is started with backlinks to all the work we've done and results we've achieved for merchants",
      ],
    },
  ];

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f8f9fa',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '20px'
      }}>
        <h1 style={{
          textAlign: 'center',
          marginBottom: '40px',
          fontSize: '2.5rem',
          fontWeight: 'bold',
          background: 'linear-gradient(90deg, #4B0082, #FFB6C1, #00BFFF)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          color: 'transparent'
        }}>
          Product Milestones
        </h1>
        
        <div style={{ position: 'relative' }}>
          {/* Timeline line */}
          <div style={{
            position: 'absolute',
            left: '50%',
            top: 0,
            bottom: 0,
            width: '4px',
            backgroundColor: '#e0e0e0',
            transform: 'translateX(-50%)',
            zIndex: 1
          }} />
          
          {milestones.map((milestone, index) => (
            <div
              key={milestone.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '60px',
                position: 'relative',
                zIndex: 2
              }}
            >
              {/* Left side content (even indices) */}
              {index % 2 === 0 && (
                <>
                  <div style={{ flex: 1, paddingRight: '40px' }}>
                    <div style={{
                      backgroundColor: milestone.color,
                      color: 'white',
                      padding: '24px',
                      borderRadius: '12px',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                      position: 'relative',
                      display: 'flex'
                    }}>
                      {/* Timeline section */}
                      <div style={{
                        flex: '0 0 200px',
                        borderRight: '1px solid rgba(255,255,255,0.3)',
                        paddingRight: '20px',
                        marginRight: '20px'
                      }}>
                        <h4 style={{
                          fontSize: '1.1rem',
                          fontWeight: 'bold',
                          marginBottom: '15px',
                          margin: '0 0 15px 0'
                        }}>
                          Timeline
                        </h4>
                        <ul style={{
                          listStyle: 'none',
                          padding: 0,
                          margin: 0
                        }}>
                          {milestone.timeline.map((item, timelineIndex) => (
                            <li key={timelineIndex} style={{
                              fontSize: '0.9rem',
                              lineHeight: '1.4',
                              marginBottom: '8px',
                              paddingLeft: '15px',
                              position: 'relative'
                            }}>
                              <span style={{
                                position: 'absolute',
                                left: 0,
                                top: '6px',
                                width: '6px',
                                height: '6px',
                                backgroundColor: 'white',
                                borderRadius: '50%'
                              }} />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      {/* Description section */}
                      <div style={{ flex: 1 }}>
                        <h3 style={{
                          fontSize: '1.5rem',
                          fontWeight: 'bold',
                          marginBottom: '10px',
                          margin: '0 0 10px 0'
                        }}>
                          {milestone.title}
                        </h3>
                        <p style={{
                          fontSize: '1rem',
                          lineHeight: '1.6',
                          margin: '10px 0 0 0',
                          opacity: 0.9
                        }}>
                          {milestone.description}
                        </p>
                      </div>
                      
                      <div style={{
                        position: 'absolute',
                        right: '-10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: 0,
                        height: 0,
                        borderTop: '10px solid transparent',
                        borderBottom: '10px solid transparent',
                        borderLeft: `10px solid ${milestone.color}`
                      }} />
                    </div>
                  </div>
                  
                  {/* Center icon */}
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    backgroundColor: milestone.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    color: 'white',
                    boxShadow: '0 0 0 4px #fff, 0 0 0 8px rgba(75, 0, 130, 0.1)',
                    zIndex: 3
                  }}>
                    {milestone.icon}
                  </div>
                  
                  {/* Right side date */}
                  <div style={{ flex: 1, paddingLeft: '40px' }}>
                    <div style={{
                      backgroundColor: 'white',
                      padding: '12px 20px',
                      borderRadius: '20px',
                      border: '2px solid #4B0082',
                      display: 'inline-block',
                      fontWeight: 'bold',
                      color: '#4B0082',
                      fontSize: '1.1rem'
                    }}>
                      {milestone.date}
                    </div>
                  </div>
                </>
              )}
              
              {/* Right side content (odd indices) */}
              {index % 2 === 1 && (
                <>
                  {/* Left side date */}
                  <div style={{ flex: 1, paddingRight: '40px', textAlign: 'right' }}>
                    <div style={{
                      backgroundColor: 'white',
                      padding: '12px 20px',
                      borderRadius: '20px',
                      border: '2px solid #4B0082',
                      display: 'inline-block',
                      fontWeight: 'bold',
                      color: '#4B0082',
                      fontSize: '1.1rem'
                    }}>
                      {milestone.date}
                    </div>
                  </div>
                  
                  {/* Center icon */}
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    backgroundColor: milestone.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    color: 'white',
                    boxShadow: '0 0 0 4px #fff, 0 0 0 8px rgba(75, 0, 130, 0.1)',
                    zIndex: 3
                  }}>
                    {milestone.icon}
                  </div>
                  
                  {/* Right side content */}
                  <div style={{ flex: 1, paddingLeft: '40px' }}>
                    <div style={{
                      backgroundColor: milestone.color,
                      color: 'white',
                      padding: '24px',
                      borderRadius: '12px',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                      position: 'relative',
                      display: 'flex'
                    }}>
                      {/* Timeline section */}
                      <div style={{
                        flex: '0 0 200px',
                        borderRight: '1px solid rgba(255,255,255,0.3)',
                        paddingRight: '20px',
                        marginRight: '20px'
                      }}>
                        <h4 style={{
                          fontSize: '1.1rem',
                          fontWeight: 'bold',
                          marginBottom: '15px',
                          margin: '0 0 15px 0'
                        }}>
                          Timeline
                        </h4>
                        <ul style={{
                          listStyle: 'none',
                          padding: 0,
                          margin: 0
                        }}>
                          {milestone.timeline.map((item, timelineIndex) => (
                            <li key={timelineIndex} style={{
                              fontSize: '0.9rem',
                              lineHeight: '1.4',
                              marginBottom: '8px',
                              paddingLeft: '15px',
                              position: 'relative'
                            }}>
                              <span style={{
                                position: 'absolute',
                                left: 0,
                                top: '6px',
                                width: '6px',
                                height: '6px',
                                backgroundColor: 'white',
                                borderRadius: '50%'
                              }} />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      {/* Description section */}
                      <div style={{ flex: 1 }}>
                        <h3 style={{
                          fontSize: '1.5rem',
                          fontWeight: 'bold',
                          marginBottom: '10px',
                          margin: '0 0 10px 0'
                        }}>
                          {milestone.title}
                        </h3>
                        <p style={{
                          fontSize: '1rem',
                          lineHeight: '1.6',
                          margin: '10px 0 0 0',
                          opacity: 0.9
                        }}>
                          {milestone.description}
                        </p>
                      </div>
                      
                      <div style={{
                        position: 'absolute',
                        left: '-10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: 0,
                        height: 0,
                        borderTop: '10px solid transparent',
                        borderBottom: '10px solid transparent',
                        borderRight: `10px solid ${milestone.color}`
                      }} />
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Milestones; 