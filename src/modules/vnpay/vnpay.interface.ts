export interface IVnPay {
  amount: number;
  orderInfo: string;
}

export interface IPaymentCallback {
  quizId: string;
  userId: string;
}