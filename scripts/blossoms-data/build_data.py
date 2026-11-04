"""Builds the Blossoms 2026-27 data from the organisers' files.

Usage (from the repo root):
    python scripts/blossoms-data/build_data.py "<Student List 2026-27.xlsx>" "<Blossoms 26 REPS.pdf>" [admin_email]

Writes:
    supabase/migrations/005_blossoms_2026_events.sql  events, schedule, venues, event heads, faculty (safe to commit)
    supabase/private/blossoms_people.sql               students, class reps, admin invite (git-ignored: personal data)
    src/lib/data/eventsData.ts                         the same events for the website's offline fallback

Event, schedule and head data is transcribed from "FINAL SCHEDULE.pdf", "Blossoms 26 Event heads.pdf"
and "BLOSSOMS 2026-27 Rules.pdf". Event ids are deterministic (uuid5 of the slug), so the website and
the database agree on ids without a lookup.
"""

from __future__ import annotations

import json
import re
import sys
import uuid
from collections import OrderedDict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
NAMESPACE = uuid.UUID("6f1c3a52-0b6e-4f7e-9a51-6c0d6b1f2a10")
OPENS_AT = "2026-11-04T00:00:00+05:30"


def uid(kind: str, key: str) -> str:
    return str(uuid.uuid5(NAMESPACE, f"blossoms-2026/{kind}/{key}"))


# ── Venues (from FINAL SCHEDULE.pdf "Venue to Book") ──────────────────────────
VENUES = OrderedDict(
    [
        ("birds-park", ("Birds Park", "Central Campus", "Open-air stage")),
        ("seminar-hall", ("Seminar Hall", "Central Campus", None)),
        ("assembly-hall", ("Assembly Hall", "Central Campus", None)),
        ("panel-room", ("Panel Room", "Central Campus", None)),
        ("room-911", ("Room 911", "Central Block", "9th floor")),
        ("gazebo-bb-court", ("Gazebo / BB Court", "Central Campus", None)),
        ("b2-inside", ("Block 2 (inside)", "Block 2", None)),
        ("classrooms", ("Classrooms", "Central Campus", "Allotted classrooms")),
        ("classrooms-seminar-hall", ("Classrooms / Seminar Hall", "Central Campus", None)),
        ("ke-audi", ("KE Auditorium", "Central Campus", None)),
        ("garden-street", ("Garden Street", "Central Campus", None)),
        ("campus-view", ("Campus View", "Central Campus", None)),
        ("gazebo-classrooms", ("Gazebo / Classrooms", "Central Campus", None)),
        ("online", ("Online submission", None, None)),
    ]
)

CATEGORIES = OrderedDict(
    [
        ("arts", ("Arts", "Visual art on the spot: drawing, painting, crafts, design and photography.", 1)),
        ("literature", ("Literature", "Quizzes, debates, speaking events and creative writing.", 2)),
        ("stage", ("Stage", "Dance and music: solo, duet, group and band events.", 3)),
        ("theatre", ("Theatre", "Mono act, proscenium, street play, mime and short film.", 4)),
        ("special-events", ("Special Events", "Inaugurations and festival-wide moments.", 5)),
    ]
)

POINTS = {"arts": 7, "literature": 7.5, "stage": 10, "theatre": 10}

ART_GENERAL = [
    "Prelim date, time, venue and theme are set by the deanery.",
    "For prelims, materials are brought by students or provided by the deanery; for the finals, the Student Welfare Office provides them.",
    "The judges' and organising committee's decision is final.",
]
LIT_GENERAL = [
    "Prelim date, time and venue are set by the school; topics are prepared by the deanery.",
    "Students are not used as judges. The judges' and organising committee's decision is final.",
]
THEATRE_GENERAL = [
    "Duration, participants and language stay the same between prelims and finals.",
    "Scripts are screened by the deanery coordinator for prelims and by the SWO for finals.",
    "No targeting of governments, political parties or individuals; no vulgarity; no fire or water on stage.",
    "No external or cross-deanery directors, make-up, costume or set designers.",
    "Participants and storyline cannot change for the finals without written SWO permission.",
]
SOLO_MUSIC_GENERAL = [
    "Only one accompanist is allowed; singing without an accompanist is fine.",
    "Keyboard in grand piano mode only. Karaoke tracks are allowed if submitted in advance and without backing vocals.",
]
THEATRE_FINALS = "1-4 teams: 1 team qualifies; 5-7 teams: 2 qualify; 8 or more: 3 qualify. No ties."
DANCE_GROUP_FINALS = "Deaneries with more than 5 teams send 3 finalists; 3-5 teams send 2; fewer than 3 send 1."
TOP2 = "First and second place from the prelims go to the finals in January 2027."


def ev(slug, title, cat, fmt, team, date, start, end, venue, faculty, heads, description, rules, finals=None,
       slot_title=None, registration=True):
    return dict(
        slug=slug, title=title, cat=cat, fmt=fmt, team=team, date=date, start=start, end=end, venue=venue,
        faculty=faculty, heads=heads, description=description, rules=rules, finals=finals,
        slot_title=slot_title, registration=registration,
    )


