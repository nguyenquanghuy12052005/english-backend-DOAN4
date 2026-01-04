// check-list-models.js
require('dotenv').config();

async function listModels() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
      console.log("❌ Không tìm thấy Key trong file .env");
      return;
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;

  console.log("⏳ Đang tải danh sách model...");
  
  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
        console.error("❌ Lỗi:", data.error.message);
        return;
    }

    console.log("\n✅ DANH SÁCH CÁC MODEL BẠN ĐƯỢC DÙNG:");
    console.log("---------------------------------------");
    
    // Lọc ra các model có chữ 'generateContent' (tức là model chat được)
    const chatModels = data.models.filter(m => m.supportedGenerationMethods.includes("generateContent"));
    
    chatModels.forEach(m => {
        // Cắt bỏ chữ 'models/' ở đầu để lấy tên chuẩn
        console.log(`🔹 ${m.name.replace('models/', '')}`); 
    });
    
    console.log("---------------------------------------");
    console.log("👉 Hãy copy một trong các tên ở trên (ví dụ gemini-pro) thay vào code của bạn.");

  } catch (error) {
    console.error("❌ Lỗi kết nối:", error);
  }
}

listModels();