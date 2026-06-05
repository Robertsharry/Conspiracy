-- REDTHREAD :: 0008 :: The Canon (curated seed)
-- Editorial canon: ranked case files. Missing scientists at the top (full with
-- pins + red string), a disappearances wing, and conspiracies ranked by OUR
-- plausibility. Everything separates documented fact from labeled speculation;
-- two solved homicides on the popular "dead scientists" list are deliberately
-- excluded (real families, no romanticizing). Canon rows have created_by = null
-- and are inserted via migration (RLS-exempt). Idempotent on slug.

-- ── Boards ───────────────────────────────────────────────────────────────────
insert into public.boards
  (slug, title, summary, category, visibility, status, is_canon, plausibility, verdict, featured_rank)
values
-- Missing Scientists (featured at the top)
('the-frank-olson-file','The Frank Olson File','A US Army biological-warfare scientist falls from a 13th-floor New York hotel window in 1953 — nine days after the CIA secretly dosed him with LSD.','person','public','cold',true,60,'The LSD-dosing and the cover-up are on the record. The shove out the window is not — yet.',1),
('the-gerald-bull-file','The Gerald Bull File','The "supergun" engineer building a 1,000mm cannon for Saddam Hussein is shot five times at his Brussels door in 1990. Nothing was stolen.','person','public','cold',true,95,'Not a mystery — an assassination. Only the trigger finger stays anonymous.',2),
('the-david-kelly-file','The David Kelly File','A UK weapons inspector who disputed the Iraq-WMD dossier is found dead in the woods days after being named as the source (2003).','person','public','cold',true,30,'Ruled a suicide. The doubt was buried with him, and keeps clawing back up.',3),
('the-rudolf-diesel-file','The Rudolf Diesel File','The inventor of the diesel engine vanishes overnight from a Channel steamer in 1913, on the eve of war.','person','public','cold',true,35,'Walked to his cabin and into legend. Financial ruin explains it; the timing refuses to.',4),
-- Disappearances
('the-db-cooper-file','The D.B. Cooper File','A hijacker takes 200,000 dollars and parachutes from a 727 over the Pacific Northwest in 1971, never to be identified.','disappearance','public','cold',true,90,'A true open file. The FBI gave up in 2016; the legend never will.',null),
('the-mary-celeste-file','The Mary Celeste File','An American merchant brigantine is found adrift in 1872 — seaworthy, provisioned, crew gone, one lifeboat missing.','disappearance','public','cold',true,60,'Real and unresolved — though a panicked lifeboat explains more than a sea monster.',null),
('the-roanoke-file','The Roanoke Lost Colony File','115 English colonists vanish from Roanoke Island by 1590, leaving only CROATOAN carved into a post.','disappearance','public','cold',true,40,'Looks less lost every year. CROATOAN reads like a forwarding address.',null),
('the-amelia-earhart-file','The Amelia Earhart File','The pioneering aviator and her navigator Fred Noonan vanish over the Pacific near Howland Island in 1937.','disappearance','public','cold',true,35,'Genuinely unsolved — but the ocean is vast and fuel is finite.',null),
('the-flight-19-file','The Flight 19 File','Five Navy bombers, and the seaplane sent to find them, vanish off Florida in 1945. The Bermuda Triangle legend is born.','disappearance','public','cold',true,30,'A navigation error in a supernatural costume. Tragic, and mostly explained.',null),
-- Conspiracies, ranked by plausibility
('the-mkultra-file','MKUltra','The CIA program of human experiments with LSD, hypnosis, and electroshock from 1953 to 1973 — often without consent.','coverup','public','closed',true,100,'Not a theory. A budget line.',null),
('the-cointelpro-file','COINTELPRO','The FBI illegal campaign from 1956 to 1971 to surveil, infiltrate, and discredit civil-rights and antiwar groups.','coverup','public','closed',true,100,'The government wrote the documents so you did not have to.',null),
('the-tuskegee-file','The Tuskegee Study','US health officials let syphilis go untreated in roughly 399 Black men for 40 years to study the disease (1932 to 1972).','coverup','public','closed',true,100,'The reason "informed consent" is a phrase you have heard.',null),
('the-northwoods-file','Operation Northwoods','A 1962 Joint Chiefs plan to stage fake attacks on Americans and blame Cuba — to justify a war.','conspiracy','public','closed',true,100,'The receipts are real. The body count, thankfully, is zero — Kennedy said no.',null),
('the-gulf-of-tonkin-file','The Gulf of Tonkin Incident','The 1964 second attack used to escalate Vietnam — which an NSA history later concluded never happened.','event','public','closed',true,95,'A war on a typo, with extra steps.',null),
('the-area-51-file','Area 51','A Nevada base the government denied for decades — finally acknowledged by the CIA in 2013.','coverup','public','closed',true,80,'A real secret base, guarding a boringly terrestrial secret.',null),
('the-mockingbird-file','Operation Mockingbird','Cold-War CIA cultivation of journalists and outlets to place propaganda.','coverup','public','open',true,75,'The phenomenon is documented; the tidy brand name is fan fiction.',null),
('the-jfk-file','The JFK Assassination','Lone gunman, or conspiracy? Even the official bodies disagree.','event','public','open',true,50,'Even the official conspiracy verdict leaned on a recording experts later threw out.',null),
('the-roswell-file','The Roswell Incident','A 1947 crashed flying disc near Roswell, New Mexico — later tied to a secret balloon program.','event','public','closed',true,15,'There was a cover-up, alright — of spy balloons, not spacemen.',null),
('the-denver-airport-canon','Denver International Airport','Apocalyptic murals, a demon horse, and tunnels said to mark a New World Order headquarters.','phenomenon','public','closed',true,5,'The only documented conspiracy here is the marketing department.',null),
('the-bermuda-triangle-file','The Bermuda Triangle','A stretch of Atlantic that supposedly swallows ships and planes.','phenomenon','public','closed',true,5,'A statistics lesson cosplaying as a mystery.',null),
('the-moon-landing-file','The Moon-Landing Hoax','The claim that Apollo was faked on a soundstage.','phenomenon','public','closed',true,2,'The Soviets, who lost the race, somehow forgot to call it in.',null)
on conflict (slug) do nothing;

