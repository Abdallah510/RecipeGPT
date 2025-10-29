let session = null;

// ---------------------------
// DOM Ready
// ---------------------------
document.addEventListener("DOMContentLoaded", () => {
  // Intersection reveal
  const reveals = document.querySelectorAll(".reveal");
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("is-visible");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.2 }
  );
  reveals.forEach((el) => io.observe(el));

  const btn = document.getElementById("generateBtn");
  const container = document.getElementById("mealResults");

  document.getElementById("mealForm").addEventListener("submit", async (ev) => {
    ev.preventDefault();
    btn.disabled = true;

    const initialMsg = document.querySelector(".initial-message");
    if (initialMsg) initialMsg.remove();

    // Loading UI
    const loading = document.createElement("div");
    loading.className = "muted";
    loading.innerHTML =
      '<div aria-live="polite" class="text-white">Generating the meal plan… <span class="dots">🍽️🍳</span></div>';
    container.appendChild(loading);

    try {
      if (!session) {
        const ok = await runDiagnostics();
        if (!ok) return;
      }
      await generateMealPlan(container, loading);
    } catch (err) {
      console.error("Error during recipe generation:", err);
      loading.remove();
      container.innerHTML += `<p class="text-danger">❌ Error: Failed to generate plan</p>`;
    } finally {
      btn.disabled = false;
    }
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
/* Generate Meal Plan*/
async function generateMealPlan(container, loadingElement) {
  const dayCount = document.getElementById("days").value;
  const diet = document.getElementById("diet").value;
  const calories = document.getElementById("calories").value || "2000";
  const purpose = document.getElementById("Purpose").value;
  const notes = document.getElementById("notes").value || "No special notes";

  const promptText = `
You are creating a personalized meal planner based on the following user specifications:
- Number of days: ${dayCount}
- Diet type: ${diet}
- Daily calories: ${calories}
- Purpose: ${purpose}
- Notes: ${notes}

Return JSON ONLY (no markdown). Produce an array of length ${dayCount}. Each item is an object with:
{
  "breakfast": { "name": string, "description": string, "tags": [string] (optional), "tip": string (optional) },
  "lunch":     { "name": string, "description": string, "tags": [string] (optional), "tip": string (optional) },
  "dinner":    { "name": string, "description": string, "tags": [string] (optional), "tip": string (optional) }
}
import note : dont use generic names with the dishe give specific names for the dishe like "Grilled Chicken Salad" or "Vegan Buddha Bowl".
important note : make sure the meal plan is aligned with the diet type and purpose provided by the user espesicall calories.
Rules:
- Valid JSON only. Use double quotes for all keys and string values.
- No commentary or extra text. No code fences.
- Do NOT include double quotes inside the string values.
- Keep descriptions short (1–2 sentences).
`.trim();

  try {
    const response = await session.prompt(promptText);
    const clean = response.replace(/```json\s*|```/g, "").trim();

    let days;
    try {
      days = JSON.parse(clean);
      if (!Array.isArray(days)) throw new Error("Response is not an array.");
    } catch (err) {
      console.error("Failed to parse JSON:", err, clean);
      loadingElement.remove();
      container.innerHTML += `<p class="text-danger">❌ Invalid AI response format</p>`;
      return;
    }

    renderPlan(days, container);
    loadingElement.remove();
  } catch (err) {
    loadingElement.remove();
    container.innerHTML += `<p class="text-danger">❌ Error: ${err.message}</p>`;
  }
}

// ---------------------------
// Render
// ---------------------------
function renderPlan(days, container) {
  container.innerHTML = ""; // clear

  // Title
  const header = document.createElement("h3");
  header.className = "results-title";
  header.textContent = `${days.length}-Day Meal Plan`;
  container.classList.add("results");
  container.appendChild(header);

  // Cards
  days.forEach((day, i) => {
    container.appendChild(createDayCard(i + 1, day));
  });

  // Gentle stagger fade-in
  const cards = container.querySelectorAll(".day-card");
  cards.forEach((card, idx) => {
    card.style.opacity = 0;
    card.style.transform = "translateY(8px)";
    setTimeout(() => {
      card.style.transition = "opacity .5s ease, transform .5s ease";
      card.style.opacity = 1;
      card.style.transform = "translateY(0)";
    }, 70 * idx);
  });

 // ---------------------------
// Add Download Button (TXT)
// ---------------------------
const downloadBtn = document.createElement("button");
downloadBtn.className = "btn btn-outline-light mt-4 text-dark bg-white download-btn";
downloadBtn.textContent = "⬇️ Download Meal Plan (Text)";

downloadBtn.addEventListener("click", () => {
  let textContent = `🍽️ ${days.length}-Day Meal Plan\n\n`;
  days.forEach((day, i) => {
    textContent += `==============================\n`;
    textContent += `Day ${i + 1}\n`;
    textContent += `==============================\n`;

    ["breakfast", "lunch", "dinner"].forEach((mealType) => {
      const meal = days[i][mealType];
      if (meal) {
        textContent += `\n${mealType.toUpperCase()} 🍴\n`;
        textContent += `Name: ${meal.name || "No name"}\n`;
        textContent += `Description: ${meal.description || "No description"}\n`;
        if (Array.isArray(meal.tags) && meal.tags.length > 0) {
          textContent += `Tags: ${meal.tags.join(", ")}\n`;
        }
        if (meal.tip) {
          textContent += `Tip: ${meal.tip}\n`;
        }
      }
    });

    textContent += `\n\n`;
  });

  // Create and trigger the download
  const blob = new Blob([textContent], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `MealPlan_${days.length}Days.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
});

container.appendChild(downloadBtn);
}

// Create a day card
function createDayCard(dayIndex, dayData) {
  const card = document.createElement("article");
  card.className = "day-card";

  // Header
  const header = document.createElement("div");
  header.className = "day-card__header";
  header.textContent = `Day ${dayIndex}`;
  card.appendChild(header);

  // Body
  const body = document.createElement("div");
  body.className = "day-card__body";

  body.appendChild(createMeal("Breakfast", dayData.breakfast, "🍳"));
  body.appendChild(createMeal("Lunch", dayData.lunch, "🥗"));
  body.appendChild(createMeal("Dinner", dayData.dinner, "🍽️"));

  card.appendChild(body);
  return card;
}

// Create a single meal block
function createMeal(title, data, emoji) {
  const safe = (v, dflt = "") => (v == null ? dflt : v);

  const wrap = document.createElement("div");
  wrap.className = "meal";

  const t = document.createElement("h5");
  t.className = "meal-title";
  t.innerHTML = `<span class="emoji" aria-hidden="true">${emoji}</span><span>${title}</span>`;
  wrap.appendChild(t);

  const name = document.createElement("div");
  name.className = "meal-name";
  name.textContent = safe(data?.name, "Tasty Dish");
  wrap.appendChild(name);

  const desc = document.createElement("p");
  desc.className = "meal-desc";
  desc.textContent = safe(
    data?.description,
    "A balanced and flavorful option to keep you energized."
  );
  wrap.appendChild(desc);

  // Optional tags
  const tags = Array.isArray(data?.tags) ? data.tags.slice(0, 4) : [];
  if (tags.length) {
    const tagRow = document.createElement("div");
    tagRow.className = "meal-tags";
    tags.forEach((tg) => {
      const span = document.createElement("span");
      span.className = "tag";
      span.textContent = tg;
      tagRow.appendChild(span);
    });
    wrap.appendChild(tagRow);
  }

  // Optional tip
  if (data?.tip) {
    const tip = document.createElement("div");
    tip.className = "meal-tip";
    tip.innerHTML = `<i class="bi bi-lightbulb-fill">💡</i><span>${data.tip}</span>`;
    wrap.appendChild(tip);
  }

  return wrap;
}
