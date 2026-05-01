import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import BattleQuestion from '../src/models/BattleQuestion.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/vayl";

const mockQuestions = [
  {
    subject: "Physics",
    questionText: "A particle moves along a straight line with velocity v = 2t^2. Find the distance traveled from t=0 to t=3.",
    options: [
      { text: "18", isCorrect: true },
      { text: "12", isCorrect: false },
      { text: "24", isCorrect: false },
      { text: "9", isCorrect: false }
    ],
    difficulty: "Easy"
  },
  {
    subject: "Chemistry",
    questionText: "Which of the following is an amphoteric oxide?",
    options: [
      { text: "Na2O", isCorrect: false },
      { text: "MgO", isCorrect: false },
      { text: "Al2O3", isCorrect: true },
      { text: "CO2", isCorrect: false }
    ],
    difficulty: "Medium"
  },
  {
    subject: "Mathematics",
    questionText: "The value of integral from 0 to pi/2 of sin(x) dx is?",
    options: [
      { text: "0", isCorrect: false },
      { text: "1", isCorrect: true },
      { text: "pi/2", isCorrect: false },
      { text: "-1", isCorrect: false }
    ],
    difficulty: "Easy"
  },
  // Adding 7 more questions so we have 10
  {
    subject: "Physics",
    questionText: "If the radius of the earth shrinks by 1% while its mass remains same, the acceleration due to gravity will:",
    options: [
      { text: "Decrease by 1%", isCorrect: false },
      { text: "Increase by 1%", isCorrect: false },
      { text: "Increase by 2%", isCorrect: true },
      { text: "Decrease by 2%", isCorrect: false }
    ],
    difficulty: "Medium"
  },
  {
    subject: "Chemistry",
    questionText: "The maximum number of electrons in a subshell is given by:",
    options: [
      { text: "2l + 1", isCorrect: false },
      { text: "4l - 2", isCorrect: false },
      { text: "4l + 2", isCorrect: true },
      { text: "2n^2", isCorrect: false }
    ],
    difficulty: "Easy"
  },
  {
    subject: "Mathematics",
    questionText: "If a, b, c are in AP, then what is the value of (b+c), (c+a), (a+b)?",
    options: [
      { text: "They are in AP", isCorrect: true },
      { text: "They are in GP", isCorrect: false },
      { text: "They are in HP", isCorrect: false },
      { text: "None of these", isCorrect: false }
    ],
    difficulty: "Medium"
  },
  {
    subject: "Physics",
    questionText: "The dimensions of Planck's constant are the same as those of:",
    options: [
      { text: "Energy", isCorrect: false },
      { text: "Momentum", isCorrect: false },
      { text: "Angular Momentum", isCorrect: true },
      { text: "Power", isCorrect: false }
    ],
    difficulty: "Easy"
  },
  {
    subject: "Chemistry",
    questionText: "Which gas is released when water is added to calcium carbide?",
    options: [
      { text: "Methane", isCorrect: false },
      { text: "Ethane", isCorrect: false },
      { text: "Ethylene", isCorrect: false },
      { text: "Acetylene", isCorrect: true }
    ],
    difficulty: "Medium"
  },
  {
    subject: "Mathematics",
    questionText: "If the sum of n terms of an AP is 3n^2 + 5n, then which term is 164?",
    options: [
      { text: "26th", isCorrect: false },
      { text: "27th", isCorrect: true },
      { text: "28th", isCorrect: false },
      { text: "None", isCorrect: false }
    ],
    difficulty: "Hard"
  },
  {
    subject: "Physics",
    questionText: "In a full wave rectifier circuit operating from 50Hz mains frequency, the fundamental frequency in the ripple would be:",
    options: [
      { text: "50 Hz", isCorrect: false },
      { text: "100 Hz", isCorrect: true },
      { text: "25 Hz", isCorrect: false },
      { text: "70.7 Hz", isCorrect: false }
    ],
    difficulty: "Medium"
  }
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB.");

    await BattleQuestion.deleteMany({});
    console.log("Cleared existing BattleQuestions.");

    await BattleQuestion.insertMany(mockQuestions);
    console.log(`Successfully seeded ${mockQuestions.length} questions.`);

    mongoose.disconnect();
  } catch (error) {
    console.error("Error seeding:", error);
    process.exit(1);
  }
}

seed();
