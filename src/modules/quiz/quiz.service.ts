import mongoose from 'mongoose';
import { httpException } from '../../core/exceptions';
import CreateQuizDto from './dtos/create_quiz.dtos';
import SubmitQuizDto from './dtos/submit_quiz.dtos';
import QuizModel from './quiz.model';
import QuizResultSchema from './quiz_result.model';
import { UserSchema } from '../users';
import { IQuiz, IQuizResult } from './quiz.interface';

class QuizService {
    public quizSchema = QuizModel;
    public userSchema = UserSchema;
    public quizResultSchema = QuizResultSchema;

    /**
     * Helper: Chuẩn hóa dữ liệu đầu vào
     */
    private normalizeToModelStructure(quizDto: CreateQuizDto): any[] {
        const inputData = quizDto as any;
        let finalQuestions: any[] = [];

        // 1. Câu hỏi rời
        if (inputData.questions && Array.isArray(inputData.questions)) {
            const processedSimpleQuestions = inputData.questions.map((q: any) => ({
                questionText: Array.isArray(q.questionText) ? q.questionText : [q.questionText || "No Content"],
                questionImage: q.questionImage || "",
                questionAudio: q.questionAudio || "",
                options: q.options || [],
                correctAnswer: q.correctAnswer || "",
                explanation: q.explanation || "",
                point: q.point || 1
            }));
            finalQuestions = [...finalQuestions, ...processedSimpleQuestions];
        }

        // 2. Câu hỏi nhóm (Bài đọc/nghe)
        if (inputData.data && Array.isArray(inputData.data)) {
            for (const group of inputData.data) {
                const passages = Array.isArray(group.passageText) ? group.passageText : [group.passageText || ""];
                if (group.questions && Array.isArray(group.questions)) {
                    for (const q of group.questions) {
                        finalQuestions.push({
                            questionText: [...passages, q.description || q.questionText || `Question ${q.number}`],
                            questionImage: "", 
                            questionAudio: "",
                            options: q.options || [],
                            correctAnswer: q.correctAnswer || "",
                            explanation: q.explanation || "",
                            point: q.point || 1
                        });
                    }
                }
            }
        }
        return finalQuestions;
    }

    // --- CREATE ---
    public async createQuiz(quizDto: CreateQuizDto): Promise<IQuiz> {
        const existingQuiz = await this.quizSchema.findOne({ title: quizDto.title }).exec();
        if (existingQuiz) throw new httpException(400, "Tên bài thi đã tồn tại");

        const formattedQuestions = this.normalizeToModelStructure(quizDto);
        if (formattedQuestions.length === 0) throw new httpException(400, "Quiz phải có ít nhất 1 câu hỏi");

        const newQuiz = new this.quizSchema({
            title: quizDto.title,
            description: quizDto.description,
            audio: quizDto.audio,
            part: quizDto.part,
            level: quizDto.level,
            timeLimit: quizDto.timeLimit,
            questions: formattedQuestions,
            totalQuestions: formattedQuestions.length,
            maxScore: formattedQuestions.reduce((sum, q) => sum + (q.point || 1), 0)
        });

        return await newQuiz.save();
    }

    // --- UPDATE ---
    public async updateQuiz(quizId: string, quizDto: CreateQuizDto): Promise<IQuiz> {
        if (!mongoose.isValidObjectId(quizId)) throw new httpException(400, "ID không hợp lệ");
        
        const formattedQuestions = this.normalizeToModelStructure(quizDto);
        if (formattedQuestions.length === 0) throw new httpException(400, "Quiz phải có ít nhất 1 câu hỏi");

        const updatedQuiz = await this.quizSchema.findByIdAndUpdate(
            quizId,
            {
                $set: {
                    title: quizDto.title,
                    description: quizDto.description,
                    audio: quizDto.audio,
                    part: quizDto.part,
                    level: quizDto.level,
                    timeLimit: quizDto.timeLimit,
                    questions: formattedQuestions,
                    totalQuestions: formattedQuestions.length,
                    maxScore: formattedQuestions.reduce((sum, q) => sum + (q.point || 1), 0)
                }
            },
            { new: true, runValidators: true }
        ).exec();

        if (!updatedQuiz) throw new httpException(404, "Quiz không tồn tại");
        return updatedQuiz;
    }

    // --- GET & DELETE ---
    public async getQuizById(id: string): Promise<IQuiz> {
        if (!mongoose.isValidObjectId(id)) throw new httpException(400, "ID không hợp lệ");
        const quiz = await this.quizSchema.findById(id);
        if (!quiz) throw new httpException(404, "Quiz không tồn tại");
        return quiz;
    }

    public async getAllQUiz(): Promise<IQuiz[]> {
        return await this.quizSchema.find().sort({ createdAt: -1 });
    }

    public async deleteQuiz(id: string): Promise<IQuiz> {
        if (!mongoose.isValidObjectId(id)) throw new httpException(400, "ID không hợp lệ");
        const deleted = await this.quizSchema.findByIdAndDelete(id);
        if (!deleted) throw new httpException(404, "Quiz không tồn tại");
        return deleted;
    }

    // --- SUBMIT ---
    public async submitQuiz(userId: string, submitData: SubmitQuizDto): Promise<IQuizResult> {
        const quiz = await this.quizSchema.findById(submitData.quizId);
        if (!quiz) throw new httpException(404, "Quiz not found");

        let totalScore = 0;
        const processedAnswers = [];

        for (const question of quiz.questions) {
            const qIdString = (question as any)._id.toString();
            const userAnswer = submitData.answers.find(a => a.questionId === qIdString);
            const selectedOption = userAnswer ? userAnswer.selectedOption : null;
            
            let isCorrect = false;
            if (selectedOption) {
                const userText = selectedOption.trim().toLowerCase();
                const correctText = question.correctAnswer?.trim().toLowerCase() || "";
                if (userText === correctText && userText !== "") isCorrect = true;
            }

            const point = isCorrect ? (question.point || 1) : 0;
            if (isCorrect) totalScore += point;

            processedAnswers.push({
                questionId: qIdString,
                selectedOption: selectedOption,
                isCorrect: isCorrect,
                point: point
            });
        }

        const result = new this.quizResultSchema({
            userId,
            quizId: submitData.quizId,
            answers: processedAnswers,
            score: totalScore,
            timeSpent: submitData.timeSpent
        });

        return await result.save();
    }

    // --- RESULT & HISTORY ---
    public async getQuizResultById(id: string): Promise<IQuizResult> {
        if (!mongoose.isValidObjectId(id)) throw new httpException(400, "Result ID invalid");
        
        const result = await this.quizResultSchema.findById(id)
            .populate('userId', 'username email')
            .populate('quizId', 'title questions description level'); // Quan trọng cho AI: Cần questions
        
        if(!result) throw new httpException(404, "Result not found");
        return result;
    }

    public async getHistoryByUserId(userId: string): Promise<IQuizResult[]> {
        return await this.quizResultSchema.find({ userId: userId })
            .populate('quizId', 'title level part')
            .sort({ createdAt: -1 });
    }
}

export default QuizService;