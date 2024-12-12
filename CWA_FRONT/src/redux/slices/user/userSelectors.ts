import type { RootState } from '../../store';
import type { AppUser } from '../../../types/user';

export const getUserData = (state: RootState): AppUser | null => state.user.userData;
export const getUserStatus = (state: RootState) => state.user.status;
export const getUserError = (state: RootState) => state.user.error; 