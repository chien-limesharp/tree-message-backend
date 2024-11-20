import { Message } from './message.entity'
import { MessageService } from './message.service'
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common'
import { CreateMessageDto } from './dtos/createMessage.dto'
import { SessionGuard } from 'src/auth/guard/session.guard'

@Controller('messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @UseGuards(SessionGuard)
  @Post()
  async createMessage(
    @Body() message: CreateMessageDto,
    @Request() req,
  ): Promise<Message> {
    const messageEntity = new Message()
    messageEntity.content = message.content
    messageEntity.user = req.user
    return this.messageService.createMessage(messageEntity)
  }

  @UseGuards(SessionGuard)
  @Post(':id/comments')
  async createComment(
    @Param('id') id: number,
    @Body() comment: CreateMessageDto,
    @Request() req,
  ): Promise<Message> {
    const messageEntity = new Message()
    messageEntity.content = comment.content
    messageEntity.user = req.user
    return this.messageService.createComment(id, messageEntity)
  }

  @Get()
  async getMessages() {
    return this.messageService.getMessages()
  }
}
