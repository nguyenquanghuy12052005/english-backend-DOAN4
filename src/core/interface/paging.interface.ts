export default interface IPagination<T> {
    total: number;
    page: number;
    pageSize: number;
    item: [T];
}