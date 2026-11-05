// Everything the game says, and the maps it says it on. The words are Rowan's.
// Change the story here; logic.ts never needs to know.

export const GAME_NAME = "LATE GAME";

const GH = "https://github.com/roesorcerer/";
const EMAIL = "mailto:rowanstratton1@gmail.com";

export const DIRS = [[0, -1], [1, 0], [0, 1], [-1, 0]] as const;
export const DIR_NAMES = ["NORTH", "EAST", "SOUTH", "WEST"] as const;

export type RoleKey = "hm" | "dev" | "res" | "game" | "trav";
export type Link = [label: string, href: string];

export interface Role {
  key: string;
  label: string;
  cls: string;
  pitch: string;
  quest: string[];
  jump: number;
  guild: string;
}

export interface Floor {
  name: string;
  when: string;
  rowan: string;
  status: string;
  story: string;
  map: string[];
}

export interface Encounter {
  art: string;
  name: string;
  rounds: string[];
  result: string;
  links: Link[];
  notes?: Partial<Record<RoleKey, string>>;
  /** Finds the project whose case study this chapter links to. */
  study?: RegExp;
  lost?: boolean;
  win?: boolean;
  end?: boolean;
}

export interface Place {
  heading: string;
  lines: string[];
  links?: Link[];
}

export const SPRITES: Record<string, string[]> = {
  chest: ['................', '................', '...##########...', '..#++++++++++#..', '.#++++++++++++#.', '.##############.', '.#++++#..#++++#.', '.#++++#++#++++#.', '.#++++#..#++++#.', '.#++++####++++#.', '.#++++++++++++#.', '.##############.'],
  bug: ['...#........#...', '....#......#....', '.#...#....#...#.', '..#...####...#..', '...##+####+##...', '......####......', '..###.####.###..', '.#...######...#.', '#...########...#', '...#..####..#...', '..#...####...#..', '.#....#..#....#.'],
  robot: ['.......##.......', '.......++.......', '...##########...', '..#..........#..', '..#.++....++.#..', '..#.++....++.#..', '..#..........#..', '..#...####...#..', '...##########...', '.....######.....', '..############..', '..#.########.#..', '..#.########.#..', '..#.########.#..', '.....##..##.....', '.....##..##.....'],
  tome: ['..############..', '.#+++++++++++#..', '.#+#########+#..', '.#+#.......#+#..', '.#+#.##.##.#+#..', '.#+#.......#+#..', '.#+#.####..#+#..', '.#+#.......#+#..', '.#+#.###.#.#+#..', '.#+#.......#+#..', '.#+#########+#..', '.#+++++++++++#..', '.#############..', '.#...........#..', '.#############..'],
  truck: ['................', '................', '..#########.....', '..#+++++++#.....', '..#+++++++#####.', '..#+++++++#.+.#.', '..#+++++++#...#.', '..#+++++++#####.', '..#############.', '..#############.', '...###....###...', '..#...#..#...#..', '..#.+.#..#.+.#..', '...###....###...'],
  press: ['....########....', '....#......#....', '....#.####.#....', '....#......#....', '..############..', '.#............#.', '.#.++.....###.#.', '.#............#.', '.##############.', '.#.+.+.+.+.+.+#.', '.##############.', '...#........#...', '...#.######.#...', '...#........#...', '...##########...'],
  storm: ['................', '.....####.......', '...##....##.##..', '..#........#..#.', '.#.............#', '.#.............#', '..#############.', '.......++.......', '......++........', '.....+++++......', '........++......', '.......++.......', '......++........', '..#......#....#.', '.#......#....#..'],
  boss: ['.#............#.', '.##..........##.', '.###.######.###.', '..############..', '..############..', '.##############.', '.##++##..##++##.', '.##++##..##++##.', '.##############.', '..#####..#####..', '...##########...', '...#.##.##.#....', '...##########...', '....#.#..#.#....'],
  void: ['....########....', '...#........#...', '..#..++++++..#..', '..#.++++++++.#..', '..#.++++++++.#..', '..#.++++++++.#..', '..#.++++++++.#..', '..#.+++++++#.#..', '..#.++++++++.#..', '..#.++++++++.#..', '..#.++++++++.#..', '..#.++++++++.#..', '..#.++++++++.#..', '..############..', '.##############.']
};
export const PAWN = ['..###..', '..###..', '...#...', '.#####.', '...#...', '..#.#..', '.#...#.'];

