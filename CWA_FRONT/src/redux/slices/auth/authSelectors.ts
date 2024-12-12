import { get } from 'lodash'
import { RootState } from "../../store";

export const getAuthToken = (state: RootState) => get(state, 'auth.accessToken', '')