-- ── Pins (nodes) ─────────────────────────────────────────────────────────────
-- Missing scientists: full files (person + event + theory + counterpoint).

insert into public.nodes (board_id, type, title, body, x, y, source_url)
select b.id, v.ntype::public.node_type, v.title, v.body, v.x, v.y, v.src
from public.boards b
cross join (values
  ('person','Dr. Frank Olson','US Army bacteriologist at Fort Detrick. Fell from the 13th floor of the Hotel Statler in New York, 28 Nov 1953.',-240,-40,'https://en.wikipedia.org/wiki/Frank_Olson'),
  ('event','Dosed with LSD','[DOCUMENTED] Covertly given LSD by the CIA MKUltra team nine days before his death — admitted by the US government in 1975.',80,-150,'https://nsarchive.gwu.edu/briefing-book/dnsa-intelligence/2025-10-30/top-secret-testimony-cias-mkultra-chief-50-years-later'),
  ('theory','Pushed, not jumped','[SPECULATION] A 1994 exhumation found a skull injury some deemed inconsistent with a fall; the DA reclassified the death to "unknown." Argued, not proven.',120,110,null),
  ('claim','The apology','[DOCUMENTED] President Ford and CIA Director Colby personally apologized; the family received a settlement.',-220,170,null)
) as v(ntype,title,body,x,y,src)
where b.slug = 'the-frank-olson-file';

insert into public.nodes (board_id, type, title, body, x, y, source_url)
select b.id, v.ntype::public.node_type, v.title, v.body, v.x, v.y, v.src
from public.boards b
cross join (values
  ('person','Dr. Gerald Bull','Ballistics genius behind Project Babylon, a supergun for Iraq. Killed at his Brussels apartment, 22 Mar 1990.',-240,-40,'https://en.wikipedia.org/wiki/Gerald_Bull'),
  ('event','Five shots, nothing stolen','[DOCUMENTED] Shot five times in the neck and head with a suppressed pistol; cash and valuables left untouched. The signature of a hit.',90,-140,null),
  ('theory','Whose contract?','[SPECULATION] Widely attributed to Mossad; other candidates floated include Iran, the CIA, MI6, or Iraq itself. Never adjudicated.',110,120,null)
) as v(ntype,title,body,x,y,src)
where b.slug = 'the-gerald-bull-file';

