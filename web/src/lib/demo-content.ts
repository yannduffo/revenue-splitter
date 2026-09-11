export type DemoContext = 'home' | 'splitterA' | 'splitterB' | 'otherSplitter'

type Block = { title: string; body: string[] }

export const DEMO_CONTENT: {
  base: Block
  contexts: Record<DemoContext, Block>
} = {
  base: {
    title: 'This is a live deployment on Sepolia',
    body: [
      'The tokens here have no value.',
      'Anyone can mint some below and send them to a splitter to see how the accounting works.',
    ],
  },
  contexts: {
    home: {
      title: 'What a splitter does',
      body: [
        'A team gives each member a percentage. Any ERC-20 token sent to the splitter address is divided between them, in proportion to their share.',
        'Anyone can pay it with a plain transfer. Members withdraw their own share whenever they want.',
        'The split is permanent: no owner, no admin, no way to change it.',
        'Two demo splitters are deployed below.',
      ],
    },
    splitterA: {
      title: 'Splitter A — two members, two tokens',
      body: [
        'The splitter received 35 dEUR and 40 dUSD.',
        'Member 1 has claimed the dEUR. Nobody has claimed the dUSD yet: it is all still pending.',
        'Switch tokens to see how each member stands on each one.',
      ],
    },
    splitterB: {
      title: 'Splitter B — four members, uneven shares',
      body: [
        'Deposits and claims happened at different times, so everyone is in a different position.',
        'Some members are up to date on one token and have never claimed the other.',
        'Open a member card to see their balance on each token.',
      ],
    },
    otherSplitter: {
      title: 'This splitter was created here, not by us',
      body: [
        "Everyone can create a new splitter with the parameters he/she wants for it's team",
      ],
    },
  },
}
