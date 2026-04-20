import React, { useState, useEffect, useRef } from 'react';
import NewItem from '../NewItem';
import API_LIST from '../API';
import DeleteIcon from '@mui/icons-material/Delete';
import { Button, TableBody, CircularProgress } from '@mui/material';
import Moment from 'react-moment';
import { FunnelIcon, CheckCircleIcon, ArrowUturnLeftIcon, TrashIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';
import palette from '../theme';

type Priority = 'high' | 'medium' | 'low';
type Status = 'completed' | 'inProgress' | 'pending';

type Item = {
  id?: number | string;
  description?: string;
  done?: boolean;
  createdAt?: string;
  storyPoints?: number;
  priority?: Priority;
  status?: Status;
};

const priorityColors: Record<Priority, { bg: string; text: string }> = {
  high: { bg: '#fee2e2', text: '#dc2626' },
  medium: { bg: '#fef3c7', text: '#d97706' },
  low: { bg: '#dcfce7', text: '#16a34a' },
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
      backgroundColor: palette.bgLight,
      color: palette.secondary,
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

function TaskProgressWidget({ items }: { items: Item[] }) {
  const total = items.length;
  const completed = items.filter(i => i.done || i.status === 'completed').length;
  const inProgress = items.filter(i => !i.done && i.status === 'inProgress').length;
  const pending = total - completed - inProgress;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div style={{
      backgroundColor: '#ffffff',
      border: '1px solid #e5e7eb',
      borderRadius: '16px',
      padding: '20px 24px',
      marginBottom: '20px',
      boxShadow: '0 8px 20px -4px rgba(0, 155, 119, 0.15), 0 2px 6px rgba(0, 77, 64, 0.06)',
      width: '95%',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Task Progress</p>
          <p style={{ fontSize: '32px', fontWeight: 700, margin: '4px 0 0 0', color: '#111827' }}>
            {completed} <span style={{ fontSize: '20px', color: '#9ca3af', fontWeight: 400 }}>/ {total}</span>
          </p>
          <p style={{ fontSize: '14px', color: '#16a34a', fontWeight: 600, margin: '4px 0 0 0' }}>
            {percent}% completed
          </p>
        </div>
        <span style={{
          display: 'flex',
          width: '40px',
          height: '40px',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '8px',
          backgroundColor: '#dcfce7',
        }}>
          <CheckCircleSolid style={{ width: '22px', height: '22px', color: '#16a34a' }} />
        </span>
      </div>

      <div style={{
        marginTop: '16px',
        height: '12px',
        width: '100%',
        backgroundColor: '#e5e7eb',
        borderRadius: '9999px',
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${percent}%`,
          backgroundColor: '#16a34a',
          borderRadius: '9999px',
          transition: 'width 0.3s ease',
        }} />
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '12px',
        marginTop: '16px',
      }}>
        <div style={{ backgroundColor: '#f0fdf4', padding: '12px', borderRadius: '12px', textAlign: 'center' }}>
          <p style={{ fontSize: '13px', color: '#16a34a', margin: 0 }}>Completed</p>
          <p style={{ fontSize: '20px', fontWeight: 700, color: '#16a34a', margin: '4px 0 0 0' }}>{completed}</p>
        </div>
        <div style={{ backgroundColor: '#eff6ff', padding: '12px', borderRadius: '12px', textAlign: 'center' }}>
          <p style={{ fontSize: '13px', color: '#2563eb', margin: 0 }}>In Progress</p>
          <p style={{ fontSize: '20px', fontWeight: 700, color: '#2563eb', margin: '4px 0 0 0' }}>{inProgress}</p>
        </div>
        <div style={{ backgroundColor: '#fefce8', padding: '12px', borderRadius: '12px', textAlign: 'center' }}>
          <p style={{ fontSize: '13px', color: '#d97706', margin: 0 }}>Pending</p>
          <p style={{ fontSize: '20px', fontWeight: 700, color: '#d97706', margin: '4px 0 0 0' }}>{pending}</p>
        </div>
      </div>
    </div>
  );
}

const filterOptionStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  textAlign: 'left',
  padding: '8px 16px',
  border: 'none',
  backgroundColor: 'transparent',
  color: palette.primaryDark,
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
            { id: 1, description: 'xkw', done: false, createdAt: '2026-01-14T03:22:47', storyPoints: 3, priority: 'high', status: 'pending' },
            { id: 2, description: 'asjd', done: false, createdAt: '2026-07-23T18:45:12', storyPoints: 8, priority: 'medium', status: 'inProgress' },
            { id: 3, description: 'qp', done: true, createdAt: '2025-11-02T09:10:33', storyPoints: 1, priority: 'low', status: 'completed' },
            { id: 4, description: 'mvnbx', done: false, createdAt: '2026-03-08T21:33:05', storyPoints: 5, priority: 'high', status: 'inProgress' },
            { id: 5, description: 'pt', done: true, createdAt: '2025-09-17T14:57:51', storyPoints: 2, priority: 'medium', status: 'completed' },
            { id: 6, description: 'bnmz', done: false, createdAt: '2026-06-01T07:12:29', storyPoints: 13, priority: 'low', status: 'pending' },
            { id: 7, description: 'rwq', done: false, createdAt: '2026-02-19T11:05:58', storyPoints: 5, priority: 'high', status: 'inProgress' },
            { id: 8, description: 'lkjh', done: true, createdAt: '2025-12-25T16:40:03', storyPoints: 3, priority: 'medium', status: 'completed' },
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
      <h1>My Tasks</h1>
      <TaskProgressWidget items={items} />
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
              border: `1px solid ${palette.surface}`,
              borderRadius: '0.25rem',
              backgroundColor: showFilter ? palette.bgLight : '#ffffff',
              color: palette.primary,
              fontWeight: 'bold',
              fontSize: 'max(11px, min(2vw, 14px))',
              cursor: 'pointer',
              whiteSpace: 'nowrap' as const,
            }}
          >
            <FunnelIcon style={{ height: '18px', width: '18px' }} />
            Filter
          </button>
          {showFilter && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: '100%',
              marginTop: '4px',
              backgroundColor: '#ffffff',
              border: `1px solid ${palette.surface}`,
              borderRadius: '0.5rem',
              boxShadow: '0 10px 25px -5px rgba(0, 77, 64, 0.18), 0 4px 10px rgba(0, 155, 119, 0.08)',
              zIndex: 10,
              minWidth: '180px',
              padding: '8px 0',
            }}>
              <button style={filterOptionStyle}>Priority: High</button>
              <button style={filterOptionStyle}>Priority: Medium</button>
              <button style={filterOptionStyle}>Priority: Low</button>
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
                      title="Mark as completed"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                    >
                      <CheckCircleIcon style={{ height: '22px', width: '22px', color: palette.primary }} />
                    </button>
                  </td>
                </tr>
              )
            ))}
            </TableBody>
          </table>
          <h2 id="donelist">Completed</h2>
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
                      title="Reactivate task"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                    >
                      <ArrowUturnLeftIcon style={{ height: '20px', width: '20px', color: '#d97706' }} />
                    </button>
                  </td>
                  <td>
                    <button
                      onClick={() => deleteItem(item.id ?? '')}
                      title="Delete task"
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
