"use client"

import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"
import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

type Props = {
  state: "idle" | "loading" | "error" | "result"
  error: string | null
  result: number | null
  canPredict: boolean
  onPredict: () => void
  headerIcon?: ReactNode
  idleIcon?: ReactNode
  errorIcon?: ReactNode
}

export default function PredictionCard({
  state,
  error,
  result,
  canPredict,
  onPredict,
  headerIcon,
  idleIcon,
  errorIcon,
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="rounded-xl border border-gray-700 bg-gradient-to-b from-gray-900 to-gray-800 p-5"
    >
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {headerIcon}
          <h2 className="text-lg font-semibold">Yield Prediction</h2>
        </div>
      </div>

      {/* Dynamic content area */}
      <div className="min-h-60 flex items-center justify-center rounded-lg bg-gray-900/40 p-6">
        {state === "idle" && (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-3 text-center"
          >
            {idleIcon}
            <p className="text-gray-500">Awaiting data for yield prediction...</p>
          </motion.div>
        )}

        {state === "loading" && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-3"
          >
            <Loader2 className="h-8 w-8 animate-spin text-green-500" aria-hidden />
            <p className="font-medium text-green-500">Analyzing with Fusion AI...</p>
          </motion.div>
        )}

        {state === "error" && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-3 text-center"
          >
            {errorIcon}
            <p className="font-semibold text-red-400">{error}</p>
          </motion.div>
        )}

        {state === "result" && (
          <motion.div
            key="result"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-1 text-center"
          >
            <p className="text-sm text-gray-400">Predicted Yield</p>
            <p className="text-5xl font-extrabold text-green-400 drop-shadow-[0_0_6px_rgba(16,185,129,0.35)]">
              {result}
            </p>
            <p className="text-white">kg / hectare</p>
          </motion.div>
        )}
      </div>

      {/* Action */}
      <div className="mt-5">
        <button
          type="button"
          onClick={() => onPredict()}
          disabled={!canPredict || state === "loading"}
          className={cn(
            "w-full rounded-md px-4 py-2 font-semibold transition-colors",
            "bg-green-600 text-white hover:bg-green-700",
            "disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed",
          )}
        >
          Predict Yield
        </button>
      </div>
    </motion.div>
  )
}
