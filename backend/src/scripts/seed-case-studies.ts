import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

import mongoose from "mongoose";
import { ProjectModel } from "../models/project.model";
import { projectFields } from "../validators/project.validators";
import { CASE_STUDIES } from "./data/case-studies";

// Writes the case studies in data/case-studies.ts onto their projects.
//
//   npm run backup:projects
//   npm run seed:case-studies -- --dry
//   npm run seed:case-studies
//
// Only `caseStudy` is touched. It REPLACES whatever case study a matched project
// already has, so take the backup first, and don't re-run this after editing a
// case study in the admin. A title that matches nothing, or matches more than
// one project, is skipped and reported rather than guessed at.

const DRY_RUN = process.argv.includes("--dry");

type TitleDoc = { _id: mongoose.Types.ObjectId; title: string; caseStudy?: unknown };

async function seedCaseStudies() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error("MONGODB_URI not set in .env");
    process.exit(1);
  }

  let skipped = 0;

  try {
    await mongoose.connect(mongoUri);
    console.log(`Connected to MongoDB.${DRY_RUN ? "  (dry run, no writes)" : ""}`);

    const docs = (await ProjectModel.collection
      .find({}, { projection: { title: 1, caseStudy: 1 } })
      .toArray()) as unknown as TitleDoc[];

    for (const entry of CASE_STUDIES) {
      const matches = docs.filter((doc) => entry.match.test(doc.title));

      if (matches.length !== 1) {
        skipped += 1;
        const found = matches.map((doc) => `"${doc.title}"`).join(", ") || "none";
        console.warn(`SKIP ${entry.name}: expected one match, found ${found}`);
        continue;
      }

      const [project] = matches;
      const caseStudy = projectFields.caseStudy.parse(entry.caseStudy);
      const verb = project.caseStudy ? "Replace" : "Add";
      console.log(`${verb} case study on "${project.title}"`);

      if (!DRY_RUN) {
        await ProjectModel.collection.updateOne(
          { _id: project._id },
          { $set: { caseStudy } }
        );
      }
    }
  } catch (error) {
    console.error("Seeding case studies failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
    console.log(skipped ? `Done, with ${skipped} skipped.` : "Done.");
  }
}

seedCaseStudies();
