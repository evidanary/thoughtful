import React, { useState, useEffect } from 'react';
import { API } from '../api/contacts';

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
  cadence: {
    label: "Cadence",
    goal: null,
    milestones: null,
  },
};

// ---------------------------------------------------------------------------
// CADENCE — David Sacks "The Cadence" operating framework, Dec 31 fiscal year
// Quarters: Q1 Jan–Mar | Q2 Apr–Jun | Q3 Jul–Sep | Q4 Oct–Dec
// Month 1 = Plan | Month 2 = Launch | Month 3 = Close
// ---------------------------------------------------------------------------

const EVENT_CONFIG = {
  sko:        { color: '#E67E22', label: 'Sales Kickoff',        icon: '🚀' },
  board:      { color: '#4B0082', label: 'Board Meeting',        icon: '🏛️' },
  allhands:   { color: '#00BFFF', label: 'All-Hands',            icon: '📢' },
  launch:     { color: '#E91E8C', label: 'Launch / Webinar',     icon: '⚡' },
  conference: { color: '#F1C40F', label: 'Annual Conference',    icon: '🎪' },
  roadmap:    { color: '#27AE60', label: 'Roadmap Review',       icon: '🗺️' },
  pipeline:   { color: '#1ABC9C', label: 'Pipeline Inspection',  icon: '🔍' },
  close:      { color: '#E74C3C', label: 'Quarter / Year Close', icon: '🔒' },
};

const MONTHS_2026 = [
  { month: 0, name: 'January',   quarter: 1, theme: 'Plan',   themeColor: '#4B0082' },
  { month: 1, name: 'February',  quarter: 1, theme: 'Launch', themeColor: '#E91E8C' },
  { month: 2, name: 'March',     quarter: 1, theme: 'Close',  themeColor: '#E74C3C' },
  { month: 3, name: 'April',     quarter: 2, theme: 'Plan',   themeColor: '#4B0082' },
  { month: 4, name: 'May',       quarter: 2, theme: 'Launch', themeColor: '#E91E8C' },
  { month: 5, name: 'June',      quarter: 2, theme: 'Close',  themeColor: '#E74C3C' },
  { month: 6, name: 'July',      quarter: 3, theme: 'Plan',   themeColor: '#4B0082' },
  { month: 7, name: 'August',    quarter: 3, theme: 'Launch', themeColor: '#E91E8C' },
  { month: 8, name: 'September', quarter: 3, theme: 'Close',  themeColor: '#E74C3C' },
  { month: 9, name: 'October',   quarter: 4, theme: 'Plan',   themeColor: '#4B0082' },
  { month: 10, name: 'November', quarter: 4, theme: 'Launch', themeColor: '#E91E8C' },
  { month: 11, name: 'December', quarter: 4, theme: 'Close',  themeColor: '#E74C3C' },
];

