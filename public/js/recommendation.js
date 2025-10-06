let session = null;
const photos = {};
let imageUrl = "";
// ---------------------------
// Event Listeners
// ---------------------------  
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("recommendBtn");
  const container = document.getElementById("recipesContainer");

  btn.addEventListener("click", async () => {
    // Add a small loading message above new recipes
    const loading = document.createElement("p");
    loading.className = "text-center text-secondary mt-3";
    loading.textContent = "Generating more world recipes... 🌎🍳";
    container.appendChild(loading);

    // Ensure session exists
    if (!session) {
      const ok = await runDiagnostics();
      if (!ok) return;
    }

    // Generate new batch of recipes and append
    await generateWorldRecipes(container, loading);
  });
});

// ---------------------------
// Initialize AI session
// ---------------------------
async function runDiagnostics() {
  if (!window.LanguageModel) {
    alert("LanguageModel API not available");
    return false;
  }
  try {
    session = await LanguageModel.create();
    console.log("✅ Session ready");
    return true;
  } catch (err) {
    console.error(err);
    alert("Failed to start AI session");
    return false;
  }
}

// ---------------------------
// Generate World Recipes (Append Mode)
// ---------------------------
async function generateWorldRecipes(container, loadingElement) {
  const promptText = `
Generate 3 unique recipes from different countries around the world.

Each recipe must be a JSON object with the following fields:
1. "country": The name of the country.
2. "name": The recipe title.
3. "description": A short 1–2 sentence description of the dish.
4. "ingredients": An array of ingredient strings.
5. "instructions": An array of 4–7 full-sentence cooking steps (each step should be detailed, not one word).
6. "time": Estimated cooking time (e.g., "30 minutes").
7. "image_description": A short phrase describing what the dish looks like.
ultra important(this is a very important point):if this is the second or third.... time i give you this prompt please do not say anything else but the json array of recipes.
Important:
- Return ONLY valid JSON.
- Use double quotes (") for all keys and strings.
- Return an array of recipe objects (e.g. [ { ... }, { ... } ]).
- Do NOT include any commentary, Markdown, or text outside of the JSON.
- Do NOT include any whitespace or indentation.
- if you use " " double quotes inside a string, escape them with a backslash (\") like this \"cooked\".
`;

  try {
    const response = await session.prompt(promptText);
    const cleanResponse = response.replace(/```json\s*|```/g, "").trim();

    let recipes;
    try {
      recipes = JSON.parse(cleanResponse);
    } catch (err) {
      console.error("Failed to parse JSON:", err, cleanResponse);
      loadingElement.remove();
      container.innerHTML += `<p class="text-danger">❌ Invalid AI response format</p>`;
      return;
    }

    renderRecipeCards(recipes, container);
    loadingElement.remove();
  } catch (err) {
    loadingElement.remove();
    container.innerHTML += `<p class="text-danger">❌ Error: ${err.message}</p>`;
  }
}

