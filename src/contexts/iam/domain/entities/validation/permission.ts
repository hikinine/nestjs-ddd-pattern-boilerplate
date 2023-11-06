import { V } from '@lib/utils';
import { PermissionEnum, PermissionProps } from '../permission';

export function permissionValidation(props: PermissionProps) {
  if (V.notTypeOf(props.entity, 'string')) {
    return { message: 'Formato inválido para entity' };
  }

  if (V.NotLength(props.entity, 1, 60)) {
    return { message: 'entity deve ter entre 1 e 60 caracteres' };
  }

  if (
    !V.numberRange(
      props.read,
      PermissionEnum.AcessoNegado,
      PermissionEnum.AcessoTotal,
    )
  ) {
    return { message: 'Formato inválido para read' };
  }

  if (
    !V.numberRange(
      props.manage,
      PermissionEnum.AcessoNegado,
      PermissionEnum.AcessoTotal,
    )
  ) {
    return { message: 'Formato inválido para manage' };
  }

  if (
    !V.numberRange(
      props.create,
      PermissionEnum.AcessoNegado,
      PermissionEnum.AcessoTotal,
    )
  ) {
    return { message: 'Formato inválido para create' };
  }

  if (
    !V.numberRange(
      props.update,
      PermissionEnum.AcessoNegado,
      PermissionEnum.AcessoTotal,
    )
  ) {
    return { message: 'Formato inválido para update' };
  }

  if (
    !V.numberRange(
      props.delete,
      PermissionEnum.AcessoNegado,
      PermissionEnum.AcessoTotal,
    )
  ) {
    return { message: 'Formato inválido para delete' };
  }

  if (
    !V.numberRange(
      props.export,
      PermissionEnum.AcessoNegado,
      PermissionEnum.AcessoTotal,
    )
  ) {
    return { message: 'Formato inválido para export' };
  }

  if (
    !V.numberRange(
      props.import,
      PermissionEnum.AcessoNegado,
      PermissionEnum.AcessoTotal,
    )
  ) {
    return { message: 'Formato inválido para import' };
  }

  if (
    !V.numberRange(
      props.automation,
      PermissionEnum.AcessoNegado,
      PermissionEnum.AcessoTotal,
    )
  ) {
    return { message: 'Formato inválido para automation' };
  }
}