# ── Events: heads PDF (names), FINAL SCHEDULE.pdf (date/venue/time/teacher), Rules PDF (format/rules) ──
EVENTS = [
    # Special
    ev("swo-inauguration", "SWO Inauguration", "special-events", "individual", None, "2026-11-12", None, None, None,
       [], [], "University-wide opening of Blossoms 2026-27 by the Student Welfare Office.",
       ["Timing and venue will be announced by the Student Welfare Office."], registration=False,
       slot_title="Timing to be announced"),
    ev("doc-inauguration", "DOC Inauguration", "special-events", "individual", None, "2026-11-13", "11:00", "17:00",
       "birds-park", [], [], "The Department of Commerce opens its Blossoms season at Birds Park.",
       ["Open to all Department of Commerce students."], registration=False),

    # Arts (7 points each)
    ev("digital-poster-making", "Digital Poster Making", "arts", "individual", None, "2026-11-29", None, None, "online",
       ["Sandeep Kumar Singh"], ["Dhanush V", "Rachael"],
       "Design an original A4 portrait poster on a theme given on the spot, in any school-taught design software.",
       ["Individual event. Theme given on the spot. Duration: 2 hours.",
        "Any software taught in schools may be used (Photoshop, Canva, Paint, PowerPoint, etc.).",
        "Poster size A4 (8.27 x 11.69 in), portrait.",
        "Original work only; avoid copyrighted elements. AI tools are not allowed.",
        "Prelims are done in a classroom under teacher supervision; both the working file and the final file are collected."],
       TOP2, slot_title="Online"),
    ev("greeting-card", "Greeting Card", "arts", "individual", None, "2026-11-25", "12:45", "17:30", "classrooms",
       ["Greeshma Benny Thadikara"], ["Ragani", "Shreya", "Kevin"],
       "Make a handmade greeting card on a theme announced on the spot.",
       ["Individual event. Theme given on the spot. Duration: 2 hours.",
        "Bring your own stationery. White cardboard sheets are provided only in the finals."],
       TOP2),
    ev("pot-art", "Mixed Media Pot Art", "arts", "individual", None, "2026-11-18", "12:45", "18:30", "gazebo-bb-court",
       ["Vijayalakshmi S"], ["Harshil", "Yakshitha"],
       "Decorate a pot in mixed media on a theme given on the spot.",
       ["Individual event. Theme given on the spot. Duration: 2 hours.",
        "Glitter, mirror pieces, plaster of Paris, chalk powder, hammers, chisels and other sharp tools are not allowed."],
       TOP2),
    ev("pencil-sketching", "Pencil Sketching", "arts", "individual", None, "2026-12-03", "12:45", "17:30", "garden-street",
       ["Minnu Baby Maria", "Mahesh S"], ["Hariharan", "Tejaswi"],
       "Sketch to a prompt using only pencil and charcoal.",
       ["Individual event. A prompt is given for both prelims and finals. Duration: 2 hours.",
        "Only pencils, charcoal and erasers. No colour media (markers, paints).",
        "Bring your own sketching supplies; sketching paper is provided in the finals."],
       TOP2),
    ev("reel-making", "Reel Making", "arts", "individual", None, "2026-12-11", None, None, "online",
       ["Lijeesh P"], ["Trinity Merlin A", "Diyan"],
       "Shoot and edit a 60 to 90 second reel on campus, on a topic released a day before.",
       ["Individual event. Topic given 1 day before the event.",
        "Reel length 60-90 seconds. Mobile phones only, basic editing; voice-overs with BGM allowed.",
        "No VFX, no stock footage. Shoot only inside the campus.",
        "Explicit, vulgar or plagiarised work is rejected."],
       TOP2, slot_title="Online"),
    ev("collage", "Collage", "arts", "team", (4, 4), "2026-12-12", "12:45", "18:30", "gazebo-classrooms",
       ["Hemangine Rai"], ["Anjali", "Pragna"],
       "Teams of four build a collage on a theme given on the spot.",
       ["Team of exactly 4. Theme given on the spot. Time limit: 2 hours.",
        "No mobile phones or internet during the competition.",
        "Bring paper, magazines, glue, scissors and colours; chart paper is provided in the finals."],
       TOP2),
    ev("mehendi-design", "Mehendi Design", "arts", "individual", None, "2026-11-20", "12:45", "17:30", "classrooms",
       ["Sruthi N R"], ["Bhavini Rathi", "Reshma", "J H Sangam"],
       "Solo mehendi on a model you bring, covering one hand to the elbow.",
       ["Solo event; bring your own subject/model.",
        "Design covers one hand up to the elbow, on both sides of the palm.",
        "Time: 2 hours, no extra time. Judged on overall look, creativity and design.",
        "On-the-spot registrations are also accepted."],
       TOP2),
    ev("rangoli-design", "Rangoli Design", "arts", "team", (4, 4), "2026-11-19", "15:45", "19:00", "b2-inside",
       ["Kavitha R"], ["Prarthana", "Kunal S Thakur", "Diyan"],
       "Teams of four create a rangoli on a theme given on the spot.",
       ["Team of exactly 4. Theme given on the spot. Time limit: 2 hours.",
        "Bring your own colours; only natural or traditional rangoli colours, no synthetic colours.",
        "No pre-drawn outlines, stencils, adhesives, lights, stickers or objects unless specified.",
        "Each team gets an assigned area and must keep it clean."],
       TOP2),
    ev("painting", "Painting", "arts", "individual", None, "2026-12-10", "12:45", "17:30", "classrooms",
       ["Vidya C M"], ["Kaushal", "Deepika V"],
       "Paint an original piece on a theme given on the spot, in any paint.",
       ["Individual event. Theme given on the spot. Duration: 2 hours. Any paint is allowed.",
        "The painting must be original and unpublished.",
        "Bring your own water bottle, painting materials and a rough cloth."],
       TOP2),
    ev("photography", "Photography", "arts", "individual", None, "2026-12-06", None, None, "online",
       ["Smita Kavatekar"], ["Naomi D'silva", "Thanush"],
       "Submit two photographs on a theme announced the day before.",
       ["Individual event. Theme announced 1 day before; submit 2 photos in JPEG.",
        "Basic cropping and colour correction only; edits that change the photo disqualify it.",
        "Show the original photo on your phone when you submit.",
        "The rules allow mobile phone photos only (the schedule lists this as Photography (DSLR); check with the event heads)."],
       TOP2, slot_title="Online"),

    # Literature (7.5 points each)
    ev("quiz", "Quiz", "literature", "team", (3, 3), "2026-11-21", "12:45", "17:30", "classrooms",
       ["Krishna Prasath S"], ["Olin Joy", "Amirthavarshini.S"],
       "Teams of three take on multiple-choice, true/false and specific-answer rounds.",
       ["Team entries only, 3 members. No replacements after registration.",
        "The school decides the number of prelim rounds; the quizmaster's decision is final.",
        "No mobiles or electronic devices during the quiz."],
       TOP2),
    ev("pot-pourri", "Pot Pourri", "literature", "team", (3, 3), "2026-11-17", "12:45", "19:00", "panel-room",
       ["Jayakrishna Y", "Sanjay Sunny"], ["Jayden", "Saashmitha"],
       "Teams of three play several literary rounds: quizzes, spell bee, crosswords, heads up and more.",
       ["3 members per team; on-the-spot team making is allowed.",
        "Multiple rounds of different literary activities.",
        "Scoring is cumulative or by elimination, at the judges' discretion; marks for accuracy, creativity, speed and following the task."],
       TOP2),
    ev("extempore", "Extempore", "literature", "individual", None, "2026-12-04", "12:45", "17:30", "classrooms",
       ["Lijeesh P"], ["Neeti Deora", "Punam"],
       "Get a topic on the spot, think for a minute, then speak.",
       ["Individual event. Topic given on the spot with 1 minute to prepare. No writing.",
        "Marks for content, fluency, relevance, style and humour."],
       TOP2),
    ev("dumb-charades", "Dumb Charades", "literature", "team", (3, 3), "2026-12-02", "12:45", "17:30", "classrooms",
       ["Puja Roshani"], ["Khush S Bhirakcha"],
       "Teams of three act out movies, songs, phrases and situations without words.",
       ["3 members per team: 1 guesses and 2 act, as the team chooses.",
        "No spelling, rhyming, splitting or codes.",
        "Prompts can be movies, characters, songs, phrases, situations and more."],
       TOP2),
    ev("air-crash-shipwreck", "Air Crash / Ship-Wreck", "literature", "individual", None, "2026-11-14", "11:00", "18:00",
       "seminar-hall", ["Gowtham R"], ["Avantika", "Vijeta"],
       "Play a random character and convince the captain you deserve the last life jacket.",
       ["Individual event. Characters are assigned at random; the judge is the captain.",
        "1 minute to prepare. No writing, no phones.",
        "1 minute to make your case and 1 minute to answer the captain's questions."],
       TOP2),
    ev("debate", "Debate", "literature", "individual", None, "2026-11-16", "12:45", "19:00", "assembly-hall",
       ["Harshita Singh"], ["Sneha", "Ankit Anup"],
       "Non-parliamentary debate on a motion announced the day before.",
       ["Individual event. Topics announced a day before the prelims.",
        "4 minutes speaking + 1 minute rebuttal. Be ready to argue for or against.",
        "Use of notes is at the judges' discretion. Marks for content, fluency, delivery and rebuttal."],
       TOP2),
    ev("jam", "Just A Minute (JAM)", "literature", "individual", None, "2026-11-26", "12:45", "17:30",
       "classrooms-seminar-hall", ["Jayashree Saha"], ["Shatkhi roopa", "Shriya A Shastry"],
       "Speak for a minute on the JAM Master's topic without hesitating, repeating or deviating.",
       ["Individual event in elimination rounds; topics given on the spot by the JAM Master.",
        "Standard JAM rules: late start, jumping the gun, hesitation, repetition, deviation, grammar.",
        "British English only: no slang, Americanisms, abbreviations or SMS lingo.",
        "Marks for seconds spoken, relevance, clarity, humour and presence of mind."],
       TOP2),
    ev("creative-writing", "Creative Writing", "literature", "individual", None, "2026-12-11", "12:45", "17:30", "classrooms",
       ["Lijeesh P"], ["K Pratheek Padiyar", "Dhruv gupta"],
       "Handwritten poetry, essay or short story, written on the spot in English.",
       ["Individual event. English only, handwritten on A4 sheets provided by the school.",
        "Poetry: 1 hour, at most 2 pages, theme on the spot.",
        "Essay: 1 hour, 1000-1500 words, topic on the spot.",
        "Short story: 30 minutes, 500-750 words, from a picture prompt.",
        "No vulgar or inappropriate language."],
       TOP2),

    # Stage (10 points each)
    ev("impulse", "Impulse (Solo Dance)", "stage", "individual", None, "2026-11-23", "14:00", "19:00", "birds-park",
       ["Dharma Vignesh"], ["Melissa", "Dimple"],
       "A prepared solo dance in any style, up to 3 minutes.",
       ["Solo performance prepared in advance; choose your own song and style. Time limit: 3 minutes.",
        "Submit your audio track to the organising committee before the deadline.",
        "Props only with prior approval. Nothing that damages the stage or is unsafe.",
        "Judged on technique, choreography, musicality, expression and stage presence."],
       "The top 3 qualify for the Inter-Deanery finals."),
    ev("indian-dance-classical-group", "Indian Classical Dance (Group)", "stage", "team", (4, 8), "2026-11-30", "15:30",
       "17:00", "birds-park", ["K V N Lakshmi"], ["Dhanushree", "Tithi Maji"],
       "Group classical dance to authentic classical music, 6 + 1 minutes on stage.",
       ["Teams of 4 to 8. Duration: 6 + 1 minutes on stage.",
        "No live music. Authentic Indian classical songs in any language; no film classical music.",
        "Authentic costumes, hairstyles and jewellery for the dance form."],
       DANCE_GROUP_FINALS),
    ev("non-theme", "Non Theme (Indian Group Dance)", "stage", "team", (8, 15), "2026-12-07", "16:00", "18:00", "ke-audi",
       ["Sudheesh K"], ["Prathmesh Agarwal", "Mahek"],
       "Indian film or folk group dance, 5 + 1 minutes on stage.",
       ["Teams of 8 to 15. Duration: 5 + 1 minutes on stage.",
        "Indian film songs with lyrics only: no fusion, remixes or album songs.",
        "Only Indian dance forms (including Bollywood and contemporary). Minimal props.",
        "No fire on stage; no vulgarity in costume, movement or lyrics. No ties in prelims."],
       DANCE_GROUP_FINALS),
    ev("bob-w", "Battle of Bands (Western)", "stage", "team", (5, 10), "2026-12-09", "12:00", "17:00", "campus-view",
       ["John Benedict D"], ["Nihal", "Vedika"],
       "Western electric bands, 10 + 2 minutes including setup.",
       ["5 to 10 members, with 1 to 3 vocalists. Duration: 10 + 2 minutes including setup and clearance.",
        "No backing tracks, samples or sequences. No growling.",
        "Submit English lyrics for original compositions at registration.",
        "The same members must perform in prelims and finals."]),
    ev("bob-i", "Battle of Bands (Indian)", "stage", "team", (5, 10), "2026-12-09", "12:00", "17:00", "campus-view",
       ["John Benedict D"], ["Nihal", "Vedika"],
       "Indian electric bands performing in Indian languages, 10 + 2 minutes.",
       ["5 to 10 members. Duration: 10 + 2 minutes including setup and clearance.",
        "Indian languages only, with at least one Indian melodic or percussion instrument.",
        "No pre-recorded music or sequenced samples. No growling.",
        "Original lyrics need an English translation at registration.",
        "The same members must perform in prelims and finals."]),
    ev("western-acoustic", "Western Acoustic (Group)", "stage", "team", (5, 10), "2026-12-09", "12:00", "17:00",
       "campus-view", ["John Benedict D"], ["Nihal", "Vedika"],
       "Acoustic groups focused on vocal harmony, 10 + 2 minutes.",
       ["5 to 10 members. Duration: 10 + 2 minutes, entry to exit, including setup.",
        "Acoustic instruments only. No backing tracks, samples or sequences.",
        "The same members must perform in prelims and finals."]),
    ev("western-singing-solo", "Western Singing (Solo)", "stage", "individual", None, "2026-12-14", "16:00", "18:30",
       "room-911", ["Abin John"], ["Saksham", "Sri Ghaja"],
       "Solo western vocals, 4 + 1 minutes.",
       ["Duration: 4 + 1 minutes. Keyboard in grand piano tone or acoustic guitar only.",
        "Djembe or cajon may be used. No sequenced beats or samples. No inappropriate lyrics.",
        "Best Original Composition is awarded separately."] + SOLO_MUSIC_GENERAL),
    ev("indian-folk-film-singing-solo", "Indian Folk and Film Singing (Solo)", "stage", "individual", None, "2026-12-14",
       "16:00", "18:30", "room-911", ["Abin John"], ["Saksham", "Sri Ghaja"],
       "Solo Indian folk and film songs, 4 + 1 minutes.",
       ["Duration: 4 + 1 minutes. Karaoke allowed without backing vocals.",
        "Accompanist on grand piano or acoustic guitar; tabla or mridangam allowed.",
        "No sequenced beats or samples. No inappropriate lyrics."] + SOLO_MUSIC_GENERAL),
    ev("dance-duet", "Dance Duet", "stage", "team", (2, 2), "2026-11-24", "14:00", "19:00", "birds-park",
       ["Reynal Lavita Fernandes"], ["Shreyas", "Abhivarshini"],
       "Two dancers, Indian film songs, 2 + 1 minutes.",
       ["Teams of 2. Duration: 2 + 1 minutes on stage.",
        "Indian film songs only; up to 2 songs may be mixed. No western dance forms.",
        "No vulgarity; no fire or water on stage. No ties."],
       "First 2 from the prelims go to the finals. " + DANCE_GROUP_FINALS),

    # Theatre (10 points each)
    ev("mono-act", "Mono Act", "theatre", "individual", None, "2026-11-17", "12:45", "19:00", "room-911",
       ["Jayakrishna Y", "Sanjay Sunny"], ["Ruth Sarah", "Jennifer"],
       "A self-written solo act or monologue, 3 + 1 minutes.",
       ["Duration: 3 + 1 minutes including entry and exit.",
        "English only (up to 10% regional language). Self-written and self-directed.",
        "Basic props and costumes encouraged. Submit background music to the tech team beforehand.",
        "You cannot change the whole act for the finals."] + THEATRE_GENERAL,
       "2 winners from the prelims go to the finals."),
    ev("proscenium", "Proscenium Theatre", "theatre", "team", (8, 25), "2026-12-01", "16:00", "18:00", "ke-audi",
       ["Harmandeep Singh"], ["Rohith Odiyar", "Japsimar", "Hiranmaei"],
       "Stage play in English, Hindi or Kannada, 20 + 5 minutes.",
       ["8 to 25 participants including crew, with at least 6 actors.",
        "Duration: 20 + 5 minutes including setup and clearance. Clean the stage after.",
        "Language: English, Hindi or Kannada. Originals or credited adaptations.",
        "No powdered colours or liquid paints on stage. No external lights."] + THEATRE_GENERAL,
       THEATRE_FINALS),
    ev("street-play", "Street Play", "theatre", "team", (15, 25), "2026-12-03", "14:30", "18:30", "garden-street",
       ["Minnu Baby Maria", "Mahesh S"], ["Ram", "Avika soni", "Garima"],
       "English street theatre with multilingual jingles, 8 + 2 minutes.",
       ["15 to 25 participants. Duration: 8 + 2 minutes including entry and exit.",
        "Dialogue and narration in English. Jingles in at least 4 Indian languages, none above 25%.",
        "No loudspeakers, dry colours or paints. Formations at most 10 ft; no lifts between girls and boys.",
        "No religious slokas, bhajans or scripture verses."] + THEATRE_GENERAL,
       THEATRE_FINALS),
    ev("short-film-making", "Short Film Making", "theatre", "team", (5, 15), "2026-12-08", "12:45", "19:00", "birds-park",
       ["Maria Fulgen"], ["Janani", "Greeshmitha"],
       "A 6 to 8 minute mobile-shot short film in English.",
       ["5 to 15 members including crew; current CHRIST students of the deanery only.",
        "Length 6-8 minutes including intro and credits. Mobile phone footage only.",
        "English (10-15% regional with subtitles). Credits with role titles.",
        "Must feature one prop (calendar, lock and key, glass of water or pencil) throughout and one listed proverb.",
        "No alcohol or smoking items on screen."] + THEATRE_GENERAL,
       "1-4 teams: 1 team qualifies; 5 or more: 2 qualify.", slot_title="Online & Birds Park"),
    ev("mime", "Mime", "theatre", "team", (6, 10), "2026-12-15", "16:00", "18:00", "ke-audi",
       ["Sukanya R"], ["Likith k", "Bhavitha L", "Leo"],
       "Silent storytelling without props or narration, 7 + 1 minutes.",
       ["Up to 10 members including painters, musicians and console; at least 6 on stage at any time.",
        "Duration: 7 + 1 minutes including entry and exit.",
        "No props and no narration (live or recorded). Recorded or live music and SFX allowed."] + THEATRE_GENERAL,
       THEATRE_FINALS),
]

