// recipeRenderer.js
export function renderRecipeCards(recipes, container, photos) {
  const row = document.createElement("div");
  row.className = "row g-4 mt-2";


  recipes.forEach((recipe, index) => {
    const shortIngredients = recipe.ingredients.slice(0, 3).join(", ") + (recipe.ingredients.length > 3 ? "..." : "");
    const prompt = `${recipe.name}`;
    const width = 1024;
    const height = 1024;
    const seed = 42;
    const model = 'flux';
    let imageUrl = "";
    try {
      imageUrl = `https://pollinations.ai/p/${encodeURIComponent(prompt)}?width=${width}&height=${height}&seed=${seed}&model=${model}`;
      photos[recipe.name] = imageUrl;
    } catch (err) {
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

    card.querySelector(".recipe-card").addEventListener("click", () => showRecipeModal(recipe, photos));
    row.appendChild(card);
  });

  container.appendChild(row);

  if (!document.getElementById("recipeModal")) createRecipeModal();
}

export function showRecipeModal(recipe, photos) {
  let img = photos[recipe.name] || "";
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
function createRecipeModal() {
  const modalHTML = `
  <div class="modal fade" id="recipeModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-lg modal-dialog-centered">
      <div class="modal-content border-0 shadow-lg rounded-4">
        <div class="modal-header bg-success text-white rounded-top-4">
          <h4 class="modal-title fw-bold" id="recipeTitle"></h4>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>

        <div class="modal-body p-4">
          <div class="row g-4 align-items-center">
            <div class="col-md-5">
              <img id="recipeImage" src="" alt="Recipe Image" class="img-fluid rounded-3 shadow-sm w-100">
            </div>

            <div class="col-md-7">
              <p id="recipeCountry" class="text-muted mb-1 small"></p>
              <p id="recipeTime" class="text-muted mb-2 small"></p>
              <p id="recipeDescription" class="mb-3"></p>
            </div>
          </div>

          <hr class="my-4">

          <div class="row">
            <div class="col-md-6">
              <h6 class="text-success mb-2"><i class="bi bi-list-check me-1"></i> Ingredients</h6>
              <ul id="recipeIngredients" class="list-group list-group-flush small"></ul>
            </div>
            <div class="col-md-6 mt-4 mt-md-0">
              <h6 class="text-warning mb-2"><i class="bi bi-journal-text me-1"></i> Instructions</h6>
              <ol id="recipeInstructions" class="small ps-3"></ol>
            </div>
          </div>
        </div>

        <div class="modal-footer bg-light rounded-bottom-4 d-flex justify-content-between">
          <button type="button" class="btn btn-success" id="downloadRecipeBtn">
            <i class="bi bi-download me-1"></i> Download Recipe
          </button>
          <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">
            <i class="bi bi-x-circle me-1"></i> Close
          </button>
        </div>
      </div>
    </div>
  </div>`;
  document.body.insertAdjacentHTML("beforeend", modalHTML);

  // Attach event listener for download
  document.getElementById("downloadRecipeBtn").addEventListener("click", downloadRecipe);
}

function downloadRecipe() {
  const title = document.getElementById("recipeTitle").textContent;
  const country = document.getElementById("recipeCountry").textContent;
  const time = document.getElementById("recipeTime").textContent;
  const description = document.getElementById("recipeDescription").textContent;

  const ingredients = Array.from(document.querySelectorAll("#recipeIngredients li"))
    .map(li => `- ${li.textContent}`).join("\n");

  const instructions = Array.from(document.querySelectorAll("#recipeInstructions li"))
    .map((li, i) => `${i + 1}. ${li.textContent}`).join("\n");

  const content = `${title}\n\n${country}\n${time}\n\nDescription:\n${description}\n\nIngredients:\n${ingredients}\n\nInstructions:\n${instructions}`;

  const blob = new Blob([content], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${title.replace(/\s+/g, "_")}_Recipe.txt`;
  link.click();
}

