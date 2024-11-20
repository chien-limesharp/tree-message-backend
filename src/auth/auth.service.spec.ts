import { Test, TestingModule } from '@nestjs/testing'
import { AuthService } from './auth.service'
import { UserService } from '../user/user.service'
import { HttpException, HttpStatus } from '@nestjs/common'
import * as bcrypt from 'bcrypt'

const mockUserService = {
  findByUsernameOrEmail: jest.fn(),
  create: jest.fn(),
}

describe('AuthService', () => {
  let service: AuthService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile()

    service = module.get<AuthService>(AuthService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('validateUser', () => {
    it('should return user if credentials are valid', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        password: await bcrypt.hash('password123', 10),
      }

      mockUserService.findByUsernameOrEmail.mockResolvedValue(mockUser)

      const result = await service.validateUser('testuser', 'password123')
      expect(result).toEqual(mockUser)
    })

    it('should return null if user not found', async () => {
      mockUserService.findByUsernameOrEmail.mockResolvedValue(null)

      const result = await service.validateUser('testuser', 'password123')
      expect(result).toBeNull()
    })
  })

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const createUserDto = {
        username: 'newuser',
        email: 'new@user.com',
        password: 'password123',
      }

      mockUserService.findByUsernameOrEmail.mockResolvedValue(null)
      mockUserService.create.mockResolvedValue({ id: 1, ...createUserDto })

      const result = await service.register(createUserDto)
      expect(result).toBeDefined()
      expect(mockUserService.create).toHaveBeenCalled()
    })

    it('should throw if user already exists', async () => {
      const createUserDto = {
        username: 'existinguser',
        email: 'existing@user.com',
        password: 'password123',
      }

      mockUserService.findByUsernameOrEmail.mockResolvedValue({ id: 1 })

      await expect(service.register(createUserDto)).rejects.toThrow(
        new HttpException('User already exists', HttpStatus.BAD_REQUEST),
      )
    })
  })

  describe('login', () => {
    it('should return user if credentials are valid', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        password: await bcrypt.hash('password123', 10),
      }

      mockUserService.findByUsernameOrEmail.mockResolvedValue(mockUser)

      const result = await service.login({
        usernameOrEmail: 'testuser',
        password: 'password123',
      })

      expect(result).toEqual(mockUser)
    })

    it('should throw if credentials are invalid', async () => {
      mockUserService.findByUsernameOrEmail.mockResolvedValue(null)

      await expect(
        service.login({
          usernameOrEmail: 'testuser',
          password: 'wrongpassword',
        }),
      ).rejects.toThrow(
        new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED),
      )
    })
  })
})
