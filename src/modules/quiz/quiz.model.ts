import mongoose from "mongoose";
import { IQuiz } from "./quiz.interface"; 

const OptionSchema = new mongoose.Schema({
    text: { type: String, required: true },
    image: { type: String }
}, { _id: false }); 

const QuestionSchema = new mongoose.Schema({
    questionText: { type: [String], required: true },
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
        audio: { type: String, default: "" }, 
        
        part: {
            type: Number,
            required: false, 
            default: 0      
        },
        
        type: {
            type: String,
            enum: ['FULL_TEST', 'PART_TEST', 'MINI_TEST'], 
            default: 'PART_TEST'
        },

        level: {
            type: String,
            required: true,
            enum: ["Easy", "Medium", "Hard"],
            default: "Medium"
        },
        userPay: [{ type: String }],
        vip: { type: String,
            required: false, 
            default: 0    
           },
        timeLimit: { type: Number, required: true },
        questions: { type: [QuestionSchema], required: true },
        
        // --- HẾT LỖI TẠI ĐÂY ---
        totalQuestions: { type: Number, default: 0 },
        maxScore: { type: Number, default: 0 }
        // ----------------------
    },
    {
        timestamps: true,
        collection: "quizzes"
    }
);

// Middleware tự động tính toán số câu hỏi và điểm tối đa trước khi lưu
QuizSchema.pre("save", function (next) {
    const quiz = this as any; 
    if (quiz.questions && Array.isArray(quiz.questions)) {
        quiz.totalQuestions = quiz.questions.length;
        quiz.maxScore = quiz.questions.reduce((sum: number, q: any) => {
            return sum + (q.point || 0);
        }, 0);
    } else {
        quiz.totalQuestions = 0;
        quiz.maxScore = 0;
    }
    next();
});

export default mongoose.model<IQuiz>("Quiz", QuizSchema);