// Define a variable "doc" and assign the "document" object to it
let doc = document;

// Define variable "gameDifficulty"
var gameDifficulty;

// Define a class "AudioController" to manage game audio
class AudioController {
  constructor() {
     // Create an array of audio files for game over sounds
     var gameOverSounds = [
      "Assets/Audios/gameover1.wav",
      "Assets/Audios/gameover2.wav",
      "Assets/Audios/gameover3.wav"
    ];

    // Create an array of audio files for victory sounds
    var victorySounds = [
      "Assets/Audios/victory.wav",
      "Assets/Audios/victory2.wav"
    ];

    // Generate a random index for selecting a game over sound
    var randomGameOverSound = Math.floor(Math.random() * gameOverSounds.length);

    // generate a random index for selecting a victory sound 
    var randomVictorySound = Math.floor(Math.random() * victorySounds.length);

    // Initialize audio objects with corresponding audio files
    this.backgroundSound = new Audio("Assets/Audios/backgroundSound.wav");
    this.flipSound = new Audio("Assets/Audios/flip.wav");
    this.matchSound = new Audio("Assets/Audios/match.wav");
    
    // Assign a random game over sound to this.gameOverSound
    this.gameOverSound = new Audio(gameOverSounds[randomGameOverSound]);

    // Assign a random victory sound to this.victorySound
    this.victorySound = new Audio(victorySounds[randomVictorySound]);

    // Set properties for audio objects
    this.backgroundSound.loop = 1; // Loop the background music
    this.backgroundSound.volume = 0.6; // Set volume for the background music
    this.flipSound.volume = 0.5; // Set volume for the flip sound
  }

  // Play the background music
  startMusic() {
    this.backgroundSound.play();
  }
  // Stop the background music
  stopMusic() {
    this.backgroundSound.pause();
    this.backgroundSound.currentTime = 0;
  }
  // Play the flip sound
  flip() {
    this.flipSound.play();
  }
  // Play the match sound
  match() {
    this.matchSound.play();
  }
  // Play the victory sound and stop the background music
  victory() {
    this.stopMusic();
    this.victorySound.play();
  }
  // Play the game over sound and stop the background music
  gameover() {
    this.stopMusic();
    this.gameOverSound.play();
  }
}



// Define a class "FlipOrQuit" to manage the memory card game
class FlipOrQuit {
  constructor(totalTime, cards) {
    this.totalTime = totalTime; // Total time for the game
    this.remainingTime = totalTime; // Remaining time for the game

    this.cards = cards; // Array of card elements
    
    this.bestEasyFlipsRecord = Infinity; // initialize best easy record to infinity 
    this.bestNormalFlipsRecord = Infinity; // initialize best normal record to infinity 
    this.bestHardFlipsRecord = Infinity; // initialize best hard record to infinity 

    this.easyWins = 0; // number of easy wins 
    this.normalWins = 0; // number of normal wins 
    this.hardWins = 0; // number of hard wins 
    
    // Get elements from the DOM
    this.flips = doc.getElementById("flips");
    this.timer = doc.getElementById("timer");

    this.audioController = new AudioController(); // Create an instance of the AudioController
  } 

  resetTimers() {
    clearInterval(this.countdown); // Clear the countdown interval
    this.timer.innerText = this.totalTime; // Reset the timer display
    this.timeRemaining = this.totalTime; // Reset the remaining time
  }

  // Start the game
  startGame(time) {
    this.remainingTime = time; // Reset remaining time
    this.cardToCheck = null; // Store the current card being checked
    this.matchedCards = []; // Store the matched cards
    this.busy = true; // Indicates if the game is busy (e.g., flipping cards)
    this.flipsCounter = 0; // reset the number of flips

    this.hideCards(); // Hide all cards

    setTimeout(() => {
      this.shuffleCards(); // Shuffle the cards
      this.busy = false; // Set game as not busy
      this.audioController.startMusic(); // Start playing background music
      this.countDown = this.startTimer(time); // Start the timer
    }, 1000);

    this.flips.innerText = this.flipsCounter; // Display the number of flips
    this.timer.innerText = this.remainingTime; // Display the remaining time
  }

  
  

// Start the timer and update the remaining time
startTimer(time) {
  this.remainingTime = time; // Set the remaining time

  const startTime = Date.now();
  const countdown = () => {
    const elapsedTime = Date.now() - startTime;
    const remainingTime = Math.max(0, this.remainingTime - Math.floor(elapsedTime / 1000));
    this.timer.innerText = remainingTime;
    if (remainingTime === 0) {
      this.gameover();
    } else {
      requestAnimationFrame(countdown);
    }
  };
  requestAnimationFrame(countdown);
}


