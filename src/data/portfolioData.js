export const OPERATOR_SPEC = {
  name: 'Lee Parkinson',
  monogram: 'LP',
  age: 21,
  location: 'Preston & Blackpool, Lancashire, UK',
  campus: 'University of Lancashire (UCLan)',
  degree: 'Electrical Engineering (Foundation Year)',
  drawingNo: 'DWG: LP-ENG-2026-EE',
  revision: 'REV 14.0 // BS-8888 CAD',
  standard: 'BS 8888 · ISO 7200 · IEEE-315',
  scale: '1:1 ORTHOGRAPHIC',
  activeRole: 'Bar Team Leader @ Wetherspoons',
  email: 'lspky@pm.me',
  secondaryEmail: 'leeparkinson04@gmail.com',
  phone: '(+44) 07940 212007',
  cvUrl: 'assets/files/Lee-ParkinsonCV.pdf',
  github: 'https://github.com/leeprky',
  repoUrl: 'https://github.com/leeprky/leeprky.github.io',
  linkedin: 'https://www.linkedin.com/in/lee-parkinson-605807229/',
  betterDiscord: 'https://betterdiscord.app/developer/leeprky',
  soundcloud: 'https://soundcloud.com/leethal04',
  rotatingRoles: [
    'ELECTRICAL ENGINEERING @ UCLAN',
    'AUTOMOTIVE OBD-II & 12V DIAGNOSTICS',
    'CIRCUIT ANALYSIS & LAB INSTRUMENTATION',
    'PC ARCHITECTURE & IT SYSTEMS (D*D*)',
    'LIVE SOUND & PIONEER DJ ACOUSTICS'
  ],
  heroLead:
    "Electrical Engineering student at the University of Lancashire (UCLan) in Preston. Passionate about hands-on diagnostics and practical engineering — from probing 12V automotive harnesses with FORScan and testing lab circuits to assembling custom PC rigs and modular software.",
  telemetryStats: [
    { id: 'STAT-01', value: 21, suffix: ' YRS', label: 'Operator Age // Preston, UK', code: 'OP-AGE' },
    { id: 'STAT-02', value: 100, suffix: '% D*D*', label: 'BTEC National Diploma IT', code: 'QUAL-IT' },
    { id: 'STAT-03', value: 9, suffix: ' / 9', label: 'GCSE Photography Distinction', code: 'OPT-09' },
    { id: 'STAT-04', value: 400, suffix: '+', label: 'BetterDiscord Theme Community', code: 'UI-USR' }
  ]
};

export const IC_PINOUT = [
  {
    pin: 1,
    side: 'left',
    code: 'VCC_12V',
    name: 'Automotive 12V & OBD-II Diagnostics',
    voltage: '12.6V DC',
    freq: 'CAN-BUS 500kHz',
    summary:
      'Hands-on fault finding at Car Cosmetics using FORScan & OBD-II diagnostic scanners, sensor harness tracing, and 12V automotive electrical repair.'
  },
  {
    pin: 2,
    side: 'left',
    code: 'CLK_EE',
    name: 'Circuit Theory & AC/DC Instrumentation',
    voltage: '±15.0V AC/DC',
    freq: '50Hz — 1MHz',
    summary:
      "Ohm's & Kirchhoff's laws, nodal/mesh analysis, operational amplifiers, digital logic gates, and oscilloscope laboratory testing at UCLan."
  },
  {
    pin: 3,
    side: 'left',
    code: 'BUS_SYS',
    name: 'PC Architecture & Network Infrastructure',
    voltage: '3.3V / 5.0V',
    freq: 'PCIe Gen4',
    summary:
      'Double Distinction Star (D*D*) in BTEC IT & D*2 in Digital ICT — custom PC assembly, capacitor replacement, IPv4/IPv6 networking, and SQL databases.'
  },
  {
    pin: 4,
    side: 'left',
    code: 'GND_MECH',
    name: 'Hydraulic Braking & Workshop Mechanics',
    voltage: '0.0V REF',
    freq: 'HYDRAULIC',
    summary:
      'Practical mechanical servicing, brake rotor/pad overhauls, hydraulic brake line bleeding, fluid flushes, and suspension assembly teardown.'
  },
  {
    pin: 8,
    side: 'right',
    code: 'CAD_DRW',
    name: 'BS 8888 Orthographic & Technical Drafting',
    voltage: 'ISO-128',
    freq: '3RD ANGLE',
    summary:
      'Hand-drafted 3rd-angle orthographic projections, datum construction lines, compound geometric solids, and engineering specification blocks.'
  },
  {
    pin: 7,
    side: 'right',
    code: 'OPS_LEAD',
    name: 'High-Volume Shift & Team Leadership',
    voltage: 'HIGH-LOAD',
    freq: '1000+ PAX',
    summary:
      'Bar Team Leader at Wetherspoons (The Velvet Coaster & The Twelve Tellers) & former Ride Operator at Pleasure Beach Resort under strict safety interlocks.'
  },
  {
    pin: 6,
    side: 'right',
    code: 'UI_CSS',
    name: 'Modular CSS & Open-Source Client Themes',
    voltage: 'GPU-ACCEL',
    freq: '60/120Hz',
    summary:
      'Creator of WindowsXI, MaterialYou, Vintage, and Fluidcord themes for BetterDiscord & Vencord with 400+ active community members.'
  },
  {
    pin: 5,
    side: 'right',
    code: 'DSP_AUD',
    name: 'Pioneer DJ Live Sound & Acoustic Routing',
    voltage: '+4dBu XLR',
    freq: '20Hz—20kHz',
    summary:
      'Live venue DJing (leethal04), club mixer signal routing, gain staging, active PA EQ tuning, and frequency separation.'
  }
];

