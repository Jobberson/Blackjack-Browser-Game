const screen = document.getElementById("cards-drawn"); 
const message = document.getElementById("cards-message"); 
const playerCardsDiv = document.getElementById("player-cards");
const dealerCardsDiv = document.getElementById("dealer-cards");

let playerSum = 0;
const originalCards = [
  { value: 2, suit: 'spades' }, { value: 3, suit: 'spades' }, { value: 4, suit: 'spades' }, { value: 5, suit: 'spades' }, { value: 6, suit: 'spades' }, { value: 7, suit: 'spades' }, { value: 8, suit: 'spades' }, { value: 9, suit: 'spades' }, { value: 10, suit: 'spades' }, { value: 12, suit: 'spades' }, { value: 13, suit: 'spades' }, { value: 14, suit: 'spades' }, { value: 11, suit: 'spades' },
  { value: 2, suit: 'hearts' }, { value: 3, suit: 'hearts' }, { value: 4, suit: 'hearts' }, { value: 5, suit: 'hearts' }, { value: 6, suit: 'hearts' }, { value: 7, suit: 'hearts' }, { value: 8, suit: 'hearts' }, { value: 9, suit: 'hearts' }, { value: 10, suit: 'hearts' }, { value: 12, suit: 'hearts' }, { value: 13, suit: 'hearts' }, { value: 14, suit: 'hearts' }, { value: 11, suit: 'hearts' },
  { value: 2, suit: 'diamonds' }, { value: 3, suit: 'diamonds' }, { value: 4, suit: 'diamonds' }, { value: 5, suit: 'diamonds' }, { value: 6, suit: 'diamonds' }, { value: 7, suit: 'diamonds' }, { value: 8, suit: 'diamonds' }, { value: 9, suit: 'diamonds' }, { value: 10, suit: 'diamonds' }, { value: 12, suit: 'diamonds' }, { value: 13, suit: 'diamonds' }, { value: 14, suit: 'diamonds' }, { value: 11, suit: 'diamonds' },
  { value: 2, suit: 'clubs' }, { value: 3, suit: 'clubs' }, { value: 4, suit: 'clubs' }, { value: 5, suit: 'clubs' }, { value: 6, suit: 'clubs' }, { value: 7, suit: 'clubs' }, { value: 8, suit: 'clubs' }, { value: 9, suit: 'clubs' }, { value: 10, suit: 'clubs' }, { value: 12, suit: 'clubs' }, { value: 13, suit: 'clubs' }, { value: 14, suit: 'clubs' }, { value: 11, suit: 'clubs' }
];
let allCards = [...originalCards];
let cardDrawn = [];
let canDrawOneMore = false;
let hasStarted = false;
let stood = false;
let isGameDone = false;

const dealerCard = document.getElementById("cards-dealer");
const dealerMax = document.getElementById("cards-maxSum");
const showDealerMaxSum = true;
const minSumValue = 10;
const maxSumValue = 21;
let dealerMaxSum = 0;
let dealerSum = 0;
let dealerDrawn = [];
let stopDrawing = false;

function getRandomIntInclusive(min, max) {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled); 
}

function drawCards(num, drawnArray, cardArray, isPlayer) {
  for (let i = 0; i < num; i++) {
    let randomIndex = getRandomIntInclusive(0, cardArray.length - 1);
    let card = cardArray[randomIndex];
    
    if (isPlayer) {
      playerSum += getCardValue(card.value);
      createCardElement(card, playerCardsDiv);
    } else {
      dealerSum += getCardValue(card.value);
      createCardElement(card, dealerCardsDiv);
    }
    
    drawnArray.push(card);
    cardArray.splice(randomIndex, 1);
  }
}

function createCardElement(card, parentDiv) {
  const cardElement = document.createElement('div');
  cardElement.className = `card rank-${getRank(card.value)} ${card.suit}`;
  cardElement.innerHTML = `<span class="rank">${getRank(card.value)}</span><span class="suit">${getSuitSymbol(card.suit)}</span>`;
  parentDiv.appendChild(cardElement);
}

function getSuitSymbol(suit) {
  const symbols = {
    spades: '&spades;',
    hearts: '&hearts;',
    diamonds: '&diamonds;',
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


function gameEnded(messageText) {
  message.textContent = messageText;
  isGameDone = true;
  stopDrawing = true;
  updateDealerScreen(true);
}

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
  screen.textContent = "Cards Drawn: ";
}

function resetDealerVariables() {
  dealerSum = 0;
  dealerMaxSum = 0;
  dealerDrawn = [];
  stopDrawing = false;

  dealerCard.textContent = "Dealer Cards: ";
  dealerMax.textContent = "";
}

function drawInitial() {
  if (hasStarted) return;
  
  playerSum = 0;
  drawCards(2, cardDrawn, allCards, true);
  checkPlayerSum();
  updatePlayerScreen();
  dealerInitial();
  hasStarted = true;
}

function drawMore() {
  if (!canDrawOneMore || isGameDone) return;
  
  drawCards(1, cardDrawn, allCards, true);
  checkPlayerSum();
  dealerDrawMore();
}

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

function updatePlayerScreen() {
  screen.textContent = "Cards Drawn: " + cardDrawn.map(card => `${getRank(card.value)} ${getSuitSymbol(card.suit)}`).join(', ') + " Sum: " + playerSum;
}

function stand() {
  if(isGameDone || !hasStarted) return;
  
  stood = true;
  
  checkPlayerSum();

  while (!stopDrawing && allCards.length > 0) {
    dealerDrawMore();
  }

  updateDealerScreen(true);

  checkDealerSum();
  
  stood = false;
}

function dealerInitial() {
  dealerSum = 0;
  
  dealerMaxSum = getRandomIntInclusive(minSumValue, maxSumValue);
  if(showDealerMaxSum) dealerMax.textContent = "Max Sum: " + dealerMaxSum;
  
  drawCards(2, dealerDrawn, allCards, false); 
  checkDealerSum();
  updateDealerScreen(false);
  hasStarted = true;
}

function dealerDrawMore() {
  if (stopDrawing || allCards.length === 0 || isGameDone) return;
  
  drawCards(1, dealerDrawn, allCards, false); 
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
  } else if (dealerSum > playerSum) {
    gameEnded("Dealer Won");
  } else {
    gameEnded("You Won");
  }
}

function updateDealerScreen(showAllCards) {
  if (dealerDrawn.length > 0) {
    dealerCard.textContent = showAllCards 
      ? "Dealer Cards: " + dealerDrawn.map(card => `${getRank(card.value)} ${getSuitSymbol(card.suit)}`).join(', ') + " Sum: " + dealerSum
      : "Dealer Cards: " + `${getRank(dealerDrawn[0].value)} ${getSuitSymbol(dealerDrawn[0].suit)} ` + "*".repeat(dealerDrawn.length - 1).split('').join(' ');
  } else {
    dealerCard.textContent = "Dealer Cards: ";
  }
}
}