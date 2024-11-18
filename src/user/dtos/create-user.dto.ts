import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator'

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @Length(5, 20)
  username: string

  @IsString()
  @IsNotEmpty()
  @Length(8, 20)
  password: string

  @IsEmail()
  @IsNotEmpty()
  email: string
}
