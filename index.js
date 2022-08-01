import {
    KernelManager,
    ServerConnection
  } from '@jupyterlab/services';


export const launchBinder = async (repo, ref='master', binder = 'https://mybinder.org', eventCallback = (e) => {}) => {
      const url = `${binder}/build/gh/${repo}/${ref}`

      const response = await fetch(url);
      const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
      let event = {}
      while (true) {
        const {value, done} = await reader.read();
        if (done) break;
        const events = value.split("\n")
        for (let i = 0; i < events.length; i++) {
          if (events[i].startsWith('data:')) {
            event = JSON.parse(events[i].substring(5))
            eventCallback(event)
            if (event.message) {
              output += `[${event.phase}] ${event.message.trim()}\n`
            }
            if (event.phase == 'ready' || event.phase == 'failed') {
              return event
            }
          }
        }
      }
}

export class JupyterBackend {
    constructor() {
      this.isConnected = false
      this.url = undefined
      this.token = undefined
      this.kernelManager = undefined
      this.connection = undefined
    }

    async connectToBinder(repo, ref='master', binder = 'https://mybinder.org', eventCallback = (e) => {}) {
      console.log("Connecting to binder");
      const mybinder = await launchBinder(repo, ref, binder, eventCallback)

      if (mybinder.phase != 'ready') {
        console.log('Could not launch binder instance')
        console.log(mybinder)
        return
      }

      return this.connect(mybinder.url, mybinder.token);
    }

    async connect(url, token) {
      const serverSettings = ServerConnection.makeSettings({
        baseUrl: url,
        wsUrl: url.replace('http', 'ws'),
        token: token,
      });

      this.kernelManager = new KernelManager({ serverSettings: serverSettings });

      await this.kernelManager.ready
      // find or create kernel
      let kernel;
      if (!(kernel = this.kernelManager.running().next())) {
        this.kernelManager.startNew().then(
          (k) => {
            console.log("kernel created: ", k);
            kernel = k;
          },
          (error) => {
            console.log(error);
          }
        );
      }
      this.connection = this.kernelManager.connectTo({ model: kernel });
    }
  }
