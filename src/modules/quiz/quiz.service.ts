import { httpException } from '../../core/exceptions';
import CreateQuizDto from './dtos/create_quiz.dtos';
import QuizModel from './quiz.model'; // Đảm bảo import đúng Model bạn đang dùng
import { IQuiz, IQuizResult } from './quiz.interface';
import mongoose from 'mongoose';
import SubmitQuizDto, { UserAnswerDto } from './dtos/submit_quiz.dtos'; // Lưu ý: Bạn cần tạo file này nếu chưa có
import { UserSchema } from '../users';
import QuizResultSchema from './quiz_result.model';

class QuizService {
    public quizSchema = QuizModel;
    public userSchema = UserSchema;
    public quizResultSchema = QuizResultSchema;

    /**
     * CORE FUNCTION: CHUẨN HÓA DỮ LIỆU
     */
 private normalizeToModelStructure(quizDto: CreateQuizDto): any[] {
    const inputData = quizDto as any;
    let finalQuestions: any[] = [];

    // --- BƯỚC 1: Xử lý Câu hỏi lẻ (Part 1, 2, 3, 4, 5) ---
    if (inputData.questions && Array.isArray(inputData.questions)) {
        const processedSimpleQuestions = inputData.questions.map((q: any) => {
            let qText: string[] = [];
            if (Array.isArray(q.questionText)) {
                qText = q.questionText;
            } else if (typeof q.questionText === 'string') {
                qText = [q.questionText];
            } else {
                qText = ["No Question Content"];
            }

            return {
                questionText: qText,
                questionImage: q.questionImage || "",
                // ✅ FIX: Giữ nguyên questionAudio từ payload, không tự set ""
                questionAudio: q.questionAudio !== undefined ? q.questionAudio : "",
                options: q.options,
                correctAnswer: q.correctAnswer,
                explanation: q.explanation || "",
                point: q.point || 1
            };
        });
        finalQuestions = [...finalQuestions, ...processedSimpleQuestions];
    }

    // --- BƯỚC 2: Xử lý Câu hỏi chùm (Part 6, 7 - trường 'data') ---
    if (inputData.data && Array.isArray(inputData.data)) {
        for (const group of inputData.data) {
            let passages: string[] = [];
            if (Array.isArray(group.passageText)) {
                passages = group.passageText;
            } else if (typeof group.passageText === 'string') {
                passages = [group.passageText];
            }

            if (group.questions && Array.isArray(group.questions)) {
                for (const q of group.questions) {
                    const qContent = q.description || q.questionText || `Question ${q.number}`;
                    finalQuestions.push({
                        questionText: [...passages, qContent], 
                        questionImage: "",
                        questionAudio: "", // Part 6, 7 không có audio
                        options: q.options,
                        correctAnswer: q.correctAnswer,
                        explanation: q.explanation || "",
                        point: q.point || 1
                    });
                }
            }
        }
    }
    return finalQuestions;
}

    // =========================================================================
    // CREATE QUIZ
    // =========================================================================
    public async createQuiz(quizDto: CreateQuizDto): Promise<IQuiz> {
        try {
            const existingQuiz = await this.quizSchema.findOne({ title: quizDto.title }).exec();
            if (existingQuiz) {
                throw new httpException(400, "Tên bài thi (Quiz) đã tồn tại");
            }

            const formattedQuestions = this.normalizeToModelStructure(quizDto);

            if (formattedQuestions.length === 0) {
                throw new httpException(400, "Quiz phải có ít nhất 1 câu hỏi hợp lệ");
            }

            // Validate chi tiết
            for (const [index, question] of formattedQuestions.entries()) {
                if (!question.options || question.options.length < 2) {
                    throw new httpException(400, `Câu hỏi thứ ${index + 1}: Phải có ít nhất 2 lựa chọn`);
                }
            }

            // --- TẠO MỚI (Đã sửa thêm audio) ---
            const newQuiz = new this.quizSchema({
                title: quizDto.title,
                description: quizDto.description,
                
                // >>> QUAN TRỌNG: Thêm dòng này để lưu link Audio chung <<<
                audio: quizDto.audio, 
                // ========================================================

                part: quizDto.part,
                level: quizDto.level,
                timeLimit: quizDto.timeLimit,
                questions: formattedQuestions
            });

            return await newQuiz.save();

        } catch (error) {
            if (error instanceof httpException) throw error;
            throw new httpException(500, "Lỗi server khi tạo quiz: " + (error as Error).message);
        }
    }

