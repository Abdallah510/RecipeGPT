
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




// // Global variables
// let session = null;
// let foods_list = [];       // Stores foods for autocomplete
// let chatContainer = null;  // Will hold AI chat messages
// let autocompleteList = null; // Floating list container
// let selectedItems = []
// const photos = {};

// document.addEventListener("DOMContentLoaded", () => {
//     const input = document.getElementById("chat");
//     chatContainer = document.getElementById("aiResults");

//     let currentFocus = -1;

//     // Create floating autocomplete container
//     autocompleteList = document.createElement("div");
//     autocompleteList.className = "autocomplete-items";
//     autocompleteList.style.position = "absolute";
//     autocompleteList.style.zIndex = "9999";
//     document.body.appendChild(autocompleteList);

//     // Load foods JSON
//     fetch('/data/foods_grouped.json')
//         .then(res => res.json())
//         .then(data => {
//             foods_list = Array.isArray(data) ? data : Object.values(data).flat();
//             console.log("Foods loaded:", foods_list);
//         })
//         .catch(err => console.error("Failed to load JSON:", err));

//     // --------------------------
//     // AUTOCOMPLETE INPUT
//     // --------------------------
//     input.addEventListener("input", () => {
//         // let n = 0;
//         const fullQuery = input.value.toLowerCase().split(",");
//         query = fullQuery[fullQuery.length - 1].trim();
//         autocompleteList.innerHTML = "";
//         currentFocus = -1;
//         if (!query) return;

//         const filtered = foods_list.filter(item => item.toLowerCase().includes(query));
//         filtered.forEach(itemText => {
//             const item = document.createElement("div");
//             item.textContent = itemText;
//             item.addEventListener("click", () => {
//                 addToken(itemText)
//             });
//             autocompleteList.appendChild(item);
//         });

//         updateAutocompletePosition(input, autocompleteList);
//     });

//     input.addEventListener("keydown", (e) => {
//         const items = autocompleteList.getElementsByTagName("div");
//         if (!items) return;

//         if (e.key === "ArrowDown") {
//             currentFocus++;
//             highlightItem(items);
//         } else if (e.key === "ArrowUp") {
//             currentFocus--;
//             highlightItem(items);
//         } else if (e.key === "Enter") {
//             e.preventDefault();
//             if (currentFocus > -1 && items[currentFocus]) {
//                 items[currentFocus].click();
//             }
//         }
//     });

//     function addToken(text) {
//         const input = document.getElementById("chat");
//         const tokens = input.value.split(",").map(t => t.trim()).filter(t => t);
//         tokens[tokens.length - 1] = text; // replace last token
//         input.value = tokens.join(", ") + ", "; // add comma for next entry
//         autocompleteList.innerHTML = "";      // clear suggestions
//     }


//     function highlightItem(items) {
//         removeActive(items);
//         if (currentFocus >= items.length) currentFocus = 0;
//         if (currentFocus < 0) currentFocus = items.length - 1;
//         items[currentFocus].classList.add("autocomplete-active");
//     }

//     function removeActive(items) {
//         for (let i = 0; i < items.length; i++) {
//             items[i].classList.remove("autocomplete-active");
//         }
//     }

//     document.addEventListener("click", (e) => {
//         if (e.target !== input && !autocompleteList.contains(e.target)) {
//             autocompleteList.innerHTML = "";
//         }
//     });

//     window.addEventListener("scroll", () => updateAutocompletePosition(input, autocompleteList));
//     window.addEventListener("resize", () => updateAutocompletePosition(input, autocompleteList));

//     // --------------------------
//     // AI CHAT FORM SUBMISSION
//     // --------------------------
//     const form = document.querySelector("form.mb-3");


//     // form.addEventListener("keydown", async (e) => {
//     //     if (!session) {
//     //         const success = await runDiagnostics();
//     //         if (!success) return;
//     //     }
//     //     if (e.key==='Enter')
//     //         await sendMessage(input, chatContainer);
//     // });

// let selectedImageFile = null;

// imageInput.addEventListener("change", async() => {
//     if (imageInput.files.length > 0) {
//         selectedImageFile = imageInput.files[0];
//         fileName.textContent = "Photo: " + selectedImageFile.name;

