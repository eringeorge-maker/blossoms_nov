-- =============================================================
-- Blossoms Fest — Seed Data (synthetic / dev only)
-- Populated with 31 Official Provisional Events across 4 Categories:
-- Arts (10), Literature (8), Stage (8), Theatre (5)
-- =============================================================

-- ── Campuses ──────────────────────────────────────────────────
insert into public.campuses (id, name, code) values
  ('11111111-1111-1111-1111-111111111111', 'Central Campus', 'CC'),
  ('22222222-2222-2222-2222-222222222222', 'Bannerghatta Road Campus', 'BGR'),
  ('33333333-3333-3333-3333-333333333333', 'Yeshwanthpur Campus', 'YPC')
on conflict (code) do nothing;

-- ── Departments ───────────────────────────────────────────────
insert into public.departments (id, name, code, campus_id) values
  ('aaaa0001-0000-0000-0000-000000000001', 'Computer Science',        'CS',  '11111111-1111-1111-1111-111111111111'),
  ('aaaa0002-0000-0000-0000-000000000002', 'Business Administration', 'BBA', '11111111-1111-1111-1111-111111111111'),
  ('aaaa0003-0000-0000-0000-000000000003', 'Psychology',              'PSY', '11111111-1111-1111-1111-111111111111'),
  ('aaaa0004-0000-0000-0000-000000000004', 'English',                 'ENG', '11111111-1111-1111-1111-111111111111'),
  ('aaaa0005-0000-0000-0000-000000000005', 'Commerce',                'COM', '11111111-1111-1111-1111-111111111111')
on conflict do nothing;

-- ── Venues ────────────────────────────────────────────────────
insert into public.venues (id, name, campus_id, building, room, capacity) values
  ('bbbb0001-0000-0000-0000-000000000001', 'Main Auditorium',             '11111111-1111-1111-1111-111111111111', 'Central Block',    'Ground Floor', 1200),
  ('bbbb0002-0000-0000-0000-000000000002', 'KE Auditorium',               '11111111-1111-1111-1111-111111111111', 'Block IV',         '1st Floor',     650),
  ('bbbb0003-0000-0000-0000-000000000003', 'Sky View',                     '11111111-1111-1111-1111-111111111111', 'Central Block',    '10th Floor',    350),
  ('bbbb0004-0000-0000-0000-000000000004', 'Open Air Stage',               '11111111-1111-1111-1111-111111111111', 'Quadrangle',       null,           2000),
  ('bbbb0005-0000-0000-0000-000000000005', 'Black Box Theatre',           '11111111-1111-1111-1111-111111111111', 'Arts Complex',     'Ground Floor',  120),
  ('bbbb0006-0000-0000-0000-000000000006', 'Seminar Hall A',              '11111111-1111-1111-1111-111111111111', 'Audi Block',       '2nd Floor',     220),
  ('bbbb0007-0000-0000-0000-000000000007', 'Media Screening Theatre',      '11111111-1111-1111-1111-111111111111', 'Media Block',      'Hall 3',        150),
  ('bbbb0008-0000-0000-0000-000000000008', 'Fine Arts Studio',             '11111111-1111-1111-1111-111111111111', 'Block I',          'Room 304',       90),
  ('bbbb0009-0000-0000-0000-000000000009', 'Bird''s Park Amphitheatre',    '11111111-1111-1111-1111-111111111111', 'Campus Gardens',   null,            300),
  ('bbbb0010-0000-0000-0000-000000000010', 'Panel Room',                   '11111111-1111-1111-1111-111111111111', 'Block II',         'Floor 2',       100),
  ('bbbb0011-0000-0000-0000-000000000011', 'Assembly Quadrangle',          '11111111-1111-1111-1111-111111111111', 'Main Block',       'Open Courtyard',500)
on conflict do nothing;

-- ── Ensure categories exist ───────────────────────────────────
insert into public.event_categories (id, name, slug, display_order) values
  ('cccc0001-1111-0000-0000-000000000001', 'Arts',       'arts',       1),
  ('cccc0002-1111-0000-0000-000000000002', 'Literature', 'literature', 2),
  ('cccc0003-1111-0000-0000-000000000003', 'Stage',      'stage',      3),
  ('cccc0004-1111-0000-0000-000000000004', 'Theatre',    'theatre',    4)
