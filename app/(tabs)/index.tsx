import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { STORAGE_KEYS } from '@/constants/storage';

type Note = {
  id: string;
  title: string;
  text: string;
  createdAt: string;
  isFavorite: boolean;
};

export default function NotesScreen() {
  const [title, setTitle] = useState('');
  const [noteText, setNoteText] = useState('');
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadNotes = async () => {
      try {
        const savedNotes = await AsyncStorage.getItem(STORAGE_KEYS.notes);

        if (savedNotes) {
          setNotes(JSON.parse(savedNotes) as Note[]);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadNotes();
  }, []);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    const persistNotes = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEYS.notes, JSON.stringify(notes));
      } catch (error) {
        console.error('Failed to persist notes', error);
      }
    };

    persistNotes();
  }, [isLoading, notes]);

  const filteredNotes = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return notes;
    }

    return notes.filter((note) => {
      const haystack = `${note.title} ${note.text}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [notes, searchQuery]);

  const favoriteCount = notes.filter((note) => note.isFavorite).length;

  const addNote = () => {
    const trimmedTitle = title.trim();
    const trimmedText = noteText.trim();

    if (!trimmedTitle || !trimmedText) {
      return;
    }

    setNotes((currentNotes) => [
      {
        id: Date.now().toString(),
        title: trimmedTitle,
        text: trimmedText,
        createdAt: new Date().toISOString(),
        isFavorite: false,
      },
      ...currentNotes,
    ]);
    setTitle('');
    setNoteText('');
  };

  const deleteNote = (id: string) => {
    setNotes((currentNotes) => currentNotes.filter((note) => note.id !== id));
  };

  const toggleFavorite = (id: string) => {
    setNotes((currentNotes) =>
      currentNotes.map((note) =>
        note.id === id ? { ...note, isFavorite: !note.isFavorite } : note
      )
    );
  };

  const clearAllNotes = async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.notes);
      setNotes([]);
    } catch (error) {
      console.error('Failed to clear notes', error);
    }
  };

  const formatDate = (isoDate: string) =>
    new Intl.DateTimeFormat('uk-UA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(isoDate));

  if (isLoading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#0f766e" />
        <Text style={styles.loaderText}>Завантажуємо ваші нотатки...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Notes App</Text>
        <Text style={styles.title}>Мої нотатки</Text>
        <Text style={styles.subtitle}>
          Створюйте нотатки, знаходьте їх через пошук і зберігайте важливе між запусками.
        </Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{notes.length}</Text>
          <Text style={styles.statLabel}>Усього нотаток</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{favoriteCount}</Text>
          <Text style={styles.statLabel}>В обраному</Text>
        </View>
      </View>

      <View style={styles.composer}>
        <TextInput
          placeholder="Заголовок"
          placeholderTextColor="#94a3b8"
          value={title}
          onChangeText={setTitle}
          style={styles.titleInput}
        />
        <TextInput
          placeholder="Опишіть думку, задачу або ідею"
          placeholderTextColor="#94a3b8"
          value={noteText}
          onChangeText={setNoteText}
          multiline
          style={styles.input}
        />

        <Pressable onPress={addNote} style={styles.addButton}>
          <Text style={styles.addButtonLabel}>Додати нотатку</Text>
        </Pressable>
      </View>

      <View style={styles.searchRow}>
        <TextInput
          placeholder="Пошук за заголовком або текстом"
          placeholderTextColor="#94a3b8"
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
        />
        <Pressable onPress={clearAllNotes} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonLabel}>Очистити</Text>
        </Pressable>
      </View>

      <FlatList
        data={filteredNotes}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        contentContainerStyle={filteredNotes.length === 0 ? styles.emptyList : styles.list}
        renderItem={({ item, index }) => (
          <View style={styles.noteCard}>
            <View style={styles.noteHeader}>
              <View style={styles.noteHeaderText}>
                <Text style={styles.noteIndex}>Нотатка {index + 1}</Text>
                <Text style={styles.noteTitle}>{item.title}</Text>
              </View>
              <Pressable onPress={() => toggleFavorite(item.id)} style={styles.favoriteButton}>
                <Text style={styles.favoriteLabel}>{item.isFavorite ? '★' : '☆'}</Text>
              </Pressable>
            </View>
            <Text style={styles.noteText}>{item.text}</Text>
            <Text style={styles.noteDate}>{formatDate(item.createdAt)}</Text>
            <Pressable onPress={() => deleteNote(item.id)} style={styles.deleteButton}>
              <Text style={styles.deleteButtonLabel}>Видалити</Text>
            </Pressable>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>
              {notes.length === 0 ? 'Поки що нотаток немає' : 'Нічого не знайдено'}
            </Text>
            <Text style={styles.emptyText}>
              {notes.length === 0
                ? 'Створіть перший запис, щоб побачити його в цьому списку.'
                : 'Спробуйте змінити пошуковий запит або очистити фільтр.'}
            </Text>
          </View>
        }
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 72,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 24,
  },
  eyebrow: {
    color: '#0f766e',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  title: {
    color: '#0f172a',
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 10,
  },
  subtitle: {
    color: '#475569',
    fontSize: 16,
    lineHeight: 24,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ecfeff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#a5f3fc',
  },
  statValue: {
    color: '#155e75',
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 6,
  },
  statLabel: {
    color: '#0f766e',
    fontSize: 14,
    fontWeight: '600',
  },
  composer: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 16,
    shadowColor: '#0f172a',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 20,
    elevation: 3,
    marginBottom: 16,
  },
  titleInput: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#0f172a',
    marginBottom: 12,
  },
  input: {
    minHeight: 100,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 16,
    color: '#0f172a',
    textAlignVertical: 'top',
    marginBottom: 14,
  },
  addButton: {
    backgroundColor: '#0f766e',
    borderRadius: 16,
    alignItems: 'center',
    paddingVertical: 14,
  },
  addButtonLabel: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  searchRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#0f172a',
  },
  secondaryButton: {
    backgroundColor: '#e2e8f0',
    borderRadius: 16,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  secondaryButtonLabel: {
    color: '#0f172a',
    fontSize: 14,
    fontWeight: '700',
  },
  list: {
    gap: 12,
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: 48,
  },
  noteCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 8,
  },
  noteHeaderText: {
    flex: 1,
  },
  noteIndex: {
    color: '#0f766e',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  noteTitle: {
    color: '#0f172a',
    fontSize: 20,
    fontWeight: '700',
  },
  favoriteButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoriteLabel: {
    fontSize: 24,
    color: '#f59e0b',
  },
  noteText: {
    color: '#0f172a',
    fontSize: 16,
    lineHeight: 23,
    marginBottom: 10,
  },
  noteDate: {
    color: '#64748b',
    fontSize: 13,
    marginBottom: 14,
  },
  deleteButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#fee2e2',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  deleteButtonLabel: {
    color: '#b91c1c',
    fontSize: 14,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyTitle: {
    color: '#0f172a',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 10,
  },
  emptyText: {
    color: '#64748b',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    gap: 12,
  },
  loaderText: {
    color: '#475569',
    fontSize: 16,
  },
});
