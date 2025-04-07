const screen = document.getElementById("cards-drawn");
const message = document.getElementById("cards-message");
const playerCardsDiv = document.getElementById("player-cards");
const dealerCardsDiv = document.getElementById("dealer-cards");
const dealerMax = document.getElementById("cards-maxSum");
const dealerCard = document.getElementById("cards-dealer");
const handWins = document.getElementById("hand-wins");
const moneyText = document.querySelectorAll(".moneyText");
const betText = document.querySelectorAll(".betText");
const insuranceText = document.querySelectorAll(".insuranceText");

const debug = false;

// GAME VARIABLES
const originalCards = [
  { value: 2, suit: "spades" },
  { value: 3, suit: "spades" },
  { value: 4, suit: "spades" },
  { value: 5, suit: "spades" },
  { value: 6, suit: "spades" },
  { value: 7, suit: "spades" },
  { value: 8, suit: "spades" },
  { value: 9, suit: "spades" },
  { value: 10, suit: "spades" },
  { value: 12, suit: "spades" },
  { value: 13, suit: "spades" },
  { value: 14, suit: "spades" },
  { value: 11, suit: "spades" },
  { value: 2, suit: "hearts" },
  { value: 3, suit: "hearts" },
  { value: 4, suit: "hearts" },
  { value: 5, suit: "hearts" },
  { value: 6, suit: "hearts" },
  { value: 7, suit: "hearts" },
  { value: 8, suit: "hearts" },
  { value: 9, suit: "hearts" },
  { value: 10, suit: "hearts" },
  { value: 12, suit: "hearts" },
  { value: 13, suit: "hearts" },
  { value: 14, suit: "hearts" },
  { value: 11, suit: "hearts" },
  { value: 2, suit: "diams" },
  { value: 3, suit: "diams" },
  { value: 4, suit: "diams" },
  { value: 5, suit: "diams" },
  { value: 6, suit: "diams" },
  { value: 7, suit: "diams" },
  { value: 8, suit: "diams" },
  { value: 9, suit: "diams" },
  { value: 10, suit: "diams" },
  { value: 12, suit: "diams" },
  { value: 13, suit: "diams" },
  { value: 14, suit: "diams" },
  { value: 11, suit: "diams" },
  { value: 2, suit: "clubs" },
  { value: 3, suit: "clubs" },
  { value: 4, suit: "clubs" },
  { value: 5, suit: "clubs" },
  { value: 6, suit: "clubs" },
  { value: 7, suit: "clubs" },
  { value: 8, suit: "clubs" },
  { value: 9, suit: "clubs" },
  { value: 10, suit: "clubs" },
  { value: 12, suit: "clubs" },
  { value: 13, suit: "clubs" },
  { value: 14, suit: "clubs" },
  { value: 11, suit: "clubs" },
];
let allCards = [...originalCards];
let hasStarted = false;
let hasBetted = false;
let isGameDone = false;
let currentMoney = 1000;
let currentBet = 0;
let insuranceBet = 0;
let hasInsurance = false;
let winsCounter = 0;

// PLAYER VARIABLES
let playerSum = 0;
let cardDrawn = [];
let canDrawOneMore = false;
let stood = false;

// DEALER VARIABLES
const debugDealerMaxSum = false;
const minSumValue = 17;
const maxSumValue = 17;
let dealerMaxSum = 0;
let dealerSum = 0;
let dealerDrawn = [];
let stopDrawing = false;

// INSURANCE FUNCTIONS

function addInsuranceBet(amount) {
  if (currentMoney < 5) return;

  if (!hasInsurance) {
    if (amount === "max") {
      insuranceBet = currentBet / 2;
    } else {
      if (amount + insuranceBet > currentBet / 2) return;
      insuranceBet += amount;
    }
    updateInsuranceText();
    if (debug) console.log("Insurance bet added: " + amount);
  }
}

function resetInsuranceBet() {
  if (hasStarted && !hasInsurance) {
    insuranceBet = 0;
    updateInsuranceText();
  }
}

