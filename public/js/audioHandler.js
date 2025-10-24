export function setupVoiceInput() {
    const voiceButton = document.getElementById("voice");
    const logs = document.getElementById("logs");

    voiceButton.onclick = async () => {
        let audioStream;
        try {
            audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const chunks = [];
            const recorder = new MediaRecorder(audioStream);
            recorder.ondataavailable = ({ data }) => chunks.push(data);
            recorder.start();
            await new Promise(r => setTimeout(r, 5000));
            recorder.stop();
            await new Promise(r => (recorder.onstop = r));
            const blob = new Blob(chunks, { type: recorder.mimeType });
            const a = document.createElement("a");
            // a.href = URL.createObjectURL(blob);
            // a.target = "_blank";
            // a.download = "recording.mp3";
            // a.innerText = "Download recording";
            // a.click();
            await transcribe(blob);
        } catch (error) {
            log(error);
        } finally {
            // logs.append(`<hr>`);
            audioStream?.getTracks().forEach(track => track.stop());
        }
    };

    async function transcribe(blob) {
        const arrayBuffer = await blob.arrayBuffer();
        const params = await LanguageModel.params();
        const session = await LanguageModel.create({
            expectedInputs: [{ type: "audio" }],
            temperature: 0.1,
            topK: params.defaultTopK,
            expectedOutputs: [{ type: "text", languages: ["en"] }]
        });
        const input = document.getElementById("chat");
        const result = await session.prompt([
            {
                role: "user",
                content: [
                    { type: "text", value: "Detect foods and ingredients in this audio. Return them as a comma-separated list." },
                    { type: "audio", value: arrayBuffer }
                ],
            },
        ]);
        input.value = result + ", ";
        //for await (const chunk of stream) logs.append(chunk);
    }

    function log(text) {
        logs.append(`${text}\r\n`);
    }
}
