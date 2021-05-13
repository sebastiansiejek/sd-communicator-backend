```**mermaid**
sequenceDiagram
  Actor 1->>+Server: Send message
  Server->>+Actor 2: Forward message
  Actor 2-->>-Server: Send message
  Server-->>-Actor 1: Forward message
