import { Group, GroupProps } from '@iam/domain/entities';
import { GroupRepository } from '@iam/domain/repositories';
import { generateGroupProps } from './generate-group-props';

export class CreateDefaultGroupFactory {
  constructor(private readonly groupRepository: GroupRepository) {}

  async execute(
    props?: Partial<GroupProps>,
    callback?: (group: Group) => Promise<void> | void,
  ) {
    const groupProps = generateGroupProps(props);
    const groupToCreate = new Group(groupProps);
    if (callback) {
      await callback(groupToCreate);
    }
    await this.groupRepository.create(groupToCreate);
    return this.groupRepository.findById(groupToCreate.id.value);
  }
}
