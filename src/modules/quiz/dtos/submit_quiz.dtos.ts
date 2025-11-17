// submit_quiz_dto.ts
import { IsString, IsNotEmpty, IsArray, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class UserAnswerDto {
    @IsString()
    @IsNotEmpty()
    questionId!: string;

    @IsString()
    @IsNotEmpty()
    selectedOption!: string;
}

export default class SubmitQuizDto {
    @IsString()
    @IsNotEmpty()
    quizId!: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => UserAnswerDto)
    answers!: UserAnswerDto[];

    @IsNumber()
    @IsNotEmpty()
    timeSpent!: number;
}
