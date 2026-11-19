import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Chip,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  CircularProgress,
  Alert,
  Divider,
  Paper,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import api from '../services/api';
import { useSocket } from '../hooks/useSocket';
import { useAuth } from '../hooks/useAuth';
import BuyTicketDialog from '../components/BuyTicketDialog';
import type { Event, Sector } from '../types';

interface StockPayload {
  eventId: string;
  sectors: Sector[];
}

export default function EventDetailPage() {
  const { id }              = useParams<{ id: string }>();
  const navigate            = useNavigate();
  const { user }            = useAuth();
  const socket              = useSocket();
  const [event,   setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api
      .get<Event>(`/api/events/${id}`)
      .then(({ data }) => setEvent(data))
      .catch(() => setError('No se pudo cargar el evento.'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    socket.on('stockUpdated', (payload: StockPayload) => {
      if (payload.eventId === id) {
        setEvent((prev) => prev ? { ...prev, sectors: payload.sectors } : prev);
      }
    });
    return () => { socket.off('stockUpdated'); };
  }, [socket, id]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress size={56} />
      </Box>
    );
  }

  if (error || !event) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{error ?? 'Evento no encontrado.'}</Alert>
      </Container>
    );
  }

  const minPrice = Math.min(...event.sectors.map((s) => s.price));

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(-1)}
        sx={{ mb: 2 }}
      >
        Volver
      </Button>

      <Box
        component="img"
        src={event.imageUrl}
        alt={event.title}
        sx={{ width: '100%', maxHeight: 360, objectFit: 'cover', borderRadius: 2, mb: 3 }}
      />

      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
        <Chip label={event.category} color="primary" />
        {event.dates.map((d) => (
          <Chip
            key={d}
            label={new Date(d).toLocaleDateString('es-AR', {
              weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
            })}
            variant="outlined"
          />
        ))}
      </Box>

      <Typography variant="caption" color="text.secondary">
        {event.artist}
      </Typography>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        {event.title}
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom>
        📍 {typeof event.venue === 'object' ? `${event.venue.name} — ${event.venue.address}` : '—'}
      </Typography>

      <Divider sx={{ my: 3 }} />

      <Typography variant="h6" fontWeight={600} gutterBottom>
        Sectores y precios
      </Typography>

      <Paper variant="outlined" sx={{ mb: 3 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell><strong>Sector</strong></TableCell>
              <TableCell align="right"><strong>Precio</strong></TableCell>
              <TableCell align="right"><strong>Disponibles</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {event.sectors.map((s) => (
              <TableRow
                key={s.name}
                sx={{ opacity: s.availableTickets === 0 ? 0.4 : 1 }}
              >
                <TableCell>{s.name}</TableCell>
                <TableCell align="right">${s.price.toLocaleString('es-AR')}</TableCell>
                <TableCell align="right">
                  {s.availableTickets === 0 ? 'Agotado' : s.availableTickets.toLocaleString('es-AR')}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" fontWeight={700}>
          Desde ${minPrice.toLocaleString('es-AR')}
        </Typography>
        <Button
          variant="contained"
          size="large"
          onClick={() => (user ? setDialogOpen(true) : navigate('/login'))}
        >
          {user ? 'Comprar entradas' : 'Iniciá sesión para comprar'}
        </Button>
      </Box>

      {event && (
        <BuyTicketDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          event={event}
        />
      )}
    </Container>
  );
}
