-- REDTHREAD :: 0010 :: Active Files (modern, open, weird)
-- Modern/active unsolved mysteries with genuinely strange nuances — the new
-- center of gravity. featured_rank 50+ marks the "Active Files" wing (the archive
-- groups them). Documented fact vs. labeled speculation; living-person caution
-- applies (no asserted cause/foul play about named private individuals). A couple
-- of "solved-but-eerie" entries (Wow!, Salish feet) keep the canon honest.

insert into public.boards
  (slug, title, summary, category, visibility, status, is_canon, plausibility, verdict, featured_rank)
values
('the-missing-411-file','Missing 411','People vanish in national parks and forests with the same eerie fingerprints — found in already-searched areas, missing shoes, near boulders and water, search dogs unable to track.','disappearance','public','open',true,35,'The eeriest pattern is how reliably ordinary tragedy starts to rhyme once you map it.',50),
('the-plum-island-file','Plum Island and Lab 257','A Cold-War animal-disease lab — once tied to a Paperclip ex-Nazi virologist — sits in eyeshot of Lyme, Connecticut.','coverup','public','open',true,40,'The lab is real, the ex-Nazi is real, the geography is perfect — and the bacterium has an alibi from the Stone Age.',51),
('the-havana-syndrome-file','Havana Syndrome','Since 2016, US diplomats and officers report sudden directional pressure, sound, and cognitive symptoms across many countries.','phenomenon','public','open',true,60,'A deniable energy weapon, or the most security-cleared case of collective dread on record. The official answer keeps changing.',52),
('the-max-headroom-file','The Max Headroom Intrusion','In 1987 someone in a Max Headroom mask hijacked two Chicago TV stations — and was never identified.','event','public','open',true,80,'Solved in every way except who, why, and the flyswatter.',53),
('the-yuba-county-five-file','The Yuba County Five','Five men vanish after a 1978 ballgame; their working car is found 70 miles the wrong way, up a snowbound mountain road.','disappearance','public','open',true,55,'Every single fact has an explanation. The sequence does not.',54),
('the-lead-masks-file','The Lead Masks Case','Two technicians are found dead on a Brazilian hillside in 1966 wearing homemade lead eye-masks, beside a cryptic note.','event','public','open',true,55,'Two men followed written instructions to await a signal. The universe declined to follow up.',55),
('the-cicada-3301-file','Cicada 3301','Anonymous, fiendish global puzzle hunts from 2012 to 2017 seemingly recruiting brilliant minds — the authors were never found.','phenomenon','public','open',true,50,'Someone very smart wanted very smart people, then ghosted the entire internet.',56),
('the-hum-file','The Hum','A low droning hum heard by a minority of people worldwide — and often unrecordable by instruments.','phenomenon','public','open',true,50,'Earth may be humming, or a few thousand inner ears are improvising the same note.',57),
('the-uvb-76-file','UVB-76 (The Buzzer)','A Russian shortwave station has buzzed on 4625 kHz for decades, broken only by cryptic coded voice messages.','phenomenon','public','open',true,45,'Probably a bored soldier and a marker tone. Probably.',58),
('the-dyatlov-pass-file','The Dyatlov Pass Incident','Nine experienced hikers flee their tent — cut open from the inside — into a lethal 1959 night, some barely dressed.','event','public','open',true,40,'Probably physics. The kind that still needs several footnotes and a brave editor.',59),
('the-wow-signal-file','The Wow! Signal','A 72-second narrowband radio burst from deep space in 1977 — circled "Wow!" and never repeated.','phenomenon','public','closed',true,30,'The aliens, regrettably, appear to have been a hydrogen cloud clearing its throat.',60),
('the-salish-sea-feet-file','The Salish Sea Feet','Since 2007, sneaker-clad human feet keep washing ashore around the Pacific Northwest.','phenomenon','public','closed',true,10,'Not a serial killer — just buoyancy, biology, and Big Sneaker.',61)
on conflict (slug) do nothing;

-- ── Pins ─────────────────────────────────────────────────────────────────────
-- Headliners get fuller files.

