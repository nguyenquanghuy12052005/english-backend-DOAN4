// quiz.model.ts
import mongoose from "mongoose";
import { IQuiz } from "./quiz.interface";

const OptionSchema = new mongoose.Schema({
    text: { type: String, required: true },
    image: { type: String }
});

const QuestionSchema = new mongoose.Schema({
    questionText: { type: String, required: true },
    questionImage: String,
    questionAudio: String,
    options: { type: [OptionSchema], required: true },
    correctAnswer: { type: String, required: true },
    explanation: String,
    point: { type: Number, required: true, default: 1 }
});

const QuizSchema = new mongoose.Schema<IQuiz>(
    {
        title: { type: String, required: true },
        description: String,
        part: {
            type: Number,
            required: true,
            enum: [1, 2, 3, 4, 5, 6, 7]
        },
        level: {
            type: String,
            required: true,
            enum: ["Easy", "Medium", "Hard"],
            default: "Medium"
        },
        timeLimit: { type: Number, required: true },
        questions: { type: [QuestionSchema], required: true },
        totalQuestions: { type: Number, default: 0 },
        maxScore: { type: Number, default: 0 }
    },
    {
        timestamps: true,       // auto tạo createdAt + updatedAt
        collection: "quizzes"
    }
);

// Auto tính totalQuestions & maxScore
QuizSchema.pre("save", function (next) {
    this.totalQuestions = this.questions.length;
    this.maxScore = this.questions.reduce((sum, q) => sum + q.point, 0);
    next();
});

export default mongoose.model<IQuiz>("Quiz", QuizSchema);
