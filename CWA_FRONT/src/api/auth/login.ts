import axios from '../../config/axios';

export interface LoginResponse {
    access_token: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
    try {
        const response = await axios.post('/auth/login', credentials);
        return response.data;
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(error.message);
        }
        throw new Error('Произошла ошибка при входе');
    }
};