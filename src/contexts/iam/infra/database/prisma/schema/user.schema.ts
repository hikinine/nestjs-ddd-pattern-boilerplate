import {
  authentication,
  group,
  groupParticipants,
  groupPermission,
  oauth,
  recoveryPassword,
  refreshToken,
  user,
  userPermission,
} from '@prisma/client';

export type UserSchema = user & {
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
