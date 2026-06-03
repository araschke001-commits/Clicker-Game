const button = document.getElementById('click-button');
const count = document.getElementById('click-count');

let money = 0;

function buttonClick(){
    money++;
    
    count.textContent = money;
}

//Main click handler
button.addEventListener('click', function () {
    buttonClick();
});
