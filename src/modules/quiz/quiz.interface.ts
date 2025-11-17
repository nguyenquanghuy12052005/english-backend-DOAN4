// quiz.interface.ts

export interface IQuiz {
    _id: string;
    title: string;                         // tiêu đề bài quiz
    description?: string;                  // mô tả
    part: 1 | 2 | 3 | 4 | 5 | 6 | 7;       // part TOEIC
    level: "Easy" | "Medium" | "Hard";     // độ khó
    timeLimit: number;                     // thời gian làm bài (phút)
    questions: IQuestion[];                // danh sách câu hỏi
    totalQuestions: number;                // tổng số câu
    maxScore: number;                      // tổng điểm tối đa
    createdAt: Date;
    updatedAt: Date;
}

export interface IQuestion {
    _id: string;
    questionText: string;       // nội dung câu hỏi
    questionImage?: string;     // ảnh kèm theo
    questionAudio?: string;     // audio (cho part 1,2,3,4)
    options: IOption[];         // danh sách đáp án
    correctAnswer: string;      // ID của đáp án đúng
    explanation?: string;       // giải thích
    point: number;              // điểm của câu
}

export interface IOption {
    _id: string;
    text: string;               // nội dung đáp án
    image?: string;             // ảnh đáp án
}

export interface IQuizResult {
    _id: string;
    userId: string;             // ID người dùng
    quizId: string;             // ID quiz
    answers: IUserAnswer[];     // danh sách câu user chọn
    score: number;              // tổng điểm đạt được
    timeSpent: number;          // thời gian làm bài thực tế (giây)
    completedAt: Date;
}

export interface IUserAnswer {
    questionId: string;         // ID câu hỏi
    selectedOption: string;     // ID option user chọn
    isCorrect: boolean;         // đúng hay sai
    point: number;              // điểm nhận được
}