//         // Optionally display a preview
//         const preview = document.createElement("img");
//         preview.src = URL.createObjectURL(selectedImageFile);
//         preview.style.maxWidth = "150px";
//         preview.style.marginTop = "10px";
//         fileName.innerHTML = "";
//         fileName.appendChild(preview);
//         await handleImageUpload(selectedImageFile);
//     }
// });

// fileInput.addEventListener("change",async () => {
//     if (fileInput.files.length > 0) {
//         selectedImageFile = fileInput.files[0];
//         fileName.textContent = "File: " + selectedImageFile.name;

//         // Display preview if image
//         if (selectedImageFile.type.startsWith("image/")) {
//             const preview = document.createElement("img");
//             preview.src = URL.createObjectURL(selectedImageFile);
//             preview.style.maxWidth = "150px";
//             preview.style.marginTop = "10px";
//             fileName.innerHTML = "";
//             fileName.appendChild(preview);
//             await handleImageUpload(selectedImageFile);
//         }
//     }
// });

// form.addEventListener("submit", async (e) => {
//   let preview = document.getElementsByTagName("img");
//     e.preventDefault();

//     if (!session) {
//         const success = await runDiagnostics();
//         if (!success) return;
//     }

//     if (!selectedImageFile && !input.value.trim()) {
//         alert("Please enter ingredients or upload an image!");
//         return;
//     }

//     if (selectedImageFile) {
//         if (input.value.trim()) {
//             await sendMessage(input, chatContainer);
//         }
//     } else {
//         await sendMessage(input, chatContainer);
//     }
// });

// const voicebutton = document.getElementById("voice");
// voicebutton.onclick = async () => {
//   let audioStream;
//   try {
//     // Record speech
//     audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
//     const chunks = [];
//     const recorder = new MediaRecorder(audioStream);
//     recorder.ondataavailable = ({ data }) => {
//       chunks.push(data);
//     };
//     recorder.start();
//     await new Promise((r) => setTimeout(r, 5000));
//     recorder.stop();
//     await new Promise((r) => (recorder.onstop = r));

//     const blob = new Blob(chunks, { type: recorder.mimeType });

//     // Save it for later
//     const a = document.createElement("a");
//     a.href = URL.createObjectURL(blob);
//     a.target = "_blank";
//     a.download = "recording.mp3";
//     a.click();

//     await transcribe(blob);
//   } catch (error) {
//     log(error);
//   } finally {
//     logs.append(`<hr>`);
//     audioStream?.getTracks().forEach((track) => track.stop());
//   }
// };

// inputFile.oninput = async (event) => {
//   try {
//     const file = event.target.files[0];
//     const blob = new Blob([file]);
//     audioElement.src = URL.createObjectURL(blob);
//     await transcribe(blob);
//   } catch (error) {
//     log(error);
//   } finally {
//     logs.append(`<hr>`);
//   }
// };

// async function transcribe(blob) {
//   const arrayBuffer = await blob.arrayBuffer();

//   const params = await LanguageModel.params();
//   const session = await LanguageModel.create({
//     expectedInputs: [{ type: "audio" }],
//     temperature: 0.1,
//     topK: params.defaultTopK,
//   });

//   const stream = session.promptStreaming([
//     {
//       role: "user",
//       content: [
//         { type: "text", value: "transcribe this audio" },
//         { type: "audio", value: arrayBuffer },
//       ],
//     },
//   ]);
//   for await (const chunk of stream) {
//     logs.append(chunk);
//   }
// }

// function log(text) {
//   logs.append(`${text}\r\n`);
// }


// });

// // --------------------------
// // AUTOCOMPLETE POSITIONING
// // --------------------------
// function updateAutocompletePosition(inputEl, listEl) {
//     const rect = inputEl.getBoundingClientRect();
//     listEl.style.left = rect.left + window.scrollX + "px";
//     listEl.style.top = rect.bottom + window.scrollY + "px";
//     listEl.style.width = rect.width + "px";
// }

// // --------------------------
// // AI SESSION
// // --------------------------
// async function runDiagnostics() {
//     if (!window.LanguageModel) {
//         alert("LanguageModel API not available");
//         return false;
//     }
//     try {
//         session = await LanguageModel.create();
//         console.log("✅ Session created");
//         return true;
//     } catch (err) {
//         console.error(err);
//         return false;
//     }
// }

