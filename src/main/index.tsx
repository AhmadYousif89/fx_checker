import { RateConverter } from './converter.section'
import { InsightsSection } from './insights.section'

export const Main = () => {
  return (
    <main
      id="main-content"
      className="wrapper grow flex flex-col gap-10 px-4 py-8 md:px-6 md:py-12 lg:px-8"
    >
      <RateConverter />
      <InsightsSection />
    </main>
  )
}
