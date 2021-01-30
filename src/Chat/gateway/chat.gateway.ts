import { Logger } from '@nestjs/common'
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse
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
  ): WsResponse<unknown> {
    const { roomId } = client.handshake.query as { roomId: string }

    this.wss.in(roomId).emit('msgToClient', message)

    return { event: 'msgToServer', data: message }
  }

  @SubscribeMessage('joinToRoom')
  joinToRoom(
    client: Socket,
    message: { nickname: string; senderId: string }
  ): void {
    const { roomId } = client.handshake.query as { roomId: string }
    const { nickname } = message

    client.join(roomId)

    this.wss.in(roomId).emit('joinToRoom', {
      message: `${nickname} joined to room`
    })
  }

  @SubscribeMessage('leaveRoom')
  leaveRoom(client: Socket): void {
    const { roomId } = client.handshake.query as { roomId: string }

    client.leave(roomId)
    client.emit('leaveRoom', roomId)
  }
}
