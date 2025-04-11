import {
  GetUserInteractor,
  CreateUserInteractor,
  DeleteUserInteractor,
  UpdateUserInteractor,
} from './user';

import { AuthService } from './auth/auth.service';

export const services = [
  AuthService,
  GetUserInteractor,
  CreateUserInteractor,
  UpdateUserInteractor,
  DeleteUserInteractor,
];