// function renderMarkdown(text) {
//     if (!text) return "";

//     // Escape HTML to avoid XSS
//     text = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

//     // --- Code Blocks ```lang ... ```
//     text = text.replace(/```(.*?)\n([\s\S]*?)```/g, (match, lang, code) => {
//         return `<pre><code class="${lang}">${code}</code></pre>`;
//     });

//     // Inline code `code`
//     text = text.replace(/`([^`\n]+)`/g, "<code>$1</code>");

//     // Bold and italics ***text***
//     text = text.replace(/\*\*\*([^\*]+)\*\*\*/g, "<strong><em>$1</em></strong>");
//     // Bold **text**
//     text = text.replace(/\*\*([^\*]+)\*\*/g, "<strong>$1</strong>");
//     // Italic *text*
//     text = text.replace(/\*([^\*]+)\*/g, "<em>$1</em>");

//     // Underline __text__
//     text = text.replace(/__([^_]+)__/g, "<u>$1</u>");

//     // Strikethrough ~~text~~
//     text = text.replace(/~~([^~]+)~~/g, "<s>$1</s>");

//     // Headings # H1, ## H2, ### H3
//     text = text.replace(/^### (.*)$/gm, "<h3>$1</h3>");
//     text = text.replace(/^## (.*)$/gm, "<h2>$1</h2>");
//     text = text.replace(/^# (.*)$/gm, "<h1>$1</h1>");

//     // Blockquote > text
//     text = text.replace(/^> (.*)$/gm, "<blockquote>$1</blockquote>");

//     // Unordered lists (- or *)
//     text = text.replace(/^(?:-|\*) (.*)$/gm, "<li>$1</li>");
//     // Wrap <li> in <ul>
//     text = text.replace(/(<li>[\s\S]*?<\/li>)/g, "<ul>$1</ul>");

//     // Ordered lists 1. 2. 3.
//     text = text.replace(/^\d+\. (.*)$/gm, "<li>$1</li>");
//     // Wrap <li> in <ol>
//     text = text.replace(/(<li>[\s\S]*?<\/li>)/g, "<ol>$1</ol>");

//     // Links [text](url)
//     text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');

//     // Line breaks
//     text = text.replace(/\n/g, "<br>");

//     return text;
// }



// // --------------------------
// // SEND AI MESSAGE
// // --------------------------
// async function sendMessage(chatBox, chatContainer) {
//     if (!session) {
//         alert("Run diagnostics first");
//         return;
//     }
//     let outputbox = document.getElementById("outputBox");
//     outputbox.hidden = false;
    

//       const progressContainer = document.createElement("div");
//     progressContainer.className = "progress my-3";
//     progressContainer.innerHTML = `
//         <div class="progress-bar progress-bar-striped progress-bar-animated"
//              role="progressbar"
//              style="width: 0%; transition: width 0.2s ease;"
//              aria-valuenow="0" aria-valuemin="0" aria-valuemax="100">
//         </div>`;
//     chatContainer.appendChild(progressContainer);
//     const progressBar = progressContainer.querySelector(".progress-bar");
//     progressBar.id = 'progress-bar';

//     let progress = 0;
//     const progressInterval = setInterval(() => {
//         if (progress < 95) {
//             progress += Math.random() * 10;
//             if (progress > 95) progress = 95;
//             progressBar.style.width = progress + "%";
//         }
//     }, 400);



//     const text = chatBox.value.trim();
//     if (!text) return;

//     const userMsg = document.createElement("div");
//     userMsg.className = "message user";
//     userMsg.textContent = text;
//     chatContainer.appendChild(userMsg);

//     chatBox.value = "";

//     try {
//                 const prompt = `User Ingredients: ${text}
//                 Instruction: Generate a recipe including:
//                 1. "country": The name of the country.
//                 2. "name": The recipe title.
//                 3. "description": A short 1–2 sentence description of the dish.
//                 4. "ingredients": An array of ingredient strings.
//                 5. "instructions": An array of 4–7 full-sentence cooking steps (each step should be detailed, not one word).
//                 6. "time": Estimated cooking time (e.g., "30 minutes").
//                 7. "image_description": A short phrase describing what the dish looks like.

