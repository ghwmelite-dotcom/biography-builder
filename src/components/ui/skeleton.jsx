export function Skeleton({ className = '', ...props }) {
  return (
    <div
      className={`animate-shimmer bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-800 bg-[length:200%_100%] rounded ${className}`}
      {...props}
    />
  )
}