insert into public.nodes (board_id, type, title, body, x, y, source_url)
select b.id, v.ntype::public.node_type, v.title, v.body, v.x, v.y, v.src
from public.boards b
cross join (values
  ('claim','The pattern','[DOCUMENTED] Ex-cop David Paulides compiled hundreds of wilderness disappearances and argues they share a profile. The NPS has historically kept no central missing-persons database.',-240,-30,'https://en.wikipedia.org/wiki/David_Paulides'),
  ('theory','The weird profile','[SPECULATION — his asserted patterns] Found in already-searched areas; improbably far away or uphill; missing shoes or clothing; clustered near water, boulders and berry bushes; dogs unable to track; sudden weather erasing tracks.',90,-150,null),
  ('event','Dennis Martin, age 6','[DOCUMENTED] Vanished during a game of hide-and-seek in the Great Smoky Mountains, 1969. ~1,400 searchers; a 3-inch downpour washed out the tracks. Never found.',120,110,'https://en.wikipedia.org/wiki/Disappearance_of_Dennis_Martin'),
  ('claim','The skeptic note','[DOCUMENTED] Data-scientist and Skeptical Inquirer reviews found the cases not beyond base-rate expectation. A pattern — or pattern-seeking?',-220,170,'https://skepticalinquirer.org/2017/07/an-investigation-of-the-missing411-conspiracy/')
) as v(ntype,title,body,x,y,src)
where b.slug = 'the-missing-411-file';

insert into public.nodes (board_id, type, title, body, x, y, source_url)
select b.id, v.ntype::public.node_type, v.title, v.body, v.x, v.y, v.src
from public.boards b
cross join (values
  ('claim','The lab is real','[DOCUMENTED] The Plum Island Animal Disease Center sits ~14km from Lyme, Connecticut. Its early mission included anti-animal biological-warfare research (Building 257). US offensive BW ended in 1969.',-240,-30,'https://en.wikipedia.org/wiki/Plum_Island_Animal_Disease_Center'),
  ('person','Erich Traub','[DOCUMENTED] A Nazi-era bioweapons virologist brought to the US via Operation Paperclip, associated with the program. His exact Plum Island duties are contested.',90,-150,null),
  ('theory','The Stone-Age alibi','[SPECULATION, rejected] That Lyme escaped the lab. But Borrelia predates it by millennia — the 5,300-year-old Otzi ice mummy tested positive. A 2025 FDA-official endorsement was rejected by scientists.',110,120,null)
) as v(ntype,title,body,x,y,src)
where b.slug = 'the-plum-island-file';

-- The rest: documented weird fact (left) + the theory (right).
insert into public.nodes (board_id, type, title, body, x, y, source_url)
select b.id, v.ntype::public.node_type, v.title, v.body,
  case when v.ntype = 'theory' then 150 else -160 end,
  case when v.ntype = 'theory' then 40 else -20 end,
  v.src
