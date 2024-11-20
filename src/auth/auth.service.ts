import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { CreateUserDto } from '../user/dtos/create-user.dto'
import { UserService } from '../user/user.service'
import * as bcrypt from 'bcrypt'

@Injectable()
export class AuthService {
  constructor(private userService: UserService) {}

  async validateUser(usernameOrEmail: string, password: string) {
    const user = await this.userService.findByUsernameOrEmail(usernameOrEmail)

    if (user && (await bcrypt.compare(password, user.password))) {
      return user
    }

    return null
  }

  async register(dto: CreateUserDto) {
    const user = await this.userService.findByUsernameOrEmail(dto.username)
    if (user) {
      throw new HttpException('User already exists', HttpStatus.BAD_REQUEST)
    }

    try {
      const salt = await bcrypt.genSalt(10)
      const hash = await bcrypt.hash(dto.password, salt)

      return await this.userService.create({
        ...dto,
        password: hash,
      })
    } catch (error) {
      console.log(error)
      throw new HttpException(
        'Error during registration process',
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }

  async login(dto: { usernameOrEmail: string; password: string }) {
    const user = await this.validateUser(dto.usernameOrEmail, dto.password)
    if (!user) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED)
    }
    return user
  }
}
