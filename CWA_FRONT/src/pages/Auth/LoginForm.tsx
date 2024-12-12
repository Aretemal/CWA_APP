import { useState } from 'react';
import {
  TextField,
  Button,
  Typography,
  Box,
  InputAdornment,
  IconButton,
  Alert,
} from '@mui/material';
import { Visibility, VisibilityOff, Email, Lock } from '@mui/icons-material';
import { useLogin } from '../../api/auth';
import { useNavigate } from 'react-router-dom';
import { LoginDto } from '../../types/auth';

interface LoginFormProps {
  onSwitchMode: () => void;
}

const LoginForm = ({ onSwitchMode }: LoginFormProps) => {
  const [formData, setFormData] = useState<LoginDto>({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  
  const navigate = useNavigate();
  const login = useLogin();

  const handleChange = (field: keyof LoginDto) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await login.mutateAsync(formData);
      localStorage.setItem('token', response.access_token);
      navigate('/books');
    } catch (error) {
      // Ошибка будет обработана через login.error
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h4" align="center" gutterBottom>
        Вход
      </Typography>
      
      {login.error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {login.error instanceof Error ? login.error.message : 'Произошла ошибка при входе'}
        </Alert>
      )}

      <TextField
        fullWidth
        label="Email"
        variant="outlined"
        margin="normal"
        value={formData.email}
        onChange={handleChange('email')}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Email />
            </InputAdornment>
          ),
        }}
      />

      <TextField
        fullWidth
        label="Пароль"
        type={showPassword ? 'text' : 'password'}
        variant="outlined"
        margin="normal"
        value={formData.password}
        onChange={handleChange('password')}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Lock />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={() => setShowPassword(!showPassword)}
                edge="end"
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <Button
        fullWidth
        variant="contained"
        size="large"
        type="submit"
        sx={{ mt: 3, mb: 2 }}
        disabled={login.isPending}
      >
        {login.isPending ? 'Вход...' : 'Войти'}
      </Button>

      <Button
        fullWidth
        variant="text"
        onClick={onSwitchMode}
        sx={{ textTransform: 'none' }}
      >
        Нет аккаунта? Зарегистрируйтесь
      </Button>
    </Box>
  );
};

export default LoginForm; 