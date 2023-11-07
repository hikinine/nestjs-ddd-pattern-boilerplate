import { Address, Phone } from '@app/contexts/shared/domain';
import { Adapter } from '@hiki9/rich-domain';
import { UpdateUserProfilePropsToChangeCommand } from '@iam/domain/command';
import { Username } from '@iam/domain/value-object';
import { UpdateUserProfileInput } from '@iam/presentation/http/dto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UpdateUserBasicInfoAdapter
  implements
    Adapter<UpdateUserProfileInput, UpdateUserProfilePropsToChangeCommand>
{
  public build(
    dto: UpdateUserProfileInput,
  ): UpdateUserProfilePropsToChangeCommand {
    const props: UpdateUserProfilePropsToChangeCommand = {};

    if (dto.firstName) props.firstName = new Username(dto.firstName);
    if (dto.lastName) props.lastName = new Username(dto.lastName);
    if (dto.phone) props.phone = new Phone(dto.phone);
    if (dto.office) props.office = dto.office;
    if (dto.avatar) props.avatar = dto.avatar;
    if (dto.birthday) props.birthday = new Date(props.birthday);
    if (dto.gender) props.gender = dto.gender;
    if (dto.address)
      props.address = new Address({
        city: dto.address.city,
        complement: dto.address.complement,
        extra: dto.address.extra,
        neighborhood: dto.address.neighborhood,
        number: dto.address.number,
        state: dto.address.state,
        street: dto.address.street,
        zipCode: dto.address.zipCode,
      });

    return props;
  }
}
