# Portfolio Case Studies Workbook

Nov 4, 2026 · @Rowan

## How to use this workbook

Write in the "Your words" column; a rough sentence or two per row is enough. The facts column comes from your resumes and repositories, so correct anything that's wrong. I'll only fix grammar, spelling and incorrect claims, then load the result into each project page.

Each row maps to a field the site already stores in `caseStudy`, so nothing here needs new code. Leave a row blank if you have nothing to say; the page simply skips it.

## The Archive

A narrative game for college student stress, built as an Expo and React Native app and tested with real players.

| Section | Facts so far | Prompt | Your words |
| --- | --- | --- | --- |
| Summary | Story-driven, choice-based game with character creation, journaling and the Vantage minigame | Describe it in two sentences to a friend | A choice-based RPG for stress management in college students allowing them to play through common stressful events as guided by a story. Co-designed with college students and created through playful methods.&#32; |
| Problem | College student stress; narrative gamification | Why did this problem matter to you? Who was it for? | Digital mental health apps commonly pull game elements to help adhere to a program, but with little consideration on the fundamentals of games and play. This problem matters to shift the perspective on how game elements are used in games and their impact in mental health solutions.&#32; |
| Your role | Designed, built and deployed it; led the three-phase study; mentored 3 students | What was yours alone, and what was shared? | I developed and led everything. One student helped find participants, two were a part of research meetings, and one helped to make the character creator.&#32; |
| Phase 1: Survey | N=38 | What did you need to learn first, and what surprised you? | I needed to learn game theories and social science perspectives on SDT principles. The further I dug the more I was able to see how important the roots of games are and how play theories support how people game.&#32; |
| Phase 2: Co-design | N=30; focus groups using an adapted Fiasco tabletop game | Why a tabletop game? What changed in the design because of it? | A tabletop game was used as a medium to help participants engage in playful co-creation. A tabletop RPG gave the flexibility to make self-determined choices and make story beats that fit the play style of the college student.&#32; |
| Build | Expo SDK 54, React Native 0.81, Expo Router, TypeScript, React Query, Zustand, Zod, NativeWind; delivered through EAS Build | What was the hardest technical decision, and what did you choose? | I had a few difficult technical decisions. EAS was going through an update between the summer and fall release of this product and an update was required. This meant that members of the team struggled to run and open up the project because of mismatches between EAS and Expo.&#32; |
| Expert evaluation | N=10 faculty; led to a redesign of the tutorial and information architecture | What did the experts catch that you had missed? | The experts provided really good insight into how the narrative data was being displayed. One passage at a time took too much time and required the person to have to click through a continue option several times. This was adjusted to an auto scroll holding only when the player made a selection.&#32; |
| Phase 3: Field study | Five days, N=20 | What went wrong in the field, and how did you handle it? | One thing that went wrong in the field was a daily data capture that was not fully tested. When creating this Django function, I linked this EMA data to the field study day(i.e. EMA data collected for P1 on field study day 2). If a participant missed a day or completed field study day 2 not sequentially the data did not get captured. This data was captured via email per participant until this issue could be resolved.&#32; |
| Outcomes | Perceived stress down (Δ=−2.55, p=.018); flourishing up (Δ=+2.40, p=.002); narrative agency predicted authenticity (ρ=.745) | Which result matters most to you? | The result that mattered the most to me is the stress down result. No matter what way we ran this, we found that this initiative helped to relieve stress across participants. This tells us that taking a little bit of time immersed in this narrative space was a stress reliever for our sample.&#32; |
| Lessons | Player choice mattered more to engagement than visual immersion | What would you do differently now? | I would remove the minigame and journaling to spend more time on player choice impacts within the game space. Such as talent trees that players could refine to impact how the game reacts to them, or I would lean more into the personalization aspect.&#32; |

## Food Forward

A cross-platform time tracker for a local food bank, built with teammates, for iOS, Android and web.

