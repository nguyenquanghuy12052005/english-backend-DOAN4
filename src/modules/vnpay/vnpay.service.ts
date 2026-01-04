import { dateFormat, HashAlgorithm, ProductCode, VNPay, VnpLocale } from "vnpay";
import { IVnPay } from "./vnpay.interface";

class VnPayService {
  private vnPay: VNPay;

  constructor() {
    this.vnPay = new VNPay({
      tmnCode: 'MT8YND35',
      secureSecret: 'UXM1TEUIN5YFM8FSBBYMQT0FV7LLQ5FX',
      vnpayHost: 'https://sandbox.vnpayment.vn',
      testMode: true,
      hashAlgorithm: HashAlgorithm.SHA512,
    });
  }

  public async createPaymentUrl(payload: IVnPay): Promise<string> {
  const tomorrow = new Date();
  tomorrow.setMinutes(tomorrow.getMinutes() + 15);

  const url = await this.vnPay.buildPaymentUrl({
    vnp_Amount: 50000,
    vnp_IpAddr: '127.0.0.1',
    vnp_TxnRef: Date.now().toString(),
    vnp_OrderInfo: payload.orderInfo,
    vnp_OrderType: ProductCode.Other,

  
    vnp_ReturnUrl: 'http://localhost:5000/api/vnpay/callback',

    vnp_Locale: VnpLocale.VN,
    vnp_CreateDate: dateFormat(new Date()),
    vnp_ExpireDate: dateFormat(tomorrow),
  });

  return url;
}

  // Xác thực callback từ VNPay
  public verifyReturnUrl(vnpayParams: any): {
  isSuccess: boolean;
  isVerified: boolean;
  message: string;
} {
  try {
    console.log('Verifying VNPay params:', vnpayParams);
    
    const verify = this.vnPay.verifyReturnUrl(vnpayParams);
    
    console.log('VNPay verify result:', verify);
    
    if (!verify.isVerified) {
      return {
        isSuccess: false,
        isVerified: false,
        message: 'Xác thực chữ ký không thành công'
      };
    }

    if (!verify.isSuccess) {
      return {
        isSuccess: false,
        isVerified: true,
        message: 'Giao dịch không thành công'
      };
    }

    return {
      isSuccess: true,
      isVerified: true,
      message: 'Thanh toán thành công'
    };
  } catch (error) {
    console.error('Verify error:', error);
    return {
      isSuccess: false,
      isVerified: false,
      message: 'Lỗi xác thực thanh toán'
    };
  }
}
}

export default VnPayService;