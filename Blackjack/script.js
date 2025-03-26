const screen = document.getElementById("cards-drawn"); 
const message = document.getElementById("cards-message"); 
const playerCardsDiv = document.getElementById("player-cards");
const dealerCardsDiv = document.getElementById("dealer-cards");

let playerSum = 0;
const originalCards = [
  { value: 2, suit: 'spades' }, { value: 3, suit: 'spades' }, { value: 4, suit: 'spades' }, { value: 5, suit: 'spades' }, { value: 6, suit: 'spades' }, { value: 7, suit: 'spades' }, { value: 8, suit: 'spades' }, { value: 9, suit: 'spades' }, { value: 10, suit: 'spades' }, { value: 12, suit: 'spades' }, { value: 13, suit: 'spades' }, { value: 14, suit: 'spades' }, { value: 11, suit: 'spades' },
  { value: 2, suit: 'hearts' }, { value: 3, suit: 'hearts' }, { value: 4, suit: 'hearts' }, { value: 5, suit: 'hearts' }, { value: 6, suit: 'hearts' }, { value: 7, suit: 'hearts' }, { value: 8, suit: 'hearts' }, { value: 9, suit: 'hearts' }, { value: 10, suit: 'hearts' }, { value: 12, suit: 'hearts' }, { value: 13, suit: 'hearts' }, { value: 14, suit: 'hearts' }, { value: 11, suit: 'hearts' },
  { value: 2, suit: 'diams' }, { value: 3, suit: 'diams' }, { value: 4, suit: 'diams' }, { value: 5, suit: 'diams' }, { value: 6, suit: 'diams' }, { value: 7, suit: 'diams' }, { value: 8, suit: 'diams' }, { value: 9, suit: 'diams' }, { value: 10, suit: 'diams' }, { value: 12, suit: 'diams' }, { value: 13, suit: 'diams' }, { value: 14, suit: 'diams' }, { value: 11, suit: 'diams' },
  { value: 2, suit: 'clubs' }, { value: 3, suit: 'clubs' }, { value: 4, suit: 'clubs' }, { value: 5, suit: 'clubs' }, { value: 6, suit: 'clubs' }, { value: 7, suit: 'clubs' }, { value: 8, suit: 'clubs' }, { value: 9, suit: 'clubs' }, { value: 10, suit: 'clubs' }, { value: 12, suit: 'clubs' }, { value: 13, suit: 'clubs' }, { value: 14, suit: 'clubs' }, { value: 11, suit: 'clubs' }
];
let allCards = [...originalCards];
let cardDrawn = [];
let canDrawOneMore = false;
let hasStarted = false;
let stood = false;
let isGameDone = false;
let hasBetted = false;

const dealerCard = document.getElementById("cards-dealer");
const dealerMax = document.getElementById("cards-maxSum");
const showDealerMaxSum = true;
const minSumValue = 15;
const maxSumValue = 21;
let dealerMaxSum = 0;
let dealerSum = 0;
let dealerDrawn = [];
let stopDrawing = false;

// HELPER FUNCTIONS

function getRandomIntInclusive(min, max) {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled); 
}

// DrawCards function defers to createCardElement,
// and for dealer draws we control whether to show the back.
function drawCards(num, drawnArray, cardArray, isPlayer, showBack = false) {
  for (let i = 0; i < num; i++) {
    let randomIndex = getRandomIntInclusive(0, cardArray.length - 1);
    let card = cardArray[randomIndex];
    
    if (isPlayer) {
      playerSum += getCardValue(card.value);
      createCardElement(card, playerCardsDiv, false); // Always show player's cards front
    } else {
      dealerSum += getCardValue(card.value);
      createCardElement(card, dealerCardsDiv, showBack);
    }
    
    drawnArray.push(card);
    cardArray.splice(randomIndex, 1);
  }
}

// createCardElement accepts a flag (showBack) to determine
// whether to render the card as a back or as its front.
function createCardElement(card, parentDiv, showBack) {
  const cardElement = document.createElement('div');
  
  if (showBack) {
    // Show card back
    cardElement.className = "card back";
    // Store card details in data attributes for later reveal
    cardElement.dataset.rank = getRank(card.value);
    cardElement.dataset.suit = card.suit;
  } else {
    // Show the actual card face
    cardElement.className = `card rank-${getRank(card.value)} ${card.suit}`;
    cardElement.innerHTML = `<span class="rank">${getRank(card.value)}</span><span class="suit">${getSuitSymbol(card.suit)}</span>`;
  }
  parentDiv.appendChild(cardElement);
}

function getSuitSymbol(suit) {
  const symbols = {
    spades: '&spades;',
    hearts: '&hearts;',
    diams: '&diams;',
    clubs: '&clubs;'
  };
  return symbols[suit];
}

function getRank(cardValue) {
  const ranks = {
    10: '10',
    11: 'A',
    12: 'J',
    13: 'Q',
    14: 'K'
  };
  return ranks[cardValue] || cardValue;
}

