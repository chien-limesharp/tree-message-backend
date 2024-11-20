import { Test, TestingModule } from '@nestjs/testing'
import { MessageService } from './message.service'
import { Message } from './message.entity'
import { getRepositoryToken } from '@nestjs/typeorm'
import { NotFoundException } from '@nestjs/common'

describe('MessageService', () => {
  let service: MessageService

  // Enhanced mock repository with additional methods
  const mockRepository = {
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
    })),
  }

  // Updated Mock
  class MockMessage implements Message {
    id: number
    content: string
    user: any
    parent: Message | null
    children: Message[]
    createdAt: Date

    constructor() {
      this.id = 0
      this.content = ''
      this.user = null
      this.parent = null
      this.children = []
      this.createdAt = new Date()
    }
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessageService,
        {
          provide: getRepositoryToken(Message),
          useValue: mockRepository,
        },
      ],
    }).compile()

    service = module.get<MessageService>(MessageService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('createMessage', () => {
    it('should create a new message', async () => {
      const message = new MockMessage()
      message.content = 'Test message'
      message.user = { id: 1 }

      mockRepository.save.mockResolvedValue(message)

      const result = await service.createMessage(message as Message)

      expect(result).toBe(message)
      expect(mockRepository.save).toHaveBeenCalledWith(message)
    })
  })

  describe('createComment', () => {
    it('should create a comment for an existing message', async () => {
      const parentMessage = new MockMessage()
      parentMessage.id = 1
      const comment = new MockMessage()
      comment.content = 'Test comment'
      comment.user = { id: 2 }

      mockRepository.findOne.mockResolvedValue(parentMessage)
      mockRepository.save.mockResolvedValue({
        ...comment,
        parent: parentMessage,
      })

      const result = await service.createComment(1, comment as Message)

      expect(result).toEqual({ ...comment, parent: parentMessage })
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      })
      expect(mockRepository.save).toHaveBeenCalledWith({
        ...comment,
        parent: parentMessage,
      })
    })

    it('should throw NotFoundException when parent message not found', async () => {
      mockRepository.findOne.mockResolvedValue(null)
      const comment = new MockMessage()

      await expect(service.createComment(1, comment)).rejects.toThrow(
        NotFoundException,
      )
    })
  })

  describe('getMessages', () => {
    it('should get root messages when no parentId provided', async () => {
      // Setup test data
      const rootMessages = [
        {
          id: 1,
          content: 'Test message 1',
          user: { id: 1 },
          parent: null,
          children: [],
          createdAt: new Date(),
        },
        {
          id: 2,
          content: 'Test message 2',
          user: { id: 2 },
          parent: null,
          children: [],
          createdAt: new Date(),
        },
      ] as Message[]

      // Reset mocks
      jest.clearAllMocks()
      mockRepository.find.mockReset()

      // Simple mock that returns root messages for the first call and empty array for children
      mockRepository.find.mockImplementation((options) => {
        if (!options.where.parent?.id) {
          // Root messages query
          return Promise.resolve(rootMessages)
        }
        return Promise.resolve([]) // Children queries
      })

      const result = await service.getMessages()

      // Verify repository was called
      expect(mockRepository.find).toHaveBeenCalled()

      // Expect the actual messages with empty children arrays
      expect(result).toEqual(rootMessages)
    })

    it('should get comments when parentId provided', async () => {
      const comments = [
        {
          id: 3,
          content: 'Test comment 1',
          user: { id: 1 },
          parent: { id: 1 },
          children: [],
          createdAt: new Date(),
        },
        {
          id: 4,
          content: 'Test comment 2',
          user: { id: 2 },
          parent: { id: 1 },
          children: [],
          createdAt: new Date(),
        },
      ] as Message[]

      // Reset mocks
      jest.clearAllMocks()
      mockRepository.find.mockReset()

      // Mock implementation for comments
      mockRepository.find.mockImplementation((options) => {
        if (options?.where?.parent?.id === 1) {
          // Comments for parent id 1
          return Promise.resolve(comments)
        }
        return Promise.resolve([]) // No children for comments
      })

      const result = await service.getMessages(1)

      // Verify repository was called with correct params
      expect(mockRepository.find).toHaveBeenCalledWith({
        relations: ['user'],
        where: { parent: { id: 1 } },
        order: { createdAt: 'ASC' },
      })

      // Expect the comments with empty children arrays
      expect(result).toEqual(comments)
    })
  })
})
