const button = document.getElementById('click-button');
const count = document.getElementById('click-count');

const shopItems = [
    {
        name: "Bald Eagle",
        description: "Birds that give you money every second.",
        cost: 10,
        startCost: 10
    },
    {
        name: "Trump",
        description: "The president, doubles your click value.",
        cost: 20,
        startCost: 20
    }
];

const shopContainer = document.getElementById('shop-items');
let itemsOwned = [];

let money = 0;

function createShopItems(){
    //Clear old shop items
    document.querySelectorAll('.shop-item').forEach((element) => {
        element.remove();
    });

    //Create new shop items
    shopItems.forEach((item) => {
        const shopItem = document.createElement('div');
        shopItem.className = 'shop-item';

        shopItem.innerHTML = `
            <div>
                <h3>${item.name}</h3>
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
    
    if(money >= item.cost){
        money -= item.cost;
        count.textContent = money;

        let amount = 1;

        // check if we alreday own item, if we do ++ it, else add it
        const itemInArray = itemsOwned.find((obj) => obj.name === item.name);
        if(itemInArray){
            itemInArray.amount++;
            console.log(`Found ${item.name}, added 1!`);
            amount = itemInArray.amount;
        } else {
            itemsOwned.push({name: item.name, amount: 1});
            console.log(`Added ${item.name} to itemsOwned!`);
        }

        // Increase the cost of the item each time you buy it
        item.cost = item.startCost + item.startCost * amount ** 2;
        createShopItems(); // Redraw the shop with new prices

        console.log(`Bought ${item.name}!`);
    } else {
        console.log(`Not enough clicks! Need ${item.cost}`);
    }
}

setInterval(() => {
    // For every eagle we own, we need to click the button
    const eagleOwned = itemsOwned.find((i) => i.name === "Bald Eagle");
    if(eagleOwned){
        for(let i = 0; i < eagleOwned.amount; i++){
            buttonClick();
        }
    }
}, 1000);

function buttonClick(){
    console.log('Button clicked!');

    const multiplierOwned = itemsOwned.find((i) => i.name === "Trump");
    const multiplierCount = multiplierOwned ? multiplierOwned.amount : 0;

    money = money + 1 * 2 ** multiplierCount;

    count.textContent = money;
}

// Initialize shop items on page load
createShopItems();

//Main click handler
button.addEventListener('click', function () {
    buttonClick();
});