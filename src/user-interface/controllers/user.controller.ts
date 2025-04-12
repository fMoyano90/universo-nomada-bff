import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  InternalServerErrorException,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  CreateUserInteractor,
  DeleteUserInteractor,
  GetUserInteractor,
  UpdateUserInteractor,
} from '../../application-core/user';
import {
  CreateUserRequestDTO,
  UpdateUserRequestDTO,
} from '../../application-core/user/dto/user.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../../application-core/auth/decorators/roles.decorator';
import { UserRole } from '../../application-core/user/dto/user.dto';
import { Public } from '../../application-core/auth/decorators/public.decorator';

@Controller('users')
@ApiTags('Users')
export class UserController {
  constructor(
    private readonly getUserInteractor: GetUserInteractor,
    private readonly createUserInteractor: CreateUserInteractor,
    private readonly updateUserInteractor: UpdateUserInteractor,
    private readonly deleteUserInteractor: DeleteUserInteractor,
  ) {}

  @Get(':id')
  @ApiBearerAuth()
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'User found successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUser(@Param('id', ParseIntPipe) id: number) {
    return await this.getUserInteractor.execute(id);
  }

  @Get()
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'List of users' })
  @Roles(UserRole.ADMIN)
  async getAllUsers() {
    return await this.getUserInteractor.execute();
  }

  @Delete(':id')
  @ApiBearerAuth()
  @HttpCode(204)
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 204, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Roles(UserRole.ADMIN)
  async deleteUser(@Param('id', ParseIntPipe) id: number) {
    const response = await this.deleteUserInteractor.execute(id);
    if (!response) {
      throw new InternalServerErrorException('Failed to delete user');
    }
    return;
  }

  @Post()
  @Public()
  @UseInterceptors(FileInterceptor('file'))
  @ApiBody({ type: CreateUserRequestDTO })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createUser(
    @Body() createUserDto: CreateUserRequestDTO,
    @UploadedFile() file,
  ) {
    return await this.createUserInteractor.execute(createUserDto, file);
  }

  @Put(':id')
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('file'))
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateUserRequestDTO })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Roles(UserRole.ADMIN)
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserRequestDTO,
  ) {
    return await this.updateUserInteractor.execute(id, updateUserDto);
  }
}
