import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

function App() {
  const [count, setCount] = useState(0)
  const [inputValue, setInputValue] = useState('')

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">shadcn/ui Demo</CardTitle>
          <CardDescription>
            Testing shadcn components in your Vite + React project
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Your Name
            </label>
            <Input
              id="name"
              placeholder="Enter your name..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            {inputValue && (
              <p className="text-sm text-muted-foreground">
                Hello, {inputValue}!
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => setCount((c) => c + 1)}>
              Count: {count}
            </Button>
            <Button variant="outline" onClick={() => setCount(0)}>
              Reset
            </Button>
            <Button variant="destructive" onClick={() => setCount((c) => c - 1)}>
              -1
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button variant="secondary" className="w-full">
            Secondary
          </Button>
          <Button variant="ghost" className="w-full">
            Ghost
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

export default App
