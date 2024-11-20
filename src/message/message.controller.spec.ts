import { Test, TestingModule } from '@nestjs/testing'
import { MessageController } from './message.controller'
import { MessageService } from './message.service'
import { Message } from './message.entity'
import { CreateMessageDto } from './dtos/createMessage.dto'

describe('MessageController', () => {
  let controller: MessageController
  let messageService: MessageService

  // Mock message service
  const mockMessageService = {
    createMessage: jest.fn(),
    createComment: jest.fn(),
    getMessages: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MessageController],
      providers: [
        {
          provide: MessageService,
          useValue: mockMessageService,
        },
      ],
    }).compile()

    controller = module.get<MessageController>(MessageController)
    messageService = module.get<MessageService>(MessageService)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('createMessage', () => {
    it('should create a new message', async () => {
      // Arrange
      const createMessageDto: CreateMessageDto = {
        content: 'Test message',
      }
      const mockUser = { id: 1, username: 'testuser' }
      const mockRequest = { user: mockUser }
      const expectedMessage = {
        content: 'Test message',
        user: mockUser,
      } as Message

      mockMessageService.createMessage.mockResolvedValue(expectedMessage)

      // Act
      const result = await controller.createMessage(
        createMessageDto,
        mockRequest,
      )

      // Assert
      expect(result).toEqual(expectedMessage)
      expect(messageService.createMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          content: createMessageDto.content,
          user: mockUser,
        }),
      )
    })
  })

  describe('createComment', () => {
    it('should create a new comment', async () => {
      // Arrange
      const messageId = 1
      const createCommentDto: CreateMessageDto = {
        content: 'Test comment',
      }
      const mockUser = { id: 1, username: 'testuser' }
      const mockRequest = { user: mockUser }
      const expectedComment = {
        content: 'Test comment',
        user: mockUser,
      } as Message

      mockMessageService.createComment.mockResolvedValue(expectedComment)

      // Act
      const result = await controller.createComment(
        messageId,
        createCommentDto,
        mockRequest,
      )

      // Assert
      expect(result).toEqual(expectedComment)
      expect(messageService.createComment).toHaveBeenCalledWith(
        messageId,
        expect.objectContaining({
          content: createCommentDto.content,
          user: mockUser,
        }),
      )
    })
  })

  describe('getMessages', () => {
    it('should return all messages', async () => {
      // Arrange
      const expectedMessages = [
        { id: 1, content: 'Message 1' },
        { id: 2, content: 'Message 2' },
      ]
      mockMessageService.getMessages.mockResolvedValue(expectedMessages)

      // Act
      const result = await controller.getMessages()

      // Assert
      expect(result).toEqual(expectedMessages)
      expect(messageService.getMessages).toHaveBeenCalled()
    })
  })
})
