import React, { useState, useEffect, useRef } from "react";
import "./TelegramGame.css";
import shootSound from "../sounds/shoot.mp3";

// Main game component
const TelegramGame = () => {
  // Game state
  const [enemyHP, setEnemyHP] = useState(100);
  const [playerState, setPlayerState] = useState("idle");
  const [isEnemyHurt, setIsEnemyHurt] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // References for animation timers
  const shootTimerRef = useRef(null);
  const damageTimerRef = useRef(null);

  // Audio references
  const shootSoundRef = useRef(null);

  // Initialize sound on component mount
  useEffect(() => {
    // Create audio with the imported sound file
    const audioElement = new Audio(shootSound);
    shootSoundRef.current = audioElement;

    return () => {
      if (shootSoundRef.current) {
        shootSoundRef.current.pause();
        shootSoundRef.current = null;
      }
    };
  }, []);

  // Handle shooting action
  const handleShoot = () => {
    if (playerState === "shooting" || gameOver) return;

    // Play sound only if enabled
    if (soundEnabled && shootSoundRef.current) {
      // Reset audio to beginning
      shootSoundRef.current.currentTime = 0;

      // Play sound with promise handling
      shootSoundRef.current
        .play()
        .then(() => console.log("Sound played successfully"))
        .catch((error) => console.error("Error playing sound:", error));
    }

    // Start shooting animation
    setPlayerState("shooting");

    // Deal damage to enemy immediately
    const damage = Math.floor(Math.random() * 15) + 5; // Random damage between 5-20
    const newHP = Math.max(0, enemyHP - damage);
    setEnemyHP(newHP);

    // Start enemy hurt animation simultaneously
    setIsEnemyHurt(true);

    // Clear any existing timers
    if (shootTimerRef.current) clearTimeout(shootTimerRef.current);
    if (damageTimerRef.current) clearTimeout(damageTimerRef.current);

    // Return player to idle state after animation
    shootTimerRef.current = setTimeout(() => {
      setPlayerState("idle");
    }, 500);

    // End enemy hurt animation
    damageTimerRef.current = setTimeout(() => {
      setIsEnemyHurt(false);

      // Check if enemy is defeated
      if (newHP <= 0) {
        setGameOver(true);
      }
    }, 500);
  };

  // Reset game
  const resetGame = () => {
    setEnemyHP(100);
    setPlayerState("idle");
    setIsEnemyHurt(false);
    setGameOver(false);
  };

  // Toggle sound on/off
  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
  };

  // Clean up timers when component unmounts
  useEffect(() => {
    return () => {
      if (shootTimerRef.current) clearTimeout(shootTimerRef.current);
      if (damageTimerRef.current) clearTimeout(damageTimerRef.current);
    };
  }, []);

  // HP bar color based on remaining health
  const getHPBarColor = () => {
    if (enemyHP > 60) return "hp-bar-green";
    if (enemyHP > 30) return "hp-bar-yellow";
    return "hp-bar-red";
  };

  return (
    <div className="game-container">
      {/* Game title */}
      <div className="game-header">
        <h1 className="game-title">Bobrito vs Crocodilo</h1>
        {/* Sound toggle button */}
        <button onClick={toggleSound} className="sound-toggle-button">
          {soundEnabled ? "🔊" : "🔇"}
        </button>
      </div>

      {/* Enemy HP bar */}
      <div className="hp-bar-container">
        <div className="hp-bar-label">
          <span className="hp-bar-text">Crocodilo HP:</span>
          <span>{enemyHP}/100</span>
        </div>
        <div className="hp-bar-background">
          <div
            className={`hp-bar-fill ${getHPBarColor()}`}
            style={{ width: `${enemyHP}%` }}
          ></div>
        </div>
      </div>

      {/* Game arena */}
      <div className="game-arena">
        {/* Enemy character (Crocodilo) */}
        <div className={`enemy-container ${isEnemyHurt ? "enemy-hurt" : ""}`}>
          <div className="character-sprite">
            {isEnemyHurt ? (
              <img
                src="crocodilo_hurt.png"
                alt="Crocodilo Hurt"
                className="character-image"
              />
            ) : (
              <img
                src="crocodilo_idle.png"
                alt="Crocodilo Idle"
                className="character-image"
              />
            )}
            <div className="character-name">Crocodilo Bombardilo</div>
          </div>
        </div>

        {/* Player character (Bobrito) */}
        <div className="player-container">
          <div className="character-sprite">
            {/* Use different sprite images based on state */}
            {playerState === "idle" ? (
              <img
                src="bobrito_idle.png"
                alt="Bobrito Idle"
                className="character-image"
              />
            ) : (
              <img
                src="bobrito_shoot1.png"
                alt="Bobrito Shooting"
                className="character-image"
              />
            )}
            <div className="character-name">Bobrito Gansterito</div>
          </div>
        </div>
      </div>

      {/* Fire button */}
      <div className="button-container">
        <button
          onClick={handleShoot}
          disabled={playerState === "shooting" || gameOver}
          className={`fire-button ${playerState === "shooting" ? "fire-button-active" : ""} ${gameOver ? "fire-button-disabled" : ""}`}
        >
          {playerState === "shooting" ? "BANG!" : "FIRE 🔥"}
        </button>
      </div>

      {/* Game over overlay */}
      {gameOver && (
        <div className="game-over-overlay">
          <div className="game-over-modal">
            <h2 className="game-over-title">Victory!</h2>
            <p className="game-over-text">You defeated Crocodilo Bombardilo!</p>
            <button onClick={resetGame} className="play-again-button">
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TelegramGame;