export const EDUCATION_DATA = [
  {
    id: 'DEGREE-01',
    level: 'UNIVERSITY // UNDERGRADUATE TRACK',
    institution: 'University of Lancashire (UCLan)',
    qualification: 'Electrical Engineering (Foundation Year)',
    period: '2026 — Present',
    location: 'Preston, Lancashire',
    badge: 'ACTIVE TRACK',
    annotation: '"foundation year in Preston"',
    featured: true,
    summary:
      'Building core engineering mathematics, physics, and practical laboratory instrumentation skills alongside electrical circuit theory, digital electronics, power systems, and BS 8888 technical drafting.',
    modules: [
      'Electrical Circuit Theory (Ohm / Kirchhoff)',
      'Digital Electronics & Logic',
      'Power Systems & Electromagnetics',
      'Sensor Instrumentation & Lab Measurement',
      'Engineering Mathematics & Calculus',
      '3rd-Angle Orthographic CAD Drafting'
    ],
    grades: [
      { label: 'DISCIPLINE', value: 'Electrical & Electronic Engineering', highlight: true },
      { label: 'CAMPUS', value: 'Preston City Campus (PR1)', highlight: false }
    ]
  },
  {
    id: 'LEVEL-03',
    level: 'FURTHER EDUCATION // LEVEL 3',
    institution: 'Blackpool Sixth Form College',
    qualification: 'BTEC National Extended Diploma in IT & GCE A-Level Computer Science',
    period: 'Completed 08/2023',
    location: 'Blackpool, Lancashire',
    badge: 'DOUBLE DISTINCTION*',
    annotation: '"Double Distinction Star (D*D*)"',
    featured: false,
    summary:
      'Intensive technical curriculum covering computer hardware architecture, IPv4/IPv6 networking, relational database design & SQL, systems administration, and software programming.',
    modules: [
      'Computer Hardware & Architecture',
      'Network Engineering (IPv4/IPv6)',
      'Relational Databases & SQL',
      'Systems Administration',
      'Algorithms & Data Structures',
      'Software Development'
    ],
    grades: [
      { label: 'BTEC NATIONAL DIPLOMA (IT)', value: 'Grade: D* D* (Distinction* Distinction*)', highlight: true },
      { label: 'GCE A-LEVEL COMPUTER SCIENCE', value: 'Grade: E (von Neumann & Programming)', highlight: false }
    ]
  },
  {
    id: 'LEVEL-02',
    level: 'SECONDARY EDUCATION // GCSEs & BTEC LEVEL 2',
    institution: "St Mary's Catholic Academy",
    qualification: '9x GCSEs & Level 2 Technical Qualifications',
    period: 'Completed 06/2021',
    location: 'Blackpool, Lancashire',
    badge: 'D*2 + GRADE 9',
    annotation: '"D*2 in Digital ICT & Grade 9 Photography"',
    featured: false,
    summary:
      'Strong technical foundation anchored by a Distinction* (D*2) in Digital Information Technology, Grade 9 in Photography, Grade 7 in Religious Studies, Triple Science (Physics, Chemistry, Biology), English, and Mathematics.',
    modules: [
      'Digital Information Technology (D*2)',
      'Optical & Landscape Photography (Grade 9)',
      'Triple Science: Physics, Chemistry, Biology',
      'GCSE Mathematics & English'
    ],
    grades: [
      { label: 'DIGITAL ICT ★', value: 'D*2 (Distinction*)', highlight: true },
      { label: 'PHOTOGRAPHY ★', value: 'Grade 9 (Top Band)', highlight: true },
      { label: 'RELIGIOUS STUDIES', value: 'Grade 7 (A)', highlight: false },
      { label: 'ENGLISH LANG / LIT', value: 'Grade 6 / Grade 5', highlight: false },
      { label: 'TRIPLE SCIENCE', value: 'Biology: 6 · Chemistry: 5 · Physics: 5', highlight: false },
      { label: 'MATHEMATICS', value: 'Grade 4 (Standard Pass)', highlight: false }
    ]
  }
];