on conflict (slug) do nothing;

-- ── 1. ARTS EVENTS ─────────────────────────────────────────────
insert into public.events (id, title, slug, category_id, description, event_format, min_team_size, max_team_size, registration_opens_at, registration_closes_at, capacity, status)
select 'e0010001-0000-0000-0000-000000000001', 'Digital Poster Making', 'digital-poster-making', id, 'Design captivating digital artwork and visual narratives around dynamic festival themes using industry standard digital illustration software.', 'individual', null, null, '2025-11-01 00:00:00+05:30', '2025-11-13 23:59:59+05:30', 40, 'published' from public.event_categories where slug = 'arts' on conflict (slug) do nothing;

insert into public.events (id, title, slug, category_id, description, event_format, min_team_size, max_team_size, registration_opens_at, registration_closes_at, capacity, status)
select 'e0010002-0000-0000-0000-000000000002', 'Greeting Card', 'greeting-card', id, 'Handmade greeting card crafting combining paper craft, calligraphy, pop-up mechanics, and heartfelt artistic expression on high-grade cardstock.', 'individual', null, null, '2025-11-01 00:00:00+05:30', '2025-11-13 23:59:59+05:30', 50, 'published' from public.event_categories where slug = 'arts' on conflict (slug) do nothing;

insert into public.events (id, title, slug, category_id, description, event_format, min_team_size, max_team_size, registration_opens_at, registration_closes_at, capacity, status)
select 'e0010003-0000-0000-0000-000000000003', 'Pot Art', 'pot-art', id, 'Transform raw earthenware terracotta pots into vibrant cultural statements using acrylics, traditional murals, 3D clay relief, or comic motifs.', 'either', 1, 2, '2025-11-01 00:00:00+05:30', '2025-11-13 23:59:59+05:30', 35, 'published' from public.event_categories where slug = 'arts' on conflict (slug) do nothing;

insert into public.events (id, title, slug, category_id, description, event_format, min_team_size, max_team_size, registration_opens_at, registration_closes_at, capacity, status)
select 'e0010004-0000-0000-0000-000000000004', 'Pencil Sketching', 'pencil-sketching', id, 'Pure line work, cross-hatching, and tonal shading. Create high-contrast dramatic sketches using graphite, charcoal, and blending stumps.', 'individual', null, null, '2025-11-01 00:00:00+05:30', '2025-11-13 23:59:59+05:30', 60, 'published' from public.event_categories where slug = 'arts' on conflict (slug) do nothing;

insert into public.events (id, title, slug, category_id, description, event_format, min_team_size, max_team_size, registration_opens_at, registration_closes_at, capacity, status)
select 'e0010005-0000-0000-0000-000000000005', 'Reel Making', 'reel-making', id, 'Capture the buzz, hidden comic panels, and unforgettable campus energy of Blossoms 2025 in a snappy 60-90 second vertical reel.', 'either', 1, 3, '2025-11-01 00:00:00+05:30', '2025-11-13 23:59:59+05:30', 45, 'published' from public.event_categories where slug = 'arts' on conflict (slug) do nothing;

insert into public.events (id, title, slug, category_id, description, event_format, min_team_size, max_team_size, registration_opens_at, registration_closes_at, capacity, status)
select 'e0010006-0000-0000-0000-000000000006', 'Collage', 'collage', id, 'Deconstruct print media, newspapers, textures, and comic strips to reconstruct bold narrative compositions on an impromptu theme.', 'either', 1, 2, '2025-11-01 00:00:00+05:30', '2025-11-13 23:59:59+05:30', 40, 'published' from public.event_categories where slug = 'arts' on conflict (slug) do nothing;

