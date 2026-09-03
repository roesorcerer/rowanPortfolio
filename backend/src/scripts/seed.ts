import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

import mongoose from "mongoose";
import { ProjectModel } from "../models/project.model";
import { slugify } from "../utils/slug";

// Seed data — your portfolio projects.
// Update these with your real content.
const projects = [
  // `order` is scoped to the display group — featured, or the projectType —
  // so each group counts from 0 independently.
  {
    title: "The Archive - Stories to explore stress",
    category: ["Mental Health", "Mobile App", "React", "Node.js", "MongoDB"],
    description:
      "A mental health application designed through human-centered design principles.",
    image: "/assets/thearchive_1.png",
    featured: true,
    projectType: "product",
    status: "published",
    order: 0,
  },
  {
    title: "Food Forward Time Management - NGO",
    category: ["Co-Design", "Web App", "React", "Express", "PostgreSQL"],
    description:
      "An application built through co-design methods for time management.",
    image: "/assets/ff9.png",
    featured: true,
    projectType: "product",
    status: "published",
    order: 1,
  },
  {
    title: "Stress through Story: Co-Design through a board game!",
    category: ["Research Paper", "Co-Design", "Research", "HCI"],
    description:
      "A research paper exploring co-design board games for stress management.",
    image: "/assets/cscwscreenshot.png",
    featured: true,
    projectType: "research",
    researchStatus: "published",
    status: "published",
    order: 2,
  },
  {
    title: "Spam SVM Detection: Filtering Spam Data with ML",
    category: ["Machine Learning", "Python", "scikit-learn", "NLP"],
    description: "A machine learning project for spam detection using SVM.",
    image: "/assets/spamproject.png",
    featured: false,
    projectType: "practice",
    status: "published",
    order: 0,
  },
  {
    title: "Itasca Trails: Community Trails through exploration",
    category: ["Web App", "React", "Node.js", "Maps API"],
    description: "Web application for community trail exploration.",
    image: "/assets/ie1.png",
    featured: false,
    projectType: "practice",
    status: "published",
    order: 1,
  },
];

async function seed() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error("MONGODB_URI not set in .env");
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB.");

    // Drop existing projects and re-insert.
    // This is safe for development — NEVER run seed scripts
    // against production without extreme caution.
    await ProjectModel.deleteMany({});
    console.log("Cleared existing projects.");

    // Slugs are normally assigned by the projects store; seeding writes
    // through the model directly, so it derives them the same way here rather
    // than leaving a fresh dev database needing the backfill script.
    const inserted = await ProjectModel.insertMany(
      projects.map((project) => ({ ...project, slug: slugify(project.title) }))
    );
    console.log(`Seeded ${inserted.length} projects.`);

    for (const p of inserted) {
      console.log(`  - ${p.title} (/projects/${p.slug})`);
    }
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("Done.");
  }
}

seed();