CATEGORY_GENERAL = {"arts": ART_GENERAL, "literature": LIT_GENERAL}


def ist(date: str, hhmm: str) -> str:
    return f"{date}T{hhmm}:00+05:30"


def build_events():
    out = []
    for e in EVENTS:
        rules = list(e["rules"]) + CATEGORY_GENERAL.get(e["cat"], [])
        if e["finals"]:
            rules.append("Finals: " + e["finals"])
        timed = e["start"] is not None
        closes = ist(e["date"], e["start"]) if timed else ist(e["date"], "09:00")
        min_size, max_size = (e["team"] or (None, None))
        out.append(dict(
            id=uid("event", e["slug"]),
            slug=e["slug"],
            title=e["title"],
            cat=e["cat"],
            event_format=e["fmt"],
            min_team_size=min_size,
            max_team_size=max_size,
            description=e["description"],
            rules_markdown="\n".join(f"{i}. {r}" for i, r in enumerate(rules, 1)),
            registration_enabled=e["registration"],
            registration_opens_at=OPENS_AT if e["registration"] else None,
            registration_closes_at=closes if e["registration"] else None,
            points=POINTS.get(e["cat"]),
            finals_rule=e["finals"],
            slot=dict(
                id=uid("slot", e["slug"]),
                venue_id=uid("venue", e["venue"]) if e["venue"] else None,
                venue_key=e["venue"],
                slot_title=e["slot_title"],
                slot_date=e["date"],
                starts_at=ist(e["date"], e["start"]) if timed else None,
                ends_at=ist(e["date"], e["end"]) if timed else None,
            ),
            contacts=[("faculty_coordinator", n, i) for i, n in enumerate(e["faculty"])]
            + [("student_head", n, i) for i, n in enumerate(e["heads"])],
        ))
    return out


