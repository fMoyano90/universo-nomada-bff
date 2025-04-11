import { Module } from '@nestjs/common';
import { ApplicationCoreModule } from '../application-core/application-core.module';
import { UserController } from './controllers/user.controller';
import { AuthController } from './controllers/auth.controller';

@Module({
  imports: [ApplicationCoreModule],
  controllers: [UserController, AuthController],
  providers: [],
})
export class UserInterfaceModule {}
