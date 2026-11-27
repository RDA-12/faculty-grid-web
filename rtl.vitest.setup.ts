import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { afterEach, vi } from 'vitest'
import { toast } from 'sonner'

afterEach(() => {
  toast.dismiss()
  vi.clearAllMocks()
  cleanup()
})

// Toaster setup
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

/**
 * JSDOM doesn't implement PointerEvent so we need to mock our own implementation
 * Default to mouse left click interaction
 * https://github.com/radix-ui/primitives/issues/1822
 * https://github.com/jsdom/jsdom/pull/2666
 */
class MockPointerEvent extends Event {
  button: number
  ctrlKey: boolean
  pointerType: string

  constructor(type: string, props: PointerEventInit) {
    super(type, props)
    this.button = props.button || 0
    this.ctrlKey = props.ctrlKey || false
    this.pointerType = props.pointerType || 'mouse'
  }
}

window.PointerEvent = MockPointerEvent as any
window.HTMLElement.prototype.scrollIntoView = vi.fn()
window.HTMLElement.prototype.releasePointerCapture = vi.fn()
window.HTMLElement.prototype.hasPointerCapture = vi.fn()
