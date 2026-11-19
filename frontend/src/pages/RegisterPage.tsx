import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Link,
} from '@mui/material';
import { useAuth } from '../hooks/useAuth';

const PWD_REGEX = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{8,}$/;

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate     = useNavigate();
  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [error,    setError]    = useState<string | null>(null);
  const [loading,  setLoading]  = useState(false);

  const nameError     = name.length > 0 && name.trim().length < 2;
  const emailError    = email.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const passwordError = password.length > 0 && !PWD_REGEX.test(password);
  const confirmError  = confirm.length > 0 && confirm !== password;

  const isValid = !nameError && !emailError && !passwordError && !confirmError
    && name && email && password && confirm;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register(name, email, password);
      navigate('/');
    } catch {
      setError('No se pudo crear la cuenta. El email puede estar en uso.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs">
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ mt: 8, display: 'flex', flexDirection: 'column', gap: 2 }}
      >
        <Typography variant="h5" fontWeight={700} textAlign="center">
          Crear cuenta
        </Typography>

        {error && <Alert severity="error">{error}</Alert>}

        <TextField
          label="Nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={nameError}
          helperText={nameError ? 'Mínimo 2 caracteres' : ''}
          required
          fullWidth
        />

        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={emailError}
          helperText={emailError ? 'Email inválido' : ''}
          required
          fullWidth
        />

        <TextField
          label="Contraseña"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={passwordError}
          helperText={
            passwordError
              ? 'Mínimo 8 caracteres, una mayúscula, un número y un carácter especial'
              : ''
          }
          required
          fullWidth
        />

        <TextField
          label="Confirmar contraseña"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          error={confirmError}
          helperText={confirmError ? 'Las contraseñas no coinciden' : ''}
          required
          fullWidth
        />

        <Button
          type="submit"
          variant="contained"
          fullWidth
          size="large"
          disabled={!isValid || loading}
          startIcon={loading ? <CircularProgress size={18} /> : null}
        >
          Registrarse
        </Button>

        <Typography variant="body2" textAlign="center">
          ¿Ya tenés cuenta?{' '}
          <Link component={RouterLink} to="/login">
            Iniciá sesión
          </Link>
        </Typography>
      </Box>
    </Container>
  );
}
