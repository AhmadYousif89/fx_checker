import * as React from 'react'
import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'
import { Slot } from 'radix-ui'

import { cn } from '#/lib/utils.ts'

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-8 font-medium whitespace-nowrap transition-all outline-none focus-visible:ring focus-visible:ring-lime focus-visible:ring-offset-2  focus-visible:ring-offset-surface disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 cursor-pointer select-none",
  {
    variants: {
      variant: {
        default:
          'bg-surface-500 border border-surface-400 hover:bg-surface-400 active:bg-surface-400',
        outline:
          'border border-accent bg-transparent shadow-xs hover:bg-lime-800 disabled:border active:bg-lime-800',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        destructive:
          'bg-red text-red-foreground hover:bg-red/90 active:bg-red/90 focus-visible:ring-red',
      },
      size: {
        default: 'h-10 px-4 py-2 has-[>svg]:px-3',
        xs: "h-6 gap-1 px-2 has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: 'h-8 gap-1.5 px-3 has-[>svg]:px-2.5',
        lg: 'h-10 px-6 has-[>svg]:px-4',
        icon: 'size-9',
        'icon-xs': "size-6 [&_svg:not([class*='size-'])]:size-3",
        'icon-sm': 'size-8',
        'icon-lg': 'size-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({
  className,
  variant = 'default',
  size = 'default',
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : 'button'

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