insert into public.nodes (board_id, type, title, body, x, y, source_url)
select b.id, v.ntype::public.node_type, v.title, v.body, v.x, v.y, v.src
from public.boards b
cross join (values
  ('person','Dr. David Kelly','UK biological-weapons inspector. Found dead in woods near his home, 18 Jul 2003, after being named as a BBC source.',-240,-40,'https://en.wikipedia.org/wiki/David_Kelly_(weapons_expert)'),
  ('event','The Hutton Inquiry','[DOCUMENTED] The 2004 inquiry ruled suicide, no third-party involvement. In 2011 the Attorney General called the evidence "overwhelming."',90,-140,'https://en.wikipedia.org/wiki/Hutton_Inquiry'),
  ('theory','The doctors who dissented','[SPECULATION] In 2010 a group of doctors publicly challenged the medical plausibility of the cause of death. The state position has not moved.',110,120,null)
) as v(ntype,title,body,x,y,src)
where b.slug = 'the-david-kelly-file';

insert into public.nodes (board_id, type, title, body, x, y, source_url)
select b.id, v.ntype::public.node_type, v.title, v.body, v.x, v.y, v.src
from public.boards b
cross join (values
  ('person','Rudolf Diesel','Inventor of the diesel engine. Vanished from the steamer Dresden crossing the English Channel, 29 Sep 1913.',-240,-40,'https://en.wikipedia.org/wiki/Rudolf_Diesel'),
  ('event','The unslept bed','[DOCUMENTED] He asked to be woken at 6am and was never seen again; his bed was unslept-in. A decomposed body was later identified by personal effects.',90,-140,null),
  ('theory','Killed for the engine','[SPECULATION] That he was murdered to stop him sharing diesel tech with Britain on the eve of WWI. Popularized recently; financial-suicide remains the simplest fit.',110,120,null)
) as v(ntype,title,body,x,y,src)
where b.slug = 'the-rudolf-diesel-file';

-- Disappearances + conspiracies: documented fact vs. the theory (2 pins each).
insert into public.nodes (board_id, type, title, body, x, y, source_url)
select b.id, v.ntype::public.node_type, v.title, v.body,
  case when v.ntype = 'theory' then 140 else -160 end,
  case when v.ntype = 'theory' then 40 else -20 end,
  v.src
