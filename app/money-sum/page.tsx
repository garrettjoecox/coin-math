"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import confetti from 'canvas-confetti'

// Coin values in cents
const COINS = [
    { name: "penny", value: 1, size: 90, max: 4, image: "/penny-front.svg" },
    { name: "nickel", value: 5, size: 100, max: 1, image: "/nickel-front.svg" },
    { name: "dime", value: 10, size: 80, max: 2, image: "/dime-front.svg" },
    { name: "quarter", value: 25, size: 110, max: 3, image: "/quarter-front.svg" },
]

// Number of correct answers needed to fill progress bar
const MAX_PROGRESS = 10

export default function CoinGame() {
    // Target amount in cents (1-100)
    const [targetAmount, setTargetAmount] = useState(0)
    // Selected coins with unique IDs
    const [selectedCoins, setSelectedCoins] = useState<Array<{ id: number; type: (typeof COINS)[number] }>>([])
    // Game state
    const [gameState, setGameState] = useState<"playing" | "correct">("playing")
    // Counter for unique IDs
    const [idCounter, setIdCounter] = useState(0)
    // Error message
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    // Game score and progress
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
        if (gameState === "correct") {
            const timer = setTimeout(() => {
                resetGame()
            }, 3000)
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
            const coinCount = selectedCoins.filter(coin => coin.type.name === coinType.name).length;

            if (coinCount >= coinType.max) {
                setErrorMessage(`Try something else!`);
                return
            }

            // Clear any existing error when adding a valid coin
            setErrorMessage(null)
            setSelectedCoins([...selectedCoins, { id: idCounter, type: coinType }])
            setIdCounter(idCounter + 1)
        }
    }

    // Hide the error message after 3 seconds
    useEffect(() => {
        if (errorMessage) {
            const timer = setTimeout(() => {
                setErrorMessage(null)
            }, 3000)
            return () => clearTimeout(timer)
        }
    }, [errorMessage])

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
            setProgress(progress + 1)
        } else {
            setErrorMessage(`Wrong! You have ${formatMoney(totalValue)}, try again.`)
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
            {/* Error message */}
            {errorMessage && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-100 p-34 absolute m-4 p-4 text-center inset-x-0 top-0 rounded-lg border-2 border-red-500"
                >
                    <p className="text-red-700 font-medium">{errorMessage}</p>
                </motion.div>
            )}

            {/* Header */}
            <div className="flex flex-col gap-4">
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
                <div className="text-center">
                    <p className="text-6xl font-bold text-green-600">{formatMoney(targetAmount)}</p>
                </div>
            </div>

            {/* Coin pool */}
            <div className="flex-1 bg-blue-200 rounded-lg p-4 border-4 border-blue-400 overflow-scroll">
                <div className="flex flex-wrap justify-center items-center">
                    {selectedCoins.length === 0 ? (
                        <p className="p-4 text-gray-500 italic">Click on coins below to add them here</p>
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
                                <CoinImage type={coin.type} sizeMultiplier={0.6} />
                            </motion.div>
                        ))
                    )}
                </div>
            </div>

            {/* Footer */}
            <div className="flex flex-col gap-4">
                {gameState === "correct" ? (
                    <div className="bg-green-100 p-4 rounded-lg border-2 border-green-500 flex justify-center">
                        <p className="text-green-700 text-xl font-bold">🎉 Correct! Great job! 🎉</p>
                    </div>
                ) : (
                    <div className="flex justify-center">
                        <Button
                            onClick={checkAnswer}
                            className="bg-green-500 hover:bg-green-600 text-white px-8 py-2 rounded-full text-lg"
                        >
                            Check Answer
                        </Button>
                    </div>
                )}

                <div className="bg-yellow-100 rounded-lg p-4 border-4 border-yellow-300">
                    <div className="flex justify-center gap-4 flex-wrap">
                        {COINS.map((coin) => (
                            <div
                                key={coin.name}
                                className="flex flex-col items-center cursor-pointer hover:scale-110 transition-transform"
                                onClick={() => addCoin(coin)}
                            >
                                <CoinImage type={coin} sizeMultiplier={0.6} />
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
function CoinImage({ type, sizeMultiplier = 1 }: { type: (typeof COINS)[number]; sizeMultiplier?: number }) {
    return (
        <div className={`flex items-center justify-center size-[60px]`}>
            <img src={type.image} alt={type.name} width={type.size * sizeMultiplier} height={type.size * sizeMultiplier} className="rounded-full transition-transform hover:scale-105" />
        </div>
    )
}
