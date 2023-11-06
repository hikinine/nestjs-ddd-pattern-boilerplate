import { GroupProps } from '@iam/domain/entities';

export function generateGroupProps(props?: Partial<GroupProps>): GroupProps {
  return {
    permissions: [],
    name: 'group' + Math.random(),
    isDepartment: false,
    ...props,
  };
}
