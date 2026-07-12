import { Input } from '#/components/ui/input'
import { Field, FieldLabel, FieldLegend, FieldSet } from '#/components/ui/field'
import { CurrencyPicker } from '#/main/converter/currency-picker'

type SendFieldProps = {
  value: string
  onChange: React.ChangeEventHandler<HTMLInputElement>
  ref?: React.Ref<HTMLInputElement>
}

export const SendField = ({ value, onChange, ref }: SendFieldProps) => (
  <FieldSet className="basis-full grow">
    <FieldLegend className="sr-only" aria-hidden>
      Send currency
    </FieldLegend>
    <Field className="bg-surface-600 rounded-16 p-4 gap-5 border">
      <FieldLabel htmlFor="send-amount">Send</FieldLabel>
      <div className="flex items-center justify-between gap-4">
        <div className="relative group">
          <Input
            ref={ref}
            id="send-amount"
            name="sendAmount"
            inputMode="decimal"
            type="text"
            placeholder="0"
            value={value}
            onChange={onChange}
            className="border-none field-sizing-content min-w-30 text-display-sm md:text-display px-1 placeholder:text-display-sm md:placeholder:text-display"
          />
          <span className="absolute inset-x-0 -bottom-0.5 h-0.5 group-hover:bg-muted transition-colors duration-200" />
        </div>
        <CurrencyPicker isSender />
      </div>
    </Field>
  </FieldSet>
)
