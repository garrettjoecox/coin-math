"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import confetti from 'canvas-confetti'

// Number of correct answers needed to fill progress bar
const MAX_PROGRESS = 10

// Times will be in 5-minute increments
const MINUTE_INCREMENT = 5

export default function ClockGuessGame() {
    // Target time
    const [targetHour, setTargetHour] = useState(0)
    const [targetMinute, setTargetMinute] = useState(0)
    
    // User's guess (now in format "HH:MM" or partial)
    const [userGuess, setUserGuess] = useState("")
    
    // Game state
    const [gameState, setGameState] = useState<"playing" | "correct" | "incorrect">("playing")
    
    // Feedback message
    const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null)
    
    // Game score and progress
    const [progress, setProgress] = useState(0)
    
    // Track attempts for current round
    const [attempts, setAttempts] = useState(0)

    // Initialize or reset the game
    const resetGame = () => {
        // Clear previous state
        setUserGuess("")
        setGameState("playing")
        setFeedbackMessage(null)
        setAttempts(0)
        
        // Generate a random time
        // Hours from 1-12
        const hour = Math.floor(Math.random() * 12) + 1
        
        // Minutes in increments of 5 (0, 5, 10, ..., 55)
        const minute = Math.floor(Math.random() * (60 / MINUTE_INCREMENT)) * MINUTE_INCREMENT
        
        setTargetHour(hour)
        setTargetMinute(minute)
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
        
        // Check if we already have a valid time format
        if (userGuess.includes(":")) {
            const [hours, minutes] = userGuess.split(":");
            
            // If minutes part exists and has less than 2 digits
            if (minutes !== undefined && minutes.length < 2) {
                const newMinutes = minutes + num;
                // Don't allow minutes > 59
                if (parseInt(newMinutes) <= 59) {
                    setUserGuess(`${hours}:${newMinutes}`);
                }
            }
        } else {
            // We're still entering the hours part
            if (userGuess.length < 2) {
                const newHours = userGuess + num;
                // Don't allow hours > 12
                if (parseInt(newHours) <= 12) {
                    setUserGuess(newHours);
                }
            }
        }
    }

    // Handle backspace
    const handleBackspace = () => {
        if (gameState !== "playing") return;
        
        // If there's a colon and only one character after it, remove both
        if (userGuess.includes(":") && userGuess.split(":")[1].length === 1) {
            setUserGuess(userGuess.split(":")[0]);
        } else {
            setUserGuess(userGuess.slice(0, -1));
        }
    }

    // Handle adding the colon
    const handleColon = () => {
        if (gameState !== "playing") return;
        
        // Only add colon if we have hours and don't already have a colon
        if (userGuess.length > 0 && !userGuess.includes(":")) {
            const hours = parseInt(userGuess);
            
            // Validate hour
            if (hours < 1 || hours > 12) {
                setFeedbackMessage("Hours must be between 1 and 12");
                return;
            }
            
            setUserGuess(`${userGuess}:`);
        }
    }

    // Handle submit
    const handleSubmit = () => {
        if (gameState !== "playing") return;
        
        // Check if we have a valid time format
        if (!userGuess.includes(":") || userGuess.endsWith(":")) {
            setFeedbackMessage("Please enter a valid time (HH:MM)");
            return;
        }
        
        checkAnswer();
    }

    // Check the user's answer
    const checkAnswer = () => {
        if (!userGuess || gameState !== "playing") return;
        
        const [hourGuess, minuteGuess] = userGuess.split(":").map(part => parseInt(part));
        
        setAttempts(attempts + 1);
        
        if (hourGuess === targetHour && minuteGuess === targetMinute) {
            setGameState("correct");
            setFeedbackMessage(`Correct! The time is ${formatTime(targetHour, targetMinute)}`);
            setProgress(progress + 1);
        } else {
            setGameState("incorrect");
            
            if (attempts >= 2) {
                setFeedbackMessage(`The correct time is ${formatTime(targetHour, targetMinute)}`);
            } else {
                setFeedbackMessage("That's not right. Try again!");
            }
        }
    }

    // Format time as HH:MM
    const formatTime = (hour: number, minute: number) => {
        return `${hour}:${minute.toString().padStart(2, "0")}`
    }

    // Calculate clock hand angles
    const hourAngle = ((targetHour % 12) / 12) * 360 + (targetMinute / 60) * 30 // Hour hand moves slightly with minutes
    const minuteAngle = (targetMinute / 60) * 360

    // Format the display time with placeholders
    const getDisplayTime = () => {
        if (!userGuess) return "_ _:_ _";
        
        if (!userGuess.includes(":")) {
            return userGuess.padStart(2, '_').replace(/_/g, "_ ") + ":_ _";
        }
        
        const [hours, minutes] = userGuess.split(":");
        const formattedHours = hours.padStart(2, '_').replace(/_/g, "_ ");
        const formattedMinutes = (minutes || "").padEnd(2, '_').replace(/_/g, "_ ");
        
        return `${formattedHours}:${formattedMinutes}`;
    }

    return (
        <div className="flex-1 flex flex-col gap-4 p-4 relative">
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
                <p className="text-lg text-gray-700 font-medium">
                    What time is shown on the clock?
                </p>
                <p className="text-sm text-gray-500">
                    Enter the time in format hour:minutes (example: 3:15)
                </p>
            </div>

            {/* Clock display area */}
            <div className="flex-1 bg-blue-100 rounded-lg p-4 border-4 border-blue-300 min-h-[300px] flex items-center justify-center">
                <div className="relative w-[250px] h-[250px]">
                    {/* Clock face */}
                    <div className="absolute inset-0 rounded-full bg-white border-2 border-gray-800 shadow-lg">
                        {/* Clock numbers */}
                        {[...Array(12)].map((_, i) => {
                            const angle = ((i + 1) / 12) * 2 * Math.PI - Math.PI / 2
                            const x = 110 * Math.cos(angle) + 125
                            const y = 110 * Math.sin(angle) + 125
                            return (
                                <div 
                                    key={i}
                                    className="absolute text-2xl font-bold"
                                    style={{
                                        left: `${x}px`,
                                        top: `${y}px`,
                                        transform: 'translate(-50%, -50%)'
                                    }}
                                >
                                    {i + 1}
                                </div>
                            )
                        })}
                        
                        {/* Hour hand */}
                        <div 
                            className="absolute w-1.5 h-[80px] bg-black rounded-full origin-bottom"
                            style={{
                                left: '50%',
                                bottom: '50%',
                                transform: `translateX(-50%) rotate(${hourAngle}deg)`
                            }}
                        />
                        
                        {/* Minute hand */}
                        <div 
                            className="absolute w-1 h-[100px] bg-black rounded-full origin-bottom"
                            style={{
                                left: '50%',
                                bottom: '50%',
                                transform: `translateX(-50%) rotate(${minuteAngle}deg)`
                            }}
                        />
                        
                        {/* Center dot */}
                        <div className="absolute w-4 h-4 bg-black rounded-full" style={{
                            left: '50%',
                            top: '50%',
                            transform: 'translate(-50%, -50%)'
                        }} />
                    </div>
                </div>
            </div>

            {/* User input display */}
            <div className="bg-white rounded-lg p-4 border-2 border-gray-300 text-center">
                <span className="text-5xl font-bold text-gray-800">
                    {getDisplayTime()}
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
                        onClick={handleBackspace}
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
                        onClick={userGuess.includes(":") ? handleSubmit : handleColon}
                        className="bg-green-500 hover:bg-green-600 text-white text-xl py-6 rounded-lg shadow"
                    >
                        {userGuess.includes(":") ? "✓" : ":"}
                    </Button>
                </div>
            </div>
        </div>
    )
}