    // =========================================================================
    // UPDATE QUIZ
    // =========================================================================
    public async updateQuiz(quizId: string, quizDto: CreateQuizDto): Promise<IQuiz> {
        if (!mongoose.isValidObjectId(quizId)) throw new httpException(400, "ID không hợp lệ");

        try {
            const formattedQuestions = this.normalizeToModelStructure(quizDto);
            
            if (formattedQuestions.length === 0) {
                throw new httpException(400, "Dữ liệu cập nhật phải có ít nhất 1 câu hỏi");
            }

            const newTotalQuestions = formattedQuestions.length;
            const newMaxScore = formattedQuestions.reduce((sum, q) => sum + (q.point || 1), 0);

            // --- CẬP NHẬT (Đã sửa thêm audio) ---
            const updatedQuiz = await this.quizSchema.findByIdAndUpdate(
                quizId,
                { 
                    $set: {
                        title: quizDto.title,
                        description: quizDto.description,

                        // >>> QUAN TRỌNG: Thêm dòng này để update Audio <<<
                        audio: quizDto.audio,
                        // =================================================

                        part: quizDto.part,
                        level: quizDto.level,
                        timeLimit: quizDto.timeLimit,
                        questions: formattedQuestions,
                        totalQuestions: newTotalQuestions,
                        maxScore: newMaxScore
                    }
                },
                { new: true, runValidators: true }
            ).exec();

            if (!updatedQuiz) throw new httpException(404, "Quiz không tồn tại hoặc lỗi khi cập nhật");
            return updatedQuiz;

        } catch (error) {
            if (error instanceof httpException) throw error;
            if ((error as any).code === 11000) throw new httpException(400, "Tên bài thi đã tồn tại");
            throw new httpException(500, "Lỗi server khi cập nhật: " + (error as Error).message);
        }
    }

    // =========================================================================
    // GET & DELETE
    // =========================================================================
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

    // =========================================================================
    // SUBMIT
    // =========================================================================
    public async submitQuiz(userId: string, submitData: SubmitQuizDto): Promise<IQuizResult> {
        const quiz = await this.quizSchema.findById(submitData.quizId);
        if (!quiz) throw new httpException(404, "Quiz not found");

        let totalScore = 0;
        const processedAnswers = [];

        for (const question of quiz.questions) {
            const qIdString = (question as any)._id.toString();
            const userAnswer = submitData.answers.find(a => a.questionId === qIdString);
            
            let isCorrect = false;
            const userText = userAnswer?.selectedOption?.trim().toLowerCase() || "";
            const correctText = question.correctAnswer?.trim().toLowerCase() || "";

            if (userText === correctText && userText !== "") {
                isCorrect = true;
            }

            if (isCorrect) totalScore += (question.point || 1);

            processedAnswers.push({
                questionId: qIdString,
                selectedOption: userAnswer?.selectedOption || "",
                isCorrect,
                point: isCorrect ? (question.point || 1) : 0
            });
        }

        const result = new QuizResultSchema({
            userId,
            quizId: submitData.quizId,
            answers: processedAnswers,
            score: totalScore,
            timeSpent: submitData.timeSpent
        });

        return await result.save();
    }

    public async getQuizResultById(id: string): Promise<IQuizResult> {
        if (!mongoose.isValidObjectId(id)) throw new httpException(400, "Result ID invalid");
        const result = await QuizResultSchema.findById(id)
            .populate('userId', 'username email')
            .populate('quizId', 'title');
        
        if(!result) throw new httpException(404, "Result not found");
        return result;
   }
}

export default QuizService;