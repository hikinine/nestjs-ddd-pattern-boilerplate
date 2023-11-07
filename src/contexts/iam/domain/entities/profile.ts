import { Address, Phone } from '@app/contexts/shared/domain';
import { Domain } from '@hiki9/rich-domain/dist';
import { Username } from '../value-object';

export interface ProfileProps extends Domain.EntityProps {
  firstName?: Username;
  lastName?: Username;
  phone?: Phone;
  office?: string;
  avatar?: string;
  birthday?: Date;
  gender?: 'M' | 'F' | 'O';
  address?: Address;
}

const hooks = Domain.Hooks<Profile, ProfileProps>({});

export class Profile extends Domain.Entity<ProfileProps> {
  protected static hooks = hooks;

  public toPrimitives() {
    const originalPrimitives = super.toPrimitives();
    return {
      ...originalPrimitives,
      fullName: this.fullName,
    };
  }

  public changePhone(phone: Phone) {
    this.props.phone = phone;
  }

  public changeFirstName(username: Username) {
    this.props.firstName = username;
  }

  public changeLastName(username: Username) {
    this.props.lastName = username;
  }

  public changeOffice(office: string) {
    this.props.office = office;
  }

  public changeAvatar(avatar: string) {
    this.props.avatar = avatar;
  }

  public changeBirthday(birthday: Date) {
    this.props.birthday = birthday;
  }

  public changeAddress(address: Address) {
    this.props.address = address;
  }

  get phone() {
    return this.props.phone;
  }

  get firstName() {
    return this.props.firstName;
  }

  get lastName() {
    return this.props.lastName;
  }

  get office() {
    return this.props.office;
  }

  get avatar() {
    return this.props.avatar;
  }

  get birthday() {
    return this.props.birthday;
  }

  get gender() {
    return this.props.gender;
  }

  get address() {
    return this.props.address;
  }

  get fullName() {
    return `${this.props?.firstName?.value} ${this.props?.lastName?.value}`;
  }
}
