import { faker } from '@faker-js/faker';
import { Id } from '@hiki9/rich-domain/dist/core';
import { PrismaService } from '@lib/common';
import { Permissions } from '@prisma/client';
import * as bcrypt from 'bcrypt';

export async function iamModuleSeed(prisma: PrismaService) {
  console.log('🚀  iamModuleSeed (user, group, permission)');
  const permissions = ['@iam', '@sales', '@webhooks'];

  await prisma.permission.createMany({
    data: permissions.map((id) => ({ id })),
  });

  function generateTotalPermission() {
    return {
      update: Permissions.Total,
      delete: Permissions.Total,
      read: Permissions.Total,
      create: Permissions.Total,
      export: Permissions.Total,
      import: Permissions.Total,
      automation: Permissions.Total,
    };
  }
  const groups = [
    {
      id: 'mhvXdrZT4jP5T8vBxuvm75',
      name: 'Diretoria',
      permissions: [
        {
          permissionId: '@iam',
          ...generateTotalPermission(),
        },
        {
          permissionId: '@sales',
          ...generateTotalPermission(),
        },
      ],
    },
    {
      id: 'abcXdrAcKjP5ABvBxuvm9X',
      name: 'Gerência',
      permissions: [
        {
          permissionId: '@iam',
          update: Permissions.Total,
          read: Permissions.Total,
          create: Permissions.Total,
          delete: Permissions.AcessoNegado,
          export: Permissions.AcessoNegado,
          import: Permissions.AcessoNegado,
          automation: Permissions.AcessoNegado,
        },
        {
          permissionId: '@sales',
          update: Permissions.Total,
          read: Permissions.Total,
          create: Permissions.Total,
          delete: Permissions.AcessoNegado,
          export: Permissions.AcessoNegado,
          import: Permissions.AcessoNegado,
          automation: Permissions.AcessoNegado,
        },
      ],
    },
    {
      id: 'kldXdrZT4jP5T8LTzuvmCK',
      name: 'Vendedor',
      permissions: [
        {
          permissionId: '@iam',
          update: Permissions.Pessoal,
          read: Permissions.Pessoal,
          create: Permissions.Pessoal,
          delete: Permissions.AcessoNegado,
          export: Permissions.AcessoNegado,
          import: Permissions.AcessoNegado,
          automation: Permissions.AcessoNegado,
        },
        {
          permissionId: '@sales',
          update: Permissions.Pessoal,
          read: Permissions.Pessoal,
          create: Permissions.Pessoal,
          delete: Permissions.AcessoNegado,
          export: Permissions.AcessoNegado,
          import: Permissions.AcessoNegado,
          automation: Permissions.AcessoNegado,
        },
      ],
    },
  ];

  for (const group of groups) {
    await prisma.group.create({
      data: {
        id: new Id().value,
        name: group.name,
        permission: {
          create: group.permissions,
        },
      },
    });
  }

  const promises = Array.from({ length: 30 }).map(async () => {
    return prisma.user.create({
      data: {
        id: new Id().value,
        email: faker.internet.email(),
        phone: generateRandomPhone(),
        username: faker.person.firstName() + faker.person.lastName(),
        office: 'Desenvolvedor',
        authentication: {
          create: {
            password: bcrypt.hashSync('12345678', 10),
          },
        },
        permissions: {
          create: {
            manage: Permissions.Pessoal,
            create: Permissions.Pessoal,
            read: Permissions.Pessoal,
            update: Permissions.Pessoal,
            delete: Permissions.Pessoal,
            export: Permissions.Pessoal,
            import: Permissions.Pessoal,
            automation: Permissions.Pessoal,
            permission: {
              connect: {
                id: '@iam',
              },
            },
          },
        },
        groupParticipants: {
          create: {
            role: 'owner',
            group: {
              connect: {
                name: 'Diretoria',
              },
            },
          },
        },
      },
    });
  });

  await Promise.all(promises);

  return await prisma.user.create({
    data: {
      id: new Id().value,
      email: 'root@root.com',
      phone: '(71) 99295-6282',
      username: 'root',
      office: 'Desenvolvedor',
      authentication: {
        create: {
          oauth: {
            create: {
              externalUserProviderId: '68',
              provider: 'GOOGLE',
            },
          },
          password: bcrypt.hashSync('12345678', 10),
        },
      },
      permissions: {
        create: {
          manage: Permissions.Total,
          create: Permissions.Total,
          read: Permissions.Total,
          update: Permissions.Total,
          delete: Permissions.Total,
          export: Permissions.Total,
          import: Permissions.Total,
          automation: Permissions.Total,
          permission: {
            connect: {
              id: '@iam',
            },
          },
        },
      },
      groupParticipants: {
        create: {
          role: 'owner',
          group: {
            connect: {
              name: 'Diretoria',
            },
          },
        },
      },
    },
  });
}

function generateRandomPhone() {
  return '(99) 99999-9999';
}