  // Hide all cards by removing visible and matched classes
  hideCards() {
    this.cards.forEach((card) => {
      card.classList.remove("matched");
      card.classList.remove("visible");
    });
  }

  // Shuffle the order of the cards using the Fisher-Yates algorithm
  shuffleCards() {
    for (let i = this.cards.length - 1; i > 0; i--) {
      let randIdx = Math.floor(Math.random() * (i + 1));
      this.cards[i].style.order = randIdx;
      this.cards[randIdx].style.order = i;
    }
  }

  // Flip a card when clicked
  flipCard(card) {
    if (this.canFlipCard(card)) {
      this.audioController.flip(); // Play flip sound
      this.flips.innerText = ++this.flipsCounter; // Increase flip counter

      card.classList.add("visible"); // Show the front face of the card

      if (!this.cardToCheck) this.cardToCheck = card;
      else this.checkIfMatching(card);
    }
  }

  // Check if a card can be flipped
  canFlipCard(card) {
    return (
      !this.busy &&
      !this.matchedCards.includes(card) &&
      card !== this.cardToCheck
    );
  }

  // Check if the flipped cards match
  checkIfMatching(card) {
    if (this.getCardType(card) === this.getCardType(this.cardToCheck))
      this.cardsMatch(card, this.cardToCheck); // Matched cards
    else this.cardsMisMatch(card, this.cardToCheck); // Mis-matched cards

    this.cardToCheck = null; // Reset the card to check
  }

  // Actions to perform when cards match
  cardsMatch(card1, card2) {
    this.matchedCards.push(card1); // Add matched cards to the array
    this.matchedCards.push(card2);


    card1.classList.add("matched"); // Add the matched class to the cards
    card2.classList.add("matched");

    this.audioController.match(); // Play the match sound

    if (this.matchedCards.length === this.cards.length) this.victory(); // If all cards are matched, trigger victory
  }

  // Actions to perform when cards do not match
  cardsMisMatch(card1, card2) {
    this.busy = true; // Set the game as busy

    setTimeout(() => {
      card1.classList.remove("visible"); // Hide the front face of the cards
      card2.classList.remove("visible");
      this.busy = false; // Set the game as not busy
    }, 1000);
  }

  // Get the card type based on the image source
  getCardType(card) {
    return card.getElementsByClassName("back-face")[0].firstElementChild.src;
  }

  // Actions to perform when the player wins the game
  victory() {
    clearInterval(this.countDown); // Stop the timer
    this.audioController.victory(); // Play the victory sound
    doc.getElementById("victory").classList.add("visible"); // Show the victory message
    doc.getElementById("victory").style.animation =
      "overlay-show 1s linear forwards";
    
      let randIdx = Math.floor(Math.random() * 2);

      if (randIdx === 0)
        this.audioController.victorySound = this.victorySound = new Audio(
          "Assets/Audios/victory.wav"
        );
      else if (randIdx === 1)
        this.audioController.victorySound = this.victorySound = new Audio(
          "Assets/Audios/victory2.wav"
        );

    if (gameDifficulty === 'easy'){
      this.easyWins++;
      doc.getElementById("easyWins").innerText = this.easyWins; // Update the easy wins elemnt in the HTML
      if (this.flipsCounter < this.bestEasyFlipsRecord) {
        this.bestEasyFlipsRecord = this.flipsCounter; // Update the best easy record if the current game has fewer flips
        doc.getElementById("bestEasyFlipsRecord").innerText = this.bestEasyFlipsRecord; // Update the best easy record element in the HTML
      }
    }  
    else if (gameDifficulty === 'normal'){
      this.normalWins++;
      doc.getElementById("normalWins").innerText = this.normalWins; // Update the normal wins elemnt in the HTML
      if (this.flipsCounter < this.bestNormalFlipsRecord) {
        this.bestNormalFlipsRecord = this.flipsCounter; // Update the best easy record if the current game has fewer flips
        doc.getElementById("bestNormalFlipsRecord").innerText = this.bestNormalFlipsRecord; // Update the best normal record element in the HTML
      }
    }  
    else if (gameDifficulty === 'hard'){
      this.hardWins++;
      doc.getElementById("hardWins").innerText = this.hardWins; // Update the hard wins elemnt in the HTML
      if (this.flipsCounter < this.bestHardFlipsRecord) {
        this.bestHardFlipsRecord = this.flipsCounter; // Update the best easy record if the current game has fewer flips
        doc.getElementById("bestHardFlipsRecord").innerText = this.bestHardFlipsRecord; // Update the best hard record element in the HTML
      }
    }  
  }

