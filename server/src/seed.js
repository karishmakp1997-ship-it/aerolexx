import bcrypt from 'bcryptjs';
import { query } from './db.js';

// Default content taken from the Aerolex Figma design.
export const SETTINGS = {
  id: 1,
  site_name: 'Aerolex Advisors',
  logo: '/images/logo.png',
  cta_text: 'Book a Consultation',
  cta_link: '#contact',
  topbar_link_text: 'Operations Desk Login',
  topbar_link_url: '/admin/login',
  topbar_frequency: 'FREQ: 131.850 MHz',
  email: 'ops@aerolexadvisors.com',
  phone: '+00 000 000 0000',
  address: 'Global Operations Desk — 24/7',
  footer_about: 'Aviation operations and strategic advisory for airlines, private operators and high-value missions.',
  copyright_text: '© 2026 Aerolex Advisors. All rights reserved.',
  footer_tagline: 'Precision in Every Flight.',
  meta_title: 'Aerolex Advisors | Aviation Operations & Strategic Advisory',
  meta_description: 'Expert aviation operations, regulatory coordination, and strategic support for commercial airlines, private aviation operators, and high-value flight missions.',
};

export const SECTIONS = [
  {
    section_key: 'hero', label: 'Hero', sort_order: 1,
    eyebrow: 'Aviation Operations & Strategic Advisory',
    title: 'Precision in', title_highlight: 'Every Flight.',
    description: 'Expert aviation operations, regulatory coordination, and strategic support for commercial airlines, private aviation operators, and high-value flight missions.',
    image: '/images/hero.jpg',
    btn1_text: 'Explore Our Services', btn1_link: '#services',
    btn2_text: 'Get in Touch', btn2_link: '#contact',
    badge_label: 'Operations Desk', badge_value: '24/7 Coverage',
  },
  {
    section_key: 'about', label: 'About', sort_order: 2,
    eyebrow: 'About Aerolex',
    title: 'Your Trusted Partner in', title_highlight: 'Aviation Operations.',
    description: 'Aerolex Advisors provides specialized aviation operations support, regulatory advisory, and operational coordination to help aviation operators manage complex requirements with greater clarity and precision.',
    image: '/images/about.jpg',
    btn1_text: 'Discover Our Services', btn1_link: '#services',
  },
  {
    section_key: 'services', label: 'Services', sort_order: 3,
    eyebrow: 'Our Services',
    title: 'Operational Expertise.', title_highlight: 'Delivered with Precision.',
    description: 'Comprehensive aviation services designed to simplify operational complexity and support every stage of the flight lifecycle.',
    btn1_text: 'Enquire Service', btn1_link: '#contact',
  },
  {
    section_key: 'vip', label: 'VIP Aviation', sort_order: 4,
    eyebrow: 'VIP & Business Aviation',
    title: 'Exceptional Support for', title_highlight: 'High-Value Missions.',
    description: 'Structured, detail-oriented operational support for private charter coordination and executive aviation logistics.',
    image: '/images/vip.webp',
    btn1_text: 'Discuss Your Mission', btn1_link: '#contact',
  },
  {
    section_key: 'process', label: 'Our Process', sort_order: 5,
    eyebrow: 'Our Process',
    title: 'Every Flight Moves Through a', title_highlight: 'Structured Process.',
    image: '/images/process-bg.jpg',
  },
  {
    section_key: 'insights', label: 'Insights', sort_order: 6,
    eyebrow: 'Aviation Insights',
    title: 'Perspectives from the operations desk.', title_highlight: '',
    btn1_text: 'Read Article',
  },
  {
    section_key: 'cta', label: 'Get Started (CTA)', sort_order: 7,
    eyebrow: 'Get Started',
    title: "Let's Keep Your Operations", title_highlight: 'Moving.',
    description: 'Tell us about your next flight, operational requirements, or aviation support needs.',
    image: '/images/cta.jpg',
    btn1_text: 'Get in Touch', btn1_link: '#contact',
    btn2_text: 'Explore Our Services', btn2_link: '#services',
  },
  {
    section_key: 'contact', label: 'Contact', sort_order: 8,
    eyebrow: 'Contact',
    title: 'Start the conversation.', title_highlight: '',
    description: 'Share your mission details and our operations team will respond with a tailored plan.',
    image: '/images/contact-bg.jpg',
    btn1_text: 'Send Enquiry',
    badge_label: 'Thank you! Your enquiry has been received.',
    badge_value: 'Our operations desk will get back to you shortly.',
  },
];