export const CERTIFICATIONS_DATA = [
  {
    code: 'CERT-01',
    title: 'Full UK Manual Driving Licence',
    date: 'Passed 11/2022',
    detail: 'Clean manual transmission licence with commercial multi-drop logistics & workshop road-test experience.'
  },
  {
    code: 'CERT-02',
    title: 'Duke of Edinburgh Bronze Award',
    date: 'Verified',
    detail: 'Demonstrated field navigation, expedition planning, team leadership, and outdoor resilience.'
  },
  {
    code: 'CERT-03',
    title: 'ACT Counter-Terrorism Certificate',
    date: 'Verified',
    detail: 'Trained in high-capacity venue security, hazard identification, and emergency incident response.'
  },
  {
    code: 'CERT-04',
    title: 'Fire Safety Training Certification',
    date: 'Verified',
    detail: 'Applied workplace safety inspection protocols, evacuation leadership, and compliance standards.'
  },
  {
    code: 'PROG-05',
    title: 'Career Ready & Humanutopia Programs',
    date: 'Completed',
    detail: '1-to-1 industry mentorship, professional masterclasses, and youth leadership development.'
  }
];

export const EXPERIENCE_DATA = [
  {
    id: 'JOB 06 // CURRENT',
    company: 'Wetherspoons',
    role: 'Bar Team Leader',
    location: 'Blackpool & Preston, Lancashire',
    period: '03/2025 — Present',
    badge: 'PROMOTED TO TEAM LEADER',
    annotation: '"Velvet Coaster → Twelve Tellers"',
    current: true,
    bullets: [
      'Shift Leadership: Leading high-volume bar and floor operations during peak services serving 600–1,000+ patrons across multi-level seaside and city-centre venues.',
      'Operations & Cellar Engineering: Cellar stock management, pneumatic/pyython line cleaning, POS till reconciliation, cash auditing, health & safety, and licensing compliance.',
      'Team Mentoring: Training and onboarding new associates, driving upselling performance bonuses, and enforcing strict Challenge 25 verification.'
    ],
    venues: [
      {
        name: 'The Velvet Coaster · Blackpool South Shore',
        desc: 'Bar Team Leader at one of the UK’s largest flagship multi-floor seaside hospitality venues.'
      },
      {
        name: 'The Twelve Tellers · Preston City Centre',
        desc: 'Bar Team Leader in central Preston alongside full-time Electrical Engineering studies at UCLan.'
      }
    ]
  },
  {
    id: 'JOB 05 // LOGISTICS',
    company: '313 Logistics (Amazon DSP)',
    role: 'Multi-Drop Delivery Driver',
    location: 'Leyland, Lancashire',
    period: '11/2024 — 04/2025',
    badge: '315 PARCELS / DAY',
    annotation: '"180+ stops daily route precision"',
    current: false,
    bullets: [
      'Managed high-density daily transport and dispatch of up to 315 parcels per shift (weights up to 15 kg) across 180+ residential and commercial buildings.',
      'Executed dynamic GPS route optimization, photographic proof-of-delivery telemetry, and strict schedule adherence.',
      'Independently managed self-employed accounting, tax, and National Insurance filings with HMRC.'
    ]
  },
  {
    id: 'JOB 04 // AUTOMOTIVE WORKSHOP',
    company: 'Car Cosmetics',
    role: 'Apprentice Automotive Technician — Diagnostics & Repair',
    location: 'Blackpool, Lancashire',
    period: '04/2024 — 10/2024',
    badge: 'OBD-II & FORSCAN',
    annotation: '"hands-on workshop diagnostics"',
    current: false,
    bullets: [
      'Diagnosed vehicle wiring faults, ECU fault codes, sensor harness failures, and mechanical issues using FORScan and specialised OBD-II diagnostic tools.',
      'Conducted full routine servicing, fluid exchanges, brake rotor/pad replacements, and hydraulic brake bleeding to manufacturer torque and pressure specs.',
      'Stripped down mechanical assemblies, valeted vehicles with specialist compounds, and installed aftermarket performance kits (Ref: Stephen Parkinson, Owner).'
    ]
  },
  {
    id: 'JOB 03 // MECHANICAL SAFETY',
    company: 'Pleasure Beach Resort',
    role: 'Ride Operator — Mechanical & Safety Systems',
    location: 'Blackpool, Lancashire',
    period: '03/2023 — 11/2024',
    badge: 'SAFETY CRITICAL',
    annotation: '"interlocks & pre-opening checks"',
    current: false,
    bullets: [
      'Operated flagship amusement rides under strict mechanical, pneumatic, and PLC safety interlock protocols.',
      'Executed daily pre-opening proximity sensor tests, hydraulic/mechanical restraint inspections, and emergency-stop readiness drills to prevent downtime and hazards.',
      'Trained and mentored new ride operations staff in safety-first dispatch procedures.'
    ]
  },
  {
    id: 'JOB 02 // DISPATCH',
    company: "Dottie's Desserts",
    role: 'Food Courier',
    location: 'Blackpool, Lancashire',
    period: '11/2023 — 06/2024',
    badge: 'RAPID ROUTE',
    annotation: '"late-shift dispatch"',
    current: false,
    bullets: [
      'Utilised live GPS telemetry to calculate fastest multi-stop delivery routes across the Fylde coast.',
      'Maintained rapid turnaround times and close coordination with kitchen dispatch teams.'
    ]
  },
  {
    id: 'JOB 01 // FOUNDATION',
    company: "McDonald's",
    role: 'Crew Member',
    location: 'Blackpool, Lancashire',
    period: '03/2022 — 02/2023',
    badge: 'HIGH THROUGHPUT',
    annotation: '"where I started"',
    current: false,
    bullets: [
      'Operated advanced POS terminals and maintained high-speed kitchen and front-counter throughput during peak rushes.',
      'Built a strong foundation in disciplined teamwork, hygiene compliance, and fast-paced communication.'
    ]
  }
];

