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
import SimplePeer from 'simple-peer'

@WebSocketGateway()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() wss: Server

  private logger: Logger = new Logger('ChatGateway')
  private users = {}
  private socketToRoom = {}

  afterInit() {
    this.logger.log('Initialized')
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`)
    const { users, socketToRoom } = this

    const roomID = socketToRoom[client.id]
    let room = users[roomID]
    if (room) {
      room = room.filter((id) => id !== client.id)
      users[roomID] = room
    }
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`)
  }

  @SubscribeMessage('msgToServer')
  handleMessage(
    client: Socket,
    message: { body: string; nickname: string; senderId: string }
  ) {
    const { roomId } = client.handshake.query as { roomId: string }

    this.wss.in(roomId).emit('msgToClient', message)

    return { event: 'msgToServer', data: message }
  }

  @SubscribeMessage('SENDING_SIGNAL')
  sendingSignal(
    socket: Socket,
    payload: {
      userToSignal: SimplePeer.SignalData
      signal: SimplePeer.SignalData
      callerId: string
    }
  ) {
    socket.to(payload.userToSignal).emit('USER_JOINED', {
      signal: payload.signal,
      callerId: payload.callerId
    })
  }

  @SubscribeMessage('RETURNING_SIGNAL')
  returningSignal(
    socket: Socket,
    payload: { callerId: string; signal: string }
  ) {
    socket.to(payload.callerId).emit('RECEIVING_RETURNED_SIGNAL', {
      signal: payload.signal,
      id: socket.id
    })
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

  @SubscribeMessage('JOIN_TO_VIDEO')
  jointToVideo(client: Socket, payload): void {
    const { users, socketToRoom } = this
    const { roomId } = payload

    if (users[roomId]) {
      users[roomId].push(client.id)
    } else {
      users[roomId] = [client.id]
    }

    socketToRoom[client.id] = roomId

    const usersInThisRoom = users[roomId].filter((id) => id !== client.id)

    client.emit('ALL_USERS', usersInThisRoom)
  }

  @SubscribeMessage('leaveRoom')
  leaveRoom(
    client: Socket,
    message: { nickname: string; senderId: string }
  ): void {
    const { roomId } = client.handshake.query as { roomId: string }
    const { nickname } = message

    client.leave(roomId)

    this.wss.in(roomId).emit('leaveRoom', {
      message: `${nickname} leaved room`
    })
  }
}
