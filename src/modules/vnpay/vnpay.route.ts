import { Router } from "express";
import { Route } from "../../core/interface";
import { authMiddleware } from "../../core/middleware";
import VnPayController from "./vnpay.controller";

export default class VnPayRoute implements Route {
  public path = "/api/vnpay";
  public router = Router();
  public vnPayController = new VnPayController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Tạo payment URL 
    this.router.post(
      this.path, 
      authMiddleware, 
      this.vnPayController.createQrVnPay
    );

   
    this.router.get(
      `${this.path}/callback`,
     
      this.vnPayController.handlePaymentCallback
    );

    // Kiểm tra trạng thái thanh toán
    this.router.get(
      `${this.path}/check/:quizId`,
      authMiddleware,
      this.vnPayController.checkPaymentStatus
    );
  }
}