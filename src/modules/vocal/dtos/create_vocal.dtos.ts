// create_vocal_dto.ts
import { IsString, IsNotEmpty, IsEnum, IsArray, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

class PhoneticDto {
  @IsString()
  @IsNotEmpty()
  public us: string | undefined;

  @IsString()
  @IsNotEmpty()
  public uk: string | undefined;

  @IsString()
  @IsNotEmpty()
  public audio_us: string | undefined;

  @IsString()
  @IsNotEmpty()
  public audio_uk: string | undefined;

  constructor(us?: string, uk?: string, audio_us?: string, audio_uk?: string) {
    this.us = us;
    this.uk = uk;
    this.audio_us = audio_us;
    this.audio_uk = audio_uk;
  }
}

class ExampleDto {
  @IsString()
  @IsNotEmpty()
  public en: string | undefined;

  @IsString()
  @IsNotEmpty()
  public vi: string | undefined;

  constructor(en?: string, vi?: string) {
    this.en = en;
    this.vi = vi;
  }
}

class MeaningsDto {
  @IsString()
  @IsNotEmpty()
  public partOfSpeech: string | undefined;

  @IsString()
  @IsNotEmpty()
  public meaning_vi: string | undefined;

  @IsString()
  @IsNotEmpty()
  public definition_en: string | undefined;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExampleDto)
  public examples: ExampleDto[] | undefined;

  @IsArray()
  @IsString({ each: true })
  public synonyms: string[] | undefined;

  constructor(
    partOfSpeech?: string,
    meaning_vi?: string,
    definition_en?: string,
    examples?: ExampleDto[],
    synonyms?: string[]
  ) {
    this.partOfSpeech = partOfSpeech;
    this.meaning_vi = meaning_vi;
    this.definition_en = definition_en;
    this.examples = examples;
    this.synonyms = synonyms;
  }
}

export default class CreateVocalDto {
  @IsString()
  @IsNotEmpty()
  public word: string | undefined;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PhoneticDto)
  public phonetic: PhoneticDto[] | undefined;

  @IsString()
  @IsNotEmpty()
  public image: string | undefined;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MeaningsDto)
  public meanings: MeaningsDto[] | undefined;

  @IsString()
  @IsNotEmpty()
  public voice: string | undefined;

  @IsString()
  @IsNotEmpty()
  @IsEnum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'IELTS', 'TOEIC', 'TOEFL', 'General'])
  public level: string | undefined;

  constructor(
    word?: string,
    phonetic?: PhoneticDto[],
    image?: string,
    meanings?: MeaningsDto[],
    voice?: string,
    level?: string
  ) {
    this.word = word;
    this.phonetic = phonetic;
    this.image = image;
    this.meanings = meanings;
    this.voice = voice;
    this.level = level;
  }
}