export const ROLES: Record<RoleKey, Role> = {
  hm: { key: 'h', label: 'H)IRING MANAGER', cls: 'HIRING MANAGER', pitch: 'You want the short version: what I have done, how I work, and whether I fit.',
    quest: ['I will keep this quick.', 'Go to the Guild Hall for my record, then B7F for the work.', 'B1F to B4F are why I do not quit when things get hard.'],
    jump: 6, guild: 'Customer service, logistics, accounting and print production before software. Now full stack engineering, research and games.' },
  dev: { key: 'd', label: 'D)EVELOPER', cls: 'SOFTWARE DEVELOPER', pitch: 'You want to see the stack, the code, and how I think about building.',
    quest: ['You probably want the code.', 'Go to the Smithy for my stack, then B6F and B7F for what I built.', 'Every project with public source has a link in its treasure.'],
    jump: 5, guild: 'Full stack: TypeScript, React, Express, ASP.NET Core, MongoDB, SQL Server. Everything I list here, I have shipped or am building.' },
  res: { key: 'r', label: 'R)ESEARCHER', cls: 'RESEARCHER', pitch: 'You want the papers, the methods, and the findings.',
    quest: ['You are here for the research.', 'Go to the Library for the papers, then B7F for the studies.', 'My MS focused on gamification and narrative for student stress.'],
    jump: 6, guild: 'MS in Computer Science, with a focus on gamification. Mixed methods: surveys, co-design, field deployments, and usability evaluation.' },
  game: { key: 'g', label: 'G)AME DEVELOPER', cls: 'GAME DEVELOPER', pitch: 'You want to see what I made and how it plays.',
    quest: ['Good. This one is for you too.', 'Go to B7F for the games, then B8F for what I am building now.', 'You are also playing one of my games right now.'],
    jump: 6, guild: 'Godot, GDScript, state machines, boss encounters, difficulty tuning, and playtesting. Most of what I build right now is games.' },
  trav: { key: 't', label: 'T)RAVELER', cls: 'TRAVELER', pitch: 'You are just curious. Start at the beginning and walk the whole thing.',
    quest: ['Start at the beginning. There is no rush.'], jump: 0, guild: 'A person who took the long way and kept building.' }
};

