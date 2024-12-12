import axios from '../../config/axios';

export interface RegisterCredentials {
    name: string;
    email: string;
    password: string;
}

export const register = async (credentials: RegisterCredentials) => {
    try {
        const response = await axios.post('/auth/register', credentials);
        return response.data;
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(error.message);
        }
        throw new Error('Произошла ошибка при регистрации');
    }
}; 