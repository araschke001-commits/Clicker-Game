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
        name: "America Flag",
        description: "The U.S. flag, doubles your click value.",
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
        description: "Engage in a war, increases your money gain by 50% but decreases your approval rating by 10%.",
        cost: 200,
        startCost: 200,
        amount: 0
    },
    {
        name: "Re-election",
        description: "Resets your money to 0 but gives you a permanent 10% boost to all your clicks and earnings.",
        cost: 1000,
        startCost: 1000,
        amount: 0
    }
];

const shopContainer = document.getElementById('shop-items');

let money = 0;

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
            <button onclick="buyItem('${item.name}')">
                Buy $${item.cost}
            </button>
        `;

        shopContainer.appendChild(shopItem);
    });
}

function buyItem(itemName){
    const item = shopItems.find((i) => i.name === itemName);
    if(!item) return console.error('Item not found', itemName);

    if(money >= item.cost){
        money -= item.cost;
        count.textContent = money;

        // Track amount directly on the shop item
        item.amount = (item.amount || 0) + 1;
        const amount = item.amount;

        // Increase the cost of the item each time you buy it
        item.cost = item.startCost + item.startCost * amount ** 2;
        createShopItems(); // Redraw the shop with new prices

        console.log(`Bought ${item.name}!`);
    } else {
        console.log(`Not enough money! Need ${item.cost}`);
    }
}

setInterval(() => {
    // For every eagle we own, we need to click the button
    const eagle = shopItems.find((i) => i.name === "Bald Eagle");
    if(eagle && eagle.amount){
        for(let i = 0; i < eagle.amount; i++){
            buttonClick();
        }
    }
}, 1000);

function buttonClick(){
    console.log('Button clicked!');

    const multiplierItem = shopItems.find((i) => i.name === "Trump");
    const multiplierCount = multiplierItem ? multiplierItem.amount : 0;

    money = money + 1 * 2 ** multiplierCount;

    count.textContent = money;
}

// Initialize shop items on page load
createShopItems();

// Main click handler
button.addEventListener('click', function () {
    buttonClick();
});