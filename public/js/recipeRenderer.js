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
      </div>`;
    document.body.insertAdjacentHTML("beforeend", modalHTML);
}
