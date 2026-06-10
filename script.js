const button = document.getElementById('click-button');
const count = document.getElementById('click-count');

const shopItems = [
    {
        name: "Bald Eagle",
        description: "Birds that give you money every second.",
        cost: 10,
        startCost: 10,
        amount: 0
    },
    {
        name: "American Flag",
        description: "The U.S. flag, increases your click value.",
        cost: 20,
        startCost: 20,
        amount: 0
    },
    {
        name: "Crowd Support",
        description: "Gains support of the people, increases your approval rating by 5%.",
        cost: 50,
        startCost: 50,
        amount: 0
    },
    {
        name: "War",
        description: "Engage in a war, has a 50% chance of doubling your money upon win but decreases your approval rating and money by 50% upon loss.",
        cost: 200,
        startCost: 200,
        amount: 0
    },
    {
        name: "Re-election",
        description: "Resets your money and upgrades but gives you a permanent 10% boost to all your clicks and earnings.",
        cost: 1000,
        startCost: 1000,
        amount: 0
    }
];

const shopContainer = document.getElementById('shop-items');

let money = 0;
// Initialize displayed money
count.textContent = money;

let boost = 1; // Global boost multiplier from re-elections

let warActive = false;
let warRemainingSeconds = 0;
let warLosses = 0;
let warIntervalId = null;

// Refreshes the shop display with current items and their costs
function createShopItems(){
    // Clear old shop items
    document.querySelectorAll('.shop-item').forEach((element) => {
        element.remove();
    });

    // Create new shop items
    shopItems.forEach((item) => {
        const shopItem = document.createElement('div');
        shopItem.className = 'shop-item';

        shopItem.innerHTML = `
            <div>
                <h3>${item.name} ${item.amount ? `(${item.amount})` : ''}</h3>
                <p>${item.description}</p>
            </div>
            <button onclick="buyItem('${item.name}')" ${item.name === 'War' && warActive ? 'disabled' : ''}>
                ${item.name === 'War' && warActive ? 'War in progress' : `Buy $${item.cost}`}
            </button>
        `;

        shopContainer.appendChild(shopItem);
    });
}

// Handles buying items from the shop
function buyItem(itemName){
    const item = shopItems.find((i) => i.name === itemName);
    if(!item) return console.error('Item not found', itemName);

    if (item.name === "War" && warActive) {
        console.log('War already in progress! Wait until it ends before engaging again.');
        return;
    }

    if(money >= item.cost){
        money -= item.cost;
        count.textContent = money;

        // Track amount directly on the shop item
        item.amount = (item.amount || 0) + 1;
        const amount = item.amount;

        // Handle special cases
        switch(item.name){
            case "War":
                startWarCountdown(60);
                break;
            case "Re-election":
                // Reset money but give a permanent boost
                money = 0;
                shopItems.forEach((i) => {
                    if(i.name !== "Re-election"){
                        i.amount = 0;
                        i.cost = i.startCost;
                        boost = 1.1 * boost;
                    }
                });
                break;
        }

        // Increase the cost of the item each time you buy it
        item.cost = item.startCost + item.startCost * amount ** 2;
        createShopItems(); // Redraw the shop with new prices
        updateApprovalBar(); // Update approval bar in case we bought something that affects it

        console.log(`Bought ${item.name}!`);
    } else {
        console.log(`Not enough money! Need ${item.cost}`);
    }
}

function startWarCountdown(seconds){
    if(warActive) return;

    warActive = true;
    warRemainingSeconds = seconds;
    console.log(`War engaged! War purchase button disabled for ${seconds} seconds.`);

    warIntervalId = setInterval(() => {
        warRemainingSeconds -= 1;

        if(warRemainingSeconds <= 0){
            clearInterval(warIntervalId);
            warActive = false;
            resolveWarOutcome();
        }
    }, 1000);
}

function resolveWarOutcome(){
    if(Math.random() < 0.5){
        money *= 2;
        count.textContent = money;
        console.log('War ended: you won and your money doubled!');
    } else {
        warLosses += 1;
        console.log('War ended: you lost and approval dropped!');
        updateApprovalBar();
    }

    createShopItems();
}

// Adds money every second based on the number of eagles the user has
setInterval(() => {
    // For every eagle we own, we need to click the button
    const eagle = shopItems.find((i) => i.name === "Bald Eagle");
    if(eagle && eagle.amount){
        money += eagle.amount * boost; // Each eagle gives 1 money per second, multiplied by the boost from re-elections
        count.textContent = money;
    }
}, 1000);

// Update the approval bar based on current shop items
function updateApprovalBar(){
    const bar = document.getElementById('approval-bar');
    const crowdSupport = shopItems.find((i) => i.name === "Crowd Support");
    const war = shopItems.find((i) => i.name === "War");

    let approval = 0;
    if(crowdSupport) approval += (crowdSupport.amount || 0) * 5;
    approval -= warLosses * 50;

    // Clamp approval between 0 and 100
    approval = Math.max(0, Math.min(100, approval));

    bar.style.width = `${approval}%`;

    // Change color based on approval
    // Simple color interpolation between red and green
    const startColor = { r: 255, g: 0, b: 0 }; // Red
    const endColor = { r: 0, g: 255, b: 0 };

    const t = approval / 100;
    const r = Math.round(lerp(startColor.r, endColor.r, t));
    const g = Math.round(lerp(startColor.g, endColor.g, t));
    const b = Math.round(lerp(startColor.b, endColor.b, t));

    bar.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
}

// Helper: linear interpolation
function lerp(a, b, t){
    return a + (b - a) * t;
}

// Handles button clicks, factoring in multipliers from shop items
function buttonClick(){
    console.log('Button clicked!');

    const multiplierItem = shopItems.find((i) => i.name === "American Flag");
    const multiplierCount = multiplierItem ? multiplierItem.amount : 0;
    
    let clickValue = 1; // Base click value, can be modified by shop items
    const switchTime = 10; // The amount of time before the function switches from quadratic to sqrt growth in click value.
    const multiplier = 2; // The amount to increase the sqrt growth by after we switch

    (multiplierCount > switchTime) ? clickValue = multiplier * Math.sqrt(multiplierCount - switchTime) + Math.pow(switchTime, 2) : clickValue = Math.pow(multiplierCount, 2); //Click value increases quadratically until we have 10 flags, then it increases with the square root of the amount of flags we have after that. This is to prevent the click value from becoming too high and unbalanced.

    clickValue = Math.max(1, Math.round(clickValue) * boost); //Round click value to nearest integer for cleaner display

    money += clickValue;
    count.textContent = money;
}

// Initialize shop items & approval bar on page load
createShopItems();
updateApprovalBar();

// Main click handler
button.addEventListener('click', function () {
    buttonClick();
});