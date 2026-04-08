import React, { useState } from 'react';
import Button from '@mui/material/Button';

interface NewItemProps {
  addItem: (text: string) => void;
  isInserting: boolean;
}

export default function NewItem(props: NewItemProps) {
  const [item, setItem] = useState<string>('');
  function handleSubmit(e: React.FormEvent) {
    if (!item.trim()) {
      e.preventDefault();
      return;
    }
    props.addItem(item);
    setItem('');
    e.preventDefault();
  }
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setItem(e.target.value);
  }
  return (
    <div id="newinputform">
      <form>
        <input
          id="newiteminput"
          placeholder="New item"
          type="text"
          autoComplete="off"
          value={item}
          onChange={handleChange}
          onKeyDown={event => {
            if (event.key === 'Enter') {
              handleSubmit(event as unknown as React.FormEvent);
            }
          }}
        />
        <span>&nbsp;&nbsp;</span>
        <Button
          className="AddButton"
          variant="contained"
          disabled={props.isInserting}
          onClick={!props.isInserting ? handleSubmit : undefined}
          size="small"
        >
          {props.isInserting ? 'Adding…' : 'Add'}
        </Button>
      </form>
    </div>
  );
}
