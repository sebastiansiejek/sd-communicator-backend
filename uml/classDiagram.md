```**mermaid**
classDiagram

 class ChatGateway
    ChatGateway --|> OnGatewayConnection
    ChatGateway --|> OnGatewayDisconnect
    ChatGateway : +wss
    ChatGateway : +afterInit()
    ChatGateway : +handleConnection()
    ChatGateway : +handleMessage()
    ChatGateway : +call()
    ChatGateway : +joinToRoom()
    ChatGateway : +leaveRoom()

  class OnGatewayConnection{
    +handleConnection()
  }

  class OnGatewayDisconnect{
    +handleDisconnect()
  }