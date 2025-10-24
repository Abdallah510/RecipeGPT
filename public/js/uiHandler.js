// uiHandlers.js
import { handleImageUpload } from "./imageHandler.js";

export function setupUIHandlers() {
    const plusBtn = document.getElementById("plusBtn");
    const menu = document.getElementById("menu");
    const uploadPhotoBtn = document.getElementById("uploadPhotoBtn");
    const uploadFileBtn = document.getElementById("uploadFileBtn");
    const imageInput = document.getElementById("imageInput");
    const fileInput = document.getElementById("fileInput");
    const advancedForm = document.getElementById("advancedForm");
    const advancedFilterToggle = document.getElementById("advancedFilter");

    plusBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        menu.classList.toggle("hidden");
    });

    advancedFilterToggle.addEventListener("change", (e) => {
        e.stopPropagation();
        if (e.target.checked) {
            advancedForm.hidden = false;
        } else {
            advancedForm.hidden = true;
        }
    });

    // Hide menu when clicking outside
    document.addEventListener("click", (e) => {
        if (!menu.contains(e.target) && e.target !== plusBtn) menu.classList.add("hidden");
    });

    uploadPhotoBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        imageInput.click();
    });

    uploadFileBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        fileInput.click();
    });

    // File/image preview + handle AI upload
    imageInput.addEventListener("change", async () => {
        if (imageInput.files.length > 0) {
            await handleImageUpload(imageInput.files[0]);
        }
    });

    fileInput.addEventListener("change", async () => {
        if (fileInput.files.length > 0) {
            await handleImageUpload(fileInput.files[0]);
        }
    });
}