//                 Important:
//                 - Return ONLY valid 3 JSON recipes.
//                 - Use double quotes (") for all keys and strings.
//                 - Return an array of recipe objects (e.g. [ { ... }, { ... } ]).
//                 - Do NOT include any commentary, Markdown, or text outside of the JSON.`;




        

//         const fullPrompt = `User Ingredients: ${text}\n${prompt}`;
//         let response = await session.prompt(fullPrompt);


//         let cleanResponse = response.replace(/```json\s*|```/g, "").trim();

//         clearInterval(progressInterval);
//         progressBar.style.width = "100%";
//         progressBar.classList.remove("progress-bar-animated");
//         progressBar.classList.add("bg-success");


//         let recipe;
//         try {
//             recipe = JSON.parse(cleanResponse);
//         } catch (err) {
//             console.error("Failed to parse JSON:", err, cleanResponse);
//             chatContainer.innerHTML += `<div class="message ai">❌ Invalid AI response</div>`;
//             return;
//         }
//         renderRecipeCards(recipe, chatContainer);


//         // const aiMsg = document.createElement("div");
//         // aiMsg.className = "message ai";
//         // aiMsg.innerHTML = renderMarkdown(response);
//         // chatContainer.appendChild(aiMsg);
        
//         chatContainer.scrollTop = chatContainer.scrollHeight;

//     } catch (err) {
//         const aiMsg = document.createElement("div");
//         aiMsg.className = "message ai";
//         aiMsg.textContent = "❌ Error: " + err.message;
//         chatContainer.appendChild(aiMsg);
//     }
// }

// document.addEventListener("DOMContentLoaded", () => {
//     const plusBtn = document.getElementById("plusBtn");
//     const menu = document.getElementById("menu");
//     const uploadPhotoBtn = document.getElementById("uploadPhotoBtn");
//     const uploadFileBtn = document.getElementById("uploadFileBtn");
//     const imageInput = document.getElementById("imageInput");
//     const fileInput = document.getElementById("fileInput");
//     const fileName = document.getElementById("fileName");

//     plusBtn.addEventListener("click", (e) => {
//     e.stopPropagation();
//     menu.classList.toggle("hidden");
// });


//     // Hide menu when clicking outside
//     document.addEventListener("click", (e) => {
//         if (!menu.contains(e.target) && e.target !== plusBtn) menu.classList.add("hidden");
//     });

//   uploadPhotoBtn.addEventListener("click", (e) => {
//       e.preventDefault();
//       e.stopPropagation();
//       imageInput.click();
//   });
//   uploadFileBtn.addEventListener("click", (e) => {
//       e.preventDefault();
//       e.stopPropagation();
//       fileInput.click();
//   });


//     // Show preview or filename for selected files
//     function showPreview(file) {
//         if (!file) return;
//         fileName.innerHTML = "";

//         if (file.type.startsWith("image/")) {
//             const preview = document.createElement("img");
//             preview.src = URL.createObjectURL(file);
//             preview.style.maxWidth = "150px";
//             preview.style.marginTop = "10px";
//             fileName.appendChild(preview);
//         } else {
//             fileName.textContent = "File: " + file.name;
//         }
//     }

//     imageInput.addEventListener("change", () => showPreview(imageInput.files[0]));
//     fileInput.addEventListener("change", () => showPreview(fileInput.files[0]));
// });



// function renderRecipeCards(recipes, container) {
//   const row = document.createElement("div");
//   row.className = "row g-4 mt-2";

//   recipes.forEach((recipe, index) => {
//     const shortIngredients = recipe.ingredients.slice(0, 3).join(", ") + (recipe.ingredients.length > 3 ? "..." : "");
//     const prompt = `${recipe.name}`;
//     const width = 1024;
//     const height = 1024;
//     const seed = 42;
//     const model = 'flux'; 
//     try{
//       imageUrl = `https://pollinations.ai/p/${encodeURIComponent(prompt)}?width=${width}&height=${height}&seed=${seed}&model=${model}`;
//       photos[recipe.name] = imageUrl;
//     }catch(err){
//       console.error("Image generation error:", err);
//       photos[recipe.name] = "/images/background.jpg";
//     }
//     const card = document.createElement("div");
//     card.className = "col-md-4";

