import { Email, Phone } from '@app/contexts/shared/domain';
import { CreateUserInputAdapter } from '@iam/application/adapter';
import { Auth, User } from '@iam/domain/entities';
import { Password, Username } from '@iam/domain/value-object';
import { CreateUserInput } from '@iam/presentation/http/dto';

describe('create-user-input.adapter.spec', () => {
  let input: CreateUserInput;
  let adapter: CreateUserInputAdapter;

  beforeAll(() => {
    adapter = new CreateUserInputAdapter();
  });

  beforeEach(() => {
    input = {
      office: 'Desenvolvedor',
      email: Math.random() + '@gmail.com',
      username: 'username' + Math.random(),
      phone: '(71) 99295-6282',
      password: '12345678',
    };
  });

  it('should be defined', () => {
    expect(adapter).toBeDefined();
  });

  it('should create an User based on UserProps', () => {
    const props = adapter.build(input);
    const user = new User(props);
    expect(user).toBeInstanceOf(User);
  });

  it('should create an valid UserProps', () => {
    const props = adapter.build(input);
    expect(props.email).toBeInstanceOf(Email);
    expect(props.email.value).toEqual(input.email);
    expect(props.username).toBeInstanceOf(Username);
    expect(props.username.value).toEqual(input.username);
    expect(props.phone).toBeInstanceOf(Phone);
    expect(props.phone.value).toEqual(input.phone);
    expect(props.isActive).toBeTruthy();
    expect(props.auth).toBeDefined();
    expect(props.auth).toBeInstanceOf(Auth);
    expect(props.auth.password).toBeInstanceOf(Password);

    expect(props.groups).toBeInstanceOf(Array);
    expect(props.groups).toHaveLength(0);
    expect(props.permissions).toBeInstanceOf(Array);
    expect(props.permissions).toHaveLength(0);
  });
});
