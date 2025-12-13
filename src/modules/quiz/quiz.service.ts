import { httpException } from '../../core/exceptions';
import CreateQuizDto from './dtos/create_quiz.dtos';
import QuizSchema from './quiz.model';
import { IQuiz, IQuizResult } from './quiz.interface';
import mongoose, { set } from 'mongoose';
import SubmitQuizDto, { UserAnswerDto } from './dtos/submit_quiz.dtos';
import { promises } from 'dns';
import { IUser, UserSchema } from '../users';
import  QuizResultSchema from './quiz_result.model';
import { DataStoredInToken, TokenData } from '../auth';
import jwt from 'jsonwebtoken';

class QuizService {
    public quizSchema = QuizSchema;
    public userSchema = UserSchema;
    public quizResultSchema =QuizResultSchema


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

                  // Validate questionText phải có ít nhất 1 phần tử
            if (!question.questionText || question.questionText.length === 0) {
                throw new httpException(400, "Câu hỏi phải có ít nhất 1 phần text");
            }

               // Validate mỗi phần text không rỗng
            for (const text of question.questionText) {
                if (!text || text.trim().length === 0) {
                    throw new httpException(400, "Mỗi phần text của câu hỏi không được rỗng");
                }
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



    
    public async updateQuiz(quizId: string, quizDto: CreateQuizDto): Promise<IQuiz> {
    
      try {
        //kiểm tra id
      if (!mongoose.isValidObjectId(quizId)) {
        throw new httpException(400, "ID không hợp lệ");
      }

      //kiểm tra quiz có tồn tại ko
      const existingQuiz  = await this.quizSchema.findById(quizId).exec();
      if (!existingQuiz) {
            throw new httpException(404, "Không tìm thấy quiz");
        }

          // Kiểm tra trùng title
        if (quizDto.title !== existingQuiz.title) {
            const duplicateQuiz = await  this.quizSchema.findOne({ 
                title: quizDto.title
            }).exec();

            if (duplicateQuiz) {
                throw new httpException(400, "Tiêu đề quiz đã tồn tại");
            }
        }

        //số lượng câu hỏi
        if(!quizDto.questions || quizDto.questions.length === 0) {
             throw new httpException(400, "Quiz phải có ít nhất 1 câu hỏi");
        }

        //số lượng từng optino trong câu hỏi
        for(const question of quizDto.questions) {
            if(!question || question.options.length < 2) {
                throw new httpException(400, `Câu hỏi "${question.questionText}" phải có ít nhất 2 lựa chọn`);
            }

            
        //câu đúng
        const optionExists  = question.options.some(opt => opt.text === question.correctAnswer)
        if(!optionExists) {
             throw new httpException(400, `Đáp án đúng không tồn tại trong các lựa chọn của câu hỏi "${question.questionText}"`);
        }
        }

        const updateData = {
            title: quizDto.title,
            description: quizDto.description,
            part: quizDto.part,
            level: quizDto.level,
            timeLimit: quizDto.timeLimit,
            questions: quizDto.questions.map((q, index) => ({
                
                questionText: q.questionText,
                questionImage: q.questionImage,
                questionAudio: q.questionAudio,
                options: (q.options || []).map((opt, optIndex) => ({
                   
                    text: opt.text,
                    image: opt.image
                })),
                correctAnswer: q.correctAnswer,
                explanation: q.explanation,
                point: q.point || 1
            })),

            // Tính lại totalQuestions và maxScore
            totalQuestions: quizDto.questions.length,
            maxScore: quizDto.questions.reduce((sum, q) => sum + (q.point || 1), 0)
        };

        // update
        const updateQuiz = await this.quizSchema.findByIdAndUpdate(quizId, {$set: updateData}, {new: true, runValidators: true}).exec();
        if (!updateQuiz) {
            throw new httpException(404, "Không tìm thấy quiz để update");
        }
       

     return updateQuiz;
       } catch (error) {
            if (error instanceof httpException) {
                throw error;
            }
            throw new httpException(500, "Lỗi khi tạo quiz");
        }
    }
    
    
    
      public async getQuizById(quizId: string) : Promise<IQuiz> {  
    
            //kiểm tra email tồn tại chưa
            // const user = await  this.userSchema.findOne(userId: userId);
            //vì t tạo thêm cái userID nên không dùng findbyId để tìm theo _id được
            //  const user = await this.userSchema.findOne({ userId: userId });
             const quiz = await this.quizSchema.findById(quizId);
    
            if( !quiz) {
                throw new httpException(404, `voc không tồn tại nha cu`)
            }
           
            return quiz;
        
        }
    
      public async getAllQUiz() : Promise<IQuiz[]> {  
    
            //kiểm tra email tồn tại chưa
            // const user = await  this.userSchema.findOne(userId: userId);
            //vì t tạo thêm cái userID nên không dùng findbyId để tìm theo _id được
             const quiz = await this.quizSchema.find();
        
            return quiz;
        
        }
    
    
    
    
    
    // public async getAllUserPaging(keyword: string, page: number): Promise<IPagination<IUser>> {
    //     const pageSize: number = Number(process.env.PAGE_SIZE) || 10;
    //     const skip = (page - 1) * pageSize;
    
    //    // console.log(` SEARCH: keyword="${keyword}", page=${page}, pageSize=${pageSize}, skip=${skip}`);
    
    //     let baseQuery = this.userSchema.find();
    
    //     if (keyword) {
    //         baseQuery = baseQuery.where('name', new RegExp(keyword, 'i'));
    //      //   console.log(`Applied filter: name contains "${keyword}"`);
    //     }
    
    //     const [users, total] = await Promise.all([
    //         baseQuery.clone()
    //             .sort({ createdAt: -1, _id: -1 })
    //             .skip(skip)
    //             .limit(pageSize)
    //             .exec(),
    //         baseQuery.countDocuments().exec()
    //     ]);
    
    //    // console.log(`RESULTS: total=${total}, found=${users.length} users`);
    //   //  console.log(` Users found:`, users.map(user => ({ name: user.name, email: user.email })));
    
    //     return {
    //         total: total,
    //         page: page,
    //         pageSize: pageSize,
    //         totalPages: Math.ceil(total / pageSize),
    //         items: users
    //     } as unknown as IPagination<IUser>;
    // }
    
    
    public async deleteQuiz(quizId: string) : Promise<IQuiz>{
    
        const deleteQuiz = await this.quizSchema.findByIdAndDelete(quizId).exec();
        if(!deleteQuiz) {
            throw new httpException(409, "không tìm thấyvoc")
        }
        return deleteQuiz;
    }


    //nộp quiz
    public async submitQuiz(userId: string, submitData: SubmitQuizDto ) : Promise<IQuizResult> {

        try {
           
            //kiểm tra user
       const user = await UserSchema.findOne({userId: userId}).select('-password').exec();
            if(!user) {
                 throw new httpException(404, "Không tìm thấy user");
            }
            
            //kiểm tra bài quiz
             const quiz = await this.quizSchema.findById(submitData.quizId).exec();
              if (!quiz) {
            throw new httpException(404, "Không tìm thấy quiz");
        }

            //đếm số lần m đã làm 
             const previousAttempts = await QuizResultSchema.countDocuments({userId: userId,quizId: submitData.quizId}).exec();
             
             //+ số lần làm 
             const attemptNumber = previousAttempts + 1;

              // 3. Tính điểm
            const {userAnswers, totalScore, correctCount} = await this.calculateScore(quiz, submitData.answers);


           const quizResult = new QuizResultSchema({
            userId: userId,
            quizId: submitData.quizId,
            answers: userAnswers,
            score: totalScore,
            timeSpent: submitData.timeSpent,
            completedAt: new Date()
        });
         const savedResult = await quizResult.save();
        

         return savedResult;
   
        } catch (error) {
             if (error instanceof httpException) throw error;
        throw new httpException(500, "Lỗi khi nộp bài quiz");
 
        }



     
            }
            
   
private async calculateScore(quiz: IQuiz, userAnswers: UserAnswerDto[]) {
    let totalScore = 0; //điểm
    let correctCount = 0; //số câu đúng
    const processedAnswers = []; //câu trả lời của m

    
    for (const question of quiz.questions) {
        
        const userAnswer = userAnswers.find(
            answer => answer.questionId === question._id.toString()
        );

        // Kiểm tra đúng/sai
        const isCorrect = userAnswer ? 
            userAnswer.selectedOption === question.correctAnswer : 
            false;

        // Tính điểm
        const pointEarned = isCorrect ? question.point : 0;
        totalScore += pointEarned;
        
        if (isCorrect) correctCount++;

        // lưu câu trả lời
        processedAnswers.push({
            questionId: question._id.toString(),
            selectedOption: userAnswer?.selectedOption || '',
            isCorrect: isCorrect,
            point: pointEarned
        });
    }

    return {
        userAnswers: processedAnswers,
        totalScore: totalScore,
        correctCount: correctCount
    };
}




//  public async getAllQuiz() : Promise<IQuiz[]> {
//    const quizzes = await QuizResultSchema.find().sort({ createdAt: -1, _id: -1}).exec();
//    return quizzes;
//  }

 public async getQuizResultById(quizId: string) : Promise<IQuizResult> {
   const quiz = await QuizResultSchema.findById(quizId).exec();
        if(!quiz)  throw new httpException(404, " lỗi không có bài viết đã nộp") ;
        return quiz;
 }


// private createToken(user: IUser): TokenData {
//     const dataInToken: DataStoredInToken = {id: user.userId};
//     const secret: string = process.env.JWT_TOKEN_SECRET!;
//     const expiresIn: number = 120;
//     return {
//          token: jwt.sign(dataInToken,secret, {expiresIn:expiresIn}),
//     }
// }

}

export default QuizService; 