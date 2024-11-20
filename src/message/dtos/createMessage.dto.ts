import { IsNotEmpty, IsString, Length } from 'class-validator'

export class CreateMessageDto {
  @IsString()
  @IsNotEmpty()
  @Length(3, 200)
  content: string
}
