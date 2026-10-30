export interface Contact {
  mobile: string;
  email: string;
  address: string;
}
export interface Profile {
  id: string;
  firstName: string;
  lastName: string;
  photoUrl: string;
  contact: Contact;
  skills: string[];
  updatedAt: string;
}
export interface Change {
  id: string;
  field: string;
  label: string;
  before: unknown;
  after: unknown;
  changedAt: string;
}
