import { PageConfig } from '@jupyterlab/coreutils'
import { KernelManager, KernelAPI } from '@jupyterlab/services'

export class Client {
  constructor () {
    this.kernelManager = null
    this.kernelModel = null
    this.kernelConnection = null
  }

  connected () {
    return !!this.kernelConnection
  }

  async connect (url, token) {
    if (this.kernelManager) {
      this.kernelManager.dispose()
    }

    PageConfig.setOption('baseUrl', url)
    PageConfig.setOption('token', token)

    this.kernelManager = new KernelManager()
    await this.kernelManager.ready

    // use existing kernel or launch new one
    const kernelModels = await KernelAPI.listRunning()
    if (kernelModels.length > 0) {
      this.kernelModel = kernelModels[0]
    } else {
      this.kernelModel = await KernelAPI.startNew()
    }

    this.kernelConnection = await this.kernelManager.connectTo({
      model: this.kernelModel
    })

    return this.kernelConnection
  }

  async execute (code) {
    const future = this.kernelConnection.requestExecute({ code })
    const response = []
    future.onIOPub = (msg) => {
      if (msg.header.msg_type !== 'status') {
        response.push(msg.content)
      }
    }
    await future.done
    return response
  }
}
