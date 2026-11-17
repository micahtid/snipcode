# Architecture

`src/content/index.ts` runs each phase in order.

![How a snip goes from the selected element to the final component code](architecture.svg)

With multi-select, this flow runs once per element, one at a time.
