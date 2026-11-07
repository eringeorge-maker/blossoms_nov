-- =============================================================
-- Blossoms Fest — Migration 012: Pot Pourri and Mono Acting run once
-- "website schedule.pdf" lists them on 17 Nov in the same room as two separate events:
-- Pot Pourri at 12:45 PM and Mono Acting at 3:45 PM. Migration 011 had given both a
-- second session. Registrations on a removed slot fall back to the remaining one.
-- =============================================================
begin;

-- Pot Pourri (15b0627d…): keep the 12:45 PM slot, drop the 3:45 PM one.
update public.event_registrations set slot_id = null
 where slot_id = md5('15b0627d-39eb-54ff-83eb-3ac27d4f008f:evening')::uuid;
update public.teams set slot_id = null
 where slot_id = md5('15b0627d-39eb-54ff-83eb-3ac27d4f008f:evening')::uuid;
delete from public.event_schedule_slots
 where id = md5('15b0627d-39eb-54ff-83eb-3ac27d4f008f:evening')::uuid;
update public.event_schedule_slots
   set slot_title = null,
       starts_at  = '2026-11-17T12:45:00+05:30',
       ends_at    = '2026-11-17T15:30:00+05:30'
 where event_id = '15b0627d-39eb-54ff-83eb-3ac27d4f008f';

-- Mono Acting (60644374…): keep the 3:45 PM slot, drop the 12:45 PM one.
update public.event_registrations er set slot_id = null
  from public.event_schedule_slots s
 where er.slot_id = s.id and s.event_id = '60644374-0747-58b5-b050-a742464f286f'
   and s.id <> md5('60644374-0747-58b5-b050-a742464f286f:evening')::uuid;
update public.teams t set slot_id = null
  from public.event_schedule_slots s
 where t.slot_id = s.id and s.event_id = '60644374-0747-58b5-b050-a742464f286f'
   and s.id <> md5('60644374-0747-58b5-b050-a742464f286f:evening')::uuid;
delete from public.event_schedule_slots
 where event_id = '60644374-0747-58b5-b050-a742464f286f'
   and id <> md5('60644374-0747-58b5-b050-a742464f286f:evening')::uuid;
update public.event_schedule_slots
   set slot_title = null,
       starts_at  = '2026-11-17T15:45:00+05:30',
       ends_at    = '2026-11-17T19:00:00+05:30'
 where event_id = '60644374-0747-58b5-b050-a742464f286f';

-- Both now have one slot: point any registration at it, so My events shows the time.
update public.event_registrations er set slot_id = s.id
  from public.event_schedule_slots s
 where s.event_id = er.event_id and er.slot_id is null
   and er.event_id in ('15b0627d-39eb-54ff-83eb-3ac27d4f008f', '60644374-0747-58b5-b050-a742464f286f');

commit;
