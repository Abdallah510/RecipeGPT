// imageHandler.js
export async function setupImageUpload() {
    const imageInput = document.getElementById("imageInput");
    const fileInput = document.getElementById("fileInput");
    const fileName = document.getElementById("fileName");

    imageInput.addEventListener("change", () => showPreview(imageInput.files[0]));
    fileInput.addEventListener("change", () => showPreview(fileInput.files[0]));
}

export async function handleImageUpload(file) {
    if (!file) return;
    const chatContainer = document.getElementById("aiResults");
    const aiMsg = document.createElement("div");
    aiMsg.className = "message ai";
    aiMsg.textContent = "🔍 Analyzing image...";
    chatContainer.appendChild(aiMsg);

    try {
        const imageSession = await LanguageModel.create({
            expectedInputs: [{ type: "image" }],
            expectedOutputs: [{ type: "text", languages: ["en"] }]
        });

        const input = document.getElementById("chat");
        const userPrompt = "Detect foods and ingredients in this image. Return them as a comma-separated list.";

        const result = await imageSession.prompt([
            {
                role: "user",
                content: [
                    { type: "text", value: userPrompt },
                    { type: "image", value: file }
                ]
            }
        ]);
        input.value = result + ", ";
    } catch (err) {
        console.error("Image analysis error:", err);
        aiMsg.textContent = "❌ Error analyzing image: " + err.message;
    }
}

function showPreview(file) {
    const fileName = document.getElementById("fileName");
    if (!file) return;
    fileName.innerHTML = "";
    if (file.type.startsWith("image/")) {
        const preview = document.createElement("img");
        preview.src = URL.createObjectURL(file);
        preview.style.maxWidth = "150px";
        preview.style.marginTop = "10px";
        fileName.appendChild(preview);
    } else {
        fileName.textContent = "File: " + file.name;
    }
}
