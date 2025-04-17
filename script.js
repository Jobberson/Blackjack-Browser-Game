//#region VARIABLES
const screen = document.getElementById("cardsDrawn");
const message = document.getElementById("cardsMessage");
const playerCardsDiv = document.getElementById("playerCards");
const dealerCardsDiv = document.getElementById("dealerCards");
const dealerMax = document.getElementById("cardsMaxSum");
const dealerCard = document.getElementById("cardsDealer");
const handWins = document.getElementById("handWins");
const moneyText = document.querySelectorAll(".money-text");
const betText = document.querySelectorAll(".bet-text");
const insuranceText = document.querySelectorAll(".insurance-text");
const doubleDownButton = document.getElementById("doubleButton");
const hitButton = document.getElementById("hitButton");
const surrenderButton = document.getElementById("surrenderButton");
const continueGameButton = document.getElementById("continueGameButton");

const debug = false;

//#region Game Variables
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

let savedGameState;

let gameState = {
  allCards: [...originalCards],
  hasStarted: false,
  hasBetted: false,
  isGameDone: false,
  currentMoney: 1000,
  currentBet: 0,
  insuranceBet: 0,
  hasInsurance: false,
  winsCounter: 0,
  hasDoubled: false,
  canDoubleDown: true,
  canSurrender: true,
  gameMode: "normal",
  //#endregion

  //#region Player Variables
  playerSum: 0,
  cardDrawn: [],
  canDrawOneMore: false,
  stood: false,
  //#endregion

  //#region Dealer Variables
  dealerMaxSum: 0,
  dealerSum: 0,
  dealerDrawn: [],
  stopDrawing: false
}

const debugDealerMaxSum = false;
const minSumValue = 17;
const maxSumValue = 17;
//#endregion
//#endregion

//#region SAVE GAME 
function saveGame() {
  localStorage.setItem('blackjackGameState', JSON.stringify(gameState));
  alert('Game saved!');
}

function loadGame() {
  savedGameState = localStorage.getItem('blackjackGameState');
  if (savedGameState) {
    gameState = JSON.parse(savedGameState);
    alert('Game loaded!');
    continueGameButton.disabled = false;
    if(debug) console.log(gameState);
  } else {
    alert('No saved game found.');
    continueGameButton.disabled = true;
  }
}

function clearAllLocalStorage() {
  localStorage.clear();
}

function loadGameOnWindowLoad(){
  window.onload = loadGame;
}

loadGameOnWindowLoad();

//#endregion

//#region GAME MODE 

// gotta add a continue button and change the start button to be a new game button
// in the new game button you can decide which game mode you want
// it should always show in game what game mode you are in so you don't get lost

function selectGameMode(selectedGameMode){
  // Game Modes
  // - normal 
  // - pontoon

  gameState.gameMode = selectedGameMode;
  startGame();
  closeModal("modeSelectorModal");
}
//#endregion

//#region SURRENDER 

function surrender(){
  if(!gameState.canSurrender) return;

  gameState.currentBet = gameState.currentBet / 2;
  gameState.currentMoney += gameState.currentBet;
  updateBetText();
  updateMoneyText();
  gameEnded("You surrendered", "lost");
}

function disableButtonsSurrender(){
  surrenderButton.disabled = true;
}

function enableButtonsSurrender(){
  surrenderButton.disabled = false;
}
//#endregion

//#region DOUBLE DOWN 

function doubleDown(){
  if(!gameState.canDoubleDown) return;

  gameState.currentMoney -= gameState.currentBet;
  gameState.currentBet = gameState.currentBet * 2;
  gameState.hasDoubled = true;
  updateBetText();
  updateMoneyText();
  drawCards(1, gameState.cardDrawn, gameState.allCards, true, false);
  disableDoubleDownButton();
  disableHitButton();
  stand();
}

function disableHitButton(){
  hitButton.disabled = true;
}

function enableHitButton(){
  hitButton.disabled = false;
}

function disableDoubleDownButton() {
  doubleDownButton.disabled = true;
}
  
function enableDoubleDownButton() {
  doubleDownButton.disabled = false;
}
//#endregion

//#region INSURANCE 

