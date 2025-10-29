
import { setupAutocomplete } from "./autocomplete.js";
import { setupUIHandlers } from "./uiHandler.js";
import { setupVoiceInput } from "./audioHandler.js";
import { setupAIChat } from "./aiChat.js";
import { setupImageUpload } from "./imageHandler.js";

document.addEventListener("DOMContentLoaded", async () => {
    await setupAutocomplete();
    setupUIHandlers();
    setupVoiceInput();
    setupAIChat();
    setupImageUpload();

    console.log("✅ All modules initialized");
});