import { Input } from '#/components/ui/input'
import { CurrencyPicker } from '#/components/currency-picker'
import { Field, FieldLabel, FieldLegend, FieldSet } from '#/components/ui/field'

type ReceiverFieldProps = {
  value: string
  onChange: React.ChangeEventHandler<HTMLInputElement>
  isLoading: boolean
  ref?: React.Ref<HTMLInputElement>
}

export const ReceiverField = ({
  value,
  onChange,
  isLoading,
  ref,
}: ReceiverFieldProps) => (
  <FieldSet className="basis-full grow">
    <FieldLegend className="sr-only" aria-hidden>
      Receive currency
    </FieldLegend>
    <Field className="bg-surface-600 rounded-16 p-4 gap-5 border">
      <FieldLabel htmlFor="receive-amount">Receive</FieldLabel>
      <div className="relative flex items-center justify-between gap-4">
        <div className="absolute inset-0 w-fit flex items-center justify-center">
          {isLoading && (
            <span className="h-8.5 w-36 rounded-full ml-1 text-muted animate-pulse bg-muted/10" />
          )}
        </div>
        {!isLoading && (
          <Input
            ref={ref}
            id="receive-amount"
            name="receiveAmount"
            inputMode="decimal"
            type="text"
            placeholder="0"
            value={value}
            onChange={onChange}
            className="border-none text-display-sm md:text-display text-accent! px-1 placeholder:text-display-sm md:placeholder:text-display placeholder:text-muted!"
          />
        )}
        <CurrencyPicker />
      </div>
    </Field>
  </FieldSet>
)
