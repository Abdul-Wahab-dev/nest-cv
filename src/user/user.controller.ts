import {
  Controller,
  Body,
  Post,
  Get,
  Param,
  Query,
  Delete,
  Patch,
  Session,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { createUserDto } from './create-user.dto';
import { UserService } from './user.service';
import { updateUserDto } from './update-create.dto';
import Serialize from '../interceptors/serialize.interceptor';
import { userDto } from './user.dto';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorator/current-user.decorator';
import { CurrentUserInterceptor } from './interceptors/current-user.interceptor';
import { User } from './user.entity';
import { AuthGuard } from 'src/guards/auth.guard';
@Controller('auth')
@UseInterceptors(CurrentUserInterceptor)
export class UserController {
  constructor(
    private userService: UserService,
    private authService: AuthService,
  ) {}

  @UseGuards(AuthGuard)
  @Get('/whoAmI')
  whoAmI(@CurrentUser() user: User) {
    return user;
  }

  @Post('/signup')
  async createUser(@Body() body: createUserDto, @Session() session: any) {
    const user = await this.authService.signup(body.email, body.password);
    session.userId = user.id;
    return user;
  }

  @Post('signin')
  async signin(@Body() body: createUserDto, @Session() session: any) {
    const user = await this.authService.signin(body.email, body.password);
    session.userId = user.id;
    return user;
  }

  @Post('/signout')
  signout(@Session() session: any) {
    session.userId = null;
  }

  @Get('/:id')
  @Serialize(userDto)
  findUser(@Param('id') id: string) {
    return this.userService.findOne(parseInt(id));
  }

  @Get()
  findAllUser(@Query('email') email: string) {
    return this.userService.find(email);
  }

  @Delete('/:id')
  deleteUser(@Param('id') id: string) {
    return this.userService.remove(parseInt(id));
  }

  @Patch('/:id')
  updateUser(@Param('id') id: string, @Body() body: updateUserDto) {
    return this.userService.update(parseInt(id), body);
  }
}
