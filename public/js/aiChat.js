import { renderRecipeCards } from "./recipeRenderer.js";


function getCurrentTags() {
    const tagCloudElement = document.querySelector('#tag-cloud-wrapper .tag-cloud');
    if (!tagCloudElement) return [];
    return Array.from(tagCloudElement.querySelectorAll('.tag-text')).map(el => el.textContent.trim());
}


export function setupAIChat() {
    const form = document.getElementById("form");
    const chatBox = document.getElementById("chat");
    const chatContainer = document.getElementById("aiResults");
    const addchip = document.getElementById("addchip");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (!window.session) await runDiagnostics();
        if (getCurrentTags().length === 0) return;
        console.log("Sending message:", getCurrentTags());
        await sendMessage(getCurrentTags(), chatContainer, window.session);
    });

    addchip.addEventListener("click", async (e) => {
        e.preventDefault();
        const tagCloud = await createTagCloudFromKeywords(
chatBox.value.trim().replace(/,+$/, '').split(",").map(s => s.trim())
);
chatBox.value = "";
    document.getElementById("outputContainer").appendChild(tagCloud);
    });
}

async function runDiagnostics() {
    if (!window.LanguageModel) {
        alert("LanguageModel API not available");
        return;
    }
    try {
        window.session = await LanguageModel.create();
        console.log("✅ Session created");
    } catch (err) {
        console.error(err);
    }
}


async function createTagCloudFromKeywords(keywords) {
    // Try to find the existing tag cloud
    let tagCloudWrapper = document.getElementById('tag-cloud-wrapper');
    let tagCloudElement;

    if (!tagCloudWrapper) {
        // 1. Create the main container for the single tag cloud
        tagCloudWrapper = document.createElement('div');
        tagCloudWrapper.className = 'tag-cloud-wrapper';
        tagCloudWrapper.id = 'tag-cloud-wrapper';

        // 2. Create the main cloud remove button (top-right “x”)
        const removeCloudButton = document.createElement('span');
        removeCloudButton.className = 'tag-cloud-remove-btn';
        removeCloudButton.innerHTML = ' ×';
        removeCloudButton.title = "Remove Entire Tag Cloud";
        removeCloudButton.addEventListener('click', () => tagCloudWrapper.remove());

        // 3. Create the inner container for tags
        tagCloudElement = document.createElement('div');
        tagCloudElement.className = 'tag-cloud';

        // 4. Assemble wrapper: [Cloud Remove Button] + [Tags]
        tagCloudWrapper.appendChild(removeCloudButton);
        tagCloudWrapper.appendChild(tagCloudElement);

        // 5. Add to your desired output container (or body if none)
        const outputContainer = document.getElementById('output-container') || document.body;
        outputContainer.appendChild(tagCloudWrapper);
    } else {
        tagCloudElement = tagCloudWrapper.querySelector('.tag-cloud');
    }

    // 6. Add new tags with their own remove buttons
    keywords.forEach((text, index) => {
        const tagElement = document.createElement('span');
        const size = Math.floor(Math.random() * 5) + 1;
        tagElement.className = `tag size-${size} color-${(index % 5) + 1}`;

        // Inner span for text
        const tagText = document.createElement('span');
        tagText.className = 'tag-text';
        tagText.textContent = text;

        // Small remove button for each tag
        const removeTagButton = document.createElement('span');
        removeTagButton.className = 'tag-remove-btn';
        removeTagButton.innerHTML = '  ×';
        removeTagButton.title = `Remove "${text}"`;
        removeTagButton.addEventListener('click', (e) => {
            e.stopPropagation(); // prevent triggering parent clicks
            tagElement.remove();
        });

        tagElement.appendChild(tagText);
        tagElement.appendChild(removeTagButton);

        // Optional: click to toggle selection style
        tagElement.addEventListener('click', function () {
            this.classList.toggle('selected');
        });

        tagCloudElement.appendChild(tagElement);
    });

    return tagCloudWrapper;
}