// ---------------------------
// Render multiple recipe cards (Appends instead of replacing)
// ---------------------------
function renderRecipeCards(recipes, container) {
  const row = document.createElement("div");
  row.className = "row g-4 mt-2";

  recipes.forEach((recipe, index) => {
    const shortIngredients = recipe.ingredients.slice(0, 3).join(", ") + (recipe.ingredients.length > 3 ? "..." : "");
    // Image details
    const prompt = `${recipe.name}`;
    const width = 1024;
    const height = 1024;
    const seed = 42;
    const model = 'flux'; 
    try{
      imageUrl = `https://pollinations.ai/p/${encodeURIComponent(prompt)}?width=${width}&height=${height}&seed=${seed}&model=${model}`;
      photos[recipe.name] = imageUrl;
    }catch(err){
      console.error("Image generation error:", err);
      photos[recipe.name] = "/images/background.jpg";
    }
   

    const card = document.createElement("div");
    card.className = "col-md-4";

    card.innerHTML = `
      <div class="card h-100 shadow-sm border-0 recipe-card" 
           style="cursor:pointer; transition:transform 0.2s ease;"
           data-index="${index}">
        <img src="${imageUrl}" class="card-img-top" alt="${recipe.name}">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <h5 class="card-title mb-0">${recipe.name}</h5>
            <span class="badge bg-light text-dark border">${recipe.country}</span>
          </div>
          <p class="text-muted small mb-1">⏱ ${recipe.time}</p>
          <p class="card-text"><strong>Ingredients:</strong> ${shortIngredients}</p>
        </div>
      </div>
    `;

    card.querySelector(".recipe-card").addEventListener("click", () => showRecipeModal(recipe));
    row.appendChild(card);
  });

  container.appendChild(row);

  // Make sure modal exists only once
  if (!document.getElementById("recipeModal")) {
    const modalHTML = `
      <div class="modal fade" id="recipeModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-lg modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="recipeTitle"></h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <img id="recipeImage" src="" alt="" class="img-fluid rounded mb-3">
              <p id="recipeCountry" class="text-muted"></p>
              <p id="recipeTime" class="text-muted"></p>
              <p id="recipeDescription" class="mb-3"></p>
              <h6 class="text-info">Ingredients:</h6>
              <ul id="recipeIngredients"></ul>
              <h6 class="text-warning mt-3">Instructions:</h6>
              <ol id="recipeInstructions"></ol>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML("beforeend", modalHTML);
  }
}

// ---------------------------
// Modal handler
// ---------------------------
function showRecipeModal(recipe) {
  let img = "";
  for (const key in photos) {
    if (key === recipe.name) {
      img = photos[key];
      break;
    }
  }
  document.getElementById("recipeTitle").textContent = recipe.name;
  document.getElementById("recipeImage").src = img;
  document.getElementById("recipeCountry").textContent = `🌍 Country: ${recipe.country}`;
  document.getElementById("recipeTime").textContent = `⏱ Time: ${recipe.time}`;
  document.getElementById("recipeDescription").textContent = recipe.description;
  
  document.getElementById("recipeIngredients").innerHTML =
    recipe.ingredients.map(i => `<li>${i}</li>`).join("");
  document.getElementById("recipeInstructions").innerHTML =
    recipe.instructions.map(s => `<li>${s}</li>`).join("");

  const modal = new bootstrap.Modal(document.getElementById("recipeModal"));
  modal.show();
}


// Improved Markdown renderer for proper lists
function renderMarkdown(text) {
    if (!text) return "";

    // Escape HTML to avoid XSS
    text = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

    // --- Code Blocks ```lang ... ```
    text = text.replace(/```(.*?)\n([\s\S]*?)```/g, (match, lang, code) => {
        return `<pre><code class="${lang}">${code}</code></pre>`;
    });

    // Inline code `code`
    text = text.replace(/`([^`\n]+)`/g, "<code>$1</code>");

    // Bold and italics ***text***
    text = text.replace(/\*\*\*([^\*]+)\*\*\*/g, "<strong><em>$1</em></strong>");
    // Bold **text**
    text = text.replace(/\*\*([^\*]+)\*\*/g, "<strong>$1</strong>");
    // Italic *text*
    text = text.replace(/\*([^\*]+)\*/g, "<em>$1</em>");

    // Underline __text__
    text = text.replace(/__([^_]+)__/g, "<u>$1</u>");

    // Strikethrough ~~text~~
    text = text.replace(/~~([^~]+)~~/g, "<s>$1</s>");

    // Headings # H1, ## H2, ### H3
    text = text.replace(/^### (.*)$/gm, "<h3>$1</h3>");
    text = text.replace(/^## (.*)$/gm, "<h2>$1</h2>");
    text = text.replace(/^# (.*)$/gm, "<h1>$1</h1>");

    // Blockquote > text
    text = text.replace(/^> (.*)$/gm, "<blockquote>$1</blockquote>");

    // Unordered lists (- or *)
    text = text.replace(/^(?:-|\*) (.*)$/gm, "<li>$1</li>");
    // Wrap <li> in <ul>
    text = text.replace(/(<li>[\s\S]*?<\/li>)/g, "<ul>$1</ul>");

    // Ordered lists 1. 2. 3.
    text = text.replace(/^\d+\. (.*)$/gm, "<li>$1</li>");
    // Wrap <li> in <ol>
    text = text.replace(/(<li>[\s\S]*?<\/li>)/g, "<ol>$1</ol>");

    // Links [text](url)
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');

    // Line breaks
    text = text.replace(/\n/g, "<br>");

    return text;
}
