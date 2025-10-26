import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export default class CreatePostDto {
    @IsString()
    public content: string | undefined;

    @IsString()
    public title: string | undefined;
}