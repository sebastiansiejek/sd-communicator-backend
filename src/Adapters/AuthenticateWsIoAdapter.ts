import { IoAdapter } from '@nestjs/platform-socket.io'

export class AuthenticatedWsIoAdapter extends IoAdapter {
  createIOServer(port: number, options?: any): any {
    options.allowRequest = async (request: any, allowFunction) => {
      return allowFunction(null, true)
    }
    return super.createIOServer(port, options)
  }
}
