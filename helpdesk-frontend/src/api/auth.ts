import { client } from './client'
import type { LoginPayload, LoginResponse, RegisterPayload, RegisterResponse } from '../types'

export const authApi = {
  register: (payload: RegisterPayload): Promise<RegisterResponse> =>
    client.post('auth/register/', payload).then((r) => r.data),

  login: (payload: LoginPayload): Promise<LoginResponse> =>
    client.post('auth/login/', payload).then((r) => r.data),
}
