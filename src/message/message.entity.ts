import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Tree,
  TreeChildren,
  TreeParent,
} from 'typeorm'

import { User } from '../user/user.entity'

@Entity()
@Tree('closure-table')
export class Message {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  content: string

  @TreeParent()
  parent: Message

  @TreeChildren()
  children: Message[]

  @ManyToOne(() => User, (user) => user.messages)
  user: User

  @CreateDateColumn()
  createdAt: Date
}
