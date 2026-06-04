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
        }
    }
}

function buttonClick(){
    money++;

    count.textContent = money;
}

//Main click handler
button.addEventListener('click', function () {
    buttonClick();
});