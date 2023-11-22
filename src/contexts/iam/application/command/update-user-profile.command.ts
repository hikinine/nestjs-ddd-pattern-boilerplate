import { DomainError } from '@hiki9/rich-domain/dist';
import { UpdateUserProfileCommand } from '@iam/domain/command';
import { UserRepository } from '@iam/domain/repositories';
import { AuthorContextService } from '@lib/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

@CommandHandler(UpdateUserProfileCommand)
export class UpdateUserProfileCommandHandler
  implements ICommandHandler<UpdateUserProfileCommand>
{
  constructor(
    private readonly userRepository: UserRepository,
    private readonly context: AuthorContextService,
  ) {}

  async execute({
    propsToChange,
    user,
  }: UpdateUserProfileCommand): Promise<void> {
    const author = this.context.getAuthor();

    if (!author.isTheSameAs(user)) {
      throw new DomainError('Only the same user can update the user');
    }

    if (propsToChange.gender) {
      user.profile.changeGender(propsToChange.gender);
    }
    if (propsToChange.address) {
      user.profile.changeAddress(propsToChange.address);
    }

    if (propsToChange.avatar) {
      user.profile.changeAvatar(propsToChange.avatar);
    }

    if (propsToChange.birthday) {
      user.profile.changeBirthday(propsToChange.birthday);
    }

    if (propsToChange.firstName) {
      user.profile.changeFirstName(propsToChange.firstName);
    }

    if (propsToChange.lastName) {
      user.profile.changeLastName(propsToChange.lastName);
    }

    if (propsToChange.office) {
      user.profile.changeOffice(propsToChange.office);
    }
    if (propsToChange.phone) {
      user.profile.changePhone(propsToChange.phone);
    }
    return await this.userRepository.update(user);
  }
}