// aiChat.js
export async function sendMessage(chatBox, chatContainer, session, photos) {
    if (!session) {
        alert("Run diagnostics first");
        return;
    }
    const outputbox = document.getElementById("outputBox");
    outputbox.hidden = false;

    const progressContainer = document.createElement("div");
    progressContainer.className = "progress my-3";
    progressContainer.innerHTML = `
        <div class="progress-bar progress-bar-striped progress-bar-animated"
             role="progressbar"
             style="width: 0%; transition: width 0.2s ease;"
             aria-valuenow="0" aria-valuemin="0" aria-valuemax="100">
        </div>`;
    chatContainer.appendChild(progressContainer);
    const progressBar = progressContainer.querySelector(".progress-bar");
    progressBar.id = 'progress-bar';

    let progress = 0;
    const progressInterval = setInterval(() => {
        if (progress < 95) {
            progress += Math.random() * 10;
            if (progress > 95) progress = 95;
            progressBar.style.width = progress + "%";
        }
    }, 400);

    const text = chatBox;
    if (!text) return;
    const includeOnlyAvailable = document.getElementById("includeOnlyAvailable");
    const dishTypeSelect = document.getElementById("dish-type-select");
    const cuisineTypeSelect = document.getElementById("cuisine-select");
    const dietTypeSelect = document.getElementById("diet-type-select");
    const userMsg = document.createElement("div");
    userMsg.className = "message user";
    userMsg.textContent = text;
    chatContainer.appendChild(userMsg);
    let include_query = "";

    if (includeOnlyAvailable.checked) {
        include_query = "ONLY USE THE GIVEN INGREDIENTS TO MAKE THAT RECIPE";
    } else {
        include_query = "YOU CAN USE OTHER INGREDIENTS IF NECESSARY";
    }

    chatBox.value = "";

    try {
        const prompt = `User Ingredients: ${text} PARAMS:
        Dish Type: ${dishTypeSelect.value}
        Cuisine Type: ${cuisineTypeSelect.value}
        Diet Type: ${dietTypeSelect.value}
        Instruction: Generate a recipe including:
        1. "country": The name of the country.
        2. "name": The recipe title.
        3. "description": A short 1–2 sentence description of the dish.
        4. "ingredients": An array of ingredient strings.
        5. "instructions": An array of 4–7 full-sentence cooking steps (each step should be detailed, not one word).
        6. "time": Estimated cooking time (e.g., "30 minutes").
        7. "image_description": A short phrase describing what the dish looks like.

        Important:
        - ${include_query}. if you take too much time or it wont work ignore the YES or NO
        - If a cuisine type is specified, ensure the recipe aligns with that cuisine.
        - If a dish type is specified, ensure the recipe fits that dish category.
        - If a diet type is specified, ensure the recipe adheres to that dietary restriction even 
          if you have to swap the foods that do not align with the diet.
        - Return ONLY valid JSON recipes.
        - Use double quotes (") for all keys and strings.
        - Return an array of recipe objects (e.g. [ { ... }, { ... } ]).
        - Do NOT include any commentary, Markdown, or text outside of the JSON.`;

        const fullPrompt = `User Ingredients: ${text}\n${prompt}`;
        let response = await session.prompt(fullPrompt);

        let cleanResponse = response.replace(/```json\s*|```/g, "").trim();

        clearInterval(progressInterval);
        progressBar.style.width = "100%";
        progressBar.classList.remove("progress-bar-animated");
        progressBar.classList.add("bg-success");

        let recipe;
        try {
            recipe = JSON.parse(cleanResponse);
        } catch (err) {
            console.error("Failed to parse JSON:", err, cleanResponse);
            chatContainer.innerHTML += `<div class="message ai">❌ Invalid AI response</div>`;
            return;
        }
        const photos = {};
        renderRecipeCards(recipe, chatContainer, photos);

        chatContainer.scrollTop = chatContainer.scrollHeight;

    } catch (err) {
        const aiMsg = document.createElement("div");
        aiMsg.className = "message ai";
        aiMsg.textContent = "❌ Error: " + err.message;
        chatContainer.appendChild(aiMsg);
    }
}

// Markdown renderer
export function renderMarkdown(text) {
    if (!text) return "";

    text = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    text = text.replace(/```(.*?)\n([\s\S]*?)```/g, (match, lang, code) => `<pre><code class="${lang}">${code}</code></pre>`);
    text = text.replace(/`([^`\n]+)`/g, "<code>$1</code>");
    text = text.replace(/\*\*\*([^\*]+)\*\*\*/g, "<strong><em>$1</em></strong>");
    text = text.replace(/\*\*([^\*]+)\*\*/g, "<strong>$1</strong>");
    text = text.replace(/\*([^\*]+)\*/g, "<em>$1</em>");
    text = text.replace(/__([^_]+)__/g, "<u>$1</u>");
    text = text.replace(/~~([^~]+)~~/g, "<s>$1</s>");
    text = text.replace(/^### (.*)$/gm, "<h3>$1</h3>");
    text = text.replace(/^## (.*)$/gm, "<h2>$1</h2>");
    text = text.replace(/^# (.*)$/gm, "<h1>$1</h1>");
    text = text.replace(/^> (.*)$/gm, "<blockquote>$1</blockquote>");
    text = text.replace(/^(?:-|\*) (.*)$/gm, "<li>$1</li>");
    text = text.replace(/(<li>[\s\S]*?<\/li>)/g, "<ul>$1</ul>");
    text = text.replace(/^\d+\. (.*)$/gm, "<li>$1</li>");
    text = text.replace(/(<li>[\s\S]*?<\/li>)/g, "<ol>$1</ol>");
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
    text = text.replace(/\n/g, "<br>");
    return text;
}