# ── SQL helpers ───────────────────────────────────────────────────────────────
def q(v) -> str:
    if v is None:
        return "null"
    if isinstance(v, bool):
        return "true" if v else "false"
    if isinstance(v, (int, float)):
        return str(v)
    return "'" + str(v).replace("'", "''") + "'"


def events_sql(events) -> str:
    ids = ", ".join(q(e["id"]) for e in events)
    venue_ids = ", ".join(q(uid("venue", k)) for k in VENUES)
    lines = [
        "-- =============================================================",
        "-- Blossoms Fest — Migration 005: Blossoms 2026-27 events",
        "-- Generated by scripts/blossoms-data/build_data.py from FINAL SCHEDULE.pdf,",
        "-- Blossoms 26 Event heads.pdf and BLOSSOMS 2026-27 Rules.pdf. Re-runnable.",
        "-- Replaces the placeholder seed events; refuses if any of them has registrations.",
        "-- =============================================================",
        "begin;",
        "",
        "do $$ begin",
        "  if exists (select 1 from public.event_registrations er",
        f"             where er.event_id <> all (array[{ids}]::uuid[])) then",
        "    raise exception 'Placeholder events have registrations; not replacing them.';",
        "  end if;",
        "end $$;",
        "",
        "-- Placeholder seed events (slots and eligibility rules cascade).",
        "delete from public.event_winners where event_id <> all (array[" + ids + "]::uuid[]);",
        "delete from public.teams where event_id <> all (array[" + ids + "]::uuid[]);",
        "delete from public.events where id <> all (array[" + ids + "]::uuid[]);",
        "delete from public.venues v where v.id <> all (array[" + venue_ids + "]::uuid[])",
        "  and not exists (select 1 from public.event_schedule_slots s where s.venue_id = v.id);",
        "",
        "-- Categories",
    ]
    for slug, (name, desc, order) in CATEGORIES.items():
        lines.append(
            "insert into public.event_categories (name, slug, description, display_order) values "
            f"({q(name)}, {q(slug)}, {q(desc)}, {order}) on conflict (slug) do update set "
            "name = excluded.name, description = excluded.description, display_order = excluded.display_order;"
        )
    lines += ["", "-- Venues"]
    for key, (name, building, room) in VENUES.items():
        lines.append(
            "insert into public.venues (id, name, campus_id, building, room) values "
            f"({q(uid('venue', key))}, {q(name)}, (select id from public.campuses where code = 'CC'), {q(building)}, {q(room)}) "
            "on conflict (id) do update set name = excluded.name, building = excluded.building, room = excluded.room;"
        )
    lines += ["", "-- Events. Admin-owned fields (registration_closed, whatsapp_group_url, status) are kept on re-run."]
    for e in events:
        lines.append(
            "insert into public.events (id, title, slug, category_id, description, rules_markdown, event_format, "
            "min_team_size, max_team_size, registration_opens_at, registration_closes_at, waitlist_enabled, "
            "cancellation_allowed, status, registration_enabled, points, finals_rule) values ("
            f"{q(e['id'])}, {q(e['title'])}, {q(e['slug'])}, (select id from public.event_categories where slug = {q(e['cat'])}), "
            f"{q(e['description'])}, {q(e['rules_markdown'])}, {q(e['event_format'])}, {q(e['min_team_size'])}, "
            f"{q(e['max_team_size'])}, {q(e['registration_opens_at'])}, {q(e['registration_closes_at'])}, false, true, "
            f"'published', {q(e['registration_enabled'])}, {q(e['points'])}, {q(e['finals_rule'])}) "
            "on conflict (id) do update set title = excluded.title, slug = excluded.slug, category_id = excluded.category_id, "
            "description = excluded.description, rules_markdown = excluded.rules_markdown, event_format = excluded.event_format, "
            "min_team_size = excluded.min_team_size, max_team_size = excluded.max_team_size, "
            "registration_opens_at = excluded.registration_opens_at, registration_closes_at = excluded.registration_closes_at, "
            "registration_enabled = excluded.registration_enabled, points = excluded.points, finals_rule = excluded.finals_rule, "
            "updated_at = now();"
        )
    lines += ["", "-- Schedule (one slot per event)", f"delete from public.event_schedule_slots where event_id = any (array[{ids}]::uuid[]);"]
    for e in events:
        s = e["slot"]
        status = "scheduled" if s["starts_at"] else "tbd"
        lines.append(
            "insert into public.event_schedule_slots (id, event_id, venue_id, slot_title, slot_date, starts_at, ends_at, status) values "
            f"({q(s['id'])}, {q(e['id'])}, {q(s['venue_id'])}, {q(s['slot_title'])}, {q(s['slot_date'])}, "
            f"{q(s['starts_at'])}, {q(s['ends_at'])}, '{status}');"
        )
    lines += ["", "-- Faculty coordinators (schedule) and student event heads", f"delete from public.event_contacts where event_id = any (array[{ids}]::uuid[]);"]
    for e in events:
        for role, name, order in e["contacts"]:
            lines.append(
                "insert into public.event_contacts (event_id, role, name, display_order) values "
                f"({q(e['id'])}, '{role}', {q(name)}, {order});"
            )
    lines += [
        "",
        "-- Department of Commerce is the only department taking part in this portal.",
        "update public.departments set name = 'Department of Commerce' where code = 'COM';",
        "insert into public.deaneries (name, campus_id)",
        "select 'Commerce (Team Obsidian)', id from public.campuses where code = 'CC'",
        "on conflict (name) do nothing;",
        "",
        "-- Announcements",
        "delete from public.announcements where title = 'Welcome to Blossoms 2025!';",
        "insert into public.announcements (title, body, severity, is_pinned, is_published, publish_at)",
        "select 'Blossoms 2026-27 starts 12 November',",
        "       'Blossoms opens with the SWO Inauguration on 12 November and the DOC Inauguration at Birds Park on 13 November. "
        "Every student takes part in at least one event: sign in with your register number and CHRIST email to register.',",
        "       'important', true, true, now()",
        "where not exists (select 1 from public.announcements where title = 'Blossoms 2026-27 starts 12 November');",
        "",
        "commit;",
        "",
    ]
    return "\n".join(lines)


