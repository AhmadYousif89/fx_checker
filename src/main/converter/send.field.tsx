import { Field, FieldLabel, FieldLegend, FieldSet } from '#/components/ui/field'
import { Input } from '#/components/ui/input'
import { CurrencyPicker } from '#/components/currency-picker'

type SendFieldProps = {
  value: string
  onChange: React.ChangeEventHandler<HTMLInputElement>
}

export const SendField = ({ value, onChange }: SendFieldProps) => (
  <FieldSet className="basis-full grow">
    <FieldLegend className="sr-only" aria-hidden>
      Send currency
    </FieldLegend>
    <Field className="bg-surface-600 rounded-16 p-4 gap-5 border">
      <FieldLabel htmlFor="send-amount">Send</FieldLabel>
      <div className="flex items-center justify-between gap-4">
        <Input
          id="send-amount"
          name="sendAmount"
          inputMode="decimal"
          type="text"
          placeholder="0"
          value={value}
          onChange={onChange}
          className="border-none text-display-sm md:text-display px-1 placeholder:text-display-sm md:placeholder:text-display"
        />
        <CurrencyPicker isSender />
      </div>
    </Field>
  </FieldSet>
)