//     card.innerHTML = `
//       <div class="card h-100 shadow-sm border-0 recipe-card" 
//            style="cursor:pointer; transition:transform 0.2s ease;"
//            data-index="${index}">
//         <img src="${imageUrl}" class="card-img-top" alt="${recipe.name}">
//         <div class="card-body">
//           <div class="d-flex justify-content-between align-items-center mb-2">
//             <h5 class="card-title mb-0">${recipe.name}</h5>
//             <span class="badge bg-light text-dark border">${recipe.country}</span>
//           </div>
//           <p class="text-muted small mb-1">⏱ ${recipe.time}</p>
//           <p class="card-text"><strong>Ingredients:</strong> ${shortIngredients}</p>
//         </div>
//       </div>
//     `;

//     card.querySelector(".recipe-card").addEventListener("click", () => showRecipeModal(recipe));
//     row.appendChild(card);
//   });

//   container.appendChild(row);

//   // Make sure modal exists only once
//   if (!document.getElementById("recipeModal")) {
//     const modalHTML = `
//       <div class="modal fade" id="recipeModal" tabindex="-1" aria-hidden="true">
//         <div class="modal-dialog modal-lg modal-dialog-centered">
//           <div class="modal-content">
//             <div class="modal-header">
//               <h5 class="modal-title" id="recipeTitle"></h5>
//               <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
//             </div>
//             <div class="modal-body">
//               <img id="recipeImage" src="" alt="" class="img-fluid rounded mb-3">
//               <p id="recipeCountry" class="text-muted"></p>
//               <p id="recipeTime" class="text-muted"></p>
//               <p id="recipeDescription" class="mb-3"></p>
//               <h6 class="text-info">Ingredients:</h6>
//               <ul id="recipeIngredients"></ul>
//               <h6 class="text-warning mt-3">Instructions:</h6>
//               <ol id="recipeInstructions"></ol>
//             </div>
//           </div>
//         </div>
//       </div>
//     `;
//     document.body.insertAdjacentHTML("beforeend", modalHTML);
//   }
// }
// function showRecipeModal(recipe) {
//     let img = "";
//   for (const key in photos) {
//     if (key === recipe.name) {
//       img = photos[key];
//       break;
//     }
//   }
//   document.getElementById("recipeTitle").textContent = recipe.name;
//   document.getElementById("recipeImage").src = img;
//   document.getElementById("recipeCountry").textContent = `🌍 Country: ${recipe.country}`;
//   document.getElementById("recipeTime").textContent = `⏱ Time: ${recipe.time}`;
//   document.getElementById("recipeDescription").textContent = recipe.description;
  
//   document.getElementById("recipeIngredients").innerHTML =
//     recipe.ingredients.map(i => `<li>${i}</li>`).join("");
//   document.getElementById("recipeInstructions").innerHTML =
//     recipe.instructions.map(s => `<li>${s}</li>`).join("");

//   const modal = new bootstrap.Modal(document.getElementById("recipeModal"));
//   modal.show();
// }

// async function handleImageUpload(file) {
//     if (!file) return;

//     const chatContainer = document.getElementById("aiResults");
//     const aiMsg = document.createElement("div");
//     aiMsg.className = "message ai";
//     aiMsg.textContent = "🔍 Analyzing image...";
//     chatContainer.appendChild(aiMsg);

//     try {
//         const imageSession = await LanguageModel.create({
//             expectedInputs: [{ type: "image" }],
//             expectedOutputs: [{ type: "text", languages: ["en"] }]
//         });

//         const input = document.getElementById("chat");
//         const userPrompt = "Detect foods and ingredients in this image. Return them as a comma-separated list.";

//         const result = await imageSession.prompt([
//             {
//                 role: "user",
//                 content: [
//                     { type: "text", value: userPrompt },
//                     { type: "image", value: file }
//                 ]
//             }
//         ]);
//         input.value = result + ", ";
//     } catch (err) {
//         console.error("Image analysis error:", err);
//         aiMsg.textContent = "❌ Error analyzing image: " + err.message;
//     }
// }
