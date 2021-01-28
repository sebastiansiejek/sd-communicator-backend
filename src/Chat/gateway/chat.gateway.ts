import { Logger } from '@nestjs/common'
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'

@WebSocketGateway()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() wss: Server

  private logger: Logger = new Logger('ChatGateway')

  afterInit() {
    this.logger.log('Initialized')
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`)
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`)
  }

  @SubscribeMessage('msgToServer')
  handleMessage(
    client: Socket,
    message: { body: string; nickname: string; senderId: string }
  ): void {
    const { roomId } = client.handshake.query as { roomId: string }

    client.join(roomId)
    this.wss.in(roomId).emit('msgToClient', message)
  }

  @SubscribeMessage('leaveRoom')
  leaveRoom(client: Socket): void {
    const { roomId } = client.handshake.query as { roomId: string }

    client.leave(roomId)
    client.emit('leaveRoom', roomId)
  }
}