# ── Students and reps ─────────────────────────────────────────────────────────
def title_name(raw: str) -> str:
    words = re.sub(r"\s+", " ", str(raw).strip()).split(" ")
    out = []
    for w in words:
        if len(w) <= 2 and w.isalpha():
            out.append(w.upper())
        else:
            out.append("-".join("'".join(p[:1].upper() + p[1:].lower() for p in part.split("'")) for part in w.split("-")))
    return " ".join(out)


CLASS_RE = re.compile(r"^\s*(\d)\s*(BCOM|BSC|MCOM)\s*(.*?)\s*$", re.I)


def normalise_class(raw: str):
    m = CLASS_RE.match(str(raw))
    if not m:
        raise ValueError(f"Unrecognised class name: {raw!r}")
    sem = int(m.group(1))
    prog = {"BCOM": "BCom", "BSC": "BSc", "MCOM": "MCom"}[m.group(2).upper()]
    rest = re.sub(r"(?<=\S)HON\b", " HON", m.group(3).upper())
    rest = re.sub(r"\s+", " ", rest).strip()
    label = f"{sem} {prog.upper() if prog != 'BSc' else 'BSc'} {rest}".strip()
    return label, prog, (sem + 1) // 2


def read_students(xlsx: Path):
    import openpyxl

    ws = openpyxl.load_workbook(xlsx, read_only=True, data_only=True).worksheets[0]
    students: "OrderedDict[str, tuple]" = OrderedDict()
    for row in ws.iter_rows(min_row=2, values_only=True):
        reg, name, cls = (row + (None, None, None))[:3]
        reg = str(reg).strip() if reg is not None else ""
        if not re.fullmatch(r"\d{7}", reg) or not name or not cls:
            continue
        label, prog, year = normalise_class(cls)
        record = (reg, title_name(name), label, prog, year)
        if reg in students and students[reg] != record:
            raise ValueError(f"Register number {reg} appears with different details")
        students[reg] = record
    return list(students.values())


