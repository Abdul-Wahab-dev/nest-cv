import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  constructor(private userService: UserService) {}

  async signup(email: string, password: string) {
    // check if user email already exist or not
    const user = await this.userService.find(email);
    if (user.length) {
      throw new BadRequestException('email in use');
    }

    // hash user password

    // generate a salt

    const salt = randomBytes(8).toString('hex');

    // hash the salt and the password together
    const hash = (await scrypt(password, salt, 32)) as Buffer;

    // join the hashed result and salt together

    const result = salt + '.' + hash.toString('hex');

    // create new user and save it

    const newUser = await this.userService.create(email, result);

    // return user
    return newUser;
  }

  async signin(email: string, password: string) {
    // check if user exist or not

    const [user] = await this.userService.find(email);

    if (!user) {
      throw new NotFoundException('user not found');
    }

    const [salt, storedHash] = user.password.split('.');

    const hash = (await scrypt(password, salt, 32)) as Buffer;

    if (storedHash !== hash.toString('hex'))
      throw new NotFoundException('user not found');

    return user;
  }
}
