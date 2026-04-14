import React, { useState, useEffect, useRef } from 'react';
import NewItem from '../NewItem';
import API_LIST from '../API';
import DeleteIcon from '@mui/icons-material/Delete';
import { Button, TableBody, CircularProgress } from '@mui/material';
import Moment from 'react-moment';
import { FunnelIcon, CheckCircleIcon, ArrowUturnLeftIcon, TrashIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';

type Priority = 'alta' | 'media' | 'baja';

type Item = {
  id?: number | string;
  description?: string;
  done?: boolean;
  createdAt?: string;
  storyPoints?: number;
  priority?: Priority;
};

const priorityColors: Record<Priority, { bg: string; text: string }> = {
  alta: { bg: '#fee2e2', text: '#dc2626' },
  media: { bg: '#fef3c7', text: '#d97706' },
  baja: { bg: '#dcfce7', text: '#16a34a' },
};

function PriorityBadge({ priority }: { priority?: Priority }) {
  if (!priority) return null;
  const colors = priorityColors[priority];
  return (
    <span style={{
      backgroundColor: colors.bg,
      color: colors.text,
      padding: '2px 10px',
      borderRadius: '9999px',
      fontSize: '12px',
      fontWeight: 600,
      textTransform: 'capitalize',
      whiteSpace: 'nowrap',
    }}>
      {priority}
    </span>
  );
}

function StoryPointsBadge({ points }: { points?: number }) {
  if (points === undefined) return null;
  return (
    <span style={{
      backgroundColor: '#ede9fe',
      color: '#7c3aed',
      padding: '2px 8px',
      borderRadius: '9999px',
      fontSize: '12px',
      fontWeight: 700,
      whiteSpace: 'nowrap',
    }}>
      {points} SP
    </span>
  );
}

const filterOptionStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  textAlign: 'left',
  padding: '8px 16px',
  border: 'none',
  backgroundColor: 'transparent',
  color: '#450a0a',
  fontSize: '14px',
  cursor: 'pointer',
};

