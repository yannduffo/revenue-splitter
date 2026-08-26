import { defineConfig } from '@wagmi/cli'
import { foundry } from '@wagmi/cli/plugins'

export default defineConfig({
  out: 'src/lib/generated.ts',
  plugins: [
    foundry({
      project: '../contracts',
      include: ['Splitter.sol/**', 'SplitterFactory.sol/**'],
    }),
  ],
})
