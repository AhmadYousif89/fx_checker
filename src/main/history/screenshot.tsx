import { Button } from '#/components/ui/button'
import { CameraIcon } from 'lucide-react'

export const ScreenshotAction = () => {
  return (
    <Button
      size="icon-sm"
      variant="ghost"
      onClick={() => {}}
      className="h-9 w-auto aspect-square"
    >
      <CameraIcon className="size-4.5" />
    </Button>
  )
}