const TOPBAR = [
  ['Aerolex Ops Dispatch', 'Active 24/7/365', 'green'],
  ['ATC Direct Clearance', 'Online', 'white'],
  ['ICAO / IATA Watch Extension', 'Available', 'white'],
  ['Global Slots Desk', 'Open', 'green'],
];

const NAV = [
  ['Home', '#home'], ['About', '#about'], ['Services', '#services'], ['VIP Aviation', '#vip'],
  ['Our Process', '#process'], ['Insights', '#insights'], ['Contact', '#contact'],
];

const HIGHLIGHTS = [
  ['Globe', 'Global Operations'], ['ShieldCheck', 'Regulatory Expertise'],
  ['Send', 'Flight Dispatch'], ['Workflow', 'Operational Coordination'],
];

const ABOUT_FEATURES = [
  ['Globe', 'Global Operational Perspective'], ['Clock', '24/7 Coordination Support'],
  ['Scale', 'Regulatory Expertise'], ['ShieldCheck', 'Safety-Driven Processes'],
];

const CATEGORIES = ['Flight Operations', 'Regulatory & Documentation', 'Airport & Ground Services', 'Crew & Passenger Services'];

// [category index, icon, title, description, tags, show in footer]
const SERVICES = [
  [1, 'FileCheck', 'Permit Handling', 'Coordinate overflight and landing permits, operational documentation, and application follow-ups.', ['Overflight Permits', 'Landing Permits', 'Documentation Coordination'], 1],
  [0, 'RadioTower', 'ATC Clearances', 'Support flight plan filing, air traffic clearance coordination, operational communications, and amendments.', ['ATS Flight Plans', 'Clearance Coordination', 'Flight Plan Amendments'], 1],
  [0, 'Route', 'Flight Planning', 'Coordinate route requirements, weather information, airspace restrictions, and flight preparation considerations.', ['Route Review', 'Weather Coordination', 'Operational Planning'], 1],
  [0, 'Gauge', 'Runway Analysis & Performance', 'Support the review of runway conditions, performance information, airport limitations, and operational documentation.', ['Runway Conditions', 'Performance Information', 'Airport Limitations'], 1],
  [0, 'Scale', 'Weight & Balance', 'Coordinate aircraft loading information and weight-and-balance documentation for operational preparation.', ['Load Information', 'Weight & Balance Documentation', 'Loading Coordination'], 1],
  [2, 'Clock', 'Extension of Watch Hours', 'Coordinate extended airport service availability requests and follow up with relevant service providers.', ['Service Availability', 'Airport Coordination', 'Request Tracking'], 1],
  [0, 'Radar', 'Flight Tracking', 'Monitor flight progress and coordinate updates about delays, arrival times, and operational disruptions.', ['Flight Status', 'Delay Updates', 'Stakeholder Communication'], 1],
  [1, 'Stamp', 'Visa Assistance', 'Coordinate crew and passenger travel documentation requirements and organize relevant visa paperwork.', ['Travel Documentation', 'Visa Guidance', 'Readiness Checks'], 0],
  [2, 'CalendarClock', 'Slot Coordination', 'Coordinate airport slot requests, scheduling requirements, timing changes, and status updates.', ['Airport Slot Requests', 'Schedule Coordination', 'Status Follow-up'], 0],
  [2, 'Fuel', 'Ground Handling', 'Coordinate ground services, aircraft turnaround requirements, fuel arrangements, and airport service providers.', ['Ground Handling', 'Fuel Coordination', 'Turnaround Support'], 0],
  [3, 'Users', 'Crew & Passenger Support', 'Coordinate crew logistics, accommodation, transportation, and passenger service requirements.', ['Crew Logistics', 'Ground Transportation', 'Passenger Services'], 0],
  [1, 'ShieldCheck', 'Regulatory Compliance', 'Support regulatory documentation, requirement tracking, and compliance-related operational coordination.', ['Documentation Support', 'Regulatory Tracking', 'Compliance Coordination'], 0],
];

const VIP = [
  ['PlaneLanding', 'Ramp & Ground Coordination', 'Airport services and ground arrangements.'],
  ['BedDouble', 'Crew Logistics', 'Crew accommodation and transportation.'],
  ['Sparkles', 'Passenger Experience', 'Passenger requests and travel coordination.'],
  ['Eye', 'Mission Oversight', 'Operational updates and stakeholder communication.'],
];

const PROCESS = [
  ['Headset', 'Operations Intake', 'Review mission details, schedules, documentation, and requested services.'],
  ['ClipboardCheck', 'Feasibility & Preparation', 'Coordinate operational information and identify relevant requirements.'],
  ['Settings', 'Coordination & Monitoring', 'Follow up with stakeholders and communicate operational updates.'],
  ['PlaneTakeoff', 'Operational Readiness', 'Consolidate updates and communicate the latest readiness information.'],
];

