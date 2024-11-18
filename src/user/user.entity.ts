import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'

import { Message } from 'src/message/message.entity'

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ unique: true })
  username: string

  @Column({ unique: true })
  email: string

  @Column()
  password: string

  @OneToMany(() => Message, (message) => message.user)
  messages: Message[]
}