export const DISCIPLINES_DATA = [
  {
    id: 'CS-01',
    category: 'cs',
    code: 'CS-01 // ARCHITECTURE & CODE',
    meta: 'A-LEVEL & SELF-TAUGHT',
    title: 'Computer Science & Software',
    description:
      'Studied hardware architectures, von Neumann execution cycles, CPU registers, assembly concepts, data structures, operating system kernels, and modular frontend styling.',
    chips: ['PC Architecture', 'Operating Systems', 'Data Structures', 'Modular CSS / JS']
  },
  {
    id: 'SYS-02',
    category: 'digital',
    code: 'SYS-02 // HARDWARE & NETWORKING',
    meta: 'D*D* DIPLOMA + D*2',
    title: 'ICT Systems & Infrastructure',
    description:
      'Top grades in BTEC IT (D*D*) and GCSE Digital ICT (D*2) — custom PC rig assembly, component-level fault isolation, capacitor replacement, IPv4/IPv6 networking, and SQL databases.',
    chips: ['Custom PC Builds', 'IPv4/IPv6 Networking', 'SQL Databases', 'Hardware Troubleshooting']
  },
  {
    id: 'CAD-01',
    category: 'electrical',
    code: 'CAD-01 // ACADEMIC SPEC',
    meta: 'UCLAN · PRESTON',
    title: 'Electrical Engineering (UCLan)',
    description:
      'Covering DC/AC circuit fundamentals, Ohm’s and Kirchhoff’s laws, operational amplifiers, digital logic, engineering calculus, and laboratory oscilloscope/multimeter testing.',
    chips: ['Circuit Analysis', 'Digital Electronics', 'Lab Instrumentation', 'BS 8888 CAD Drafting']
  },
  {
    id: 'CAD-02',
    category: 'automotive',
    code: 'CAD-02 // WORKSHOP MECHANICS',
    meta: 'CAR COSMETICS',
    title: 'Automotive Diagnostics & 12V Systems',
    description:
      'Workshop apprenticeship diagnosing 12V vehicle electrical circuits, CAN-bus sensor harnesses with FORScan/OBD-II, engine servicing, hydraulic brake bleeding, and suspension work.',
    chips: ['FORScan / OBD-II', '12V Vehicle Electrics', 'Hydraulic Brake Bleeding', 'Mechanical Servicing']
  }
];

