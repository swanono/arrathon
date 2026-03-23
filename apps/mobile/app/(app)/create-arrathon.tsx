import { useState } from 'react'
import { View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator, Platform } from 'react-native'
import { router } from 'expo-router'
import DateTimePicker from '@react-native-community/datetimepicker'
import { toast } from 'sonner-native'
import { createArrathon } from '../../src/api/arrathon.api'
import { useTheme } from '../../src/theme'

export default function CreateArrathonScreen() {
  const theme = useTheme()
  const styles = makeStyles(theme)

  const [name, setName] = useState('')
  const [date, setDate] = useState<Date>(new Date())
  const [showPicker, setShowPicker] = useState(false)
  const [nameError, setNameError] = useState('')
  const [loading, setLoading] = useState(false)

  function formatDate(d: Date): string {
    return d.toISOString().split('T')[0]!
  }

  function formatDateDisplay(d: Date): string {
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
  }

  function validate() {
    if (!name.trim()) {
      setNameError('Le nom est requis')
      return false
    }
    setNameError('')
    return true
  }

  async function handleSubmit() {
    if (!validate()) return
    setLoading(true)
    try {
      const arrathon = await createArrathon({ name: name.trim(), date: formatDate(date) })
      toast.success('Arrathon créé !', { description: arrathon.name })
      router.replace(`/arrathon/${arrathon.id}` as never)
    } catch {
      toast.error('Erreur lors de la création')
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nouvel arrathon</Text>

      <View style={styles.field}>
        <Text style={styles.label}>Nom *</Text>
        <TextInput
          style={[styles.input, nameError ? styles.inputError : null]}
          value={name}
          onChangeText={setName}
          placeholder='Ex: Arrathon de printemps'
          placeholderTextColor={theme.colors.navyMuted}
        />
        {nameError ? <Text style={styles.error}>{nameError}</Text> : null}
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Date *</Text>
        <Pressable style={styles.dateBtn} onPress={() => setShowPicker(true)}>
          <Text style={styles.dateBtnText}>{formatDateDisplay(date)}</Text>
        </Pressable>
        {(showPicker || Platform.OS === 'ios') && (
          <DateTimePicker
            value={date}
            mode='date'
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            minimumDate={new Date()}
            onChange={(_, selected) => {
              setShowPicker(false)
              if (selected) setDate(selected)
            }}
          />
        )}
      </View>

      <Pressable
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading
          ? <ActivityIndicator color={theme.colors.white} />
          : <Text style={styles.buttonText}>Créer</Text>
        }
      </Pressable>

      <Pressable style={styles.cancel} onPress={() => router.back()}>
        <Text style={styles.cancelText}>Annuler</Text>
      </Pressable>
    </View>
  )
}

function makeStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      padding: theme.spacing.xl,
      gap: theme.spacing.lg,
    },
    title: {
      fontSize: theme.typography.size.xl,
      fontWeight: theme.typography.weight.bold,
      color: theme.colors.navy,
      marginTop: theme.spacing.xl,
    },
    field: {
      gap: theme.spacing.xs,
    },
    label: {
      fontSize: theme.typography.size.sm,
      fontWeight: theme.typography.weight.medium,
      color: theme.colors.navy,
    },
    input: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.sm,
      padding: theme.spacing.md,
      fontSize: theme.typography.size.md,
      color: theme.colors.navy,
      backgroundColor: theme.colors.surface,
    },
    inputError: {
      borderColor: theme.colors.error,
    },
    error: {
      fontSize: theme.typography.size.xs,
      color: theme.colors.error,
    },
    dateBtn: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.sm,
      padding: theme.spacing.md,
      backgroundColor: theme.colors.surface,
    },
    dateBtnText: {
      fontSize: theme.typography.size.md,
      color: theme.colors.navy,
    },
    button: {
      backgroundColor: theme.colors.primary,
      paddingVertical: theme.spacing.md,
      borderRadius: theme.borderRadius.lg,
      alignItems: 'center',
      ...theme.shadows.btn3dPrimary,
    },
    buttonPressed: {
      transform: [{ translateY: 2 }],
      elevation: 2,
    },
    buttonText: {
      fontSize: theme.typography.size.md,
      fontWeight: theme.typography.weight.semiBold,
      color: theme.colors.white,
    },
    cancel: {
      alignItems: 'center',
    },
    cancelText: {
      fontSize: theme.typography.size.sm,
      color: theme.colors.navyMuted,
    },
  })
}
