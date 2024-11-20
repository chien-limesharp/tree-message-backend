import { InjectRepository } from '@nestjs/typeorm'

import { Message } from './message.entity'
import { IsNull, Repository } from 'typeorm'
import { Injectable, NotFoundException } from '@nestjs/common'

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
  ) {}

  async createMessage(message: Message): Promise<Message> {
    return this.messageRepository.save(message)
  }

  async createComment(messageId: number, comment: Message): Promise<Message> {
    const message = await this.messageRepository.findOne({
      where: { id: messageId },
    })

    if (!message) {
      throw new NotFoundException('Message not found')
    }

    comment.parent = message

    return this.messageRepository.save(comment)
  }

  async getMessages(parentId?: number): Promise<Message[]> {
    const messages = await this.messageRepository.find({
      relations: ['user'],
      where: parentId ? { parent: { id: parentId } } : { parent: IsNull() },
      order: {
        createdAt: parentId ? 'ASC' : 'DESC',
      },
    })

    return Promise.all(
      messages.map(async (message) => ({
        ...message,
        children: await this.getMessages(message.id),
      })),
    )
  }
}
