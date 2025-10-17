
//kiểm tra obj có rỗng không
export const isEmptyObj = (obj: object) : boolean =>{
    return !Object.keys(obj).length;
}