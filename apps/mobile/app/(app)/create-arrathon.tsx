import { useState } from 'react'
import { View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator } from 'react-native'
import { router } from 'expo-router'
import { createArrathon } from '../../src/api/arrathon.api'
import { useTheme } from '../../src/theme'

export default function CreateArrathonScreen() {
  const theme = useTheme()
  const styles = makeStyles(theme)

  const [name, setName] = useState('')
  const [date, setDate] = useState('')
  const [nameError, setNameError] = useState('')
  const [dateError, setDateError] = useState('')
  const [loading, setLoading] = useState(false)

  function validate() {
    let valid = true
    setNameError('')
    setDateError('')

    if (!name.trim()) {
      setNameError('Le nom est requis')
      valid = false
    }
    const dateMatch = date.match(/^\d{4}-\d{2}-\d{2}$/)
    const parsedDate = dateMatch ? new Date(date) : null
    if (!dateMatch || !parsedDate || isNaN(parsedDate.getTime())) {
      setDateError('Format requis : AAAA-MM-JJ')
      valid = false
    }
    return valid
  }

  async function handleSubmit() {
    if (!validate()) return
    setLoading(true)
    try {
      await createArrathon({ name: name.trim(), date })
      router.back()
    } catch {
      setNameError('Erreur lors de la création')
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
        <Text style={styles.label}>Date * (AAAA-MM-JJ)</Text>
        <TextInput
          style={[styles.input, dateError ? styles.inputError : null]}
          value={date}
          onChangeText={setDate}
          placeholder='Ex: 2026-06-21'
          placeholderTextColor={theme.colors.navyMuted}
          keyboardType='numeric'
        />
        {dateError ? <Text style={styles.error}>{dateError}</Text> : null}
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
