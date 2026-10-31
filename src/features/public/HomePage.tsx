import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

type CategoryKey = 'arts' | 'literature' | 'stage' | 'theatre';

type ComicScenePhase =
  | 'idle'
  | 'scene1-press'
  | 'scene2-expand'
  | 'scene3-reveal'
  | 'scene4-events';

type TabId = 'home' | 'events' | 'schedule' | 'gallery' | 'winners';

interface DetailItem {
  name: string;
  time: string;
  venue: string;
}

interface DetailModal {
  title: string;
  subtitle: string;
  tag: string;
  accent: string;
  items: DetailItem[];
}

interface CategoryEventItem {
  id: string;
  title: string;
  subCategory: string;
  tagline: string;
  time: string;
  venue: string;
  teamSize: string;
  prize: string;
  badgeColor: string;
}

interface CategoryConfig {
  key: CategoryKey;
  cardTitle: string;
  headingTitle: string;
  subtitle: string;
  wingTag: string;
  heroHeadline: string;
  heroSummary: string;
  bgHex: string;
  filters: string[];
  events: CategoryEventItem[];
}

// ============================================================================
// 31 OFFICIAL BLOSSOMS EVENTS & CATEGORIES
// ============================================================================
const CATEGORY_DATA: Record<CategoryKey, CategoryConfig> = {
  arts: {
    key: 'arts',
    cardTitle: 'ARTS',
    headingTitle: 'FINE ARTS',
    subtitle: 'PAINT. DESIGN. EXPRESS.',
    wingTag: 'BLOSSOMS 2026 • FINE ARTS WING',
    heroHeadline: 'UNLEASH YOUR INNER COMIC ARTIST!',
    heroSummary: '10 Flagship Competitions • ₹50,000 Prize Pool • Live Courtyard & Studio Showdowns',
    bgHex: '#ed1e79',
    filters: ['ALL', 'PAINTING', 'SKETCHING', 'DESIGN', 'CRAFT', 'DIGITAL'],
    events: [
      {
        id: 'digital-poster',
        title: 'DIGITAL POSTER MAKING',
        subCategory: 'DIGITAL',
        tagline: 'High-concept digital poster design on theme with typography & layout.',
        time: 'Nov 26 • Online',
        venue: 'Online Submission',
        teamSize: 'Solo',
        prize: '₹5,000',
        badgeColor: '#38bdf8',
      },
      {
        id: 'greeting-card',
        title: 'GREETING CARD COMPETITION',
        subCategory: 'CRAFT',
        tagline: 'Handcrafted greeting card design using mixed craft & calligraphy.',
        time: 'Nov 13 • Classroom',
        venue: 'Classroom',
        teamSize: 'Solo',
        prize: '₹5,000',
        badgeColor: '#facc15',
      },
      {
        id: 'pot-art',
        title: 'POT ART',
        subCategory: 'CRAFT',
        tagline: 'Terracotta pot painting & decorative 3D embellishment battle.',
        time: 'Nov 20 • BB COURT',
        venue: 'BB Court',
        teamSize: 'Solo / Duo',
        prize: '₹5,000',
        badgeColor: '#fb923c',
      },
      {
        id: 'pencil-sketching',
        title: 'PENCIL SKETCHING',
        subCategory: 'SKETCHING',
        tagline: 'Live shading, perspective & realistic anatomical rendering.',
        time: 'Nov 14 • Classroom',
        venue: 'Classroom',
        teamSize: 'Solo',
        prize: '₹5,000',
        badgeColor: '#e2e8f0',
      },
      {
        id: 'reel-making',
        title: 'REEL MAKING',
        subCategory: 'DIGITAL',
        tagline: '60-second creative cinematic reel storytelling challenge.',
        time: 'Dec 02 • Online',
        venue: 'Online Submission',
        teamSize: 'Solo / Duo',
        prize: '₹5,000',
        badgeColor: '#f472b6',
      },
      {
        id: 'collage',
        title: 'COLLAGE',
        subCategory: 'CRAFT',
        tagline: 'Magazine, newspaper & mixed material thematic montage.',
        time: 'Dec 05 • Classroom',
        venue: 'Classroom',
        teamSize: 'Team of 2',
        prize: '₹5,000',
        badgeColor: '#a78bfa',
      },
      {
        id: 'mehendi-design',
        title: 'MEHENDI DESIGN',
        subCategory: 'DESIGN',
        tagline: 'Intricate traditional & contemporary henna art championship.',
        time: 'Nov 21 • Classroom',
        venue: 'Classroom',
        teamSize: 'Solo',
        prize: '₹5,000',
        badgeColor: '#fde047',
      },
      {
        id: 'rangoli-design',
        title: 'RANGOLI DESIGN',
        subCategory: 'DESIGN',
        tagline: 'Vibrant geometric & festive powdered rangoli carpet creation.',
        time: 'Nov 26 • Block 2',
        venue: 'Block 2 Front Entrance',
        teamSize: 'Team of 3',
        prize: '₹5,000',
        badgeColor: '#4ade80',
      },
      {
        id: 'painting',
        title: 'PAINTING',
        subCategory: 'PAINTING',
        tagline: 'Live water, acrylic or gouache painting on on-spot theme.',
        time: 'Dec 02 • Classroom',
        venue: 'Classroom',
        teamSize: 'Solo',
        prize: '₹5,000',
        badgeColor: '#f43f5e',
      },
      {
        id: 'photography',
        title: 'PHOTOGRAPHY (ONLINE)',
        subCategory: 'DIGITAL',
        tagline: 'Composition, lighting & storytelling frame capturing campus spirit.',
        time: 'Dec 09 • Online',
        venue: 'Online Submission',
        teamSize: 'Solo',
        prize: '₹5,000',
        badgeColor: '#06b6d4',
      },
    ],
  },
  literature: {
    key: 'literature',
    cardTitle: 'LITERATURE',
    headingTitle: 'LITERARY ARTS',
    subtitle: 'SPEAK. WRITE. THINK.',
    wingTag: 'BLOSSOMS 2026 • LITERARY SOCIETY',
    heroHeadline: 'WORDS THAT SHAKE THE MULTIVERSE!',
    heroSummary: '8 Flagship Competitions • ₹45,000 Prize Pool • Debates, Quizzes & Wordplay',
    bgHex: '#0088e8',
    filters: ['ALL', 'DEBATE', 'QUIZ', 'WRITING', 'SPEAKING', 'FUN'],
    events: [
      {
        id: 'quiz',
        title: 'GENERAL QUIZ',
        subCategory: 'QUIZ',
        tagline: 'Multi-round trivia battle spanning pop culture, history, science & sports.',
        time: 'Nov 25 • Panel Room',
        venue: 'Panel Room',
        teamSize: 'Team of 2',
        prize: '₹6,000',
        badgeColor: '#facc15',
      },
      {
        id: 'pot-pourri',
        title: 'POT POURRI',
        subCategory: 'FUN',
        tagline: 'High-energy word puzzles, anagrams, 20 questions & literary charades.',
        time: 'Dec 06 • Seminar Hall',
        venue: 'Seminar Hall',
        teamSize: 'Team of 3',
        prize: '₹6,000',
        badgeColor: '#38bdf8',
      },
      {
        id: 'extempore',
        title: 'EXTEMPORE',
        subCategory: 'SPEAKING',
        tagline: 'Speak with wit, poise & clarity on spontaneous topics with 1 min prep.',
        time: 'Nov 28 • Panel Room',
        venue: 'Panel Room',
        teamSize: 'Solo',
        prize: '₹5,000',
        badgeColor: '#4ade80',
      },
      {
        id: 'dumb-charades',
        title: 'DUMB CHARADES',
        subCategory: 'FUN',
        tagline: 'Act out book titles, movies & pop-culture phrases without speaking a word.',
        time: 'Nov 19 • Seminar Hall',
        venue: 'Seminar Hall',
        teamSize: 'Team of 3',
        prize: '₹6,000',
        badgeColor: '#f472b6',
      },
      {
        id: 'air-crash',
        title: 'AIR CRASH / SHIPWRECK',
        subCategory: 'SPEAKING',
        tagline: 'Roleplay a famous persona and convince the captain why you deserve the parachute.',
        time: 'Nov 24 • Panel Room',
        venue: 'Panel Room',
        teamSize: 'Solo',
        prize: '₹5,000',
        badgeColor: '#fb923c',
      },
      {
        id: 'debate',
        title: 'DEBATE',
        subCategory: 'DEBATE',
        tagline: 'Parliamentary debate format with sharp arguments & counter-rebuttals.',
        time: 'Dec 01 • Seminar Hall',
        venue: 'Seminar Hall',
        teamSize: 'Duo',
        prize: '₹7,000',
        badgeColor: '#facc15',
      },
      {
        id: 'jam',
        title: 'JUST A MINUTE (JAM)',
        subCategory: 'SPEAKING',
        tagline: 'Speak for 60 seconds without hesitation, repetition, or grammatical stumble.',
        time: 'Nov 18 • Assembly Hall',
        venue: 'Assembly Hall',
        teamSize: 'Solo',
        prize: '₹5,000',
        badgeColor: '#e879f9',
      },
      {
        id: 'creative-writing',
        title: 'CREATIVE WRITING (POEM / STORY / ESSAY)',
        subCategory: 'WRITING',
        tagline: 'Spin captivating prose and poetic imagery from spontaneous fest prompts.',
        time: 'Dec 08–11 • Classroom',
        venue: 'Classroom',
        teamSize: 'Solo',
        prize: '₹5,000',
        badgeColor: '#a78bfa',
      },
    ],
  },
  stage: {
    key: 'stage',
    cardTitle: 'STAGE',
    headingTitle: 'MAINSTAGE & MUSIC',
    subtitle: 'PERFORM. INSPIRE.',
    wingTag: 'BLOSSOMS 2026 • MAINSTAGE & MUSIC WING',
    heroHeadline: 'TURN THE AMPLIFIERS TO ELEVEN!',
    heroSummary: '8 Flagship Competitions • ₹1,20,000 Prize Pool • Full Concert Rig & Open Stages',
    bgHex: '#fdb813',
    filters: ['ALL', 'DANCE', 'MUSIC', 'BANDS'],
    events: [
      {
        id: 'indian-classical-group',
        title: 'INDIAN DANCE CLASSICAL (GROUP)',
        subCategory: 'DANCE',
        tagline: 'Graceful Bharatanatyam, Kathak & classical Indian group choreography.',
        time: 'Nov 22 • Open Stage',
        venue: 'Open Stage',
        teamSize: '6–12 Members',
        prize: '₹15,000',
        badgeColor: '#f43f5e',
      },
      {
        id: 'non-theme-dance',
        title: 'NON-THEME GROUP DANCE',
        subCategory: 'DANCE',
        tagline: 'High-energy Bollywood, hip-hop & contemporary dance crew showdown.',
        time: 'Dec 16 • KE (doc)',
        venue: 'KE (doc)',
        teamSize: '8–16 Members',
        prize: '₹15,000',
        badgeColor: '#ec4899',
      },
      {
        id: 'bob-western',
        title: 'BATTLE OF THE BANDS (WESTERN)',
        subCategory: 'BANDS',
        tagline: '20-minute rock, metal & alternative band set on full festival rig.',
        time: 'TBD • KE (doc)',
        venue: 'KE (doc)',
        teamSize: '4–8 Members',
        prize: '₹25,000',
        badgeColor: '#38bdf8',
      },
      {
        id: 'bob-indian',
        title: 'BATTLE OF THE BANDS (INDIAN)',
        subCategory: 'BANDS',
        tagline: 'Indian fusion, rock & folk band showdown with live acoustics.',
        time: 'TBD • Open Stage',
        venue: 'Open Stage',
        teamSize: '4–8 Members',
        prize: '₹25,000',
        badgeColor: '#fb923c',
      },
      {
        id: 'folk-film-solo',
        title: 'INDIAN FOLK & FILM SINGING (SOLO)',
        subCategory: 'MUSIC',
        tagline: 'Soulful Indian classical, folk & retro cinematic melodies.',
        time: 'Dec 03 • 911',
        venue: 'Room 911',
        teamSize: 'Solo',
        prize: '₹8,000',
        badgeColor: '#facc15',
      },
      {
        id: 'western-solo',
        title: 'WESTERN SINGING (SOLO)',
        subCategory: 'MUSIC',
        tagline: 'Pop, soul, jazz & acoustic Western vocal championship.',
        time: 'Dec 03 • 911',
        venue: 'Room 911',
        teamSize: 'Solo',
        prize: '₹8,000',
        badgeColor: '#4ade80',
      },
      {
        id: 'western-acapella',
        title: 'WESTERN ACAPELLA / ACOUSTIC GROUP',
        subCategory: 'MUSIC',
        tagline: 'Harmonized vocal beatboxing & multi-part choral arrangements.',
        time: 'TBD • KE (doc)',
        venue: 'KE (doc)',
        teamSize: '6–12 Members',
        prize: '₹15,000',
        badgeColor: '#a855f7',
      },
      {
        id: 'duet-dance',
        title: 'DANCE DUET',
        subCategory: 'DANCE',
        tagline: 'Two-person synchronization, chemistry & dynamic dance duet.',
        time: 'Nov 17 • Birds park (stage)',
        venue: 'Birds Park (Stage)',
        teamSize: 'Duo',
        prize: '₹10,000',
        badgeColor: '#06b6d4',
      },
    ],
  },
  theatre: {
    key: 'theatre',
    cardTitle: 'THEATRE',
    headingTitle: 'THEATRICAL ARTS',
    subtitle: 'ACT. IMAGINE. BRING STORIES ALIVE.',
    wingTag: 'BLOSSOMS 2026 • DRAMATICS GUILD',
    heroHeadline: 'EVERY STAGE IS A NEW UNIVERSE!',
    heroSummary: '5 Flagship Competitions • ₹75,000 Prize Pool • Proscenium, Street & Screen',
    bgHex: '#861ec2',
    filters: ['ALL', 'DRAMA', 'STREET', 'FILM', 'SOLO'],
    events: [
      {
        id: 'mono-act',
        title: 'MONO ACT',
        subCategory: 'SOLO',
        tagline: 'One performer, multiple personas, five intense minutes of pure dramatic grip.',
        time: 'Nov 27 • 911',
        venue: 'Room 911',
        teamSize: 'Solo',
        prize: '₹8,000',
        badgeColor: '#38bdf8',
      },
      {
        id: 'proscenium',
        title: 'PROSCENIUM',
        subCategory: 'DRAMA',
        tagline: 'Full stage theatrical production with elaborate sets, lighting & sound.',
        time: 'Dec 04 • KE (doc)',
        venue: 'KE (doc)',
        teamSize: '8–15 Members',
        prize: '₹20,000',
        badgeColor: '#facc15',
      },
      {
        id: 'street-play',
        title: 'STREET PLAY (NUKKAD NATAK)',
        subCategory: 'STREET',
        tagline: 'High-energy circle street theatre with acoustic dholak, chorus & social punch.',
        time: 'Dec 15 • Garden Street',
        venue: 'Garden Street',
        teamSize: '10–18 Members',
        prize: '₹20,000',
        badgeColor: '#4ade80',
      },
      {
        id: 'short-film',
        title: 'SHORT FILM MAKING',
        subCategory: 'FILM',
        tagline: 'Original short film screening evaluated for direction, cinematography & script.',
        time: 'Nov 21 submission • Dec 09 screening',
        venue: 'Campus View',
        teamSize: 'Team of 3–6',
        prize: '₹12,000',
        badgeColor: '#fb923c',
      },
      {
        id: 'mime',
        title: 'MIME',
        subCategory: 'DRAMA',
        tagline: 'Silent physical theatre telling powerful stories through gesture & expression.',
        time: 'Dec 10 • KE (doc)',
        venue: 'KE (doc)',
        teamSize: '6–10 Members',
        prize: '₹12,000',
        badgeColor: '#ec4899',
      },
    ],
  },
};

