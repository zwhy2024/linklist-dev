'use client'

import cn from 'classnames'
import { X } from 'lucide-react'

interface Props {
  title?: string
  visible: boolean
  fullScreen?: boolean
  onClose?: () => void
}
export const Modal: React.FC<React.PropsWithChildren<Props>> = (props) => {
  const { title, visible, fullScreen = false, children, onClose } = props
  return (
    <div className="touch-none">
      <div
        style={
          visible
            ? {
                visibility: 'visible',
                opacity: 1,
                transition: 'opacity 200ms linear',
              }
            : {
                visibility: 'hidden',
                opacity: 0,
                transition: 'visibility 0s 200ms, opacity 200ms linear',
              }
        }
        className="w-full h-full fixed top-0 left-0 bg-black/80 z-50"
      >
        <div
          className={cn(
            'fixed bg-white rounded-lg overflow-hidden md:w-[450px] z-[100] md:top-[50%] md:left-[50%] md:-translate-x-[50%] md:-translate-y-[50%] shadow-sm max-md:w-full max-md:bottom-[env(safe-area-inset-bottom)] max-md:rounded-b-none',
            fullScreen && 'h-screen border-none rounded-none top-0'
          )}
        >
          <header className="px-8 py-4 border-b flex justify-between items-center">
            <div className="text-base font-semibold">{title ?? 'Title'}</div>
            <X onClick={onClose} cursor="pointer" color="var(--grey-color)" />
          </header>
          <div className="p-8 relative">{children}</div>
        </div>
      </div>
    </div>
  )
}
