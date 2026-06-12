const button = document.getElementById('click-button');
const count = document.getElementById('money-count');

const shopItems = [
    {
        name: "Bald Eagle",
        description: "Birds that give you money every second.",
        cost: 10,
        startCost: 10,
        amount: 0,
        exponent: 1.5
    },
    {
        name: "American Flag",
        description: "The U.S. flag, increases your click value.",
        cost: 20,
        startCost: 20,
        amount: 0,
        exponent: 2
    },
    {
        name: "Crowd Support",
        description: "Gains support of the people, increases your approval rating by 5%.",
        cost: 50,
        startCost: 50,
        amount: 0,
        exponent: 1
    },
    {
        name: "War",
        description: "Engage in a war, has a 50% chance of doubling your money and increasing your approval rating upon win but halves your approval rating and money upon loss.",
        cost: 200,
        startCost: 200,
        amount: 0,
        exponent: 2
    },
    {
        name: "Re-election",
        description: "Resets your money and upgrades but gives you a permanent 10% boost to all your clicks and earnings.",
        cost: 1000,
        startCost: 1000,
        amount: 0,
        exponent: 2
    }
];

const shopContainer = document.getElementById('shop-items');
const startApproval = 50;

let money = 0;
let approval = startApproval;

// Initialize displayed money
updateMoney();

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
            <button onclick="buyItem('${item.name}')" ${(item.name === 'War' && warActive) || money < item.cost ? 'disabled' : ''}>
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
        updateMoney(-item.cost); // Deduct cost from money

        // Track amount directly on the shop item
        item.amount = (item.amount || 0) + 1;
        const amount = item.amount;

        // Handle special cases
        switch(item.name){
            case "Crowd Support":
                approval += 5; // Each purchase increases approval by 5%
                break;
            case "War":
                startWarCountdown(60);
                break;
            case "Re-election":
                // Reset money and approval but give a permanent boost
                approval = startApproval;
                updateMoney(-money); // Reset money display
                boost += 0.1;

                shopItems.forEach((i) => {
                    if(i.name !== "Re-election"){
                        i.amount = 0;
                        i.cost = i.startCost;
                    }
                });
                break;
        }

        // Increase the cost of the item each time you buy it
        item.cost = Math.round(item.startCost + item.startCost * amount ** item.exponent);
        createShopItems(); // Redraw the shop with new prices
        updateStats(); // Update stats panel in case we bought something that affects it

        console.log(`Bought ${item.name}!`);
    } else {
        console.log(`Not enough money! Need ${item.cost}`);
    }
}

function startWarCountdown(seconds){
    if(warActive) return;

    const warButton = shopContainer.querySelector(`.shop-item button[onclick="buyItem('War')"]`);

    warActive = true;
    warRemainingSeconds = seconds;

    warButton.disabled = true;

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
        updateMoney(money); // Double money
        updateApprovalBar(20); // Increase approval by 20%
        console.log('War ended: you won and your money doubled!');
    } else {
        warLosses += 1;
        updateMoney(-money / 2);
        updateApprovalBar(-20);
        console.log('War ended: you lost and approval dropped!');
    }

    createShopItems();
}

// Adds money every second based on the number of eagles the user has & decrease approval slightly for being idle
setInterval(() => {
    // For every eagle we own, we need to click the button
    const eagle = shopItems.find((i) => i.name === "Bald Eagle");
    if(eagle && eagle.amount){
        updateMoney(eagle.amount * boost);

        // Refresh shop after passive income changes
        createShopItems();
    }

    // Decrease approval slightly, more if in a war
    updateApprovalBar((warActive == true) ? -0.5 : -0.25);
}, 1000);

// Updates all of the stats panel
function updateStats(){
    updateMoney();
    updateApprovalBar();

    // Update eagle display
    const eagleDisplay = document.getElementById('eagle-count');
    const eagle = shopItems.find((i) => i.name === "Bald Eagle");
    if(eagle && eagle.amount){
        eagleDisplay.textContent = eagle.amount;
    }

    // Update click multiplier display
    const multiplierDisplay = document.getElementById('click-multiplier');
    const clickMultiplier = shopItems.find((i) => i.name === "American Flag");
    if(clickMultiplier && clickMultiplier.amount){
        multiplierDisplay.textContent = clickMultiplier.amount;
    }

    // Update boost display
    const boostDisplay = document.getElementById('boost-multiply');
    if(boost){
        boostDisplay.textContent = boost;
    }
}

// Update the approval bar based on current shop items
function updateApprovalBar(change = 0){
    const bar = document.getElementById('approval-bar');
    const percent = document.getElementById('approval-percentage');

    approval += change;

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

    percent.textContent = `${Math.round(approval)}%`;
}

// Helper: linear interpolation
function lerp(a, b, t){
    return a + (b - a) * t;
}

// Handles button clicks, factoring in multipliers from shop items
function buttonClick(){
    console.log('Button clicked!');

    const multiplierItem = shopItems.find((i) => i.name === "American Flag");
    const multiplierCount = (multiplierItem ? multiplierItem.amount : 0) + 1; // +1 for smoother growth (from 1 to 2 rather than 1, 1, 4)
    
    let clickValue = 1; // Base click value, can be modified by shop items
    const switchTime = 20; // The amount of time before the function switches from quadratic to linear growth in click value.
    const linearMultiplier = 2; // The amount to scale the linear growth by after we switch
    const quadraticMultiplier = 0.75; // The amount to scale the quadratic growth by before we switch

    (multiplierCount > switchTime) ? clickValue = linearMultiplier * (multiplierCount - switchTime) + switchTime ** 2 : clickValue = quadraticMultiplier * multiplierCount ** 2; // Quadratic growth for a while, and then linear growth for balancing

    clickValue = Math.max(1, Math.round(clickValue) * boost); //Round click value to nearest integer for cleaner display

    updateMoney(clickValue);

    // Refresh shop so buttons reflect the new money total after clicking
    createShopItems();
}

function updateMoney(change = 0){
    money += change;
    count.textContent = Math.round(money * 100) / 100; // Round to 2 decimal places for cleaner display
}

// Initialize shop items & approval bar on page load
createShopItems();
updateApprovalBar();

// Main click handler
button.addEventListener('click', function () {
    buttonClick();
});
