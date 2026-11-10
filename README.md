# Lee Parkinson — Engineering Blueprint Portfolio (`DWG NO. LP-EE-2026`)

> **Incoming BEng (Hons) Electrical & Electronic Engineering Student · University of Central Lancashire (UCLan), Preston**  
> Live Site: [https://leeprky.github.io/](https://leeprky.github.io/)

An interactive, single-sheet **BS 8888 / ISO 7200 Engineering Blueprint Portfolio** built with **React**, **Vite**, and **[React Bits](https://github.com/DavidHDev/react-bits)** (`gsap` + `motion` + `lenis`).

---

## Blueprint Architecture & Interactive Modules

| Sheet | Drawing Reference | Interactive Features & React Bits Components |
| :--- | :--- | :--- |
| **00 // HERO** | `ISO 7200 TITLE BLOCK` | Interactive particle `TechText` canvas heading, `RotatingText` discipline ticker, `CountUp` telemetry counters, 3D `TiltedCard` portrait with flip-to-schematic IC pinout backplate, and `ScrollVelocity` telemetry banner |
| **01 // PROFILE** | `SHT-01 · REV C · SCALE 1:1` | `DecryptedText` header, `SpotlightCard` core pillars, and **Interactive Circuit Lab Bench** (`IC-LP2026` 8-pin DIP pinout inspector + 60fps HTML5 Canvas **Oscilloscope & Ohm's Law Simulator**) |
| **02 // DISCIPLINES** | `SHT-02 · REV C · SCALE 1:2` | Live discipline filter matrix (`ALL`, `HARDWARE`, `AUTOMOTIVE`, `DIGITAL`) + **3D Prism CAD Carousel** showcasing UCLan hand-drafted orthographic projections with toggleable **Cyanotype Blueprint Invert** filter & CAD Lightbox |
| **03 // PROJECTS** | `SHT-03 · REV C · SCALE 1:5` | Interactive **Automotive CAD Chassis & 12V/OBD-II/Hydraulics Subsystem Inspector** + custom **BetterDiscord / Vencord Theme Suite** showcase (`GlareHover`) |
| **04 // EXPERIENCE** | `SHT-04 · REV C · LOGBOOK` | Chronological engineering & hospitality logbook (Wetherspoons Bar Team Leader, 313 Logistics Amazon, Car Cosmetics FORScan/OBD-II Apprentice Technician, Blackpool Pleasure Beach Ride Operator) |
| **05 // EDUCATION** | `SHT-05 · REV C · BOM` | Academic Bill of Materials (UCLan BEng Hons Electrical & Electronic Engineering, Blackpool Sixth Form BTEC Level 3 `D*D*`, St Mary's GCSEs `D*2` & Grade 9 Photography, plus 5 verified certifications) |
| **06 // FIELD LOG** | `SHT-06 · REV C · FIELD` | Lake District summit & wild-camp photography (`GlareHover`) and BMW E90 / automotive enthusiast gallery |
| **DISPATCH** | `TRANSMISSION TERMINAL` | `ElectricBorder` animated turbulence frame, one-click clipboard email copy, and interactive **Engineering Dispatch Composer** |

---

## Official React Bits Components Integrated

All components live in [`src/components/react-bits/`](./src/components/react-bits/):
- `ClickSpark` — Global cyan/amber spark burst on click
- `Waves` — Interactive cyanotype blueprint wave & grid background canvas
- `Crosshair` — Toggleable full-viewport drafting crosshair & millimeter drag-to-measure caliper (`DraftingCursor`)
- `TechText` — Interactive particle-repulsion canvas typography for `LEE PARKINSON.`
- `RotatingText` — Spring-animated engineering role rotation
- `DecryptedText` — Matrix/CAD cipher scramble reveal on sheet headers
- `CountUp` — Spring physics numerical counters in the operator spec table
- `TiltedCard` — 3D perspective tilt card with glare & flip-to-schematic pinout view
- `SpotlightCard` — Cursor-tracking radial spotlight blueprint panels
- `ScrollVelocity` — Scroll-reactive engineering telemetry marquee
- `Magnet` — Magnetic pull CTAs and action buttons
- `ShinyText` — Metallic sheen text badges
- `GlareHover` — Optical glare sweep across project & field log figures
- `ElectricBorder` — SVG turbulence displacement border around the Contact Dispatch terminal
- `Dock` — macOS-style spring-magnified floating CAD quick-jump dock

---

## Development & Build

```bash
# Install dependencies
npm install

# Start local development server with HMR
npm run dev

# Build production bundle into dist/assets/main.js & dist/assets/main.css
npm run build
```
