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
    try {
        const imageSession = await LanguageModel.create({
            expectedInputs: [{ type: "image" }],
            expectedOutputs: [{ type: "text", languages: ["en"] }]
        });


        const input = document.getElementById("chat");
        input.value = "Processing image... ";
        const userPrompt = "Detect foods and ingredients in this image. Return them as a comma-separated list. if you couldn't just say -Error-";

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

export function setupCameraCapture() {
    const cameraInput = document.createElement("input");
    cameraInput.type = "file";
    cameraInput.accept = "image/*";
    cameraInput.capture = "environment"; // opens rear camera on phones
    cameraInput.style.display = "none";

    document.body.appendChild(cameraInput);

    cameraInput.addEventListener("change", async () => {
        if (cameraInput.files.length > 0) {
            const file = cameraInput.files[0];
            await handleImageUpload(file);
            document.body.removeChild(cameraInput);
        }
    });

    cameraInput.click();
}

export async function setupWebcamCapture() {
    const modal = document.createElement("div");
    modal.className = "camera-modal";
    modal.style = `
        position: fixed;
        top: 0; left: 0;
        width: 100%; height: 100%;
        background: rgba(0,0,0,0.8);
        display: flex; justify-content: center; align-items: center;
        flex-direction: column; z-index: 9999;
    `;

    const video = document.createElement("video");
    video.autoplay = true;
    video.playsInline = true;
    video.style = "width: 480px; border-radius: 10px;";

    const captureBtn = document.createElement("button");
    captureBtn.textContent = "Capture Photo";
    captureBtn.style = "margin-top: 15px; padding: 8px 16px; border-radius: 6px;";

    const cancelBtn = document.createElement("button");
    cancelBtn.textContent = "Cancel";
    cancelBtn.style = "margin-top: 8px; padding: 8px 16px; border-radius: 6px;";

    modal.append(video, captureBtn, cancelBtn);
    document.body.appendChild(modal);

    // Start the webcam stream
    let stream;
    try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
    } catch (err) {
        alert("Cannot access webcam: " + err.message);
        document.body.removeChild(modal);
        return;
    }

    // Capture snapshot
    captureBtn.addEventListener("click", async () => {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(async (blob) => {
            const file = new File([blob], "webcam_capture.jpg", { type: "image/jpeg" });
            await handleImageUpload(file);
        }, "image/jpeg");

        // Cleanup
        stream.getTracks().forEach(track => track.stop());
        document.body.removeChild(modal);
    });

    cancelBtn.addEventListener("click", () => {
        stream.getTracks().forEach(track => track.stop());
        document.body.removeChild(modal);
    });
}
