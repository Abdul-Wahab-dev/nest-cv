import { Test } from '@nestjs/testing';
import { doesNotMatch } from 'assert';
import { AuthService } from './auth.service';
import { User } from './user.entity';
import { UserService } from './user.service';

describe('AuthService', () => {
  let service: AuthService;
  let fakeUserService: Partial<UserService>;
  beforeEach(async () => {
    fakeUserService = {
      find: () => Promise.resolve([]),
      create: (email, password) =>
        Promise.resolve({ id: 1, email, password } as User),
    };
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: fakeUserService,
        },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('it create an instance of auth services', async () => {
    expect(service).toBeDefined();
  });

  it('created a new user with a salt and hashed password', async () => {
    const user = await service.signup('abc@gmail.com', '12345');

    expect(user.password).not.toEqual('12345');
    const [salt, hash] = user.password.split('.');

    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });

  //   it('Through an error if user sign in with existed email', async (done) => {
  //     fakeUserService.find = () =>
  //       Promise.resolve([
  //         { id: 1, email: 'abc@gmail.com', password: '123456' } as User,
  //       ]);

  //     try {
  //       console.log('error');
  //       await service.signup('abc@gmail.com', '123456');
  //     } catch (err) {
  //       done();
  //     }
  //   });

  //   it('throws error if signin is called with an unused email', async (done) => {
  //     try {
  //       await service.signin('abc@gmail.com', '123456');
  //     } catch (err) {
  //       done();
  //     }
  //   });

  it('throws error if an invalid password is provided', async (done) => {
    try {
      fakeUserService.find = () =>
        Promise.resolve([{ email: 'abc@gmail.com', password: '098' } as User]);
      await service.signin('abc@gmail.com', '123');
    } catch (err) {
      done();
    }
  });
});
