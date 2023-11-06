import { User, UserProps } from '@iam/domain/entities';
import { UserRepository } from '@iam/domain/repositories';
import { generateUserProps } from './generate-user-props';

export class CreateDefaultUserFactory {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(
    props?: Partial<UserProps> & { password?: string },
    callback?: (user: User) => Promise<void> | void,
  ) {
    const userProps = generateUserProps(props);
    const userToCreate = new User(userProps);
    if (callback) {
      await callback(userToCreate);
    }
    await this.userRepository.create(userToCreate);
    return this.userRepository.findById(userToCreate.id.value);
  }
}
