export function setupVoiceInput() {
    const voiceButton = document.getElementById("voice");
    const chatInput = document.getElementById("chat");

    let recorder = null;
    let audioStream = null;
    let chunks = [];
    let isRecording = false;
    let startTime = 0;
    let timerInterval = null;
    let timerElement = null;

    voiceButton.addEventListener("click", async () => {
        if (!isRecording) {
            // Start Recording
            try {
                audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                recorder = new MediaRecorder(audioStream);
                chunks = [];

                recorder.ondataavailable = e => chunks.push(e.data);
                recorder.start();
                isRecording = true;
                startTime = Date.now();

                // Updates UI
                voiceButton.classList.add("recording");
                voiceButton.innerHTML = `<i class="bi bi-stop-fill text-danger"></i>`;
                showTimer();

                console.log("🎙️ Recording started");
            } catch (err) {
                console.error("Microphone error:", err);
                alert("Microphone access is required.");
            }

        } else {
            // --- STOP RECORDING ---
            recorder.stop();
            isRecording = false;
            stopTimer();

            voiceButton.classList.remove("recording");
            voiceButton.innerHTML = `<i class="bi bi-mic-fill"></i>`;

            await new Promise(r => (recorder.onstop = r));
            audioStream.getTracks().forEach(track => track.stop());

            const blob = new Blob(chunks, { type: recorder.mimeType });
            console.log("🎤 Recording stopped, size:", blob.size);
            await transcribe(blob);
        }
    });

    async function transcribe(blob) {
        const arrayBuffer = await blob.arrayBuffer();
        const params = await LanguageModel.params();
        const session = await LanguageModel.create({
            expectedInputs: [{ type: "audio" }],
            temperature: 0.1,
            topK: params.defaultTopK,
            expectedOutputs: [{ type: "text", languages: ["en"] }]
        });
        const result = await session.prompt([
            {
                role: "user",
                content: [
                    { type: "text", value: "Detect foods and ingredients in this audio. Return them as a comma-separated list." },
                    { type: "audio", value: arrayBuffer }
                ],
            },
        ]);
        chatInput.value = result + ", ";
    }

    function showTimer() {
        timerElement = document.createElement("span");
        timerElement.id = "record-timer";
        timerElement.style.marginLeft = "10px";
        timerElement.style.fontWeight = "600";
        timerElement.style.color = "red";
        timerElement.textContent = "0:00";
        voiceButton.insertAdjacentElement("afterend", timerElement);

        timerInterval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - startTime) / 1000);
            const minutes = Math.floor(elapsed / 60);
            const seconds = elapsed % 60;
            timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, "0")}`;
        }, 500);
    }

    function stopTimer() {
        clearInterval(timerInterval);
        if (timerElement) {
            timerElement.remove();
            timerElement = null;
        }
    }
}