const INSIGHTS = [
  {
    title: 'Navigating Flight Permits and Operational Documentation',
    slug: 'navigating-flight-permits-and-operational-documentation',
    category: 'Regulatory', category_icon: 'FileText', image: '/images/insight-1.jpg',
    excerpt: 'A practical look at lead times, documentation and follow-ups that keep permits on schedule.',
    author: 'Aerolex Operations Desk', published_on: '2026-10-08', read_time: '5 min read',
    content: `Overflight and landing permits are rarely the most visible part of a mission, but they are often the item that decides whether a flight departs on time. Each civil aviation authority sets its own lead times, document formats and approval workflows, and those requirements can change with little notice.

## Start with the lead times

The first step is to map every country on the route and record its minimum notice period. Some authorities process routine requests within one working day, while others need several days for private or non-scheduled flights. Building the permit plan backwards from the departure time gives the team a clear deadline for every application.

## Keep the document pack complete

Most permit delays come from missing or outdated documents. A standard pack usually includes the certificate of registration, airworthiness certificate, insurance certificate, operator certificate where applicable, and crew licences. Keeping a verified, current set on file for each aircraft removes the need to chase paperwork during a time-critical request.

## Follow up before it becomes urgent

Submitting the application is only half the job. A structured follow-up schedule — confirming receipt, checking status at set intervals and escalating early when a reply is overdue — keeps permits moving and gives the operator an accurate picture of readiness.

## Plan for amendments

Schedules change. When a departure time, routing or aircraft changes, the related permits may need to be amended or reissued. Tracking which permits depend on which flight details means the right authorities can be contacted immediately, instead of discovering a mismatch on the day of operation.

Good permit handling is ultimately about visibility: knowing what is required, what has been submitted, and what is still outstanding at any moment in the mission timeline.`,
  },
  {
    title: 'Building Better Coordination Across Aviation Stakeholders',
    slug: 'building-better-coordination-across-aviation-stakeholders',
    category: 'Coordination', category_icon: 'Share2', image: '/images/insight-2.jpg',
    excerpt: 'How clear communication between operators, handlers and authorities reduces operational friction.',
    author: 'Aerolex Operations Desk', published_on: '2026-09-22', read_time: '4 min read',
    content: `A single flight can involve the operator, crew, ground handlers, fuel suppliers, airport authorities, air traffic services and the passengers themselves. Each party holds part of the information the others need, and most operational friction comes from that information arriving late or incomplete.

## Agree on one source of truth

Coordination works best when every stakeholder knows where the latest confirmed details live. A shared mission summary — schedule, aircraft, crew, services requested and status of each — reduces the back-and-forth of repeated questions and conflicting versions.

## Communicate changes, not just plans

The initial plan is usually well communicated. Problems appear when something changes. A clear process for announcing amendments, including who must be told and how quickly, keeps handlers, fuel providers and airports aligned with the current schedule.

## Confirm, then confirm again

Requests sent are not the same as requests confirmed. Tracking acknowledgements from each service provider, and re-confirming critical services close to departure, gives the operator confidence that everything ordered will be in place on arrival.

## Close the loop after the flight

A short post-flight review captures what worked and where communication slowed down. Over time, these notes become a practical playbook for each airport and supplier, making future missions faster to plan and easier to run.`,
  },
  {
    title: 'Preparing for Operational Disruptions',
    slug: 'preparing-for-operational-disruptions',
    category: 'Operations', category_icon: 'Shield', image: '/images/insight-3.jpg',
    excerpt: 'Structured approaches to delays, diversions and schedule changes that protect your mission.',
    author: 'Aerolex Operations Desk', published_on: '2026-09-05', read_time: '6 min read',
    content: `Weather, technical issues, airport restrictions and late passenger changes can all disrupt a carefully planned flight. Disruptions cannot be eliminated, but their impact can be reduced significantly with preparation done before the aircraft leaves the ground.

## Identify alternates early

For each leg, the team should know the suitable alternate airports, their operating hours, handling availability and any permit implications. When a diversion becomes necessary, decisions can then be made in minutes rather than hours.

## Watch the critical timings

Airport opening hours, slot windows, crew duty limits and permit validity periods all create deadlines. Monitoring these together shows how much a delay can grow before it affects the rest of the mission, and when an extension of watch hours or a new slot should be requested.

## Keep stakeholders informed

During a disruption, regular and accurate updates matter as much as the solution itself. Handlers need revised arrival times, crews need updated duty plans and passengers need realistic expectations. A predictable update rhythm prevents confusion and duplicated effort.

## Document and learn

Every disruption is useful data. Recording what happened, how long each step took and which contacts were most effective builds a stronger response for the next time a similar situation occurs.

Prepared teams do not avoid every disruption — they simply recover from them faster and with less impact on the mission.`,
  },
];

