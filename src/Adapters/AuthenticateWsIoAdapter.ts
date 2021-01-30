import { IoAdapter } from '@nestjs/platform-socket.io'

export class AuthenticatedWsIoAdapter extends IoAdapter {
  createIOServer(port: number, options?: any): any {
    options.allowRequest = async (request: any, allowFunction) => {
      if (request.headers.origin === process.env.WEBSOCKET_CLIENT_ORIGIN)
        return allowFunction(null, true)
      else return false
    }
    return super.createIOServer(port, options)
  }
}
