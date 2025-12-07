export interface IPost{
    _id: string;
    user: string;
    name: string;
    content: string;
    title: string;
    image: string;
    avatar: string;
    like: Ilike[],
    comments: Icomments[],
    createdAt: Date;
}

export interface Ilike {
    user: string
}

export interface Icomments {
   _id: string;
    user: string;
    name: string;
    content: string;
    avatar: string;
    createdAt: Date;
}