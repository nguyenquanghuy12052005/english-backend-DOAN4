import { Document, Types } from "mongoose";


export interface IOption {
    text: string;
    isCorrect?: boolean; 
}

export interface IQuestion {
    _id?: string;
    questionText: string | string[]; 
    questionImage?: string;
    questionAudio?: string;
    options: IOption[];
    point?: number;
    correctAnswer?: string; 
}

export interface IQuiz extends Document {
    title: string;
    description?: string;
    image?: string;
    audio?: string; 
    timeLimit: number; 
    questions: IQuestion[];
    type?: string; 
    part?: number;
    level?: string;
    userPay?: string[];
    vip?: string;
    

    totalQuestions?: number; 
    maxScore?: number;
    // -----------------------------------------

    createdAt?: Date;
    updatedAt?: Date;
}

export interface IUserAnswer {
    questionId: string;
    selectedOption: string | null; 
    isCorrect: boolean;
    point: number;
}

export interface IQuizResult extends Document {
    userId: Types.ObjectId; 
    quizId: Types.ObjectId; 
    answers: IUserAnswer[];
    score: number;
    timeSpent: number; 
    completedAt: Date;
    createdAt?: Date;
    updatedAt?: Date;
}