from public.boards b
join (values
  ('the-db-cooper-file','event','The jump','[DOCUMENTED] Nov 1971: a man hijacks Flight 305, takes 200,000 dollars and parachutes from the aft stairs over Washington state. In 1980 a boy finds 5,800 dollars of marked bills by the Columbia River.','https://www.fbi.gov/history/cases-and-criminals/db-cooper-hijacking'),
  ('the-db-cooper-file','theory','Survived, or not','[SPECULATION] Did he die on a night jump in wooded terrain, or vanish into a new life? Named persons remain FBI persons of interest only — never the proven hijacker.',null),
  ('the-mary-celeste-file','event','Found adrift','[DOCUMENTED] Dec 1872: discovered seaworthy and provisioned, cargo intact, ten people and the single lifeboat gone. A British inquiry found no evidence of foul play.','https://www.smithsonianmag.com/history/abandoned-ship-the-mary-celeste-174488104/'),
  ('the-mary-celeste-file','theory','The panicked abandonment','[SPECULATION] Leading view: the captain misread flooding or feared the alcohol cargo and ordered everyone into a lifeboat that was then lost. Pirates and sea monsters are discredited.',null),
  ('the-roanoke-file','event','CROATOAN','[DOCUMENTED] In 1590 John White returns to find the colony gone and the settlement dismantled, with CROATOAN carved on a post — the name of a real nearby island and people.','https://en.wikipedia.org/wiki/Roanoke_Colony'),
  ('the-roanoke-file','theory','Assimilation','[SPECULATION] The leading theory: they moved to Croatoan/Hatteras and merged with the local people. 2025 archaeology strengthens it but is not conclusive.',null),
  ('the-amelia-earhart-file','event','Lost near Howland','[DOCUMENTED] Jul 1937: a final radio call reports low fuel; the largest US search to that date finds nothing.','https://en.wikipedia.org/wiki/Speculation_on_the_disappearance_of_Amelia_Earhart_and_Fred_Noonan'),
  ('the-amelia-earhart-file','theory','Crash, castaway, or capture','[SPECULATION] Crash-and-sink (most accepted), the Nikumaroro castaway theory, or capture in the Marshall Islands (least supported).',null),
  ('the-flight-19-file','event','Lost over the Atlantic','[DOCUMENTED] Dec 1945: five Avengers vanish on a training flight; a Mariner sent to search also disappears. 27 men lost; no confirmed wreckage found.','https://www.history.navy.mil/browse-by-topic/disasters-and-phenomena/flight-19.html'),
  ('the-flight-19-file','theory','Compass, not curse','[SPECULATION] Investigators blamed compass failure and disorientation, later softened to "cause unknown." The Mariner likely exploded. No supernatural cause needed.',null),
  ('the-mkultra-file','claim','The surviving pages','[DOCUMENTED] Most records were destroyed in 1973, but ~20,000 pages survived a filing error and were released via FOIA and the Church Committee.','https://en.wikipedia.org/wiki/MKUltra'),
  ('the-mkultra-file','theory','How far did it go','[SPECULATION] Operational uses beyond the documented experiments remain argued — the destroyed files guarantee the debate never ends.',null),
  ('the-cointelpro-file','claim','The Media burglary','[DOCUMENTED] Exposed in 1971 when activists burgled an FBI office in Media, PA and leaked 1,000+ documents; later condemned by the Church Committee and courts.','https://en.wikipedia.org/wiki/COINTELPRO'),
  ('the-cointelpro-file','theory','Did it ever stop','[SPECULATION] Whether the tactics truly ended in 1971 or simply changed names is a live question.',null),
  ('the-tuskegee-file','claim','Forty years','[DOCUMENTED] Penicillin was standard by ~1947 yet deliberately withheld; the study ran until a 1972 press leak, prompting federal consent reforms and a 1997 apology.','https://www.cdc.gov/tuskegee/about/index.html'),
  ('the-tuskegee-file','theory','Erosion of trust','[SPECULATION] Often cited as a root of enduring distrust in public-health institutions.',null),
  ('the-northwoods-file','claim','Rejected, not executed','[DOCUMENTED] Real 1962 memoranda presented to SecDef McNamara; rejected by President Kennedy; declassified in 1997 via the JFK Records Review Board.','https://en.wikipedia.org/wiki/Operation_Northwoods'),
  ('the-northwoods-file','theory','What it proves','[SPECULATION] Proof that such plans can be drafted at the highest levels — fuel for every false-flag argument since.',null),
  ('the-gulf-of-tonkin-file','claim','No second attack','[DOCUMENTED] A declassified NSA history (2005 to 2007) concluded the 4 Aug 1964 attack never happened and that intelligence was skewed to suggest one.','https://en.wikipedia.org/wiki/Gulf_of_Tonkin_incident'),
  ('the-gulf-of-tonkin-file','theory','Mistake or pretext','[SPECULATION] Honest fog-of-war error, or a manufactured pretext for escalation? The result was the same.',null),
  ('the-area-51-file','claim','Officially acknowledged','[DOCUMENTED] The CIA acknowledged the base and its role testing the U-2 and OXCART spy planes in a 2013 FOIA release.','https://en.wikipedia.org/wiki/Area_51'),
  ('the-area-51-file','theory','The alien angle','[SPECULATION] Crashed craft and bodies — no evidence. The secrecy was about reconnaissance aircraft, not visitors.',null),
  ('the-mockingbird-file','claim','Church Committee findings','[DOCUMENTED] The 1976 Church Committee confirmed CIA relationships with journalists and a network influencing foreign media.','https://en.wikipedia.org/wiki/Operation_Mockingbird'),
  ('the-mockingbird-file','theory','The named program','[SPECULATION] No declassified document confirms a single domestic program literally named "Mockingbird" controlling US media.',null),
  ('the-jfk-file','event','Two official verdicts','[DOCUMENTED] The Warren Commission said lone gunman; the 1979 HSCA said "probably a conspiracy" — but agreed Oswald fired the hits.','https://en.wikipedia.org/wiki/United_States_House_Select_Committee_on_Assassinations'),
  ('the-jfk-file','theory','The discredited dictabelt','[SPECULATION] The HSCA conspiracy finding leaned largely on an acoustic recording that experts later discredited.',null),
  ('the-roswell-file','claim','Project Mogul','[DOCUMENTED] The debris was from Project Mogul, a secret balloon program to detect Soviet nuclear tests. The "weather balloon" line was itself a cover for Mogul.','https://en.wikipedia.org/wiki/Roswell_incident'),
  ('the-roswell-file','theory','The disc','[SPECULATION] Alien craft and bodies — unsupported. A real secret was hidden; it just was not extraterrestrial.',null),
  ('the-denver-airport-canon','claim','The official story','[DOCUMENTED] The murals depict an environmental-destruction-to-peace narrative (per the artist); the Anubis statue was a 2010 museum ad; the tunnels are a baggage system.','https://www.flydenver.com/art-exhibits/conspiracy-theories-uncovered/'),
  ('the-denver-airport-canon','theory','Blucifer and the bunkers','[SPECULATION] Apocalyptic symbolism and secret bunkers point to a New World Order HQ. The airport now leans into the jokes in its own marketing.',null),
  ('the-bermuda-triangle-file','claim','The boring numbers','[DOCUMENTED] Lloyds of London charges no higher premiums there; the Coast Guard and NOAA say loss rates are unremarkable for such busy water.','https://oceanservice.noaa.gov/facts/bermudatri.html'),
  ('the-bermuda-triangle-file','theory','The legend','[SPECULATION] Many cited cases are exaggerated or happened elsewhere. The mystery is mostly in the storytelling.',null),
  ('the-moon-landing-file','claim','The evidence','[DOCUMENTED] Orbiter images of the landing sites, ~380kg of dated Moon rock, working retroreflectors, Soviet tracking, and ~400,000 workers who never broke ranks.','https://en.wikipedia.org/wiki/Third-party_evidence_for_Apollo_Moon_landings'),
  ('the-moon-landing-file','theory','The soundstage','[SPECULATION] That it was filmed on Earth — a secret that would have required hundreds of thousands of silent conspirators, including a losing rival superpower.',null)
) as v(slug,ntype,title,body,src) on b.slug = v.slug
where b.is_canon = true;

