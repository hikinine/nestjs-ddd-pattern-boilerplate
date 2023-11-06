import { Domain } from '@hiki9/rich-domain';
import { Permission } from './';
import { groupValidation } from './validation/group';
export interface GroupProps extends Domain.EntityProps {
  name: string;
  isDepartment: boolean;
  permissions: Permission[];
}
const hooks = Domain.Hooks<Group, GroupProps>({
  validation: groupValidation,
  onCreate(group) {
    if (group.isNew()) {
      // group.addDomainEvent(new GroupCreated(group));
    }
  },
});
export class Group extends Domain.Aggregate<GroupProps> {
  protected static hooks = hooks;

  public changePermissions(permissions: Permission[]) {
    this.props.permissions = permissions;
  }

  public changeName(name: string) {
    this.props.name = name;
  }

  public changeIsDepartment(isDepartment: boolean) {
    this.props.isDepartment = isDepartment;
  }

  get name(): string {
    return this.props.name;
  }

  get isDepartment(): boolean {
    return this.props.isDepartment;
  }

  get permissions(): Permission[] {
    return this.props.permissions;
  }
}
