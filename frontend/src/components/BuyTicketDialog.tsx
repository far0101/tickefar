import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  Alert,
  CircularProgress,
  type SelectChangeEvent,
} from '@mui/material';
import api from '../services/api';
import type { Event, Sector } from '../types';

interface Props {
  open: boolean;
  onClose: () => void;
  event: Event;
}

export default function BuyTicketDialog({ open, onClose, event }: Props) {
  const [dateIdx,   setDateIdx]   = useState('0');
  const [sector,    setSector]    = useState<Sector | null>(null);
  const [quantity,  setQuantity]  = useState('1');
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState<string | null>(null);
  const [success,   setSuccess]   = useState(false);

  useEffect(() => {
    if (open) {
      setDateIdx('0');
      setSector(null);
      setQuantity('1');
      setError(null);
      setSuccess(false);
    }
  }, [open]);

  const total = sector ? sector.price * Number(quantity) : 0;

  const handleSectorChange = (e: SelectChangeEvent) => {
    const found = event.sectors.find((s) => s.name === e.target.value) ?? null;
    setSector(found);
  };

  const handleBuy = async () => {
    if (!sector) return;
    setLoading(true);
    setError(null);
    try {
      await api.post('/api/tickets', {
        event:      event._id,
        eventDate:  event.dates[Number(dateIdx)],
        sectorName: sector.name,
        quantity:   Number(quantity),
      });
      setSuccess(true);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Error al comprar la entrada';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Comprar entradas — {event.title}</DialogTitle>
      <DialogContent>
        {success ? (
          <Alert severity="success" sx={{ mt: 1 }}>
            ¡Compra exitosa! Revisá tus entradas en "Mis Entradas".
          </Alert>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            {error && <Alert severity="error">{error}</Alert>}

            {event.dates.length > 1 && (
              <FormControl fullWidth size="small">
                <InputLabel>Fecha</InputLabel>
                <Select value={dateIdx} label="Fecha" onChange={(e) => setDateIdx(e.target.value)}>
                  {event.dates.map((d, i) => (
                    <MenuItem key={i} value={String(i)}>
                      {new Date(d).toLocaleDateString('es-AR', {
                        weekday: 'long', day: 'numeric', month: 'long',
                      })}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            <FormControl fullWidth size="small">
              <InputLabel>Sector</InputLabel>
              <Select
                value={sector?.name ?? ''}
                label="Sector"
                onChange={handleSectorChange}
              >
                {event.sectors.map((s) => (
                  <MenuItem key={s.name} value={s.name} disabled={s.availableTickets === 0}>
                    {s.name} — ${s.price.toLocaleString('es-AR')}
                    {s.availableTickets === 0 ? ' (Agotado)' : ` (${s.availableTickets} disp.)`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel>Cantidad</InputLabel>
              <Select
                value={quantity}
                label="Cantidad"
                onChange={(e) => setQuantity(e.target.value)}
                disabled={!sector}
              >
                {Array.from({ length: Math.min(10, sector?.availableTickets ?? 0) }, (_, i) => (
                  <MenuItem key={i + 1} value={String(i + 1)}>{i + 1}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {sector && (
              <Typography variant="h6" fontWeight={700} textAlign="right">
                Total: ${total.toLocaleString('es-AR')}
              </Typography>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{success ? 'Cerrar' : 'Cancelar'}</Button>
        {!success && (
          <Button
            variant="contained"
            onClick={handleBuy}
            disabled={!sector || loading}
            startIcon={loading ? <CircularProgress size={16} /> : null}
          >
            Confirmar compra
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
