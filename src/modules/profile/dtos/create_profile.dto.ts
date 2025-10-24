
export class CreateEducationDto {
    school: string;
    degree: string;
    fieldofstudy: string;
    from: Date;
    to: Date;
    current: boolean;
    description: string;

    constructor(data?: Partial<CreateEducationDto>) {
        this.school = data?.school || '';
        this.degree = data?.degree || '';
        this.fieldofstudy = data?.fieldofstudy || '';
        this.from = data?.from || new Date();
        this.to = data?.to || new Date();
        this.current = data?.current || false;
        this.description = data?.description || '';
    }
}

export class CreateSocialDto {
    facebook: string;
    youtube: string;
    tiktok: string;
    instagram: string;

    constructor(data?: Partial<CreateSocialDto>) {
        this.facebook = data?.facebook || '';
        this.youtube = data?.youtube || '';
        this.tiktok = data?.tiktok || '';
        this.instagram = data?.instagram || '';
    }
}

export class CreateProfileDto {
    location: string;
    phone: string;
    status: string;
    education: CreateEducationDto[];
    social: CreateSocialDto;
    date: Date;

    constructor(data?: Partial<CreateProfileDto>) {
        this.location = data?.location || '';
        this.phone = data?.phone || '';
        this.status = data?.status || '';
        this.education = data?.education?.map(edu => new CreateEducationDto(edu)) || [];
        this.social = new CreateSocialDto(data?.social);
        this.date = data?.date || new Date();
    }
}