const PANEL_DETAILS: Record<string, DetailModal> = {
  arts: {
    title: 'ARTS',
    subtitle: 'PAINT. DESIGN. EXPRESS.',
    tag: 'Fine Arts Wing • 10 Events',
    accent: '#ed1e79',
    items: [
      { name: 'Digital Poster Making', time: 'Nov 26', venue: 'Online Submission' },
      { name: 'Greeting Card Competition', time: 'Nov 13', venue: 'Classroom' },
      { name: 'Pot Art', time: 'Nov 20', venue: 'BB COURT' },
      { name: 'Pencil Sketching', time: 'Nov 14', venue: 'Classroom' },
      { name: 'Reel Making', time: 'Dec 02', venue: 'Online' },
      { name: 'Collage', time: 'Dec 05', venue: 'Classroom' },
      { name: 'Mehendi Design', time: 'Nov 21', venue: 'Classroom' },
      { name: 'Rangoli Design', time: 'Nov 26', venue: 'Block 2 Front Entrance' },
      { name: 'Painting', time: 'Dec 02', venue: 'Classroom' },
      { name: 'Photography (Online)', time: 'Dec 09', venue: 'Online Submission' },
    ],
  },
  literature: {
    title: 'LITERATURE',
    subtitle: 'SPEAK. WRITE. THINK.',
    tag: 'Literary Society • 8 Events',
    accent: '#0088e8',
    items: [
      { name: 'General Quiz', time: 'Nov 25', venue: 'Panel Room' },
      { name: 'Pot Pourri', time: 'Dec 06', venue: 'Seminar Hall' },
      { name: 'Extempore', time: 'Nov 28', venue: 'Panel Room' },
      { name: 'Dumb Charades', time: 'Nov 19', venue: 'Seminar Hall' },
      { name: 'Air Crash / Shipwreck', time: 'Nov 24', venue: 'Panel Room' },
      { name: 'Debate', time: 'Dec 01', venue: 'Seminar Hall' },
      { name: 'Just A Minute (JAM)', time: 'Nov 18', venue: 'Assembly Hall' },
      { name: 'Creative Writing', time: 'Dec 08-11', venue: 'Classroom' },
    ],
  },
  stage: {
    title: 'STAGE',
    subtitle: 'PERFORM. INSPIRE.',
    tag: 'Mainstage & Music • 8 Events',
    accent: '#fdb813',
    items: [
      { name: 'Indian Dance Classical (Group)', time: 'Nov 22', venue: 'Open Stage' },
      { name: 'Non-Theme Group Dance', time: 'Dec 16', venue: 'KE (doc)' },
      { name: 'Battle of the Bands (Western)', time: 'TBD', venue: 'KE (doc)' },
      { name: 'Battle of the Bands (Indian)', time: 'TBD', venue: 'Open Stage' },
      { name: 'Indian Folk & Film Singing (Solo)', time: 'Dec 03', venue: '911' },
      { name: 'Western Singing (Solo)', time: 'Dec 03', venue: '911' },
      { name: 'Western Acapella / Acoustic', time: 'TBD', venue: 'KE (doc)' },
      { name: 'Dance Duet', time: 'Nov 17', venue: 'Birds park (stage)' },
    ],
  },
  theatre: {
    title: 'THEATRE',
    subtitle: 'ACT. IMAGINE. BRING STORIES ALIVE.',
    tag: 'Dramatics Guild • 5 Events',
    accent: '#861ec2',
    items: [
      { name: 'Mono Act', time: 'Nov 27', venue: '911' },
      { name: 'Proscenium', time: 'Dec 04', venue: 'KE (doc)' },
      { name: 'Street Play (Nukkad Natak)', time: 'Dec 15', venue: 'Garden Street' },
      { name: 'Short Film Making', time: 'Nov 21 / Dec 09', venue: 'Campus View' },
      { name: 'Mime', time: 'Dec 10', venue: 'KE (doc)' },
    ],
  },
  schedule: {
    title: 'EVENT SCHEDULE',
    subtitle: 'DATES, TIMINGS & VENUES',
    tag: 'Nov 12 – Dec 16, 2025 • Full Lineup',
    accent: '#df1b23',
    items: [
      { name: 'Blossoms Inauguration', time: '12.11.2025', venue: 'Birds park' },
      { name: 'Greeting Card Competition', time: '13.11.2025', venue: 'Classroom' },
      { name: 'Pencil Sketching', time: '14.11.2025', venue: 'Classroom' },
      { name: 'Dance Duet', time: '17.11.2025', venue: 'Birds park (stage)' },
      { name: 'Just A Minute (JAM)', time: '18.11.2025', venue: 'Assembly Hall' },
      { name: 'Dumb Charades', time: '19.11.2025', venue: 'Seminar Hall' },
      { name: 'Pot Art', time: '20.11.2025', venue: 'BB COURT' },
      { name: 'Mehendi Design & Short Film', time: '21.11.2025', venue: 'Classroom / Online' },
      { name: 'Indian Dance Classical (Group)', time: '22.11.2025', venue: 'Open Stage' },
      { name: 'Air Crash / Shipwreck', time: '24.11.2025', venue: 'Panel Room' },
      { name: 'General Quiz', time: '25.11.2025', venue: 'Panel Room' },
      { name: 'Digital Poster & Rangoli', time: '26.11.2025', venue: 'Online / Block 2' },
      { name: 'Mono Act', time: '27.11.2025', venue: 'Room 911' },
      { name: 'Extempore', time: '28.11.2025', venue: 'Panel Room' },
      { name: 'Debate', time: '01.12.2025', venue: 'Seminar Hall' },
      { name: 'Painting & Reel Making', time: '02.12.2025', venue: 'Classroom / Online' },
      { name: 'Western & Indian Folk Solo Singing', time: '03.12.2025', venue: 'Room 911' },
      { name: 'Proscenium', time: '04.12.2025', venue: 'KE (doc)' },
      { name: 'Collage', time: '05.12.2025', venue: 'Classroom' },
      { name: 'Pot Pourri', time: '06.12.2025', venue: 'Seminar Hall' },
      { name: 'Poem Writing', time: '08.12.2025', venue: 'Classroom' },
      { name: 'Short Film Screening & Photography', time: '09.12.2025', venue: 'Campus View' },
      { name: 'Mime', time: '10.12.2025', venue: 'KE (doc)' },
      { name: 'Short Story & Essay Writing', time: '11.12.2025', venue: 'Classroom' },
      { name: 'Street Play', time: '15.12.2025', venue: 'Garden Street' },
      { name: 'Indian Non-Theme Group Dance', time: '16.12.2025', venue: 'KE (doc)' },
      { name: 'Battle of Bands (Western / Indian)', time: 'TBD', venue: 'KE (doc) / Open Stage' },
      { name: 'Valedictory & Awards', time: 'TBD', venue: 'Main Audi' },
    ],
  },
  announcements: {
    title: 'ANNOUNCEMENTS',
    subtitle: 'STAY UPDATED',
    tag: 'Live Fest Bulletin',
    accent: '#00966b',
    items: [
      { name: 'Student registration open! Log in with your 6-digit roll number.', time: 'Just now', venue: 'Portal' },
      { name: 'Stage pass QR codes are now active in the student dashboard.', time: '25m ago', venue: 'System' },
      { name: 'Battle of Bands soundcheck moved to 10:15 AM at KE doc.', time: '1h ago', venue: 'KE (doc)' },
      { name: 'Collect participant comic badges at Information Desk A.', time: '2h ago', venue: 'Main Gate' },
    ],
  },
  winners: {
    title: 'WINNERS & STANDINGS',
    subtitle: 'HALL OF HEROES 2026',
    tag: 'Live Inter-House Leaderboard',
    accent: '#fdb813',
    items: [
      { name: '1st: Phoenix House (1,420 pts)', time: 'Gold', venue: '6 Trophies' },
      { name: '2nd: Titan House (1,290 pts)', time: 'Silver', venue: '4 Trophies' },
      { name: '3rd: Astra House (1,180 pts)', time: 'Bronze', venue: '3 Trophies' },
      { name: '4th: Orion House (1,050 pts)', time: 'Runner-up', venue: '2 Trophies' },
    ],
  },
};