const cadenceEvents = [
  // Q1 — Jan (Plan), Feb (Launch), Mar (Close)
  { date: '2026-01-05', type: 'sko',      title: 'Q1 Sales Kickoff',              description: 'New quotas, territories, commission plans. PMs present product roadmap and vision to the full sales team.' },
  { date: '2026-01-07', type: 'allhands', title: 'All-Hands: Q4 2025 Results',    description: 'Review Q4 sales results with the entire company immediately after quarter close.' },
  { date: '2026-01-21', type: 'board',    title: 'Board Meeting — Q4 2025',       description: '2–3 weeks after Dec 31 close. Board reviews Q4 results while data is fresh.' },
  { date: '2026-01-22', type: 'allhands', title: 'All-Hands: Strategy Review',    description: 'Feed board insights back into the company. Align everyone on strategic direction for Q1.' },
  { date: '2026-01-28', type: 'roadmap',  title: 'Roadmap Review: Q2 Planning',   description: 'Reprioritize and resource Q2 roadmap. Each project scoped to 2–10 engineers for 2–10 weeks max.' },
  { date: '2026-02-09', type: 'allhands', title: 'All-Hands: Q1 Launch Preview',  description: 'Preview the new release internally. The date is set — team knows the world is watching.' },
  { date: '2026-02-11', type: 'launch',   title: 'Q1 Launch / Webinar',           description: 'Week 6–7 lightning strike. Live demos + product news + customer stories + metrics. Four big strikes beat 52 weekly drips.' },
  { date: '2026-02-18', type: 'allhands', title: 'All-Hands: Launch Debrief',     description: 'What did customers say? Internalize learnings. Recognize employees for their launch work.' },
  { date: '2026-02-25', type: 'pipeline', title: 'Q1 Pipeline Inspection',        description: 'Sales leaders check team is on track. Advise reps how to close. Positive launch press helps warm prospects.' },
  { date: '2026-03-31', type: 'close',    title: 'Q1 Close',                      description: 'Sales quarter closes. Sales reps heads-down. Engineers coding next release in parallel.' },

  // Q2 — Apr (Plan), May (Launch), Jun (Close)
  { date: '2026-04-06', type: 'sko',      title: 'Q2 Sales Kickoff',              description: 'New quotas and territories. PMs present roadmap. Best practices shared across team.' },
  { date: '2026-04-07', type: 'allhands', title: 'All-Hands: Q1 Results',         description: 'Q1 sales results shared with the whole company.' },
  { date: '2026-04-22', type: 'board',    title: 'Board Meeting — Q1',            description: '~3 weeks after Mar 31 close. Board reviews Q1 results.' },
  { date: '2026-04-23', type: 'allhands', title: 'All-Hands: Strategy Review',    description: 'Board insights cascaded to the entire company. Align on Q2 direction.' },
  { date: '2026-04-29', type: 'roadmap',  title: 'Roadmap Review: Q3 Planning',   description: 'PMs finalize Q3 roadmap while engineers ship Q2 release. Rocks first, then pebbles, then sand.' },
  { date: '2026-05-11', type: 'allhands', title: 'All-Hands: Q2 Launch Preview',  description: 'Keynotes written, marketing collateral finalized. Preview the release before going public.' },
  { date: '2026-05-13', type: 'launch',   title: 'Q2 Launch / Webinar',           description: 'Week 6–7 lightning strike. Aggregate news into one compelling event — more impactful than drips.' },
  { date: '2026-05-20', type: 'allhands', title: 'All-Hands: Launch Debrief',     description: 'Customer feedback internalized. Positive press from launch drives leads and advances deals.' },
  { date: '2026-05-27', type: 'pipeline', title: 'Q2 Pipeline Inspection',        description: 'Mid-quarter pipeline health check. Sales leadership advises reps on closing strategy.' },
  { date: '2026-06-30', type: 'close',    title: 'Q2 Close',                      description: 'Mid-year close. Sales sprint. Engineers completing Q3 release code.' },

  // Q3 — Jul (Plan), Aug (Annual Conference), Sep (Close)
  { date: '2026-07-06', type: 'sko',      title: 'Q3 Sales Kickoff',              description: 'H2 kickoff. New quotas and territories. PMs present Q3–Q4 roadmap.' },
  { date: '2026-07-08', type: 'allhands', title: 'All-Hands: Q2 / H1 Results',   description: 'Mid-year results shared company-wide. Celebrate H1 wins and set H2 focus.' },
  { date: '2026-07-22', type: 'board',    title: 'Board Meeting — Q2',            description: '~3 weeks after Jun 30 close. Board reviews H1 performance and H2 strategy.' },
  { date: '2026-07-23', type: 'allhands', title: 'All-Hands: H2 Strategy',        description: 'H2 strategy from board meeting cascaded to the whole company.' },
  { date: '2026-07-29', type: 'roadmap',  title: 'Roadmap Review: Q4 Planning',   description: 'Plan Q4 rocks now — new products and major features — while Q3 engineers are building.' },
  { date: '2026-08-10', type: 'allhands', title: 'All-Hands: Conference Preview', description: 'Align the whole team on conference message and goals before the flagship event.' },
  { date: '2026-08-12', type: 'conference', title: 'Annual User Conference',      description: 'Flagship annual event. Keynotes, demos, customer talks, community. Think Dreamforce — start small, grow every year. The CEO goes on stage.' },
  { date: '2026-08-19', type: 'allhands', title: 'All-Hands: Conference Debrief', description: 'Debrief on outcomes. Recognize the team. Internalize customer feedback directly into the product roadmap.' },
  { date: '2026-08-26', type: 'pipeline', title: 'Q3 Pipeline Inspection',        description: 'Conference leads feed into pipeline. Review new opportunities generated by the annual event.' },
  { date: '2026-09-30', type: 'close',    title: 'Q3 Close',                      description: 'Q3 close. Sales sprint to hit number. Engineers finalizing Q4 release.' },

  // Q4 — Oct (Plan), Nov (Launch), Dec (Close)
  { date: '2026-10-05', type: 'sko',      title: 'Q4 Sales Kickoff',              description: 'Final quarter kickoff. Year-end push begins. PMs present Q4 product release.' },
  { date: '2026-10-07', type: 'allhands', title: 'All-Hands: Q3 Results',         description: 'Q3 results shared. Set the stage for a strong FY finish.' },
  { date: '2026-10-21', type: 'board',    title: 'Board Meeting — Q3',            description: '~3 weeks after Sep 30 close. Board reviews Q3 and full-year outlook.' },
  { date: '2026-10-22', type: 'allhands', title: 'All-Hands: Year-End Strategy',  description: 'Year-end strategy from board meeting. Focus the company on finishing FY2026 strong.' },
  { date: '2026-10-28', type: 'roadmap',  title: 'Roadmap Review: Q1 2027',       description: 'Plan Q1 2027 rocks while Q4 engineers are building. Stay ahead of the quarterly cycle.' },
  { date: '2026-11-09', type: 'allhands', title: 'All-Hands: Q4 Launch Preview',  description: 'Preview year-end release internally before going public. Internal excitement builds momentum.' },
  { date: '2026-11-11', type: 'launch',   title: 'Q4 Launch / Webinar',           description: 'Year-end lightning strike. Positive press helps sales close Q4 deals and hit FY number.' },
  { date: '2026-11-18', type: 'allhands', title: 'All-Hands: Launch Debrief',     description: 'Debrief and celebrate. Sales now heads-down for year-end close sprint.' },
  { date: '2026-11-25', type: 'pipeline', title: 'Q4 Pipeline Inspection',        description: 'Critical year-end pipeline review. Every deal matters for FY2026 target.' },
  { date: '2026-12-31', type: 'close',    title: 'Fiscal Year End (Dec 31)',      description: 'Q4 and full FY close. Dec 31 fiscal year-end per Sacks cadence. The cycle begins anew with Q1 2027.' },
];

