import { Injectable } from '@nestjs/common'
import { User } from './user.entity'
import { CreateUserDto } from './dtos/create-user.dto'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findByUsernameOrEmail(
    usernameOrEmail: string,
  ): Promise<User | undefined> {
    return this.userRepository.findOne({
      where: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
    })
  }

  async create(dto: CreateUserDto): Promise<User> {
    return await this.userRepository.save(dto)
  }
}
