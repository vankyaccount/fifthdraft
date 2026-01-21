import Link from 'next/link'

interface LogoProps {
  href?: string
  showText?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export default function Logo({ href = '/', showText = true, size = 'md' }: LogoProps) {
  const sizes = {
    sm: { icon: 'w-8 h-8', text: 'text-xl', dot: 'w-2 h-2' },
    md: { icon: 'w-10 h-10', text: 'text-2xl', dot: 'w-3 h-3' },
    lg: { icon: 'w-12 h-12', text: 'text-3xl', dot: 'w-4 h-4' }
  }

  const sizeClasses = sizes[size]

  return (
    <Link href={href} className="flex items-center space-x-2">
      <div className="relative">
        <div className={`${sizeClasses.icon} bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-lg flex items-center justify-center shadow-lg transform rotate-3`}>
          <span className={`text-white font-bold ${size === 'sm' ? 'text-lg' : size === 'md' ? 'text-xl' : 'text-2xl'} transform -rotate-3`}>5</span>
        </div>
        <div className={`absolute -top-1 -right-1 ${sizeClasses.dot} bg-yellow-400 rounded-full animate-pulse`}></div>
      </div>
      {showText && (
        <span className={`${sizeClasses.text} font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent`}>
          FifthDraft
        </span>
      )}
    </Link>
  )
}
