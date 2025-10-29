import { renderRecipeCards } from "./recipeRenderer.js";


let foods_list = [];

(async () => {
    const res = await fetch('/data/foods_grouped.json');
    const data = await res.json();
    foods_list = extractStrings(data);
    console.log("✅ Foods loaded:", foods_list.length);
})();

function extractStrings(obj) {
    if (Array.isArray(obj)) return obj.flatMap(extractStrings);
    if (typeof obj === 'object' && obj !== null) return Object.values(obj).flatMap(extractStrings);
    if (typeof obj === 'string') return [obj];
    return [];
}
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
    const generateBtn = document.getElementById("generateRecipes");

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

    generateBtn.addEventListener("click", async () => {
        if (!window.session) await runDiagnostics();
        const tags = getCurrentTags();
        if (tags.length === 0) {
            alert("Add some ingredients first!");
            return;
        }
        console.log("🔹 Generating recipes for:", tags);
        await sendMessage(tags, chatContainer, window.session);
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
    let tagCloudWrapper = document.getElementById('tag-cloud-wrapper');
    let tagCloudElement;

    if (!tagCloudWrapper) {
        tagCloudWrapper = document.createElement('div');
        tagCloudWrapper.className = 'tag-cloud-wrapper';
        tagCloudWrapper.id = 'tag-cloud-wrapper';

        const removeCloudButton = document.createElement('span');
        removeCloudButton.className = 'tag-cloud-remove-btn';
        removeCloudButton.innerHTML = ' ×';
        removeCloudButton.title = "Remove Entire Tag Cloud";
        removeCloudButton.addEventListener('click', () => tagCloudWrapper.remove());

        tagCloudElement = document.createElement('div');
        tagCloudElement.className = 'tag-cloud';

        tagCloudWrapper.appendChild(removeCloudButton);
        tagCloudWrapper.appendChild(tagCloudElement);

        const outputContainer = document.getElementById('output-container') || document.body;
        outputContainer.appendChild(tagCloudWrapper);
    } else {
        tagCloudElement = tagCloudWrapper.querySelector('.tag-cloud');
    }

    keywords.forEach((text, index) => {
        if (foods_list.some(food => food.toLowerCase().includes(text.toLowerCase()))) {
            const tagElement = document.createElement('span');
            const size = Math.floor(Math.random() * 5) + 1;
            tagElement.className = `tag size-${size} color-${(index % 5) + 1}`;

            const tagText = document.createElement('span');
            tagText.className = 'tag-text';
            tagText.textContent = text;

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

            tagElement.addEventListener('click', function () {
                this.classList.toggle('selected');
            });


            tagCloudElement.appendChild(tagElement);
        }

    });

    return tagCloudWrapper;
}




export async function sendMessage(chatBox, chatContainer, session, photos) {
    if (!session) {
        alert("Run diagnostics first");
        return;
    }

    const outputbox = document.getElementById("outputBox");
    outputbox.hidden = false;

    const progressContainer = document.createElement("div");
    progressContainer.className = "text-center my-4";
    progressContainer.innerHTML = `
      <div class="spinner-border text-success" role="status" style="width: 3rem; height: 3rem;">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-3 fw-semibold text-success">Cooking your recipes...</p>
    `;
    chatContainer.appendChild(progressContainer);

    const text = chatBox;
    if (!text) return;

    const includeOnlyAvailable = document.getElementById("includeOnlyAvailable");
    const dishTypeSelect = document.getElementById("dish-type-select");
    const cuisineTypeSelect = document.getElementById("cuisine-select");
    const dietTypeSelect = document.getElementById("diet-type-select");

    let include_query = includeOnlyAvailable.checked
        ? "ONLY USE THE GIVEN INGREDIENTS TO MAKE THAT RECIPE"
        : "YOU CAN USE OTHER INGREDIENTS IF NECESSARY";

    chatBox.value = "";

    try {
        const prompt = `User Ingredients: ${text} PARAMS:
        Dish Type: ${dishTypeSelect.value}
        Cuisine Type: ${cuisineTypeSelect.value}
        Diet Type: ${dietTypeSelect.value}
        Instruction: Generate 3 recipes including:
        1. "country": The name of the country.
        2. "name": The recipe title.
        3. "description": A short 1–2 sentence description of the dish.
        4. "ingredients": An array of ingredient with ammount strings.
        5. "instructions": An array of 4–7 detailed cooking steps.
        6. "time": Estimated cooking time (e.g., "30 minutes").
        7. "image_description": A short phrase describing what the dish looks like.

        Important:
        - ${include_query}.
        - If a cuisine type is specified, ensure the recipe aligns with that cuisine.
        - If a dish type is specified, ensure the recipe fits that category.
        - If a diet type is specified, ensure the recipe adheres to that restriction.
        - Return ONLY valid JSON recipes (array of objects).
        - Use double quotes for all keys and strings.
        - Do NOT include any commentary or Markdown.`;

        const fullPrompt = `User Ingredients: ${text}\n${prompt}`;
        const response = await session.prompt(fullPrompt);

        progressContainer.remove();

        let cleanResponse = response.replace(/```json\s*|```/g, "").trim();

        let recipe;
        try {
            recipe = JSON.parse(cleanResponse);
        } catch (err) {
            console.error("Failed to parse JSON:", err, cleanResponse);
            chatContainer.innerHTML += `<div class="message ai text-danger">❌ Invalid AI response</div>`;
            return;
        }

        const photos = {};
        renderRecipeCards(recipe, chatContainer, photos);

        chatContainer.scrollTop = chatContainer.scrollHeight;

    } catch (err) {
        progressContainer.remove();
        const aiMsg = document.createElement("div");
        aiMsg.className = "message ai text-danger";
        aiMsg.textContent = "❌ Error: " + err.message;
        chatContainer.appendChild(aiMsg);
    }
}