function confirmInsuranceBet() {
  if (hasStarted && !hasInsurance && insuranceBet > 0) {
    currentMoney -= insuranceBet;
    updateMoneyText();
    hasInsurance = true;
    closeModal("insuranceModal");
    if (debug) console.log("Insurance bet placed: " + insuranceBet);
  }
}

function updateInsuranceText() {
  insuranceText.forEach((element) => {
    element.textContent = "Insurance Bet: " + insuranceBet + "$";
  });
}

function checkInsurance() {
  if (dealerDrawn[0].value === 11) {
    openModal("insuranceModal");
  }
}

function resolveInsurance(dealerHasBlackjack) {
  if (hasInsurance) {
    if (dealerHasBlackjack) {
      currentMoney += insuranceBet * 2;
    }
    insuranceBet = 0;
    hasInsurance = false;
    updateMoneyText();
    updateInsuranceText();
  }
}

// SETTINGS FUNCTIONS

function updateCardVisuals() {
  const playerCardsContainer = document.getElementById("player-cards");
  const dealerCardsContainer = document.getElementById("dealer-cards");
  const options = ["fourColours", "faceImages", "simpleCards", "inText"];

  // Remove all existing visual classes from both containers
  options.forEach((opt) => {
    playerCardsContainer.classList.remove(opt);
    dealerCardsContainer.classList.remove(opt);
  });

  // Add selected visual classes to both containers
  options.forEach((option) => {
    const checkbox = document.getElementById(option + "Checkbox");
    if (checkbox.checked) {
      playerCardsContainer.classList.add(option);
      dealerCardsContainer.classList.add(option);
    }
  });
}

function settings() {
  openModal("settingsModal");
}

// POPUP FUNCTIONS

function openModal(modalId) {
  var modal = document.getElementById(modalId);
  modal.style.display = "block";
  if (debug) console.log("Opened " + modalId + " modal");
}

function closeModal(modalId) {
  var modal = document.getElementById(modalId);
  modal.style.display = "none";
  if (debug) console.log("Closed " + modalId + " modal");
}

// Function to close the modal when Escape key is pressed
function closeModalOnEscape(event) {
  if (event.key === "Escape") {
    var modals = document.getElementsByClassName("modal");
    for (var i = 0; i < modals.length; i++) {
      if (modals[i].style.display === "block") {
        modals[i].style.display = "none";
      }
    }
  }
}

// Function to handle Enter key press
function handleEnterKeyPress(event) {
  if (event.key === "Enter") {
    var betModal = document.getElementById("betModal");
    var gameOverModal = document.getElementById("gameOverModal");

    if (betModal.style.display === "block") {
      bet(); // Place the bet if bet modal is visible
    } else if (gameOverModal.style.display === "block") {
      tryAgain(); // Run tryAgain function if game over modal is visible
    }
  }
}

// Add event listeners for Escape and Enter keys
document.addEventListener("keydown", closeModalOnEscape);
document.addEventListener("keydown", handleEnterKeyPress);

function betPopup() {
  bet();
}

function gameOverPopup() {
  tryAgain();
}

// BET FUNCTIONS

function addBet(button) {
  if (hasStarted || hasBetted) return;

  let buttonValue = parseInt(button.textContent);

  if (buttonValue + currentBet > currentMoney) return;

  currentBet += buttonValue;
  updateBetText();

  if (debug) console.log("Bet added: " + button.innerText);
}

function resetBet() {
  if (hasStarted || hasBetted) return;

  currentBet = 0;
  updateBetText();
}

// Confirms bet
function bet() {
  if (hasStarted || hasBetted || currentBet < 10) return;

  currentMoney -= currentBet;
  updateMoneyText();
  hasBetted = true;
  closeModal("betModal");
  drawInitial();
  if (debug) console.log("Bet placed: " + currentBet);
}

function betReward(result) {
  switch (result) {
    case "won":
      currentMoney += currentBet * 2;
      break;
    case "lost":
      break;
    case "tied":
      currentMoney += currentBet;
      break;
  }
  updateMoneyText();
}

