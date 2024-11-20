import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common'
import { AuthService } from './auth.service'
import { SessionGuard } from './guard/session.guard'
import { LocalGuard } from './guard/local.guard'
import { CreateUserDto } from '../user/dtos/create-user.dto'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() body: CreateUserDto) {
    return this.authService.register(body)
  }

  @UseGuards(LocalGuard)
  @Post('login')
  async login(
    @Body()
    body: { usernameOrEmail: string; password: string; rememberMe?: boolean },
    @Request() req,
  ) {
    const result = this.authService.login(body)

    if (body.rememberMe) {
      req.session.cookie.maxAge = 1000 * 60 * 60 * 24 * 30 // 30 days
    }

    return result
  }

  @UseGuards(SessionGuard)
  @Post('logout')
  async logout(@Request() req) {
    req.session.destroy()
    return { message: 'Logged out successfully' }
  }

  @UseGuards(SessionGuard)
  @Get('me')
  async me(@Request() req) {
    return req.user
  }
}
