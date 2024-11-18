import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { LocalStrategy } from './strategy/local.strategy'
import { PassportModule } from '@nestjs/passport'
import { AuthController } from './auth.controller'
import { SessionSerializer } from './session.serializer'
import { UserModule } from 'src/user/user.module'

@Module({
  imports: [UserModule, PassportModule.register({ session: true })],
  providers: [AuthService, LocalStrategy, SessionSerializer],
  controllers: [AuthController],
})
export class AuthModule {}
