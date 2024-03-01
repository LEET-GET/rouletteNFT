const itemsContainer = document.getElementById('items');
const startButton = document.getElementById('startButton');
const itemNameDisplay = document.getElementById('itemNameDisplay'); // Assuming you have this element in your HTML
let isRunning = false;
let intervalId, timeoutId;
let balance = 1000; // Initial balance
const spinCost = 100;
const rewards = {
    'Common Gray': 50,
    'Rare Blue': 120,
    'Epic Green': 500,
    'Legendary Red': 4000
};

function updateBalanceDisplay() {
    document.getElementById('balanceDisplay').textContent = `Balance: ${balance}`;
}


// Simulate image URLs or colors with names for demonstration
const blockColors = [
    { color: 'gray', url: 'https://via.placeholder.com/100x100/cccccc', name: 'Common Gray' },
    { color: 'blue', url: 'https://via.placeholder.com/100x100/0000ff', name: 'Rare Blue' },
    { color: 'green', url: 'https://via.placeholder.com/100x100/00ff00', name: 'Epic Green' },
    { color: 'red', url: 'https://via.placeholder.com/100x100/ff0000', name: 'Legendary Red' }
];

function populateInitialItems(count = 50, specialItemCount = 5) {
    // Add special items first (red and green for visual impact)
    for (let i = 0; i < specialItemCount; i++) {
        // Alternate between red and green for variety
        if (i % 2 === 0) {
            itemsContainer.appendChild(createItem(blockColors[3].url, blockColors[3].name)); // Red
        } else {
            itemsContainer.appendChild(createItem(blockColors[2].url, blockColors[2].name)); // Green
        }
    }
    // Fill the rest of the slots with items based on standard rarity distribution
    for (let i = specialItemCount; i < count; i++) {
        itemsContainer.appendChild(createItem());
    }
}

// Modified createItem function to optionally accept url and name parameters
function createItem(url = null, name = null) {
    const item = document.createElement('div');
    item.classList.add('item');
    
    if (!url || !name) {
        // Determine the item based on rarity if not provided
        const rarityRoll = Math.random() * 100; // 0 to 99
        let selectedItem;
        if (rarityRoll < 50) {
            selectedItem = blockColors[0]; // 90% chance
        } else if (rarityRoll < 66) {
            selectedItem = blockColors[1]; // 6% chance
        } else if (rarityRoll < 79) {
            selectedItem = blockColors[2]; // 3% chance
        } else {
            selectedItem = blockColors[3]; // 1% chance
        }
        item.style.backgroundImage = `url(${selectedItem.url})`;
        item.dataset.name = selectedItem.name; // Store the name in the item
    } else {
        // Use provided url and name
        item.style.backgroundImage = `url(${url})`;
        item.dataset.name = name;
    }
    
    return item;
}

let lastFrameTime = Date.now();
let currentPosition = 0;

function startRoulette() {
    if (isRunning || balance < spinCost) return;
    balance -= spinCost; // Deduct spin cost
    updateBalanceDisplay();
    isRunning = true;
    populateInitialItems(50); // Prepopulate more items to avoid adding during movement

    function animate() {
        const now = Date.now();
        const delta = now - lastFrameTime;
        lastFrameTime = now;

        currentPosition -= delta * 0.2; // Adjust speed as necessary
        itemsContainer.style.transform = `translateX(${currentPosition}px)`;

        if (isRunning) {
            requestAnimationFrame(animate);
        }
    }

    requestAnimationFrame(animate);

    // Set a random stop time between 5 and 7 seconds
    const stopTime = Math.random() * (7000 - 5000) + 5000;
    setTimeout(() => {
        stopRoulette();
    }, stopTime);
}

function stopRoulette() {
    clearInterval(intervalId);
    clearTimeout(timeoutId);

    isRunning = false;

    // Remove the animation and immediately apply the current transform to freeze the items
    const computedStyle = window.getComputedStyle(itemsContainer);
    const matrix = new WebKitCSSMatrix(computedStyle.transform);
    itemsContainer.style.transform = `translateX(${matrix.m41}px)`;
    itemsContainer.style.animation = 'none';

    const selectedItemName = displayCenterItemName(); // Capture the correct item name
    if (selectedItemName && rewards[selectedItemName]) {
        balance += rewards[selectedItemName]; // Update balance based on the correct item
    }
    updateBalanceDisplay();
}
// Initial update to show default balance

// Assuming displayCenterItemName is adjusted to return the selected item's name
function displayCenterItemName() {
    const selectionLinePosition = document.getElementById('selectionLine').getBoundingClientRect().left + document.getElementById('selectionLine').offsetWidth / 2;
    const items = itemsContainer.children;

    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const itemRect = item.getBoundingClientRect();
        if (itemRect.left <= selectionLinePosition && itemRect.right >= selectionLinePosition) {
            itemNameDisplay.textContent = item.dataset.name; // Display the item's name
            return item.dataset.name; // Return the item's name for balance update
        }
    }
    return null; // Return null if no item is found (fallback)
}



// Ensure you have an element with id="itemNameDisplay" in your HTML to display the selected item's name

function populateInitialItems(count = 20) {
    for (let i = 0; i < count; i++) {
        itemsContainer.appendChild(createItem());
    }
}
updateBalanceDisplay();

startButton.addEventListener('click', startRoulette);
