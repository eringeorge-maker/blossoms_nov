-- =============================================================
-- Blossoms Fest — Migration 011: 2026 event data sync + two-session events
-- 1. Brings the live event data up to date with the PR #5 schedule (categories, venues,
--    event details, slots, contacts) — the same statements as migration 005, without its
--    placeholder clean-up, so test events and existing registrations are left alone.
--    Admin-owned fields (registration_closed, whatsapp_group_url, status) are kept.
-- 2. Events held at 12:45 PM and 3:45 PM get one slot per session; registrations and
--    teams record which session they chose.
-- =============================================================
begin;

-- Categories
insert into public.event_categories (name, slug, description, display_order) values ('Arts', 'arts', 'Visual art on the spot: drawing, painting, crafts, design and photography.', 1) on conflict (slug) do update set name = excluded.name, description = excluded.description, display_order = excluded.display_order;
insert into public.event_categories (name, slug, description, display_order) values ('Literature', 'literature', 'Quizzes, debates, speaking events and creative writing.', 2) on conflict (slug) do update set name = excluded.name, description = excluded.description, display_order = excluded.display_order;
insert into public.event_categories (name, slug, description, display_order) values ('Stage', 'stage', 'Dance and music: solo, duet, group and band events.', 3) on conflict (slug) do update set name = excluded.name, description = excluded.description, display_order = excluded.display_order;
insert into public.event_categories (name, slug, description, display_order) values ('Theatre', 'theatre', 'Mono act, proscenium, street play, mime and short film.', 4) on conflict (slug) do update set name = excluded.name, description = excluded.description, display_order = excluded.display_order;
insert into public.event_categories (name, slug, description, display_order) values ('Special Events', 'special-events', 'Inaugurations and festival-wide moments.', 5) on conflict (slug) do update set name = excluded.name, description = excluded.description, display_order = excluded.display_order;

-- Venues
insert into public.venues (id, name, campus_id, building, room) values ('cc43ba28-55cf-5fbe-a35b-f6b80c90235c', 'Birds Park', (select id from public.campuses where code = 'CC'), 'Central Campus', 'Open-air stage') on conflict (id) do update set name = excluded.name, building = excluded.building, room = excluded.room;
insert into public.venues (id, name, campus_id, building, room) values ('b7078db2-7090-5a1c-8d23-cce685ab0db5', 'Seminar Hall', (select id from public.campuses where code = 'CC'), 'Block 2', null) on conflict (id) do update set name = excluded.name, building = excluded.building, room = excluded.room;
insert into public.venues (id, name, campus_id, building, room) values ('e0768fb8-8654-51be-89eb-e8c263c9da50', 'Assembly Hall', (select id from public.campuses where code = 'CC'), 'Block 2', null) on conflict (id) do update set name = excluded.name, building = excluded.building, room = excluded.room;
insert into public.venues (id, name, campus_id, building, room) values ('c2b71b25-3f5c-5305-9a78-01bdf067d1bf', 'Panel Room', (select id from public.campuses where code = 'CC'), 'Block 2', null) on conflict (id) do update set name = excluded.name, building = excluded.building, room = excluded.room;
insert into public.venues (id, name, campus_id, building, room) values ('6efd6d99-f51b-54af-bec3-4d6351735083', 'Room 911', (select id from public.campuses where code = 'CC'), 'Central Block', '9th floor') on conflict (id) do update set name = excluded.name, building = excluded.building, room = excluded.room;
insert into public.venues (id, name, campus_id, building, room) values ('8074dc1f-4820-5a2e-8a1f-a428195c03cd', 'Basketball Court', (select id from public.campuses where code = 'CC'), 'Central Campus', null) on conflict (id) do update set name = excluded.name, building = excluded.building, room = excluded.room;
insert into public.venues (id, name, campus_id, building, room) values ('ae68eea1-be3a-5a79-af22-2cbd033928da', 'Block 2 Entrance, Kiosk side', (select id from public.campuses where code = 'CC'), 'Block 2', null) on conflict (id) do update set name = excluded.name, building = excluded.building, room = excluded.room;
insert into public.venues (id, name, campus_id, building, room) values ('7e27b443-ecee-57d2-aca2-4ceb908e801d', 'Classrooms', (select id from public.campuses where code = 'CC'), 'Central Campus', 'Allotted classrooms') on conflict (id) do update set name = excluded.name, building = excluded.building, room = excluded.room;
insert into public.venues (id, name, campus_id, building, room) values ('5278bff5-9a98-5f1b-963e-af32ef3c4bf5', 'KE Auditorium', (select id from public.campuses where code = 'CC'), 'Block 4', null) on conflict (id) do update set name = excluded.name, building = excluded.building, room = excluded.room;
insert into public.venues (id, name, campus_id, building, room) values ('42bde1c3-7b51-5b07-8709-b37169cef28e', 'Garden Street', (select id from public.campuses where code = 'CC'), 'Central Campus', null) on conflict (id) do update set name = excluded.name, building = excluded.building, room = excluded.room;
insert into public.venues (id, name, campus_id, building, room) values ('6d4defd1-c827-5e1e-9826-ef1d5524c98d', 'Campus View', (select id from public.campuses where code = 'CC'), 'Central Block', null) on conflict (id) do update set name = excluded.name, building = excluded.building, room = excluded.room;
insert into public.venues (id, name, campus_id, building, room) values ('b9fb265b-388c-5482-b1df-68570c9c026a', 'Online submission', (select id from public.campuses where code = 'CC'), null, null) on conflict (id) do update set name = excluded.name, building = excluded.building, room = excluded.room;

