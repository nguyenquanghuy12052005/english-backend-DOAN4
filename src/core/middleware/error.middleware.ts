//bắt lỗi
import { httpException } from "../exceptions";
import { NextFunction, Request, Response } from "express";
import { Logger } from "../utils";

const errorMiddleware = (error: httpException,req: Request,res: Response,next: NextFunction) => {
    const status: number = error.status || 500;
    const message: String = error.message || "something when wrong";

    Logger.error(`[ERROR] - status: ${status} - Msg: ${message}`);
    res.status(status).json({message: message});
};
export default errorMiddleware;