function updateBetText() {
  betText.forEach((element) => {
    element.textContent = "Bet: " + currentBet + "$";
  });
}

function updateMoneyText() {
  moneyText.forEach((element) => {
    element.textContent = "Money: " + currentMoney + "$";
  });
}

// HELPER FUNCTIONS

function countWins() {
  winsCounter++;
}

function showWins() {
  handWins.textContent = "Hand wins: " + winsCounter;
}

function getRandomIntInclusive(min, max) {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled);
}

function drawCards(num, drawnArray, cardArray, isPlayer, showBack = false) {
  for (let i = 0; i < num; i++) {
    let randomIndex = getRandomIntInclusive(0, cardArray.length - 1);
    let card = cardArray[randomIndex];

    if (isPlayer) {
      playerSum += getCardValue(card.value, playerSum);
      createCardElement(card, playerCardsDiv, false);
    } else {
      dealerSum += getCardValue(card.value, dealerSum);
      createCardElement(card, dealerCardsDiv, showBack);
    }

    drawnArray.push(card);
    cardArray.splice(randomIndex, 1);
  }
}

// for dealer draws control whether to show the back of the card.
function createCardElement(card, parentDiv, showBack) {
  const cardElement = document.createElement("div");
  if (showBack) {
    cardElement.className = "card back";
    cardElement.dataset.rank = getRank(card.value);
    cardElement.dataset.suit = card.suit;
  } else {
    const rank = getRank(card.value);
    const suit = card.suit;
    cardElement.className = `card rank-${rank} ${suit}`;

    // Ensure the .suit span is created for face cards
    cardElement.innerHTML = `<span class="rank">${rank}</span><span class="suit">${getSuitSymbol(
      suit
    )}</span>`;
    console.log(cardElement.innerHTML); // Log the HTML structure
    if (rank === "J" || rank === "Q" || rank === "K") {
      if (document.getElementById("faceImagesCheckbox").checked) {
        cardElement.classList.add("faceImages");
      }
    }
  }
  parentDiv.appendChild(cardElement);
}

// Gets card info
function getSuitSymbol(suit) {
  const symbols = {
    spades: "&spades;",
    hearts: "&hearts;",
    diams: "&diams;",
    clubs: "&clubs;",
  };
  return symbols[suit];
}

function getRank(cardValue) {
  const ranks = {
    10: "10",
    11: "A",
    12: "J",
    13: "Q",
    14: "K",
  };
  return ranks[cardValue] || cardValue;
}

function getCardValue(cardValue, currentSum) {
  if (cardValue >= 12 && cardValue <= 14) {
    return 10;
  }
  if (cardValue === 11) {
    // If adding 11 would cause a bust, count Ace as 1 instead
    return currentSum + 11 > 21 ? 1 : 11;
  }
  return cardValue;
}

function startGame() {
  if (hasStarted && isGameDone) {
    reset();
    openModal("betModal");
  } else if (!hasStarted) {
    document.getElementById("mainMenu").style.display = "none";
    document.getElementById("Game").style.display = "block";
    openModal("betModal");
  }
}

function menu(){
  document.getElementById("mainMenu").style.display = "block";
    document.getElementById("Game").style.display = "none";
}

// Function called when the game ends.
function gameEnded(messageText, result) {
  if (isGameDone) return;

  if (result === "won") countWins();

  message.textContent = messageText;
  isGameDone = true;
  stopDrawing = true;
  betReward(result);
  revealDealerSecondCard();
  checkDealerSum();
  updateDealerScreen(true);
  resolveInsurance(result === "lost" && dealerSum === 21);
}

function tryAgain() {
  reset();
  currentMoney = 1000;
  updateMoneyText();
  closeModal("gameOverModal");
}