-- Events. Admin-owned fields (registration_closed, whatsapp_group_url, status) are kept on re-run.
insert into public.events (id, title, slug, category_id, description, rules_markdown, event_format, min_team_size, max_team_size, registration_opens_at, registration_closes_at, waitlist_enabled, cancellation_allowed, status, registration_enabled, points, finals_rule) values ('ea6a5026-6cf3-5a78-991f-357ea72a7ae8', 'SWO Inauguration', 'swo-inauguration', (select id from public.event_categories where slug = 'special-events'), 'University-wide opening of Blossoms 2026-27 by the Student Welfare Office.', '1. Timing and venue will be announced by the Student Welfare Office.', 'individual', null, null, null, null, false, true, 'published', false, null, null) on conflict (id) do update set title = excluded.title, slug = excluded.slug, category_id = excluded.category_id, description = excluded.description, rules_markdown = excluded.rules_markdown, event_format = excluded.event_format, min_team_size = excluded.min_team_size, max_team_size = excluded.max_team_size, registration_opens_at = excluded.registration_opens_at, registration_closes_at = excluded.registration_closes_at, registration_enabled = excluded.registration_enabled, points = excluded.points, finals_rule = excluded.finals_rule, updated_at = now();
insert into public.events (id, title, slug, category_id, description, rules_markdown, event_format, min_team_size, max_team_size, registration_opens_at, registration_closes_at, waitlist_enabled, cancellation_allowed, status, registration_enabled, points, finals_rule) values ('5c4d293a-502c-5439-95c5-142d6ea52f0e', 'DOC Inauguration', 'doc-inauguration', (select id from public.event_categories where slug = 'special-events'), 'The Department of Commerce opens its Blossoms season at Birds Park.', '1. Open to all Department of Commerce students.', 'individual', null, null, null, null, false, true, 'published', false, null, null) on conflict (id) do update set title = excluded.title, slug = excluded.slug, category_id = excluded.category_id, description = excluded.description, rules_markdown = excluded.rules_markdown, event_format = excluded.event_format, min_team_size = excluded.min_team_size, max_team_size = excluded.max_team_size, registration_opens_at = excluded.registration_opens_at, registration_closes_at = excluded.registration_closes_at, registration_enabled = excluded.registration_enabled, points = excluded.points, finals_rule = excluded.finals_rule, updated_at = now();
insert into public.events (id, title, slug, category_id, description, rules_markdown, event_format, min_team_size, max_team_size, registration_opens_at, registration_closes_at, waitlist_enabled, cancellation_allowed, status, registration_enabled, points, finals_rule) values ('abb4d1ac-682f-52ed-b80e-f8ebbbce5c3e', 'Digital Poster Making', 'digital-poster-making', (select id from public.event_categories where slug = 'arts'), 'Design an original A4 portrait poster on a theme given on the spot, in any school-taught design software.', '1. Individual event. Theme given on the spot. Duration: 2 hours.
2. Any software taught in schools may be used (Photoshop, Canva, Paint, PowerPoint, etc.).
3. Poster size A4 (8.27 x 11.69 in), portrait.
4. Original work only; avoid copyrighted elements. AI tools are not allowed.
5. Prelims are done in a classroom under teacher supervision; both the working file and the final file are collected.
6. Prelim date, time, venue and theme are set by the deanery.
7. For prelims, materials are brought by students or provided by the deanery; for the finals, the Student Welfare Office provides them.
8. The judges'' and organising committee''s decision is final.
9. Finals: First and second place from the prelims go to the finals in January 2027.', 'individual', null, null, '2026-11-04T00:00:00+05:30', '2026-11-29T09:00:00+05:30', false, true, 'published', true, 7, 'First and second place from the prelims go to the finals in January 2027.') on conflict (id) do update set title = excluded.title, slug = excluded.slug, category_id = excluded.category_id, description = excluded.description, rules_markdown = excluded.rules_markdown, event_format = excluded.event_format, min_team_size = excluded.min_team_size, max_team_size = excluded.max_team_size, registration_opens_at = excluded.registration_opens_at, registration_closes_at = excluded.registration_closes_at, registration_enabled = excluded.registration_enabled, points = excluded.points, finals_rule = excluded.finals_rule, updated_at = now();
insert into public.events (id, title, slug, category_id, description, rules_markdown, event_format, min_team_size, max_team_size, registration_opens_at, registration_closes_at, waitlist_enabled, cancellation_allowed, status, registration_enabled, points, finals_rule) values ('84c6f5f5-3b24-5617-9f63-5e4a4f6bac16', 'Greeting Card', 'greeting-card', (select id from public.event_categories where slug = 'arts'), 'Make a handmade greeting card on a theme announced on the spot.', '1. Individual event. Theme given on the spot. Duration: 2 hours.
2. Bring your own stationery. White cardboard sheets are provided only in the finals.
3. Prelim date, time, venue and theme are set by the deanery.
4. For prelims, materials are brought by students or provided by the deanery; for the finals, the Student Welfare Office provides them.
5. The judges'' and organising committee''s decision is final.
6. Finals: First and second place from the prelims go to the finals in January 2027.', 'individual', null, null, '2026-11-04T00:00:00+05:30', '2026-11-25T12:45:00+05:30', false, true, 'published', true, 7, 'First and second place from the prelims go to the finals in January 2027.') on conflict (id) do update set title = excluded.title, slug = excluded.slug, category_id = excluded.category_id, description = excluded.description, rules_markdown = excluded.rules_markdown, event_format = excluded.event_format, min_team_size = excluded.min_team_size, max_team_size = excluded.max_team_size, registration_opens_at = excluded.registration_opens_at, registration_closes_at = excluded.registration_closes_at, registration_enabled = excluded.registration_enabled, points = excluded.points, finals_rule = excluded.finals_rule, updated_at = now();
insert into public.events (id, title, slug, category_id, description, rules_markdown, event_format, min_team_size, max_team_size, registration_opens_at, registration_closes_at, waitlist_enabled, cancellation_allowed, status, registration_enabled, points, finals_rule) values ('a2e26e6e-6a36-5485-be7a-088edaf2b078', 'Mixed Media Pot', 'pot-art', (select id from public.event_categories where slug = 'arts'), 'Decorate a pot in mixed media on a theme given on the spot.', '1. Individual event. Theme given on the spot. Duration: 2 hours.
2. Glitter, mirror pieces, plaster of Paris, chalk powder, hammers, chisels and other sharp tools are not allowed.
3. Prelim date, time, venue and theme are set by the deanery.
4. For prelims, materials are brought by students or provided by the deanery; for the finals, the Student Welfare Office provides them.
5. The judges'' and organising committee''s decision is final.
6. Finals: First and second place from the prelims go to the finals in January 2027.', 'individual', null, null, '2026-11-04T00:00:00+05:30', '2026-11-18T15:45:00+05:30', false, true, 'published', true, 7, 'First and second place from the prelims go to the finals in January 2027.') on conflict (id) do update set title = excluded.title, slug = excluded.slug, category_id = excluded.category_id, description = excluded.description, rules_markdown = excluded.rules_markdown, event_format = excluded.event_format, min_team_size = excluded.min_team_size, max_team_size = excluded.max_team_size, registration_opens_at = excluded.registration_opens_at, registration_closes_at = excluded.registration_closes_at, registration_enabled = excluded.registration_enabled, points = excluded.points, finals_rule = excluded.finals_rule, updated_at = now();
insert into public.events (id, title, slug, category_id, description, rules_markdown, event_format, min_team_size, max_team_size, registration_opens_at, registration_closes_at, waitlist_enabled, cancellation_allowed, status, registration_enabled, points, finals_rule) values ('8ab1c1cc-20f0-5ced-8dd4-a2c6c82816e5', 'Pencil Sketching', 'pencil-sketching', (select id from public.event_categories where slug = 'arts'), 'Sketch to a prompt using only pencil and charcoal.', '1. Individual event. A prompt is given for both prelims and finals. Duration: 2 hours.
2. Only pencils, charcoal and erasers. No colour media (markers, paints).
3. Bring your own sketching supplies; sketching paper is provided in the finals.
4. Prelim date, time, venue and theme are set by the deanery.
5. For prelims, materials are brought by students or provided by the deanery; for the finals, the Student Welfare Office provides them.
6. The judges'' and organising committee''s decision is final.
7. Finals: First and second place from the prelims go to the finals in January 2027.', 'individual', null, null, '2026-11-04T00:00:00+05:30', '2026-12-03T09:00:00+05:30', false, true, 'published', true, 7, 'First and second place from the prelims go to the finals in January 2027.') on conflict (id) do update set title = excluded.title, slug = excluded.slug, category_id = excluded.category_id, description = excluded.description, rules_markdown = excluded.rules_markdown, event_format = excluded.event_format, min_team_size = excluded.min_team_size, max_team_size = excluded.max_team_size, registration_opens_at = excluded.registration_opens_at, registration_closes_at = excluded.registration_closes_at, registration_enabled = excluded.registration_enabled, points = excluded.points, finals_rule = excluded.finals_rule, updated_at = now();
insert into public.events (id, title, slug, category_id, description, rules_markdown, event_format, min_team_size, max_team_size, registration_opens_at, registration_closes_at, waitlist_enabled, cancellation_allowed, status, registration_enabled, points, finals_rule) values ('eecbfa21-cb19-5392-931f-1eab034c0d27', 'Reel Making', 'reel-making', (select id from public.event_categories where slug = 'arts'), 'Shoot and edit a 60 to 90 second reel on campus, on a topic released a day before.', '1. Individual event. Topic given 1 day before the event.
2. Reel length 60-90 seconds. Mobile phones only, basic editing; voice-overs with BGM allowed.
3. No VFX, no stock footage. Shoot only inside the campus.
4. Explicit, vulgar or plagiarised work is rejected.
5. Prelim date, time, venue and theme are set by the deanery.
6. For prelims, materials are brought by students or provided by the deanery; for the finals, the Student Welfare Office provides them.
7. The judges'' and organising committee''s decision is final.
8. Finals: First and second place from the prelims go to the finals in January 2027.', 'individual', null, null, '2026-11-04T00:00:00+05:30', '2026-12-11T09:00:00+05:30', false, true, 'published', true, 7, 'First and second place from the prelims go to the finals in January 2027.') on conflict (id) do update set title = excluded.title, slug = excluded.slug, category_id = excluded.category_id, description = excluded.description, rules_markdown = excluded.rules_markdown, event_format = excluded.event_format, min_team_size = excluded.min_team_size, max_team_size = excluded.max_team_size, registration_opens_at = excluded.registration_opens_at, registration_closes_at = excluded.registration_closes_at, registration_enabled = excluded.registration_enabled, points = excluded.points, finals_rule = excluded.finals_rule, updated_at = now();
insert into public.events (id, title, slug, category_id, description, rules_markdown, event_format, min_team_size, max_team_size, registration_opens_at, registration_closes_at, waitlist_enabled, cancellation_allowed, status, registration_enabled, points, finals_rule) values ('38aae608-c2fe-53e8-b960-39069cfae559', 'Collage', 'collage', (select id from public.event_categories where slug = 'arts'), 'Teams of four build a collage on a theme given on the spot.', '1. Team of exactly 4. Theme given on the spot. Time limit: 2 hours.
2. No mobile phones or internet during the competition.
3. Bring paper, magazines, glue, scissors and colours; chart paper is provided in the finals.
4. Prelim date, time, venue and theme are set by the deanery.
5. For prelims, materials are brought by students or provided by the deanery; for the finals, the Student Welfare Office provides them.
6. The judges'' and organising committee''s decision is final.
7. Finals: First and second place from the prelims go to the finals in January 2027.', 'team', 4, 4, '2026-11-04T00:00:00+05:30', '2026-12-12T15:45:00+05:30', false, true, 'published', true, 7, 'First and second place from the prelims go to the finals in January 2027.') on conflict (id) do update set title = excluded.title, slug = excluded.slug, category_id = excluded.category_id, description = excluded.description, rules_markdown = excluded.rules_markdown, event_format = excluded.event_format, min_team_size = excluded.min_team_size, max_team_size = excluded.max_team_size, registration_opens_at = excluded.registration_opens_at, registration_closes_at = excluded.registration_closes_at, registration_enabled = excluded.registration_enabled, points = excluded.points, finals_rule = excluded.finals_rule, updated_at = now();
insert into public.events (id, title, slug, category_id, description, rules_markdown, event_format, min_team_size, max_team_size, registration_opens_at, registration_closes_at, waitlist_enabled, cancellation_allowed, status, registration_enabled, points, finals_rule) values ('582ebbce-b06d-542c-b912-85f8a183ac1e', 'Mehendi Design', 'mehendi-design', (select id from public.event_categories where slug = 'arts'), 'Solo mehendi on a model you bring, covering one hand to the elbow.', '1. Solo event; bring your own subject/model.
2. Design covers one hand up to the elbow, on both sides of the palm.
3. Time: 2 hours, no extra time. Judged on overall look, creativity and design.
4. On-the-spot registrations are also accepted.
5. Prelim date, time, venue and theme are set by the deanery.
6. For prelims, materials are brought by students or provided by the deanery; for the finals, the Student Welfare Office provides them.
7. The judges'' and organising committee''s decision is final.
8. Finals: First and second place from the prelims go to the finals in January 2027.', 'individual', null, null, '2026-11-04T00:00:00+05:30', '2026-11-20T12:45:00+05:30', false, true, 'published', true, 7, 'First and second place from the prelims go to the finals in January 2027.') on conflict (id) do update set title = excluded.title, slug = excluded.slug, category_id = excluded.category_id, description = excluded.description, rules_markdown = excluded.rules_markdown, event_format = excluded.event_format, min_team_size = excluded.min_team_size, max_team_size = excluded.max_team_size, registration_opens_at = excluded.registration_opens_at, registration_closes_at = excluded.registration_closes_at, registration_enabled = excluded.registration_enabled, points = excluded.points, finals_rule = excluded.finals_rule, updated_at = now();
insert into public.events (id, title, slug, category_id, description, rules_markdown, event_format, min_team_size, max_team_size, registration_opens_at, registration_closes_at, waitlist_enabled, cancellation_allowed, status, registration_enabled, points, finals_rule) values ('5e1986a4-a4d2-58a6-a1c3-ed9a5d5c97a5', 'Rangoli Design', 'rangoli-design', (select id from public.event_categories where slug = 'arts'), 'Teams of four create a rangoli on a theme given on the spot.', '1. Team of exactly 4. Theme given on the spot. Time limit: 2 hours.
2. Bring your own colours; only natural or traditional rangoli colours, no synthetic colours.
3. No pre-drawn outlines, stencils, adhesives, lights, stickers or objects unless specified.
4. Each team gets an assigned area and must keep it clean.
5. Prelim date, time, venue and theme are set by the deanery.
6. For prelims, materials are brought by students or provided by the deanery; for the finals, the Student Welfare Office provides them.
7. The judges'' and organising committee''s decision is final.
8. Finals: First and second place from the prelims go to the finals in January 2027.', 'team', 4, 4, '2026-11-04T00:00:00+05:30', '2026-11-19T12:45:00+05:30', false, true, 'published', true, 7, 'First and second place from the prelims go to the finals in January 2027.') on conflict (id) do update set title = excluded.title, slug = excluded.slug, category_id = excluded.category_id, description = excluded.description, rules_markdown = excluded.rules_markdown, event_format = excluded.event_format, min_team_size = excluded.min_team_size, max_team_size = excluded.max_team_size, registration_opens_at = excluded.registration_opens_at, registration_closes_at = excluded.registration_closes_at, registration_enabled = excluded.registration_enabled, points = excluded.points, finals_rule = excluded.finals_rule, updated_at = now();
insert into public.events (id, title, slug, category_id, description, rules_markdown, event_format, min_team_size, max_team_size, registration_opens_at, registration_closes_at, waitlist_enabled, cancellation_allowed, status, registration_enabled, points, finals_rule) values ('ff0d1554-01f8-568c-9821-575c509a248b', 'Painting', 'painting', (select id from public.event_categories where slug = 'arts'), 'Paint an original piece on a theme given on the spot, in any paint.', '1. Individual event. Theme given on the spot. Duration: 2 hours. Any paint is allowed.
2. The painting must be original and unpublished.
3. Bring your own water bottle, painting materials and a rough cloth.
4. Prelim date, time, venue and theme are set by the deanery.
5. For prelims, materials are brought by students or provided by the deanery; for the finals, the Student Welfare Office provides them.
6. The judges'' and organising committee''s decision is final.
7. Finals: First and second place from the prelims go to the finals in January 2027.', 'individual', null, null, '2026-11-04T00:00:00+05:30', '2026-12-10T12:45:00+05:30', false, true, 'published', true, 7, 'First and second place from the prelims go to the finals in January 2027.') on conflict (id) do update set title = excluded.title, slug = excluded.slug, category_id = excluded.category_id, description = excluded.description, rules_markdown = excluded.rules_markdown, event_format = excluded.event_format, min_team_size = excluded.min_team_size, max_team_size = excluded.max_team_size, registration_opens_at = excluded.registration_opens_at, registration_closes_at = excluded.registration_closes_at, registration_enabled = excluded.registration_enabled, points = excluded.points, finals_rule = excluded.finals_rule, updated_at = now();
insert into public.events (id, title, slug, category_id, description, rules_markdown, event_format, min_team_size, max_team_size, registration_opens_at, registration_closes_at, waitlist_enabled, cancellation_allowed, status, registration_enabled, points, finals_rule) values ('74e9abc3-b81f-53b5-b3fc-d1bda3fbcf98', 'Photography', 'photography', (select id from public.event_categories where slug = 'arts'), 'Submit two photographs on a theme announced the day before.', '1. Individual event. Theme announced 1 day before; submit 2 photos in JPEG.
2. Basic cropping and colour correction only; edits that change the photo disqualify it.
3. Show the original photo on your phone when you submit.
4. The rules allow mobile phone photos only (the schedule lists this as Photography (DSLR); check with the event heads).
5. Prelim date, time, venue and theme are set by the deanery.
6. For prelims, materials are brought by students or provided by the deanery; for the finals, the Student Welfare Office provides them.
7. The judges'' and organising committee''s decision is final.
8. Finals: First and second place from the prelims go to the finals in January 2027.', 'individual', null, null, '2026-11-04T00:00:00+05:30', '2026-12-06T09:00:00+05:30', false, true, 'published', true, 7, 'First and second place from the prelims go to the finals in January 2027.') on conflict (id) do update set title = excluded.title, slug = excluded.slug, category_id = excluded.category_id, description = excluded.description, rules_markdown = excluded.rules_markdown, event_format = excluded.event_format, min_team_size = excluded.min_team_size, max_team_size = excluded.max_team_size, registration_opens_at = excluded.registration_opens_at, registration_closes_at = excluded.registration_closes_at, registration_enabled = excluded.registration_enabled, points = excluded.points, finals_rule = excluded.finals_rule, updated_at = now();
insert into public.events (id, title, slug, category_id, description, rules_markdown, event_format, min_team_size, max_team_size, registration_opens_at, registration_closes_at, waitlist_enabled, cancellation_allowed, status, registration_enabled, points, finals_rule) values ('7aac15fc-5ea6-5052-89bd-046741c43ce7', 'Quiz', 'quiz', (select id from public.event_categories where slug = 'literature'), 'Teams of three take on multiple-choice, true/false and specific-answer rounds.', '1. Team entries only, 3 members. No replacements after registration.
2. The school decides the number of prelim rounds; the quizmaster''s decision is final.
3. No mobiles or electronic devices during the quiz.
4. Prelim date, time and venue are set by the school; topics are prepared by the deanery.
5. Students are not used as judges. The judges'' and organising committee''s decision is final.
6. Finals: First and second place from the prelims go to the finals in January 2027.', 'team', 3, 3, '2026-11-04T00:00:00+05:30', '2026-11-21T12:45:00+05:30', false, true, 'published', true, 7.5, 'First and second place from the prelims go to the finals in January 2027.') on conflict (id) do update set title = excluded.title, slug = excluded.slug, category_id = excluded.category_id, description = excluded.description, rules_markdown = excluded.rules_markdown, event_format = excluded.event_format, min_team_size = excluded.min_team_size, max_team_size = excluded.max_team_size, registration_opens_at = excluded.registration_opens_at, registration_closes_at = excluded.registration_closes_at, registration_enabled = excluded.registration_enabled, points = excluded.points, finals_rule = excluded.finals_rule, updated_at = now();
insert into public.events (id, title, slug, category_id, description, rules_markdown, event_format, min_team_size, max_team_size, registration_opens_at, registration_closes_at, waitlist_enabled, cancellation_allowed, status, registration_enabled, points, finals_rule) values ('15b0627d-39eb-54ff-83eb-3ac27d4f008f', 'Pot Pourri', 'pot-pourri', (select id from public.event_categories where slug = 'literature'), 'Teams of three play several literary rounds: quizzes, spell bee, crosswords, heads up and more.', '1. 3 members per team; on-the-spot team making is allowed.
2. Multiple rounds of different literary activities.
3. Scoring is cumulative or by elimination, at the judges'' discretion; marks for accuracy, creativity, speed and following the task.
4. Prelim date, time and venue are set by the school; topics are prepared by the deanery.
5. Students are not used as judges. The judges'' and organising committee''s decision is final.
6. Finals: First and second place from the prelims go to the finals in January 2027.', 'team', 3, 3, '2026-11-04T00:00:00+05:30', '2026-11-17T12:45:00+05:30', false, true, 'published', true, 7.5, 'First and second place from the prelims go to the finals in January 2027.') on conflict (id) do update set title = excluded.title, slug = excluded.slug, category_id = excluded.category_id, description = excluded.description, rules_markdown = excluded.rules_markdown, event_format = excluded.event_format, min_team_size = excluded.min_team_size, max_team_size = excluded.max_team_size, registration_opens_at = excluded.registration_opens_at, registration_closes_at = excluded.registration_closes_at, registration_enabled = excluded.registration_enabled, points = excluded.points, finals_rule = excluded.finals_rule, updated_at = now();
insert into public.events (id, title, slug, category_id, description, rules_markdown, event_format, min_team_size, max_team_size, registration_opens_at, registration_closes_at, waitlist_enabled, cancellation_allowed, status, registration_enabled, points, finals_rule) values ('3c411c2e-5273-515c-a15d-2d3c9d4e1c81', 'Extempore', 'extempore', (select id from public.event_categories where slug = 'literature'), 'Get a topic on the spot, think for a minute, then speak.', '1. Individual event. Topic given on the spot with 1 minute to prepare. No writing.
2. Marks for content, fluency, relevance, style and humour.
3. Prelim date, time and venue are set by the school; topics are prepared by the deanery.
4. Students are not used as judges. The judges'' and organising committee''s decision is final.
5. Finals: First and second place from the prelims go to the finals in January 2027.', 'individual', null, null, '2026-11-04T00:00:00+05:30', '2026-12-04T12:45:00+05:30', false, true, 'published', true, 7.5, 'First and second place from the prelims go to the finals in January 2027.') on conflict (id) do update set title = excluded.title, slug = excluded.slug, category_id = excluded.category_id, description = excluded.description, rules_markdown = excluded.rules_markdown, event_format = excluded.event_format, min_team_size = excluded.min_team_size, max_team_size = excluded.max_team_size, registration_opens_at = excluded.registration_opens_at, registration_closes_at = excluded.registration_closes_at, registration_enabled = excluded.registration_enabled, points = excluded.points, finals_rule = excluded.finals_rule, updated_at = now();
insert into public.events (id, title, slug, category_id, description, rules_markdown, event_format, min_team_size, max_team_size, registration_opens_at, registration_closes_at, waitlist_enabled, cancellation_allowed, status, registration_enabled, points, finals_rule) values ('70ac9b63-9ca1-5a3b-838c-ffd62abeebb4', 'Dumb Charades', 'dumb-charades', (select id from public.event_categories where slug = 'literature'), 'Teams of three act out movies, songs, phrases and situations without words.', '1. 3 members per team: 1 guesses and 2 act, as the team chooses.
2. No spelling, rhyming, splitting or codes.
3. Prompts can be movies, characters, songs, phrases, situations and more.
4. Prelim date, time and venue are set by the school; topics are prepared by the deanery.
5. Students are not used as judges. The judges'' and organising committee''s decision is final.
6. Finals: First and second place from the prelims go to the finals in January 2027.', 'team', 3, 3, '2026-11-04T00:00:00+05:30', '2026-12-02T09:00:00+05:30', false, true, 'published', true, 7.5, 'First and second place from the prelims go to the finals in January 2027.') on conflict (id) do update set title = excluded.title, slug = excluded.slug, category_id = excluded.category_id, description = excluded.description, rules_markdown = excluded.rules_markdown, event_format = excluded.event_format, min_team_size = excluded.min_team_size, max_team_size = excluded.max_team_size, registration_opens_at = excluded.registration_opens_at, registration_closes_at = excluded.registration_closes_at, registration_enabled = excluded.registration_enabled, points = excluded.points, finals_rule = excluded.finals_rule, updated_at = now();
insert into public.events (id, title, slug, category_id, description, rules_markdown, event_format, min_team_size, max_team_size, registration_opens_at, registration_closes_at, waitlist_enabled, cancellation_allowed, status, registration_enabled, points, finals_rule) values ('02369e6f-8aa9-5f51-8d58-96c2e665ea23', 'Air Crash/Ship-Wreck', 'air-crash-shipwreck', (select id from public.event_categories where slug = 'literature'), 'Play a random character and convince the captain you deserve the last life jacket.', '1. Individual event. Characters are assigned at random; the judge is the captain.
2. 1 minute to prepare. No writing, no phones.
3. 1 minute to make your case and 1 minute to answer the captain''s questions.
4. Prelim date, time and venue are set by the school; topics are prepared by the deanery.
5. Students are not used as judges. The judges'' and organising committee''s decision is final.
6. Finals: First and second place from the prelims go to the finals in January 2027.', 'individual', null, null, '2026-11-04T00:00:00+05:30', '2026-11-14T12:45:00+05:30', false, true, 'published', true, 7.5, 'First and second place from the prelims go to the finals in January 2027.') on conflict (id) do update set title = excluded.title, slug = excluded.slug, category_id = excluded.category_id, description = excluded.description, rules_markdown = excluded.rules_markdown, event_format = excluded.event_format, min_team_size = excluded.min_team_size, max_team_size = excluded.max_team_size, registration_opens_at = excluded.registration_opens_at, registration_closes_at = excluded.registration_closes_at, registration_enabled = excluded.registration_enabled, points = excluded.points, finals_rule = excluded.finals_rule, updated_at = now();
insert into public.events (id, title, slug, category_id, description, rules_markdown, event_format, min_team_size, max_team_size, registration_opens_at, registration_closes_at, waitlist_enabled, cancellation_allowed, status, registration_enabled, points, finals_rule) values ('d18c982f-311a-5367-b90d-0b9056c0cbcc', 'Debate', 'debate', (select id from public.event_categories where slug = 'literature'), 'Non-parliamentary debate on a motion announced the day before.', '1. Individual event. Topics announced a day before the prelims.
2. 4 minutes speaking + 1 minute rebuttal. Be ready to argue for or against.
3. Use of notes is at the judges'' discretion. Marks for content, fluency, delivery and rebuttal.
4. Prelim date, time and venue are set by the school; topics are prepared by the deanery.
5. Students are not used as judges. The judges'' and organising committee''s decision is final.
6. Finals: First and second place from the prelims go to the finals in January 2027.', 'individual', null, null, '2026-11-04T00:00:00+05:30', '2026-11-16T12:45:00+05:30', false, true, 'published', true, 7.5, 'First and second place from the prelims go to the finals in January 2027.') on conflict (id) do update set title = excluded.title, slug = excluded.slug, category_id = excluded.category_id, description = excluded.description, rules_markdown = excluded.rules_markdown, event_format = excluded.event_format, min_team_size = excluded.min_team_size, max_team_size = excluded.max_team_size, registration_opens_at = excluded.registration_opens_at, registration_closes_at = excluded.registration_closes_at, registration_enabled = excluded.registration_enabled, points = excluded.points, finals_rule = excluded.finals_rule, updated_at = now();
insert into public.events (id, title, slug, category_id, description, rules_markdown, event_format, min_team_size, max_team_size, registration_opens_at, registration_closes_at, waitlist_enabled, cancellation_allowed, status, registration_enabled, points, finals_rule) values ('dc275cf5-6f0b-534e-b306-0c811a89578f', 'JAM', 'jam', (select id from public.event_categories where slug = 'literature'), 'Speak for a minute on the JAM Master''s topic without hesitating, repeating or deviating.', '1. Individual event in elimination rounds; topics given on the spot by the JAM Master.
2. Standard JAM rules: late start, jumping the gun, hesitation, repetition, deviation, grammar.
3. British English only: no slang, Americanisms, abbreviations or SMS lingo.
4. Marks for seconds spoken, relevance, clarity, humour and presence of mind.
5. Prelim date, time and venue are set by the school; topics are prepared by the deanery.
6. Students are not used as judges. The judges'' and organising committee''s decision is final.
7. Finals: First and second place from the prelims go to the finals in January 2027.', 'individual', null, null, '2026-11-04T00:00:00+05:30', '2026-11-26T12:45:00+05:30', false, true, 'published', true, 7.5, 'First and second place from the prelims go to the finals in January 2027.') on conflict (id) do update set title = excluded.title, slug = excluded.slug, category_id = excluded.category_id, description = excluded.description, rules_markdown = excluded.rules_markdown, event_format = excluded.event_format, min_team_size = excluded.min_team_size, max_team_size = excluded.max_team_size, registration_opens_at = excluded.registration_opens_at, registration_closes_at = excluded.registration_closes_at, registration_enabled = excluded.registration_enabled, points = excluded.points, finals_rule = excluded.finals_rule, updated_at = now();
insert into public.events (id, title, slug, category_id, description, rules_markdown, event_format, min_team_size, max_team_size, registration_opens_at, registration_closes_at, waitlist_enabled, cancellation_allowed, status, registration_enabled, points, finals_rule) values ('f9f6513f-21d6-5557-9d0b-34270b1874a2', 'Creative Writing', 'creative-writing', (select id from public.event_categories where slug = 'literature'), 'Handwritten poetry, essay or short story, written on the spot in English.', '1. Individual event. English only, handwritten on A4 sheets provided by the school.
2. Poetry: 1 hour, at most 2 pages, theme on the spot.
3. Essay: 1 hour, 1000-1500 words, topic on the spot.
4. Short story: 30 minutes, 500-750 words, from a picture prompt.
5. No vulgar or inappropriate language.
6. Prelim date, time and venue are set by the school; topics are prepared by the deanery.
7. Students are not used as judges. The judges'' and organising committee''s decision is final.
8. Finals: First and second place from the prelims go to the finals in January 2027.', 'individual', null, null, '2026-11-04T00:00:00+05:30', '2026-12-11T09:00:00+05:30', false, true, 'published', true, 7.5, 'First and second place from the prelims go to the finals in January 2027.') on conflict (id) do update set title = excluded.title, slug = excluded.slug, category_id = excluded.category_id, description = excluded.description, rules_markdown = excluded.rules_markdown, event_format = excluded.event_format, min_team_size = excluded.min_team_size, max_team_size = excluded.max_team_size, registration_opens_at = excluded.registration_opens_at, registration_closes_at = excluded.registration_closes_at, registration_enabled = excluded.registration_enabled, points = excluded.points, finals_rule = excluded.finals_rule, updated_at = now();
insert into public.events (id, title, slug, category_id, description, rules_markdown, event_format, min_team_size, max_team_size, registration_opens_at, registration_closes_at, waitlist_enabled, cancellation_allowed, status, registration_enabled, points, finals_rule) values ('5cdbb69e-5343-5b39-9d00-4752fe9764e0', 'Impulse Solo Dance', 'impulse', (select id from public.event_categories where slug = 'stage'), 'A prepared solo dance in any style, up to 3 minutes.', '1. Solo performance prepared in advance; choose your own song and style. Time limit: 3 minutes.
2. Submit your audio track to the organising committee before the deadline.
3. Props only with prior approval. Nothing that damages the stage or is unsafe.
4. Judged on technique, choreography, musicality, expression and stage presence.
5. Finals: The top 3 qualify for the Inter-Deanery finals.', 'individual', null, null, '2026-11-04T00:00:00+05:30', '2026-11-23T15:45:00+05:30', false, true, 'published', true, 10, 'The top 3 qualify for the Inter-Deanery finals.') on conflict (id) do update set title = excluded.title, slug = excluded.slug, category_id = excluded.category_id, description = excluded.description, rules_markdown = excluded.rules_markdown, event_format = excluded.event_format, min_team_size = excluded.min_team_size, max_team_size = excluded.max_team_size, registration_opens_at = excluded.registration_opens_at, registration_closes_at = excluded.registration_closes_at, registration_enabled = excluded.registration_enabled, points = excluded.points, finals_rule = excluded.finals_rule, updated_at = now();
insert into public.events (id, title, slug, category_id, description, rules_markdown, event_format, min_team_size, max_team_size, registration_opens_at, registration_closes_at, waitlist_enabled, cancellation_allowed, status, registration_enabled, points, finals_rule) values ('c7fb51ec-9783-5738-b100-07f3f605ce09', 'Indian Dance Classical Group', 'indian-dance-classical-group', (select id from public.event_categories where slug = 'stage'), 'Group classical dance to authentic classical music, 6 + 1 minutes on stage.', '1. Teams of 4 to 8. Duration: 6 + 1 minutes on stage.
2. No live music. Authentic Indian classical songs in any language; no film classical music.
3. Authentic costumes, hairstyles and jewellery for the dance form.
4. Finals: Deaneries with more than 5 teams send 3 finalists; 3-5 teams send 2; fewer than 3 send 1.', 'team', 4, 8, '2026-11-04T00:00:00+05:30', '2026-11-30T15:45:00+05:30', false, true, 'published', true, 10, 'Deaneries with more than 5 teams send 3 finalists; 3-5 teams send 2; fewer than 3 send 1.') on conflict (id) do update set title = excluded.title, slug = excluded.slug, category_id = excluded.category_id, description = excluded.description, rules_markdown = excluded.rules_markdown, event_format = excluded.event_format, min_team_size = excluded.min_team_size, max_team_size = excluded.max_team_size, registration_opens_at = excluded.registration_opens_at, registration_closes_at = excluded.registration_closes_at, registration_enabled = excluded.registration_enabled, points = excluded.points, finals_rule = excluded.finals_rule, updated_at = now();
insert into public.events (id, title, slug, category_id, description, rules_markdown, event_format, min_team_size, max_team_size, registration_opens_at, registration_closes_at, waitlist_enabled, cancellation_allowed, status, registration_enabled, points, finals_rule) values ('bcbbd134-4740-51e9-b61f-60a14d03c44a', 'Non Theme', 'non-theme', (select id from public.event_categories where slug = 'stage'), 'Indian film or folk group dance, 5 + 1 minutes on stage.', '1. Teams of 8 to 15. Duration: 5 + 1 minutes on stage.
2. Indian film songs with lyrics only: no fusion, remixes or album songs.
3. Only Indian dance forms (including Bollywood and contemporary). Minimal props.
4. No fire on stage; no vulgarity in costume, movement or lyrics. No ties in prelims.
5. Finals: Deaneries with more than 5 teams send 3 finalists; 3-5 teams send 2; fewer than 3 send 1.', 'team', 8, 15, '2026-11-04T00:00:00+05:30', '2026-12-07T15:45:00+05:30', false, true, 'published', true, 10, 'Deaneries with more than 5 teams send 3 finalists; 3-5 teams send 2; fewer than 3 send 1.') on conflict (id) do update set title = excluded.title, slug = excluded.slug, category_id = excluded.category_id, description = excluded.description, rules_markdown = excluded.rules_markdown, event_format = excluded.event_format, min_team_size = excluded.min_team_size, max_team_size = excluded.max_team_size, registration_opens_at = excluded.registration_opens_at, registration_closes_at = excluded.registration_closes_at, registration_enabled = excluded.registration_enabled, points = excluded.points, finals_rule = excluded.finals_rule, updated_at = now();
insert into public.events (id, title, slug, category_id, description, rules_markdown, event_format, min_team_size, max_team_size, registration_opens_at, registration_closes_at, waitlist_enabled, cancellation_allowed, status, registration_enabled, points, finals_rule) values ('4fa91a9b-0b64-5d01-9c12-5fb366b338f2', 'Battle of Bands (Western Electric Group)', 'bob-w', (select id from public.event_categories where slug = 'stage'), 'Western electric bands, 10 + 2 minutes including setup.', '1. 5 to 10 members, with 1 to 3 vocalists. Duration: 10 + 2 minutes including setup and clearance.
2. No backing tracks, samples or sequences. No growling.
3. Submit English lyrics for original compositions at registration.
4. The same members must perform in prelims and finals.', 'team', 5, 10, '2026-11-04T00:00:00+05:30', '2026-12-09T15:45:00+05:30', false, true, 'published', true, 10, null) on conflict (id) do update set title = excluded.title, slug = excluded.slug, category_id = excluded.category_id, description = excluded.description, rules_markdown = excluded.rules_markdown, event_format = excluded.event_format, min_team_size = excluded.min_team_size, max_team_size = excluded.max_team_size, registration_opens_at = excluded.registration_opens_at, registration_closes_at = excluded.registration_closes_at, registration_enabled = excluded.registration_enabled, points = excluded.points, finals_rule = excluded.finals_rule, updated_at = now();
insert into public.events (id, title, slug, category_id, description, rules_markdown, event_format, min_team_size, max_team_size, registration_opens_at, registration_closes_at, waitlist_enabled, cancellation_allowed, status, registration_enabled, points, finals_rule) values ('57cfd1ca-bec8-50e6-8fec-16b73b275ab8', 'Battle of Bands (Indian Electric Group)', 'bob-i', (select id from public.event_categories where slug = 'stage'), 'Indian electric bands performing in Indian languages, 10 + 2 minutes.', '1. 5 to 10 members. Duration: 10 + 2 minutes including setup and clearance.
2. Indian languages only, with at least one Indian melodic or percussion instrument.
3. No pre-recorded music or sequenced samples. No growling.
4. Original lyrics need an English translation at registration.
5. The same members must perform in prelims and finals.', 'team', 5, 10, '2026-11-04T00:00:00+05:30', '2026-12-09T15:45:00+05:30', false, true, 'published', true, 10, null) on conflict (id) do update set title = excluded.title, slug = excluded.slug, category_id = excluded.category_id, description = excluded.description, rules_markdown = excluded.rules_markdown, event_format = excluded.event_format, min_team_size = excluded.min_team_size, max_team_size = excluded.max_team_size, registration_opens_at = excluded.registration_opens_at, registration_closes_at = excluded.registration_closes_at, registration_enabled = excluded.registration_enabled, points = excluded.points, finals_rule = excluded.finals_rule, updated_at = now();
insert into public.events (id, title, slug, category_id, description, rules_markdown, event_format, min_team_size, max_team_size, registration_opens_at, registration_closes_at, waitlist_enabled, cancellation_allowed, status, registration_enabled, points, finals_rule) values ('8d552e7a-2ba6-56e2-ad19-34507e688b96', 'Western Acoustic Music Group', 'western-acoustic', (select id from public.event_categories where slug = 'stage'), 'Acoustic groups focused on vocal harmony, 10 + 2 minutes.', '1. 5 to 10 members. Duration: 10 + 2 minutes, entry to exit, including setup.
2. Acoustic instruments only. No backing tracks, samples or sequences.
3. The same members must perform in prelims and finals.', 'team', 5, 10, '2026-11-04T00:00:00+05:30', '2026-12-09T15:45:00+05:30', false, true, 'published', true, 10, null) on conflict (id) do update set title = excluded.title, slug = excluded.slug, category_id = excluded.category_id, description = excluded.description, rules_markdown = excluded.rules_markdown, event_format = excluded.event_format, min_team_size = excluded.min_team_size, max_team_size = excluded.max_team_size, registration_opens_at = excluded.registration_opens_at, registration_closes_at = excluded.registration_closes_at, registration_enabled = excluded.registration_enabled, points = excluded.points, finals_rule = excluded.finals_rule, updated_at = now();
insert into public.events (id, title, slug, category_id, description, rules_markdown, event_format, min_team_size, max_team_size, registration_opens_at, registration_closes_at, waitlist_enabled, cancellation_allowed, status, registration_enabled, points, finals_rule) values ('2e880692-fc50-5a9b-b610-b96c536bf9d8', 'Western Solo Singing', 'western-singing-solo', (select id from public.event_categories where slug = 'stage'), 'Solo western vocals, 4 + 1 minutes.', '1. Duration: 4 + 1 minutes. Keyboard in grand piano tone or acoustic guitar only.
2. Djembe or cajon may be used. No sequenced beats or samples. No inappropriate lyrics.
3. Best Original Composition is awarded separately.
4. Only one accompanist is allowed; singing without an accompanist is fine.
5. Keyboard in grand piano mode only. Karaoke tracks are allowed if submitted in advance and without backing vocals.', 'individual', null, null, '2026-11-04T00:00:00+05:30', '2026-12-14T15:45:00+05:30', false, true, 'published', true, 10, null) on conflict (id) do update set title = excluded.title, slug = excluded.slug, category_id = excluded.category_id, description = excluded.description, rules_markdown = excluded.rules_markdown, event_format = excluded.event_format, min_team_size = excluded.min_team_size, max_team_size = excluded.max_team_size, registration_opens_at = excluded.registration_opens_at, registration_closes_at = excluded.registration_closes_at, registration_enabled = excluded.registration_enabled, points = excluded.points, finals_rule = excluded.finals_rule, updated_at = now();
insert into public.events (id, title, slug, category_id, description, rules_markdown, event_format, min_team_size, max_team_size, registration_opens_at, registration_closes_at, waitlist_enabled, cancellation_allowed, status, registration_enabled, points, finals_rule) values ('a5dbf9fb-6deb-59ac-a402-45b247d5b806', 'Indian Folk and film solo singing', 'indian-folk-film-singing-solo', (select id from public.event_categories where slug = 'stage'), 'Solo Indian folk and film songs, 4 + 1 minutes.', '1. Duration: 4 + 1 minutes. Karaoke allowed without backing vocals.
2. Accompanist on grand piano or acoustic guitar; tabla or mridangam allowed.
3. No sequenced beats or samples. No inappropriate lyrics.
4. Only one accompanist is allowed; singing without an accompanist is fine.
5. Keyboard in grand piano mode only. Karaoke tracks are allowed if submitted in advance and without backing vocals.', 'individual', null, null, '2026-11-04T00:00:00+05:30', '2026-12-14T15:45:00+05:30', false, true, 'published', true, 10, null) on conflict (id) do update set title = excluded.title, slug = excluded.slug, category_id = excluded.category_id, description = excluded.description, rules_markdown = excluded.rules_markdown, event_format = excluded.event_format, min_team_size = excluded.min_team_size, max_team_size = excluded.max_team_size, registration_opens_at = excluded.registration_opens_at, registration_closes_at = excluded.registration_closes_at, registration_enabled = excluded.registration_enabled, points = excluded.points, finals_rule = excluded.finals_rule, updated_at = now();
insert into public.events (id, title, slug, category_id, description, rules_markdown, event_format, min_team_size, max_team_size, registration_opens_at, registration_closes_at, waitlist_enabled, cancellation_allowed, status, registration_enabled, points, finals_rule) values ('68a87ed2-b7a8-5d65-ad3c-94d9322e56fa', 'Indian Duet Dance', 'dance-duet', (select id from public.event_categories where slug = 'stage'), 'Two dancers, Indian film songs, 2 + 1 minutes.', '1. Teams of 2. Duration: 2 + 1 minutes on stage.
2. Indian film songs only; up to 2 songs may be mixed. No western dance forms.
3. No vulgarity; no fire or water on stage. No ties.
4. Finals: First 2 from the prelims go to the finals. Deaneries with more than 5 teams send 3 finalists; 3-5 teams send 2; fewer than 3 send 1.', 'team', 2, 2, '2026-11-04T00:00:00+05:30', '2026-11-24T15:45:00+05:30', false, true, 'published', true, 10, 'First 2 from the prelims go to the finals. Deaneries with more than 5 teams send 3 finalists; 3-5 teams send 2; fewer than 3 send 1.') on conflict (id) do update set title = excluded.title, slug = excluded.slug, category_id = excluded.category_id, description = excluded.description, rules_markdown = excluded.rules_markdown, event_format = excluded.event_format, min_team_size = excluded.min_team_size, max_team_size = excluded.max_team_size, registration_opens_at = excluded.registration_opens_at, registration_closes_at = excluded.registration_closes_at, registration_enabled = excluded.registration_enabled, points = excluded.points, finals_rule = excluded.finals_rule, updated_at = now();
insert into public.events (id, title, slug, category_id, description, rules_markdown, event_format, min_team_size, max_team_size, registration_opens_at, registration_closes_at, waitlist_enabled, cancellation_allowed, status, registration_enabled, points, finals_rule) values ('60644374-0747-58b5-b050-a742464f286f', 'Mono Acting', 'mono-act', (select id from public.event_categories where slug = 'theatre'), 'A self-written solo act or monologue, 3 + 1 minutes.', '1. Duration: 3 + 1 minutes including entry and exit.
2. English only (up to 10% regional language). Self-written and self-directed.
3. Basic props and costumes encouraged. Submit background music to the tech team beforehand.
4. You cannot change the whole act for the finals.
5. Duration, participants and language stay the same between prelims and finals.
6. Scripts are screened by the deanery coordinator for prelims and by the SWO for finals.
7. No targeting of governments, political parties or individuals; no vulgarity; no fire or water on stage.
8. No external or cross-deanery directors, make-up, costume or set designers.
9. Participants and storyline cannot change for the finals without written SWO permission.
10. Finals: 2 winners from the prelims go to the finals.', 'individual', null, null, '2026-11-04T00:00:00+05:30', '2026-11-17T12:45:00+05:30', false, true, 'published', true, 10, '2 winners from the prelims go to the finals.') on conflict (id) do update set title = excluded.title, slug = excluded.slug, category_id = excluded.category_id, description = excluded.description, rules_markdown = excluded.rules_markdown, event_format = excluded.event_format, min_team_size = excluded.min_team_size, max_team_size = excluded.max_team_size, registration_opens_at = excluded.registration_opens_at, registration_closes_at = excluded.registration_closes_at, registration_enabled = excluded.registration_enabled, points = excluded.points, finals_rule = excluded.finals_rule, updated_at = now();
insert into public.events (id, title, slug, category_id, description, rules_markdown, event_format, min_team_size, max_team_size, registration_opens_at, registration_closes_at, waitlist_enabled, cancellation_allowed, status, registration_enabled, points, finals_rule) values ('94541aaf-5612-5467-8c01-70ebd58ff175', 'Proscenium', 'proscenium', (select id from public.event_categories where slug = 'theatre'), 'Stage play in English, Hindi or Kannada, 20 + 5 minutes.', '1. 8 to 25 participants including crew, with at least 6 actors.
2. Duration: 20 + 5 minutes including setup and clearance. Clean the stage after.
3. Language: English, Hindi or Kannada. Originals or credited adaptations.
4. No powdered colours or liquid paints on stage. No external lights.
5. Duration, participants and language stay the same between prelims and finals.
6. Scripts are screened by the deanery coordinator for prelims and by the SWO for finals.
7. No targeting of governments, political parties or individuals; no vulgarity; no fire or water on stage.
8. No external or cross-deanery directors, make-up, costume or set designers.
9. Participants and storyline cannot change for the finals without written SWO permission.
10. Finals: 1-4 teams: 1 team qualifies; 5-7 teams: 2 qualify; 8 or more: 3 qualify. No ties.', 'team', 8, 25, '2026-11-04T00:00:00+05:30', '2026-12-01T15:45:00+05:30', false, true, 'published', true, 10, '1-4 teams: 1 team qualifies; 5-7 teams: 2 qualify; 8 or more: 3 qualify. No ties.') on conflict (id) do update set title = excluded.title, slug = excluded.slug, category_id = excluded.category_id, description = excluded.description, rules_markdown = excluded.rules_markdown, event_format = excluded.event_format, min_team_size = excluded.min_team_size, max_team_size = excluded.max_team_size, registration_opens_at = excluded.registration_opens_at, registration_closes_at = excluded.registration_closes_at, registration_enabled = excluded.registration_enabled, points = excluded.points, finals_rule = excluded.finals_rule, updated_at = now();
insert into public.events (id, title, slug, category_id, description, rules_markdown, event_format, min_team_size, max_team_size, registration_opens_at, registration_closes_at, waitlist_enabled, cancellation_allowed, status, registration_enabled, points, finals_rule) values ('75633df8-c9bb-5a02-9dd8-008f1438a306', 'Street Play', 'street-play', (select id from public.event_categories where slug = 'theatre'), 'English street theatre with multilingual jingles, 8 + 2 minutes.', '1. 15 to 25 participants. Duration: 8 + 2 minutes including entry and exit.
2. Dialogue and narration in English. Jingles in at least 4 Indian languages, none above 25%.
3. No loudspeakers, dry colours or paints. Formations at most 10 ft; no lifts between girls and boys.
4. No religious slokas, bhajans or scripture verses.
5. Duration, participants and language stay the same between prelims and finals.
6. Scripts are screened by the deanery coordinator for prelims and by the SWO for finals.
7. No targeting of governments, political parties or individuals; no vulgarity; no fire or water on stage.
8. No external or cross-deanery directors, make-up, costume or set designers.
9. Participants and storyline cannot change for the finals without written SWO permission.
10. Finals: 1-4 teams: 1 team qualifies; 5-7 teams: 2 qualify; 8 or more: 3 qualify. No ties.', 'team', 15, 25, '2026-11-04T00:00:00+05:30', '2026-12-03T15:45:00+05:30', false, true, 'published', true, 10, '1-4 teams: 1 team qualifies; 5-7 teams: 2 qualify; 8 or more: 3 qualify. No ties.') on conflict (id) do update set title = excluded.title, slug = excluded.slug, category_id = excluded.category_id, description = excluded.description, rules_markdown = excluded.rules_markdown, event_format = excluded.event_format, min_team_size = excluded.min_team_size, max_team_size = excluded.max_team_size, registration_opens_at = excluded.registration_opens_at, registration_closes_at = excluded.registration_closes_at, registration_enabled = excluded.registration_enabled, points = excluded.points, finals_rule = excluded.finals_rule, updated_at = now();
insert into public.events (id, title, slug, category_id, description, rules_markdown, event_format, min_team_size, max_team_size, registration_opens_at, registration_closes_at, waitlist_enabled, cancellation_allowed, status, registration_enabled, points, finals_rule) values ('e4b726f3-b6e6-5978-a77b-d156c3f3c1f5', 'Short Film Making', 'short-film-making', (select id from public.event_categories where slug = 'theatre'), 'A 6 to 8 minute mobile-shot short film in English.', '1. 5 to 15 members including crew; current CHRIST students of the deanery only.
2. Length 6-8 minutes including intro and credits. Mobile phone footage only.
3. English (10-15% regional with subtitles). Credits with role titles.
4. Must feature one prop (calendar, lock and key, glass of water or pencil) throughout and one listed proverb.
5. No alcohol or smoking items on screen.
6. Duration, participants and language stay the same between prelims and finals.
7. Scripts are screened by the deanery coordinator for prelims and by the SWO for finals.
8. No targeting of governments, political parties or individuals; no vulgarity; no fire or water on stage.
9. No external or cross-deanery directors, make-up, costume or set designers.
10. Participants and storyline cannot change for the finals without written SWO permission.
11. Finals: 1-4 teams: 1 team qualifies; 5 or more: 2 qualify.', 'team', 5, 15, '2026-11-04T00:00:00+05:30', '2026-12-05T09:00:00+05:30', false, true, 'published', true, 10, '1-4 teams: 1 team qualifies; 5 or more: 2 qualify.') on conflict (id) do update set title = excluded.title, slug = excluded.slug, category_id = excluded.category_id, description = excluded.description, rules_markdown = excluded.rules_markdown, event_format = excluded.event_format, min_team_size = excluded.min_team_size, max_team_size = excluded.max_team_size, registration_opens_at = excluded.registration_opens_at, registration_closes_at = excluded.registration_closes_at, registration_enabled = excluded.registration_enabled, points = excluded.points, finals_rule = excluded.finals_rule, updated_at = now();
insert into public.events (id, title, slug, category_id, description, rules_markdown, event_format, min_team_size, max_team_size, registration_opens_at, registration_closes_at, waitlist_enabled, cancellation_allowed, status, registration_enabled, points, finals_rule) values ('aa6edc6c-6c55-5e83-931b-7b17f6a960d9', 'Mime', 'mime', (select id from public.event_categories where slug = 'theatre'), 'Silent storytelling without props or narration, 7 + 1 minutes.', '1. Up to 10 members including painters, musicians and console; at least 6 on stage at any time.
2. Duration: 7 + 1 minutes including entry and exit.
3. No props and no narration (live or recorded). Recorded or live music and SFX allowed.
4. Duration, participants and language stay the same between prelims and finals.
5. Scripts are screened by the deanery coordinator for prelims and by the SWO for finals.
6. No targeting of governments, political parties or individuals; no vulgarity; no fire or water on stage.
7. No external or cross-deanery directors, make-up, costume or set designers.
8. Participants and storyline cannot change for the finals without written SWO permission.
9. Finals: 1-4 teams: 1 team qualifies; 5-7 teams: 2 qualify; 8 or more: 3 qualify. No ties.', 'team', 6, 10, '2026-11-04T00:00:00+05:30', '2026-12-15T15:45:00+05:30', false, true, 'published', true, 10, '1-4 teams: 1 team qualifies; 5-7 teams: 2 qualify; 8 or more: 3 qualify. No ties.') on conflict (id) do update set title = excluded.title, slug = excluded.slug, category_id = excluded.category_id, description = excluded.description, rules_markdown = excluded.rules_markdown, event_format = excluded.event_format, min_team_size = excluded.min_team_size, max_team_size = excluded.max_team_size, registration_opens_at = excluded.registration_opens_at, registration_closes_at = excluded.registration_closes_at, registration_enabled = excluded.registration_enabled, points = excluded.points, finals_rule = excluded.finals_rule, updated_at = now();

-- Schedule (one slot per event)
delete from public.event_schedule_slots where event_id = any (array['ea6a5026-6cf3-5a78-991f-357ea72a7ae8', '5c4d293a-502c-5439-95c5-142d6ea52f0e', 'abb4d1ac-682f-52ed-b80e-f8ebbbce5c3e', '84c6f5f5-3b24-5617-9f63-5e4a4f6bac16', 'a2e26e6e-6a36-5485-be7a-088edaf2b078', '8ab1c1cc-20f0-5ced-8dd4-a2c6c82816e5', 'eecbfa21-cb19-5392-931f-1eab034c0d27', '38aae608-c2fe-53e8-b960-39069cfae559', '582ebbce-b06d-542c-b912-85f8a183ac1e', '5e1986a4-a4d2-58a6-a1c3-ed9a5d5c97a5', 'ff0d1554-01f8-568c-9821-575c509a248b', '74e9abc3-b81f-53b5-b3fc-d1bda3fbcf98', '7aac15fc-5ea6-5052-89bd-046741c43ce7', '15b0627d-39eb-54ff-83eb-3ac27d4f008f', '3c411c2e-5273-515c-a15d-2d3c9d4e1c81', '70ac9b63-9ca1-5a3b-838c-ffd62abeebb4', '02369e6f-8aa9-5f51-8d58-96c2e665ea23', 'd18c982f-311a-5367-b90d-0b9056c0cbcc', 'dc275cf5-6f0b-534e-b306-0c811a89578f', 'f9f6513f-21d6-5557-9d0b-34270b1874a2', '5cdbb69e-5343-5b39-9d00-4752fe9764e0', 'c7fb51ec-9783-5738-b100-07f3f605ce09', 'bcbbd134-4740-51e9-b61f-60a14d03c44a', '4fa91a9b-0b64-5d01-9c12-5fb366b338f2', '57cfd1ca-bec8-50e6-8fec-16b73b275ab8', '8d552e7a-2ba6-56e2-ad19-34507e688b96', '2e880692-fc50-5a9b-b610-b96c536bf9d8', 'a5dbf9fb-6deb-59ac-a402-45b247d5b806', '68a87ed2-b7a8-5d65-ad3c-94d9322e56fa', '60644374-0747-58b5-b050-a742464f286f', '94541aaf-5612-5467-8c01-70ebd58ff175', '75633df8-c9bb-5a02-9dd8-008f1438a306', 'e4b726f3-b6e6-5978-a77b-d156c3f3c1f5', 'aa6edc6c-6c55-5e83-931b-7b17f6a960d9']::uuid[]);
insert into public.event_schedule_slots (id, event_id, venue_id, slot_title, slot_date, starts_at, ends_at, status) values ('5eb74b59-d7b8-5445-bc12-9800c90cddfc', 'ea6a5026-6cf3-5a78-991f-357ea72a7ae8', null, 'Timing to be announced', '2026-11-12', null, null, 'tbd');
insert into public.event_schedule_slots (id, event_id, venue_id, slot_title, slot_date, starts_at, ends_at, status) values ('8d310453-86f6-5b5d-aea6-961f74aea00b', '5c4d293a-502c-5439-95c5-142d6ea52f0e', 'cc43ba28-55cf-5fbe-a35b-f6b80c90235c', null, '2026-11-13', '2026-11-13T11:00:00+05:30', '2026-11-13T17:00:00+05:30', 'scheduled');
insert into public.event_schedule_slots (id, event_id, venue_id, slot_title, slot_date, starts_at, ends_at, status) values ('f2deaeab-344e-54ca-8fce-697c899d6f30', 'abb4d1ac-682f-52ed-b80e-f8ebbbce5c3e', 'b9fb265b-388c-5482-b1df-68570c9c026a', 'Online', '2026-11-29', null, null, 'tbd');
insert into public.event_schedule_slots (id, event_id, venue_id, slot_title, slot_date, starts_at, ends_at, status) values ('7772453a-ef9e-5206-a161-16cb14d13935', '84c6f5f5-3b24-5617-9f63-5e4a4f6bac16', '7e27b443-ecee-57d2-aca2-4ceb908e801d', null, '2026-11-25', '2026-11-25T12:45:00+05:30', '2026-11-25T17:30:00+05:30', 'scheduled');
insert into public.event_schedule_slots (id, event_id, venue_id, slot_title, slot_date, starts_at, ends_at, status) values ('a10fe8ce-cf20-53a7-8887-40bd0b696a79', 'a2e26e6e-6a36-5485-be7a-088edaf2b078', '8074dc1f-4820-5a2e-8a1f-a428195c03cd', null, '2026-11-18', '2026-11-18T15:45:00+05:30', '2026-11-18T18:30:00+05:30', 'scheduled');
insert into public.event_schedule_slots (id, event_id, venue_id, slot_title, slot_date, starts_at, ends_at, status) values ('8c519441-1782-51d1-80d2-e5610714869a', '8ab1c1cc-20f0-5ced-8dd4-a2c6c82816e5', '7e27b443-ecee-57d2-aca2-4ceb908e801d', null, '2026-12-03', null, null, 'tbd');
insert into public.event_schedule_slots (id, event_id, venue_id, slot_title, slot_date, starts_at, ends_at, status) values ('515c8213-f043-5e7c-b77f-b46458a06a13', 'eecbfa21-cb19-5392-931f-1eab034c0d27', 'b9fb265b-388c-5482-b1df-68570c9c026a', 'Online', '2026-12-11', null, null, 'tbd');
insert into public.event_schedule_slots (id, event_id, venue_id, slot_title, slot_date, starts_at, ends_at, status) values ('a34ee294-ccb8-5230-b178-99afbe43e1aa', '38aae608-c2fe-53e8-b960-39069cfae559', null, null, '2026-12-12', '2026-12-12T15:45:00+05:30', '2026-12-12T18:30:00+05:30', 'scheduled');
insert into public.event_schedule_slots (id, event_id, venue_id, slot_title, slot_date, starts_at, ends_at, status) values ('4ab3dbc6-9651-590a-b525-013d6abb987e', '582ebbce-b06d-542c-b912-85f8a183ac1e', '7e27b443-ecee-57d2-aca2-4ceb908e801d', null, '2026-11-20', '2026-11-20T12:45:00+05:30', '2026-11-20T17:30:00+05:30', 'scheduled');
insert into public.event_schedule_slots (id, event_id, venue_id, slot_title, slot_date, starts_at, ends_at, status) values ('18f22da1-72f5-5558-8259-89066917c8cd', '5e1986a4-a4d2-58a6-a1c3-ed9a5d5c97a5', 'ae68eea1-be3a-5a79-af22-2cbd033928da', null, '2026-11-19', '2026-11-19T12:45:00+05:30', '2026-11-19T19:00:00+05:30', 'scheduled');
insert into public.event_schedule_slots (id, event_id, venue_id, slot_title, slot_date, starts_at, ends_at, status) values ('c14132ba-0f74-57cf-95e7-225cccb3be07', 'ff0d1554-01f8-568c-9821-575c509a248b', '7e27b443-ecee-57d2-aca2-4ceb908e801d', null, '2026-12-10', '2026-12-10T12:45:00+05:30', '2026-12-10T17:30:00+05:30', 'scheduled');
insert into public.event_schedule_slots (id, event_id, venue_id, slot_title, slot_date, starts_at, ends_at, status) values ('eca7af2d-f21d-540d-afae-c6094cee34bd', '74e9abc3-b81f-53b5-b3fc-d1bda3fbcf98', 'b9fb265b-388c-5482-b1df-68570c9c026a', 'Online', '2026-12-06', null, null, 'tbd');
insert into public.event_schedule_slots (id, event_id, venue_id, slot_title, slot_date, starts_at, ends_at, status) values ('d8d3b66a-b892-529f-b131-972c92529aeb', '7aac15fc-5ea6-5052-89bd-046741c43ce7', '7e27b443-ecee-57d2-aca2-4ceb908e801d', null, '2026-11-21', '2026-11-21T12:45:00+05:30', '2026-11-21T17:30:00+05:30', 'scheduled');
insert into public.event_schedule_slots (id, event_id, venue_id, slot_title, slot_date, starts_at, ends_at, status) values ('aaebd1ca-60c0-5f36-818e-469d19ce8f47', '15b0627d-39eb-54ff-83eb-3ac27d4f008f', 'c2b71b25-3f5c-5305-9a78-01bdf067d1bf', null, '2026-11-17', '2026-11-17T12:45:00+05:30', '2026-11-17T19:00:00+05:30', 'scheduled');
insert into public.event_schedule_slots (id, event_id, venue_id, slot_title, slot_date, starts_at, ends_at, status) values ('91e193cd-ca17-531d-a287-41ec33e4b5ee', '3c411c2e-5273-515c-a15d-2d3c9d4e1c81', '7e27b443-ecee-57d2-aca2-4ceb908e801d', null, '2026-12-04', '2026-12-04T12:45:00+05:30', '2026-12-04T17:30:00+05:30', 'scheduled');
insert into public.event_schedule_slots (id, event_id, venue_id, slot_title, slot_date, starts_at, ends_at, status) values ('50bdf8bd-782c-5cd4-b5d7-be6a42bc94f1', '70ac9b63-9ca1-5a3b-838c-ffd62abeebb4', '7e27b443-ecee-57d2-aca2-4ceb908e801d', null, '2026-12-02', null, null, 'tbd');
insert into public.event_schedule_slots (id, event_id, venue_id, slot_title, slot_date, starts_at, ends_at, status) values ('1b5c9e3b-5791-5bb5-833b-53f940cbcb77', '02369e6f-8aa9-5f51-8d58-96c2e665ea23', 'b7078db2-7090-5a1c-8d23-cce685ab0db5', null, '2026-11-14', '2026-11-14T12:45:00+05:30', '2026-11-14T18:00:00+05:30', 'scheduled');
insert into public.event_schedule_slots (id, event_id, venue_id, slot_title, slot_date, starts_at, ends_at, status) values ('0631cc0a-8ad1-587b-8139-3b058bd1dd30', 'd18c982f-311a-5367-b90d-0b9056c0cbcc', 'e0768fb8-8654-51be-89eb-e8c263c9da50', null, '2026-11-16', '2026-11-16T12:45:00+05:30', '2026-11-16T19:00:00+05:30', 'scheduled');
insert into public.event_schedule_slots (id, event_id, venue_id, slot_title, slot_date, starts_at, ends_at, status) values ('9a66d278-173f-5bdb-ad38-da1b2a25f7d2', 'dc275cf5-6f0b-534e-b306-0c811a89578f', 'b7078db2-7090-5a1c-8d23-cce685ab0db5', null, '2026-11-26', '2026-11-26T12:45:00+05:30', '2026-11-26T17:30:00+05:30', 'scheduled');
insert into public.event_schedule_slots (id, event_id, venue_id, slot_title, slot_date, starts_at, ends_at, status) values ('7c067612-00cf-5015-8f85-eff66d0f3c50', 'f9f6513f-21d6-5557-9d0b-34270b1874a2', '7e27b443-ecee-57d2-aca2-4ceb908e801d', null, '2026-12-11', null, null, 'tbd');
insert into public.event_schedule_slots (id, event_id, venue_id, slot_title, slot_date, starts_at, ends_at, status) values ('f8c438f1-819b-5f8f-ad7c-a83433785c32', '5cdbb69e-5343-5b39-9d00-4752fe9764e0', 'cc43ba28-55cf-5fbe-a35b-f6b80c90235c', null, '2026-11-23', '2026-11-23T15:45:00+05:30', '2026-11-23T19:00:00+05:30', 'scheduled');
insert into public.event_schedule_slots (id, event_id, venue_id, slot_title, slot_date, starts_at, ends_at, status) values ('b2c98e1f-eaa7-578d-a401-6f28284ba8b7', 'c7fb51ec-9783-5738-b100-07f3f605ce09', 'cc43ba28-55cf-5fbe-a35b-f6b80c90235c', null, '2026-11-30', '2026-11-30T15:45:00+05:30', '2026-11-30T17:00:00+05:30', 'scheduled');
insert into public.event_schedule_slots (id, event_id, venue_id, slot_title, slot_date, starts_at, ends_at, status) values ('cbe572ea-6500-5292-ad35-1429165d1b83', 'bcbbd134-4740-51e9-b61f-60a14d03c44a', '5278bff5-9a98-5f1b-963e-af32ef3c4bf5', null, '2026-12-07', '2026-12-07T15:45:00+05:30', '2026-12-07T18:00:00+05:30', 'scheduled');
insert into public.event_schedule_slots (id, event_id, venue_id, slot_title, slot_date, starts_at, ends_at, status) values ('cadb5441-2be9-565c-9762-942052c9e68a', '4fa91a9b-0b64-5d01-9c12-5fb366b338f2', '6d4defd1-c827-5e1e-9826-ef1d5524c98d', null, '2026-12-09', '2026-12-09T15:45:00+05:30', '2026-12-09T17:45:00+05:30', 'scheduled');
insert into public.event_schedule_slots (id, event_id, venue_id, slot_title, slot_date, starts_at, ends_at, status) values ('7efca852-7d17-5fd2-9472-52d84d558960', '57cfd1ca-bec8-50e6-8fec-16b73b275ab8', '6d4defd1-c827-5e1e-9826-ef1d5524c98d', null, '2026-12-09', '2026-12-09T15:45:00+05:30', '2026-12-09T17:45:00+05:30', 'scheduled');
insert into public.event_schedule_slots (id, event_id, venue_id, slot_title, slot_date, starts_at, ends_at, status) values ('5fe4e5d7-faf6-5807-bfef-e2aa9b206a9a', '8d552e7a-2ba6-56e2-ad19-34507e688b96', '6d4defd1-c827-5e1e-9826-ef1d5524c98d', null, '2026-12-09', '2026-12-09T15:45:00+05:30', '2026-12-09T17:45:00+05:30', 'scheduled');
insert into public.event_schedule_slots (id, event_id, venue_id, slot_title, slot_date, starts_at, ends_at, status) values ('fa2c68f8-43db-56ee-99b9-9e24c7d7fb84', '2e880692-fc50-5a9b-b610-b96c536bf9d8', '6efd6d99-f51b-54af-bec3-4d6351735083', null, '2026-12-14', '2026-12-14T15:45:00+05:30', '2026-12-14T18:30:00+05:30', 'scheduled');
insert into public.event_schedule_slots (id, event_id, venue_id, slot_title, slot_date, starts_at, ends_at, status) values ('9828cd13-f6ff-59de-9d3f-7ddf42e6fc59', 'a5dbf9fb-6deb-59ac-a402-45b247d5b806', '6efd6d99-f51b-54af-bec3-4d6351735083', null, '2026-12-14', '2026-12-14T15:45:00+05:30', '2026-12-14T18:30:00+05:30', 'scheduled');
insert into public.event_schedule_slots (id, event_id, venue_id, slot_title, slot_date, starts_at, ends_at, status) values ('0c9c254f-7ed4-56b3-929a-2d7944088478', '68a87ed2-b7a8-5d65-ad3c-94d9322e56fa', 'cc43ba28-55cf-5fbe-a35b-f6b80c90235c', null, '2026-11-24', '2026-11-24T15:45:00+05:30', '2026-11-24T19:00:00+05:30', 'scheduled');
insert into public.event_schedule_slots (id, event_id, venue_id, slot_title, slot_date, starts_at, ends_at, status) values ('71d60223-7da1-59ea-93c5-2f4bb4acde82', '60644374-0747-58b5-b050-a742464f286f', 'c2b71b25-3f5c-5305-9a78-01bdf067d1bf', null, '2026-11-17', '2026-11-17T12:45:00+05:30', '2026-11-17T19:00:00+05:30', 'scheduled');
insert into public.event_schedule_slots (id, event_id, venue_id, slot_title, slot_date, starts_at, ends_at, status) values ('9bbb3a8d-6321-5f9a-b34e-42527a32db2f', '94541aaf-5612-5467-8c01-70ebd58ff175', '5278bff5-9a98-5f1b-963e-af32ef3c4bf5', null, '2026-12-01', '2026-12-01T15:45:00+05:30', '2026-12-01T18:00:00+05:30', 'scheduled');
insert into public.event_schedule_slots (id, event_id, venue_id, slot_title, slot_date, starts_at, ends_at, status) values ('4c9aa8d6-874e-55b8-b3fb-0bd79610c52e', '75633df8-c9bb-5a02-9dd8-008f1438a306', '42bde1c3-7b51-5b07-8709-b37169cef28e', null, '2026-12-03', '2026-12-03T15:45:00+05:30', '2026-12-03T18:30:00+05:30', 'scheduled');
insert into public.event_schedule_slots (id, event_id, venue_id, slot_title, slot_date, starts_at, ends_at, status) values ('52983581-3bf1-5b71-b406-6eaf7c5fd3fc', 'e4b726f3-b6e6-5978-a77b-d156c3f3c1f5', 'b9fb265b-388c-5482-b1df-68570c9c026a', 'Online', '2026-12-05', null, null, 'tbd');
insert into public.event_schedule_slots (id, event_id, venue_id, slot_title, slot_date, starts_at, ends_at, status) values ('911aa52c-1be1-54c6-83ee-6c37f9351cb1', 'aa6edc6c-6c55-5e83-931b-7b17f6a960d9', '5278bff5-9a98-5f1b-963e-af32ef3c4bf5', null, '2026-12-15', '2026-12-15T15:45:00+05:30', '2026-12-15T18:00:00+05:30', 'scheduled');

-- Faculty coordinators (schedule) and student event heads
delete from public.event_contacts where event_id = any (array['ea6a5026-6cf3-5a78-991f-357ea72a7ae8', '5c4d293a-502c-5439-95c5-142d6ea52f0e', 'abb4d1ac-682f-52ed-b80e-f8ebbbce5c3e', '84c6f5f5-3b24-5617-9f63-5e4a4f6bac16', 'a2e26e6e-6a36-5485-be7a-088edaf2b078', '8ab1c1cc-20f0-5ced-8dd4-a2c6c82816e5', 'eecbfa21-cb19-5392-931f-1eab034c0d27', '38aae608-c2fe-53e8-b960-39069cfae559', '582ebbce-b06d-542c-b912-85f8a183ac1e', '5e1986a4-a4d2-58a6-a1c3-ed9a5d5c97a5', 'ff0d1554-01f8-568c-9821-575c509a248b', '74e9abc3-b81f-53b5-b3fc-d1bda3fbcf98', '7aac15fc-5ea6-5052-89bd-046741c43ce7', '15b0627d-39eb-54ff-83eb-3ac27d4f008f', '3c411c2e-5273-515c-a15d-2d3c9d4e1c81', '70ac9b63-9ca1-5a3b-838c-ffd62abeebb4', '02369e6f-8aa9-5f51-8d58-96c2e665ea23', 'd18c982f-311a-5367-b90d-0b9056c0cbcc', 'dc275cf5-6f0b-534e-b306-0c811a89578f', 'f9f6513f-21d6-5557-9d0b-34270b1874a2', '5cdbb69e-5343-5b39-9d00-4752fe9764e0', 'c7fb51ec-9783-5738-b100-07f3f605ce09', 'bcbbd134-4740-51e9-b61f-60a14d03c44a', '4fa91a9b-0b64-5d01-9c12-5fb366b338f2', '57cfd1ca-bec8-50e6-8fec-16b73b275ab8', '8d552e7a-2ba6-56e2-ad19-34507e688b96', '2e880692-fc50-5a9b-b610-b96c536bf9d8', 'a5dbf9fb-6deb-59ac-a402-45b247d5b806', '68a87ed2-b7a8-5d65-ad3c-94d9322e56fa', '60644374-0747-58b5-b050-a742464f286f', '94541aaf-5612-5467-8c01-70ebd58ff175', '75633df8-c9bb-5a02-9dd8-008f1438a306', 'e4b726f3-b6e6-5978-a77b-d156c3f3c1f5', 'aa6edc6c-6c55-5e83-931b-7b17f6a960d9']::uuid[]);
insert into public.event_contacts (event_id, role, name, display_order) values ('abb4d1ac-682f-52ed-b80e-f8ebbbce5c3e', 'student_head', 'Dhanush V', 0);
insert into public.event_contacts (event_id, role, name, display_order) values ('abb4d1ac-682f-52ed-b80e-f8ebbbce5c3e', 'student_head', 'Rachael', 1);
insert into public.event_contacts (event_id, role, name, display_order) values ('84c6f5f5-3b24-5617-9f63-5e4a4f6bac16', 'student_head', 'Ragani', 0);
insert into public.event_contacts (event_id, role, name, display_order) values ('84c6f5f5-3b24-5617-9f63-5e4a4f6bac16', 'student_head', 'Shreya', 1);
insert into public.event_contacts (event_id, role, name, display_order) values ('84c6f5f5-3b24-5617-9f63-5e4a4f6bac16', 'student_head', 'Kevin', 2);
insert into public.event_contacts (event_id, role, name, display_order) values ('a2e26e6e-6a36-5485-be7a-088edaf2b078', 'student_head', 'Harsheel', 0);
insert into public.event_contacts (event_id, role, name, display_order) values ('a2e26e6e-6a36-5485-be7a-088edaf2b078', 'student_head', 'Yakshitha', 1);
insert into public.event_contacts (event_id, role, name, display_order) values ('8ab1c1cc-20f0-5ced-8dd4-a2c6c82816e5', 'student_head', 'Hariharan', 0);
insert into public.event_contacts (event_id, role, name, display_order) values ('8ab1c1cc-20f0-5ced-8dd4-a2c6c82816e5', 'student_head', 'Tejaswi', 1);
insert into public.event_contacts (event_id, role, name, display_order) values ('eecbfa21-cb19-5392-931f-1eab034c0d27', 'student_head', 'Trinity Merlin A', 0);
insert into public.event_contacts (event_id, role, name, display_order) values ('eecbfa21-cb19-5392-931f-1eab034c0d27', 'student_head', 'Diyan', 1);
insert into public.event_contacts (event_id, role, name, display_order) values ('38aae608-c2fe-53e8-b960-39069cfae559', 'student_head', 'Anjali', 0);
insert into public.event_contacts (event_id, role, name, display_order) values ('38aae608-c2fe-53e8-b960-39069cfae559', 'student_head', 'Pragna', 1);
insert into public.event_contacts (event_id, role, name, display_order) values ('582ebbce-b06d-542c-b912-85f8a183ac1e', 'student_head', 'Bhavini Rathi', 0);
insert into public.event_contacts (event_id, role, name, display_order) values ('582ebbce-b06d-542c-b912-85f8a183ac1e', 'student_head', 'Reshma', 1);
insert into public.event_contacts (event_id, role, name, display_order) values ('582ebbce-b06d-542c-b912-85f8a183ac1e', 'student_head', 'J H Sangam', 2);
insert into public.event_contacts (event_id, role, name, display_order) values ('5e1986a4-a4d2-58a6-a1c3-ed9a5d5c97a5', 'student_head', 'Prarthana', 0);
insert into public.event_contacts (event_id, role, name, display_order) values ('5e1986a4-a4d2-58a6-a1c3-ed9a5d5c97a5', 'student_head', 'Kunal S Thakur', 1);
insert into public.event_contacts (event_id, role, name, display_order) values ('5e1986a4-a4d2-58a6-a1c3-ed9a5d5c97a5', 'student_head', 'Diyan', 2);
insert into public.event_contacts (event_id, role, name, display_order) values ('ff0d1554-01f8-568c-9821-575c509a248b', 'student_head', 'Kaushal', 0);
insert into public.event_contacts (event_id, role, name, display_order) values ('ff0d1554-01f8-568c-9821-575c509a248b', 'student_head', 'Deepika V', 1);
insert into public.event_contacts (event_id, role, name, display_order) values ('74e9abc3-b81f-53b5-b3fc-d1bda3fbcf98', 'student_head', 'Naomi D''silva', 0);
insert into public.event_contacts (event_id, role, name, display_order) values ('74e9abc3-b81f-53b5-b3fc-d1bda3fbcf98', 'student_head', 'Thanush', 1);
insert into public.event_contacts (event_id, role, name, display_order) values ('7aac15fc-5ea6-5052-89bd-046741c43ce7', 'student_head', 'Olin Joy', 0);
insert into public.event_contacts (event_id, role, name, display_order) values ('7aac15fc-5ea6-5052-89bd-046741c43ce7', 'student_head', 'Amirthavarshini.S', 1);
insert into public.event_contacts (event_id, role, name, display_order) values ('15b0627d-39eb-54ff-83eb-3ac27d4f008f', 'student_head', 'Jayden', 0);
insert into public.event_contacts (event_id, role, name, display_order) values ('15b0627d-39eb-54ff-83eb-3ac27d4f008f', 'student_head', 'Saashmitha', 1);
insert into public.event_contacts (event_id, role, name, display_order) values ('3c411c2e-5273-515c-a15d-2d3c9d4e1c81', 'student_head', 'Neeti Deora', 0);
insert into public.event_contacts (event_id, role, name, display_order) values ('3c411c2e-5273-515c-a15d-2d3c9d4e1c81', 'student_head', 'Punam', 1);
insert into public.event_contacts (event_id, role, name, display_order) values ('70ac9b63-9ca1-5a3b-838c-ffd62abeebb4', 'student_head', 'Khush S Bhirakcha', 0);
insert into public.event_contacts (event_id, role, name, display_order) values ('02369e6f-8aa9-5f51-8d58-96c2e665ea23', 'student_head', 'Avantika', 0);
insert into public.event_contacts (event_id, role, name, display_order) values ('02369e6f-8aa9-5f51-8d58-96c2e665ea23', 'student_head', 'Vijeta', 1);
insert into public.event_contacts (event_id, role, name, display_order) values ('d18c982f-311a-5367-b90d-0b9056c0cbcc', 'student_head', 'Sneha', 0);
insert into public.event_contacts (event_id, role, name, display_order) values ('d18c982f-311a-5367-b90d-0b9056c0cbcc', 'student_head', 'Ankit Anup', 1);
insert into public.event_contacts (event_id, role, name, display_order) values ('dc275cf5-6f0b-534e-b306-0c811a89578f', 'student_head', 'Shatkhi roopa', 0);
insert into public.event_contacts (event_id, role, name, display_order) values ('dc275cf5-6f0b-534e-b306-0c811a89578f', 'student_head', 'Shriya A Shastry', 1);
insert into public.event_contacts (event_id, role, name, display_order) values ('f9f6513f-21d6-5557-9d0b-34270b1874a2', 'student_head', 'K Pratheek Padiyar', 0);
insert into public.event_contacts (event_id, role, name, display_order) values ('f9f6513f-21d6-5557-9d0b-34270b1874a2', 'student_head', 'Dhruv gupta', 1);
insert into public.event_contacts (event_id, role, name, display_order) values ('5cdbb69e-5343-5b39-9d00-4752fe9764e0', 'student_head', 'Saksham', 0);
insert into public.event_contacts (event_id, role, name, display_order) values ('5cdbb69e-5343-5b39-9d00-4752fe9764e0', 'student_head', 'Mahek', 1);
insert into public.event_contacts (event_id, role, name, display_order) values ('c7fb51ec-9783-5738-b100-07f3f605ce09', 'student_head', 'Vedika', 0);
insert into public.event_contacts (event_id, role, name, display_order) values ('c7fb51ec-9783-5738-b100-07f3f605ce09', 'student_head', 'Tithi Maji', 1);
insert into public.event_contacts (event_id, role, name, display_order) values ('bcbbd134-4740-51e9-b61f-60a14d03c44a', 'student_head', 'Prathmesh Agarwal', 0);
insert into public.event_contacts (event_id, role, name, display_order) values ('bcbbd134-4740-51e9-b61f-60a14d03c44a', 'student_head', 'Dimple', 1);
insert into public.event_contacts (event_id, role, name, display_order) values ('bcbbd134-4740-51e9-b61f-60a14d03c44a', 'student_head', 'Rohan Saha', 2);
insert into public.event_contacts (event_id, role, name, display_order) values ('4fa91a9b-0b64-5d01-9c12-5fb366b338f2', 'student_head', 'Nihal', 0);
insert into public.event_contacts (event_id, role, name, display_order) values ('4fa91a9b-0b64-5d01-9c12-5fb366b338f2', 'student_head', 'Dhanushree', 1);
insert into public.event_contacts (event_id, role, name, display_order) values ('57cfd1ca-bec8-50e6-8fec-16b73b275ab8', 'student_head', 'Nihal', 0);
insert into public.event_contacts (event_id, role, name, display_order) values ('57cfd1ca-bec8-50e6-8fec-16b73b275ab8', 'student_head', 'Dhanushree', 1);
insert into public.event_contacts (event_id, role, name, display_order) values ('8d552e7a-2ba6-56e2-ad19-34507e688b96', 'student_head', 'Nihal', 0);
insert into public.event_contacts (event_id, role, name, display_order) values ('8d552e7a-2ba6-56e2-ad19-34507e688b96', 'student_head', 'Dhanushree', 1);
insert into public.event_contacts (event_id, role, name, display_order) values ('2e880692-fc50-5a9b-b610-b96c536bf9d8', 'student_head', 'Suhani', 0);
insert into public.event_contacts (event_id, role, name, display_order) values ('2e880692-fc50-5a9b-b610-b96c536bf9d8', 'student_head', 'Sri Ghaja', 1);
insert into public.event_contacts (event_id, role, name, display_order) values ('a5dbf9fb-6deb-59ac-a402-45b247d5b806', 'student_head', 'Suhani', 0);
insert into public.event_contacts (event_id, role, name, display_order) values ('a5dbf9fb-6deb-59ac-a402-45b247d5b806', 'student_head', 'Sri Ghaja', 1);
insert into public.event_contacts (event_id, role, name, display_order) values ('68a87ed2-b7a8-5d65-ad3c-94d9322e56fa', 'student_head', 'Shreyas', 0);
insert into public.event_contacts (event_id, role, name, display_order) values ('68a87ed2-b7a8-5d65-ad3c-94d9322e56fa', 'student_head', 'Rohan Srivatsava', 1);
insert into public.event_contacts (event_id, role, name, display_order) values ('68a87ed2-b7a8-5d65-ad3c-94d9322e56fa', 'student_head', 'Sherwin johnson', 2);
insert into public.event_contacts (event_id, role, name, display_order) values ('60644374-0747-58b5-b050-a742464f286f', 'student_head', 'Ruth Sarah', 0);
insert into public.event_contacts (event_id, role, name, display_order) values ('60644374-0747-58b5-b050-a742464f286f', 'student_head', 'Jennifer', 1);
insert into public.event_contacts (event_id, role, name, display_order) values ('94541aaf-5612-5467-8c01-70ebd58ff175', 'student_head', 'Rohith Odiyar', 0);
insert into public.event_contacts (event_id, role, name, display_order) values ('94541aaf-5612-5467-8c01-70ebd58ff175', 'student_head', 'Japsimar', 1);
insert into public.event_contacts (event_id, role, name, display_order) values ('94541aaf-5612-5467-8c01-70ebd58ff175', 'student_head', 'Shraddha', 2);
insert into public.event_contacts (event_id, role, name, display_order) values ('75633df8-c9bb-5a02-9dd8-008f1438a306', 'student_head', 'Avika soni', 0);
insert into public.event_contacts (event_id, role, name, display_order) values ('75633df8-c9bb-5a02-9dd8-008f1438a306', 'student_head', 'Garima', 1);
insert into public.event_contacts (event_id, role, name, display_order) values ('e4b726f3-b6e6-5978-a77b-d156c3f3c1f5', 'student_head', 'Janani', 0);
insert into public.event_contacts (event_id, role, name, display_order) values ('e4b726f3-b6e6-5978-a77b-d156c3f3c1f5', 'student_head', 'Erzin', 1);
insert into public.event_contacts (event_id, role, name, display_order) values ('aa6edc6c-6c55-5e83-931b-7b17f6a960d9', 'student_head', 'Likith k', 0);
insert into public.event_contacts (event_id, role, name, display_order) values ('aa6edc6c-6c55-5e83-931b-7b17f6a960d9', 'student_head', 'Bhavitha L', 1);
insert into public.event_contacts (event_id, role, name, display_order) values ('aa6edc6c-6c55-5e83-931b-7b17f6a960d9', 'student_head', 'Leo', 2);

-- =============================================================
-- Two sessions: events that run at 12:45 PM and again at 3:45 PM get one slot per session.
-- Students pick one session when they register; a team picks one for the whole team.
-- Each session has its own seat limit (events.capacity applies per session).
-- =============================================================
create temp table two_session_events (event_id uuid primary key) on commit drop;
insert into two_session_events values
  ('d18c982f-311a-5367-b90d-0b9056c0cbcc'), -- Debate
  ('15b0627d-39eb-54ff-83eb-3ac27d4f008f'), -- Pot Pourri
  ('60644374-0747-58b5-b050-a742464f286f'), -- Mono Acting
  ('5e1986a4-a4d2-58a6-a1c3-ed9a5d5c97a5'), -- Rangoli Design
  ('582ebbce-b06d-542c-b912-85f8a183ac1e'), -- Mehendi Design
  ('84c6f5f5-3b24-5617-9f63-5e4a4f6bac16'), -- Greeting Card
  ('dc275cf5-6f0b-534e-b306-0c811a89578f'), -- JAM
  ('3c411c2e-5273-515c-a15d-2d3c9d4e1c81'), -- Extempore
  ('ff0d1554-01f8-568c-9821-575c509a248b'); -- Painting

-- A second slot for the 3:45 PM session, same day and venue, ending when the day's slot ended.
insert into public.event_schedule_slots (id, event_id, venue_id, slot_title, slot_date, starts_at, ends_at, status)
select md5(s.event_id::text || ':evening')::uuid, s.event_id, s.venue_id, 'Evening session', s.slot_date,
       (s.slot_date::text || 'T15:45:00+05:30')::timestamptz, s.ends_at, s.status
  from public.event_schedule_slots s
 where s.event_id in (select event_id from two_session_events)
on conflict (id) do update set venue_id = excluded.venue_id, slot_date = excluded.slot_date,
  starts_at = excluded.starts_at, ends_at = excluded.ends_at, slot_title = excluded.slot_title;

-- The original slot becomes the 12:45 PM session, ending before the 3:45 PM one starts.
update public.event_schedule_slots s
   set slot_title = 'Morning session',
       starts_at  = (s.slot_date::text || 'T12:45:00+05:30')::timestamptz,
       ends_at    = (s.slot_date::text || 'T15:30:00+05:30')::timestamptz
 where s.event_id in (select event_id from two_session_events)
   and s.id <> md5(s.event_id::text || ':evening')::uuid;

-- Which session a registration / team is in.
alter table public.event_registrations add column if not exists slot_id uuid
  references public.event_schedule_slots(id) on delete set null;
alter table public.teams add column if not exists slot_id uuid
  references public.event_schedule_slots(id) on delete set null;
create index if not exists event_registrations_slot_idx on public.event_registrations (slot_id);

-- Resolves the session for a registration. Events with one slot use it; events with several need a choice.
-- Returns {slot_id} or an error object.
create or replace function public.resolve_event_session(p_event_id uuid, p_slot_id uuid)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare
  v_count integer;
  v_only  uuid;
begin
  select count(*), min(id::text)::uuid into v_count, v_only from public.event_schedule_slots where event_id = p_event_id;
  if p_slot_id is not null then
    if not exists(select 1 from public.event_schedule_slots where id = p_slot_id and event_id = p_event_id) then
      return jsonb_build_object('success', false, 'error_code', 'INVALID_SESSION', 'message', 'That session is not part of this event.');
    end if;
    return jsonb_build_object('slot_id', p_slot_id);
  end if;
  if v_count > 1 then
    return jsonb_build_object('success', false, 'error_code', 'SESSION_REQUIRED', 'message', 'Pick a session: this event runs more than once.');
  end if;
  return jsonb_build_object('slot_id', v_only);
end $$;

drop function if exists public.register_individual_event(uuid);
create or replace function public.register_individual_event(p_event_id uuid, p_slot_id uuid default null)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_s        public.students%rowtype;
  v_event    public.events%rowtype;
  v_block    jsonb;
  v_session  jsonb;
  v_slot     uuid;
  v_multi    boolean;
  v_existing public.event_registrations%rowtype;
  v_count    integer;
  v_status   registration_status_enum;
  v_reg_id   uuid;
begin
  select * into v_s from public.students where auth_user_id = auth.uid();
  if not found then
    return jsonb_build_object('success', false, 'error_code', 'UNAUTHORIZED', 'message', 'Sign in with your student account to register.');
  end if;
  if v_s.student_status <> 'active' or not v_s.is_verified then
    return jsonb_build_object('success', false, 'error_code', 'INACTIVE_STUDENT', 'message', 'Your student account is not active.');
  end if;
  if not v_s.profile_complete then
    return jsonb_build_object('success', false, 'error_code', 'PROFILE_INCOMPLETE', 'message', 'Add your phone number in your profile before registering.');
  end if;

  select * into v_event from public.events where id = p_event_id for update;
  v_block := public.registration_block_reason(v_event);
  if v_block is not null then return v_block; end if;

  if v_event.event_format not in ('individual', 'either') then
    return jsonb_build_object('success', false, 'error_code', 'INVALID_FORMAT', 'message', 'This event needs a team registration.');
  end if;

  v_session := public.resolve_event_session(p_event_id, p_slot_id);
  if v_session ? 'error_code' then return v_session; end if;
  v_slot := (v_session->>'slot_id')::uuid;
  v_multi := (select count(*) > 1 from public.event_schedule_slots where event_id = p_event_id);

  select * into v_existing from public.event_registrations where event_id = p_event_id and student_id = v_s.id;
  if found and v_existing.registration_status in ('confirmed', 'waitlisted') then
    return jsonb_build_object('success', false, 'error_code', 'ALREADY_REGISTERED', 'message', 'You are already registered for this event.');
  end if;

  -- Seat limit applies per session when the event runs more than once.
  select count(*) into v_count from public.event_registrations
   where event_id = p_event_id and registration_status = 'confirmed'
     and (not v_multi or slot_id = v_slot);

  if v_event.capacity is not null and v_count >= v_event.capacity then
    if not v_event.waitlist_enabled then
      return jsonb_build_object('success', false, 'error_code', 'CAPACITY_FULL',
        'message', case when v_multi then 'This session is full. Try the other session.' else 'This event is full.' end);
    end if;
    v_status := 'waitlisted';
  else
    v_status := 'confirmed';
  end if;

  insert into public.event_registrations (event_id, student_id, registration_status, registered_by_student_id, slot_id)
  values (p_event_id, v_s.id, v_status, v_s.id, v_slot)
  on conflict (event_id, student_id) do update
     set registration_status = excluded.registration_status, team_id = null, slot_id = excluded.slot_id,
         registered_at = now(), cancelled_at = null, registered_by_student_id = excluded.registered_by_student_id
  returning id into v_reg_id;

  insert into public.audit_logs (actor_id, actor_role, action, resource, resource_id, detail)
  values (v_s.id, 'student', 'register_individual', 'event_registrations', v_reg_id,
          jsonb_build_object('event_id', p_event_id, 'status', v_status, 'slot_id', v_slot));

  return jsonb_build_object('success', true, 'registration_id', v_reg_id, 'status', v_status,
    'event_title', v_event.title, 'whatsapp_group_url', v_event.whatsapp_group_url,
    'message', 'You are registered for ' || v_event.title || '.');
end $$;

drop function if exists public.register_team_event(uuid, text, text[]);
create or replace function public.register_team_event(
  p_event_id uuid,
  p_team_name text,
  p_member_register_numbers text[],
  p_slot_id uuid default null
)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_leader   public.students%rowtype;
  v_event    public.events%rowtype;
  v_block    jsonb;
  v_session  jsonb;
  v_slot     uuid;
  v_name     text := trim(coalesce(p_team_name, ''));
  v_regs     text[];
  v_missing  text[];
  v_taken    text[];
  v_size     integer;
  v_team_id  uuid;
  v_member   record;
begin
  select * into v_leader from public.students where auth_user_id = auth.uid();
  if not found then
    return jsonb_build_object('success', false, 'error_code', 'UNAUTHORIZED', 'message', 'Sign in with your student account to register a team.');
  end if;
  if v_leader.student_status <> 'active' or not v_leader.is_verified then
    return jsonb_build_object('success', false, 'error_code', 'INACTIVE_STUDENT', 'message', 'Your student account is not active.');
  end if;
  if not v_leader.profile_complete then
    return jsonb_build_object('success', false, 'error_code', 'PROFILE_INCOMPLETE', 'message', 'Add your phone number in your profile before registering a team.');
  end if;

  select * into v_event from public.events where id = p_event_id for update;
  v_block := public.registration_block_reason(v_event);
  if v_block is not null then return v_block; end if;

  if v_event.event_format not in ('team', 'either') then
    return jsonb_build_object('success', false, 'error_code', 'INVALID_FORMAT', 'message', 'This is an individual event.');
  end if;

  v_session := public.resolve_event_session(p_event_id, p_slot_id);
  if v_session ? 'error_code' then return v_session; end if;
  v_slot := (v_session->>'slot_id')::uuid;

  if length(v_name) < 2 or length(v_name) > 60 then
    return jsonb_build_object('success', false, 'error_code', 'INVALID_TEAM_NAME', 'message', 'Team name must be 2 to 60 characters.');
  end if;
  if exists(select 1 from public.teams t where t.event_id = p_event_id and lower(t.team_name) = lower(v_name)
            and exists(select 1 from public.event_registrations r where r.team_id = t.id and r.registration_status <> 'cancelled')) then
    return jsonb_build_object('success', false, 'error_code', 'TEAM_NAME_TAKEN', 'message', 'Another team already uses that name for this event.');
  end if;
  -- A withdrawn team keeps its row; free the name so it can be reused.
  update public.event_registrations er set team_id = null
   where er.event_id = p_event_id and er.registration_status = 'cancelled'
     and er.team_id in (
       select t.id from public.teams t
        where t.event_id = p_event_id and lower(t.team_name) = lower(v_name)
          and not exists(select 1 from public.event_winners w where w.team_id = t.id));
  delete from public.teams t
   where t.event_id = p_event_id and lower(t.team_name) = lower(v_name)
     and not exists(select 1 from public.event_registrations r where r.team_id = t.id)
     and not exists(select 1 from public.event_winners w where w.team_id = t.id);

  -- Leader first, then unique members.
  select array_agg(reg order by ord) into v_regs from (
    select reg, min(ord) as ord from (
      select v_leader.register_number as reg, 0::bigint as ord
      union all
      select trim(m), o from unnest(coalesce(p_member_register_numbers, '{}'::text[])) with ordinality as u(m, o)
      where trim(m) <> ''
    ) x group by reg
  ) y;
  v_size := coalesce(array_length(v_regs, 1), 0);

  if v_size < coalesce(v_event.min_team_size, 2) then
    return jsonb_build_object('success', false, 'error_code', 'TEAM_TOO_SMALL',
      'message', v_event.title || ' needs at least ' || coalesce(v_event.min_team_size, 2) || ' members, including you.');
  end if;
  if v_event.max_team_size is not null and v_size > v_event.max_team_size then
    return jsonb_build_object('success', false, 'error_code', 'TEAM_TOO_LARGE',
      'message', v_event.title || ' allows at most ' || v_event.max_team_size || ' members, including you.');
  end if;

  select array_agg(r) into v_missing from unnest(v_regs) r
   where not exists(select 1 from public.students s where s.register_number = r and s.student_status = 'active');
  if v_missing is not null then
    return jsonb_build_object('success', false, 'error_code', 'MEMBER_NOT_FOUND',
      'message', 'Not on the student list: ' || array_to_string(v_missing, ', '));
  end if;

  select array_agg(s.register_number || ' (' || s.full_name || ')') into v_taken
    from public.students s
    join public.event_registrations er on er.student_id = s.id
   where s.register_number = any(v_regs) and er.event_id = p_event_id and er.registration_status <> 'cancelled';
  if v_taken is not null then
    return jsonb_build_object('success', false, 'error_code', 'MEMBER_ALREADY_REGISTERED',
      'message', 'Already registered for this event: ' || array_to_string(v_taken, ', '));
  end if;

  insert into public.teams (event_id, team_name, leader_student_id, slot_id)
  values (p_event_id, v_name, v_leader.id, v_slot) returning id into v_team_id;

  for v_member in select s.* from public.students s where s.register_number = any(v_regs) loop
    insert into public.team_members (team_id, student_id, is_leader)
    values (v_team_id, v_member.id, v_member.id = v_leader.id);

    insert into public.event_registrations (event_id, student_id, team_id, registration_status, registered_by_student_id, slot_id)
    values (p_event_id, v_member.id, v_team_id, 'confirmed', v_leader.id, v_slot)
    on conflict (event_id, student_id) do update
       set registration_status = 'confirmed', team_id = excluded.team_id, slot_id = excluded.slot_id, registered_at = now(),
           cancelled_at = null, registered_by_student_id = excluded.registered_by_student_id;

    if v_member.id <> v_leader.id then
      insert into public.notifications (title, body, link, audience, student_id)
      values ('Added to team ' || v_name,
              v_leader.full_name || ' registered you in team "' || v_name || '" for ' || v_event.title || '.',
              '/app/my-events', 'student', v_member.id);
    end if;
  end loop;

  insert into public.audit_logs (actor_id, actor_role, action, resource, resource_id, detail)
  values (v_leader.id, 'student', 'register_team', 'teams', v_team_id,
          jsonb_build_object('event_id', p_event_id, 'members', to_jsonb(v_regs), 'slot_id', v_slot));

  return jsonb_build_object('success', true, 'team_id', v_team_id, 'status', 'confirmed',
    'event_title', v_event.title, 'whatsapp_group_url', v_event.whatsapp_group_url,
    'message', 'Team "' || v_name || '" is registered for ' || v_event.title || '.');
end $$;

-- Switch to the other session while registration is still open. Team leaders move the whole team.
create or replace function public.change_my_session(p_registration_id uuid, p_slot_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_student_id uuid := public.current_student_id();
  v_reg   public.event_registrations%rowtype;
  v_event public.events%rowtype;
  v_team  public.teams%rowtype;
  v_count integer;
  v_label text;
begin
  select * into v_reg from public.event_registrations where id = p_registration_id and student_id = v_student_id;
  if not found or v_reg.registration_status = 'cancelled' then
    return jsonb_build_object('success', false, 'error_code', 'NOT_FOUND', 'message', 'Registration not found.');
  end if;
  select * into v_event from public.events where id = v_reg.event_id for update;
  if v_event.registration_closed or (v_event.registration_closes_at is not null and now() > v_event.registration_closes_at) then
    return jsonb_build_object('success', false, 'error_code', 'REGISTRATION_CLOSED', 'message', 'Registration has closed, so the session can no longer be changed.');
  end if;
  if not exists(select 1 from public.event_schedule_slots where id = p_slot_id and event_id = v_reg.event_id) then
    return jsonb_build_object('success', false, 'error_code', 'INVALID_SESSION', 'message', 'That session is not part of this event.');
  end if;
  if v_reg.slot_id is not distinct from p_slot_id then
    return jsonb_build_object('success', true, 'message', 'You are already in that session.');
  end if;
  select to_char(starts_at at time zone 'Asia/Kolkata', 'FMHH12:MI AM') into v_label from public.event_schedule_slots where id = p_slot_id;

  if v_reg.team_id is not null then
    select * into v_team from public.teams where id = v_reg.team_id;
    if v_team.leader_student_id <> v_student_id then
      return jsonb_build_object('success', false, 'error_code', 'TEAM_MEMBER', 'message', 'Only your team leader can change the team''s session.');
    end if;
    update public.teams set slot_id = p_slot_id where id = v_team.id;
    update public.event_registrations set slot_id = p_slot_id where team_id = v_team.id and registration_status <> 'cancelled';
    insert into public.notifications (title, body, link, audience, student_id)
    select 'Session changed', 'Team "' || v_team.team_name || '" moved to the ' || coalesce(v_label, 'other') || ' session of ' || v_event.title || '.',
           '/app/my-events', 'student', tm.student_id
      from public.team_members tm where tm.team_id = v_team.id and tm.student_id <> v_student_id;
  else
    if v_reg.registration_status = 'confirmed' and v_event.capacity is not null then
      select count(*) into v_count from public.event_registrations
       where event_id = v_reg.event_id and registration_status = 'confirmed' and slot_id = p_slot_id;
      if v_count >= v_event.capacity then
        return jsonb_build_object('success', false, 'error_code', 'CAPACITY_FULL', 'message', 'That session is full.');
      end if;
    end if;
    update public.event_registrations set slot_id = p_slot_id where id = v_reg.id;
  end if;

  insert into public.audit_logs (actor_id, actor_role, action, resource, resource_id, detail)
  values (v_student_id, 'student', 'change_session', 'event_registrations', v_reg.id,
          jsonb_build_object('event_id', v_reg.event_id, 'from', v_reg.slot_id, 'to', p_slot_id));

  return jsonb_build_object('success', true, 'message', 'Moved to the ' || coalesce(v_label, 'new') || ' session.');
end $$;

create or replace function public.get_my_registrations()
returns jsonb language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', er.id,
    'event_id', er.event_id,
    'slot_id', er.slot_id,
    'registration_status', er.registration_status,
    'registered_at', er.registered_at,
    'cancelled_at', er.cancelled_at,
    'attendance_status', ea.status,
    'whatsapp_group_url', case when er.registration_status <> 'cancelled' then e.whatsapp_group_url end,
    'team', case when t.id is null then null else jsonb_build_object(
      'id', t.id, 'team_name', t.team_name, 'leader_student_id', t.leader_student_id,
      'is_leader', t.leader_student_id = er.student_id,
      'members', (
        select jsonb_agg(jsonb_build_object(
          'register_number', s.register_number, 'full_name', s.full_name,
          'class_name', s.class_name, 'is_leader', tm.is_leader) order by tm.is_leader desc, s.full_name)
        from public.team_members tm join public.students s on s.id = tm.student_id
        where tm.team_id = t.id)
    ) end
  ) order by er.registered_at desc), '[]'::jsonb)
  from public.event_registrations er
  join public.events e on e.id = er.event_id
  left join public.teams t on t.id = er.team_id
  left join public.event_attendance ea on ea.event_id = er.event_id and ea.student_id = er.student_id
  where er.student_id = public.current_student_id();
$$;

create or replace function public.admin_event_roster(p_event_id uuid)
returns jsonb language plpgsql stable security definer set search_path = public as $$
begin
  perform public.require_admin();
  if (select is_mandatory from public.events where id = p_event_id) then
    return (
      select coalesce(jsonb_agg(jsonb_build_object(
        'registration_id', s.id, 'student_id', s.id, 'register_number', s.register_number,
        'full_name', s.full_name, 'class_name', s.class_name, 'phone', s.phone,
        'registration_status', 'mandatory', 'registered_at', null,
        'team_id', null, 'team_name', null, 'is_leader', null,
        'slot_id', null, 'session_starts_at', null,
        'attendance_status', ea.status, 'marked_at', ea.marked_at
      ) order by s.class_name, s.full_name), '[]'::jsonb)
      from public.students s
      left join public.event_attendance ea on ea.event_id = p_event_id and ea.student_id = s.id
      where s.student_status = 'active'
    );
  end if;
  return (
    select coalesce(jsonb_agg(jsonb_build_object(
      'registration_id', er.id, 'student_id', s.id, 'register_number', s.register_number,
      'full_name', s.full_name, 'class_name', s.class_name, 'phone', s.phone,
      'registration_status', er.registration_status, 'registered_at', er.registered_at,
      'team_id', t.id, 'team_name', t.team_name, 'is_leader', t.leader_student_id = s.id,
      'slot_id', er.slot_id, 'session_starts_at', sl.starts_at,
      'attendance_status', ea.status, 'marked_at', ea.marked_at
    ) order by sl.starts_at nulls last, t.team_name nulls last, s.class_name, s.full_name), '[]'::jsonb)
    from public.event_registrations er
    join public.students s on s.id = er.student_id
    left join public.teams t on t.id = er.team_id
    left join public.event_schedule_slots sl on sl.id = er.slot_id
    left join public.event_attendance ea on ea.event_id = er.event_id and ea.student_id = er.student_id
    where er.event_id = p_event_id and er.registration_status <> 'cancelled'
  );
end $$;

revoke execute on function public.resolve_event_session(uuid, uuid) from public, anon;
revoke execute on function public.register_individual_event(uuid, uuid) from public, anon;
revoke execute on function public.register_team_event(uuid, text, text[], uuid) from public, anon;
revoke execute on function public.change_my_session(uuid, uuid) from public, anon;
grant  execute on function public.register_individual_event(uuid, uuid) to authenticated;
grant  execute on function public.register_team_event(uuid, text, text[], uuid) to authenticated;
grant  execute on function public.change_my_session(uuid, uuid) to authenticated;

notify pgrst, 'reload schema';

commit;
