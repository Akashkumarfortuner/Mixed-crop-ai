"use client"

import { motion } from "framer-motion"
import type { ReactNode } from "react"

type Props = {
  value: {
    crop: string
    n: number
    p: number
    k: number
    oc: number
    tricho: number
  }
  onChange: (v: Props["value"]) => void
  icon?: ReactNode
}

export default function SoilFormCard({ value, onChange, icon }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-xl border border-gray-700 bg-gray-800/90 p-5"
    >
      <div className="mb-4 flex items-center gap-2">
        {icon}
        <h2 className="text-lg font-semibold">Soil & Microbial Data</h2>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Primary Crop */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-gray-400" htmlFor="crop">
            Primary Crop
          </label>
          <select
            id="crop"
            value={value.crop}
            onChange={(e) => onChange({ ...value, crop: e.target.value })}
            className="w-full rounded-md bg-gray-700 text-gray-200 px-3 py-2 outline-none focus:ring-2 focus:ring-green-500 border border-gray-600"
          >
            <option>Banana</option>
            <option>Arecanut</option>
            <option>Black Pepper</option>
          </select>
        </div>

        {[
          { id: "n", label: "Nitrogen (kg/ha)", step: "1" },
          { id: "p", label: "Phosphorus (kg/ha)", step: "1" },
          { id: "k", label: "Potassium (kg/ha)", step: "1" },
          { id: "oc", label: "Organic Carbon (%)", step: "0.1" },
          { id: "tricho", label: "Trichoderma (cfu/g)", step: "1" },
        ].map((f) => (
          <div key={f.id} className="flex flex-col gap-1.5">
            <label className="text-sm text-gray-400" htmlFor={f.id}>
              {f.label}
            </label>
            <input
              id={f.id}
              type="number"
              step={f.step}
              value={(value as any)[f.id]}
              onChange={(e) =>
                onChange({
                  ...value,
                  [f.id]: Number(e.target.value),
                })
              }
              className="w-full rounded-md bg-gray-700 text-gray-200 px-3 py-2 outline-none focus:ring-2 focus:ring-green-500 border border-gray-600"
            />
          </div>
        ))}
      </div>
    </motion.div>
  )
}
