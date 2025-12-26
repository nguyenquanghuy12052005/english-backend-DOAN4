import { IsString, IsNotEmpty, IsNumber, IsEnum, IsArray, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class OptionDto {
    @IsString()
    @IsNotEmpty()
    text!: string;

    @IsOptional()
    @IsString()
    image?: string;
}

export class QuestionDto {
    @IsOptional()
    // Chấp nhận input là String hoặc Mảng String (để linh hoạt)
    questionText?: string | string[]; 

    @IsOptional()
    @IsString()
    questionImage?: string;

    @IsOptional()
    @IsString()
    questionAudio?: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OptionDto)
    options!: OptionDto[];

    @IsString()
    @IsNotEmpty()
    correctAnswer!: string;

    @IsOptional()
    @IsString()
    explanation?: string;

    @IsNumber()
    @IsNotEmpty()
    point!: number;

    // Các trường phụ để hỗ trợ map dữ liệu từ Part 6,7
    @IsOptional()
    description?: string;
    
    @IsOptional()
    number?: number;
}

// Class hỗ trợ cấu trúc nhóm của Part 6, 7
export class GroupedQuestionDto {
    @IsOptional()
    @IsString()
    groupTitle?: string;

    @IsOptional()
    passageText?: string | string[];

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => QuestionDto)
    questions!: QuestionDto[];
}

export default class CreateQuizDto {
    @IsString()
    @IsNotEmpty()
    title!: string;

    @IsOptional()
    @IsString()
    description?: string;

    // --- QUAN TRỌNG: ĐÃ THÊM TRƯỜNG AUDIO ---
    // Đây là trường bắt buộc để lưu link file nghe chung của bài thi
    @IsOptional()
    @IsString()
    audio?: string;
    // ----------------------------------------

    // Mình đổi thành IsNumber để linh hoạt (nhận cả 0 cho FullTest và 1-7 cho Part)
    @IsNumber()
    @IsNotEmpty()
    part!: number;

    @IsEnum(["Easy", "Medium", "Hard"])
    level!: "Easy" | "Medium" | "Hard";

    @IsNumber()
    @IsNotEmpty()
    timeLimit!: number;

    // Dành cho Part 1-5 (Câu lẻ)
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => QuestionDto)
    questions?: QuestionDto[];

    // Dành cho Part 6-7 (Câu chùm)
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => GroupedQuestionDto)
    data?: GroupedQuestionDto[]; 
}