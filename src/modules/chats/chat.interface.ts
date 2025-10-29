export interface IChat {
    user1: string;
    user2: string;
    start_date: Date;
    recent_date: Date;
    messages: IMessages[];
}
export interface IMessages {
    from: string;
    to: string;
    read: boolean;
    text: string;
    date: Date;
    show_on_from: boolean;
    show_on_to: boolean;
}