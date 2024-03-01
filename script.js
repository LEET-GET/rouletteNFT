const itemsContainer = document.getElementById('items');
const startButton = document.getElementById('startButton');
const itemNameDisplay = document.getElementById('itemNameDisplay');
let isRunning = false;
let intervalId, timeoutId;
let balance = 1000; 
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


const blockColors = [
    { color: 'gray', url: 'https://via.placeholder.com/100x100/cccccc', name: 'Common Gray' },
    { color: 'blue', url: 'https://via.placeholder.com/100x100/0000ff', name: 'Rare Blue' },
    { color: 'green', url: 'https://via.placeholder.com/100x100/00ff00', name: 'Epic Green' },
    { color: 'red', url: 'https://via.placeholder.com/100x100/ff0000', name: 'Legendary Red' }
];

function populateInitialItems(count = 50, specialItemCount = 5) {
    for (let i = 0; i < specialItemCount; i++) {
        if (i % 2 === 0) {
            itemsContainer.appendChild(createItem(blockColors[3].url, blockColors[3].name)); // Red
        } else {
            itemsContainer.appendChild(createItem(blockColors[2].url, blockColors[2].name)); // Green
        }
    }
    for (let i = specialItemCount; i < count; i++) {
        itemsContainer.appendChild(createItem());
    }
}

function createItem(url = null, name = null) {
    const item = document.createElement('div');
    item.classList.add('item');
    
    if (!url || !name) {
        const rarityRoll = Math.random() * 100; // 0 to 99
        let selectedItem;
        if (rarityRoll < 50) {
            selectedItem = blockColors[0]; 
        } else if (rarityRoll < 66) {
            selectedItem = blockColors[1]; 
        } else if (rarityRoll < 79) {
            selectedItem = blockColors[2];
        } else {
            selectedItem = blockColors[3]; 
        }
        item.style.backgroundImage = `url(${selectedItem.url})`;
        item.dataset.name = selectedItem.name; 
    } else {
        item.style.backgroundImage = `url(${url})`;
        item.dataset.name = name;
    }
    
    return item;
}

let lastFrameTime = Date.now();
let currentPosition = 0;

function startRoulette() {
    if (isRunning || balance < spinCost) return;
    balance -= spinCost; 
    updateBalanceDisplay();
    isRunning = true;
    populateInitialItems(50); 

    function animate() {
        const now = Date.now();
        const delta = now - lastFrameTime;
        lastFrameTime = now;

        currentPosition -= delta * 0.2; 
        itemsContainer.style.transform = `translateX(${currentPosition}px)`;

        if (isRunning) {
            requestAnimationFrame(animate);
        }
    }

    requestAnimationFrame(animate);


    const stopTime = Math.random() * (7000 - 5000) + 5000;
    setTimeout(() => {
        stopRoulette();
    }, stopTime);
}

function stopRoulette() {
    clearInterval(intervalId);
    clearTimeout(timeoutId);

    isRunning = false;

    const computedStyle = window.getComputedStyle(itemsContainer);
    const matrix = new WebKitCSSMatrix(computedStyle.transform);
    itemsContainer.style.transform = `translateX(${matrix.m41}px)`;
    itemsContainer.style.animation = 'none';

    const selectedItemName = displayCenterItemName(); 
    if (selectedItemName && rewards[selectedItemName]) {
        balance += rewards[selectedItemName]; 
    }
    updateBalanceDisplay();
}

function displayCenterItemName() {
    const selectionLinePosition = document.getElementById('selectionLine').getBoundingClientRect().left + document.getElementById('selectionLine').offsetWidth / 2;
    const items = itemsContainer.children;

    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const itemRect = item.getBoundingClientRect();
        if (itemRect.left <= selectionLinePosition && itemRect.right >= selectionLinePosition) {
            itemNameDisplay.textContent = item.dataset.name;
            return item.dataset.name; 
        }
    }
    return null; 
}




function populateInitialItems(count = 20) {
    for (let i = 0; i < count; i++) {
        itemsContainer.appendChild(createItem());
    }
}
updateBalanceDisplay();

startButton.addEventListener('click', startRoulette);
