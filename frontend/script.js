// เปลี่ยน URL นี้เป็น IP จริงของ Backend เมื่อทดสอบข้ามเครื่อง
// เช่น "http://192.168.1.20:5000/api/generate"
const API_URL = "http://localhost:5000/api/generate";

const form = document.getElementById("generate-form");
const submitBtn = document.getElementById("submit-btn");
const statusEl = document.getElementById("status");
const resultImage = document.getElementById("result-image");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const prompt = document.getElementById("prompt").value.trim();
  if (!prompt) return;

  submitBtn.disabled = true;
  submitBtn.classList.add("loading");
  statusEl.textContent = "กำลังหลอมภาพจาก prompt ของคุณ...";
  statusEl.className = "";
  resultImage.classList.remove("show");

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt })
    });

    if (!response.ok) throw new Error("Server error: " + response.status);

    const data = await response.json();

    resultImage.src = data.image_url;
    resultImage.onload = () => resultImage.classList.add("show");

    statusEl.textContent = "สร้างภาพสำเร็จ";
    statusEl.className = "success";
  } catch (err) {
    statusEl.textContent = "เกิดข้อผิดพลาด: " + err.message;
    statusEl.className = "error";
  } finally {
    submitBtn.disabled = false;
    submitBtn.classList.remove("loading");
  }
});