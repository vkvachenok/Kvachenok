import React, { useState } from 'react';
import { View, Text, TextInput, Button, FlatList } from 'react-native';

export default function HomeScreen() {
  const [text, setText] = useState('');
  const [notes, setNotes] = useState([]);

  const addNote = () => {
    if (text.trim() === '') return;
    setNotes([...notes, { id: Date.now().toString(), text }]);
    setText('');
  };

  const deleteNote = (id) => {
    setNotes(notes.filter(note => note.id !== id));
  };

  return (
    <View style={{ padding: 20 }}>
      <TextInput
        placeholder="Введи нотатку"
        value={text}
        onChangeText={setText}
        style={{ borderWidth: 1, marginBottom: 10, padding: 8 }}
      />

      <Button title="Додати" onPress={addNote} />

      <FlatList
        data={notes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Text onPress={() => deleteNote(item.id)} style={{ marginTop: 10 }}>
            {item.text}
          </Text>
        )}
      />
    </View>
  );
}