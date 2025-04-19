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
const MAX_PROGRESS = 10

export default function MoneyGuessGame() {
    // Total value of displayed coins in cents
    const [totalValue, setTotalValue] = useState(0)
    // Coins to display
    const [displayedCoins, setDisplayedCoins] = useState<Array<{ id: number; type: (typeof COINS)[number] }>>([])
    // User's guess
    const [userGuess, setUserGuess] = useState("")
    // Game state
    const [gameState, setGameState] = useState<"playing" | "correct" | "incorrect">("playing")
    // Counter for unique IDs
    const [idCounter, setIdCounter] = useState(0)
    // Feedback message
    const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null)
    // Game score and progress
    const [progress, setProgress] = useState(0)
    // Track attempts for current round
    const [attempts, setAttempts] = useState(0)

    // Initialize or reset the game
    const resetGame = () => {
        // Clear previous state
        setDisplayedCoins([])
        setUserGuess("")
        setGameState("playing")
        setFeedbackMessage(null)
        setAttempts(0)
        
        // Generate a random set of coins with total value between 1-100 cents
        const coins: Array<{ id: number; type: (typeof COINS)[number] }> = []
        let newValue = 0
        let newIdCounter = idCounter
        
        // Ensure we have at least one coin but not too many
        const targetNumCoins = Math.floor(Math.random() * 5) + 1 // 1 to 5 coins
        
        for (let i = 0; i < targetNumCoins; i++) {
            const randomCoinIndex = Math.floor(Math.random() * COINS.length)
            const selectedCoin = COINS[randomCoinIndex]
            
            // Only add the coin if it won't push us over 100 cents
            if (newValue + selectedCoin.value <= 100) {
                coins.push({
                    id: newIdCounter++,
                    type: selectedCoin
                })
                newValue += selectedCoin.value
            }
        }
        
        // If we somehow got no coins, add a penny
        if (coins.length === 0) {
            coins.push({
                id: newIdCounter++,
                type: COINS[0] // penny
            })
            newValue = 1
        }
        
        setDisplayedCoins(coins)
        setTotalValue(newValue)
        setIdCounter(newIdCounter)
    }

    // Initialize game on first load
    useEffect(() => {
        resetGame()
    }, [])

    // Reset game after showing the result
    useEffect(() => {
        if (gameState === "correct") {
            const timer = setTimeout(() => {
                resetGame()
            }, 2000)
            return () => clearTimeout(timer)
        } else if (gameState === "incorrect") {
            const timer = setTimeout(() => {
                setGameState("playing")
                setFeedbackMessage(null)
            }, 2000)
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

    // Handle number pad input
    const handleNumberPress = (num: string) => {
        if (gameState !== "playing") return;
        
        if (userGuess.length < 3) { // Limit to 3 digits (up to 100 cents)
            setUserGuess(userGuess + num);
        }
    }

    // Handle backspace
    const handleBackspace = () => {
        if (gameState !== "playing") return;
        setUserGuess(userGuess.slice(0, -1));
    }

    // Check the user's answer
    const checkAnswer = () => {
        if (!userGuess || gameState !== "playing") return;
        
        const guess = parseInt(userGuess);
        setAttempts(attempts + 1);
        
        if (guess === totalValue) {
            setGameState("correct");
            setFeedbackMessage(`Correct! That's ${formatMoney(totalValue)}`);
            setProgress(progress + 1);
        } else {
            setGameState("incorrect");
            
            if (attempts >= 2) {
                setFeedbackMessage(`The correct answer is ${formatMoney(totalValue)}`);
            } else if (guess > totalValue) {
                setFeedbackMessage("Too high! Try again.");
            } else {
                setFeedbackMessage("Too low! Try again.");
            }
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
        <div className="max-w-5xl safe-area min-h-screen mx-auto flex flex-col gap-4 p-4 relative">
            {/* Feedback message */}
            {feedbackMessage && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 absolute m-4 text-center inset-x-0 top-0 rounded-lg border-2 ${
                        gameState === "correct" 
                            ? "bg-green-100 border-green-500 text-green-700" 
                            : "bg-amber-100 border-amber-500 text-amber-700"
                    }`}
                >
                    <p className="font-medium">{feedbackMessage}</p>
                </motion.div>
            )}

            {/* Progress bar */}
            <div className="flex justify-between items-center">
                <div className="w-[100%] bg-white rounded-full shadow-lg h-4 overflow-hidden">
                    <motion.div
                        className="bg-gradient-to-r from-green-400 to-blue-500 h-full"
                        initial={{ width: "0%" }}
                        animate={{ width: `${(progress / MAX_PROGRESS) * 100}%` }}
                        transition={{ duration: 0.5 }}
                    />
                </div>
            </div>

            {/* Instruction */}
            <div className="text-center mb-2">
                <p className="text-lg text-gray-700 font-medium">How much money is shown?</p>
            </div>

            {/* Coin display area */}
            <div className="flex-1 bg-blue-100 rounded-lg p-6 border-4 border-blue-300 min-h-[200px] flex items-center justify-center">
                <div className="flex flex-wrap justify-center items-center gap-2">
                    {displayedCoins.map((coin) => (
                        <motion.div
                            key={coin.id}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="coin-display"
                        >
                            <CoinImage type={coin.type} sizeMultiplier={1} />
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* User input display */}
            <div className="bg-white rounded-lg p-4 border-2 border-gray-300 text-center">
                <span className="text-5xl font-bold text-gray-800">
                    {userGuess ? `${userGuess}¢` : "_ _"}
                </span>
            </div>

            {/* Number pad */}
            <div className="bg-gray-100 rounded-lg p-4 border-2 border-gray-300">
                <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                        <Button
                            key={num}
                            onClick={() => handleNumberPress(num.toString())}
                            className="bg-white hover:bg-gray-200 text-gray-800 text-2xl py-6 rounded-lg shadow"
                        >
                            {num}
                        </Button>
                    ))}
                    <Button
                        onClick={() => handleBackspace()}
                        className="bg-amber-500 hover:bg-amber-600 text-white text-xl py-6 rounded-lg shadow"
                    >
                        ⌫
                    </Button>
                    <Button
                        onClick={() => handleNumberPress("0")}
                        className="bg-white hover:bg-gray-200 text-gray-800 text-2xl py-6 rounded-lg shadow"
                    >
                        0
                    </Button>
                    <Button
                        onClick={checkAnswer}
                        className="bg-green-500 hover:bg-green-600 text-white text-xl py-6 rounded-lg shadow"
                    >
                        ✓
                    </Button>
                </div>
            </div>
        </div>
    )
}

// Component to render coin images
function CoinImage({ type, sizeMultiplier = 1 }: { type: (typeof COINS)[number]; sizeMultiplier?: number }) {
    return (
        <div className="flex items-center justify-center">
            <img 
                src={type.image} 
                alt={type.name} 
                width={type.size * sizeMultiplier} 
                height={type.size * sizeMultiplier} 
                className="rounded-full" 
            />
        </div>
    )
}
