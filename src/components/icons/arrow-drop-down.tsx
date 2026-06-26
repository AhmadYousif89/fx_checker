import { cn } from '#/lib/utils'

export const ArrowDropDown = ({
  className,
  ...props
}: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      width="7"
      height="4"
      viewBox="0 0 7 4"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('size-fit', className)}
      {...props}
    >
      <path d="M0.472271 0H6.49571C6.91758 0 7.12852 0.515625 6.82383 0.820312L3.82383 3.82031C3.63633 4.00781 3.33165 4.00781 3.14415 3.82031L0.144146 0.820312C-0.160541 0.515625 0.0503963 0 0.472271 0Z" />
    </svg>
  )
}
