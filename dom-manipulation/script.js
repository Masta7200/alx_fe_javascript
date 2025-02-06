const SERVER_URL = "https://jsonplaceholder.typicode.com/posts"; // Fake API endpoint

// Load quotes from local storage or initialize with default data
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
    { id: 1, text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Motivation" },
    { id: 2, text: "In the middle of every difficulty lies opportunity.", category: "Inspiration" },
    { id: 3, text: "Life is what happens when you're busy making other plans.", category: "Life" }
];

// Function to fetch data from server
async function fetchServerQuotes() {
    try {
        const response = await fetch(SERVER_URL);
        const serverQuotes = await response.json();
        
        if (!Array.isArray(serverQuotes)) throw new Error("Invalid response from server");

        mergeQuotes(serverQuotes);
    } catch (error) {
        console.error("Error fetching server quotes:", error);
    }
}

// Function to merge server quotes with local quotes
function mergeQuotes(serverQuotes) {
    let updated = false;
    
    serverQuotes.forEach(serverQuote => {
        const existsLocally = quotes.some(localQuote => localQuote.id === serverQuote.id);
        
        if (!existsLocally) {
            quotes.push(serverQuote);
            updated = true;
        }
    });

    if (updated) {
        saveQuotes();
        notifyUser("New quotes were added from the server!");
    }
}

// Function to sync local quotes with server
async function syncToServer() {
    try {
        const response = await fetch(SERVER_URL, {
            method: "POST",
            body: JSON.stringify(quotes),
            headers: { "Content-Type": "application/json" }
        });

        if (response.ok) {
            console.log("Data synced successfully!");
        } else {
            throw new Error("Failed to sync data");
        }
    } catch (error) {
        console.error("Error syncing to server:", error);
    }
}

// Function to notify the user of updates
function notifyUser(message) {
    const notification = document.createElement("div");
    notification.className = "notification";
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Function to save quotes to local storage
function saveQuotes() {
    localStorage.setItem("quotes", JSON.stringify(quotes));
    populateCategories();
}

// Function to add a new quote
function addQuote() {
    const newQuoteText = document.getElementById("newQuoteText").value.trim();
    const newQuoteCategory = document.getElementById("newQuoteCategory").value.trim();

    if (!newQuoteText || !newQuoteCategory) {
        alert("Please enter both a quote and a category.");
        return;
    }

    const newQuote = { id: Date.now(), text: newQuoteText, category: newQuoteCategory };
    quotes.push(newQuote);
    saveQuotes();
    syncToServer();

    document.getElementById("newQuoteText").value = "";
    document.getElementById("newQuoteCategory").value = "";
    alert("Quote added successfully!");
}

// Event listeners
document.getElementById("addQuote").addEventListener("click", addQuote);

// Periodically fetch server data
setInterval(fetchServerQuotes, 60000); // Fetch updates every 60 seconds

// Initial fetch
fetchServerQuotes();