insert into public.events (id, title, slug, category_id, description, event_format, min_team_size, max_team_size, registration_opens_at, registration_closes_at, capacity, status)
select 'e0010007-0000-0000-0000-000000000007', 'Mehendi Design', 'mehendi-design', id, 'Celebrate intricate henna traditions spanning Arabic flow, Indian bridal symmetry, and modern fusion design on living canvases.', 'team', 2, 2, '2025-11-01 00:00:00+05:30', '2025-11-13 23:59:59+05:30', 50, 'published' from public.event_categories where slug = 'arts' on conflict (slug) do nothing;

insert into public.events (id, title, slug, category_id, description, event_format, min_team_size, max_team_size, registration_opens_at, registration_closes_at, capacity, status)
select 'e0010008-0000-0000-0000-000000000008', 'Rangoli Design', 'rangoli-design', id, 'Floor art spectacle with vibrant colored powders, flower petals, and geometric precision across the central quadrangle.', 'team', 2, 4, '2025-11-01 00:00:00+05:30', '2025-11-13 23:59:59+05:30', 30, 'published' from public.event_categories where slug = 'arts' on conflict (slug) do nothing;

insert into public.events (id, title, slug, category_id, description, event_format, min_team_size, max_team_size, registration_opens_at, registration_closes_at, capacity, status)
select 'e0010009-0000-0000-0000-000000000009', 'Painting', 'painting', id, 'Expressive canvas and paper painting with watercolours, gouache, or acrylics. Bring form, color theory, and festival themes to life.', 'individual', null, null, '2025-11-01 00:00:00+05:30', '2025-11-13 23:59:59+05:30', 45, 'published' from public.event_categories where slug = 'arts' on conflict (slug) do nothing;

insert into public.events (id, title, slug, category_id, description, event_format, min_team_size, max_team_size, registration_opens_at, registration_closes_at, capacity, status)
select 'e0010010-0000-0000-0000-000000000010', 'Photography', 'photography', id, 'Spot photography across Christ Central Campus capturing candid moments, stark shadows, and high-energy festival atmosphere.', 'individual', null, null, '2025-11-01 00:00:00+05:30', '2025-11-13 23:59:59+05:30', 50, 'published' from public.event_categories where slug = 'arts' on conflict (slug) do nothing;

-- ── 2. LITERATURE EVENTS ───────────────────────────────────────
insert into public.events (id, title, slug, category_id, description, event_format, min_team_size, max_team_size, registration_opens_at, registration_closes_at, capacity, status)
select 'e0020001-0000-0000-0000-000000000001', 'Quiz', 'quiz', id, 'The legendary General Knowledge and Pop-Culture trivia marathon! Written preliminary elimination round followed by a thrilling 6-team buzzer finale on stage.', 'team', 2, 3, '2025-11-01 00:00:00+05:30', '2025-11-13 23:59:59+05:30', 60, 'published' from public.event_categories where slug = 'literature' on conflict (slug) do nothing;

insert into public.events (id, title, slug, category_id, description, event_format, min_team_size, max_team_size, registration_opens_at, registration_closes_at, capacity, status)
select 'e0020002-0000-0000-0000-000000000002', 'Pot Pourri', 'pot-pourri', id, 'A whirlwind gauntlet of wordplay games: Anagrams, Pictionary, What''s the Good Word, 20 Questions, and Taboo under strict clocks.', 'team', 3, 3, '2025-11-01 00:00:00+05:30', '2025-11-13 23:59:59+05:30', 35, 'published' from public.event_categories where slug = 'literature' on conflict (slug) do nothing;

insert into public.events (id, title, slug, category_id, description, event_format, min_team_size, max_team_size, registration_opens_at, registration_closes_at, capacity, status)
select 'e0020003-0000-0000-0000-000000000003', 'Extempore', 'extempore', id, 'Think fast, speak sharp! Draw an impromptu topic, take 2 minutes of mental prep, and deliver a compelling 3-minute oration.', 'individual', null, null, '2025-11-01 00:00:00+05:30', '2025-11-13 23:59:59+05:30', 40, 'published' from public.event_categories where slug = 'literature' on conflict (slug) do nothing;

