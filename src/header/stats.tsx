import { useCurrenciesQuery } from '#/hooks/use-currencies'

export const HeaderStats = () => {
  const { totalCurrencies } = useCurrenciesQuery()

  return (
    <div className="flex items-center gap-1 uppercase text-overline md:text-body text-muted">
      <span>{totalCurrencies}</span>
      <p>currencies</p>•<p>eod</p>•<p>ecb data</p>
    </div>
  )
}
