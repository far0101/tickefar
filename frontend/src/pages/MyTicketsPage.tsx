import { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Chip,
  Box,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import api from '../services/api';
import { saveTickets, readTickets } from '../services/indexedDb';
import type { Ticket } from '../types';

export default function MyTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await api.get<Ticket[]>('/api/tickets/my-tickets');
        setTickets(data);
        setOffline(false);
        await saveTickets(data);
      } catch {
        try {
          const cached = await readTickets();
          if (cached.length > 0) {
            setTickets(cached);
            setOffline(true);
          } else {
            setError('No se pudieron cargar las entradas.');
          }
        } catch {
          setError('No se pudieron cargar las entradas.');
        }
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress size={56} />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        🎟 Mis Entradas
      </Typography>

      {offline && (
        <Alert icon={<WifiOffIcon />} severity="warning" sx={{ mb: 3 }}>
          Modo offline — mostrando entradas guardadas localmente.
        </Alert>
      )}

      {error && <Alert severity="error">{error}</Alert>}

      {!error && tickets.length === 0 && (
        <Alert severity="info">Todavía no compraste ninguna entrada.</Alert>
      )}

      <Grid container spacing={3}>
        {tickets.map((ticket) => {
          const event  = typeof ticket.event === 'object' ? ticket.event : null;
          const venue  = event && typeof event.venue === 'object' ? event.venue : null;

          return (
            <Grid key={ticket._id} size={{ xs: 12, sm: 6 }}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Chip
                      icon={<ConfirmationNumberIcon />}
                      label={ticket.purchaseCode}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                    <Typography variant="caption" color="text.secondary">
                      {new Date(ticket.createdAt).toLocaleDateString('es-AR')}
                    </Typography>
                  </Box>

                  <Typography variant="h6" fontWeight={700} noWrap>
                    {event?.title ?? '—'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {venue?.name ?? '—'}
                  </Typography>

                  <Divider sx={{ my: 1 }} />

                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">
                      📅 {new Date(ticket.eventDate).toLocaleDateString('es-AR', {
                        day: 'numeric', month: 'long', year: 'numeric',
                      })}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                    <Typography variant="body2">
                      Sector: <strong>{ticket.sectorName}</strong>
                    </Typography>
                    <Typography variant="body2">
                      x{ticket.quantity}
                    </Typography>
                  </Box>
                  <Typography variant="body1" fontWeight={700} color="primary" sx={{ mt: 1 }}>
                    Total: ${ticket.totalPrice.toLocaleString('es-AR')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Container>
  );
}
