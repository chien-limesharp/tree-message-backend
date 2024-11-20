import { Test, TestingModule } from '@nestjs/testing'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { CreateUserDto } from 'src/user/dtos/create-user.dto'

describe('AuthController', () => {
  let controller: AuthController
  let authService: AuthService

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile()

    controller = module.get<AuthController>(AuthController)
    authService = module.get<AuthService>(AuthService)
  })

  describe('register', () => {
    it('should register a new user', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password123',
        username: 'testuser',
      }
      mockAuthService.register.mockResolvedValue({ id: 1, ...createUserDto })

      const result = await controller.register(createUserDto)

      expect(authService.register).toHaveBeenCalledWith(createUserDto)
      expect(result).toEqual({ id: 1, ...createUserDto })
    })
  })

  describe('login', () => {
    it('should login a user', async () => {
      const loginDto = {
        usernameOrEmail: 'test@example.com',
        password: 'password123',
      }
      const mockReq = {
        session: {
          cookie: {},
        },
      }
      mockAuthService.login.mockResolvedValue({ access_token: 'token123' })

      const result = await controller.login(loginDto, mockReq)

      expect(authService.login).toHaveBeenCalledWith(loginDto)
      expect(result).toEqual({ access_token: 'token123' })
    })

    it('should set session cookie maxAge when rememberMe is true', async () => {
      const loginDto = {
        usernameOrEmail: 'test@example.com',
        password: 'password123',
        rememberMe: true,
      }
      const mockReq = {
        session: {
          cookie: {
            maxAge: undefined,
          },
        },
      }
      mockAuthService.login.mockResolvedValue({ access_token: 'token123' })

      await controller.login(loginDto, mockReq)

      expect(mockReq.session.cookie.maxAge).toBe(1000 * 60 * 60 * 24 * 30)
    })
  })

  describe('logout', () => {
    it('should destroy session on logout', async () => {
      const mockReq = {
        session: {
          destroy: jest.fn(),
        },
      }

      const result = await controller.logout(mockReq)

      expect(mockReq.session.destroy).toHaveBeenCalled()
      expect(result).toEqual({ message: 'Logged out successfully' })
    })
  })

  describe('me', () => {
    it('should return the current user', async () => {
      const mockUser = { id: 1, username: 'testuser' }
      const mockReq = { user: mockUser }

      const result = await controller.me(mockReq)

      expect(result).toBe(mockUser)
    })
  })
})
