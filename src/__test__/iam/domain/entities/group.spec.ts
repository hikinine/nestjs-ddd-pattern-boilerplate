import { Group, GroupProps, Permission } from '@iam/domain/entities';

describe('group entity', () => {
  let groupProps: GroupProps;
  beforeEach(() => {
    groupProps = {
      isDepartment: true,
      name: 'group-name',
      permissions: [Permission.createFromBitmap('@iam.13232312')],
    };
  });

  describe('group entity basics', () => {
    it('should be defined', () => {
      expect(Group).toBeTruthy();
    });

    it('should create an valid group', () => {
      const group = new Group(groupProps);
      expect(group).toBeInstanceOf(Group);
    });

    it('should ensure that every type matchs with expected', () => {
      const group = new Group(groupProps);
      expect(typeof group.name).toEqual('string');
      expect(typeof group.isDepartment).toEqual('boolean');
      expect(group.permissions).toBeInstanceOf(Array);
      expect(
        group.permissions.every(
          (permission) => permission instanceof Permission,
        ),
      ).toBeTruthy();
    });

    it('should get name', () => {
      const group = new Group(groupProps);
      expect(group.name).toEqual(groupProps.name);
    });

    it('should get isDepartment', () => {
      const group = new Group(groupProps);
      expect(group.isDepartment).toEqual(groupProps.isDepartment);
    });

    it('should get permissions', () => {
      const group = new Group(groupProps);
      expect(group.permissions).toEqual(groupProps.permissions);
    });
  });

  describe('group entity change methods', () => {
    it('should change name', () => {
      const group = new Group(groupProps);
      const newName = 'new-name';
      group.changeName(newName);
      expect(group.name).toEqual(newName);
    });

    it('should change isDepartment', () => {
      const group = new Group(groupProps);
      const newIsDepartment = false;
      group.changeIsDepartment(newIsDepartment);
      expect(group.isDepartment).toEqual(newIsDepartment);
    });

    it('should change permissions', () => {
      const group = new Group(groupProps);
      const newPermissions = [
        Permission.createFromBitmap('@iam.12312322'),
        Permission.createFromBitmap('@iam.12322123'),
      ];
      group.changePermissions(newPermissions);
      expect(group.permissions).toEqual(newPermissions);
    });
  });
});