function ComicArrowButton({ onClick }: { onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        if (onClick) {
          e.stopPropagation();
          onClick();
        }
      }}
      aria-label="Open category"
      className="w-[32px] h-[32px] rounded-full bg-[#fdfaf0] border-[2.5px] border-[#0f0f0f] shadow-[2px_2px_0px_#0f0f0f] flex items-center justify-center active:translate-y-0.5 transition-transform cursor-pointer z-20 hover:scale-105"
    >
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
        <path
          d="M3 8H13M13 8L8.8 3.8M13 8L8.8 12.2"
          stroke="#0f0f0f"
          strokeWidth="2.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

// Reusable Vector Illustrations matching Figma Design
export function ArtsIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 210 140" className={className || "w-full h-full pointer-events-none"}>
      <g stroke="#0f0f0f" strokeWidth="1.8" opacity="0.55">
        <line x1="10" y1="8" x2="45" y2="35" />
        <line x1="145" y1="12" x2="122" y2="42" />
        <line x1="175" y1="28" x2="140" y2="55" />
      </g>
      <g transform="rotate(-38 35 105)">
        <rect x="18" y="88" width="12" height="55" fill="#f4a236" stroke="#0f0f0f" strokeWidth="2.4" />
        <rect x="18" y="72" width="12" height="16" fill="#c0c5cb" stroke="#0f0f0f" strokeWidth="2.4" />
        <path d="M18 72 Q 24 54 30 72 Z" fill="#1b2a4a" stroke="#0f0f0f" strokeWidth="2.2" />
      </g>
      <g transform="rotate(-18 80 110)">
        <rect x="62" y="82" width="9.5" height="62" fill="#d97706" stroke="#0f0f0f" strokeWidth="2.4" />
        <rect x="62" y="68" width="9.5" height="14" fill="#cbd5e1" stroke="#0f0f0f" strokeWidth="2.4" />
        <path d="M62 68 Q 66.75 48 71.5 68 Z" fill="#ef4444" stroke="#0f0f0f" strokeWidth="2.2" />
      </g>
      <g>
        <path
          d="M68,118 C42,122 28,102 32,80 C36,58 56,44 88,46 C120,48 142,62 144,80 C146,96 132,106 122,100 C112,94 116,84 122,80 C128,76 130,68 120,64 C104,58 84,62 76,72 C68,82 66,94 76,104 C82,110 80,116 68,118 Z"
          fill="#f6c27e"
          stroke="#0f0f0f"
          strokeWidth="3.2"
          strokeLinejoin="round"
        />
        <ellipse cx="118" cy="88" rx="7.5" ry="6" fill="#ed1e79" stroke="#0f0f0f" strokeWidth="2.5" />
        <ellipse cx="50" cy="74" rx="6.5" ry="5.5" fill="#ef4444" stroke="#0f0f0f" strokeWidth="2.2" />
        <ellipse cx="68" cy="58" rx="6.5" ry="5.5" fill="#f8ca16" stroke="#0f0f0f" strokeWidth="2.2" />
        <ellipse cx="92" cy="54" rx="6.5" ry="5.5" fill="#0088e8" stroke="#0f0f0f" strokeWidth="2.2" />
        <ellipse cx="116" cy="60" rx="6.5" ry="5.5" fill="#22c55e" stroke="#0f0f0f" strokeWidth="2.2" />
        <ellipse cx="134" cy="74" rx="6.5" ry="5.5" fill="#f97316" stroke="#0f0f0f" strokeWidth="2.2" />
      </g>
    </svg>
  );
}

export function LiteratureIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 190 135" className={className || "w-full h-full pointer-events-none"}>
      {/* Bottom Blue Book */}
      <path d="M36,105 L108,118 L152,102 L84,90 Z" fill="#0369a1" stroke="#0f0f0f" strokeWidth="2.4" />
      <path d="M36,105 L36,118 L108,130 L152,114 L152,102 L108,118 Z" fill="#fef3c7" stroke="#0f0f0f" strokeWidth="2.4" />
      {/* Middle Green Book */}
      <g transform="rotate(7 90 90)">
        <path d="M40,88 L106,99 L148,85 L84,75 Z" fill="#059669" stroke="#0f0f0f" strokeWidth="2.4" />
        <path d="M40,88 L40,99 L106,109 L148,96 L148,85 L106,99 Z" fill="#fef3c7" stroke="#0f0f0f" strokeWidth="2.4" />
      </g>
      {/* Top Red Book */}
      <g transform="rotate(-6 90 70)">
        <path d="M42,66 L108,76 L148,63 L84,54 Z" fill="#dc2626" stroke="#0f0f0f" strokeWidth="2.4" />
        <path d="M42,66 L42,77 L108,87 L148,74 L148,63 L108,76 Z" fill="#fef3c7" stroke="#0f0f0f" strokeWidth="2.4" />
        <path d="M102,75 L106,92 L112,88 L116,92 L116,77 Z" fill="#facc15" stroke="#0f0f0f" strokeWidth="1.8" />
      </g>
      {/* Quill Pen Feather */}
      <g transform="rotate(32 145 52)">
        <path d="M142,5 C132,24 135,46 142,68 L142,82 L144,82 L144,68 C152,46 154,24 144,5 Z" fill="#fdfaf0" stroke="#0f0f0f" strokeWidth="2.4" />
        <line x1="143" y1="5" x2="143" y2="84" stroke="#0f0f0f" strokeWidth="2.2" />
        <polygon points="141,82 145,82 143,89" fill="#0f0f0f" />
      </g>
      <circle cx="166" cy="116" r="3" fill="#0f0f0f" />
    </svg>
  );
}

export function StageIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 190 145" className={className || "w-full h-full pointer-events-none"}>
      <g stroke="#0f0f0f" strokeWidth="2.2" strokeLinecap="round">
        <line x1="60" y1="20" x2="45" y2="12" />
        <line x1="50" y1="35" x2="32" y2="32" />
        <line x1="126" y1="22" x2="142" y2="14" />
        <line x1="134" y1="38" x2="152" y2="35" />
      </g>
      <g transform="translate(15 0)">
        <path d="M52,50 C52,78 98,78 98,50" fill="none" stroke="#0f0f0f" strokeWidth="4" strokeLinecap="round" />
        <circle cx="52" cy="50" r="4" fill="#64748b" stroke="#0f0f0f" strokeWidth="2" />
        <circle cx="98" cy="50" r="4" fill="#64748b" stroke="#0f0f0f" strokeWidth="2" />
        <rect x="71.5" y="74" width="7" height="38" fill="#475569" stroke="#0f0f0f" strokeWidth="2.5" />
        <ellipse cx="75" cy="112" rx="22" ry="7" fill="#1e293b" stroke="#0f0f0f" strokeWidth="3" />
        <rect x="58" y="20" width="34" height="46" rx="17" fill="#e2e8f0" stroke="#0f0f0f" strokeWidth="3.2" />
        <rect x="58" y="40" width="34" height="6" fill="#334155" stroke="#0f0f0f" strokeWidth="2.2" />
        <line x1="66" y1="24" x2="66" y2="40" stroke="#0f0f0f" strokeWidth="2" />
        <line x1="75" y1="21" x2="75" y2="40" stroke="#0f0f0f" strokeWidth="2.2" />
        <line x1="84" y1="24" x2="84" y2="40" stroke="#0f0f0f" strokeWidth="2" />
      </g>
    </svg>
  );
}

