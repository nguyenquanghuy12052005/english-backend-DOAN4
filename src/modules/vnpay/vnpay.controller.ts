import { NextFunction, Request, Response } from "express";
import VnPayService from "./vnpay.service";
import QuizModel from "../quiz/quiz.model"; // Import Quiz model

export default class VnPayController {
  private vnPayService = new VnPayService();

  public createQrVnPay = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { amount, orderInfo, quizId } = req.body;
    const userId = (req as any).user?.id;
    
    if (!quizId) {
      return res.status(400).json({ 
        success: false, 
        message: "Quiz ID là bắt buộc" 
      });
    }

    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: "Unauthorized" 
      });
    }

    // Kiểm tra quiz có tồn tại không
    const quiz = await QuizModel.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ 
        success: false, 
        message: "Không tìm thấy bài thi" 
      });
    }

    // Thêm userId vào orderInfo để lấy lại sau khi callback
    const fullOrderInfo = `${orderInfo}|userId:${userId}|quizId:${quizId}`;

    const paymentUrl = await this.vnPayService.createPaymentUrl(
      { amount, orderInfo: fullOrderInfo  },
    
    );
    
    console.log('Payment URL created:', paymentUrl);
    
    res.status(201).json({
      success: true,
      paymentUrl
    });
  } catch (error) {
    console.error('Create payment error:', error);
    next(error);
  }
};

  // Xử lý callback sau khi thanh toán
public handlePaymentCallback = async (req: Request, res: Response) => {
  try {
    console.log('=== PAYMENT CALLBACK ===');
    console.log('Query:', req.query);

    //  Verify VNPay
    const verifyResult = this.vnPayService.verifyReturnUrl(req.query);

    if (!verifyResult.isVerified || !verifyResult.isSuccess) {
      console.error('Verify failed');
      return res.redirect('http://localhost:3000/payment-failed');
    }

    const orderInfo = req.query.vnp_OrderInfo as string;
    console.log('OrderInfo:', orderInfo);

    const quizIdMatch = orderInfo.match(/quizId:([a-f0-9]+)/);
    const userIdMatch = orderInfo.match(/userId:([a-f0-9]+)/);

    if (!quizIdMatch || !userIdMatch) {
      console.error(' Missing quizId or userId');
      return res.redirect('http://localhost:3000/payment-failed');
    }

    const quizId = quizIdMatch[1];
    const userId = userIdMatch[1];


    //  Update userPay
    const quiz = await QuizModel.findByIdAndUpdate(
      quizId,
      { $addToSet: { userPay: userId } }, 
      { new: true }
    );

    if (!quiz) {
      console.error(' Quiz not found');
      return res.redirect('http://localhost:3000/payment-failed');
    }

    console.log(' Updated userPay:', quiz.userPay);

    // Redirect về route bài quiz
    return res.redirect(
      `http://localhost:3000/test-part${quiz.part}/${quizId}`
    );
  } catch (error) {
    console.error(' Callback error:', error);
    return res.redirect('http://localhost:3000/payment-failed');
  }
};



  // Kiểm tra user đã thanh toán quiz chưa
  public checkPaymentStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { quizId } = req.params;
      const userId = (req as any).user?._id || (req as any).user?.id;


      if (!userId) {
        console.error('No userId found in token');
        return res.status(401).json({
          success: false,
          message: "Unauthorized - No user ID"
        });
      }

      const quiz = await QuizModel.findById(quizId);
      
      if (!quiz) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy bài thi"
        });
      }

      const hasPaid = quiz.userPay?.includes(userId.toString()) || false;

      console.log('Payment status:', { hasPaid, isVip: quiz.vip === "1" });

      res.status(200).json({
        success: true,
        data: {
          hasPaid,
          isVip: quiz.vip === "1"
        }
      });
    } catch (error) {
      console.error('Check payment error:', error);
      next(error);
    }
  };
}