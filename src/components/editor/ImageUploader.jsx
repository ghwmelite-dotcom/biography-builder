import { useCallback, useRef, useState } from 'react'
import { Upload, X, Image as ImageIcon } from 'lucide-react'

export default function ImageUploader({ value, onChange, label = 'Upload Photo', className = '', aspectRatio = '3/4' }) {
  const inputRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleFile = useCallback((file) => {
    if (!file || !file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = (e) => onChange(e.target.result)
    reader.readAsDataURL(file)
  }, [onChange])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    handleFile(file)
  }, [handleFile])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  return (
    <div className={className}>
      {value ? (
        <div className="relative group" style={{ aspectRatio }}>
          <img
            src={value}
            alt="Uploaded"
            className="w-full h-full object-cover rounded-lg border border-zinc-700"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-content-center gap-2">
            <button
              onClick={() => inputRef.current?.click()}
              className="absolute bottom-2 left-2 px-3 py-1.5 bg-zinc-800 text-zinc-300 text-xs rounded-md hover:bg-zinc-700 transition-colors"
            >
              Change
            </button>
            <button
              onClick={() => onChange(null)}
              className="absolute top-2 right-2 p-1.5 bg-red-900/80 text-red-300 rounded-full hover:bg-red-800 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => inputRef.current?.click()}
          className={`
            flex flex-col items-center justify-center gap-2 p-6 rounded-lg border-2 border-dashed cursor-pointer transition-colors
            ${isDragging
              ? 'border-amber-500 bg-amber-500/10'
              : 'border-zinc-700 bg-zinc-900/50 hover:border-zinc-500 hover:bg-zinc-800/50'
            }
          `}
          style={{ aspectRatio }}
        >
          <Upload size={24} className="text-zinc-500" />
          <span className="text-xs text-zinc-500 text-center">{label}</span>
          <span className="text-[10px] text-zinc-600">Drag & drop or click</span>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={(e) => handleFile(e.target.files[0])}
        className="hidden"
      />
    </div>
  )
}
