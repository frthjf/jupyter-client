export const launchBinder = async (repo, ref = 'master', binder = 'https://mybinder.org', eventCallback = (e) => {}) => {
  const url = `${binder}/build/gh/${repo}/${ref}`

  const response = await fetch(url)
  const reader = response.body.pipeThrough(new TextDecoderStream()).getReader() // eslint-disable-line no-undef
  let event = {}
  while (true) {
    const { value, done } = await reader.read()
    if (done) break
    const events = value.split('\n')
    for (let i = 0; i < events.length; i++) {
      if (events[i].startsWith('data:')) {
        event = JSON.parse(events[i].substring(5))
        eventCallback(event)
        if (event.phase === 'ready' || event.phase === 'failed') {
          return event
        }
      }
    }
  }
}
