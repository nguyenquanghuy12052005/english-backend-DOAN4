// quiz_result.model.ts
import mongoose from "mongoose";
import { IQuizResult } from "./quiz.interface";

const UserAnswerSchema = new mongoose.Schema({
    questionId: { type: String, required: true },
    selectedOption: { type: String, required: true },
    isCorrect: { type: Boolean, required: true },
    point: { type: Number, required: true }
});

const QuizResultSchema = new mongoose.Schema(
    {
        userId: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "User",
            required: true 
        },
        quizId: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "Quiz",
            required: true 
        },
        answers: [UserAnswerSchema],
        score: { type: Number, required: true },
        timeSpent: { type: Number, required: true }, // giây
        completedAt: { type: Date, default: Date.now }
    },
    {
        collection: "quiz_results",
    }
);

export default mongoose.model<IQuizResult & mongoose.Document>("QuizResult", QuizResultSchema);