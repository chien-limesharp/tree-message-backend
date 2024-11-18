import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import * as session from 'express-session'
import * as passport from 'passport'
import * as cookieParser from 'cookie-parser'
import { config } from 'dotenv'
import * as FileStoreFactory from 'session-file-store'

config()

const FileStore = FileStoreFactory(session)

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  })

  app.use(cookieParser())

  app.use(
    session({
      name: 'auth',
      store: new FileStore({
        path: './sessions',
        logFn: () => {},
        ttl: 86400,
      }),
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
      },
    }),
  )

  app.use(passport.initialize())
  app.use(passport.session())

  await app.listen(process.env.PORT ?? 3000)
}
bootstrap()
