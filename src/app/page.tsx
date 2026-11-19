'use client'

import { Button } from '@/components/ui/button'
import { useState, ViewTransition, startTransition } from 'react'

export default function Home() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <main className="h-dvh">
        <ViewTransition>
          <p>Hello World {count}!</p>
        </ViewTransition>
        <Button
          onClick={() => {
            startTransition(() => {
              setCount((p) => p + 1)
            })
          }}
        >
          Click me
        </Button>
      </main>
    </div>
  )
}
