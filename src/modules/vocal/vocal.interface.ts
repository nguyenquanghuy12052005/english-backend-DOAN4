export interface IVocal{
    _id: string;
    word: string;  //từ vựng
    phonetic: IPhonetic[];  //phiên âm
    image: string;
    meanings: IMeanings[], //nghĩa
    voice: string;
    level: string; 
    createdAt: Date;
    user_learned: string[];
}

export interface IPhonetic {
    us: string,
    uk: string
     audio_us: string; 
    audio_uk: string; 
}

export interface IMeanings {
   partOfSpeech: string; //từ loại
    meaning_vi: string; //nghĩa
    definition_en: string; //nghĩa tiếng anh
    examples: IExample[];
    synonyms: string[]; //trái nghĩa

}

export interface IExample {
    en: string,
    vi: string
}