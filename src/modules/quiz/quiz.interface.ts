import { Document } from "mongoose";

export interface IQuiz extends Document {
    title: string;
    description?: string;
    
    // --- QUAN TRỌNG: ĐÃ THÊM TRƯỜNG AUDIO ---
    audio?: string; 
    // ----------------------------------------

    // Đổi thành number để chấp nhận số 0 (Full Test) và các Part 1-7
    part: number; 

    // Thêm trường này để khớp với Schema (FULL_TEST, PART_TEST...)
    type?: string; 
    
    level: "Easy" | "Medium" | "Hard";
    timeLimit: number;
    questions: IQuestion[];
    totalQuestions: number;
    maxScore: number;
    
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IQuestion {
    _id?: string; 
    questionText: string[];
    questionImage?: string;
    questionAudio?: string;
    options: IOption[];
    correctAnswer: string;
    explanation?: string;
    point: number;
}

export interface IOption {
    _id?: string;
    text: string;
    image?: string;
}

export interface IQuizResult extends Document {
    userId: string;
    quizId: string;
    answers: IUserAnswer[];
    score: number;
    totalCorrect?: number; 
    timeSpent: number;
    completedAt: Date;
}

export interface IUserAnswer {
    questionId: string;
    selectedOption: string;
    isCorrect: boolean;
    point: number;
}