insert into public.events (id, title, slug, category_id, description, event_format, min_team_size, max_team_size, registration_opens_at, registration_closes_at, capacity, status)
select 'e0020004-0000-0000-0000-000000000004', 'Dumb Charades', 'dumb-charades', id, 'Pure silent gesture magic! Enact obscure Bollywood, Hollywood, regional cinema, and cult literature titles without uttering a syllable.', 'team', 3, 3, '2025-11-01 00:00:00+05:30', '2025-11-13 23:59:59+05:30', 40, 'published' from public.event_categories where slug = 'literature' on conflict (slug) do nothing;

insert into public.events (id, title, slug, category_id, description, event_format, min_team_size, max_team_size, registration_opens_at, registration_closes_at, capacity, status)
select 'e0020005-0000-0000-0000-000000000005', 'Air Crash / Ship-Wreck', 'air-crash-ship-wreck', id, 'A doomed vessel, a sinking ship, only ONE life jacket left! Inhabit a famous personality or character and convince the captain why you must survive.', 'individual', null, null, '2025-11-01 00:00:00+05:30', '2025-11-13 23:59:59+05:30', 35, 'published' from public.event_categories where slug = 'literature' on conflict (slug) do nothing;

insert into public.events (id, title, slug, category_id, description, event_format, min_team_size, max_team_size, registration_opens_at, registration_closes_at, capacity, status)
select 'e0020006-0000-0000-0000-000000000006', 'Debate', 'debate', id, 'Clash of ideas and parliamentary rhetoric. Teams of two argue fiercely For and Against contentious motions shaping modern society.', 'team', 2, 2, '2025-11-01 00:00:00+05:30', '2025-11-13 23:59:59+05:30', 32, 'published' from public.event_categories where slug = 'literature' on conflict (slug) do nothing;

insert into public.events (id, title, slug, category_id, description, event_format, min_team_size, max_team_size, registration_opens_at, registration_closes_at, capacity, status)
select 'e0020007-0000-0000-0000-000000000007', 'Jam', 'jam', id, 'The ultimate test of conversational wit! Speak for 60 seconds without hesitation, repetition, or grammatical deviation while rival speakers try to object.', 'individual', null, null, '2025-11-01 00:00:00+05:30', '2025-11-13 23:59:59+05:30', 45, 'published' from public.event_categories where slug = 'literature' on conflict (slug) do nothing;

insert into public.events (id, title, slug, category_id, description, event_format, min_team_size, max_team_size, registration_opens_at, registration_closes_at, capacity, status)
select 'e0020008-0000-0000-0000-000000000008', 'Creative Writing', 'creative-writing', id, 'Pen an original short story or evocative verse triggered by a mysterious visual prompt or opening line revealed on the spot.', 'individual', null, null, '2025-11-01 00:00:00+05:30', '2025-11-13 23:59:59+05:30', 55, 'published' from public.event_categories where slug = 'literature' on conflict (slug) do nothing;

-- ── 3. STAGE EVENTS ────────────────────────────────────────────
insert into public.events (id, title, slug, category_id, description, event_format, min_team_size, max_team_size, registration_opens_at, registration_closes_at, capacity, status)
select 'e0030001-0000-0000-0000-000000000001', 'Indian Dance Classical (Group)', 'indian-dance-classical-group', id, 'Grace, precision, and devotion. Group choreographies honoring Bharatanatyam, Kathak, Odissi, Kuchipudi, and Mohiniyattam on the grand main stage.', 'team', 4, 10, '2025-11-01 00:00:00+05:30', '2025-11-13 23:59:59+05:30', 20, 'published' from public.event_categories where slug = 'stage' on conflict (slug) do nothing;

insert into public.events (id, title, slug, category_id, description, event_format, min_team_size, max_team_size, registration_opens_at, registration_closes_at, capacity, status)
select 'e0030002-0000-0000-0000-000000000002', 'Non Theme', 'non-theme', id, 'Electric choreography unbound by storyline limits! Hip-hop, contemporary, Bollywood fusion, and urban styles with explosive formation shifts.', 'team', 6, 12, '2025-11-01 00:00:00+05:30', '2025-11-13 23:59:59+05:30', 25, 'published' from public.event_categories where slug = 'stage' on conflict (slug) do nothing;

