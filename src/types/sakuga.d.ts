import type { DetailedHTMLProps, HTMLAttributes } from 'react'

export interface SakugaProgressElement extends HTMLElement {
  readonly value: number
  readonly done: boolean
  set(progress: number, instant?: boolean): void
  reset(): void
}

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'sakuga-progress': DetailedHTMLProps<
        HTMLAttributes<SakugaProgressElement>,
        SakugaProgressElement
      > & {
        label?: string
        'done-label'?: string
        value?: number | string
      }
    }
  }
}
