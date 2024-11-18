import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy } from 'passport-local'

@Injectable()
export class SessionStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super()
  }

  async validate(payload: any) {
    return payload
  }
}
