interface Props { className?: string }

export function LocataireSkeleton({ className = '' }: Props) {
  return (
    <div className={`rounded-lg ${className}`}
         style={{ background: 'linear-gradient(90deg,#D1FAE5 25%,#ECFDF5 50%,#D1FAE5 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
  )
}
