-- REDTHREAD :: 0009 :: Roanoke is no longer "lost"
-- Mounting Hatteras/Croatoan archaeology points to assimilation, not vanishing.
-- Update the canon file to reflect an effectively-solved case (the canon updates
-- its own verdicts — that honesty is the point).

update public.boards set
  status = 'closed',
  plausibility = 10,
  summary = 'Once "the Lost Colony." The trail led to Hatteras Island, where mounting archaeology says the colonists assimilated with the Croatoan people. Less lost every year.',
  verdict = 'Case effectively closed: not lost, relocated. CROATOAN was a forwarding address.'
where slug = 'the-roanoke-file' and is_canon = true;