export function TheatreIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 190 145" className={className || "w-full h-full pointer-events-none"}>
      {/* Back Tragedy Mask */}
      <g transform="rotate(18 120 72)">
        <path d="M86,30 C74,30 68,44 68,64 C68,88 80,102 96,102 C112,102 124,88 124,64 C124,44 118,30 106,30 Z" fill="#3b82f6" stroke="#0f0f0f" strokeWidth="3.2" />
        <line x1="78" y1="48" x2="88" y2="54" stroke="#0f0f0f" strokeWidth="3" strokeLinecap="round" />
        <line x1="114" y1="48" x2="104" y2="54" stroke="#0f0f0f" strokeWidth="3" strokeLinecap="round" />
        <circle cx="84" cy="58" r="4" fill="#0f0f0f" />
        <circle cx="108" cy="58" r="4" fill="#0f0f0f" />
        <path d="M84,88 C88,80 104,80 108,88" fill="none" stroke="#0f0f0f" strokeWidth="3.2" strokeLinecap="round" />
      </g>
      {/* Front Comedy Mask */}
      <g transform="rotate(-12 65 72)">
        <path d="M48,28 C36,28 30,42 30,62 C30,86 42,100 58,100 C74,100 86,86 86,62 C86,42 80,28 68,28 Z" fill="#fdfaf0" stroke="#0f0f0f" strokeWidth="3.4" />
        <path d="M40,46 Q 47,40 54,46" fill="none" stroke="#0f0f0f" strokeWidth="3" strokeLinecap="round" />
        <path d="M62,46 Q 69,40 76,46" fill="none" stroke="#0f0f0f" strokeWidth="3" strokeLinecap="round" />
        <path d="M42,54 Q 47,60 52,54" fill="none" stroke="#0f0f0f" strokeWidth="3.2" strokeLinecap="round" />
        <path d="M64,54 Q 69,60 74,54" fill="none" stroke="#0f0f0f" strokeWidth="3.2" strokeLinecap="round" />
        <path d="M42,72 Q 58,96 74,72 Z" fill="#0f0f0f" stroke="#0f0f0f" strokeWidth="2.5" />
        <path d="M52,82 Q 58,88 64,82 Q 58,76 52,82" fill="#ef4444" />
      </g>
    </svg>
  );
}

export function CampusHeritageDome({ className }: { className?: string }) {
  return (
    <div className={className || "relative w-full h-full flex items-center justify-center"}>
      <svg viewBox="0 0 200 170" className="w-full h-full max-h-[220px] overflow-visible">
        <ellipse cx="30" cy="155" rx="35" ry="18" fill="#15803d" stroke="#0f0f0f" strokeWidth="2.5" />
        <ellipse cx="170" cy="155" rx="40" ry="20" fill="#15803d" stroke="#0f0f0f" strokeWidth="2.5" />
        <rect x="0" y="152" width="200" height="18" fill="#14532d" stroke="#0f0f0f" strokeWidth="2.5" />
        <rect x="42" y="82" width="116" height="70" fill="#facc15" stroke="#0f0f0f" strokeWidth="3" />
        <rect x="52" y="94" width="14" height="24" rx="2" fill="#1e293b" stroke="#0f0f0f" strokeWidth="2" />
        <rect x="74" y="94" width="14" height="24" rx="2" fill="#1e293b" stroke="#0f0f0f" strokeWidth="2" />
        <rect x="112" y="94" width="14" height="24" rx="2" fill="#1e293b" stroke="#0f0f0f" strokeWidth="2" />
        <rect x="134" y="94" width="14" height="24" rx="2" fill="#1e293b" stroke="#0f0f0f" strokeWidth="2" />
        <path d="M88,152 L88,126 Q 100,116 112,126 L112,152 Z" fill="#0f0f0f" stroke="#0f0f0f" strokeWidth="2.5" />
        <polygon points="40,82 100,48 160,82" fill="#f59e0b" stroke="#0f0f0f" strokeWidth="3" />
        <rect x="78" y="32" width="44" height="20" fill="#facc15" stroke="#0f0f0f" strokeWidth="2.5" />
        <rect x="84" y="38" width="8" height="12" rx="4" fill="#0f0f0f" />
        <rect x="96" y="38" width="8" height="12" rx="4" fill="#0f0f0f" />
        <rect x="108" y="38" width="8" height="12" rx="4" fill="#0f0f0f" />
        <path d="M74,32 Q 100,-4 126,32 Z" fill="#0284c7" stroke="#0f0f0f" strokeWidth="3.2" />
        <path d="M100,2 Q 100,16 100,32" stroke="#0f0f0f" strokeWidth="2" fill="none" />
        <line x1="100" y1="2" x2="100" y2="-12" stroke="#facc15" strokeWidth="3.5" />
        <line x1="94" y1="-7" x2="106" y2="-7" stroke="#facc15" strokeWidth="3" />
      </svg>
    </div>
  );
}

interface RectBox {
  top: number;
  left: number;
  width: number;
  height: number;
}

