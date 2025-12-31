//middleware xác thực người dùng

import { NextFunction, Request, Response } from "express"
import jwt from 'jsonwebtoken';
import { DataStoredInToken } from "../../modules/auth/auth.interface";

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const token = req.header('x-auth-token');

    if(!token){
        return res.status(401).json({message: "không có token cu ơi"});
    }

    try {
        const user = jwt.verify(token, process.env.JWT_TOKEN_SECRET!) as DataStoredInToken;

        if(!req.user) req.user = {id: ""};
        req.user.id = user.id;
        next();
    } catch (error) {
          return res.status(401).json({message: " token is not valid"});
    }
}
export default authMiddleware;