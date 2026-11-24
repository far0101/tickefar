import { useEffect, useState, useCallback } from 'react';
import {
  Container, Typography, Button, Box,
  Table, TableHead, TableBody, TableRow, TableCell,
  TableContainer, Paper, IconButton, Chip,
  CircularProgress, Alert, Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '../services/api';
import EventFormDialog from '../components/EventFormDialog';
import type { Event } from '../types';

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Event | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get<Event[]>('/api/events');
      setEvents(data);
    } catch {
      setError('No se pudieron cargar los eventos.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void fetchEvents(); }, [fetchEvents]);

  const handleEdit = (event: Event) => {
    setEditing(event);
    setFormOpen(true);
  };

  const handleNew = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Eliminar este evento?')) return;
    setDeleting(id);
    try {
      await api.delete(`/api/events/${id}`);
      setEvents((prev) => prev.filter((e) => e._id !== id));
    } catch {
      setError('No se pudo eliminar el evento.');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight={700}>
          Admin — Eventos
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleNew}>
          Nuevo evento
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
          <CircularProgress size={48} />
        </Box>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell><strong>Título</strong></TableCell>
                <TableCell><strong>Artista</strong></TableCell>
                <TableCell><strong>Categoría</strong></TableCell>
                <TableCell><strong>Estadio</strong></TableCell>
                <TableCell><strong>Fechas</strong></TableCell>
                <TableCell><strong>Sectores</strong></TableCell>
                <TableCell align="center"><strong>Acciones</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {events.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center">Sin eventos</TableCell>
                </TableRow>
              )}
              {events.map((ev) => (
                <TableRow key={ev._id} hover>
                  <TableCell>{ev.title}</TableCell>
                  <TableCell>{ev.artist}</TableCell>
                  <TableCell>
                    <Chip label={ev.category} size="small" />
                  </TableCell>
                  <TableCell>
                    {typeof ev.venue === 'object' ? ev.venue.name : '—'}
                  </TableCell>
                  <TableCell>
                    {ev.dates.map((d) =>
                      new Date(d).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' }),
                    ).join(' / ')}
                  </TableCell>
                  <TableCell>{ev.sectors.length}</TableCell>
                  <TableCell align="center">
                    <Tooltip title="Editar">
                      <IconButton size="small" onClick={() => handleEdit(ev)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(ev._id)}
                        disabled={deleting === ev._id}
                      >
                        {deleting === ev._id
                          ? <CircularProgress size={14} />
                          : <DeleteIcon fontSize="small" />}
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <EventFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSaved={fetchEvents}
        editing={editing}
      />
    </Container>
  );
}
