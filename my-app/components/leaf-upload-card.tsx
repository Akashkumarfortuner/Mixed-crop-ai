"use client"

import type React from "react"

import { motion } from "framer-motion"
import { UploadCloud } from "lucide-react"
import { type ReactNode, useCallback, useRef } from "react"

type Props = {
  imageUrl: string | null
  onImageChange: (url: string | null) => void
  icon?: ReactNode
}

export default function LeafUploadCard({ imageUrl, onImageChange, icon }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null)

  const onFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return
      const f = files[0]
      if (!/^image\/(png|jpe?g)$/i.test(f.type) || f.size > 10 * 1024 * 1024) {
        // ignore invalid
        return
      }
      const url = URL.createObjectURL(f)
      onImageChange(url)
    },
    [onImageChange],
  )

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    onFiles(e.dataTransfer.files)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.05 }}
      className="rounded-xl border border-gray-700 bg-gray-800/90 p-5"
    >
      <div className="mb-4 flex items-center gap-2">
        {icon}
        <h2 className="text-lg font-semibold">Leaf Image Analysis</h2>
      </div>

      {/* Dropzone / Preview */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        className="rounded-lg border-2 border-dashed border-gray-600 bg-gray-700/50 p-6 transition-colors hover:border-green-500"
      >
        {imageUrl ? (
          <div className="flex items-center justify-center">
            {/* Preview */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl || "/placeholder.svg"}
              alt="Uploaded leaf preview"
              className="h-40 w-40 rounded-lg object-cover"
            />
          </div>
        ) : (
          <button type="button" onClick={() => inputRef.current?.click()} className="w-full">
            <div className="flex flex-col items-center gap-2 text-center">
              <UploadCloud className="h-10 w-10 text-gray-400" aria-hidden />
              <p className="font-medium">Click or drag & drop to upload</p>
              <p className="text-sm text-gray-500">PNG, JPG, JPEG (MAX. 10MB)</p>
            </div>
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpg,image/jpeg"
          className="sr-only"
          onChange={(e) => onFiles(e.target.files)}
        />
      </div>
    </motion.div>
  )
}