insert into public.events (id, title, slug, category_id, description, event_format, min_team_size, max_team_size, registration_opens_at, registration_closes_at, capacity, status)
select 'e0030003-0000-0000-0000-000000000003', 'BOB (W)', 'bob-w', id, 'Battle of the Bands - Western! Amps cranked to eleven! Western rock, metal, funk, indie, and alternative bands face off on the festival''s largest sound system.', 'team', 3, 8, '2025-11-01 00:00:00+05:30', '2025-11-13 23:59:59+05:30', 20, 'published' from public.event_categories where slug = 'stage' on conflict (slug) do nothing;

insert into public.events (id, title, slug, category_id, description, event_format, min_team_size, max_team_size, registration_opens_at, registration_closes_at, capacity, status)
select 'e0030004-0000-0000-0000-000000000004', 'BOB (I)', 'bob-i', id, 'Battle of the Bands - Indian! Indian rock, Sufi fusion, Carnatic/Hindustani electric jams, and contemporary folk-rock clashes in full musical fury.', 'team', 3, 8, '2025-11-01 00:00:00+05:30', '2025-11-13 23:59:59+05:30', 20, 'published' from public.event_categories where slug = 'stage' on conflict (slug) do nothing;

insert into public.events (id, title, slug, category_id, description, event_format, min_team_size, max_team_size, registration_opens_at, registration_closes_at, capacity, status)
select 'e0030005-0000-0000-0000-000000000005', 'Indian Folk and Film Singing (Solo)', 'indian-folk-film-singing-solo', id, 'Soulful solo vocals covering timeless Bollywood classics, regional cinematic masterpieces, and rustic Indian folk melodies.', 'individual', null, null, '2025-11-01 00:00:00+05:30', '2025-11-13 23:59:59+05:30', 40, 'published' from public.event_categories where slug = 'stage' on conflict (slug) do nothing;

insert into public.events (id, title, slug, category_id, description, event_format, min_team_size, max_team_size, registration_opens_at, registration_closes_at, capacity, status)
select 'e0030006-0000-0000-0000-000000000006', 'Western Singing (Solo)', 'western-singing-solo', id, 'Take center stage with powerful vocal control, stylistic nuance, and charisma across Pop, Rock, Soul, R&B, Blues, and Jazz standards.', 'individual', null, null, '2025-11-01 00:00:00+05:30', '2025-11-13 23:59:59+05:30', 40, 'published' from public.event_categories where slug = 'stage' on conflict (slug) do nothing;

insert into public.events (id, title, slug, category_id, description, event_format, min_team_size, max_team_size, registration_opens_at, registration_closes_at, capacity, status)
select 'e0030007-0000-0000-0000-000000000007', 'Western Acapella', 'western-acapella', id, 'Unadulterated human vocal symphony! Complex choral harmonies, soaring solo leads, beatboxing, and driving vocal basslines with zero instruments.', 'team', 4, 12, '2025-11-01 00:00:00+05:30', '2025-11-13 23:59:59+05:30', 16, 'published' from public.event_categories where slug = 'stage' on conflict (slug) do nothing;

insert into public.events (id, title, slug, category_id, description, event_format, min_team_size, max_team_size, registration_opens_at, registration_closes_at, capacity, status)
select 'e0030008-0000-0000-0000-000000000008', 'Duet Dance', 'duet-dance', id, 'Partnership, storytelling, and rhythm. Two dancers moving as one across contemporary, lyrical, hip-hop, or Indian semi-classical styles.', 'team', 2, 2, '2025-11-01 00:00:00+05:30', '2025-11-13 23:59:59+05:30', 30, 'published' from public.event_categories where slug = 'stage' on conflict (slug) do nothing;

