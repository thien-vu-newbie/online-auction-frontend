import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { 
  GavelIcon, 
  PlusIcon, 
  MinusIcon, 
  ArrowCounterClockwiseIcon, 
  HeartIcon, 
  ShoppingCartIcon,
  UserIcon,
  MagnifyingGlassIcon
} from '@phosphor-icons/react'

function App() {
  const [count, setCount] = useState(0)
  const [inputValue, setInputValue] = useState('')

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <GavelIcon size={28} weight="duotone" className="text-primary" />
            Online Auction Demo
          </CardTitle>
          <CardDescription>
            Testing shadcn + Phosphor Icons in your Vite + React project
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium flex items-center gap-1">
              <UserIcon size={16} />
              Your Name
            </label>
            <div className="relative">
              <MagnifyingGlassIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="name"
                placeholder="Search or enter your name..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="pl-9"
              />
            </div>
            {inputValue && (
              <p className="text-sm text-muted-foreground">
                Hello, {inputValue}!
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => setCount((c) => c + 1)}>
              <PlusIcon size={18} weight="bold" />
              Count: {count}
            </Button>
            <Button variant="outline" onClick={() => setCount(0)}>
              <ArrowCounterClockwiseIcon size={18} />
              Reset
            </Button>
            <Button variant="destructive" onClick={() => setCount((c) => c - 1)}>
              <MinusIcon size={18} weight="bold" />
            </Button>
          </div>
          
          {/* Icon showcase */}
          <div className="pt-4 border-t">
            <p className="text-sm font-medium mb-2">Phosphor Icon Weights:</p>
            <div className="flex items-center gap-3">
              <GavelIcon size={24} weight="thin" />
              <GavelIcon size={24} weight="light" />
              <GavelIcon size={24} weight="regular" />
              <GavelIcon size={24} weight="bold" />
              <GavelIcon size={24} weight="fill" />
              <GavelIcon size={24} weight="duotone" />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button variant="secondary" className="w-full">
            <HeartIcon size={18} weight="duotone" />
            Watchlist
          </Button>
          <Button variant="ghost" className="w-full">
            <ShoppingCartIcon size={18} />
            Cart
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

export default App