REP_RE = re.compile(
    r"^\s*(\d{1,2})\s+(?P<name>[A-Za-z][A-Za-z .']*?)\s+(?:(?P<reg>\d{7})\s*)?"
    r"(?P<cls>\d\s*(?:BCOM|BSC|MCOM)[A-Za-z&. ]*?)\s+(?P<phone>\d[\d ]{8,12}\d)\s*\.?\s*$",
    re.I,
)


def read_reps(pdf: Path):
    import pymupdf

    text = "\n".join(page.get_text() for page in pymupdf.open(pdf))
    # get_text() puts each cell on its own line; rebuild rows from the serial-number column.
    tokens = [t.strip() for t in text.splitlines() if t.strip()]
    rows, current = [], []
    for t in tokens:
        if re.fullmatch(r"\d{1,2}", t) and (not current or len(current) > 1):
            if current:
                rows.append(current)
            current = [t]
        elif current:
            current.append(t)
    if current:
        rows.append(current)

    reps = []
    for cells in rows:
        line = " ".join(cells)
        m = REP_RE.match(line)
        if not m:
            continue
        phone = re.sub(r"\D", "", m.group("phone"))
        cls = re.sub(r"(BCOM|BSC|MCOM)(?=\S)", r"\1 ", m.group("cls").upper())
        cls = re.sub(r"\s+", " ", cls).strip().replace("BSC", "BSc")
        reps.append((title_name(m.group("name")), m.group("reg"), cls, phone))
    return reps


