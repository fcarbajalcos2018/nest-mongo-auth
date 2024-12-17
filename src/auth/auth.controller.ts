import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, SignUserDTO, UpdateAuthDto } from './dto';
import { LoginUser } from './dto/login-user.dto';
import { AuthGuard } from './guards/auth.guard';
import { Request } from '@nestjs/common';
import { User } from './entities/user.entity';
import { LoginResponse } from './interfaces/login-res.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    console.log('eeee');
    console.log(process.env);
    console.log('1111');
    console.log(JSON.stringify(createUserDto));
    console.log('22222');
    return this.authService.create(createUserDto);
  }

  @Post('/login')
  login(@Body() loginUserDTO: LoginUser) {
    console.log('login');
    console.log(loginUserDTO);
    return this.authService.login(loginUserDTO);
  }

  @Post('/signup')
  signup(@Body() signUser: SignUserDTO) {
    return this.authService.signup(signUser);
  }

  @UseGuards(AuthGuard)
  @Get()
  findAll(@Request() req: Request) {
    console.log(req);
    return req['user'];
    //return this.authService.findAll();
  }

  /*@Get(':id')
  findOne(@Param('id') id: string) {
    return this.authService.findUserById(id);
  }*/

  @UseGuards(AuthGuard)
  @Get('check-token')
  checkToken(@Request() req: Request): LoginResponse {
    console.log('Check token');
    const user = req['user'] as User;
    console.log('user', user);
    return {
      user,
      token: this.authService.getJwtToken({id: user._id})
    }
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAuthDto: UpdateAuthDto) {
    return this.authService.update(+id, updateAuthDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.authService.remove(+id);
  }

}
