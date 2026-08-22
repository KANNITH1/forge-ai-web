// เปลี่ยน URL นี้เป็น IP จริงของ Backend เมื่อทดสอบข้ามเครื่อง
// เช่น "http://192.168.1.20:5000/api/generate"
const API_URL = "http://localhost:5000/api/generate";

const form = document.getElementById("generate-form");
const submitBtn = document.getElementById("submit-btn");
const statusEl = document.getElementById("status");
const resultImage = document.getElementById("result-image");
const resultActions = document.getElementById("result-actions");
const saveBtn = document.getElementById("save-btn");
const styleChips = document.querySelectorAll(".style-chip");

let selectedStyle = "realistic";
let lastResult = null;

// ----- style chip selection (ทำงานเฉพาะหน้า home.html) -----
styleChips.forEach((chip) => {
  chip.addEventListener("click", () => {
    styleChips.forEach((c) => c.classList.remove("active"));
    chip.classList.add("active");
    selectedStyle = chip.dataset.style;
  });
});

// ----- generate form submit (ทำงานเฉพาะหน้า home.html) -----
if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const prompt = document.getElementById("prompt").value.trim();
    if (!prompt) return;

    submitBtn.disabled = true;
    submitBtn.classList.add("loading");
    statusEl.textContent = "กำลังหลอมภาพจาก prompt ของคุณ...";
    statusEl.className = "";
    resultImage.classList.remove("show");
    resultActions.classList.remove("show");

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, style: selectedStyle })
      });

      if (!response.ok) throw new Error("Server error: " + response.status);

      const data = await response.json();

      resultImage.src = data.image_url;
      resultImage.onload = () => resultImage.classList.add("show");

      lastResult = { prompt, style: selectedStyle, imageUrl: data.image_url };

      statusEl.textContent = "สร้างภาพสำเร็จ";
      statusEl.className = "success";
      resultActions.classList.add("show");

      addToHistory(lastResult);
    } catch (err) {
      statusEl.textContent = "เกิดข้อผิดพลาด: " + err.message;
      statusEl.className = "error";
    } finally {
      submitBtn.disabled = false;
      submitBtn.classList.remove("loading");
    }
  });
}

// ----- save to gallery (ทำงานเฉพาะหน้า home.html) -----
if (saveBtn) {
  saveBtn.addEventListener("click", () => {
    if (!lastResult) return;
    addToGallery(lastResult);
    statusEl.textContent = "บันทึกลง Gallery แล้ว";
    statusEl.className = "success";
  });
}

// ===================================================================
// Gallery + History (เก็บไว้ใน localStorage ของเบราว์เซอร์ผู้ใช้แต่ละคน)
// ===================================================================

function getGallery() {
  return JSON.parse(localStorage.getItem("forge_gallery") || "[]");
}

function getHistory() {
  return JSON.parse(localStorage.getItem("forge_history") || "[]");
}

function addToGallery(item) {
  const gallery = getGallery();
  gallery.unshift({ ...item, savedAt: Date.now() });
  localStorage.setItem("forge_gallery", JSON.stringify(gallery));
  renderGallery();
}

function addToHistory(item) {
  const history = getHistory();
  history.unshift({ ...item, createdAt: Date.now() });
  localStorage.setItem("forge_history", JSON.stringify(history.slice(0, 50)));
  renderHistory();
}

function renderGallery() {
  const grid = document.getElementById("gallery-grid");
  if (!grid) return; // ทำงานเฉพาะหน้า gallery.html

  const gallery = getGallery();

  if (gallery.length === 0) {
    grid.innerHTML = '<p class="empty-state">ยังไม่มีภาพที่บันทึกไว้ — ลองสร้างภาพแล้วกด "บันทึกลง Gallery" ดูสิ</p>';
    return;
  }

  grid.innerHTML = gallery.map((item) => `
    <div class="gallery-item">
      <img src="${item.imageUrl}" alt="${escapeHtml(item.prompt)}">
      <div class="caption">${escapeHtml(item.prompt)}</div>
    </div>
  `).join("");
}

function renderHistory() {
  const list = document.getElementById("history-list");
  if (!list) return; // ทำงานเฉพาะหน้า history.html

  const history = getHistory();

  if (history.length === 0) {
    list.innerHTML = '<p class="empty-state">ยังไม่มีประวัติการสร้างภาพ</p>';
    return;
  }

  list.innerHTML = history.map((item) => `
    <div class="history-item">
      <span>${escapeHtml(item.prompt)}</span>
      <span class="h-style">${escapeHtml(item.style)}</span>
    </div>
  `).join("");
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// โหลด Gallery และ History ที่เคยบันทึกไว้ทันทีที่เปิดหน้าเว็บ
renderGallery();
renderHistory();