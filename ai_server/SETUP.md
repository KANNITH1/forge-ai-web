# AI Server — Setup Guide

คู่มือติดตั้ง environment สำหรับรัน AI Server (Stable Diffusion + LoRA)
อ่านให้ครบก่อนเริ่ม โดยเฉพาะเรื่อง Python version ที่ต้องใช้ให้ถูก

---

## 1. เช็ค GPU ก่อน

ต้องมี GPU NVIDIA เท่านั้น (รองรับ CUDA) เช็คด้วย:

```bash
nvidia-smi
```

ดู driver version และ VRAM (แนะนำอย่างน้อย 8GB สำหรับ SD1.5, 12GB+ สำหรับ SDXL)

---

## 2. ติดตั้ง Python 3.11 (สำคัญมาก — ห้ามใช้ 3.13)

> **เหตุผล:** PyTorch (build cu121) ยังไม่รองรับ Python 3.13/3.14 เต็มรูปแบบ
> ถ้าใช้ผิดเวอร์ชันจะเจอ error: `Could not find a version that satisfies the requirement torch`

เช็คว่ามี Python 3.11 ในเครื่องหรือยัง:

```bash
py -0
```

ถ้ายังไม่มี ติดตั้งด้วย:

```bash
winget install Python.Python.3.11
```

ติดตั้งเสร็จแล้ว **ปิด-เปิด terminal ใหม่** ก่อนไปขั้นต่อไป (สำคัญ ไม่งั้น PATH ยังไม่อัปเดต)

> **หมายเหตุสำหรับคนที่ใช้ Miniconda/Anaconda:** conda จะ auto-activate base environment ทับ PATH เสมอ
> ให้ใช้ `py -3.11` (ไม่ใช่ `python`) ตอนสร้าง venv จะการันตีว่าได้ Python 3.11 แน่นอน

---

## 3. Clone repo (ถ้ายังไม่มี)

```bash
git clone https://github.com/KANNITH1/forge-ai-web.git
cd forge-ai-web/ai_server
```

---

## 4. สร้าง Virtual Environment ด้วย Python 3.11

```bash
py -3.11 -m venv venv
```

**Activate venv:**

Git Bash / MINGW64:
```bash
source venv/Scripts/activate
```

PowerShell / CMD:
```powershell
venv\Scripts\activate
```

**เช็คว่า activate ถูกต้อง** (ต้องเห็น `(venv)` นำหน้า prompt แล้ว):

```bash
python --version
```

ผลลัพธ์ต้องเป็น `Python 3.11.x` เท่านั้น ถ้ายังขึ้น 3.13 แปลว่า activate venv ยังไม่สำเร็จ — อย่าเพิ่งไปขั้นถัดไป

---

## 5. ติดตั้ง PyTorch (แบบรองรับ GPU) ก่อนเป็นอันดับแรก

```bash
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
```

> ถ้า CUDA version ของเครื่องไม่ใช่ 12.1 ให้เปลี่ยนท้าย URL เช่น CUDA 11.8 ใช้ `cu118` แทน `cu121`
> เช็ค CUDA version ได้จาก `nvidia-smi` (มุมขวาบนของผลลัพธ์)

---

## 6. ติดตั้ง Library ที่เหลือจาก requirements.txt

```bash
pip install -r requirements.txt
```

---

## 7. เช็คว่า GPU ใช้งานได้จริง

```bash
python -c "import torch; print(torch.cuda.is_available()); print(torch.cuda.get_device_name(0))"
```

ผลลัพธ์ที่ถูกต้อง:
```
True
NVIDIA GeForce RTX xxxx
```

ถ้าได้ `False` ให้เช็คว่า:
- ติดตั้ง PyTorch ด้วย `--index-url` ของ cu121/cu118 หรือไม่ (ถ้าลงแบบ `pip install torch` เฉยๆ จะได้ CPU-only)
- CUDA version ตรงกับ driver ที่ติดตั้งในเครื่องไหม

---

## 8. รัน AI Server

```bash
python server.py
```

รอจนเห็นข้อความ `Model loaded.` แล้วทดสอบด้วย:

```bash
curl -X POST http://localhost:5001/generate \
  -H "Content-Type: application/json" \
  -d "{\"prompt\": \"a cat wearing sunglasses, digital art\"}"
```

---

## สรุปคำสั่งแบบรวดเดียว (สำหรับคนที่ทำตามครบทุกขั้นแล้ว)

```bash
py -3.11 -m venv venv
source venv/Scripts/activate
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
pip install -r requirements.txt
python -c "import torch; print(torch.cuda.is_available())"
```
