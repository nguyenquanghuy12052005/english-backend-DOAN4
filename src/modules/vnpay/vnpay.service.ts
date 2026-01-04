import { dateFormat, HashAlgorithm, ProductCode, VNPay, VnpLocale } from "vnpay";
import { IVnPay } from "./vnpay.interface";

 
 class VnPayService {
  private vnPay : VNPay;

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
     tomorrow.setMinutes(tomorrow.getMinutes() + 15)
    // tomorrow.setDate(tomorrow.getDate() + 1);

    const url = await this.vnPay.buildPaymentUrl({
      vnp_Amount: 50000, //sửa 
      vnp_IpAddr: '127.0.0.1',
      vnp_TxnRef: Math.floor(Math.random() * 1000000).toString(),
      vnp_OrderInfo: payload.orderInfo, // lấy từ tên bài quiz m mua
      vnp_OrderType: ProductCode.Other,
      vnp_ReturnUrl: "http://localhost:3000/",
      vnp_Locale: VnpLocale.VN,
      vnp_CreateDate: dateFormat(new Date()),
      vnp_ExpireDate: dateFormat(tomorrow),
    });

    return url;
  }


 }
 export default VnPayService;    