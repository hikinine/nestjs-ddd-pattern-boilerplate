import { Phone } from '@app/contexts/shared/domain';
import { Adapter } from '@hiki9/rich-domain';
import { UpdateUserBasicInfoPropsToChangeCommand } from '@iam/domain/command';
import { Username } from '@iam/domain/value-object';
import { UpdateUserInput } from '@iam/presentation/http/dto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UpdateUserBasicInfoAdapter
  implements Adapter<UpdateUserInput, UpdateUserBasicInfoPropsToChangeCommand>
{
  public build(dto: UpdateUserInput): UpdateUserBasicInfoPropsToChangeCommand {
    const props: UpdateUserBasicInfoPropsToChangeCommand = {};

    if (dto.username) props.username = new Username(dto.username);
    if (dto.office) props.office = dto.office;
    if (dto.phone) props.phone = new Phone(dto.phone);

    return props;
  }
}
