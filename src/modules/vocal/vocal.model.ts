import mongoose from "mongoose";
import { IVocal } from "./vocal.interface";

const PhoneticSchema = new mongoose.Schema({
  us: { type: String, required: true },
  uk: { type: String, required: true },
  audio_us: { type: String, required: true },
  audio_uk: { type: String, required: true }
});

const ExampleSchema = new mongoose.Schema({
  en: { type: String, required: true },
  vi: { type: String, required: true }
});

const MeaningsSchema = new mongoose.Schema({
  partOfSpeech: { type: String, required: true },
  meaning_vi: { type: String, required: true },
  definition_en: { type: String, required: true },
  examples: [ExampleSchema],
  synonyms: [{ type: String }]
});

const VocalSchema = new mongoose.Schema(
  {
    word: { type: String, required: true, unique: true, index: true },
    phonetic: [PhoneticSchema],
    image: { type: String, required: true },
    meanings: [MeaningsSchema],
    voice: { type: String, required: true },
    level: { 
      type: String, 
      required: true,
      enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'IELTS', 'TOEIC', 'TOEFL', 'General'],
      default: 'General'
    },
    createdAt: { type: Date, default: Date.now }
  },
  {
    collection: "vocabularies", // Tên collection trong MongoDB
  }
);

export default mongoose.model<IVocal & mongoose.Document>("Vocal", VocalSchema);