def people_sql(students, reps, admin_email) -> str:
    lines = [
        "-- Blossoms 2026-27 people data. GENERATED — contains personal data; do not commit.",
        "-- Source: Student List 2026-27.xlsx, Blossoms 26 REPS.pdf.",
        "begin;",
        "",
        "-- Remove the two placeholder test students (only if they never registered).",
        "delete from public.students s where s.register_number like 'TEST%'",
        "  and not exists (select 1 from public.event_registrations r where r.student_id = s.id)",
        "  and not exists (select 1 from public.team_members m where m.student_id = s.id);",
        "",
        "-- Other placeholder departments from seed.sql, now unused.",
        "delete from public.departments d where d.code <> 'COM'",
        "  and not exists (select 1 from public.students s where s.department_id = d.id);",
        "",
        "insert into public.students (register_number, full_name, class_name, programme, year_of_study, campus_id, department_id, deanery_id, student_status, is_verified, profile_complete) values",
    ]
    values = [
        f"  ({q(reg)}, {q(name)}, {q(cls)}, {q(prog)}, {year}, (select id from public.campuses where code = 'CC'), "
        "(select id from public.departments where code = 'COM'), "
        "(select id from public.deaneries where name = 'Commerce (Team Obsidian)'), 'active', false, false)"
        for reg, name, cls, prog, year in students
    ]
    lines.append(",\n".join(values))
    lines += [
        "on conflict (register_number) do update set full_name = excluded.full_name, class_name = excluded.class_name,",
        "  programme = excluded.programme, year_of_study = excluded.year_of_study, deanery_id = excluded.deanery_id,",
        "  student_status = 'active', updated_at = now();",
        "",
        "-- Class representatives",
        "delete from public.class_representatives;",
        "insert into public.class_representatives (full_name, register_number, class_name, phone) values",
        ",\n".join(f"  ({q(n)}, {q(r)}, {q(c)}, {q(p)})" for n, r, c, p in reps) + ";",
        "",
    ]
    if admin_email:
        lines += [
            "-- First super admin. Signs in at /login (Admin) with this email.",
            "insert into public.admin_invites (email, full_name, role) values "
            f"({q(admin_email.lower())}, 'Blossoms Admin', 'super_admin') on conflict (email) do update set role = excluded.role;",
            "",
        ]
    lines += ["commit;", ""]
    return "\n".join(lines)


