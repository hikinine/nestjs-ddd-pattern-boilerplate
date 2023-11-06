import { PaginationCriteria } from '@hiki9/rich-domain/dist';
import { RequireOnlyOne } from '@lib/common';

export type FindGroupsQueryProps = RequireOnlyOne<{
  criteria?: PaginationCriteria;
  groupId?: string;
  groupName?: string;
}>;
/**
 * Query to find an group, or a colletion of groups.
 * @param {PaginationCriteria} query.criteria - find a colletion of groups by criteria.
 * @param {string} query.groupId - find if exists a group within id.
 * @param {string} query.groupName - find if exists group within name.
 *
 * @returns Group, if found
 * @returns Pagination<Group>
 */
export class FindGroupsQuery {
  constructor(public readonly props: FindGroupsQueryProps) {}
}