function getCardValue(cardValue) {
  if (cardValue >= 12 && cardValue <= 14) {
    return 10;
  }
  return cardValue === 11 ? 11 : cardValue;
}

// Function calle when the gam ends
function gameEnded(messageText) {
  message.textContent = messageText;
  isGameDone = true;
  stopDrawing = true;
  revealDealerSecondCard();
  checkDealerSum();
  updateDealerScreen(true);
}

// Resets the game
function reset() {
  hasStarted = false;
  isGameDone = false;
  message.textContent = "";
  resetPlayerVariables();
  resetDealerVariables();
  updateDealerScreen(false);
  allCards = [...originalCards];
  playerCardsDiv.innerHTML = '';
  dealerCardsDiv.innerHTML = '';
}

function resetPlayerVariables() {
  playerSum = 0;
  cardDrawn = [];
  canDrawOneMore = false;
  stood = false;
  screen.textContent = "Sum: ";
}

function resetDealerVariables() {
  dealerSum = 0;
  dealerMaxSum = 0;
  dealerDrawn = [];
  stopDrawing = false;
}

// This function reveals the dealer’s second card (the one showing back)
// by removing the "back" class and rendering the card front.
function revealDealerSecondCard() {
  if (dealerDrawn.length >= 2) {
    // Assume the second dealer card is the second child in dealerCardsDiv
    let secondCardElement = dealerCardsDiv.children[1];
    let card = dealerDrawn[1];
    secondCardElement.className = `card rank-${getRank(card.value)} ${card.suit}`;
    secondCardElement.innerHTML = `<span class="rank">${getRank(card.value)}</span><span class="suit">${getSuitSymbol(card.suit)}</span>`;
  }
}

// PLAYER FUNCTIONS

// Starts the game
function drawInitial() {
  if (hasStarted) return;
  
  // Draw 2 cards for the player (all shown front)
  drawCards(2, cardDrawn, allCards, true);
  checkPlayerSum();
  updatePlayerScreen();
  
  // For dealer, draw the first card face up and second card as back
  dealerInitial();
  hasStarted = true;
}

// Draw more cards after the initial 2
function drawMore() {
  if (!canDrawOneMore || isGameDone) return;
  
  drawCards(1, cardDrawn, allCards, true);
  checkPlayerSum();
}

// Checks the player sum for wins or losses
function checkPlayerSum() {
  updatePlayerScreen();
  
  if (playerSum < 21) {
    canDrawOneMore = true;
  } else {
    if (playerSum === 21 && dealerSum === 21) {
      gameEnded("Oh, that's a tie!");
    } else {
      gameEnded(playerSum === 21 ? "Damn, you win" : "You Busted");
    }
  }
}

// Updates the sum on the player screen
function updatePlayerScreen() {
  screen.textContent = "Sum: " + playerSum;
}

// stands and lets the dealer get cards
function stand() {
  if (isGameDone || !hasStarted) return;
  
  stood = true;
  checkPlayerSum();
  
  while (!stopDrawing && allCards.length > 0) {
    dealerDrawMore();
  }
  
  updateDealerScreen(true);
  checkDealerSum();
  
  stood = false;
}

// DEALER FUNCTIONS

// This function handles the dealer's initial two cards:
// The first card is shown face up; the second card is shown as a back.
function dealerInitial() {
  dealerSum = 0;
  dealerMaxSum = getRandomIntInclusive(minSumValue, maxSumValue);
  //if (showDealerMaxSum) dealerMax.textContent = "Max Sum: " + dealerMaxSum;
  
  // Draw first dealer card (face up)
  drawCards(1, dealerDrawn, allCards, false, false);
  // Draw second dealer card (face down - back shown)
  drawCards(1, dealerDrawn, allCards, false, true);
  
  checkDealerSum();
  updateDealerScreen(false);
  hasStarted = true;
}

// Additional dealer cards (drawn when player stands) are shown face up.
function dealerDrawMore() {
  if (stopDrawing || allCards.length === 0 || isGameDone) return;
  
  drawCards(1, dealerDrawn, allCards, false, false);
  checkDealerSum();
}

function checkDealerSum() {
  if (!isGameDone) updateDealerScreen(false);
  
  if (dealerSum > 21 && playerSum < 22) {
    gameEnded("Dealer Busted");
  } else if (dealerSum > dealerMaxSum) {
    stopDrawing = true;
  }
  
  if (stood) updateDealerMessage();
}

function updateDealerMessage() {
  if (dealerSum === playerSum) {
    gameEnded("Oh, that's a tie!");
  } else if (dealerSum > playerSum && dealerSum <= 21) {
    gameEnded("Dealer Won");
  } else {
    gameEnded("You Won");
  }
}

function updateDealerScreen(showAllCards) {
  if (dealerDrawn.length > 0) {
    //dealerCard.textContent = "Dealer Sum: " + dealerSum;
  }
}
