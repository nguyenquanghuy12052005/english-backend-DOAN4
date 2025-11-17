import { httpException } from '../../core/exceptions';
import CreateQuizDto from './dtos/create_quiz.dtos';
import QuizSchema from './quiz.model';
import { IQuiz } from './quiz.interface';
import mongoose from 'mongoose';

class QuizService {
    public quizSchema = QuizSchema;

    public async createQuiz(quizDto: CreateQuizDto): Promise<IQuiz> {
        try {
            // Kiểm tra quiz đã tồn tại chưa
            const existingQuiz = await this.quizSchema.findOne({ 
                title: quizDto.title 
            }).exec();

            if (existingQuiz) {
                throw new httpException(400, "Quiz đã tồn tại");
            }

            // Validate số lượng câu hỏi
            if (!quizDto.questions || quizDto.questions.length === 0) {
                throw new httpException(400, "Quiz phải có ít nhất 1 câu hỏi");
            }

            // Validate từng câu hỏi
            for (const question of quizDto.questions) {
                if (!question.options || question.options.length < 2) {
                    throw new httpException(400, `Câu hỏi "${question.questionText}" phải có ít nhất 2 lựa chọn`);
                }
                
                // Validate correctAnswer phải tồn tại trong options
                const optionExists = question.options.some(opt => 
                    opt.text === question.correctAnswer
                );
                if (!optionExists) {
                    throw new httpException(400, `Đáp án đúng không tồn tại trong các lựa chọn của câu hỏi "${question.questionText}"`);
                }
            }

            // Tạo quiz mới
            const newQuiz = new QuizSchema({
                title: quizDto.title,
                description: quizDto.description,
                part: quizDto.part,
                level: quizDto.level,
                timeLimit: quizDto.timeLimit,
                questions: quizDto.questions.map((q, index) => ({
                    _id: new mongoose.Types.ObjectId(),
                    questionText: q.questionText,
                    questionImage: q.questionImage,
                    questionAudio: q.questionAudio,
                    options: (q.options || []).map((opt, optIndex) => ({
                        _id: new mongoose.Types.ObjectId(),
                        text: opt.text,
                        image: opt.image
                    })),
                    correctAnswer: q.correctAnswer,
                    explanation: q.explanation,
                    point: q.point || 1
                }))
            });

            const quiz = await newQuiz.save();
            return quiz;

        } catch (error) {
            if (error instanceof httpException) {
                throw error;
            }
            throw new httpException(500, "Lỗi khi tạo quiz");
        }
    }
}

export default QuizService; 