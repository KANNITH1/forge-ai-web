from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from diffusers import StableDiffusionPipeline
import torch
import uuid
import os

app = Flask(__name__)
CORS(app)

MODEL_ID = "runwayml/stable-diffusion-v1-5"
device = "cuda" if torch.cuda.is_available() else "cpu"

print(f"Loading model on {device}...")
pipe = StableDiffusionPipeline.from_pretrained(
    MODEL_ID,
    torch_dtype=torch.float16 if device == "cuda" else torch.float32
)
pipe = pipe.to(device)

# โหลด LoRA เข้า pipeline
LORA_PATH = "loras/myconcept_lora.safetensors"
if os.path.exists(LORA_PATH):
    pipe.load_lora_weights(LORA_PATH)
    print("LoRA loaded.")

OUTPUT_DIR = "outputs"
os.makedirs(OUTPUT_DIR, exist_ok=True)

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "device": device})

@app.route("/generate", methods=["POST"])
def generate():
    data = request.get_json()
    prompt = data.get("prompt")
    if not prompt:
        return jsonify({"error": "prompt is required"}), 400

    negative_prompt = data.get("negative_prompt", "")
    steps = data.get("steps", 25)
    guidance_scale = data.get("guidance_scale", 7.5)
    lora_scale = data.get("lora_scale", 0.8)  # ความแรงของ LoRA

    image = pipe(
        prompt=prompt,
        negative_prompt=negative_prompt,
        num_inference_steps=steps,
        guidance_scale=guidance_scale,
        cross_attention_kwargs={"scale": lora_scale}
    ).images[0]

    filename = f"{uuid.uuid4().hex}.png"
    filepath = os.path.join(OUTPUT_DIR, filename)
    image.save(filepath)

    return jsonify({"status": "success", "filename": filename})

@app.route("/image/<filename>", methods=["GET"])
def get_image(filename):
    filepath = os.path.join(OUTPUT_DIR, filename)
    if not os.path.exists(filepath):
        return jsonify({"error": "not found"}), 404
    return send_file(filepath, mimetype="image/png")

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)