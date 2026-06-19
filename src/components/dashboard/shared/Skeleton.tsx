interface Props { className?: string }

export function Skeleton({ className = '' }: Props) {
  return (
    <div className={`rounded-lg ${className}`}
         style={{ background: 'linear-gradient(90deg,#E6EDF4 25%,#F1F5F9 50%,#E6EDF4 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
  )
}
