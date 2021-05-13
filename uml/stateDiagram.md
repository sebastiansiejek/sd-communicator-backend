```**mermaid**
stateDiagram-v2
    [*] --> Homepage
    Homepage --> ChatRoom: Connect to room
    ChatRoom --> Unconnected: Leave room
    Unconnected --> Homepage