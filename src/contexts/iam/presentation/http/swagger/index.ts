import { PermissionDto } from '../dto';

const PermissionDtoDocs = {
  description: 'Lista de permissões a serem modificadas',
  type: [PermissionDto],
  example: [
    {
      entity: '@iam',
      read: 4,
      manage: 2,
      create: 1,
      update: 3,
      delete: 1,
      automation: 1,
      export: 1,
      import: 1,
    },
  ],
};

export const IamDocs = {
  User: {
    UpdateUserProfileInput: {
      userId: {
        description: 'User id',
        example: 'uuid-v4',
        required: true,
      },

      firstName: {
        description: 'First Name',
        example: 'Paulo',
        required: false,
      },
      lastName: {
        description: 'Last name',
        example: 'Henrique',
        required: false,
      },
      office: {
        description: 'Office',
        example: 'Desenvolvedor',
        required: false,
      },
      phone: {
        description: 'Phone',
        example: '(71) 99295-5292',
        required: false,
      },
      avatar: {
        description: 'Avatar',
        example:
          'https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50',
        required: false,
      },

      gender: {
        description: 'Gender (M, F, O)',
        example: 'M',
        required: false,
      },
      birthday: {
        description: 'Birthdate',
        example: '2020-11-02T00:00:00.000Z',
        required: false,
      },

      address: {
        description: 'Address',
        example: {
          street: 'Rua do teste',
          number: '123',
          complement: 'Casa',
          neighborhood: 'Bairro',
          city: 'Cidade',
          state: 'Estado',
          extra: 'Informação extra',
          zipCode: '00000-000',
        },
        required: false,
      },
    },
    SubscribeUserToGroupInput: {
      userId: {
        description: 'User id',
        example: 'uuid-v4',
        required: true,
      },
      groupId: {
        description: 'Group id',
        example: 'uuid-v4',
        required: true,
      },
    },

    CreateUserInput: {
      firstName: {
        description: 'First Name',
        example: 'Paulo',
        required: true,
      },
      lastName: {
        description: 'Last name',
        example: 'Henrique',
        required: true,
      },
      office: {
        description: 'Office',
        example: 'Desenvolvedor',
        required: true,
      },
      email: {
        description: 'Email',
        example: 'paulo.artlab@gmail.com',
        required: true,
      },
      phone: {
        description: 'Phone',
        example: '(71) 99295-5292',
        required: true,
      },

      avatar: {
        description: 'Avatar',
        example:
          'https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50',
        required: false,
      },

      gender: {
        description: 'Gender (M, F, O)',
        example: 'M',
        required: false,
      },
      birthday: {
        description: 'Birthdate',
        example: '2020-11-02T00:00:00.000Z',
        required: false,
      },
    },
    ChangeUserActiveStatusInput: {
      userId: {
        description: 'User id',
        example: 'uuid-v4',
        required: true,
      },
      status: {
        description: 'New user status',
        example: true,
        required: true,
      },
    },
    ChangeUserPermissionsInput: {
      userId: {
        description: 'User id',
        example: 'uuid-v4',
        required: true,
      },
      permissions: PermissionDtoDocs,
    },
  },
  Group: {
    ChangeGroupPermissionInput: {
      groupId: {
        description: 'Group id',
        example: 'uuid-v4',
        required: true,
      },
      name: {
        description: 'Group name',
        example: 'Inside Sales',
        required: false,
      },
      isDepartment: {
        description: 'Is this group an department?',
        example: true,
        required: false,
      },
      permissions: PermissionDtoDocs,
    },
    CreateGroupWithPermissionsInput: {
      name: {
        description: 'Group name',
        example: 'Inside Sales',
        required: true,
      },

      isDepartment: {
        description: 'Is this group an department?',
        example: true,
        required: true,
      },

      permissions: PermissionDtoDocs,
    },
  },
  Authentication: {
    AskForRecoveryPasswordInput: {
      email: {
        description: 'User email to recovery',
        example: 'paulo.artlab@gmail.com',
        required: true,
      },
    },
    RecoveryPasswordInput: {
      token: {
        description: 'Token to recovery password',
        example: 'uuid-v4',
        required: true,
      },
      password: {
        description: 'New password',
        example: 'new-password#3020',
        required: true,
      },
    },
    SignInInput: {
      email: {
        description: 'User email',
        required: true,
      },
      password: {
        description: 'User password',
        required: true,
      },
      keepMeLoggedIn: {
        example: true,
        required: true,
      },
    },
    VerifyIfTokenPasswordIsValidInput: {
      token: {
        description: 'Token to verify if is valid',
        example: 'uuid-v4',
        required: true,
      },
    },
  },
};
