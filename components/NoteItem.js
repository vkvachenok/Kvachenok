import React from 'react';
import { Text, TouchableOpacity } from 'react-native';

export default function NoteItem({ note, onDelete }) {
  return (
    <TouchableOpacity onPress={() => onDelete(note.id)}>
      <Text style={{ marginTop: 10 }}>{note.text}</Text>
    </TouchableOpacity>
  );
}