// Resets the game
function reset() {
  hasBetted = false;
  currentBet = 0;
  insuranceBet = 0;
  hasStarted = false;
  hasInsurance = false;
  isGameDone = false;
  allCards = [...originalCards];
  message.textContent = "";
  dealerCardsDiv.innerHTML = "";
  playerCardsDiv.innerHTML = "";
  resetPlayerVariables();
  resetDealerVariables();
  updateBetText();
  updateDealerScreen(false);
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

// This function reveals the dealer’s second card.
// by removing the "back" class and rendering the card front.
function revealDealerSecondCard() {
  if (dealerDrawn.length >= 2) {
    // Assume the second dealer card is the second child in dealerCardsDiv.
    let secondCardElement = dealerCardsDiv.children[1];
    let card = dealerDrawn[1];
    secondCardElement.className = `card rank-${getRank(card.value)} ${
      card.suit
    }`;
    secondCardElement.innerHTML = `<span class="rank">${getRank(
      card.value
    )}</span><span class="suit">${getSuitSymbol(card.suit)}</span>`;
  }
}

// PLAYER FUNCTIONS

// Starts the game.
function drawInitial() {
  if (hasStarted || !hasBetted) return;

  // Draw 2 cards for the player (all shown front).
  drawCards(2, cardDrawn, allCards, true);
  checkPlayerSum();
  updatePlayerScreen();

  // For dealer, draw the first card face up and second card face down.
  dealerInitial();
  hasStarted = true;
}

// Draw more cards after the initial 2.
function drawMore() {
  if (!canDrawOneMore || isGameDone || !hasBetted) return;

  drawCards(1, cardDrawn, allCards, true);
  checkPlayerSum();
}

// Checks the player sum for to determine game state.
function checkPlayerSum() {
  updatePlayerScreen();

  if (playerSum < 21) {
    canDrawOneMore = true;
  } else {
    if (playerSum === 21 && dealerSum === 21) {
      gameEnded("Oh, that's a tie!", "tied");
    } else if (playerSum === 21) {
      gameEnded("Damn, you won", "won");
    } else {
      gameEnded("You Busted", "lost");

      if (currentMoney < 10) {
        showWins();
        openModal("gameOverModal");
      }
    }
  }
}

// Updates the sum on the player screen.
function updatePlayerScreen() {
  screen.textContent = "Sum: " + playerSum;
}

// Stands and lets the dealer get cards.
function stand() {
  if (isGameDone || !hasStarted) return;

  stood = true;
  checkPlayerSum();

  while (!stopDrawing && allCards.length > 0) {
    dealerDrawMore();
  }

  checkDealerSum();

  stood = false;
}

// DEALER FUNCTIONS

// This function handles the dealer's initial two cards:
// The first card is shown face up; the second card is shown as a back.
function dealerInitial() {
  dealerSum = 0;
  dealerMaxSum = getRandomIntInclusive(minSumValue, maxSumValue);
  if (debugDealerMaxSum) dealerMax.textContent = "Max Sum: " + dealerMaxSum;

  // Draw first dealer card (face up)
  drawCards(1, dealerDrawn, allCards, false, false);
  // Draw second dealer card (face down - back shown)
  drawCards(1, dealerDrawn, allCards, false, true);

  checkDealerSum();
  hasStarted = true;
  checkInsurance();
}

// Additional dealer cards (drawn when player stands) are shown face up.
function dealerDrawMore() {
  if (stopDrawing || allCards.length === 0 || isGameDone) return;

  drawCards(1, dealerDrawn, allCards, false, false);
  checkDealerSum();
}

function checkDealerSum() {
  if (dealerSum > 21 && playerSum < 22) {
    if (!isGameDone) gameEnded("Dealer Busted", "won");
  } else if (dealerSum > dealerMaxSum) {
    stopDrawing = true;
  }

  if (stood) updateDealerMessage();
}

function updateDealerMessage() {
  if (dealerSum === playerSum) {
    if (!isGameDone) gameEnded("Oh, that's a tie!", "tied");
  } else if (dealerSum > playerSum && dealerSum <= 21) {
    if (!isGameDone) {
      gameEnded("Dealer Won", "lost");
      if (currentMoney === 0) openModal("gameOverModal");
    }
  } else {
    if (!isGameDone) gameEnded("You Won", "won");
  }
}

function updateDealerScreen(showSum) {
  dealerCard.textContent = showSum ? "Dealer Sum: " + dealerSum : "";
}