export default function TasksPage() {
  const [isLoading, setLoading] = useState<boolean>(false);
  const [isInserting, setInserting] = useState<boolean>(false);
  const [items, setItems] = useState<Item[]>([]);
  const [error, setError] = useState<any>();
  const [showFilter, setShowFilter] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setShowFilter(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function deleteItem(deleteId: number | string) {
    fetch(`${API_LIST}/${deleteId}`, { method: 'DELETE' })
      .then(response => {
        if (response.ok) {
          return response;
        } else {
          throw new Error('Something went wrong ...');
        }
      })
      .then(
        () => {
          const remainingItems = items.filter(item => item.id !== deleteId);
          setItems(remainingItems);
        },
        (error) => {
          setError(error);
        }
      );
  }

  function toggleDone(event: React.MouseEvent, id: number | string, description?: string, done?: boolean) {
    event.preventDefault();
    modifyItem(id, description ?? '', done).then(
      () => { reloadOneItem(id); },
      (error) => { setError(error); }
    );
  }

  function reloadOneItem(id: number | string){
    fetch(`${API_LIST}/${id}`)
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('Something went wrong ...');
        }
      })
      .then(
        (result) => {
          const items2 = items.map(
            x => (x.id === id ? { ...x, 'description': result.description, 'done': result.done } : x)
          );
          setItems(items2);
        },
        (error) => {
          setError(error);
        }
      );
  }

  function modifyItem(id: number | string, description: string, done?: boolean) {
    const data = { description: description, done: done };
    return fetch(`${API_LIST}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(response => {
      if (response.ok) {
        return response;
      } else {
        throw new Error('Something went wrong ...');
      }
    });
  }

  useEffect(() => {
    setLoading(true);
    fetch(API_LIST)
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('Something went wrong ...');
        }
      })
      .then(
        (result) => {
          setLoading(false);
          setItems(result);
        },
        () => {
          setLoading(false);
          setItems([
            { id: 1, description: 'xkw', done: false, createdAt: '2026-01-14T03:22:47', storyPoints: 3, priority: 'alta' },
            { id: 2, description: 'asjd', done: false, createdAt: '2026-07-23T18:45:12', storyPoints: 8, priority: 'media' },
            { id: 3, description: 'qp', done: true, createdAt: '2025-11-02T09:10:33', storyPoints: 1, priority: 'baja' },
            { id: 4, description: 'mvnbx', done: false, createdAt: '2026-03-08T21:33:05', storyPoints: 5, priority: 'alta' },
            { id: 5, description: 'pt', done: true, createdAt: '2025-09-17T14:57:51', storyPoints: 2, priority: 'media' },
            { id: 6, description: 'bnmz', done: false, createdAt: '2026-06-01T07:12:29', storyPoints: 13, priority: 'baja' },
            { id: 7, description: 'rwq', done: false, createdAt: '2026-02-19T11:05:58', storyPoints: 5, priority: 'alta' },
            { id: 8, description: 'lkjh', done: true, createdAt: '2025-12-25T16:40:03', storyPoints: 3, priority: 'media' },
          ]);
        }
      );
  }, []);

  function addItem(text: string){
    setInserting(true);
    const data: any = { description: text };
    fetch(API_LIST, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then((response) => {
      if (response.ok) {
        return response;
      } else {
        throw new Error('Something went wrong ...');
      }
    }).then(
      (result) => {
        const id = result.headers.get('location');
        const newItem: Item = { id: id ?? undefined, description: text };
        setItems([newItem, ...items]);
        setInserting(false);
      },
      (error) => {
        setInserting(false);
        setError(error);
      }
    );
  }

  return (
    <div className="App">
      <h1>Mis Tareas</h1>
      <div style={{ display: 'flex', width: '95%', alignItems: 'center', gap: '8px' }}>
        <div style={{ flex: 1 }}>
          <NewItem addItem={addItem} isInserting={isInserting}/>
        </div>
        <div ref={filterRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setShowFilter(!showFilter)}
            className="FilterButton"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '8px 14px',
              border: '1px solid #fca5a5',
              borderRadius: '0.25rem',
              backgroundColor: showFilter ? '#fee2e2' : '#ffffff',
              color: '#dc2626',
              fontWeight: 'bold',
              fontSize: 'max(11px, min(2vw, 14px))',
              cursor: 'pointer',
              whiteSpace: 'nowrap' as const,
            }}
          >
            <FunnelIcon style={{ height: '18px', width: '18px' }} />
            Filtrar
          </button>
          {showFilter && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: '100%',
              marginTop: '4px',
              backgroundColor: '#ffffff',
              border: '1px solid #fecaca',
              borderRadius: '0.5rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              zIndex: 10,
              minWidth: '180px',
              padding: '8px 0',
            }}>
              <button style={filterOptionStyle}>Prioridad: Alta</button>
              <button style={filterOptionStyle}>Prioridad: Media</button>
              <button style={filterOptionStyle}>Prioridad: Baja</button>
            </div>
          )}
        </div>
      </div>
      { error && <p>Error: {error.message}</p> }
      { isLoading && <CircularProgress /> }
      { !isLoading &&
        <div id="maincontent">
          <table id="itemlistNotDone" className="itemlist">
            <TableBody>
            {items.map(item => (
              !item.done && (
                <tr key={String(item.id)}>
                  <td className="description">{item.description}</td>
                  <td style={{ whiteSpace: 'nowrap' }}><StoryPointsBadge points={item.storyPoints} /></td>
                  <td style={{ whiteSpace: 'nowrap' }}><PriorityBadge priority={item.priority} /></td>
                  <td className="date"><Moment format="MMM Do hh:mm:ss">{item.createdAt}</Moment></td>
                  <td>
                    <button
                      onClick={(e) => toggleDone(e as any, item.id ?? '', item.description, true)}
                      title="Marcar como completada"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                    >
                      <CheckCircleIcon style={{ height: '22px', width: '22px', color: '#16a34a' }} />
                    </button>
                  </td>
                </tr>
              )
            ))}
            </TableBody>
          </table>
          <h2 id="donelist">Completadas</h2>
          <table id="itemlistDone" className="itemlist">
            <TableBody>
            {items.map(item => (
              item.done && (
                <tr key={String(item.id)} style={{ opacity: 0.6 }}>
                  <td className="description" style={{ textDecoration: 'line-through' }}>{item.description}</td>
                  <td style={{ whiteSpace: 'nowrap' }}><StoryPointsBadge points={item.storyPoints} /></td>
                  <td style={{ whiteSpace: 'nowrap' }}><PriorityBadge priority={item.priority} /></td>
                  <td className="date"><Moment format="MMM Do hh:mm:ss">{item.createdAt}</Moment></td>
                  <td>
                    <button
                      onClick={(e) => toggleDone(e as any, item.id ?? '', item.description, false)}
                      title="Reactivar tarea"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                    >
                      <ArrowUturnLeftIcon style={{ height: '20px', width: '20px', color: '#d97706' }} />
                    </button>
                  </td>
                  <td>
                    <button
                      onClick={() => deleteItem(item.id ?? '')}
                      title="Eliminar tarea"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                    >
                      <TrashIcon style={{ height: '20px', width: '20px', color: '#dc2626' }} />
                    </button>
                  </td>
                </tr>
              )
            ))}
            </TableBody>
          </table>
        </div>
      }
    </div>
  );
}