-- ── Red string on the scientist files ────────────────────────────────────────
insert into public.edges (board_id, source_node_id, target_node_id, kind, label)
select n1.board_id, n1.id, n2.id, 'connects'::public.edge_kind, v.label
from (values
  ('the-frank-olson-file','Dr. Frank Olson','Dosed with LSD','dosed'),
  ('the-frank-olson-file','Dosed with LSD','Pushed, not jumped','fuels'),
  ('the-frank-olson-file','Dr. Frank Olson','The apology','cover-up'),
  ('the-gerald-bull-file','Dr. Gerald Bull','Five shots, nothing stolen','killed'),
  ('the-gerald-bull-file','Five shots, nothing stolen','Whose contract?','points to'),
  ('the-david-kelly-file','Dr. David Kelly','The Hutton Inquiry','ruled on'),
  ('the-david-kelly-file','The Hutton Inquiry','The doctors who dissented','contested by'),
  ('the-rudolf-diesel-file','Rudolf Diesel','The unslept bed','last seen'),
  ('the-rudolf-diesel-file','The unslept bed','Killed for the engine','fuels')
) as v(slug, src_title, tgt_title, label)
join public.boards b on b.slug = v.slug
join public.nodes n1 on n1.board_id = b.id and n1.title = v.src_title
join public.nodes n2 on n2.board_id = b.id and n2.title = v.tgt_title;