export const FLOORS: Floor[] = [
  { name: 'B1F  NIGHT SCHOOL', when: 'HUDSON, WI', rowan: 'NIGHT STUDENT', status: 'TIRED',
    story: 'School for me started with trying to get my BS degree. This was rough, and I failed a lot.',
    map: ['#######', '#<....#', '###.#.#', '#...#.#', '#.###.#', '#..a#>#', '#######'] },
  { name: 'B2F  THE PRINT FLOOR', when: 'ST PAUL, ABOUT 2011 TO 2014', rowan: 'PRINT COORDINATOR', status: 'OK',
    story: 'School paused. I moved from Hudson, WI to St Paul, MN for a new job.',
    map: ['#######', '#<.a..#', '#.###.#', '#.....#', '###.###', '#b...>#', '#######'] },
  { name: 'B3F  THE LAST MILE', when: 'ABOUT 2014 TO 2019', rowan: 'CUSTOMER SERVICE', status: 'OK',
    story: 'Next came transportation. About five years of organizing and managing deliveries.',
    map: ['#######', '#<....#', '#####.#', '#.....#', '#.#####', '#.a..>#', '#######'] },
  { name: 'B4F  GRAND RAPIDS', when: 'GRAND RAPIDS, MN, 2019 ON', rowan: 'ACCOUNTING', status: 'OK',
    story: 'In 2019 I moved to Grand Rapids, MN.',
    map: ['#######', '#<..a.#', '###.#.#', '#b..#.#', '#.###.#', '#....>#', '#######'] },
  { name: 'B5F  BACK TO SCHOOL', when: 'TO OCTOBER 2023', rowan: 'CS STUDENT', status: 'TIRED',
    story: 'I went back. It was rough balancing everything.',
    map: ['#######', '#<.a..#', '#####.#', '#c...b#', '#.#####', '#...>.#', '#######'] },
  { name: 'B6F  THE COMMUNITY', when: 'AFTER GRADUATING', rowan: 'CS GRADUATE', status: 'OK',
    story: 'After school I used my skills to keep building for the community that I love.',
    map: ['#######', '#<..#.#', '##.##.#', '#..a..#', '#.###.#', '#b#.>.#', '#######'] },
  { name: 'B7F  DULUTH', when: 'TO MAY 2026', rowan: 'ENGINEER, RESEARCHER', status: 'OK',
    story: 'I moved to Duluth to go to school and learn. Here I built full stack applications, machine learning models and games, and wrote extensive research.',
    map: ['#########', '#<..a#b.#', '#.##.#.##', '#.c..#..#', '###.###.#', '#d...e..#', '#.###.#.#', '#...#f#>#', '#########'] },
  { name: 'B8F  THE WORKSHOP', when: 'COLERAINE, MN, RIGHT NOW', rowan: 'GAME DEVELOPER', status: 'READY',
    story: 'I live in Coleraine, MN now. These are the things on my bench.',
    map: ['#######', '#<.a..#', '###.#.#', '#b..#.#', '#.###.#', '#..c.d#', '#######'] }
];

