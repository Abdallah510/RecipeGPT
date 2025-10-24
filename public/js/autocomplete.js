// autocomplete.js
let foods_list = [];
let autocompleteList = null;
let currentFocus = -1;

export async function setupAutocomplete() {
    const input = document.getElementById("chat");

    // Create floating autocomplete container
    autocompleteList = document.createElement("div");
    autocompleteList.className = "autocomplete-items";
    autocompleteList.style.position = "absolute";
    autocompleteList.style.zIndex = "9999";
    document.body.appendChild(autocompleteList);

    // Load foods JSON
    try {
        const res = await fetch('/data/foods_grouped.json');
        const data = await res.json();
        foods_list = Array.isArray(data) ? data : Object.values(data).flat();
        console.log("Foods loaded:", foods_list);
    } catch (err) {
        console.error("Failed to load JSON:", err);
    }

    input.addEventListener("input", onInput);
    input.addEventListener("keydown", onKeyDown);
    document.addEventListener("click", onClickOutside);
    window.addEventListener("scroll", () => updateAutocompletePosition(input, autocompleteList));
    window.addEventListener("resize", () => updateAutocompletePosition(input, autocompleteList));
}

function onInput(e) {
    const input = e.target;
    const fullQuery = input.value.toLowerCase().split(",");
    const query = fullQuery[fullQuery.length - 1].trim();
    autocompleteList.innerHTML = "";
    currentFocus = -1;
    if (!query) return;

    const filtered = foods_list.filter(item => item.toLowerCase().includes(query));
    filtered.forEach(itemText => {
        const item = document.createElement("div");
        item.textContent = itemText;
        item.addEventListener("click", () => addToken(input, itemText));
        autocompleteList.appendChild(item);
    });

    updateAutocompletePosition(input, autocompleteList);
}

function onKeyDown(e) {
    const items = autocompleteList.getElementsByTagName("div");
    if (!items) return;

    if (e.key === "ArrowDown") {
        currentFocus++;
        highlightItem(items);
    } else if (e.key === "ArrowUp") {
        currentFocus--;
        highlightItem(items);
    } else if (e.key === "Enter") {
        e.preventDefault();
        if (currentFocus > -1 && items[currentFocus]) items[currentFocus].click();
    }
}

function addToken(input, text) {
    const tokens = input.value.split(",").map(t => t.trim()).filter(t => t);
    tokens[tokens.length - 1] = text;
    input.value = tokens.join(", ") + ", ";
    autocompleteList.innerHTML = "";
}

function highlightItem(items) {
    removeActive(items);
    if (currentFocus >= items.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = items.length - 1;
    items[currentFocus].classList.add("autocomplete-active");
}

function removeActive(items) {
    for (let i = 0; i < items.length; i++) items[i].classList.remove("autocomplete-active");
}

function onClickOutside(e) {
    const input = document.getElementById("chat");
    if (e.target !== input && !autocompleteList.contains(e.target)) autocompleteList.innerHTML = "";
}

function updateAutocompletePosition(inputEl, listEl) {
    const rect = inputEl.getBoundingClientRect();
    listEl.style.left = rect.left + window.scrollX + "px";
    listEl.style.top = rect.bottom + window.scrollY + "px";
    listEl.style.width = rect.width + "px";
}
