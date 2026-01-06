


import { Request, Response } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

export class GeminiController {
 
    private genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    
    // Dùng model 1.5 flash 
    private model = this.genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    public explainQuestion = async (req: Request, res: Response) => {
        try {
            const { questionText, options, userAnswer, correctAnswer } = req.body;

            // // Log để kiểm tra
            // console.log("\n====== [GỌI AI GIẢI THÍCH ĐA NĂNG] ======");
            // console.log("👉 Câu hỏi:", questionText ? questionText.substring(0, 50) + "..." : "Rỗng");

            // Xử lý options:  Array or String
            let optionsText = "";
            if (Array.isArray(options)) {
                // Nếu options là mảng object [{text: "A..."}, {text: "B..."}]
                optionsText = options.map((opt: any) => opt.text || opt).join(", ");
            } else {
                optionsText = JSON.stringify(options);
            }

            // prompt
            let prompt = `Đóng vai là một giáo viên luyện thi TOEIC chuyên nghiệp (Reading). Hãy giải thích câu hỏi trắc nghiệm sau cho học viên:\n\n`;
            
            prompt += `❓ Đề bài: "${questionText}"\n`;
            prompt += `🔠 Các lựa chọn: ${optionsText}\n`;
            prompt += `✅ Đáp án đúng: "${correctAnswer}"\n`;
            prompt += `❌ Học viên chọn sai: "${userAnswer}"\n\n`;
            
            prompt += `YÊU CẦU TRẢ LỜI:\n`;
            prompt += `1. Xác định đây là dạng bài gì (Từ vựng hay Ngữ pháp? Part mấy trong TOEIC?).\n`;
            prompt += `2. Dịch nghĩa ngắn gọn câu hỏi (hoặc câu chứa chỗ trống).\n`;
            prompt += `3. Phân tích tại sao chọn đáp án "${correctAnswer}" (Giải thích quy tắc ngữ pháp hoặc ngữ cảnh từ vựng).\n`;
            prompt += `4. Giải thích ngắn gọn tại sao phương án "${userAnswer}" lại sai.\n`;
            prompt += `👉 Trả lời ngắn gọn, súc tích, dễ hiểu. Format văn bản có xuống dòng rõ ràng.`;

            // Gọi Google AI
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            // Trả kết quả thành công
            return res.status(200).json({ 
                status: "success", 
                explanation: text 
            });

        } catch (error: any) {
            console.error("LỖI GOOGLE AI:", error.message);

            // Bắt lỗi quá tải (429) hoặc lỗi Key
            if (error.status === 429 || error.message?.includes("429")) {
                return res.status(429).json({
                    message: "Hệ thống AI đang bận (429). Vui lòng thử lại sau 1 phút."
                });
            }

            return res.status(500).json({ 
                message: "Lỗi Server khi gọi AI", 
                error: error.message 
            });
        }
    }
}