export const ENCOUNTERS: Record<string, Encounter> = {
  '0a': { art: 'tome', lost: true, name: 'NIGHT CLASSES',
    rounds: ['I started at Rasmussen, going to school at night while I worked at McDonald\'s.', 'School often took a backseat.', 'The demands became too great.'],
    result: 'School paused. Not every fight is won the first time.', links: [],
    notes: { hm: 'I have been working since before I had a degree.' } },
  '1a': { art: 'press', name: 'MERRILL DATASITE',
    rounds: ['I went to work at Merrill Datasite in St Paul.'],
    result: 'I worked there from around 2011 to 2014.', links: [] },
  '1b': { art: 'storm', name: 'THE RESTRUCTURE',
    rounds: ['In 2014 or so, I left.', 'Right after that, the company started a restructure to remove all of its digital print coordinators.'],
    result: 'I got out just ahead of it.', links: [] },
  '2a': { art: 'truck', name: 'THE DELIVERIES',
    rounds: ['I got a job at Manna Freight, working at Last Mile as a customer service rep.', 'I organized and managed deliveries for about five years.'],
    result: 'I left in 2019 when I moved to Grand Rapids.', links: [],
    notes: { hm: 'About five years of customer service and logistics.' } },
  '3a': { art: 'tome', name: 'THE ACCOUNTING DEPARTMENT',
    rounds: ['I spent about a year at Arrowhead in Grand Rapids, working in their accounting department.'],
    result: 'Then the world changed.', links: [] },
  '3b': { art: 'storm', name: 'THE PANDEMIC',
    rounds: ['The pandemic meant I had to stay home.', 'I took that opportunity to go back to school.'],
    result: 'The stairs down open again.', links: [] },
  '4a': { art: 'bug', name: 'C++',
    rounds: ['During school I did a lot of coding in C++ with little projects.'],
    result: 'The bugs started to lose.', links: [],
    notes: { dev: 'C++ first, then Angular and SQL.' } },
  '4b': { art: 'chest', name: 'THE FIRST WEBSITES',
    rounds: ['I learned how to build websites using Angular and SQL.'],
    result: 'Now I could put things in front of people.', links: [] },
  '4c': { art: 'boss', win: true, name: 'THE DEGREE, AGAIN',
    rounds: ['This is the fight from the first floor.', 'It was rough balancing everything.', 'I eventually graduated in October 2023.'],
    result: 'BS in Computer Science.', links: [],
    notes: { hm: 'It took more than ten years from my first class. I finished it.' } },
  '5a': { art: 'robot', name: 'THE DISCORD BOT',
    rounds: ['I built a Discord bot that helps provide information on local food and events.'],
    result: 'Local food and events, in one place.', links: [],
    notes: { dev: 'Built for local people to actually use.' } },
  '5b': { art: 'chest', name: 'THE TRAILS APP',
    rounds: ['I created websites, like a local trails application that is gamified.'],
    result: 'Gamified, and built for my community.', links: [['SOURCE', GH + 'ItascaCountyExplore/tree/production']],
    notes: { res: 'An early gamified project.', game: 'An early gamified project.' } },
  '6a': { art: 'chest', study: /food\s*forward/i, name: 'FULL STACK APPLICATIONS',
    rounds: ['Food Forward, time management for a nonprofit that delivers meals to families in need.', 'Anime Ratings, on .NET 8 and Blazor.', 'This portfolio, on React, Express and MongoDB.'],
    result: 'Real applications with real logins, data and deployments.', links: [['FOOD FORWARD', GH + 'timemanager-foodforward'], ['ANIME RATINGS', GH + 'AnimeRatingsWeb/tree/chore/modernization-phase-0-1'], ['THIS SITE', GH + 'rowanPortfolio']],
    notes: { hm: 'I can own an application from requirements through deployment.', dev: 'React, React Native, Express, ASP.NET Core 8, EF Core, MongoDB, SQL Server, JWT auth, Docker, GitHub Actions.' } },
  '6b': { art: 'robot', name: 'MACHINE LEARNING',
    rounds: ['I built machine learning models, including a spam filter using a support vector machine.'],
    result: 'Another tool in the bag.', links: [],
    notes: { dev: 'Python, classical ML, k-means in a production nudging system.' } },
  '6c': { art: 'bug', study: /bug\s*cup|cup[\s-]*fill/i, name: 'THE GAMES',
    rounds: ['Bug Cup Fill: my first 3D game, made solo for a WarioWare game jam in Godot.', '3D Dungeon Explorer: a character controller and camera rig in Godot.', 'A wave shooter that adjusts its own difficulty, built for a published study.'],
    result: 'Most of what I build right now is games.', links: [['BUG CUP FILL', GH + 'cup-fill-game'], ['3D DUNGEON', GH + '3d-dungeon-game']],
    notes: { game: 'State machines, enemy spawners, boss encounters, adaptive audio, dynamic difficulty.', hm: 'I ship complete games, not just prototypes.' } },
  '6d': { art: 'tome', study: /\barchive\b/i, name: 'THE RESEARCH',
    rounds: ['I built a story game for college student stress and studied it in three phases.', 'A survey (N=38), co-design focus groups (N=30), and a five-day field study (N=20).', 'In the field study, stress went down (p=.018) and flourishing went up (p=.002).'],
    result: 'Five peer-reviewed papers. See the Library in town.', links: [['PAPERS', GH + 'Research-Publications'], ['SOURCE', GH + 'thearchive']],
    notes: { res: 'Research through Design, with reflexive thematic analysis and pre/post measures. Player choice predicted authenticity.', game: 'Player choice mattered more to engagement than visuals.', hm: 'I can run a project from question to published result.' } },
  '6e': { art: 'tome', name: 'THE CLASSROOM',
    rounds: ['I taught lab sections of 30+ students in programming and object-oriented design.'],
    result: 'Teaching Assistant, University of Minnesota Duluth.', links: [],
    notes: { hm: 'I can mentor. I also mentored 3 junior developers.' } },
  '6f': { art: 'boss', win: true, name: 'THE MASTERS DEGREE',
    rounds: ['I finished my MS in Computer Science, with an emphasis on gamification.'],
    result: 'MS, University of Minnesota Duluth, May 2026.', links: [] },
  '7a': { art: 'tome', name: 'WHAT THE MOUNTAIN KEEPS',
    rounds: ['It is the mid-2000s. Over one summer, a teen keeps a struggling house afloat and finds escape at Alder Hollow, a fading mountain resort about to be bought out.', 'There, the ghosts of the resort\'s past start to speak. The player chooses which ghosts to take in.', 'Those choices shape who the teen becomes.'],
    result: 'In progress.', links: [],
    notes: { game: 'Design goal: the player should feel what it is like to build a self out of whatever is around you when the adults cannot hold you, and see that the self they built was a choice.' } },
  '7b': { art: 'bug', name: 'METAMORPHOSIS',
    rounds: ['Gregor Samsa\'s unboxing stream is the only thing paying his family\'s debt.', 'One morning he wakes up as a giant insect, and he still has to go live at noon.'],
    result: 'In progress.', links: [],
    notes: {} },
  '7c': { art: 'tome', name: 'THIS GAME',
    rounds: ['You are playing it. My portfolio, told as a dungeon crawl.'],
    result: 'In progress. Thanks for testing it.', links: [['SOURCE', GH + 'rowanPortfolio']],
    notes: {} },
  '7d': { art: 'void', end: true, name: 'THE OPEN DOOR',
    rounds: ['I am currently looking for work.', 'While I look, I am enjoying game development, so I keep building.'],
    result: 'This is where the map ends for now. There is room in the party. If you have a floor to build, I would like to hear from you.',
    links: [['WRITE TO ME', EMAIL], ['RESUME', '/resume'], ['GITHUB', 'https://github.com/roesorcerer'], ['LINKEDIN', 'https://www.linkedin.com/in/rowan-stratton-611247247']] }
};