from public.boards b
join (values
  ('the-havana-syndrome-file','event','The beam','[DOCUMENTED] From 2016: sudden directional pressure, sound and cognitive symptoms across countries. NIH (2024) found no MRI-detectable brain injury versus controls.','https://www.nih.gov/news-events/news-releases/nih-studies-find-severe-symptoms-havana-syndrome-no-evidence-mri-detectable-brain-injury-or-biological-abnormalities'),
  ('the-havana-syndrome-file','theory','Weapon or dread','[SPECULATION] A pulsed RF/microwave device versus mass sociogenic illness. The 2025 intelligence assessment leaned "unlikely a foreign actor" — with two agencies dissenting.',null),
  ('the-max-headroom-file','event','The hijack','[DOCUMENTED] Nov 1987: two Chicago stations were overpowered by a masked figure, requiring serious microwave engineering and line-of-sight to the towers.','https://en.wikipedia.org/wiki/Max_Headroom_signal_hijacking'),
  ('the-max-headroom-file','claim','Free to confess','[DOCUMENTED] The statute of limitations expired in 1992 — the culprits could admit it with impunity, and still nobody has.',null),
  ('the-yuba-county-five-file','event','The wrong turn','[DOCUMENTED] 1978: five men vanish after a game; their functional car, with gas, is found 70 miles up a snowy mountain road they had no reason to take.','https://en.wikipedia.org/wiki/Yuba_County_Five'),
  ('the-yuba-county-five-file','theory','The baffling sequence','[SPECULATION] Four are later found dead of exposure; one never found. One man survived weeks in a stocked forest trailer he barely used. The choices defy mundane theory.',null),
  ('the-lead-masks-file','event','The hillside','[DOCUMENTED] 1966: two technicians found dead on Vintem Hill, Brazil, in suits and homemade lead eye-masks, money intact, no signs of violence.','https://en.wikipedia.org/wiki/Lead_masks_case'),
  ('the-lead-masks-file','theory','The note','[SPECULATION] A note read: be at the place 16:30, ingest capsules 18:30, protect metals, await the mask signal. The signal never came.',null),
  ('the-cicada-3301-file','claim','The hunt','[DOCUMENTED] 2012 to 2017: anonymous PGP-signed puzzles using cryptography, steganography and real-world GPS clues, seemingly recruiting talent.','https://en.wikipedia.org/wiki/Cicada_3301'),
  ('the-cicada-3301-file','theory','Who, and why','[SPECULATION] An intelligence front, a crypto society, or an ARG. The 2014 puzzle and the book Liber Primus remain partly unsolved; the authors are unknown.',null),
  ('the-hum-file','claim','Selective sound','[DOCUMENTED] A low hum (~32 to 80 Hz) heard by a minority of people (about 2 percent in Taos); non-hearers in the same room hear nothing; instruments often record nothing.','https://en.wikipedia.org/wiki/The_Hum'),
  ('the-hum-file','theory','Inside or out','[SPECULATION] Internal otoacoustic generation versus industrial infrasound. The selective audibility stays unresolved.',null),
  ('the-uvb-76-file','claim','The buzz','[DOCUMENTED] 4625 kHz, roughly 25 buzzes a minute, nearly 24/7 for decades, interrupted by coded Russian voice messages. Still on air.','https://en.wikipedia.org/wiki/UVB-76'),
  ('the-uvb-76-file','theory','A channel for what','[SPECULATION] Likely a military marker or command channel. Its purpose has never been officially acknowledged.',null),
  ('the-dyatlov-pass-file','event','Cut from inside','[DOCUMENTED] 1959: nine hikers flee a tent slashed open from within into -25C; some barely dressed; several with severe internal injuries.','https://en.wikipedia.org/wiki/Dyatlov_Pass_incident'),
  ('the-dyatlov-pass-file','theory','Slab, not curse','[SPECULATION] A 2021 paper modeled a delayed slab avalanche as plausible; critics note the shallow slope and the absence of avalanche signs.',null),
  ('the-wow-signal-file','event','Seventy-two seconds','[DOCUMENTED] 1977: a narrowband burst from Sagittarius at the Big Ear telescope, near the hydrogen line; famously circled "Wow!" Never repeated.','https://en.wikipedia.org/wiki/Wow!_signal'),
  ('the-wow-signal-file','theory','A cloud clearing its throat','[SPECULATION] A 2024 study proposes a rare hydrogen-cloud brightening as the source. The beacon, alas, may be gas.',null),
  ('the-salish-sea-feet-file','event','The feet','[DOCUMENTED] Since 2007, more than 20 sneaker-clad human feet have washed ashore around the Salish Sea. Foul play ruled out; most were DNA-matched to missing persons.','https://en.wikipedia.org/wiki/Salish_Sea_human_foot_discoveries'),
  ('the-salish-sea-feet-file','theory','Buoyancy, not a butcher','[SPECULATION, now consensus] Ankles disarticulate first; modern foam sneakers float and protect the foot; the tides trap them.',null)
) as v(slug,ntype,title,body,src) on b.slug = v.slug
where b.is_canon = true;

-- ── A little red string on the two headliners ────────────────────────────────
insert into public.edges (board_id, source_node_id, target_node_id, kind, label)
select n1.board_id, n1.id, n2.id, 'connects'::public.edge_kind, v.label
from (values
  ('the-missing-411-file','The pattern','The weird profile','claims'),
  ('the-missing-411-file','The weird profile','The skeptic note','challenged by'),
  ('the-missing-411-file','The pattern','Dennis Martin, age 6','example'),
  ('the-plum-island-file','The lab is real','Erich Traub','staffed by'),
  ('the-plum-island-file','The lab is real','The Stone-Age alibi','refuted by')
) as v(slug, src_title, tgt_title, label)
join public.boards b on b.slug = v.slug
join public.nodes n1 on n1.board_id = b.id and n1.title = v.src_title
join public.nodes n2 on n2.board_id = b.id and n2.title = v.tgt_title;
