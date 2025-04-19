"use client"

import Link from "next/link"

export default function CoinGame() {
  return (
    <div className="max-w-5xl mx-auto flex flex-wrap justify-center p-4 gap-4">
      <Link href={"/money-sum"}>
        <div className="size-32 bg-gradient-to-r from-green-400 to-blue-500 text-white font-bold text-center flex items-center justify-center rounded-xl shadow-md hover:shadow-lg p-4">
          Money Sum
        </div>
      </Link>
      <Link href={"/money-guess"}>
        <div className="size-32 bg-gradient-to-r from-green-400 to-blue-500 text-white font-bold text-center flex items-center justify-center rounded-xl shadow-md hover:shadow-lg p-4">
          Money Guess
        </div>
      </Link>
      <Link href={"/clock-guess"}>
        <div className="size-32 bg-gradient-to-r from-green-400 to-blue-500 text-white font-bold text-center flex items-center justify-center rounded-xl shadow-md hover:shadow-lg p-4">
          Clock Guess
        </div>
      </Link>
    </div>
  )
}