| Section | Facts so far | Prompt | Your words |
| --- | --- | --- | --- |
| Summary | Employees clock in and out; admins review hours and export reports | Describe it in two sentences to a friend | A cross-platform application for a nonprofit company that delivers meals to families in need. This was their time management software to help manage time and tasks for the week.&#32; |
| Problem | Shift and time tracking for a food bank | How did they track time before? What was painful about it? | Before they would track time through a Google Excel sheet. This would cause issues for workers that are on benefits or when they are applying for aid. This application made it easy to filter, see who was working, and take shifts as needed.&#32; |
| Your role | Built with teammates | What did you own? Who did what? | I did the early stages of the prototyping, meeting with the client, and building the admin pages of this application. We had a team member that was the scrum master, and one that did the user pages. One kid did reminders.&#32; |
| Users | Employee and admin roles | Did you talk to real staff? What did they ask for? | We talked to real staff and the owner of the nonprofit. They asked for simple easy to use features that would work on Android phones. Something that wouldn't be too complex, but they could export reports to their case workers for the county.&#32; |
| Build | Expo, React Native, TypeScript, Expo Router, Express, SQLite, Firebase Auth with Google Sign-In, Firestore | Why that stack? What was hardest to get working? | The team agreed to it since most of us knew React and Typescript. The hardest part to get working was probably the Auth and managing the NoSQL data across the team.&#32; |
| Key feature | Clock entries, scheduled notifications, approvals, CSV and JSON export | Which feature are you proudest of, and why? | I am most proud of the visual aspects of the time worked. Pie and bar charts were used to allow users to see how their time working was being spent.&#32; |
| Outcomes | Not in my sources | Was it used by the food bank? How many people, and for how long? | It was handed off to a company to manage the software and it is being used by 10-15 people.&#32; |
| Lessons | Not in my sources | What did working with a real client teach you? | Working with the client taught me the importance of prototyping before a build so we could all get on the same page on how we want features to look and function. I may describe approval of shifts differently than they expect, so having that layer really helped.&#32; |

## Bug Cup Fill

A Godot arcade game inspired by WarioWare, where you play a cup collecting bugs before a spider boss arrives.

| Section | Facts so far | Prompt | Your words |
| --- | --- | --- | --- |
| Summary | You are a cup with 20 seconds to collect bugs, then a spider boss attacks | Describe how it feels to play | It is a fast game where the player feels the rush of saving and collecting bugs before the time runs out.&#32; |
| Why this game | A take on a WarioWare Fill It minigame; the repo was named UMDrioWare | What drew you to WarioWare? Was it for a class or the game club? | This was for a game jam for the game dev club. They were doing a WarioWare game jam, and this was my first 3D game. I wanted to explore 3D development through this project. |
| Your role | Not in my sources | Was it solo? Did you make the art and music? | This was a solo project. The art was pulled from Sketchfab and the music was pulled from free music sites.&#32; |
| Build | Godot 4.5, GDScript; state machine from menu to collect, boss, then win or game over; physics enemy spawner; tweens; GPU particles | What was the hardest system to get right? | The most difficult part of the game to get right was putting the bugs in the cup.&#32; |
| A design choice | Bugs replaced water to avoid water simulation; webs became colored balls | What other corners did you cut on purpose? What did that teach you about scope? | I wanted to do more with the bug collection, showing the cup being filled but that would require additional animation. I also wanted to have the spider attack the bugs prompting the player to want to save the bugs, but instead the spider attacks the player as there are a lot of bugs.&#32; |
| Playtesting | Not in my sources | Did anyone play it? What changed afterward? | The leaders of the game development club played it. Nothing changed as the project ended after this.&#32; |
| Outcomes | Exported to web | Where can someone play it right now? | The repo would need to be pulled and it would need to be played locally on Godot.&#32; |
| Lessons | Not in my sources | What would you carry into What the Mountain Keeps? | Some of the lessons on structuring the objects and pulling it into the main scene.&#32; |

## Things to gather

Check off each item as you have it. Project images need a check for people's faces and real names before they go public.

- [ ] The Archive: 3 to 5 screens that show story, choice and journal, without participant data&#91;image: arcweave.png\]&#91;image: characterHomeScreen.png\]&#91;image: decisionstory.png\]&#91;image: journalTextEntry.png\]&#91;image: vantageminigame.png\]
- [x] The Archive: permission to show study figures, if any come from a published paper
- [ ] Food Forward: screenshots using fake employee names
- [ ] Food Forward: confirm the food bank is happy to be named
- [ ] Food Forward: check whether `google-services.json` should be in the public repo
- [ ] Bug Cup Fill: a playable web link
- [ ] Bug Cup Fill: a 15 to 30 second gameplay clip
- [ ] All three: a real README in each repo, since these pages link to them\
\
\
Project Links: \
\
Itasca Trails: <https://github.com/roesorcerer/ItascaCountyExplore/tree/production>\
\
Anime Rating Site: <https://github.com/roesorcerer/AnimeRatingsWeb/tree/chore/modernization-phase-0-1>\
\
3d-Game(Metamorphosis): <https://github.com/roesorcerer/3d-dungeon-game>\
\
\
The Archive: <https://github.com/roesorcerer/thearchive>\
\
Food Forward: <https://github.com/roesorcerer/timemanager-foodforward>\
\
CMHT: <https://github.com/roesorcerer/cmht>\
\
UMN Duluth Locations: <https://github.com/roesorcerer/UMN-Duluth-Locations>\
\
Cup Fill Game: <https://github.com/roesorcerer/cup-fill-game>\
\
\

