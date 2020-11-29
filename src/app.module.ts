import { Module } from '@nestjs/common'
import { ChatGateway } from './Chat/gateway/chat.gateway'

@Module({
  imports: [],
  controllers: [],
  providers: [ChatGateway]
})
export class AppModule {}