export default function HomePage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [selectedModal, setSelectedModal] = useState<DetailModal | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  // Mobile measurement refs
  const screenRef = useRef<HTMLDivElement | null>(null);
  const panelRefs = useRef<Record<CategoryKey, HTMLDivElement | null>>({
    arts: null,
    literature: null,
    stage: null,
    theatre: null,
  });

  const [selectedCategory, setSelectedCategory] = useState<CategoryKey | null>(null);
  const [scenePhase, setScenePhase] = useState<ComicScenePhase>('idle');
  const [slowMo, _setSlowMo] = useState(false);
  const [animKey, setAnimKey] = useState(0);
  const [_originRect, setOriginRect] = useState<RectBox>({
    top: 222,
    left: 12,
    width: 196,
    height: 182,
  });
  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [registeredIds, setRegisteredIds] = useState<string[]>([]);

  const speedMult = slowMo ? 3.2 : 1;

  const triggerCategorySceneTransition = (key: CategoryKey) => {
    setSelectedModal(null);
    setMenuOpen(false);
    setNotifOpen(false);
    setActiveFilter('ALL');

    const screenEl = screenRef.current;
    const panelEl = panelRefs.current[key];
    if (screenEl && panelEl) {
      const sRect = screenEl.getBoundingClientRect();
      const pRect = panelEl.getBoundingClientRect();
      setOriginRect({
        top: Math.round(pRect.top - sRect.top),
        left: Math.round(pRect.left - sRect.left),
        width: Math.round(pRect.width),
        height: Math.round(pRect.height),
      });
    }

    setSelectedCategory(key);
    setScenePhase('scene1-press');
    setAnimKey((prev) => prev + 1);
  };

  const closeCategoryArena = () => {
    setScenePhase('idle');
    setSelectedCategory(null);
    setActiveTab('home');
  };

  useEffect(() => {
    if (!selectedCategory || scenePhase !== 'scene1-press') return;
    const s1Dur = Math.round(105 * speedMult);
    const s2Dur = Math.round(310 * speedMult);
    const s3Dur = Math.round(185 * speedMult);

    const raf1 = window.requestAnimationFrame(() => {});
    const raf2 = window.requestAnimationFrame(() => {});

    const toScene2Timer = window.setTimeout(() => {
      setScenePhase('scene2-expand');
    }, s1Dur);

    const toScene3Timer = window.setTimeout(() => {
      setScenePhase('scene3-reveal');
    }, s1Dur + s2Dur);

    const toScene4Timer = window.setTimeout(() => {
      setScenePhase('scene4-events');
    }, s1Dur + s2Dur + s3Dur);

    return () => {
      window.cancelAnimationFrame(raf1);
      window.cancelAnimationFrame(raf2);
      window.clearTimeout(toScene2Timer);
      window.clearTimeout(toScene3Timer);
      window.clearTimeout(toScene4Timer);
    };
  }, [selectedCategory, animKey, speedMult]);

  const toggleRegister = (id: string, title?: string) => {
    setRegisteredIds((prev) => {
      const isReg = prev.includes(id);
      if (isReg) {
        toast('Removed registration for ' + (title || id), { icon: 'ℹ️' });
        return prev.filter((item) => item !== id);
      } else {
        toast.success('Successfully registered for ' + (title || id) + '! Best of luck hero!');
        return [...prev, id];
      }
    });
  };

  const isRearranged =
    selectedCategory !== null &&
    (scenePhase === 'scene2-expand' ||
      scenePhase === 'scene3-reveal' ||
      scenePhase === 'scene4-events');

  const isOverlayActive =
    selectedCategory !== null &&
    scenePhase !== 'idle' &&
    scenePhase !== 'scene1-press';

  const activeCategoryConfig = selectedCategory ? CATEGORY_DATA[selectedCategory] : null;
  const filteredEvents = activeCategoryConfig
    ? activeFilter === 'ALL'
      ? activeCategoryConfig.events
      : activeCategoryConfig.events.filter((ev) => ev.subCategory === activeFilter)
    : [];

  return (
    <div className="min-h-screen w-full bg-[#f5c71a] halftone-dots select-none">
      {/* =========================================================================
          MOBILE VIEWPORT (Exact Figma Mobile Design - Unchanged)
          Active on screens < md (width < 768px)
         ========================================================================= */}
      <div className="md:hidden relative w-full h-dvh bg-[#121212] flex flex-col overflow-hidden">
        {/* Inner Screen */}
        <div
          ref={screenRef}
          className="relative flex-1 w-full h-full bg-[#f8ca16] overflow-hidden flex flex-col justify-between"
          style={
            {
              '--scene1-dur': `${Math.round(105 * speedMult)}ms`,
              '--scene2-dur': `${Math.round(310 * speedMult)}ms`,
              '--scene3-dur': `${Math.round(185 * speedMult)}ms`,
              '--scene4-card-dur': `${Math.round(280 * speedMult)}ms`,
            } as React.CSSProperties
          }
        >
          {/* Top Status Bar */}
          <div className="w-full pt-[10px] pb-[2px] px-6 flex items-center justify-between z-30 shrink-0">
            <span className="text-[15px] font-bold tracking-tight text-[#0f0f0f]">9:41</span>
            <div className="flex items-center gap-1.5 text-[#0f0f0f]">
              <svg width="17" height="11" viewBox="0 0 17 11" fill="currentColor">
                <rect x="0.5" y="7" width="2.8" height="4" rx="0.8" />
                <rect x="4.7" y="5" width="2.8" height="6" rx="0.8" />
                <rect x="8.9" y="2.5" width="2.8" height="8.5" rx="0.8" />
                <rect x="13.1" y="0.5" width="2.8" height="10.5" rx="0.8" />
              </svg>
              <svg width="16" height="11" viewBox="0 0 16 11" fill="currentColor">
                <path d="M8 8.6a1.4 1.4 0 1 0 0 2.8 1.4 1.4 0 0 0 0-2.8Zm-4.2-2.8a6 6 0 0 1 8.4 0 .9.9 0 0 0 1.2-1.3 7.8 7.8 0 0 0-10.8 0 .9.9 0 0 0 1.2 1.3Zm-2.6-2.6a9.6 9.6 0 0 1 13.6 0 .9.9 0 1 0 1.3-1.3 11.4 11.4 0 0 0-16.2 0 .9.9 0 0 0 1.3 1.3Z" />
              </svg>
              <div className="w-[24px] h-[11px] rounded-[3px] border border-[#0f0f0f] p-[1px] flex items-center">
                <div className="h-full w-full bg-[#0f0f0f] rounded-[1.5px]" />
              </div>
            </div>
          </div>

          {/* Main Comic Page Content */}
          <div className="relative flex-1 w-full px-3 pt-1 pb-2 flex flex-col justify-between overflow-hidden">
            {/* HERO SECTION */}
            <div className="relative w-full h-[152px] flex items-center justify-between">
              <div className="absolute top-1 right-1 flex items-center gap-2 z-30">
                <button
                  type="button"
                  onClick={() => setNotifOpen(!notifOpen)}
                  className="w-8 h-8 rounded-full bg-[#fdfaf0] border-[2px] border-[#0f0f0f] shadow-[1.8px_1.8px_0px_#0f0f0f] flex items-center justify-center cursor-pointer active:translate-y-0.5"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0f0f0f" strokeWidth="2.3">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="w-8 h-8 rounded-full bg-[#fdfaf0] border-[2px] border-[#0f0f0f] shadow-[1.8px_1.8px_0px_#0f0f0f] flex items-center justify-center cursor-pointer active:translate-y-0.5"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0f0f0f" strokeWidth="2.4">
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                  </svg>
                </button>
              </div>

              {/* Left Side: BLOSSOMS 2026 Explosion */}
              <div className="relative w-[56%] h-full flex items-center justify-center">
                <div className="relative z-10 text-center">
                  <h1 className="font-comic-display text-[48px] text-[#df1b23] comic-title-stroke tracking-wider leading-[0.85]">
                    BLOSSOMS
                  </h1>
                  <div className="bg-[#f8ca16] border-[2.2px] border-[#0f0f0f] shadow-[2px_2px_0px_#0f0f0f] px-2 py-0.5 inline-block -rotate-2 mt-1">
                    <span className="font-comic-display text-[20px] text-[#0f0f0f]">2026</span>
                  </div>
                  <div className="mt-1 bg-white border-[2px] border-[#0f0f0f] shadow-[2px_2px_0px_#0f0f0f] px-2 py-0.5 rotate-1">
                    <p className="font-comic-sub font-black text-[9px] text-[#0f0f0f] uppercase">
                      SAME STAGE. DIFFERENT HEROES!
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Side: Campus Building */}
              <div className="relative w-[42%] h-[92%] bg-[#0088e8] border-[3px] border-[#0f0f0f] shadow-[3.5px_3.5px_0px_#0f0f0f] rounded-[8px] overflow-hidden p-1 flex items-center justify-center">
                <CampusHeritageDome className="w-full h-full" />
              </div>
            </div>

            {/* ROW 1: ARTS & LITERATURE */}
            <div className="relative w-full h-[182px] flex">
              {/* ARTS PANEL */}
              <div
                ref={(el) => { panelRefs.current.arts = el; }}
                onClick={() => triggerCategorySceneTransition('arts')}
                style={{
                  clipPath: 'polygon(0% 0%, 92% 4%, 100% 100%, 0% 96%)',
                  transitionDuration: `${Math.round(310 * speedMult)}ms`,
                }}
                className={`relative w-[53.5%] h-full bg-[#ed1e79] halftone-dots-dense cursor-pointer overflow-hidden select-none group transition-all ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  selectedCategory === 'arts' && scenePhase === 'scene1-press'
                    ? 'animate-scene1-press z-30'
                    : selectedCategory === 'arts' && isOverlayActive
                      ? 'opacity-0 pointer-events-none'
                      : isRearranged
                        ? '-translate-x-[125%] -translate-y-[25%] -rotate-6 opacity-0 pointer-events-none'
                        : 'translate-x-0 translate-y-0 rotate-0 opacity-100'
                }`}
              >
                <div className="relative z-20 pt-2.5 pl-3">
                  <h2 className="font-comic-display comic-title-white text-[42px] leading-[0.88] -rotate-[4deg] tracking-wide">
                    ARTS
                  </h2>
                  <div className="mt-1 inline-block bg-[#f9d423] border-[2.4px] border-[#0f0f0f] shadow-[2.5px_2.5px_0px_#0f0f0f] px-2.5 py-1 -rotate-[5deg]">
                    <p className="font-comic-sub text-[12px] leading-[1.05] text-[#0f0f0f] text-center">
                      PAINT. DESIGN.<br />EXPRESS.
                    </p>
                  </div>
                </div>
                <ArtsIllustration className="absolute bottom-[-4px] left-0 w-full h-[126px] z-10 pointer-events-none" />
                <div className="absolute right-3.5 bottom-3.5 z-20">
                  <ComicArrowButton onClick={() => triggerCategorySceneTransition('arts')} />
                </div>
              </div>

              {/* LITERATURE PANEL */}
              <div
                ref={(el) => { panelRefs.current.literature = el; }}
                onClick={() => triggerCategorySceneTransition('literature')}
                style={{
                  clipPath: 'polygon(0% 4%, 100% 9%, 100% 100%, 8% 96%)',
                  transitionDuration: `${Math.round(310 * speedMult)}ms`,
                }}
                className={`relative w-[50.5%] -ml-[4%] h-full bg-[#0088e8] halftone-dots-dense cursor-pointer overflow-hidden select-none group transition-all ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  selectedCategory === 'literature' && scenePhase === 'scene1-press'
                    ? 'animate-scene1-press z-30'
                    : selectedCategory === 'literature' && isOverlayActive
                      ? 'opacity-0 pointer-events-none'
                      : isRearranged
                        ? 'translate-x-[125%] -translate-y-[20%] rotate-6 opacity-0 pointer-events-none'
                        : 'translate-x-0 translate-y-0 rotate-0 opacity-100'
                }`}
              >
                <div className="relative z-20 pt-4 pl-4 pr-2">
                  <h2 className="font-comic-display comic-title-white text-[32px] leading-[0.9] -rotate-[3deg] tracking-wide">
                    LITERATURE
                  </h2>
                  <div className="mt-1 inline-block bg-[#f9d423] border-[2.4px] border-[#0f0f0f] shadow-[2.5px_2.5px_0px_#0f0f0f] px-2 py-0.5 -rotate-[4deg]">
                    <p className="font-comic-sub text-[11px] leading-[1.05] text-[#0f0f0f] text-center">
                      SPEAK. WRITE.<br />THINK.
                    </p>
                  </div>
                </div>
                <LiteratureIllustration className="absolute bottom-[-2px] left-1 w-full h-[116px] z-10 pointer-events-none" />
                <div className="absolute right-3.5 bottom-3.5 z-20">
                  <ComicArrowButton onClick={() => triggerCategorySceneTransition('literature')} />
                </div>
              </div>
            </div>

            {/* ROW 2: STAGE & THEATRE */}
            <div className="relative w-full h-[180px] flex">
              {/* STAGE PANEL */}
              <div
                ref={(el) => { panelRefs.current.stage = el; }}
                onClick={() => triggerCategorySceneTransition('stage')}
                style={{
                  clipPath: 'polygon(0% 0%, 94% 4%, 100% 100%, 0% 96%)',
                  transitionDuration: `${Math.round(310 * speedMult)}ms`,
                }}
                className={`relative w-[52.5%] h-full bg-[#fdb813] halftone-dots-dense cursor-pointer overflow-hidden select-none group transition-all ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  selectedCategory === 'stage' && scenePhase === 'scene1-press'
                    ? 'animate-scene1-press z-30'
                    : selectedCategory === 'stage' && isOverlayActive
                      ? 'opacity-0 pointer-events-none'
                      : isRearranged
                        ? '-translate-x-[125%] translate-y-[25%] -rotate-6 opacity-0 pointer-events-none'
                        : 'translate-x-0 translate-y-0 rotate-0 opacity-100'
                }`}
              >
                <div className="relative z-20 pt-3 pl-3">
                  <h2 className="font-comic-display comic-title-white text-[42px] leading-[0.88] -rotate-[4deg] tracking-wide">
                    STAGE
                  </h2>
                  <div className="mt-1 inline-block bg-[#fdfaf0] border-[2.4px] border-[#0f0f0f] shadow-[2.5px_2.5px_0px_#0f0f0f] px-2.5 py-0.5 -rotate-[3deg]">
                    <p className="font-comic-sub text-[11px] leading-[1.05] text-[#0f0f0f] text-center">
                      PERFORM.<br />INSPIRE.
                    </p>
                  </div>
                </div>
                <StageIllustration className="absolute bottom-[-2px] left-0 w-full h-[120px] z-10 pointer-events-none" />
                <div className="absolute right-3.5 bottom-3.5 z-20">
                  <ComicArrowButton onClick={() => triggerCategorySceneTransition('stage')} />
                </div>
              </div>

              {/* THEATRE PANEL */}
              <div
                ref={(el) => { panelRefs.current.theatre = el; }}
                onClick={() => triggerCategorySceneTransition('theatre')}
                style={{
                  clipPath: 'polygon(0% 4%, 100% 9%, 100% 100%, 6% 96%)',
                  transitionDuration: `${Math.round(310 * speedMult)}ms`,
                }}
                className={`relative w-[51.5%] -ml-[4%] h-full bg-[#861ec2] halftone-dots-dense cursor-pointer overflow-hidden select-none group transition-all ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  selectedCategory === 'theatre' && scenePhase === 'scene1-press'
                    ? 'animate-scene1-press z-30'
                    : selectedCategory === 'theatre' && isOverlayActive
                      ? 'opacity-0 pointer-events-none'
                      : isRearranged
                        ? 'translate-x-[125%] translate-y-[25%] rotate-6 opacity-0 pointer-events-none'
                        : 'translate-x-0 translate-y-0 rotate-0 opacity-100'
                }`}
              >
                <div className="relative z-20 pt-3.5 pl-4 pr-2">
                  <h2 className="font-comic-display comic-title-white text-[36px] leading-[0.88] -rotate-[3deg] tracking-wide">
                    THEATRE
                  </h2>
                  <div className="mt-1 inline-block bg-[#f9d423] border-[2.4px] border-[#0f0f0f] shadow-[2.5px_2.5px_0px_#0f0f0f] px-2 py-0.5 -rotate-[4deg]">
                    <p className="font-comic-sub text-[10.5px] leading-[1.05] text-[#0f0f0f] text-center">
                      ACT. IMAGINE.<br />BRING STORIES ALIVE.
                    </p>
                  </div>
                </div>
                <TheatreIllustration className="absolute bottom-[-2px] left-0 w-full h-[116px] z-10 pointer-events-none" />
                <div className="absolute right-3.5 bottom-3.5 z-20">
                  <ComicArrowButton onClick={() => triggerCategorySceneTransition('theatre')} />
                </div>
              </div>
            </div>

            {/* ROW 3: EVENT SCHEDULE */}
            <div
              onClick={() => setSelectedModal(PANEL_DETAILS.schedule)}
              className="relative w-full h-[62px] bg-[#df1b23] border-[3.2px] border-[#0f0f0f] shadow-[3.5px_3.5px_0px_#0f0f0f] px-3 flex items-center justify-between cursor-pointer active:translate-y-0.5"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-[#fdfaf0] border-[2px] border-[#0f0f0f] flex items-center justify-center font-bold text-[14px]">
                  📅
                </div>
                <div>
                  <h3 className="font-comic-display text-white text-[24px] leading-none">EVENT SCHEDULE</h3>
                  <p className="font-comic-sub text-[11px] text-white">DATES, TIMINGS & VENUES</p>
                </div>
              </div>
              <div className="bg-[#f8ca16] border-[2px] border-[#0f0f0f] px-2 py-0.5 font-comic-sub font-black text-[11px] rotate-1">
                CHECK NOW!
              </div>
            </div>

            {/* ROW 4: ANNOUNCEMENTS */}
            <div
              onClick={() => setSelectedModal(PANEL_DETAILS.announcements)}
              className="relative w-full h-[60px] bg-[#00966b] border-[3.2px] border-[#0f0f0f] shadow-[3.5px_3.5px_0px_#0f0f0f] px-3 flex items-center justify-between cursor-pointer active:translate-y-0.5"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-[#fdfaf0] border-[2px] border-[#0f0f0f] flex items-center justify-center font-bold text-[14px]">
                  📢
                </div>
                <div>
                  <h3 className="font-comic-display text-white text-[23px] leading-none">ANNOUNCEMENTS</h3>
                  <p className="font-comic-sub text-[11px] text-white">LIVE FEST UPDATES</p>
                </div>
              </div>
              <ComicArrowButton onClick={() => setSelectedModal(PANEL_DETAILS.announcements)} />
            </div>
          </div>

          {/* MOBILE BOTTOM NAVIGATION BAR */}
          <div className="w-full bg-[#0f0f0f] border-t-[3.5px] border-[#0f0f0f] pt-2 pb-5 px-3 flex items-center justify-around z-30 shrink-0">
            <button
              type="button"
              onClick={() => { setActiveTab('home'); closeCategoryArena(); }}
              className="flex flex-col items-center gap-1 cursor-pointer"
            >
              <span className={`text-[11px] font-bold ${activeTab === 'home' ? 'text-[#f8ca16]' : 'text-[#8e8e93]'}`}>
                🏠 Home
              </span>
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('events'); triggerCategorySceneTransition('arts'); }}
              className="flex flex-col items-center gap-1 cursor-pointer"
            >
              <span className={`text-[11px] font-bold ${activeTab === 'events' ? 'text-[#f8ca16]' : 'text-[#8e8e93]'}`}>
                ⚡ Events
              </span>
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('schedule'); setSelectedModal(PANEL_DETAILS.schedule); }}
              className="flex flex-col items-center gap-1 cursor-pointer"
            >
              <span className={`text-[11px] font-bold ${activeTab === 'schedule' ? 'text-[#f8ca16]' : 'text-[#8e8e93]'}`}>
                📅 Schedule
              </span>
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('winners'); setSelectedModal(PANEL_DETAILS.winners); }}
              className="flex flex-col items-center gap-1 cursor-pointer"
            >
              <span className={`text-[11px] font-bold ${activeTab === 'winners' ? 'text-[#f8ca16]' : 'text-[#8e8e93]'}`}>
                🏆 Winners
              </span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="flex flex-col items-center gap-1 cursor-pointer"
            >
              <span className="text-[11px] font-bold text-[#f8ca16] bg-[#262626] border border-[#f8ca16] px-2 py-0.5 rounded">
                Login
              </span>
            </button>
          </div>

          {/* MOBILE EXPANDED CATEGORY OVERLAY */}
          {selectedCategory && (
            <div
              className={`absolute inset-0 z-30 flex flex-col justify-between overflow-hidden bg-[#fdfaf0] transition-opacity duration-200 ${
                isOverlayActive ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
              }`}
            >
              {/* Category Arena Header */}
              <div
                className="w-full pt-10 pb-3 px-4 border-b-[3.5px] border-[#0f0f0f] shadow-[0_4px_0_#0f0f0f] flex items-center justify-between"
                style={{ backgroundColor: activeCategoryConfig?.bgHex }}
              >
                <div>
                  <span className="bg-[#fdfaf0] border-[1.8px] border-[#0f0f0f] px-2 py-0.5 font-comic-sub text-[10px] font-bold">
                    {activeCategoryConfig?.wingTag}
                  </span>
                  <h2 className="font-comic-display text-white text-[38px] leading-tight mt-1 comic-title-stroke">
                    {activeCategoryConfig?.cardTitle}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={closeCategoryArena}
                  className="bg-[#f8ca16] border-[2.4px] border-[#0f0f0f] shadow-[2.5px_2.5px_0px_#0f0f0f] px-3 py-1 font-comic-sub font-black text-[12px] cursor-pointer active:translate-y-0.5"
                >
                  ✕ BACK
                </button>
              </div>

              {/* Filters */}
              <div className="w-full px-3 py-2 bg-[#f8ca16] border-b-[2.5px] border-[#0f0f0f] flex gap-1.5 overflow-x-auto">
                {activeCategoryConfig?.filters.map((fil) => (
                  <button
                    key={fil}
                    type="button"
                    onClick={() => setActiveFilter(fil)}
                    className={`px-2.5 py-1 text-[11px] font-comic-sub font-black border-[1.8px] border-[#0f0f0f] shadow-[1.5px_1.5px_0px_#0f0f0f] shrink-0 cursor-pointer ${
                      activeFilter === fil ? 'bg-[#0f0f0f] text-white' : 'bg-[#fdfaf0] text-[#0f0f0f]'
                    }`}
                  >
                    {fil}
                  </button>
                ))}
              </div>

              {/* Event Cards Scroll Area */}
              <div className="flex-1 w-full p-3 overflow-y-auto space-y-3 pb-20">
                {filteredEvents.map((ev) => {
                  const isRegistered = registeredIds.includes(ev.id);
                  return (
                    <div
                      key={ev.id}
                      className="bg-white border-[2.8px] border-[#0f0f0f] shadow-[3.5px_3.5px_0px_#0f0f0f] p-3 rounded-lg"
                    >
                      <div className="flex items-start justify-between">
                        <span
                          className="px-2 py-0.5 text-[10px] font-bold border border-[#0f0f0f] text-black"
                          style={{ backgroundColor: ev.badgeColor }}
                        >
                          {ev.subCategory}
                        </span>
                        <span className="font-comic-sub font-bold text-[12px] text-[#df1b23]">
                          {ev.prize}
                        </span>
                      </div>
                      <h4 className="font-comic-display text-[22px] text-[#0f0f0f] mt-1">{ev.title}</h4>
                      <p className="text-[12px] text-neutral-700 leading-snug">{ev.tagline}</p>
                      <div className="mt-2 flex items-center justify-between text-[11px] font-semibold text-neutral-600">
                        <span>📅 {ev.time}</span>
                        <span>📍 {ev.venue}</span>
                      </div>
                      <div className="mt-2 pt-2 border-t border-neutral-200 flex items-center justify-between">
                        <span className="text-[11px] font-bold">👥 {ev.teamSize}</span>
                        <button
                          type="button"
                          onClick={() => toggleRegister(ev.id, ev.title)}
                          className={`px-3 py-1 font-comic-sub text-[12px] font-black border-[2px] border-[#0f0f0f] shadow-[2px_2px_0px_#0f0f0f] cursor-pointer active:translate-y-0.5 ${
                            isRegistered ? 'bg-[#22c55e] text-white' : 'bg-[#f8ca16] text-[#0f0f0f]'
                          }`}
                        >
                          {isRegistered ? 'REGISTERED ✓' : 'REGISTER'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* =========================================================================
          DESKTOP VIEWPORT (A Little Wide, Exact Comic Book Spread Matching Figma)
          Active on screens >= md (768px+)
         ========================================================================= */}
      <div className="hidden md:flex flex-col min-h-screen w-full bg-[#f5c71a] halftone-dots items-center py-6 px-4">
        {/* Sleek Minimal Desktop Comic Header: Only Necessary Utilities */}
        <header className="w-full max-w-[840px] flex items-center justify-between mb-4 px-1">
          <div
            onClick={() => { setSelectedCategory(null); setActiveTab('home'); }}
            className="flex items-center gap-2.5 cursor-pointer group select-none"
          >
            <div className="bg-[#df1b23] border-[2.8px] border-[#0f0f0f] shadow-[3px_3px_0px_#0f0f0f] px-3 py-1 -rotate-2 group-hover:rotate-0 transition-transform">
              <span className="font-comic-display text-white text-[24px] tracking-wide">BLOSSOMS 2026</span>
            </div>
            <span className="font-comic-sub font-black text-[12px] text-[#0f0f0f] uppercase tracking-wider hidden sm:inline">
              CHRIST (DEEMED TO BE UNIVERSITY)
            </span>
          </div>

          {/* Useful Action Buttons Only - NO duplicate event names */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedModal(PANEL_DETAILS.schedule)}
              className="px-3 py-1.5 bg-[#df1b23] text-white border-[2.2px] border-[#0f0f0f] shadow-[2.5px_2.5px_0px_#0f0f0f] font-comic-sub font-black text-[13px] cursor-pointer hover:-translate-y-0.5 active:translate-y-0.5 transition-transform"
            >
              📅 Schedule
            </button>
            <button
              type="button"
              onClick={() => setSelectedModal(PANEL_DETAILS.announcements)}
              className="px-3 py-1.5 bg-[#00966b] text-white border-[2.2px] border-[#0f0f0f] shadow-[2.5px_2.5px_0px_#0f0f0f] font-comic-sub font-black text-[13px] cursor-pointer hover:-translate-y-0.5 active:translate-y-0.5 transition-transform"
            >
              📢 Alerts
            </button>
            <button
              type="button"
              onClick={() => setSelectedModal(PANEL_DETAILS.winners)}
              className="px-3 py-1.5 bg-[#fdb813] text-[#0f0f0f] border-[2.2px] border-[#0f0f0f] shadow-[2.5px_2.5px_0px_#0f0f0f] font-comic-sub font-black text-[13px] cursor-pointer hover:-translate-y-0.5 active:translate-y-0.5 transition-transform"
            >
              🏆 Winners
            </button>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="px-3.5 py-1.5 bg-[#fdfaf0] hover:bg-white text-[#0f0f0f] border-[2.4px] border-[#0f0f0f] shadow-[3px_3px_0px_#0f0f0f] font-comic-sub font-black text-[13px] cursor-pointer hover:-translate-y-0.5 active:translate-y-0.5 transition-transform ml-1"
            >
              🎓 Student Login
            </button>
            <button
              type="button"
              onClick={() => navigate('/login?role=admin')}
              className="px-2.5 py-1.5 bg-[#0f0f0f] text-white border-[2.4px] border-[#0f0f0f] shadow-[2.5px_2.5px_0px_#0f0f0f] font-comic-sub font-bold text-[12px] cursor-pointer hover:-translate-y-0.5 active:translate-y-0.5 transition-transform"
            >
              Admin
            </button>
          </div>
        </header>

        {/* Desktop Comic Book Page Spread: Width ~840px (A Little Wide, Exactly Like Figma) */}
        <div className="w-full max-w-[840px] bg-[#f8ca16] border-[4px] border-[#0f0f0f] shadow-[10px_10px_0px_#0f0f0f] rounded-[24px] p-4 flex flex-col gap-3.5 relative overflow-hidden select-none">
          {selectedCategory ? (
            /* DESKTOP EXPANDED CATEGORY ARENA */
            <div className="w-full flex flex-col gap-4 animate-fadeIn">
              {/* Header Banner */}
              <div
                className="w-full border-[3.5px] border-[#0f0f0f] shadow-[5px_5px_0px_#0f0f0f] rounded-[16px] p-6 text-white flex items-center justify-between"
                style={{ backgroundColor: activeCategoryConfig?.bgHex }}
              >
                <div>
                  <span className="bg-[#fdfaf0] text-[#0f0f0f] border-[2px] border-[#0f0f0f] px-2.5 py-0.5 font-comic-sub font-black text-[11px] uppercase">
                    {activeCategoryConfig?.wingTag}
                  </span>
                  <h1 className="font-comic-display text-[48px] leading-tight comic-title-stroke mt-1">
                    {activeCategoryConfig?.cardTitle} ARENA
                  </h1>
                  <p className="font-comic-sub text-[15px] font-bold text-white/95 mt-0.5">
                    {activeCategoryConfig?.heroSummary}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeCategoryArena}
                  className="px-4 py-2 bg-[#f8ca16] text-[#0f0f0f] border-[2.5px] border-[#0f0f0f] shadow-[3px_3px_0px_#0f0f0f] font-comic-sub font-black text-[14px] cursor-pointer hover:bg-white active:translate-y-0.5 transition-all"
                >
                  ✕ BACK TO COMIC PAGE
                </button>
              </div>

              {/* Filters */}
              <div className="w-full bg-[#fdfaf0] border-[3px] border-[#0f0f0f] shadow-[3.5px_3.5px_0px_#0f0f0f] p-2.5 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2 overflow-x-auto">
                  <span className="font-comic-sub font-black text-[13px] text-neutral-800 ml-1">FILTER:</span>
                  {activeCategoryConfig?.filters.map((fil) => (
                    <button
                      key={fil}
                      type="button"
                      onClick={() => setActiveFilter(fil)}
                      className={`px-3 py-1 font-comic-sub font-black text-[12px] border-[1.8px] border-[#0f0f0f] shadow-[1.5px_1.5px_0px_#0f0f0f] cursor-pointer transition-all ${
                        activeFilter === fil
                          ? 'bg-[#0f0f0f] text-white -translate-y-0.5'
                          : 'bg-white hover:bg-[#f8ca16] text-[#0f0f0f]'
                      }`}
                    >
                      {fil}
                    </button>
                  ))}
                </div>
                <span className="font-comic-sub font-bold text-[12px] text-neutral-600 mr-2 shrink-0">
                  {filteredEvents.length} Competitions
                </span>
              </div>

              {/* 2-Column Wide Event Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredEvents.map((ev) => {
                  const isRegistered = registeredIds.includes(ev.id);
                  return (
                    <div
                      key={ev.id}
                      className="bg-white border-[3px] border-[#0f0f0f] shadow-[4px_4px_0px_#0f0f0f] p-4 rounded-xl flex flex-col justify-between hover:-translate-y-0.5 transition-all group"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span
                            className="px-2 py-0.5 font-comic-sub font-black text-[10.5px] border border-[#0f0f0f]"
                            style={{ backgroundColor: ev.badgeColor }}
                          >
                            {ev.subCategory}
                          </span>
                          <span className="font-comic-sub font-black text-[13px] text-[#df1b23]">
                            🏆 {ev.prize}
                          </span>
                        </div>
                        <h3 className="font-comic-display text-[22px] text-[#0f0f0f] leading-snug group-hover:text-[#df1b23] transition-colors">
                          {ev.title}
                        </h3>
                        <p className="text-[12.5px] text-neutral-700 font-medium leading-snug mt-1">
                          {ev.tagline}
                        </p>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-neutral-200">
                        <div className="flex items-center justify-between text-[11.5px] font-semibold text-neutral-700 mb-2.5">
                          <span>📅 {ev.time}</span>
                          <span>📍 {ev.venue}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[11.5px] font-bold text-neutral-800">👥 {ev.teamSize}</span>
                          <button
                            type="button"
                            onClick={() => toggleRegister(ev.id, ev.title)}
                            className={`px-4 py-1.5 font-comic-sub font-black text-[12.5px] border-[2px] border-[#0f0f0f] shadow-[2px_2px_0px_#0f0f0f] cursor-pointer active:translate-y-0.5 transition-all ${
                              isRegistered
                                ? 'bg-[#22c55e] text-white'
                                : 'bg-[#f8ca16] hover:bg-[#fde047] text-[#0f0f0f]'
                            }`}
                          >
                            {isRegistered ? 'REGISTERED ✓' : 'REGISTER'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* DESKTOP MAIN COMIC BOOK COVER (Exact 1:1 Figma Design) */
            <>
              {/* TOP ROW: HERO PANEL */}
              <div className="relative w-full h-[180px] sm:h-[196px] bg-[#fdfaf0] border-[3.5px] border-[#0f0f0f] shadow-[4px_4px_0px_#0f0f0f] rounded-[16px] flex items-center justify-between overflow-hidden p-2">
                {/* Left: BLOSSOMS 2026 Explosion */}
                <div className="relative w-[56%] h-full flex items-center justify-center">
                  <div className="relative z-10 text-center">
                    <h1 className="font-comic-display text-[58px] sm:text-[68px] text-[#df1b23] comic-title-stroke tracking-wider leading-[0.85]">
                      BLOSSOMS
                    </h1>
                    <div className="bg-[#f8ca16] border-[2.6px] border-[#0f0f0f] shadow-[2.5px_2.5px_0px_#0f0f0f] px-3 py-0.5 inline-block -rotate-2 mt-1">
                      <span className="font-comic-display text-[26px] text-[#0f0f0f]">2026</span>
                    </div>
                    <div className="mt-1 bg-white border-[2.2px] border-[#0f0f0f] shadow-[2.5px_2.5px_0px_#0f0f0f] px-3 py-0.5 rotate-1">
                      <p className="font-comic-sub font-black text-[11px] text-[#0f0f0f] uppercase tracking-wide">
                        SAME STAGE. DIFFERENT HEROES!
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right: Heritage Building Panel */}
                <div className="relative w-[42%] h-full bg-[#0088e8] border-[3px] border-[#0f0f0f] shadow-[3.5px_3.5px_0px_#0f0f0f] rounded-[12px] overflow-hidden p-2 flex items-center justify-center">
                  <div className="absolute top-2 left-2 bg-[#fdfaf0] border-[2px] border-[#0f0f0f] px-2.5 py-0.5 font-comic-sub font-black text-[10px] uppercase -rotate-2 z-20">
                    CULTURE. CREATIVITY. COMMUNITY.
                  </div>
                  <CampusHeritageDome className="w-full h-full max-h-[160px]" />
                </div>
              </div>

              {/* ROW 1: ARTS & LITERATURE (Angled Comic Panels) */}
              <div className="relative w-full h-[220px] flex">
                {/* ARTS PANEL */}
                <div
                  onClick={() => triggerCategorySceneTransition('arts')}
                  style={{
                    clipPath: 'polygon(0% 0%, 93% 3%, 100% 100%, 0% 97%)',
                  }}
                  className="relative w-[53.5%] h-full bg-[#ed1e79] halftone-dots-dense cursor-pointer overflow-hidden select-none group hover:scale-[1.01] transition-transform"
                >
                  <div className="relative z-20 pt-3 pl-4">
                    <h2 className="font-comic-display comic-title-white text-[52px] leading-[0.88] -rotate-[3deg] tracking-wide">
                      ARTS
                    </h2>
                    <div className="mt-1 inline-block bg-[#f9d423] border-[2.4px] border-[#0f0f0f] shadow-[2.5px_2.5px_0px_#0f0f0f] px-3 py-0.5 -rotate-[4deg]">
                      <p className="font-comic-sub text-[12px] leading-[1.05] text-[#0f0f0f] font-black text-center">
                        PAINT. DESIGN.<br />EXPRESS.
                      </p>
                    </div>
                  </div>
                  <ArtsIllustration className="absolute bottom-[-2px] left-0 w-full h-[140px] z-10 pointer-events-none" />
                  <div className="absolute right-4 bottom-4 z-20">
                    <ComicArrowButton onClick={() => triggerCategorySceneTransition('arts')} />
                  </div>
                </div>

                {/* LITERATURE PANEL */}
                <div
                  onClick={() => triggerCategorySceneTransition('literature')}
                  style={{
                    clipPath: 'polygon(0% 3%, 100% 7%, 100% 100%, 7% 97%)',
                  }}
                  className="relative w-[50.5%] -ml-[4%] h-full bg-[#0088e8] halftone-dots-dense cursor-pointer overflow-hidden select-none group hover:scale-[1.01] transition-transform"
                >
                  <div className="relative z-20 pt-3.5 pl-5 pr-2">
                    <h2 className="font-comic-display comic-title-white text-[42px] leading-[0.9] -rotate-[3deg] tracking-wide">
                      LITERATURE
                    </h2>
                    <div className="mt-1 inline-block bg-[#f9d423] border-[2.4px] border-[#0f0f0f] shadow-[2.5px_2.5px_0px_#0f0f0f] px-2.5 py-0.5 -rotate-[3deg]">
                      <p className="font-comic-sub text-[12px] leading-[1.05] text-[#0f0f0f] font-black text-center">
                        SPEAK. WRITE.<br />THINK.
                      </p>
                    </div>
                  </div>
                  <LiteratureIllustration className="absolute bottom-[-2px] left-1 w-full h-[135px] z-10 pointer-events-none" />
                  <div className="absolute right-4 bottom-4 z-20">
                    <ComicArrowButton onClick={() => triggerCategorySceneTransition('literature')} />
                  </div>
                </div>
              </div>

              {/* ROW 2: STAGE & THEATRE (Angled Comic Panels) */}
              <div className="relative w-full h-[220px] flex">
                {/* STAGE PANEL */}
                <div
                  onClick={() => triggerCategorySceneTransition('stage')}
                  style={{
                    clipPath: 'polygon(0% 0%, 94% 3%, 100% 100%, 0% 97%)',
                  }}
                  className="relative w-[52.5%] h-full bg-[#fdb813] halftone-dots-dense cursor-pointer overflow-hidden select-none group hover:scale-[1.01] transition-transform"
                >
                  <div className="relative z-20 pt-3 pl-4">
                    <h2 className="font-comic-display comic-title-white text-[52px] leading-[0.88] -rotate-[3deg] tracking-wide">
                      STAGE
                    </h2>
                    <div className="mt-1 inline-block bg-[#fdfaf0] border-[2.4px] border-[#0f0f0f] shadow-[2.5px_2.5px_0px_#0f0f0f] px-3 py-0.5 -rotate-[3deg]">
                      <p className="font-comic-sub text-[12px] leading-[1.05] text-[#0f0f0f] font-black text-center">
                        PERFORM.<br />INSPIRE.
                      </p>
                    </div>
                  </div>
                  <StageIllustration className="absolute bottom-[-2px] left-0 w-full h-[140px] z-10 pointer-events-none" />
                  <div className="absolute right-4 bottom-4 z-20">
                    <ComicArrowButton onClick={() => triggerCategorySceneTransition('stage')} />
                  </div>
                </div>

                {/* THEATRE PANEL */}
                <div
                  onClick={() => triggerCategorySceneTransition('theatre')}
                  style={{
                    clipPath: 'polygon(0% 3%, 100% 7%, 100% 100%, 6% 97%)',
                  }}
                  className="relative w-[51.5%] -ml-[4%] h-full bg-[#861ec2] halftone-dots-dense cursor-pointer overflow-hidden select-none group hover:scale-[1.01] transition-transform"
                >
                  <div className="relative z-20 pt-3.5 pl-5 pr-2">
                    <h2 className="font-comic-display comic-title-white text-[46px] leading-[0.88] -rotate-[3deg] tracking-wide">
                      THEATRE
                    </h2>
                    <div className="mt-1 inline-block bg-[#f9d423] border-[2.4px] border-[#0f0f0f] shadow-[2.5px_2.5px_0px_#0f0f0f] px-2.5 py-0.5 -rotate-[4deg]">
                      <p className="font-comic-sub text-[11px] leading-[1.05] text-[#0f0f0f] font-black text-center">
                        ACT. IMAGINE.<br />BRING STORIES ALIVE.
                      </p>
                    </div>
                  </div>
                  <TheatreIllustration className="absolute bottom-[-2px] left-0 w-full h-[135px] z-10 pointer-events-none" />
                  <div className="absolute right-4 bottom-4 z-20">
                    <ComicArrowButton onClick={() => triggerCategorySceneTransition('theatre')} />
                  </div>
                </div>
              </div>

              {/* ROW 3: EVENT SCHEDULE BANNER */}
              <div
                onClick={() => setSelectedModal(PANEL_DETAILS.schedule)}
                className="relative w-full h-[76px] bg-[#df1b23] border-[3.5px] border-[#0f0f0f] shadow-[4px_4px_0px_#0f0f0f] rounded-[12px] px-4 flex items-center justify-between cursor-pointer hover:-translate-y-0.5 active:translate-y-0.5 transition-transform"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#fdfaf0] border-[2.2px] border-[#0f0f0f] flex items-center justify-center font-bold text-[18px]">
                    📅
                  </div>
                  <div>
                    <h3 className="font-comic-display text-white text-[30px] leading-none">EVENT SCHEDULE</h3>
                    <p className="font-comic-sub text-[12px] text-white/90 font-bold">DATES, TIMINGS & VENUES • NOV 12 – DEC 16</p>
                  </div>
                </div>
                <div className="bg-[#f8ca16] border-[2.2px] border-[#0f0f0f] px-3 py-1 font-comic-sub font-black text-[13px] rotate-1 shadow-[2px_2px_0px_#0f0f0f]">
                  CHECK NOW!
                </div>
              </div>

              {/* ROW 4: ANNOUNCEMENTS BANNER */}
              <div
                onClick={() => setSelectedModal(PANEL_DETAILS.announcements)}
                className="relative w-full h-[72px] bg-[#00966b] border-[3.5px] border-[#0f0f0f] shadow-[4px_4px_0px_#0f0f0f] rounded-[12px] px-4 flex items-center justify-between cursor-pointer hover:-translate-y-0.5 active:translate-y-0.5 transition-transform"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#fdfaf0] border-[2.2px] border-[#0f0f0f] flex items-center justify-center font-bold text-[18px]">
                    📢
                  </div>
                  <div>
                    <h3 className="font-comic-display text-white text-[28px] leading-none">ANNOUNCEMENTS</h3>
                    <p className="font-comic-sub text-[12px] text-white/90 font-bold">LIVE FEST UPDATES & BULLETINS</p>
                  </div>
                </div>
                <ComicArrowButton onClick={() => setSelectedModal(PANEL_DETAILS.announcements)} />
              </div>
            </>
          )}
        </div>

        {/* Minimal Footer */}
        <footer className="mt-6 text-center text-[#0f0f0f] font-comic-sub font-bold text-[13px]">
          <p>CHRIST (DEEMED TO BE UNIVERSITY) • BANGALORE • SAME STAGE. DIFFERENT HEROES!</p>
        </footer>
      </div>

      {/* =========================================================================
          UNIVERSAL INTERACTIVE COMIC MODAL (Desktop & Mobile)
         ========================================================================= */}
      {selectedModal && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fadeIn"
          onClick={() => {
            setSelectedModal(null);
            setActiveTab('home');
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl bg-[#fdfaf0] border-[4px] border-[#0f0f0f] shadow-[8px_8px_0px_#0f0f0f] p-5 max-h-[85vh] flex flex-col relative rounded-2xl"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b-[2.5px] border-[#0f0f0f]">
              <div>
                <div
                  className="inline-block px-2.5 py-0.5 border-[2px] border-[#0f0f0f] font-comic-sub text-[11px] font-bold text-white mb-1 shadow-[2px_2px_0px_#0f0f0f]"
                  style={{ backgroundColor: selectedModal.accent }}
                >
                  {selectedModal.tag}
                </div>
                <h3 className="font-comic-display text-[34px] leading-tight text-[#0f0f0f]">
                  {selectedModal.title}
                </h3>
                <p className="font-comic-sub text-[13px] text-neutral-700 font-bold">
                  {selectedModal.subtitle}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedModal(null);
                  setActiveTab('home');
                }}
                className="w-8 h-8 bg-[#f8ca16] border-[2px] border-[#0f0f0f] shadow-[2px_2px_0px_#0f0f0f] font-comic-display text-[18px] flex items-center justify-center cursor-pointer hover:bg-red-500 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Items List */}
            <div className="mt-3.5 flex-1 overflow-y-auto space-y-2 pr-1">
              {selectedModal.items.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white border-[2.2px] border-[#0f0f0f] shadow-[2.5px_2.5px_0px_#0f0f0f] p-2.5 flex items-center justify-between rounded-lg hover:-translate-y-0.5 transition-transform"
                >
                  <div>
                    <p className="font-bold text-[13.5px] text-[#0f0f0f]">{item.name}</p>
                    <p className="text-[11.5px] text-neutral-600 font-semibold">📍 {item.venue}</p>
                  </div>
                  <span className="bg-[#f8ca16] border-[1.8px] border-[#0f0f0f] px-2 py-0.5 font-comic-sub font-bold text-[12px] shrink-0">
                    {item.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
