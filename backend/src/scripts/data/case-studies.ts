import type { ProjectCaseStudy } from "../../validators/project.validators";

// The written case studies, kept in the repo so they can be reviewed in a diff
// and reloaded after a restore. `npm run seed:case-studies` writes them onto the
// matching projects. After that, the admin editor is the place to change them:
// running the script again overwrites whatever was edited there.

const image = (src: string, alt: string, caption: string) => ({
  type: "image" as const,
  src,
  alt,
  caption,
});

export interface CaseStudyEntry {
  /** A name for the log output. */
  name: string;
  /** Finds the project by title, since titles are what both databases share. */
  match: RegExp;
  caseStudy: ProjectCaseStudy;
}

export const CASE_STUDIES: CaseStudyEntry[] = [
  {
    name: "The Archive",
    match: /\barchive\b/i,
    caseStudy: {
      summary:
        "A choice-based RPG for stress management in college students allowing them to play through common stressful events as guided by a story. Co-designed with college students and created through playful methods.",
      role: "I developed and led everything. One student helped find participants, two were a part of research meetings, and one helped to make the character creator.",
      problem:
        "Digital mental health apps commonly pull game elements to help adhere to a program, but with little consideration on the fundamentals of games and play. This problem matters to shift the perspective on how game elements are used in games and their impact in mental health solutions.",
      sections: [
        {
          heading: "Phase 1: Learning the theory (survey, N=38)",
          body: "I needed to learn game theories and social science perspectives on SDT principles. The further I dug the more I was able to see how important the roots of games are and how play theories support how people game.",
          media: [
            image(
              "/assets/thearchive/cs-survey-ratings.png",
              "Table of student ratings for five game mechanics. Story-driven quests rated highest at 3.56 and points and leaderboards lowest at 2.16.",
              "Student ratings of five game mechanics, from 1 (one of the worst) to 5 (one of the best)."
            ),
          ],
        },
        {
          heading: "Phase 2: Co-design at the table (N=30)",
          body: "A tabletop game was used as a medium to help participants engage in playful co-creation. We used an adapted version of Fiasco. A tabletop RPG gave the flexibility to make self-determined choices and make story beats that fit the play style of the college student.",
          media: [
            image(
              "/assets/thearchive/cs-fiasco-setup.png",
              "The Fiasco rulebook, tiles, quick-rule cards, relationship sheets, sticky notes and markers laid out on a table.",
              "The Fiasco setup used in the focus groups."
            ),
          ],
        },
        {
          heading: "The build",
          body: "The app runs on Expo SDK 54 and React Native 0.81, with Expo Router, TypeScript, React Query, Zustand, Zod and NativeWind, built through EAS Build. The backend is Django.\n\nI had a few difficult technical decisions. EAS was going through an update between the summer and fall release of this product and an update was required. This meant that members of the team struggled to run and open up the project because of mismatches between EAS and Expo.",
          media: [
            image(
              "/assets/thearchive/cs-system-design.png",
              "Architecture diagram. A React Native frontend talks to a Django API over REST. Arcweave feeds narrative content into Django, Expo EAS builds the Android app, and PostgreSQL stores story content, user data and game state.",
              "System architecture."
            ),
            image(
              "/assets/thearchive/cs-arcweave-board.png",
              "A section of an Arcweave board, with connected story passages and branching choices.",
              "Part of the story board in Arcweave, where the branching narrative was written."
            ),
            image(
              "/assets/thearchive/cs-character-home.png",
              "The app's character home screen, showing the title The Atrium.",
              "The character home screen in an early build. The Atrium was the project's first name."
            ),
            image(
              "/assets/thearchive/cs-journal-entry.png",
              "A journal screen titled The Codex with a text entry field.",
              "A journal entry in the Codex."
            ),
            image(
              "/assets/thearchive/cs-vantage-minigame.png",
              "A screen from the Vantage minigame.",
              "The Vantage minigame."
            ),
          ],
        },
        {
          heading: "Expert evaluation (N=10)",
          body: "Ten faculty experts reviewed the app. The experts provided really good insight into how the narrative data was being displayed. One passage at a time took too much time and required the person to have to click through a continue option several times. This was adjusted to an auto scroll holding only when the player made a selection.",
          media: [
            image(
              "/assets/thearchive/cs-decision-story.png",
              "A story screen from the Embark chapter, with the Curator's dialogue and choices for the player.",
              "A decision point in the Embark chapter."
            ),
          ],
        },
        {
          heading: "Field study (five days, N=20)",
          body: "One thing that went wrong in the field was a daily data capture that was not fully tested. When creating this Django function, I linked this EMA data to the field study day (i.e. EMA data collected for P1 on field study day 2). If a participant missed a day or completed field study day 2 not sequentially the data did not get captured. This data was captured via email per participant until this issue could be resolved.",
          media: [
            image(
              "/assets/thearchive/cs-study-timeline.png",
              "Timeline of the field study. An in-person session on day 0, one story module a day with a short check-in on days 1 to 5, and an in-person exit session on day 6.",
              "The field study timeline."
            ),
            image(
              "/assets/thearchive/cs-stress-trajectories.png",
              "Line chart of each participant's stress score before and after the study. The group mean moves down.",
              "Each participant's stress score before and after. The dashed line is the group mean."
            ),
          ],
        },
      ],
      outcomes: [
        "Stress went down by 2.55 points from pre to post (p=.018).",
        "Flourishing went up by 2.40 points (p=.002).",
        "Narrative agency predicted authenticity (ρ=.745).",
        "Player choice mattered more to engagement than visual immersion.",
        "The result that mattered the most to me is the stress down result. No matter what way we ran this, we found that this initiative helped to relieve stress across participants. This tells us that taking a little bit of time immersed in this narrative space was a stress reliever for our sample.",
      ],
      lessons: [
        "I would remove the minigame and journaling to spend more time on player choice impacts within the game space. Such as talent trees that players could refine to impact how the game reacts to them, or I would lean more into the personalization aspect.",
      ],
    },
  },
  {
    name: "Food Forward",
    match: /food\s*forward/i,
    caseStudy: {
      summary:
        "A cross-platform application for Food Forward, a nonprofit company that delivers meals to families in need. This was their time management software to help manage time and tasks for the week.",
      role: "I did the early stages of the prototyping, meeting with the client, and building the admin pages of this application. We had a team member that was the scrum master, and one that did the user pages. One teammate did reminders.",
      problem:
        "Before they would track time through a Google Excel sheet. This would cause issues for workers that are on benefits or when they are applying for aid. This application made it easy to filter, see who was working, and take shifts as needed.",
      sections: [
        {
          heading: "Talking to the people who would use it",
          body: "We talked to real staff and the owner of the nonprofit. They asked for simple easy to use features that would work on Android phones. Something that wouldn't be too complex, but they could export reports to their case workers for the county.",
          media: [
            image(
              "/assets/timemanff/prototype.png",
              "A design board of connected app screens from the prototype.",
              "The prototype we used to agree on how features should look and work."
            ),
          ],
        },
        {
          heading: "The build",
          body: "We built it with Expo, React Native, TypeScript and Expo Router, on Express and SQLite, with Firebase Auth for Google Sign-In and Firestore. The team agreed to it since most of us knew React and TypeScript. The hardest part to get working was probably the Auth and managing the NoSQL data across the team.",
          media: [
            image(
              "/assets/timemanff/employeehomeclockin.png",
              "The clock-in screen with a weekly progress bar and a large Clock In button.",
              "Clocking in, with progress for the week."
            ),
            image(
              "/assets/timemanff/adminshiftapproval.png",
              "The shift manager screen, listing pending shifts with Approve and Reject buttons. Test data.",
              "The admin shift manager, shown with test data."
            ),
          ],
        },
        {
          heading: "The part I am most proud of",
          body: "I am most proud of the visual aspects of the time worked. Pie and bar charts were used to allow users to see how their time working was being spent.",
          media: [
            image(
              "/assets/timemanff/adminreports.png",
              "The employee statistics screen with a date range, total hours and a task distribution chart. Test data.",
              "Task distribution for the admin, shown with test data."
            ),
            image(
              "/assets/timemanff/employeeoverview.png",
              "The reports screen with total hours, a time summary chart and daily entries. Test data.",
              "The same view for an employee."
            ),
          ],
        },
      ],
      outcomes: [
        "It was handed off to a company to manage the software and it is being used by 10-15 people.",
      ],
      lessons: [
        "Working with the client taught me the importance of prototyping before a build so we could all get on the same page on how we want features to look and function. I may describe approval of shifts differently than they expect, so having that layer really helped.",
      ],
    },
  },
  {
    name: "Fill the Cup",
    match: /fill\s*the\s*cup|bug\s*cup|cup[\s-]*fill/i,
    caseStudy: {
      summary:
        "It is a fast game where the player feels the rush of saving and collecting bugs before the time runs out.",
      role: "This was a solo project. The art was pulled from Sketchfab and the music was pulled from free music sites.",
      problem:
        "This was for a game jam for the game dev club. They were doing a WarioWare game jam, and this was my first 3D game. I wanted to explore 3D development through this project.",
      sections: [
        {
          heading: "The build",
          body: "Made in Godot 4.5 with GDScript, as a take on WarioWare's Fill It. A state machine moves the game from the menu to collecting, then the boss, then a win or game over, all on a 20 second clock. Bugs replaced the water. A physics spawner drops them, with tweens and GPU particles on top. The most difficult part of the game to get right was putting the bugs in the cup.",
          media: [
            image(
              "/assets/cup-fill-1.png",
              "The Bug Cup Fill boss fight, with the spider above the cup on a stone floor and health bars at the top of the screen.",
              "The spider boss."
            ),
          ],
        },
        {
          heading: "Design choices",
          body: "I wanted to do more with the bug collection, showing the cup being filled but that would require additional animation. I also wanted to have the spider attack the bugs prompting the player to want to save the bugs, but instead the spider attacks the player as there are a lot of bugs.",
          media: [],
        },
        {
          heading: "Playtesting",
          body: "The leaders of the game development club played it. Nothing changed as the project ended after this.",
          media: [],
        },
      ],
      outcomes: [
        "To play it, the repo needs to be pulled and played locally on Godot.",
      ],
      lessons: [
        "I learned lessons on structuring the objects and pulling them into the main scene.",
      ],
    },
  },
];