const DAY_NAMES = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const CalendarIcon = ({ active }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1.5" y="3" width="13" height="11" rx="1.5" />
    <path d="M1.5 7h13" />
    <path d="M5 1.5v3M11 1.5v3" />
    <rect x="4" y="9.5" width="1.5" height="1.5" rx="0.25" fill="currentColor" stroke="none" />
    <rect x="7.25" y="9.5" width="1.5" height="1.5" rx="0.25" fill="currentColor" stroke="none" />
    <rect x="10.5" y="9.5" width="1.5" height="1.5" rx="0.25" fill="currentColor" stroke="none" />
  </svg>
);

const ListIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <line x1="5" y1="4" x2="14" y2="4" />
    <line x1="5" y1="8" x2="14" y2="8" />
    <line x1="5" y1="12" x2="14" y2="12" />
    <circle cx="2.5" cy="4" r="0.75" fill="currentColor" stroke="none" />
    <circle cx="2.5" cy="8" r="0.75" fill="currentColor" stroke="none" />
    <circle cx="2.5" cy="12" r="0.75" fill="currentColor" stroke="none" />
  </svg>
);

const CadenceCalendar = () => {
  const [tooltip, setTooltip] = useState(null);
  const [view, setView] = useState('calendar');

  const eventsByDate = {};
  for (const evt of cadenceEvents) {
    if (!eventsByDate[evt.date]) eventsByDate[evt.date] = [];
    eventsByDate[evt.date].push(evt);
  }

  const renderMiniCalendar = (monthInfo) => {
    const { month, name, theme, themeColor } = monthInfo;
    const year = 2026;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();

    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);

    return (
      <div key={month} style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        border: '1px solid #eee',
        flex: 1,
        minWidth: 0,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <span style={{ fontWeight: 'bold', fontSize: '0.95rem', color: '#333' }}>{name}</span>
          <span style={{
            fontSize: '0.6rem',
            fontWeight: 'bold',
            padding: '2px 8px',
            borderRadius: '999px',
            backgroundColor: themeColor,
            color: 'white',
            letterSpacing: '0.06em',
          }}>
            {theme.toUpperCase()}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', marginBottom: '4px' }}>
          {DAY_NAMES.map((d, i) => (
            <div key={i} style={{ textAlign: 'center', fontSize: '0.6rem', fontWeight: 'bold', color: '#bbb', paddingBottom: '2px' }}>
              {d}
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px' }}>
          {cells.map((day, i) => {
            if (day === null) return <div key={`e-${i}`} style={{ height: '32px' }} />;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayEvents = eventsByDate[dateStr] || [];
            const hasEvents = dayEvents.length > 0;
            return (
              <div
                key={i}
                style={{
                  height: '32px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '2px',
                  borderRadius: '6px',
                  cursor: hasEvents ? 'pointer' : 'default',
                  backgroundColor: hasEvents ? 'rgba(75,0,130,0.07)' : 'transparent',
                }}
                onMouseEnter={hasEvents ? (e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setTooltip({ events: dayEvents, x: rect.left + rect.width / 2, y: rect.top });
                } : undefined}
                onMouseLeave={hasEvents ? () => setTooltip(null) : undefined}
              >
                <span style={{ fontSize: '0.72rem', fontWeight: hasEvents ? 'bold' : 'normal', color: hasEvents ? '#4B0082' : '#555', lineHeight: 1 }}>
                  {day}
                </span>
                {hasEvents && (
                  <div style={{ display: 'flex', gap: '2px', justifyContent: 'center' }}>
                    {dayEvents.slice(0, 3).map((evt, j) => (
                      <div key={j} style={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: EVENT_CONFIG[evt.type].color }} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderListView = () => (
    <div>
      {[1, 2, 3, 4].map(q => {
        const qMonthNums = MONTHS_2026.filter(m => m.quarter === q).map(m => m.month);
        const qEvents = cadenceEvents.filter(evt => qMonthNums.includes(parseInt(evt.date.split('-')[1]) - 1));
        return (
          <div key={q} style={{ marginBottom: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{ backgroundColor: '#4B0082', color: 'white', fontWeight: 'bold', fontSize: '0.85rem', padding: '5px 14px', borderRadius: '999px' }}>
                Q{q}
              </div>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                {['Plan', 'Launch', 'Close'].map((theme, ti) => (
                  <React.Fragment key={theme}>
                    {ti > 0 && <span style={{ color: '#ccc', fontSize: '0.8rem' }}>→</span>}
                    <span style={{ fontSize: '0.78rem', fontWeight: 'bold', color: ['#4B0082', '#E91E8C', '#E74C3C'][ti] }}>
                      {MONTHS_2026.filter(m => m.quarter === q)[ti].name}: {theme}
                    </span>
                  </React.Fragment>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {qEvents.map((evt, i) => {
                const cfg = EVENT_CONFIG[evt.type];
                const d = new Date(evt.date + 'T00:00:00');
                const dateLabel = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
                return (
                  <div key={i} style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '16px',
                    padding: '12px 16px',
                    backgroundColor: 'white',
                    borderRadius: '10px',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                    borderLeft: `4px solid ${cfg.color}`,
                  }}>
                    <div style={{
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                      color: '#888',
                      minWidth: '90px',
                      paddingTop: '2px',
                      fontVariantNumeric: 'tabular-nums',
                    }}>
                      {dateLabel}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: '150px' }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: cfg.color, flexShrink: 0 }} />
                      <span style={{ fontSize: '0.72rem', fontWeight: 'bold', color: cfg.color, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        {cfg.icon} {cfg.label}
                      </span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 'bold', fontSize: '0.88rem', color: '#222', marginBottom: '2px' }}>{evt.title}</div>
                      <div style={{ fontSize: '0.78rem', color: '#777', lineHeight: '1.5' }}>{evt.description}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div style={{ position: 'relative' }}>
      {/* View toggle */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
        <div style={{
          display: 'flex',
          backgroundColor: '#f0f0f0',
          borderRadius: '8px',
          padding: '3px',
          gap: '2px',
        }}>
          {[
            { key: 'calendar', Icon: CalendarIcon, label: 'Calendar' },
            { key: 'list',     Icon: ListIcon,     label: 'List'     },
          ].map(({ key, Icon, label }) => {
            const isActive = view === key;
            return (
              <button
                key={key}
                onClick={() => setView(key)}
                title={label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: isActive ? '#4B0082' : 'transparent',
                  color: isActive ? 'white' : '#666',
                  fontWeight: isActive ? 'bold' : 'normal',
                  fontSize: '0.8rem',
                  transition: 'all 0.15s ease',
                }}
              >
                <Icon />
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '12px',
        justifyContent: 'center',
        marginBottom: '28px',
        padding: '14px 20px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      }}>
        {Object.entries(EVENT_CONFIG).map(([type, cfg]) => (
          <div key={type} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: 9, height: 9, borderRadius: '50%', backgroundColor: cfg.color, flexShrink: 0 }} />
            <span style={{ fontSize: '0.78rem', color: '#555' }}>{cfg.label}</span>
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'center', marginBottom: '24px', fontSize: '0.8rem', color: '#999', fontWeight: 'bold', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
        Fiscal Year 2026 — Jan 1 to Dec 31 — Quarterly Operating Cadence (David Sacks)
      </div>

      {view === 'list' ? renderListView() : (
        <>
          {[1, 2, 3, 4].map(q => {
            const qMonths = MONTHS_2026.filter(m => m.quarter === q);
            return (
              <div key={q} style={{ marginBottom: '28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <div style={{ backgroundColor: '#4B0082', color: 'white', fontWeight: 'bold', fontSize: '0.85rem', padding: '5px 14px', borderRadius: '999px', flexShrink: 0 }}>
                    Q{q}
                  </div>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                    {['Plan', 'Launch', 'Close'].map((theme, ti) => (
                      <React.Fragment key={theme}>
                        {ti > 0 && <span style={{ color: '#ccc', fontSize: '0.8rem' }}>→</span>}
                        <span style={{ fontSize: '0.78rem', fontWeight: 'bold', color: ['#4B0082', '#E91E8C', '#E74C3C'][ti] }}>
                          {qMonths[ti].name}: {theme}
                        </span>
                      </React.Fragment>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  {qMonths.map(renderMiniCalendar)}
                </div>
              </div>
            );
          })}
        </>
      )}

      {tooltip && (
        <div style={{
          position: 'fixed',
          left: tooltip.x,
          top: tooltip.y - 10,
          transform: 'translate(-50%, -100%)',
          backgroundColor: 'white',
          border: '1.5px solid #4B0082',
          borderRadius: '10px',
          padding: '12px 14px',
          zIndex: 1000,
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          minWidth: '240px',
          maxWidth: '320px',
          pointerEvents: 'none',
        }}>
          {tooltip.events.map((evt, i) => (
            <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: i < tooltip.events.length - 1 ? '10px' : 0 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: EVENT_CONFIG[evt.type].color, flexShrink: 0, marginTop: 5 }} />
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '0.85rem', color: '#333' }}>
                  {EVENT_CONFIG[evt.type].icon} {evt.title}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '3px', lineHeight: '1.5' }}>
                  {evt.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const Milestones = () => {
  const [activeTab, setActiveTab] = useState('gtm');
  const [milestoneNotes, setMilestoneNotes] = useState({});
  const [hoveredMilestone, setHoveredMilestone] = useState(null);
  const [editingMilestone, setEditingMilestone] = useState(null);
  const [editText, setEditText] = useState('');
  const { goal, milestones } = TAB_CONFIG[activeTab];

  useEffect(() => {
    fetch(`${API}/milestone-notes`)
      .then(r => r.json())
      .then(data => setMilestoneNotes(data))
      .catch(() => {});
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setHoveredMilestone(null);
    setEditingMilestone(null);
  };

  const saveNote = async (key) => {
    const dashIdx = key.indexOf('-');
    const tab = key.slice(0, dashIdx);
    const milestone_id = key.slice(dashIdx + 1);
    try {
      await fetch(`${API}/milestone-notes`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tab, milestone_id, note: editText }),
      });
      setMilestoneNotes(prev => ({ ...prev, [key]: editText }));
      setEditingMilestone(null);
      setHoveredMilestone(null);
    } catch (err) {
      console.error('Failed to save milestone note', err);
    }
  };

  const renderNoteTooltip = (key) => {
    const note = milestoneNotes[key] || '';
    const isEditing = editingMilestone === key;
    return (
      <div style={{
        position: 'absolute',
        top: 0, right: 0, bottom: 0, left: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.96)',
        borderRadius: '12px',
        padding: '20px',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        color: '#333',
        boxShadow: 'inset 0 0 0 2px rgba(75, 0, 130, 0.3)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 'bold', fontSize: '1rem', color: '#4B0082' }}>
            📝 Notes
          </span>
          {!isEditing && (
            <button
              onClick={() => { setEditingMilestone(key); setEditText(note); }}
              style={{
                padding: '5px 14px',
                backgroundColor: '#4B0082',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: 'bold',
              }}
            >
              Edit
            </button>
          )}
        </div>
        {isEditing ? (
          <>
            <textarea
              value={editText}
              onChange={e => setEditText(e.target.value)}
              autoFocus
              placeholder="Add your notes here..."
              style={{
                flex: 1,
                minHeight: '100px',
                resize: 'vertical',
                border: '1.5px solid #4B0082',
                borderRadius: '6px',
                padding: '8px',
                fontSize: '0.9rem',
                fontFamily: 'inherit',
                outline: 'none',
                color: '#333',
              }}
            />
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => { setEditingMilestone(null); setHoveredMilestone(null); }}
                style={{
                  padding: '6px 14px',
                  backgroundColor: 'transparent',
                  color: '#666',
                  border: '1px solid #ccc',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => saveNote(key)}
                style={{
                  padding: '6px 14px',
                  backgroundColor: '#4B0082',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: 'bold',
                }}
              >
                Save
              </button>
            </div>
          </>
        ) : (
          <p style={{
            margin: 0,
            fontSize: '0.95rem',
            lineHeight: '1.6',
            color: note ? '#333' : '#999',
            fontStyle: note ? 'normal' : 'italic',
            flex: 1,
            overflowY: 'auto',
            whiteSpace: 'pre-wrap',
          }}>
            {note || 'No notes yet. Click Edit to add.'}
          </p>
        )}
      </div>
    );
  };

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
                onClick={() => handleTabChange(key)}
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

        {activeTab === 'cadence' ? (
          <CadenceCalendar />
        ) : (
          <>
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

          {milestones.map((milestone, index) => {
            const noteKey = `${activeTab}-${milestone.id}`;
            return (
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
                    <div
                      style={{
                        backgroundColor: milestone.color,
                        color: 'white',
                        padding: '24px',
                        borderRadius: '12px',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                        position: 'relative',
                        display: 'flex'
                      }}
                      onMouseEnter={() => setHoveredMilestone(noteKey)}
                      onMouseLeave={() => { if (editingMilestone !== noteKey) setHoveredMilestone(null); }}
                    >
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
                      {(hoveredMilestone === noteKey || editingMilestone === noteKey) && renderNoteTooltip(noteKey)}
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
                    <div
                      style={{
                        backgroundColor: milestone.color,
                        color: 'white',
                        padding: '24px',
                        borderRadius: '12px',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                        position: 'relative',
                        display: 'flex'
                      }}
                      onMouseEnter={() => setHoveredMilestone(noteKey)}
                      onMouseLeave={() => { if (editingMilestone !== noteKey) setHoveredMilestone(null); }}
                    >
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
                      {(hoveredMilestone === noteKey || editingMilestone === noteKey) && renderNoteTooltip(noteKey)}
                    </div>
                  </div>
                </>
              )}
            </div>
          ); })}
        </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Milestones;