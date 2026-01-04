const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config(); 

async function run() {
  const key = process.env.GEMINI_API_KEY;
  console.log("🔑 Đang kiểm tra Key:", key ? "Đã tìm thấy" : "KHÔNG tìm thấy");

  if (!key) {
      console.log("⚠️ Vui lòng kiểm tra lại file .env");
      return;
  }

  const genAI = new GoogleGenerativeAI(key);
  // Dùng model flash mới nhất
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  try {
    console.log("⏳ Đang kết nối tới Google...");
    const result = await model.generateContent("Say Hello");
    const response = await result.response;
    console.log("✅ THÀNH CÔNG! Key hoạt động tốt.");
    console.log("🤖 AI trả lời:", response.text());
  } catch (error) {
    console.error("❌ THẤT BẠI. Lỗi chi tiết:");
    console.error(error.message);
  }
}

run();