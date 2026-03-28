import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  ScrollView,
  Linking,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import { toast } from 'sonner-native'
import {
  getLocation,
  updateLocationMetadata,
  updateLocationDetails,
  deleteLocation,
  searchPlaces,
  getPlaceDetails,
  type ArrathonLocation,
  type LocationMetadata,
  type LocationType,
  type PlaceSuggestion,
} from '../../../../../src/api/arrathon.api'
import { useTheme } from '../../../../../src/theme'
import { makeStyles } from './styles'

const LOCATION_TYPE_ICON: Record<LocationType, string> = {
  bar: '🍺',
  apartment: '🏠',
  monument: '🏛️',
  pit_stand: '🍕',
}

const LOCATION_TYPES: { value: LocationType; label: string }[] = [
  { value: 'bar', label: 'Bar' },
  { value: 'apartment', label: 'Appartement' },
  { value: 'monument', label: 'Monument' },
  { value: 'pit_stand', label: 'Ravito' },
]

export default function LocationDetailScreen() {
  const theme = useTheme()
  const styles = makeStyles(theme)
  const { id, locationId } = useLocalSearchParams<{ id: string; locationId: string }>()

  const [location, setLocation] = useState<ArrathonLocation | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [editMode, setEditMode] = useState(false)

  const [editName, setEditName] = useState('')
  const [editGooglePlaceId, setEditGooglePlaceId] = useState('')
  const [editAddress, setEditAddress] = useState('')
  const [editType, setEditType] = useState<LocationType>('bar')
  const [editNote, setEditNote] = useState('')
  const [editEntryCode, setEditEntryCode] = useState('')
  const [editFloor, setEditFloor] = useState('')

  const [addressQuery, setAddressQuery] = useState('')
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([])
  const [searching, setSearching] = useState(false)
  const [loadingDetails, setLoadingDetails] = useState(false)

  const sessionToken = useMemo(() => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16)
    })
  }, [])
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [])

  useEffect(() => {
    if (!id || !locationId) return
    getLocation(id, locationId)
      .then((loc) => setLocation(loc))
      .finally(() => setLoading(false))
  }, [id, locationId])

  const enterEditMode = useCallback(() => {
    if (!location) return
    setEditName(location.name)
    setEditGooglePlaceId('')
    setEditAddress(location.address ?? '')
    setEditType(location.type)
    setEditNote(location.metadata?.note ?? '')
    setEditEntryCode(location.metadata?.entryCode ?? '')
    setEditFloor(location.metadata?.floor ?? '')
    setAddressQuery('')
    setSuggestions([])
    setEditMode(true)
  }, [location])

  const cancelEditMode = useCallback(() => {
    setEditMode(false)
    setSuggestions([])
    if (debounceRef.current) clearTimeout(debounceRef.current)
  }, [])

  const handleAddressQueryChange = useCallback((text: string) => {
    setAddressQuery(text)
    setEditGooglePlaceId('')
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (text.trim().length < 3) { setSuggestions([]); return }
    debounceRef.current = setTimeout(async () => {
      setSearching(true)
      const results = await searchPlaces(text, sessionToken)
      setSuggestions(results)
      setSearching(false)
    }, 300)
  }, [sessionToken])

  const handleSelectSuggestion = useCallback(async (suggestion: PlaceSuggestion) => {
    setSuggestions([])
    setLoadingDetails(true)
    try {
      const details = await getPlaceDetails(suggestion.placeId, sessionToken)
      setEditGooglePlaceId(details.googlePlaceId)
      setEditAddress(details.address)
      setAddressQuery(details.address)
    } catch {
      toast.error('Impossible de charger les détails du lieu')
    } finally {
      setLoadingDetails(false)
    }
  }, [sessionToken])

  const handleSave = useCallback(async () => {
    const placeId = editGooglePlaceId || location?.locationId
    if (!placeId || !editName.trim()) { toast.error('Le nom est requis'); return }
    setSaving(true)
    try {
      await updateLocationDetails(id, locationId, {
        googlePlaceId: placeId,
        name: editName.trim(),
        address: editAddress,
        type: editType,
      })
      const metadata: LocationMetadata = {}
      if (editNote.trim()) metadata.note = editNote.trim()
      if (editEntryCode.trim()) metadata.entryCode = editEntryCode.trim()
      if (editFloor.trim()) metadata.floor = editFloor.trim()
      await updateLocationMetadata(id, locationId, metadata)
      setLocation((prev) => prev
        ? { ...prev, name: editName.trim(), address: editAddress, type: editType, metadata }
        : prev)
      setEditMode(false)
      toast.success('Lieu modifié !')
    } catch {
      toast.error('Erreur lors de la modification')
    } finally {
      setSaving(false)
    }
  }, [id, locationId, editGooglePlaceId, editName, editAddress, editType, editNote, editEntryCode, editFloor, location])

  const handleDelete = useCallback(() => {
    Alert.alert(
      'Supprimer ce lieu',
      `Supprimer "${location?.name}" de l'itinéraire ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true)
            try {
              await deleteLocation(id, locationId)
              toast.success('Lieu supprimé')
              router.replace(`/arrathon/${id}`)
            } catch {
              toast.error('Erreur lors de la suppression')
              setDeleting(false)
            }
          },
        },
      ],
    )
  }, [id, locationId, location])

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size='large' color={theme.colors.primary} />
      </View>
    )
  }

  if (!location) return null

  const isOrganisator = location.userRole === 'organisator'
  const gd = location.googleData ?? {}
  const md = location.metadata ?? {}
  const hasGoogleData = !!(gd.phone || gd.openingHours?.length || gd.websiteUri)

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps='handled'
      >
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} style={styles.back}>
            <Text style={styles.backText}>← Retour</Text>
          </Pressable>
          {isOrganisator && !editMode && (
            <Pressable onPress={enterEditMode} style={styles.editBtn}>
              <Text style={styles.editBtnText}>Modifier</Text>
            </Pressable>
          )}
          {editMode && (
            <Pressable onPress={cancelEditMode} style={styles.cancelBtn}>
              <Text style={styles.cancelBtnText}>Annuler</Text>
            </Pressable>
          )}
        </View>

        {editMode ? (
          <View style={styles.editSection}>
            <Text style={styles.label}>Nom</Text>
            <TextInput
              style={styles.input}
              value={editName}
              onChangeText={setEditName}
              placeholderTextColor={theme.colors.navyMuted}
            />

            <Text style={styles.label}>Adresse</Text>
            <Text style={styles.currentAddress}>{editAddress || '—'}</Text>
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                value={addressQuery}
                onChangeText={handleAddressQueryChange}
                placeholder='Changer via Google Places...'
                placeholderTextColor={theme.colors.navyMuted}
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
            {loadingDetails && <ActivityIndicator size='small' color={theme.colors.primary} style={styles.detailsSpinner} />}

            <Text style={styles.label}>Type</Text>
            <View style={styles.typeRow}>
              {LOCATION_TYPES.map((t) => (
                <Pressable
                  key={t.value}
                  onPress={() => setEditType(t.value)}
                  style={[styles.typeButton, editType === t.value && styles.typeButtonActive]}
                >
                  <Text style={styles.typeIcon}>{LOCATION_TYPE_ICON[t.value]}</Text>
                  <Text style={[styles.typeLabel, editType === t.value && styles.typeLabelActive]}>{t.label}</Text>
                </Pressable>
              ))}
            </View>

            {editType === 'apartment' && (
              <>
                <Text style={styles.label}>Code d'entrée</Text>
                <TextInput
                  style={styles.input}
                  value={editEntryCode}
                  onChangeText={setEditEntryCode}
                  placeholder='Ex: A1234'
                  placeholderTextColor={theme.colors.navyMuted}
                />
                <Text style={styles.label}>Étage</Text>
                <TextInput
                  style={styles.input}
                  value={editFloor}
                  onChangeText={setEditFloor}
                  placeholder='Ex: 3ème'
                  placeholderTextColor={theme.colors.navyMuted}
                />
              </>
            )}

            <Text style={styles.label}>Note</Text>
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              value={editNote}
              onChangeText={setEditNote}
              placeholder='Ex: Sonner 3 fois, demander Marie...'
              placeholderTextColor={theme.colors.navyMuted}
              multiline
              numberOfLines={3}
            />

            <Pressable onPress={handleSave} style={styles.saveButton} disabled={saving || loadingDetails}>
              {saving
                ? <ActivityIndicator size='small' color={theme.colors.white} />
                : <Text style={styles.saveText}>Enregistrer les modifications</Text>
              }
            </Pressable>
            <Pressable onPress={handleDelete} style={styles.deleteButton} disabled={deleting}>
              {deleting
                ? <ActivityIndicator size='small' color={theme.colors.error} />
                : <Text style={styles.deleteText}>Supprimer ce lieu</Text>
              }
            </Pressable>
          </View>
        ) : (
          <>
            <View style={styles.header}>
              <Text style={styles.typeIconLg}>{LOCATION_TYPE_ICON[location.type]}</Text>
              <View style={styles.headerInfo}>
                <Text style={styles.name}>{location.name}</Text>
                {location.address && <Text style={styles.address}>{location.address}</Text>}
              </View>
            </View>

            {hasGoogleData && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Informations</Text>
                {gd.phone && (
                  <Pressable onPress={() => Linking.openURL(`tel:${gd.phone}`)} style={styles.infoRow}>
                    <Text style={styles.infoIcon}>📞</Text>
                    <Text style={styles.infoLink}>{gd.phone}</Text>
                  </Pressable>
                )}
                {gd.websiteUri && (
                  <Pressable onPress={() => Linking.openURL(gd.websiteUri!)} style={styles.infoRow}>
                    <Text style={styles.infoIcon}>🌐</Text>
                    <Text style={styles.infoLink} numberOfLines={1}>{gd.websiteUri}</Text>
                  </Pressable>
                )}
                {gd.openingHours && gd.openingHours.length > 0 && (
                  <View style={styles.hoursBox}>
                    <Text style={styles.hoursTitle}>Horaires</Text>
                    {gd.openingHours.map((h, i) => (
                      <Text key={i} style={styles.hoursRow}>{h}</Text>
                    ))}
                  </View>
                )}
              </View>
            )}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Notes & infos pratiques</Text>
              {md.entryCode || md.floor || md.note ? (
                <>
                  {md.entryCode && (
                    <View style={styles.readRow}>
                      <Text style={styles.readLabel}>Code d'entrée</Text>
                      <Text style={styles.readValue}>{md.entryCode}</Text>
                    </View>
                  )}
                  {md.floor && (
                    <View style={styles.readRow}>
                      <Text style={styles.readLabel}>Étage</Text>
                      <Text style={styles.readValue}>{md.floor}</Text>
                    </View>
                  )}
                  {md.note && (
                    <View style={styles.readRow}>
                      <Text style={styles.readLabel}>Note</Text>
                      <Text style={styles.readValue}>{md.note}</Text>
                    </View>
                  )}
                </>
              ) : (
                <Text style={styles.emptyMeta}>
                  {isOrganisator ? 'Aucune info renseignée — tap Modifier pour ajouter.' : 'Aucune info renseignée.'}
                </Text>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
