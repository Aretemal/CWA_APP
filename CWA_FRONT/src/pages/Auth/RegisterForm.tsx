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
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Person,
} from '@mui/icons-material';
import { useRegister } from '../../api/auth';
import { RegisterDto } from '../../types/auth';

interface RegisterFormProps {
  onSwitchMode: () => void;
}

const RegisterForm = ({ onSwitchMode }: RegisterFormProps) => {
  const [formData, setFormData] = useState<RegisterDto>({
    name: '',
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  const register = useRegister();

  const handleChange = (field: keyof RegisterDto) => (
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
      await register.mutateAsync(formData);
      onSwitchMode();
    } catch (error) {
      // Ошибка будет обработана через register.error
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h4" align="center" gutterBottom>
        Регистрация
      </Typography>

      {register.error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {register.error instanceof Error ? register.error.message : 'Произошла ошибка при регистрации'}
        </Alert>
      )}

      <TextField
        fullWidth
        label="Имя"
        variant="outlined"
        margin="normal"
        value={formData.name}
        onChange={handleChange('name')}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Person />
            </InputAdornment>
          ),
        }}
      />

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
        disabled={register.isPending}
      >
        {register.isPending ? 'Регистрация...' : 'Зарегистрироваться'}
      </Button>

      <Button
        fullWidth
        variant="text"
        onClick={onSwitchMode}
        sx={{ textTransform: 'none' }}
      >
        Уже есть аккаунт? Войдите
      </Button>
    </Box>
  );
};

export default RegisterForm; 