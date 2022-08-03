import { describe, it } from 'mocha'
import { expect } from 'chai'

import { launchBinder } from '../lib'
import { Client } from '../lib/client'

describe('Client', () => {
  it('client can run python code', async () => {
    const client = new Client()
    const mybinder = await launchBinder('binder-examples/requirements')
    await client.connect(mybinder.url, mybinder.token)
    const response = await client.execute('a = 1; print(a)')
    expect(response.find((i) => i.name === 'stdout').text).to.equal('1\n')
  }).timeout(50000)
})
