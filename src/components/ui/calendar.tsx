'use client'

import * as React from 'react'
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from 'lucide-react'
import { DayPicker, getDefaultClassNames } from 'react-day-picker'
import type { DayButton } from 'react-day-picker'

import { cn } from '#/lib/utils.ts'
import { Button, buttonVariants } from '#/components/ui/button.tsx'
import { ArrowDropDown } from '../icons/arrow-drop-down'

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = 'label',
  buttonVariant = 'ghost',
  formatters,
  components,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>['variant']
}) {
  const defaultClassNames = getDefaultClassNames()

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        'group/calendar bg-background p-3 [--cell-size:--spacing(8)] in-data-[slot=card-content]:bg-transparent in-data-[slot=popover-content]:bg-transparent',
        String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
        className,
      )}
      captionLayout={captionLayout}
      formatters={{
        formatMonthDropdown: (date) =>
          date.toLocaleString('default', { month: 'short' }),
        ...formatters,
      }}
      classNames={{
        root: cn('w-fit', defaultClassNames.root),
        months: cn(
          'relative flex flex-col gap-4 md:flex-row',
          defaultClassNames.months,
        ),
        month: cn('flex w-full flex-col gap-4', defaultClassNames.month),
        nav: cn(
          'absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1',
          defaultClassNames.nav,
        ),
        button_previous: cn(
          buttonVariants({ variant: buttonVariant }),
          'size-(--cell-size) p-0 select-none aria-disabled:opacity-50',
          defaultClassNames.button_previous,
        ),
        button_next: cn(
          buttonVariants({ variant: buttonVariant }),
          'size-(--cell-size) p-0 select-none aria-disabled:opacity-50',
          defaultClassNames.button_next,
        ),
        month_caption: cn(
          'flex h-(--cell-size) w-full items-center justify-center px-(--cell-size)',
          defaultClassNames.month_caption,
        ),
        dropdowns: cn(
          'flex h-(--cell-size) w-full items-center justify-center gap-1.5 text-caption',
          defaultClassNames.dropdowns,
        ),
        dropdown_root: cn(
          'relative border hover:border-accent rounded-6 shadow-xs has-focus:border-accent has-focus:ring has-focus:ring-accent has-focus:outline-0 has-focus:ring-offset-2 has-focus:ring-offset-background',
          defaultClassNames.dropdown_root,
        ),
        dropdown: cn(
          'absolute inset-0 bg-popover opacity-0',
          defaultClassNames.dropdown,
        ),
        caption_label: cn(
          'font-medium select-none',
          captionLayout === 'label'
            ? 'text-caption'
            : 'flex h-8 items-center gap-1 pr-1 pl-2 text-caption [&>svg]:size-3.5 [&>svg]:text-muted',
          defaultClassNames.caption_label,
        ),
        month_grid: cn('w-full border-collapse', defaultClassNames.month_grid),
        weekdays: cn('flex', defaultClassNames.weekdays),
        weekday: cn(
          'flex-1 text-overline text-muted select-none',
          defaultClassNames.weekday,
        ),
        week: cn('mt-2 flex w-full', defaultClassNames.week),
        week_number_header: cn(
          'w-(--cell-size) select-none',
          defaultClassNames.week_number_header,
        ),
        week_number: cn('select-none', defaultClassNames.week_number),
        day: cn(
          'group/day relative aspect-square h-full w-full p-0 text-center select-none [&:last-child[data-selected=true]_button]:rounded-r-4',
          props.showWeekNumber
            ? '[&:nth-child(2)[data-selected=true]_button]:rounded-l-4'
            : '[&:first-child[data-selected=true]_button]:rounded-l-4',
          defaultClassNames.day,
        ),
        range_start: cn('rounded-l-4 bg-accent', defaultClassNames.range_start),
        range_middle: cn('rounded-none', defaultClassNames.range_middle),
        range_end: cn('rounded-r-4 bg-accent', defaultClassNames.range_end),
        today: cn(
          'bg-accent-darker data-[selected=true]:rounded',
          defaultClassNames.today,
        ),
        outside: cn(
          'text-muted aria-selected:text-muted',
          defaultClassNames.outside,
        ),
        disabled: cn(
          'text-foreground-darker opacity-50',
          defaultClassNames.disabled,
        ),
        hidden: cn('invisible', defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Root: ({ className, rootRef, ...props }) => {
          return (
            <div
              data-slot="calendar"
              ref={rootRef}
              className={cn(className)}
              {...props}
            />
          )
        },
        Chevron: ({ className, orientation, ...props }) => {
          if (orientation === 'left') {
            return (
              <ArrowDropDown
                className={cn('size-3 rotate-90', className)}
                {...props}
              />
            )
          }

          if (orientation === 'right') {
            return (
              <ArrowDropDown
                className={cn('size-3 -rotate-90', className)}
                {...props}
              />
            )
          }

          return (
            <ChevronDownIcon className={cn('size-4', className)} {...props} />
          )
        },
        DayButton: CalendarDayButton,
        WeekNumber: ({ children, ...props }) => {
          return (
            <td {...props}>
              <div className="flex size-(--cell-size) items-center justify-center text-center">
                {children}
              </div>
            </td>
          )
        },
        ...components,
      }}
      {...props}
    />
  )
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  ...props
}: React.ComponentProps<typeof DayButton>) {
  const defaultClassNames = getDefaultClassNames()

  const ref = React.useRef<HTMLButtonElement>(null)
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      data-day={day.date.toLocaleDateString()}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        'flex aspect-square size-auto w-full min-w-(--cell-size) flex-col gap-1 leading-none font-normal group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:border-ring group-data-[focused=true]/day:ring-2 group-data-[focused=true]/day:ring-ring/50 data-[range-end=true]:rounded-4 data-[range-end=true]:rounded-r-4 data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground data-[range-middle=true]:rounded-none data-[range-middle=true]:bg-accent data-[range-middle=true]:text-accent-foreground data-[range-start=true]:rounded-4 data-[range-start=true]:rounded-l-4 data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground dark:hover:text-accent-foreground text-caption [&>span]:opacity-70',
        defaultClassNames.day,
        className,
      )}
      {...props}
    />
  )
}

export { Calendar, CalendarDayButton }