# ── Website fallback data ─────────────────────────────────────────────────────
def events_ts(events) -> str:
    venues = {
        key: dict(id=uid("venue", key), name=name, campus_id=None, building=building, room=room, capacity=None,
                  maps_url=None, created_at=OPENS_AT)
        for key, (name, building, room) in VENUES.items()
    }
    cats = [
        dict(id=f"cat-{slug}", name=name, slug=slug, description=desc, icon_url=None, display_order=order,
             created_at=OPENS_AT)
        for slug, (name, desc, order) in CATEGORIES.items()
    ]
    raw = []
    for e in events:
        s = e["slot"]
        raw.append(dict(
            id=e["id"], title=e["title"], slug=e["slug"], category_id=f"cat-{e['cat']}", description=e["description"],
            rules_markdown=e["rules_markdown"], poster_url=None, thumbnail_url=None, event_format=e["event_format"],
            min_team_size=e["min_team_size"], max_team_size=e["max_team_size"],
            registration_opens_at=e["registration_opens_at"], registration_closes_at=e["registration_closes_at"],
            capacity=None, waitlist_enabled=False, cancellation_allowed=True, conflict_policy="warn", status="published",
            organiser_contact=None, created_by=None, created_at=OPENS_AT, updated_at=OPENS_AT,
            registration_enabled=e["registration_enabled"], registration_closed=False, whatsapp_group_url=None,
            points=e["points"], finals_rule=e["finals_rule"],
            contacts=[dict(role=r, name=n, display_order=o) for r, n, o in e["contacts"]],
            schedule_slots=[dict(
                id=s["id"], event_id=e["id"], venue_id=s["venue_id"], slot_title=s["slot_title"], slot_date=s["slot_date"],
                starts_at=s["starts_at"], ends_at=s["ends_at"], timezone="Asia/Kolkata",
                status="scheduled" if s["starts_at"] else "tbd", venue=venues.get(s["venue_key"]) if s["venue_key"] else None,
            )],
        ))
    dump = lambda v: json.dumps(v, indent=2, ensure_ascii=False)
    return (
        "// GENERATED by scripts/blossoms-data/build_data.py — edit the script, not this file.\n"
        "// Blossoms 2026-27 events (FINAL SCHEDULE.pdf, Blossoms 26 Event heads.pdf, BLOSSOMS 2026-27 Rules.pdf).\n"
        "// The live site reads events from Supabase; this copy is the offline fallback and uses the same ids.\n"
        "import type { Event, EventCategory, Venue } from '@/types'\n\n"
        f"export const VENUES: Record<string, Venue> = {dump(venues)}\n\n"
        f"export const CATEGORIES: EventCategory[] = {dump(cats)}\n\n"
        f"const RAW_EVENTS: Omit<Event, 'category'>[] = {dump(raw)} as Omit<Event, 'category'>[]\n\n"
        "export const EVENTS: Event[] = RAW_EVENTS.map((e) => ({\n"
        "  ...e,\n"
        "  category: CATEGORIES.find((c) => c.id === e.category_id),\n"
        "}))\n"
    )


def main():
    if len(sys.argv) < 3:
        sys.exit(__doc__)
    xlsx, reps_pdf = Path(sys.argv[1]), Path(sys.argv[2])
    admin_email = sys.argv[3] if len(sys.argv) > 3 else None

    events = build_events()
    students = read_students(xlsx)
    reps = read_reps(reps_pdf)

    (ROOT / "supabase/migrations/005_blossoms_2026_events.sql").write_text(events_sql(events), encoding="utf-8")
    private = ROOT / "supabase/private"
    private.mkdir(exist_ok=True)
    (private / "blossoms_people.sql").write_text(people_sql(students, reps, admin_email), encoding="utf-8")
    (ROOT / "src/lib/data/eventsData.ts").write_text(events_ts(events), encoding="utf-8")

    classes = sorted({s[2] for s in students})
    print(f"events: {len(events)}  students: {len(students)}  classes: {len(classes)}  reps: {len(reps)}")
    print("classes:", ", ".join(classes))


if __name__ == "__main__":
    main()
