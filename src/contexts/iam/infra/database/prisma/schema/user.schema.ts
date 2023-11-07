import {
  address,
  authentication,
  group,
  groupParticipants,
  groupPermission,
  oauth,
  profile,
  recoveryPassword,
  refreshToken,
  user,
  userPermission,
} from '@prisma/client';

export type UserSchema = user & {
  profile: profile & {
    address: address;
  };
  groupParticipants: (groupParticipants & {
    group: group & {
      permission: groupPermission[];
    };
  })[];
  permissions: userPermission[];
  authentication: authentication & {
    recoveryPassword?: recoveryPassword[];
    refreshToken?: refreshToken[];
    oauth?: oauth[];
  };
};