  // Actions to perform when the player loses the game
  gameover() {
    clearInterval(this.countDown); // Stop the timer
    this.audioController.gameover(); // Play the game over sound
    doc.getElementById("gameover").classList.add("visible"); // Show the game over message
    doc.getElementById("gameover").style.animation =
      "overlay-show 1s linear forwards";

    let randIdx = Math.floor(Math.random() * 3);

    if (randIdx === 0)
      this.audioController.gameOverSound = this.gameOverSound = new Audio(
        "Assets/Audios/gameover1.wav"
      );
    else if (randIdx === 1)
      this.audioController.gameOverSound = this.gameOverSound = new Audio(
        "Assets/Audios/gameover2.wav"
      );
    else if (randIdx === 2)
      this.audioController.gameOverSound = this.gameOverSound = new Audio(
        "Assets/Audios/gameover3.wav"
      );
  }
}

// Function to start the game when the DOM is loaded
function startLoading() {
    // Difficulty buttons
    const easyBtn = document.getElementById('easy-btn');
    const normalBtn = document.getElementById('normal-btn');
    const hardBtn = document.getElementById('hard-btn');
  
    let overlays = Array.from(doc.getElementsByClassName("overlay-text"));
    let cards = Array.from(doc.getElementsByClassName("game-card"));
    let game = new FlipOrQuit(60, cards); // Create a new instance of FlipOrQuit
  
    overlays.forEach((overlay) => {
      overlay.onclick = () => {
        overlay.style.animation = "overlay-hide 1s linear forwards";
        game.startGame(60); // Start the game when an overlay is clicked
      };
    });
  
    cards.forEach((card) => {
      card.onclick = () => {
        game.flipCard(card); // Flip a card when clicked
      };
    });
  
    // Event listeners for difficulty buttons
    easyBtn.addEventListener('click', () => {
      easyBtn.classList.add('highlighted');
      normalBtn.classList.remove('highlighted');
      hardBtn.classList.remove('highlighted');
      this.startGame(90); // Start the game with easy difficulty (90 seconds)
      this.resetTimers();
      gameDifficulty = 'easy';
    });
    
    normalBtn.addEventListener('click', () => {
      easyBtn.classList.remove('highlighted');
      normalBtn.classList.add('highlighted');
      hardBtn.classList.remove('highlighted');
      game.startGame(60); // Start the game with normal difficulty (60 seconds)
      this.resetTimers();
      gameDifficulty = 'normal';
    });
    
    hardBtn.addEventListener('click', () => {
      easyBtn.classList.remove('highlighted');
      normalBtn.classList.remove('highlighted');
      hardBtn.classList.add('highlighted');
      game.startGame(45); // Start the game with hard difficulty (45 seconds)
      this.resetTimers();
      gameDifficulty = 'hard';
    });
    
  }
  
  // Check if the DOM is already loaded, if not, wait for it to load
  if (doc.readyState === "loading") {
    doc.addEventListener("DOMContentLoaded", startLoading());
  } else {
    startLoading();
}

