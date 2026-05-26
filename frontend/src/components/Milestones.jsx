import React, { useState } from 'react';

// ---------------------------------------------------------------------------
// MILESTONES
// To add, edit, or reorder a milestone, just modify the arrays below.
// Each milestone is a plain object with the fields:
//   id, title, description, date, icon, color, timeline
// `date`  : "Complete" | "In Progress" | "Planned" | "Future"
// `color` : "#4B0082" (indigo) | "#FFB6C1" (rose) | "#00BFFF" (sky blue)
// `timeline` : array of bullet strings (can be empty)
// ---------------------------------------------------------------------------

const gtmMilestones = [
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
    title: "Case Studies",
    description:
      "Build a portfolio of case studies that showcase merchant success and become a top-of-funnel sales tool.",
    date: "Planned",
    icon: "📚",
    color: "#FFB6C1",
    timeline: [
      "Cupid Intimates asked for a new feature in exchange for a case study",
      "Identify 3-5 high-impact merchants to feature",
      "Develop case study format (baseline GA4 metrics → results)",
    ],
  },
  {
    id: 8,
    title: "We need to get paying customers",
    description:
      "Convert installed merchants into paying customers and grow paid plan revenue.",
    date: "Planned",
    icon: "💵",
    color: "#00BFFF",
    timeline: [],
  },
  {
    id: 9,
    title: "Start our branding",
    description:
      "Develop a coherent brand voice, visual identity, and presence so Videoselz is recognizable in the Shopify ecosystem.",
    date: "Planned",
    icon: "🎨",
    color: "#4B0082",
    timeline: [],
  },
  {
    id: 10,
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
    id: 10.1,
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

const productMilestones = [
  {
    id: 1,
    title: "High quality demo-videoselz store",
    description: "Build a polished demo store — maybe rename it. Owner: Amiya.",
    date: "Planned",
    icon: "🏪",
    color: "#4B0082",
    timeline: [],
  },
  {
    id: 2,
    title: "1.0 theme merchants must be enabled",
    description: "Enable 1.0 theme merchants on our app. Owner: Amiya.",
    date: "Complete",
    icon: "🎨",
    color: "#FFB6C1",
    timeline: [],
  },
  {
    id: 3,
    title: "Production-ready apps with strong on-call",
    description:
      "Apps should be production ready and high quality with strong on-call coverage. Owner: Shreyash.",
    date: "Planned",
    icon: "🛡️",
    color: "#00BFFF",
    timeline: [],
  },
  {
    id: 4,
    title: "Understand impact of production errors",
    description:
      "Impact of the errors happening in production needs to be well understood — error severity, affected merchants, revenue impact.",
    date: "Planned",
    icon: "🐛",
    color: "#4B0082",
    timeline: [],
  },
  {
    id: 5,
    title: "Instagram + TikTok uploader",
    description:
      "Ship an uploader that pulls content from Instagram and TikTok. Owner: Shreyash.",
    date: "Complete",
    icon: "📤",
    color: "#FFB6C1",
    timeline: [],
  },
  {
    id: 6,
    title: "Scalable cost control",
    description:
      "Predictable cost structure even at thousands of users. Per-user cost ceilings, monitoring, alerts.",
    date: "Planned",
    icon: "💸",
    color: "#00BFFF",
    timeline: [],
  },
  {
    id: 7,
    title: "Top-notch onboarding with no leaks",
    description:
      "Onboarding must be polished end-to-end with no drop-off points. Instrument every step and close every leak.",
    date: "Planned",
    icon: "🎯",
    color: "#4B0082",
    timeline: [],
  },
  {
    id: 8,
    title: "Resilient upload experience",
    description:
      "Upload experience needs to survive merchants navigating away mid-upload. Owner: Shreyash.",
    date: "Planned",
    icon: "🔄",
    color: "#FFB6C1",
    timeline: [],
  },
  {
    id: 9,
    title: "Multiple templates for product summary cards",
    description:
      "Give merchants a library of product summary card templates to choose from.",
    date: "Planned",
    icon: "🃏",
    color: "#00BFFF",
    timeline: [],
  },
  {
    id: 10,
    title: "Release paid plan to all users",
    description:
      "Roll the paid plan out broadly and convert more merchants to paying customers. Owner: Amiya.",
    date: "Planned",
    icon: "💰",
    color: "#4B0082",
    timeline: [],
  },
  {
    id: 11,
    title: "WYSIWYG editor for settings page",
    description:
      "Create a WYSIWYG editor for the settings page (similar to ReelUp's).",
    date: "Planned",
    icon: "✏️",
    color: "#FFB6C1",
    timeline: [],
  },
  {
    id: 12,
    title: "E2E test coverage we trust",
    description:
      "A solid set of E2E tests that gives us confidence in the major and minor features of the carousel. Owner: Shreyash.",
    date: "In Progress",
    icon: "🧪",
    color: "#00BFFF",
    timeline: [],
  },
  {
    id: 13,
    title: "Analytics emails",
    description:
      "Send merchants periodic analytics emails (daily, weekly, monthly cadence options).",
    date: "Planned",
    icon: "📧",
    color: "#4B0082",
    timeline: [],
  },
  {
    id: 14,
    title: "Time-based analytics — minutes watched",
    description:
      "Surface watch-time metrics like total minutes watched per video, per merchant, per period.",
    date: "Planned",
    icon: "📊",
    color: "#FFB6C1",
    timeline: [],
  },
  {
    id: 15,
    title: "Analytics accuracy audit",
    description:
      "Audit and validate event usage — e.g. is impression_3_sec being fired correctly across all surfaces?",
    date: "Planned",
    icon: "🔍",
    color: "#00BFFF",
    timeline: [],
  },
  {
    id: 16,
    title: "Duration of videos watched",
    description:
      "Track and surface how long viewers actually watch each video — drop-off curves, completion rates.",
    date: "Planned",
    icon: "⏱️",
    color: "#4B0082",
    timeline: [],
  },
  {
    id: 17,
    title: "Multi-language support",
    description:
      "Add support for multiple languages in the widget and admin UI.",
    date: "Planned",
    icon: "🌐",
    color: "#FFB6C1",
    timeline: [],
  },
  {
    id: 18,
    title: "Meta Pixel integration",
    description:
      "Integrate with Meta Pixel so merchants can attribute video engagement back to their ad campaigns.",
    date: "Planned",
    icon: "📡",
    color: "#00BFFF",
    timeline: [],
  },
  {
    id: 19,
    title: "Video prefetching + smaller bundles",
    description:
      "Use metadata APIs to prefetch videos and reduce bundle sizes for faster initial load.",
    date: "Planned",
    icon: "⚡",
    color: "#4B0082",
    timeline: [],
  },
  {
    id: 20,
    title: "3rd party integrations",
    description:
      "Ship integrations with key Shopify ecosystem tools that merchants already use.",
    date: "Planned",
    icon: "🔌",
    color: "#FFB6C1",
    timeline: [],
  },
  {
    id: 21,
    title: "AI Tag Products Automatically",
    description:
      "Automatically tag products on videos using AI — saves merchants manual work.",
    date: "Planned",
    icon: "🤖",
    color: "#00BFFF",
    timeline: [],
  },
  {
    id: 22,
    title: "Like feature on the widget",
    description:
      "Add a like button to videos in the widget to drive engagement signals.",
    date: "Planned",
    icon: "❤️",
    color: "#4B0082",
    timeline: [],
  },
  {
    id: 23,
    title: "Content creator name on videos",
    description:
      "Display the name of the content creator on each video — gives credit and adds social proof.",
    date: "Planned",
    icon: "👤",
    color: "#FFB6C1",
    timeline: [],
  },
  {
    id: 24,
    title: "Internationalization",
    description:
      "Make the app usable in every country — currency, locales, regional Shopify market support.",
    date: "Planned",
    icon: "🌍",
    color: "#00BFFF",
    timeline: [],
  },
  {
    id: 25,
    title: "Strong communication about new features",
    description:
      "Changelog, LinkedIn posts, screen captures, release notes — make sure merchants and the market hear about every shipped feature.",
    date: "Planned",
    icon: "📣",
    color: "#4B0082",
    timeline: [],
  },
  {
    id: 26,
    title: "Grid app block",
    description:
      "Create a separate app block that shows videos in a grid layout — gives merchants a second placement option alongside the carousel.",
    date: "Planned",
    icon: "🔲",
    color: "#FFB6C1",
    timeline: [],
  },
];

const TAB_CONFIG = {
  gtm: {
    label: "GTM",
    goal: "NUMBER OF PEOPLE INSTALLING MUST BE HIGH",
    milestones: gtmMilestones,
  },
  product: {
    label: "Product",
    goal: "CONVERSION RATE TO PAID PLAN MUST BE HIGH",
    milestones: productMilestones,
  },
};

const Milestones = () => {
  const [activeTab, setActiveTab] = useState('gtm');
  const { goal, milestones } = TAB_CONFIG[activeTab];

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
          marginBottom: '20px',
          fontSize: '2.5rem',
          fontWeight: 'bold',
          background: 'linear-gradient(90deg, #4B0082, #FFB6C1, #00BFFF)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          color: 'transparent'
        }}>
          Milestones
        </h1>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '8px',
          marginBottom: '24px'
        }}>
          {Object.entries(TAB_CONFIG).map(([key, cfg]) => {
            const isActive = activeTab === key;
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                style={{
                  padding: '10px 28px',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  borderRadius: '999px',
                  border: `2px solid #4B0082`,
                  backgroundColor: isActive ? '#4B0082' : 'white',
                  color: isActive ? 'white' : '#4B0082',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {cfg.label}
              </button>
            );
          })}
        </div>

        {/* Goal subheading */}
        <div style={{
          textAlign: 'center',
          marginBottom: '40px',
          padding: '14px 20px',
          backgroundColor: 'white',
          border: '2px dashed #4B0082',
          borderRadius: '10px',
          maxWidth: '720px',
          marginLeft: 'auto',
          marginRight: 'auto'
        }}>
          <span style={{
            fontSize: '0.85rem',
            fontWeight: 'bold',
            color: '#4B0082',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginRight: '8px'
          }}>
            Goal:
          </span>
          <span style={{
            fontSize: '1.05rem',
            fontWeight: 'bold',
            color: '#333'
          }}>
            {goal}
          </span>
        </div>

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