export const CAD_PROJECTIONS = [
  {
    id: 'SPEC 04.2-A // ORTHOGRAPHIC CAD',
    title: 'Electric Screwdriver 3rd-Angle Projection',
    date: '15/10/2026 · Week 3 Lab',
    scale: 'NTS // BS 8888',
    image: 'assets/images/screwdriver-fixed.jpeg',
    description:
      'Hand-drafted orthographic projection (Top, Side, and Front views) of an electric screwdriver assembly featuring construction projection lines, centre lines, and revision block (Rev 2, UCLan).',
    dimensions: 'Views: Top / Side / Front · Standard: BS 8888'
  },
  {
    id: 'SPEC 04.2-B // AERONAUTICAL DRAFTING',
    title: 'Week 2 Draco Plane Multi-View Drawing',
    date: '14/10/2026 · Week 2 Lab',
    scale: 'ORTHO MULTI-VIEW',
    image: 'assets/images/week2-draco-plane.jpeg',
    description:
      'Aeronautical orthographic projection (Front, Top, and Side views) of the Draco bush plane detailing wingspan alignment, propeller radial geometry, and fuselage datum lines.',
    dimensions: 'Views: Front / Top / Side · Datum Aligned'
  },
  {
    id: 'SPEC 04.2-C // GEOMETRIC PROJECTIONS',
    title: 'Week 3 Compound Shapes & 3rd-Angle Solids',
    date: '14–15/10/2026 · Week 3 Lab',
    scale: '3RD ANGLE PROJECTION',
    image: 'assets/images/week3-shapes-fixed.jpeg',
    description:
      'Dual-sheet third-angle orthographic projection study of stepped prisms, inclined planes, and recessed slots with hidden-detail dashed lines and dimensional projection alignment.',
    dimensions: 'Views: Top / Front / R-Side · Hidden Detail'
  }
];

export const AUTOMOTIVE_SUBSYSTEMS = [
  {
    code: 'SYS-A // 12V & OBD-II',
    name: 'ECU Telemetry & Sensor Harness Diagnostics',
    status: 'VERIFIED // FORSCAN',
    spec: '12.6V DC · CAN-H / CAN-L',
    detail:
      'Live diagnostic interrogation using FORScan & OBD-II interfaces — reading freeze-frame fault codes, O2/MAF sensor waveforms, injector duty cycles, and parasitic battery draw isolation.'
  },
  {
    code: 'SYS-B // HYDRAULICS',
    name: 'Brake Caliper, Rotor & Hydraulic Line Overhaul',
    status: 'BLEED COMPLETE',
    spec: 'DOT 4 · TORQUE SPEC',
    detail:
      'Full corner-by-corner brake pad and disc replacement, seized caliper piston inspection, and pressure/manual hydraulic line bleeding to eliminate air compressibility.'
  },
  {
    code: 'SYS-C // POWERTRAIN',
    name: 'Periodic Mechanical Servicing & Fluid Flushes',
    status: 'WORKSHOP LOGGED',
    spec: '5W-30 SYNTH · FILTERS',
    detail:
      'Oil and filter service intervals, coolant system pressure checks, spark plug/ignition coil replacement, and auxiliary drive belt tension inspection.'
  },
  {
    code: 'SYS-D // CHASSIS & AERO',
    name: 'BMW E90 3 Series Styling & Lighting Retrofit',
    status: 'ACTIVE BUILD',
    spec: 'E90 SALOON · HALO RINGS',
    detail:
      'Personal red BMW E90 3 Series — fitted gloss-black front aero splitter, angel-eye halo ring optics, paint decontamination/valeting, and ongoing preventative maintenance.'
  }
];