-- ── 4. THEATRE EVENTS ──────────────────────────────────────────
insert into public.events (id, title, slug, category_id, description, event_format, min_team_size, max_team_size, registration_opens_at, registration_closes_at, capacity, status)
select 'e0040001-0000-0000-0000-000000000001', 'Mono Act', 'mono-act', id, 'A solo theatrical tour-de-force! Command the stage alone, shifting seamlessly across distinct personas, vocal pitches, and dramatic tension.', 'individual', null, null, '2025-11-01 00:00:00+05:30', '2025-11-13 23:59:59+05:30', 35, 'published' from public.event_categories where slug = 'theatre' on conflict (slug) do nothing;

insert into public.events (id, title, slug, category_id, description, event_format, min_team_size, max_team_size, registration_opens_at, registration_closes_at, capacity, status)
select 'e0040002-0000-0000-0000-000000000002', 'Proscenium', 'proscenium', id, 'Grand auditorium stage drama featuring elaborate set design, dramatic lighting cues, original scripted dialogue, and ensemble acting.', 'team', 6, 15, '2025-11-01 00:00:00+05:30', '2025-11-13 23:59:59+05:30', 12, 'published' from public.event_categories where slug = 'theatre' on conflict (slug) do nothing;

insert into public.events (id, title, slug, category_id, description, event_format, min_team_size, max_team_size, registration_opens_at, registration_closes_at, capacity, status)
select 'e0040003-0000-0000-0000-000000000003', 'Street Play', 'street-play', id, 'Unamplified, raw, acoustic theatre in the round addressing burning socio-political issues with booming chorus chants, dholak rhythms, and striking formations.', 'team', 8, 20, '2025-11-01 00:00:00+05:30', '2025-11-13 23:59:59+05:30', 16, 'published' from public.event_categories where slug = 'theatre' on conflict (slug) do nothing;

insert into public.events (id, title, slug, category_id, description, event_format, min_team_size, max_team_size, registration_opens_at, registration_closes_at, capacity, status)
select 'e0040004-0000-0000-0000-000000000004', 'Short Film Making', 'short-film-making', id, 'Cinematic student storytelling! Submit original short films, screened in the Media Theatre followed by a live jury Q&A and critique.', 'team', 2, 6, '2025-11-01 00:00:00+05:30', '2025-11-13 23:59:59+05:30', 25, 'published' from public.event_categories where slug = 'theatre' on conflict (slug) do nothing;

insert into public.events (id, title, slug, category_id, description, event_format, min_team_size, max_team_size, registration_opens_at, registration_closes_at, capacity, status)
select 'e0040005-0000-0000-0000-000000000005', 'Mime', 'mime', id, 'The poetic eloquence of silence! Perform impactful narratives using white-face makeup, synchronized illusions, and physical expression.', 'team', 4, 10, '2025-11-01 00:00:00+05:30', '2025-11-13 23:59:59+05:30', 20, 'published' from public.event_categories where slug = 'theatre' on conflict (slug) do nothing;

-- ── All-Students Eligibility Rule for all 31 events ───────────
insert into public.event_eligibility_rules (event_id, rule_type)
select id, 'all_students' from public.events on conflict do nothing;

-- ── Synthetic test students (no real student data) ────────────
insert into public.students
  (id, register_number, full_name, institutional_email,
   campus_id, department_id, student_status, is_verified, profile_complete) values
  (
    'dddd0001-0000-0000-0000-000000000001',
    'TEST2212001',
    'Arjun Nair',
    'arjun.nair@christuniversity.in',
    '11111111-1111-1111-1111-111111111111',
    'aaaa0001-0000-0000-0000-000000000001',
    'active', true, true
  ),
  (
    'dddd0002-0000-0000-0000-000000000002',
    'TEST2212002',
    'Ananya Sharma',
    'ananya.sharma@christuniversity.in',
    '11111111-1111-1111-1111-111111111111',
    'aaaa0002-0000-0000-0000-000000000002',
    'active', true, true
  )
on conflict (register_number) do nothing;

-- ── Sample announcement ───────────────────────────────────────
insert into public.announcements (title, body, severity, is_pinned, is_published) values
  (
    'Welcome to Blossoms 2025!',
    'Provisional registrations are open for all 31 events across Arts, Literature, Stage, and Theatre. Log in with your CHRIST credentials to secure your slots.',
    'important', true, true
  )
on conflict do nothing;
