import { describe, it } from 'mocha'
import { expect } from 'chai'

import { launchBinder } from '../lib/binder'

describe('launchBinder', () => {
  it('launches a binder instance from a given image', async () => {
    const binder = 'https://mybinder.org'
    const repo = 'gibiansky/IHaskell'
    const ref = 'mybinder'
    const mybinder = await launchBinder(repo, ref, binder)
    expect(mybinder.phase).to.equal('ready')
  }).timeout(50000)
})
