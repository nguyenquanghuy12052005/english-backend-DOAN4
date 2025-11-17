// create_quiz_dto.ts
import { IsString, IsNotEmpty, IsNumber, IsEnum, IsArray, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class OptionDto {
    @IsString()
    @IsNotEmpty()
    text!: string;

    @IsString()
    @IsOptional()
    image?: string;
}

export class QuestionDto {
    @IsString()
    @IsNotEmpty()
    questionText!: string;

    @IsString()
    @IsOptional()
    questionImage?: string;

    @IsString()
    @IsOptional()
    questionAudio?: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OptionDto)
    options!: OptionDto[];

    @IsString()
    @IsNotEmpty()
    correctAnswer!: string;

    @IsString()
    @IsOptional()
    explanation?: string;

    @IsNumber()
    @IsNotEmpty()
    point!: number;
}

export default class CreateQuizDto {
    @IsString()
    @IsNotEmpty()
    title!: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsEnum([1, 2, 3, 4, 5, 6, 7])
    part!: 1 | 2 | 3 | 4 | 5 | 6 | 7;

    @IsEnum(["Easy", "Medium", "Hard"])
    level!: "Easy" | "Medium" | "Hard";

    @IsNumber()
    @IsNotEmpty()
    timeLimit!: number;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => QuestionDto)
    questions!: QuestionDto[];
}
