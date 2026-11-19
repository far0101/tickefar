import { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Select, MenuItem, FormControl,
  InputLabel, Box, Typography, Divider, CircularProgress,
  Alert, IconButton, type SelectChangeEvent,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import api from '../services/api';
import type { Event, Venue } from '../types';

const CATEGORIES = ['Recital', 'Freestyle', 'Teatro', 'Stand-Up'] as const;

interface SectorField {
  name: string;
  price: string;
  availableTickets: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  editing?: Event | null;
}

function toDateInput(d: string) {
  return new Date(d).toISOString().slice(0, 10);
}

export default function EventFormDialog({ open, onClose, onSaved, editing }: Props) {
  const [venues,   setVenues]   = useState<Venue[]>([]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  const [title,    setTitle]    = useState('');
  const [artist,   setArtist]   = useState('');
  const [category, setCategory] = useState<string>('Recital');
  const [imageUrl, setImageUrl] = useState('');
  const [venueId,  setVenueId]  = useState('');
  const [dates,    setDates]    = useState<[string, string]>(['', '']);
  const [twoDate,  setTwoDate]  = useState(false);
  const [sectors,  setSectors]  = useState<SectorField[]>([]);

  // Precarga venues
  useEffect(() => {
    void api.get<Venue[]>('/api/venues').then(({ data }) => setVenues(data));
  }, []);

  // Resetea formulario al abrir/cerrar
  useEffect(() => {
    if (!open) return;
    if (editing) {
      setTitle(editing.title);
      setArtist(editing.artist);
      setCategory(editing.category);
      setImageUrl(editing.imageUrl);
      setVenueId(typeof editing.venue === 'object' ? editing.venue._id : '');
      setDates([
        editing.dates[0] ? toDateInput(editing.dates[0]) : '',
        editing.dates[1] ? toDateInput(editing.dates[1]) : '',
      ]);
      setTwoDate(editing.dates.length === 2);
      setSectors(editing.sectors.map((s) => ({
        name: s.name,
        price: String(s.price),
        availableTickets: String(s.availableTickets),
      })));
    } else {
      setTitle(''); setArtist(''); setCategory('Recital');
      setImageUrl(''); setVenueId('');
      setDates(['', '']); setTwoDate(false); setSectors([]);
    }
    setError(null);
  }, [open, editing]);

  // Cuando cambia el venue carga sus sectores (solo si es nuevo)
  const handleVenueChange = (e: SelectChangeEvent) => {
    const id = e.target.value;
    setVenueId(id);
    if (!editing) {
      const v = venues.find((v) => v._id === id);
      setSectors(
        (v?.sectors ?? []).map((s) => ({ name: s, price: '', availableTickets: '' })),
      );
    }
  };

  const handleSectorField = (
    idx: number,
    field: 'price' | 'availableTickets',
    value: string,
  ) => {
    setSectors((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, [field]: value } : s)),
    );
  };

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      const payload = {
        title, artist, category, imageUrl,
        venue: venueId,
        dates: twoDate
          ? [new Date(dates[0]).toISOString(), new Date(dates[1]).toISOString()]
          : [new Date(dates[0]).toISOString()],
        sectors: sectors.map((s) => ({
          name: s.name,
          price: Number(s.price),
          availableTickets: Number(s.availableTickets),
        })),
      };

      if (editing) {
        await api.put(`/api/events/${editing._id}`, payload);
      } else {
        await api.post('/api/events', payload);
      }

      onSaved();
      onClose();
    } catch {
      setError('No se pudo guardar el evento. Revisá los campos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{editing ? 'Editar evento' : 'Nuevo evento'}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}

          <TextField label="Título" value={title} onChange={(e) => setTitle(e.target.value)} required fullWidth size="small" />
          <TextField label="Artista" value={artist} onChange={(e) => setArtist(e.target.value)} required fullWidth size="small" />

          <FormControl fullWidth size="small">
            <InputLabel>Categoría</InputLabel>
            <Select value={category} label="Categoría" onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
            </Select>
          </FormControl>

          <TextField label="URL imagen" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} required fullWidth size="small" />

          <FormControl fullWidth size="small">
            <InputLabel>Venue</InputLabel>
            <Select value={venueId} label="Venue" onChange={handleVenueChange}>
              {venues.map((v) => <MenuItem key={v._id} value={v._id}>{v.name}</MenuItem>)}
            </Select>
          </FormControl>

          {/* Fechas */}
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <TextField
              label="Fecha 1" type="date" size="small"
              value={dates[0]} onChange={(e) => setDates([e.target.value, dates[1]])}
              InputLabelProps={{ shrink: true }} required sx={{ flex: 1 }}
            />
            {twoDate ? (
              <>
                <TextField
                  label="Fecha 2" type="date" size="small"
                  value={dates[1]} onChange={(e) => setDates([dates[0], e.target.value])}
                  InputLabelProps={{ shrink: true }} sx={{ flex: 1 }}
                />
                <IconButton size="small" onClick={() => { setTwoDate(false); setDates([dates[0], '']); }}>
                  <RemoveIcon />
                </IconButton>
              </>
            ) : (
              <IconButton size="small" onClick={() => setTwoDate(true)} title="Agregar segunda fecha">
                <AddIcon />
              </IconButton>
            )}
          </Box>

          {/* Sectores */}
          {sectors.length > 0 && (
            <>
              <Divider />
              <Typography variant="subtitle2">Sectores</Typography>
              {sectors.map((s, i) => (
                <Box key={s.name} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <Typography sx={{ width: 160, flexShrink: 0 }} variant="body2">{s.name}</Typography>
                  <TextField
                    label="Precio" type="number" size="small" sx={{ flex: 1 }}
                    value={s.price}
                    onChange={(e) => handleSectorField(i, 'price', e.target.value)}
                  />
                  <TextField
                    label="Cupos" type="number" size="small" sx={{ flex: 1 }}
                    value={s.availableTickets}
                    onChange={(e) => handleSectorField(i, 'availableTickets', e.target.value)}
                  />
                </Box>
              ))}
            </>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          variant="contained" onClick={handleSubmit}
          disabled={loading || !title || !artist || !venueId || !dates[0]}
          startIcon={loading ? <CircularProgress size={16} /> : null}
        >
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
