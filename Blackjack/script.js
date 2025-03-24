/// PLAYER VARIABLES
let screen = document.getElementById("cards-drawn"); 
let message = document.getElementById("cards-message"); 

let sum = 0;
let counter = 0;

// cards
const originalCards = 
    [2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 10, 10, 11, 
     2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 10, 10, 11, 
     2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 10, 10, 11, 
     2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 10, 10, 11];
var allCards = [...originalCards]; // a copy of the original cards
var cardDrawn = [];

// game manager
var canDrawOneMore = false;
var hasStarted = false;

/// DEALER VARIABLES
let dealerCard = document.getElementById("cards-dealer");
let dealerMax = document.getElementById("cards-maxSum");

var maxSum = 0;
var dealerSum = 0;
var dealerCards = [...originalCards];
var dealerDrawn = [];
var stopDrawing = false;

/// FUNCTIONS

function drawInitial() 
{
  if(hasStarted){
    return;
  }
  
  sum = 0;
  
  for (var i = 0; i < 2; i++) {
    var randomIndex = getRandomIntInclusive(0, allCards.length - 1);
    sum += allCards[randomIndex];
    cardDrawn.push(allCards[randomIndex]);
    allCards.splice(randomIndex, 1); 
  }
  
  counter = 2;
  checkSum();
  updateScreen();
  dealerInitial();
  hasStarted = true;
}

function drawMore() 
{
  if (!canDrawOneMore) {
    return;
  }
  
  if (allCards.length > 0) {
    var randomIndex = getRandomIntInclusive(0, allCards.length - 1);
    sum += allCards[randomIndex];
    cardDrawn.push(allCards[randomIndex]);
    allCards.splice(randomIndex, 1); 
    counter++;
    checkSum();
    updateScreen();
    dealerDrawMore();
  }
}

function getRandomIntInclusive(min, max) 
{
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled); 
}

function checkSum() 
{
  if (sum < 21) {
    canDrawOneMore = true;
  } else if (sum === 21) {
    message.textContent = "Damn, you win";
    canDrawOneMore = false;
  } else {
    message.textContent = "You lose, try again";
    canDrawOneMore = false;
  }
}

function updateScreen()
{
  screen.textContent = "Cards Drawn: " + cardDrawn.join(', ');
}

function reset()
{
  sum = 0;
  counter = 0;
  cardDrawn = [];
  hasStarted = false;
  canDrawOneMore = false;
  allCards = [...originalCards]; 
  message.textContent = "";
  screen.textContent = "Cards Drawn: ";
  
  // Reset dealer variables
  dealerSum = 0;
  maxSum = 0;
  dealerDrawn = [];
  stopDrawing = false;
  dealerCards = [...originalCards];
  dealerCard.textContent = "Dealer Cards: ";
  dealerMax.textContent = "";
  
  console.log("Game reset.");
}

/// DEALER 

function dealerInitial()
{
  dealerSum = 0;
  
  maxSum = getRandomIntInclusive(5, 21);
  dealerMax.textContent = "Max Sum: " + maxSum;
  
  for (var i = 0; i < 2; i++) {
    var randomIndex = getRandomIntInclusive(0, dealerCards.length - 1);
    dealerSum += dealerCards[randomIndex];
    dealerDrawn.push(dealerCards[randomIndex]);
    dealerCards.splice(randomIndex, 1); 
  }
  
  checkDealerSum();
  updateDealerScreen();
  hasStarted = true;
}

function dealerDrawMore() 
{
  if (stopDrawing || dealerCards.length === 0) {
    return;
  }
  
  var randomIndex = getRandomIntInclusive(0, dealerCards.length - 1);
  dealerSum += dealerCards[randomIndex];
  dealerDrawn.push(dealerCards[randomIndex]);
  dealerCards.splice(randomIndex, 1); 
  checkDealerSum();
  updateDealerScreen();
}

function checkDealerSum()
{
  if (dealerSum > 21 && sum < 22) {
    message.textContent = "Dealer Lost";
    stopDrawing = true;
  } else if (dealerSum > maxSum) {
    stopDrawing = true;
  }
}

function updateDealerScreen()
{
  dealerCard.textContent = "Dealer Cards: " + dealerDrawn.join(', ');
}