function addInsuranceBet(amount) {
  if (gameState.currentMoney < 5) return;

  if (!gameState.hasInsurance) {
    if (amount === "max") {
      gameState.insuranceBet = gameState.currentBet / 2;
    } else {
      if (amount + gameState.insuranceBet > gameState.currentBet / 2) return;
      gameState.insuranceBet += amount;
    }
    updateInsuranceText();
    if (debug) console.log("Insurance bet added: " + amount);
  }
}

function resetInsuranceBet() {
  if (gameState.hasStarted && !gameState.hasInsurance) {
    gameState.insuranceBet = 0;
    updateInsuranceText();
  }
}

function confirmInsuranceBet() {
  if (gameState.hasStarted && !gameState.hasInsurance) {
    if(gameState.insuranceBet > 0){
      gameState.currentMoney -= gameState.insuranceBet;
      updateMoneyText();
      gameState.hasInsurance = true;
      closeModal("insuranceModal");
      if (debug) console.log("Insurance bet placed: " + gameState.insuranceBet);
    } else if (debug) console.log("Insurance bet was 0");
  }
}

function updateInsuranceText() {
  insuranceText.forEach((element) => {
    element.textContent = "Insurance Bet: " + gameState.insuranceBet + "$";
  });
}

function checkInsurance() {
  if (gameState.dealerDrawn[0].value === 11) {
    openModal("insuranceModal");
  }
}

function resolveInsurance(dealerHasBlackjack) {
  if (gameState.hasInsurance) {
    if (dealerHasBlackjack) {
      gameState.currentMoney += gameState.insuranceBet * 2;
    }
    gameState.insuranceBet = 0;
    gameState.hasInsurance = false;
    updateMoneyText();
    updateInsuranceText();
  }
}
//#endregion

//#region SETTINGS 

