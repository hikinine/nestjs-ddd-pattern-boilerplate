import { group, groupParticipants, groupPermission } from '@prisma/client';

export type GroupSchema = group & {
  permission: groupPermission[];
  participants: groupParticipants[];
};