export const DISCORD_THEMES = [
  {
    id: 'THEME-01',
    name: 'WindowsXI Discord Theme',
    url: 'https://github.com/leeprky/WindowsXI',
    meta: 'FLUENT DESIGN // MICA',
    description:
      'Fluent Design System overhaul for Discord featuring Windows 11 acrylic translucency, mica titlebars, hardware-accelerated layer blurs, and seamless dark/light mode support.',
    chips: ['Fluent CSS', 'Acrylic Backdrop', 'Light / Dark Mode']
  },
  {
    id: 'THEME-02',
    name: 'MaterialYou & Vintage',
    url: 'https://github.com/leeprky/Vintage',
    meta: 'DYNAMIC TONAL // RETRO',
    description:
      'Dynamic tonal palette architecture inspired by Android 12 Material You, alongside Vintage v0.9 — a warm, tactile retro theme for BetterDiscord and Vencord.',
    chips: ['Material You', 'Vintage v0.9', 'BetterDiscord & Vencord']
  },
  {
    id: 'THEME-03',
    name: 'Lode, Ovel & Fluidcord',
    url: 'https://github.com/leeprky',
    meta: 'GLASS UI // MODULAR',
    description:
      'Minimalist transparent glassmorphism themes and lightweight utility CSS modules engineered for low GPU overhead and crisp typography.',
    chips: ['Fluidcord', 'Glass UI', 'Modular CSS Architecture']
  }
];

export const HOBBIES_DATA = [
  {
    id: 'FIELD-01 // EXPEDITIONS',
    meta: 'LAKE DISTRICT & PENNINES',
    title: 'Mountaineering, Gorge Scrambling & Wild Camping',
    description:
      'Heading into the mountains is my favourite way to recharge outside the lab and shift work — climbing Lake District fells, scrambling up rocky waterfalls and gorges, and pitch-camping overnight in remote valleys.',
    photos: [
      {
        src: 'assets/images/hobby-waterfall.jpg',
        alt: 'Lee scrambling up a gorge waterfall in the Lake District',
        code: 'FIG 05.1 // GORGE',
        caption: '"waterfall scramble"'
      },
      {
        src: 'assets/images/hobby-mountains.jpg',
        alt: 'Mountain stream looking over valley in the Lake District',
        code: 'FIG 05.2 // FELLS',
        caption: '"valley stream"'
      }
    ],
    chips: ['Lake District Fells', 'Gorge Scrambling', 'Wild Camping', 'Ridge Navigation']
  },
  {
    id: 'FIELD-02 // MOTORING',
    meta: 'BMW E90 3 SERIES',
    title: 'Motoring, Car Meets & DIY Workshop Mechanics',
    description:
      'From my apprenticeship at Car Cosmetics to maintaining and modifying my own red BMW E90 3 Series — doing my own diagnostics, fluid flushes, brake jobs, and styling upgrades like the front splitter and angel eyes.',
    photos: [
      {
        src: 'assets/images/car-front.jpg',
        alt: "Lee's red BMW E90 front view with gloss black front splitter",
        code: 'FIG 05.3 // DAY OPTICS',
        caption: '"BMW E90 front splitter"'
      },
      {
        src: 'assets/images/car-night.jpg',
        alt: "Lee's red BMW E90 at night with illuminated angel eyes",
        code: 'FIG 05.4 // NIGHT OPTICS',
        caption: '"angel eyes at night"'
      }
    ],
    chips: ['BMW E90 3 Series', 'OBD-II Diagnostics', 'DIY Servicing', 'Automotive Photography']
  }
];

export const SIDE_PURSUITS = [
  {
    code: 'SIDE-01 // OPTICS',
    title: 'Landscape & Automotive Photography',
    detail:
      'Putting my Grade 9 in GCSE Photography to work capturing Lake District mountain ridges, long-exposure waterfalls, and night-time automotive shoots.'
  },
  {
    code: 'SIDE-02 // HARDWARE',
    title: 'PC Rig Building & Electronics Modding',
    detail:
      'Building custom desktop rigs, soldering and replacing board components, tuning thermals, and experimenting with open-source software.'
  },
  {
    code: 'SIDE-03 // ACOUSTICS',
    title: 'Live Sound & DJ Mixing (leethal04)',
    detail:
      'Mixing live sets on Pioneer DJ decks, dialled into signal flow, gain staging, EQ separation, and room acoustics.'
  },
  {
    code: 'SIDE-04 // ATHLETICS',
    title: 'Weightlifting, Skateboarding & Football',
    detail:
      'Maintaining physical discipline in the gym alongside skateboarding and 5-a-side/11-a-side football for teamwork and focus.'
  }
];