function updateCardVisuals() {
  const playerCardsContainer = document.getElementById("playerCards");
  const dealerCardsContainer = document.getElementById("dealerCards");
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
//#endregion

//#region POPUP 

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

/*

///
/// I'm taking down off to prevent softlocks
///

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
*/

function betPopup() {
  bet();
}

function gameOverPopup() {
  tryAgain();
}
//#endregion

//#region BET 

function addBet(button) {
  if (gameState.hasStarted || gameState.hasBetted) return;

  if(button.textContent === "All In"){
    gameState.currentBet = gameState.currentMoney;
    gameState.currentMoney = 0;
  } else{
    let buttonValue = parseInt(button.textContent);
    
    if (buttonValue + gameState.currentBet > gameState.currentMoney) return;
    
    gameState.currentBet += buttonValue;
  }
  
  updateBetText();

  if (debug) console.log("Bet added: " + button.innerText);
}

function resetBet() {
  if (gameState.hasStarted || gameState.hasBetted) return;

  gameState.currentBet = 0;
  updateBetText();
}

// Confirms bet
function bet() {
  if (gameState.hasStarted || gameState.hasBetted || gameState.currentBet < 10) return;

  gameState.currentMoney -= gameState.currentBet;
  updateMoneyText();
  gameState.hasBetted = true;
  closeModal("betModal");
  drawInitial();
  if (debug) console.log("Bet placed: " + gameState.currentBet);
}

function betReward(result) {
  switch (result) {
    case "won":
      gameState.currentMoney += gameState.currentBet * 2;
      break;
    case "lost":
      break;
    case "tied":
      gameState.currentMoney += gameState.currentBet;
      break;
  }
  updateMoneyText();
}

function updateBetText() {
  betText.forEach((element) => {
    element.textContent = "Bet: " + gameState.currentBet + "$";
  });
}

function updateMoneyText() {
  moneyText.forEach((element) => {
    element.textContent = "Money: " + gameState.currentMoney + "$";
  });
}
//#endregion

//#region HELPER 
function gameOver(){
  showWins();
  openModal("gameOverModal");
  clearAllLocalStorage();
}

function checkMoney()
{
  if(gameState.currentMoney < 10){
    gameOver();
  }
}

function countWins() {
  gameState.winsCounter++;
}

function showWins() {
  handWins.textContent = "Hand wins: " + gameState.winsCounter;
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
      gameState.playerSum += getCardValue(card.value, gameState.playerSum);
      createCardElement(card, playerCardsDiv, false);
    } else {
      gameState.dealerSum += getCardValue(card.value, gameState.dealerSum);
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

function startNewGame(){
  if(continueGameButton.disabled === true){
    continueGameButton.disabled = false;
  }

  hardReset();
  openModal('modeSelectorModal');
}

function startGame(){
  openModal("betModal");
  document.getElementById("mainMenu").style.display = "none";
  document.getElementById("game").style.display = "block";
}

function continueGame() {
    reset();
    openModal("betModal");
    document.getElementById("mainMenu").style.display = "none";
    document.getElementById("game").style.display = "block";
    closeModal("gameResultModal");
}

function menu(){
  document.getElementById("mainMenu").style.display = "block";
  document.getElementById("game").style.display = "none";
  closeModal("gameResultModal");
  saveGame();
}

// Function called when the game ends.
function gameEnded(messageText, result) {
  if (gameState.isGameDone) return;

  if (result === "won") countWins();

  message.textContent = messageText;
  gameState.isGameDone = true;
  gameState.stopDrawing = true;
  betReward(result);
  revealDealerSecondCard();
  DealerSum();
  updateDealerScreen(true);
  resolveInsurance(result === "lost" && gameState.dealerSum === 21);
  openModal('gameResultModal');
  saveGame();
}

function tryAgain() {
  hardReset();
  closeModal("gameOverModal");
  closeModal("gameResultModal");
  openModal("betModal");
}

// Resets the game
function reset() {
  gameState.hasBetted = false;
  gameState.currentBet = 0;
  gameState.insuranceBet = 0;
  gameState.hasStarted = false;
  gameState.hasInsurance = false;
  gameState.isGameDone = false;
  gameState.canDoubleDown = true;
  gameState.canSurrender = true;
  gameState.allCards = [...originalCards];
  message.textContent = "";
  dealerCardsDiv.innerHTML = "";
  playerCardsDiv.innerHTML = "";
  resetPlayerVariables();
  resetDealerVariables();
  updateBetText();
  updateDealerScreen(false);
  enableDoubleDownButton();
  enableHitButton();
  enableButtonsSurrender();
}

function resetPlayerVariables() {
  gameState.playerSum = 0;
  gameState.cardDrawn = [];
  gameState.canDrawOneMore = false;
  gameState.stood = false;
  screen.textContent = "Sum: ";
}

function resetDealerVariables() {
  gameState.dealerSum = 0;
  gameState.dealerMaxSum = 0;
  gameState.dealerDrawn = [];
  gameState.stopDrawing = false;
}

function hardReset(){
  gameState.currentMoney = 1000;
  gameState.winsCounter = 0;
  reset();
  resetPlayerVariables();
  resetDealerVariables();
  updateMoneyText();
}

// These function reveals the dealer’s second card.
// by removing the "back" class and rendering the card front.
function updateCardElement(cardElement, card) {
  cardElement.className = `card rank-${getRank(card.value)} ${card.suit}`;
  cardElement.innerHTML = `<span class="rank">${getRank(card.value)}</span><span class="suit">${getSuitSymbol(card.suit)}</span>`;
  console.log("Updated card element:", cardElement);
}

function revealDealerSecondCard() {
  if (gameState.dealerDrawn.length >= 2) {
    let secondCardElement = dealerCardsDiv.children[1];
    let card = gameState.dealerDrawn[1];

    if (secondCardElement && card) {
      switch (gameState.gameMode) {
        case "normal":
          updateCardElement(secondCardElement, card);
          break;
        case "pontoon":
          // first card
          let firstCardElement = dealerCardsDiv.children[0];
          let firstCard = gameState.dealerDrawn[0];
          console.log("First card element:", firstCardElement);
          console.log("First card data:", firstCard);
          updateCardElement(firstCardElement, firstCard);

          // second card
          console.log("Second card element:", secondCardElement);
          console.log("Second card data:", card);
          updateCardElement(secondCardElement, card);
          break;
        // Add other game modes if necessary
      }
    } else {
      console.error("Second card element or card data is missing.");
    }
  } else {
    console.error("Dealer has not drawn enough cards.");
  }
}
//#endregion

//#region PLAYER 
// Starts the game.
function drawInitial() {
  if (gameState.hasStarted || !gameState.hasBetted) return;

  // Draw 2 cards for the player (all shown front).
  drawCards(2, gameState.cardDrawn, gameState.allCards, true);
  PlayerSum();
  updatePlayerScreen();

  // For dealer, draw the first card face up and second card face down.
  dealerInitial();
  gameState.hasStarted = true;
}

// Draw more cards after the initial 2.
function drawMore() {
  if (!gameState.canDrawOneMore || gameState.isGameDone || !gameState.hasBetted) return;

  if(gameState.canDoubleDown || gameState.canSurrender){
    gameState.canDoubleDown = false;
    gameState.canSurrender = false;
    disableButtonsSurrender();
    disableDoubleDownButton();
  }

  drawCards(1, gameState.cardDrawn, gameState.allCards, true);
  PlayerSum();
}

// Checks the player sum for to determine game state.
function checkPlayerSum() {
  updatePlayerScreen();

  if (gameState.playerSum < 21) {
    gameState.canDrawOneMore = true;
  } else {
    if (gameState.playerSum === 21 && gameState.dealerSum === 21) {
      gameEnded("Oh, that's a tie!", "tied");
    } else if (gameState.playerSum === 21) {
      gameEnded("Damn, you won", "won");
    } else {
      gameEnded("You Busted", "lost");
    }

    checkMoney();
  }
}

// Updates the sum on the player screen.
function updatePlayerScreen() {
  screen.textContent = "Sum: " + gameState.playerSum;
}

// Stands and lets the dealer get cards.
function stand() {
  if (gameState.isGameDone || !gameState.hasStarted) return;

  gameState.stood = true;
  PlayerSum();

  while (!gameState.stopDrawing && gameState.allCards.length > 0) {
    dealerDrawMore();
  }

  DealerSum();
  checkMoney();

  gameState.stood = false;
}
//#endregion

//#region DEALER 

// This function handles the dealer's initial two cards:
// The first card is shown face up; the second card is shown as a back.
function dealerInitial() {
  gameState.dealerSum = 0;
  gameState.dealerMaxSum = getRandomIntInclusive(minSumValue, maxSumValue);
  if (debuggameState.DealerMaxSum) dealerMax.textContent = "Max Sum: " + gameState.dealerMaxSum;

  switch (gameState.gameMode) {
    case "normal":
      // Draw first dealer card (face up)
      drawCards(1, gameState.dealerDrawn, gameState.allCards, false, false);
      // Draw second dealer card (face down - back shown)
      drawCards(1, gameState.dealerDrawn, gameState.allCards, false, true);
      break;
      case "pontoon":
        // Draw 2 dealer cards (face down - back shown)
        drawCards(2, gameState.dealerDrawn, gameState.allCards, false, true);
      break;
  }

  DealerSum();
  gameState.hasStarted = true;
  checkInsurance();
}

// Additional dealer cards (drawn when player stands) are shown face up.
function dealerDrawMore() {
  if (gameState.stopDrawing || gameState.allCards.length === 0 || gameState.isGameDone) return;

  drawCards(1, gameState.dealerDrawn, gameState.allCards, false, false);
  DealerSum();
}

function checkDealerSum() {
  if (gameState.dealerSum > 21 && gameState.playerSum < 22) {
    if (!gameState.isGameDone) gameEnded("Dealer Busted", "won");
  } else if (gameState.dealerSum > gameState.dealerMaxSum) {
    gameState.stopDrawing = true;
  }

  if (gameState.stood) updateDealerMessage();
}

function updateDealerMessage() {
  if (gameState.dealerSum === gameState.playerSum) {
    if (!gameState.isGameDone) gameEnded("Oh, that's a tie!", "tied");
  } else if (gameState.dealerSum > gameState.playerSum && gameState.dealerSum <= 21) {
    if (!gameState.isGameDone) {
      gameEnded("Dealer Won", "lost");
      checkMoney();
    }
  } else {
    if (!gameState.isGameDone) gameEnded("You Won", "won");
  }
}

function updateDealerScreen(showSum) {
  dealerCard.textContent = showSum ? "Dealer Sum: " + gameState.dealerSum : "";
}
//#endregion
