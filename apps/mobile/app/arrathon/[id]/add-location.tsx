import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import { toast } from 'sonner-native'
import { searchPlaces, getPlaceDetails, addLocation, type PlaceSuggestion, type LocationType } from '../../../src/api/arrathon.api'
import { useTheme } from '../../../src/theme'

const LOCATION_TYPES: { value: LocationType; label: string; icon: string }[] = [
  { value: 'bar', label: 'Bar', icon: '🍺' },
  { value: 'apartment', label: 'Appartement', icon: '🏠' },
  { value: 'monument', label: 'Monument', icon: '🏛️' },
  { value: 'pit_stand', label: 'Ravito', icon: '🍕' },
]

export default function AddLocationScreen() {
  const theme = useTheme()
  const styles = makeStyles(theme)
  const { id } = useLocalSearchParams<{ id: string }>()

  const sessionToken = useMemo(() => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16)
    })
  }, [])
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([])
  const [searching, setSearching] = useState(false)

  const [selectedName, setSelectedName] = useState('')
  const [selectedAddress, setSelectedAddress] = useState('')
  const [selectedGooglePlaceId, setSelectedGooglePlaceId] = useState('')
  const [selectedType, setSelectedType] = useState<LocationType>('bar')
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleQueryChange = useCallback((text: string) => {
    setQuery(text)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!text.trim()) {
      setSuggestions([])
      return
    }
    debounceRef.current = setTimeout(async () => {
      setSearching(true)
      const results = await searchPlaces(text, sessionToken)
      setSuggestions(results)
      setSearching(false)
    }, 300)
  }, [sessionToken])

  const handleSelectSuggestion = useCallback(async (suggestion: PlaceSuggestion) => {
    setSuggestions([])
    setQuery(suggestion.mainText)
    setLoadingDetails(true)
    try {
      const details = await getPlaceDetails(suggestion.placeId, sessionToken)
      setSelectedGooglePlaceId(details.googlePlaceId)
      setSelectedName(details.name)
      setSelectedAddress(details.address)
      setSelectedType(details.suggestedType)
    } catch {
      toast.error('Impossible de charger les détails du lieu')
    } finally {
      setLoadingDetails(false)
    }
  }, [sessionToken])

  const handleSubmit = useCallback(async () => {
    if (!selectedGooglePlaceId || !selectedName) {
      toast.error('Sélectionne un lieu dans la liste')
      return
    }
    setSubmitting(true)
    try {
      await addLocation(id, {
        googlePlaceId: selectedGooglePlaceId,
        name: selectedName,
        address: selectedAddress,
        type: selectedType,
      })
      toast.success('Lieu ajouté !')
      router.back()
    } catch {
      toast.error('Erreur lors de l\'ajout du lieu')
    } finally {
      setSubmitting(false)
    }
  }, [id, selectedGooglePlaceId, selectedName, selectedAddress, selectedType])

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps='handled'>
        <Pressable onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>← Retour</Text>
        </Pressable>

        <Text style={styles.title}>Ajouter un lieu</Text>

        <Text style={styles.label}>Rechercher un lieu</Text>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.input}
            placeholder='Ex: Le Comptoir, Sacré-Coeur...'
            placeholderTextColor={theme.colors.navyMuted}
            value={query}
            onChangeText={handleQueryChange}
            autoFocus
          />
          {searching && <ActivityIndicator size='small' color={theme.colors.primary} style={styles.searchSpinner} />}
        </View>

        {suggestions.length > 0 && (
          <View style={styles.suggestions}>
            {suggestions.map((s) => (
              <Pressable key={s.placeId} onPress={() => handleSelectSuggestion(s)} style={styles.suggestion}>
                <Text style={styles.suggestionMain}>{s.mainText}</Text>
                <Text style={styles.suggestionSecondary}>{s.secondaryText}</Text>
              </Pressable>
            ))}
          </View>
        )}

        {loadingDetails && (
          <ActivityIndicator size='small' color={theme.colors.primary} style={styles.detailsSpinner} />
        )}

        {selectedGooglePlaceId !== '' && !loadingDetails && (
          <>
            <Text style={styles.label}>Nom</Text>
            <TextInput
              style={styles.input}
              value={selectedName}
              onChangeText={setSelectedName}
              placeholderTextColor={theme.colors.navyMuted}
            />

            <Text style={styles.label}>Adresse</Text>
            <TextInput
              style={styles.input}
              value={selectedAddress}
              onChangeText={setSelectedAddress}
              placeholderTextColor={theme.colors.navyMuted}
            />

            <Text style={styles.label}>Type</Text>
            <View style={styles.typeRow}>
              {LOCATION_TYPES.map((t) => (
                <Pressable
                  key={t.value}
                  onPress={() => setSelectedType(t.value)}
                  style={[styles.typeButton, selectedType === t.value && styles.typeButtonActive]}
                >
                  <Text style={styles.typeIcon}>{t.icon}</Text>
                  <Text style={[styles.typeLabel, selectedType === t.value && styles.typeLabelActive]}>
                    {t.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Pressable onPress={handleSubmit} style={styles.submitButton} disabled={submitting}>
              {submitting ? (
                <ActivityIndicator size='small' color={theme.colors.white} />
              ) : (
                <Text style={styles.submitText}>Ajouter ce lieu</Text>
              )}
            </Pressable>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

function makeStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    flex: {
      flex: 1,
    },
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      padding: theme.spacing.xl,
      paddingBottom: theme.spacing.xl * 2,
    },
    back: {
      marginBottom: theme.spacing.md,
      marginTop: theme.spacing.xl,
    },
    backText: {
      color: theme.colors.primary,
      fontSize: theme.typography.size.sm,
      fontWeight: theme.typography.weight.medium,
    },
    title: {
      fontSize: theme.typography.size.xxl,
      fontWeight: theme.typography.weight.bold,
      color: theme.colors.navy,
      marginBottom: theme.spacing.xl,
    },
    label: {
      fontSize: theme.typography.size.sm,
      fontWeight: theme.typography.weight.semiBold,
      color: theme.colors.navy,
      marginBottom: theme.spacing.xs,
      marginTop: theme.spacing.md,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
    },
    input: {
      flex: 1,
      padding: theme.spacing.md,
      fontSize: theme.typography.size.md,
      color: theme.colors.navy,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
    },
    searchSpinner: {
      marginRight: theme.spacing.md,
    },
    suggestions: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      marginTop: theme.spacing.xs,
      overflow: 'hidden',
    },
    suggestion: {
      padding: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.background,
    },
    suggestionMain: {
      fontSize: theme.typography.size.md,
      fontWeight: theme.typography.weight.medium,
      color: theme.colors.navy,
    },
    suggestionSecondary: {
      fontSize: theme.typography.size.xs,
      color: theme.colors.navyMuted,
      marginTop: 2,
    },
    detailsSpinner: {
      marginTop: theme.spacing.lg,
    },
    typeRow: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
      flexWrap: 'wrap',
      marginTop: theme.spacing.xs,
    },
    typeButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.surface,
      borderWidth: 2,
      borderColor: 'transparent',
    },
    typeButtonActive: {
      borderColor: theme.colors.primary,
    },
    typeIcon: {
      fontSize: 18,
    },
    typeLabel: {
      fontSize: theme.typography.size.sm,
      color: theme.colors.navyMuted,
      fontWeight: theme.typography.weight.medium,
    },
    typeLabelActive: {
      color: theme.colors.primary,
    },
    submitButton: {
      backgroundColor: theme.colors.primary,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      alignItems: 'center',
      marginTop: theme.spacing.xl,
    },
    submitText: {
      color: theme.colors.white,
      fontSize: theme.typography.size.md,
      fontWeight: theme.typography.weight.semiBold,
    },
  })
}
