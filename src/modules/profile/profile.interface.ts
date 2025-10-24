export interface IProfile {
    _id: string,
    user: string,
    location: string,
    phone: string;   
    status: string,
    education: IEducation[],
    social: ISocial;
    date: Date
}

export interface IEducation {
    _id: string;
    school: string;
    degree: string;
    fieldofstudy: string;
    from: Date;
    to: Date;
    current: boolean;
    description: string;
}


export interface ISocial {
    facebook: string;
    youtube: string;
    tiktok: string;
    instagram: string;
}
