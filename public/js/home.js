// Global variables
let session = null;
let foods_list = [];       // Stores foods for autocomplete
let chatContainer = null;  // Will hold AI chat messages
let autocompleteList = null; // Floating list container

selectedItems = []

document.addEventListener("DOMContentLoaded", () => {
    const input = document.getElementById("chat");
    chatContainer = document.getElementById("aiResults");

    let currentFocus = -1;

    // Create floating autocomplete container
    autocompleteList = document.createElement("div");
    autocompleteList.className = "autocomplete-items";
    autocompleteList.style.position = "absolute";
    autocompleteList.style.zIndex = "9999";
    document.body.appendChild(autocompleteList);

    // Load foods JSON
    fetch('/data/foods_grouped.json')
        .then(res => res.json())
        .then(data => {
            foods_list = Array.isArray(data) ? data : Object.values(data).flat();
            console.log("Foods loaded:", foods_list);
        })
        .catch(err => console.error("Failed to load JSON:", err));

    // --------------------------
    // AUTOCOMPLETE INPUT
    // --------------------------
    input.addEventListener("input", () => {
        // let n = 0;
        const fullQuery = input.value.toLowerCase().split(",");
        query =  fullQuery[fullQuery.length - 1].trim();
        autocompleteList.innerHTML = "";
        currentFocus = -1;
        if (!query) return;

        const filtered = foods_list.filter(item => item.toLowerCase().includes(query));
        filtered.forEach(itemText => {
            const item = document.createElement("div");
            item.textContent = itemText;
            item.addEventListener("click", () => {
                addToken(itemText)
            });
            autocompleteList.appendChild(item);
        });

        updateAutocompletePosition(input, autocompleteList);
    });

    input.addEventListener("keydown", (e) => {
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
            if (currentFocus > -1 && items[currentFocus]) {
                items[currentFocus].click();
            }
        }
    });

function addToken(text) {
    const input = document.getElementById("chat");
    const tokens = input.value.split(",").map(t => t.trim()).filter(t => t);
    tokens[tokens.length - 1] = text; // replace last token
    input.value = tokens.join(", ") + ", "; // add comma for next entry
    autocompleteList.innerHTML = "";      // clear suggestions
}


    function highlightItem(items) {
        removeActive(items);
        if (currentFocus >= items.length) currentFocus = 0;
        if (currentFocus < 0) currentFocus = items.length - 1;
        items[currentFocus].classList.add("autocomplete-active");
    }

    function removeActive(items) {
        for (let i = 0; i < items.length; i++) {
            items[i].classList.remove("autocomplete-active");
        }
    }

    document.addEventListener("click", (e) => {
        if (e.target !== input && !autocompleteList.contains(e.target)) {
            autocompleteList.innerHTML = "";
        }
    });

    window.addEventListener("scroll", () => updateAutocompletePosition(input, autocompleteList));
    window.addEventListener("resize", () => updateAutocompletePosition(input, autocompleteList));

    // --------------------------
    // AI CHAT FORM SUBMISSION
    // --------------------------
    const form = document.querySelector("form.mb-3");
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (!session) {
            const success = await runDiagnostics();
            if (!success) return;
        }
        await sendMessage(input, chatContainer);
    });
});

// --------------------------
// AUTOCOMPLETE POSITIONING
// --------------------------
function updateAutocompletePosition(inputEl, listEl) {
    const rect = inputEl.getBoundingClientRect();
    listEl.style.left = rect.left + window.scrollX + "px";
    listEl.style.top = rect.bottom + window.scrollY + "px";
    listEl.style.width = rect.width + "px";
}

// --------------------------
// AI SESSION
// --------------------------
async function runDiagnostics() {
    if (!window.LanguageModel) {
        alert("LanguageModel API not available");
        return false;
    }
    try {
        session = await LanguageModel.create();
        console.log("✅ Session created");
        return true;
    } catch (err) {
        console.error(err);
        return false;
    }
}

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



// --------------------------
// SEND AI MESSAGE
// --------------------------
async function sendMessage(chatBox, chatContainer) {
    if (!session) {
        alert("Run diagnostics first");
        return;
    }

    const text = chatBox.value.trim();
    if (!text) return;

    const userMsg = document.createElement("div");
    userMsg.className = "message user";
    userMsg.textContent = text;
    chatContainer.appendChild(userMsg);

    chatBox.value = "";

    try {
        let response = await session.prompt(text);
        const aiMsg = document.createElement("div");
        aiMsg.className = "message ai";
        aiMsg.innerHTML = renderMarkdown(response);
        chatContainer.appendChild(aiMsg);
        
        chatContainer.scrollTop = chatContainer.scrollHeight;

    } catch (err) {
        const aiMsg = document.createElement("div");
        aiMsg.className = "message ai";
        aiMsg.textContent = "❌ Error: " + err.message;
        chatContainer.appendChild(aiMsg);
    }
}
// async function sendMessage(chatBox, chatContainer) {
//     if (!session) {
//         alert("Run diagnostics first");
//         return;
//     }

//     const text = chatBox.value.trim();
//     if (!text) return;

//     // Show user's message
//     const userMsg = document.createElement("div");
//     userMsg.className = "message user";
//     userMsg.textContent = ">" + text;
//     chatContainer.appendChild(userMsg);

//     chatBox.value = "";

//     try {
//         const response = await session.prompt(text);
//         const aiMsg = document.createElement("div");
//         aiMsg.className = "message ai";

//         // Convert ```latex ... ``` blocks to \[...\] for KaTeX
//         let formatted = response.replace(/```latex([\s\S]*?)```/g, (match, p1) => {
//             return `\\[${p1.trim()}\\]`;
//         });

//         // Optional: convert inline `$...$` to `\(...\)`
//         formatted = formatted.replace(/\$(.+?)\$/g, (match, p1) => {
//             return `\\(${p1.trim()}\\)`;
//         });

//         aiMsg.innerHTML = formatted;
//         chatContainer.appendChild(aiMsg);

//         // Render LaTeX in the element
//         renderMathInElement(aiMsg, {
//             delimiters: [
//                 { left: "\\(", right: "\\)", display: false }, // inline
//                 { left: "\\[", right: "\\]", display: true }   // display
//             ],
//             throwOnError: false
//         });

//         chatContainer.scrollTop = chatContainer.scrollHeight;

//     } catch (err) {
//         const aiMsg = document.createElement("div");
//         aiMsg.className = "message ai";
//         aiMsg.textContent = "❌ Error: " + err.message;
//         chatContainer.appendChild(aiMsg);
//     }
// }
