import { plainToClass } from "class-transformer";
import { validate, ValidationError } from "class-validator";
import { Request, Response, NextFunction, RequestHandler } from "express";
import { Logger } from "../utils";
import { httpException } from "../exceptions";


// Chuyển đổi object thường → instance của class DTO
// Input: {email: "test@email.com", name: "John"}
// Output: RegisterDto instance với các decorators

const validationMiddleware = ( type: any,skipMissingProperties = false): RequestHandler => {
    return (req: Request, res: Response,next: NextFunction ) => {

        //CHUYỂN ĐỔI VÀ VALIDATE DỮ LIỆU
        validate(plainToClass(type, req.body), { skipMissingProperties }).then(
            (errors: ValidationError[]) => {

               // KIỂM TRA CÓ LỖI VALIDATION KHÔNG
                if (errors.length > 0) {
                    Logger.error(errors);
                    const message = errors.map((error: ValidationError) => {
                        return Object.values(error.constraints!);
                    }).join(', ');
                    next(new httpException(400, message));
                } else {
                    next(); 
                }
            }
        ).catch(error => {

            //XỬ LÝ LỖI TRONG QUÁ TRÌNH VALIDATION
            Logger.error('Validation middleware error:', error);
            next(new httpException(500, 'Validation failed'));
        });
    };
};

export default validationMiddleware;