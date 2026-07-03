import { Field, FieldLabel, FieldLegend, FieldSet } from '#/components/ui/field'
import { Input } from '#/components/ui/input'
import { CurrencyPicker } from '#/components/currency-picker'

type ReceiverFieldProps = {
  value: string
  onChange: React.ChangeEventHandler<HTMLInputElement>
}

export const ReceiverField = ({ value, onChange }: ReceiverFieldProps) => (
  <FieldSet className="basis-full grow">
    <FieldLegend className="sr-only" aria-hidden>
      Receive currency
    </FieldLegend>
    <Field className="bg-surface-600 rounded-16 p-4 gap-5 border">
      <FieldLabel htmlFor="receive-amount">Receive</FieldLabel>
      <div className="flex items-center justify-between gap-4">
        <Input
          id="receive-amount"
          name="receiveAmount"
          inputMode="decimal"
          type="text"
          placeholder="0"
          value={value}
          onChange={onChange}
          className="border-none text-display-sm md:text-display text-accent! px-1 placeholder:text-display-sm md:placeholder:text-display placeholder:text-muted!"
        />
        <CurrencyPicker />
      </div>
    </Field>
  </FieldSet>
)
