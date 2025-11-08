export type User = {
  name: string;
  email: string;
  zkAddress: string;
  isAdmin: boolean;
};

export type Member = {
  id: string; // badge ID
  name: string;
  program: string;
  studentNumber: string;
  address: string;
  status: 'pending' | 'verified' | 'revoked';
};

export type WhitelistedDomain = {
  id: string;
  domain: string;
};
