"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import confetti from 'canvas-confetti'

// Coin values in cents
const COINS = [
  { name: "penny", value: 1, size: 90, image: "/penny-front.svg" },
  { name: "nickel", value: 5, size: 100, image: "/nickel-front.svg" },
  { name: "dime", value: 10, size: 80, image: "/dime-front.svg" },
  { name: "quarter", value: 25, size: 110, image: "/quarter-front.svg" },
]

// Number of correct answers needed to fill progress bar
const MAX_PROGRESS = 5

export default function CoinGame() {
  // Target amount in cents (1-100)
  const [targetAmount, setTargetAmount] = useState(0)
  // Selected coins with unique IDs
  const [selectedCoins, setSelectedCoins] = useState<Array<{ id: number; type: (typeof COINS)[number] }>>([])
  // Game state
  const [gameState, setGameState] = useState<"playing" | "correct" | "incorrect">("playing")
  // Counter for unique IDs
  const [idCounter, setIdCounter] = useState(0)
  // Error message
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  // Game score and progress
  const [score, setScore] = useState(0)
  const [progress, setProgress] = useState(0)

  // Initialize or reset the game
  const resetGame = () => {
    // Random amount between 1 and 100 cents
    const newAmount = Math.floor(Math.random() * 100) + 1
    setTargetAmount(newAmount)
    setSelectedCoins([])
    setGameState("playing")
    setErrorMessage(null)
  }

  // Initialize game on first load
  useEffect(() => {
    resetGame()
  }, [])

  // Reset game after 5 seconds of displaying the result
  useEffect(() => {
    if (gameState === "correct" || gameState === "incorrect") {
      const timer = setTimeout(() => {
        resetGame()
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [gameState])

  // Effect to handle confetti when progress is complete
  useEffect(() => {
    if (progress >= MAX_PROGRESS) {
      // Fire confetti
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
      
      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min;
      }
      
      const interval: any = setInterval(() => {
        const timeLeft = animationEnd - Date.now();
        
        if (timeLeft <= 0) {
          return clearInterval(interval);
        }
        
        const particleCount = 50 * (timeLeft / duration);
        
        // since particles fall down, start a bit higher than random
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        });
      }, 250);
      
      // Reset progress after celebration
      setTimeout(() => {
        setProgress(0);
      }, 4000);
    }
  }, [progress]);

  // Add a coin to the pool
  const addCoin = (coinType: (typeof COINS)[number]) => {
    if (gameState === "playing") {
      // Check if adding a penny would exceed the limit
      if (coinType.name === "penny") {
        const pennyCount = selectedCoins.filter(coin => coin.type.name === "penny").length
        
        if (pennyCount >= 4) {
          setErrorMessage("You already have 4 pennies! Use a nickel instead.")
          // Hide the error message after 3 seconds
          setTimeout(() => setErrorMessage(null), 3000)
          return
        }
      }
      if (coinType.name === "nickel") {
        const nickelCount = selectedCoins.filter(coin => coin.type.name === "nickel").length
        if (nickelCount >= 1) {
          setErrorMessage("You already have a nickel! Use a different coin instead.")
          // Hide the error message after 3 seconds
          setTimeout(() => setErrorMessage(null), 3000)
          return
        }
      }
      if (coinType.name === "dime") {
        const dimeCount = selectedCoins.filter(coin => coin.type.name === "dime").length
        if (dimeCount >= 4) {
          setErrorMessage("You already have 4 dimes! Use quarters instead.")
          // Hide the error message after 3 seconds
          setTimeout(() => setErrorMessage(null), 3000)
          return
        }
      }
      
      // Clear any existing error when adding a valid coin
      setErrorMessage(null)
      setSelectedCoins([...selectedCoins, { id: idCounter, type: coinType }])
      setIdCounter(idCounter + 1)
    }
  }

  // Remove a coin from the pool
  const removeCoin = (id: number) => {
    if (gameState === "playing") {
      setSelectedCoins(selectedCoins.filter((coin) => coin.id !== id))
      setErrorMessage(null)
    }
  }

  // Calculate total value of selected coins
  const totalValue = selectedCoins.reduce((sum, coin) => sum + coin.type.value, 0)

  // Check if the answer is correct
  const checkAnswer = () => {
    if (totalValue === targetAmount) {
      setGameState("correct")
      setScore(score + 100)
      setProgress(progress + 1)
    } else {
      setGameState("incorrect")
    }
  }

  // Format cents as dollars and cents
  const formatMoney = (cents: number) => {
    const dollars = Math.floor(cents / 100)
    const remainingCents = cents % 100

    if (dollars > 0) {
      return `$${dollars}.${remainingCents.toString().padStart(2, "0")}`
    } else {
      return `${cents}¢`
    }
  }

  return (
    <div className="flex flex-col items-center justify-between min-h-screen p-4 bg-gradient-to-b from-blue-100 to-purple-100">
      <div className="w-full max-w-xl">
        {/* Header with score and progress */}
        <div className="flex justify-between items-center mb-4">
          <div className="w-[100%] bg-white rounded-full shadow-lg h-4 overflow-hidden">
            <motion.div 
              className="bg-gradient-to-r from-green-400 to-blue-500 h-full"
              initial={{ width: "0%" }}
              animate={{ width: `${(progress / MAX_PROGRESS) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
        
        {/* Header with target amount */}
        <div className="mb-8 text-center">
          <div className="p-6">
            <p className="text-lg mb-2">Make this amount:</p>
            <p className="text-6xl font-bold text-green-600">{formatMoney(targetAmount)}</p>
          </div>
        </div>

        {/* Coin pool */}
        <div className="bg-blue-200 rounded-lg p-4 min-h-[200px] mb-8 flex flex-wrap justify-center items-center gap-2 border-4 border-blue-400">
          {selectedCoins.length === 0 ? (
            <p className="text-gray-600 italic">Click on coins below to add them here</p>
          ) : (
            selectedCoins.map((coin) => (
              <motion.div
                key={coin.id}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                className="cursor-pointer"
                onClick={() => removeCoin(coin.id)}
              >
                <CoinImage type={coin.type} />
              </motion.div>
            ))
          )}
        </div>

        {/* Game status and controls */}
        <div className="mb-8 text-center">
          {/* <p className="text-xl mb-2">
            Current total: <span className="font-bold text-blue-700">{formatMoney(totalValue)}</span>
          </p> */}

          {/* Error message */}
          {errorMessage && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-100 p-3 rounded-lg border-2 border-red-500 mb-4"
            >
              <p className="text-red-700 font-medium">{errorMessage}</p>
            </motion.div>
          )}

          {gameState === "correct" && (
            <div className="bg-green-100 p-4 rounded-lg border-2 border-green-500 mb-4">
              <p className="text-green-700 text-xl font-bold">🎉 Correct! Great job! 🎉</p>
            </div>
          )}

          {gameState === "incorrect" && (
            <div className="bg-red-100 p-4 rounded-lg border-2 border-red-500 mb-4">
              <p className="text-red-700 text-xl font-bold">Wrong! You needed {formatMoney(Math.abs(targetAmount - totalValue))} {targetAmount > totalValue ? "more" : "less"}.</p>
            </div>
          )}

          <div className="flex justify-center gap-4">
            {gameState === "playing" && (
              <Button
                onClick={checkAnswer}
                className="bg-green-500 hover:bg-green-600 text-white px-8 py-2 rounded-full text-lg"
              >
                Check Answer
              </Button>
            )}
          </div>
        </div>

        {/* Available coins */}
        <div className="bg-yellow-100 rounded-lg p-4 border-4 border-yellow-300">
          <p className="text-center mb-4 font-bold text-yellow-800">Click to add coins:</p>
          <div className="flex justify-center gap-6 flex-wrap">
            {COINS.map((coin) => (
              <div
                key={coin.name}
                className="flex flex-col items-center cursor-pointer hover:scale-110 transition-transform"
                onClick={() => addCoin(coin)}
              >
                <CoinImage type={coin} />
                <p className="mt-2 text-sm font-medium">{coin.name}</p>
                <p className="text-xs text-gray-600">{coin.value}¢</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Component to render coin images
function CoinImage({ type }: { type: (typeof COINS)[number]; }) {
  return (
    <div className="flex items-center justify-center size-[110px]">
      <img src={type.image} alt={type.name} width={type.size} height={type.size} className="rounded-full transition-transform hover:scale-105" />
    </div>
  )
}
