import { Adapter } from '@hiki9/rich-domain';
import { Auth, Profile, UserProps } from '@iam/domain/entities';
import { Password, Username } from '@iam/domain/value-object';
import { CreateUserInput } from '@iam/presentation/http/dto';
import { Injectable } from '@nestjs/common';
import { Address, Email, Phone } from '@shared/domain';

@Injectable()
export class CreateUserInputAdapter
  implements Adapter<CreateUserInput, UserProps>
{
  public build(dto: CreateUserInput): UserProps {
    const groups = [];
    const permissions = [];
    const isActive = true;

    const email = new Email(dto.email);

    const profile = new Profile({
      firstName: new Username(dto.firstName),
      lastName: new Username(dto.lastName),
      phone: new Phone(dto.phone),
      office: dto.office,
      address: new Address({}),
      avatar: dto.avatar,
      gender: dto.gender,
      birthday: dto.birthday ? new Date(dto.birthday) : null,
    });

    const randomPlainPassword =
      Math.random().toString() + Math.random().toString();

    const auth = new Auth({
      password: Password.createFromPlain(randomPlainPassword),
      refreshToken: [],
      activeRecoveryPassword: [],
      oauth: [],
    });

    const props: UserProps = {
      email,
      isActive,
      profile,
      auth,
      groups,
      permissions,
    };

    return props;
  }
}