async function isEmpty(table) {
  const rows = await query(`SELECT COUNT(*) AS c FROM ${table}`);
  return rows[0].c === 0;
}

async function insertMany(table, cols, rows) {
  for (const r of rows) {
    await query(`INSERT INTO ${table} (${cols.join(',')}) VALUES (${cols.map(() => '?').join(',')})`, r);
  }
}

export async function seed({ force = false } = {}) {
  const log = [];
  if (force || (await isEmpty('admins'))) {
    const username = process.env.ADMIN_USERNAME || 'admin';
    const password = process.env.ADMIN_PASSWORD || 'Admin@123';
    const hash = await bcrypt.hash(password, 10);
    await query('INSERT INTO admins (name, username, password_hash) VALUES (?,?,?)', ['Administrator', username, hash]);
    log.push(`admin user "${username}" created`);
  }
  if (force || (await isEmpty('site_settings'))) {
    const cols = Object.keys(SETTINGS);
    await query(`INSERT INTO site_settings (${cols.join(',')}) VALUES (${cols.map(() => '?').join(',')})`, cols.map((c) => SETTINGS[c]));
    log.push('site settings');
  }
  if (force || (await isEmpty('site_sections'))) {
    const cols = ['section_key', 'label', 'sort_order', 'eyebrow', 'title', 'title_highlight', 'description', 'image', 'btn1_text', 'btn1_link', 'btn2_text', 'btn2_link', 'badge_label', 'badge_value'];
    await insertMany('site_sections', cols, SECTIONS.map((s) => cols.map((c) => s[c] ?? null)));
    log.push('sections');
  }
  if (force || (await isEmpty('topbar_items'))) {
    await insertMany('topbar_items', ['label', 'value', 'value_style', 'sort_order'], TOPBAR.map((t, i) => [...t, i + 1]));
    log.push('top bar');
  }
  if (force || (await isEmpty('nav_links'))) {
    await insertMany('nav_links', ['label', 'target', 'sort_order'], NAV.map((t, i) => [...t, i + 1]));
    log.push('navigation');
  }
  if (force || (await isEmpty('hero_highlights'))) {
    await insertMany('hero_highlights', ['icon', 'title', 'sort_order'], HIGHLIGHTS.map((t, i) => [...t, i + 1]));
    log.push('hero highlights');
  }
  if (force || (await isEmpty('about_features'))) {
    await insertMany('about_features', ['icon', 'title', 'sort_order'], ABOUT_FEATURES.map((t, i) => [...t, i + 1]));
    log.push('about features');
  }
  if (force || (await isEmpty('service_categories'))) {
    await insertMany('service_categories', ['name', 'sort_order'], CATEGORIES.map((n, i) => [n, i + 1]));
    log.push('service categories');
  }
  if (force || (await isEmpty('services'))) {
    const cats = await query('SELECT id FROM service_categories ORDER BY sort_order, id');
    await insertMany('services', ['category_id', 'icon', 'title', 'description', 'tags', 'show_in_footer', 'sort_order'],
      SERVICES.map(([ci, icon, title, desc, tags, foot], i) => [cats[ci]?.id ?? null, icon, title, desc, JSON.stringify(tags), foot, i + 1]));
    log.push('services');
  }
  if (force || (await isEmpty('vip_features'))) {
    await insertMany('vip_features', ['icon', 'title', 'description', 'sort_order'], VIP.map((t, i) => [...t, i + 1]));
    log.push('vip features');
  }
  if (force || (await isEmpty('process_steps'))) {
    await insertMany('process_steps', ['icon', 'title', 'description', 'sort_order'], PROCESS.map((t, i) => [...t, i + 1]));
    log.push('process steps');
  }
  if (force || (await isEmpty('insights'))) {
    const cols = ['title', 'slug', 'category', 'category_icon', 'image', 'excerpt', 'content', 'author', 'published_on', 'read_time', 'sort_order'];
    await insertMany('insights', cols, INSIGHTS.map((a, i) => [...cols.slice(0, -1).map((c) => a[c]), i + 1]));
    log.push('insights');
  }
  return log;
}
