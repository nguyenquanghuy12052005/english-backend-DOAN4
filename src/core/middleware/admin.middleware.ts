import { NextFunction, Request, Response } from "express"
import { httpException } from "../exceptions";
import { UserSchema } from "../../modules/users";


// Extend Express Request interface để có type cho req.user


 const adminMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Kiểm tra xem user đã được xác thực chưa
    if (!req.user) {
      throw new httpException(401, 'Authentication required');
    }
   const userFromDB = await UserSchema.findOne({ userId: req.user.id });
    if (!userFromDB) {
      throw new httpException(401, 'User not found');
    }

     if (!userFromDB.role) {
      throw new httpException(401, 'sai rồi');
    }

    // Kiểm tra role
    // if (!req.user.role || req.user.role !== 'admin') {
    //   throw new httpException(403, 'Admin access required');
    // }

        // Kiểm tra role
     if (userFromDB.role !== 'admin') {
      throw new httpException(403, 'Admin access required');
    }

    next();
  } catch (error) {
    next(error);
  }
};
export default adminMiddleware;