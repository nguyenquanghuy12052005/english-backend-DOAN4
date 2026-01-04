import { NextFunction, Request, Response } from "express";

import VnPayService from "./vnpay.service";

export default class VnPayController {
    private vnPayService = new VnPayService();
   public createQrVnPay = async (req: Request, res: Response, next: NextFunction) => {
        try {
          const { orderInfo } = req.body;
           const paymentUrl = await this.vnPayService.createPaymentUrl({orderInfo,});
            res.status(201).json(paymentUrl);
        } catch (error) {
            next(error);
        }
    }

    
}