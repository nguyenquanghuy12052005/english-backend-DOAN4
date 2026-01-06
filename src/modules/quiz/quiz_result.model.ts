import mongoose, { Schema } from "mongoose";
import { IQuizResult } from "./quiz.interface";

const UserAnswerSchema = new Schema({
    questionId: { type: String, required: true },
    
  
    selectedOption: { 
        type: String, 
        required: false, 
        default: null    
    },


    isCorrect: { type: Boolean, required: true }, 
    point: { type: Number, required: true }
});

const QuizResultSchema = new Schema<IQuizResult>(
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
        timeSpent: { type: Number, required: true },
        completedAt: { type: Date, default: Date.now }
    },
    {
        collection: "quiz_results",
        timestamps: true 
    }
);

export default mongoose.model<IQuizResult>("QuizResult", QuizResultSchema);