export const FLOOR_SUMMARY = [
  'School started at night at Rasmussen while I worked at McDonald\'s. It was rough, and I failed a lot.',
  'School paused. I moved to St Paul and went to work at Merrill Datasite.',
  'About five years at Last Mile, organizing and managing deliveries.',
  'I moved to Grand Rapids and worked in accounting at Arrowhead. Then the pandemic meant I had to stay home.',
  'I went back to school. It was rough, but I graduated in October 2023 with my BS.',
  'I kept building for the community I love: a Discord bot for local food and events, and a gamified trails app.',
  'I moved to Duluth for my MS, and built full stack applications, machine learning models and games, and wrote research.',
  'I live in Coleraine now. I am looking for work, and I am building two story-driven games.'
];

export const PLACES: Record<string, Place> = {
  shop: { heading: 'THE SMITHY', lines: ['Everything I carry into the dark.', 'Engines: Godot 4, Flutter + Flame, React Native', 'Languages: GDScript, C#, TypeScript, Python, Dart, SQL, C++', 'Backend: Node, Express, ASP.NET Core 8, EF Core', 'Data: MongoDB, SQL Server, SQLite, Firestore', 'Tools: Docker, GitHub Actions, Fly.io, EAS Build, Vitest'] },
  library: { heading: 'THE LIBRARY', lines: ['Five scrolls on the shelf.', 'Stress through Story. PACM HCI (CSCW), 2026.', 'When the Story Stalls. HCII 2026.', 'Reclaiming Play in Digital Mental Health. HCII 2026.', 'Vantage: Dynamic Difficulty for Emotional Pacing. HCII 2026.', 'Evoke: Emotional Arousal to Robotic Voice. HealthInf 2025.'], links: [['ALL PAPERS', GH + 'Research-Publications']] },
  inn: { heading: 'THE INN', lines: ['Sit down for a minute. I would like to hear from you.'], links: [['WRITE TO ME', EMAIL], ['GITHUB', 'https://github.com/roesorcerer'], ['LINKEDIN', 'https://www.linkedin.com/in/rowan-stratton-611247247']] }
};
