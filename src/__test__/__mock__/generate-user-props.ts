import { Auth, Profile, UserProps } from '@iam/domain/entities';
import { Password, Username } from '@iam/domain/value-object';
import { Email, Phone } from '@shared/domain';

export function generateUserProps(
  props?: Partial<UserProps> & { password?: string },
): UserProps {
  return {
    email: new Email(Math.random() + '@gmail.com'),
    profile: new Profile({
      firstName: new Username('username' + Math.random()),
      lastName: new Username('username' + Math.random()),
      phone: new Phone('(71) 99295-6282'),
      office: 'Desenvolvedor',
      gender: 'M',
      avatar: 'https://i.pravatar.cc/300',
    }),
    auth: new Auth({
      password: Password.createFromPlain(props?.password || '12345678'),
      oauth: [],
    }),
    groups: [],
    isActive: true,
    permissions: [],
    ...props,
  };
}
