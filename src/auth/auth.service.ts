import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto, SignUserDTO, UpdateAuthDto } from './dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcryptjs';
import { LoginUser } from './dto/login-user.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { LoginResponse } from './interfaces/login-res.interface';

@Injectable()
export class AuthService {

  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
                            private jwtService: JwtService
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    console.log('ddd');
    console.log('dto', createUserDto.name);
    //const newUser = new this.userModel(createUserDto);
    //return newUser.save();
    try {
      const { password, ...userData } = createUserDto;
      console.log(bcrypt.hashSync(password, 10));
      const newUser = new this.userModel({
        password: bcrypt.hashSync(password, 10),
        ...userData
      });
      console.log('New User');
      console.log(newUser);
      await newUser.save();
      console.log('e');
      const { password:_, ...user } = newUser.toJSON();
      console.log(user.email);
      return user;
    } catch (error) {
      if (error.code === 11000) {
        throw new BadRequestException(createUserDto.email, 'already exists.');
      }
      throw new InternalServerErrorException('The server could not proceed with the provided request.', error);
    }
    return null;
  }

  async login(loginUser: LoginUser): Promise<LoginResponse> {
    const { email, password } = loginUser;
    const user = await this.userModel.findOne({email});
    if (!user)
      throw new UnauthorizedException('The EMAIL credential is INVALID.')
    if (!bcrypt.compareSync(password, user.password))
      throw new UnauthorizedException('The PASSWORD credential is INVALID.')
    const { password:_, ...rest } = user.toJSON();

    return {
      user: rest,
      token: this.getJwtToken({ id: user.id })
    };
  }

  async signup(signUser: SignUserDTO): Promise<LoginResponse> {
    const user = await this.create(signUser);
    return {
      user: user,
      token: this.getJwtToken({ id: user._id })
    }
  }

  findAll(): Promise<User[]> {
    return this.userModel.find();
  }

  async findUserById(id: string) {
    const user = await this.userModel.findById(id);
    const { password, ...rest } = user.toJSON();
    return rest;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }

  getJwtToken(jwtPayload: JwtPayload) {
    return this.jwtService.sign(jwtPayload);
  }
}
