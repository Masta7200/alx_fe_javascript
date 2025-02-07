const API_URL = 'https://jsonplaceholder.typicode.com/posts'; // Example API for simulation
let quotes = [];

// Load quotes from local storage on initialization
function loadQuotes() {
    const storedQuotes = localStorage.getItem('quotes');
    if (storedQuotes) {
        quotes = JSON.parse(storedQuotes);
    }
}

// Save quotes to local storage
function saveQuotes() {
    localStorage.setItem('quotes', JSON.stringify(quotes));
}

// Fetch quotes from the server
async function fetchQuotesFromServer() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        // Simulate server response by mapping to our quote structure
        return data.map(item => ({
            text: item.body,
            category: 'General' // Default category for simulation
        }));
    } catch (error) {
        console.error('Error fetching quotes:', error);
        return [];
    }
}

// Handle data syncing
function handleDataSync(serverQuotes) {
    serverQuotes.forEach(serverQuote => {
        const exists = quotes.some(localQuote => localQuote.text === serverQuote.text);
        if (!exists) {
            quotes.push(serverQuote); // Add new quotes from the server
        }
    });

    saveQuotes(); // Save updated quotes to local storage
    populateCategories(); // Update categories after syncing
    filterQuotes(); // Refresh displayed quotes
}

// Handle conflicts
function handleConflicts(localQuotes, serverQuotes) {
    serverQuotes.forEach(serverQuote => {
        const localQuote = localQuotes.find(q => q.text === serverQuote.text);
        if (localQuote && localQuote.category !== serverQuote.category) {
            alert(`Conflict detected for quote: "${serverQuote.text}". Server version will be used.`);
            const index = localQuotes.indexOf(localQuote);
            if (index > -1) {
                localQuotes[index] = serverQuote; // Replace with server quote
            }
        }
    });
}

// Periodic sync function
async function syncWithServer() {
    const serverQuotes = await fetchQuotesFromServer();
    handleConflicts(quotes, serverQuotes); // Check for conflicts
    handleDataSync(serverQuotes); // Sync data
}

// Call syncWithServer periodically (e.g., every 30 seconds)
setInterval(syncWithServer, 30000);

// Populate categories dynamically
function populateCategories() {
    const categoryFilter = document.getElementById('categoryFilter');
    const categories = new Set(quotes.map(quote => quote.category));
    
    categoryFilter.innerHTML = '<option value="all">All Categories</option>'; // Clear existing options
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });

    // Restore last selected category from local storage
    const lastSelectedCategory = localStorage.getItem('lastSelectedCategory') || 'all';
    categoryFilter.value = lastSelectedCategory;
}

// Function to display quotes based on the selected filter
function filterQuotes() {
    const selectedCategory = document.getElementById('categoryFilter').value;
    const quoteDisplay = document.getElementById('quoteDisplay');
    quoteDisplay.innerHTML = ''; // Clear current quotes

    const filteredQuotes = selectedCategory === 'all' ? quotes : quotes.filter(quote => quote.category === selectedCategory);
    
    filteredQuotes.forEach(quote => {
        const quoteElement = document.createElement('div');
        quoteElement.innerHTML = `<p>${quote.text}</p><small>Category: ${quote.category}</small>`;
        quoteDisplay.appendChild(quoteElement);
    });

    // Save the last selected category to local storage
    localStorage.setItem('lastSelectedCategory', selectedCategory);
}

// Function to show a random quote
function showRandomQuote() {
    if (quotes.length === 0) {
        document.getElementById('quoteDisplay').innerHTML = "<p>No quotes available.</p>";
        return;
    }
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const quote = quotes[randomIndex];
    const quoteDisplay = document.getElementById('quoteDisplay');
    quoteDisplay.innerHTML = `<p>${quote.text}</p><small>Category: ${quote.category}</small>`;
    
    // Store the last viewed quote in session storage
    sessionStorage.setItem('lastViewedQuote', JSON.stringify(quote));
}

// Event listener for the button to show a new quote
document.getElementById('newQuote').addEventListener('click', showRandomQuote);

// Function to add a new quote
function addQuote() {
    const quoteText = document.getElementById('newQuoteText').value;
    const quoteCategory = document.getElementById('newQuoteCategory').value;

    if (quoteText && quoteCategory) {
        quotes.push({ text: quoteText, category: quoteCategory });
        saveQuotes(); // Save updated quotes to local storage
        populateCategories(); // Update categories
        filterQuotes(); // Refresh displayed quotes
        document.getElementById('newQuoteText').value = '';
        document.getElementById('newQuoteCategory').value = '';
        alert("Quote added successfully!");
    } else {
        alert("Please enter both a quote and a category.");
    }
}

// Function to export quotes to JSON
function exportToJson() {
    const jsonString = JSON.stringify(quotes, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quotes.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Function to import quotes from JSON file
function importFromJsonFile(event) {
    const fileReader = new FileReader();
    fileReader.onload = function(event) {
        const importedQuotes = JSON.parse(event.target.result);
        quotes.push(...importedQuotes);
        saveQuotes(); // Save updated quotes to local storage
        populateCategories(); // Update categories
        filterQuotes(); // Refresh displayed quotes
        alert('Quotes imported successfully!');
    };
    fileReader.readAsText(event.target.files[0]);
}

// Load quotes and populate categories on page load
loadQuotes();
populateCategories();
