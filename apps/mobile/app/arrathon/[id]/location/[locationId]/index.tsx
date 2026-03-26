import { useCallback, useEffect, useState } from 'react'
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Linking,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import { toast } from 'sonner-native'
import { getLocation, updateLocationMetadata, type ArrathonLocation, type LocationMetadata, type LocationType } from '../../../../../src/api/arrathon.api'
import { useTheme } from '../../../../../src/theme'

const LOCATION_TYPE_ICON: Record<LocationType, string> = {
  bar: '🍺',
  apartment: '🏠',
  monument: '🏛️',
  pit_stand: '🍕',
}

export default function LocationDetailScreen() {
  const theme = useTheme()
  const styles = makeStyles(theme)
  const { id, locationId } = useLocalSearchParams<{ id: string; locationId: string }>()

  const [location, setLocation] = useState<ArrathonLocation | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [note, setNote] = useState('')
  const [entryCode, setEntryCode] = useState('')
  const [floor, setFloor] = useState('')

  useEffect(() => {
    if (!id || !locationId) return
    getLocation(id, locationId)
      .then((loc) => {
        setLocation(loc)
        setNote(loc.metadata?.note ?? '')
        setEntryCode(loc.metadata?.entryCode ?? '')
        setFloor(loc.metadata?.floor ?? '')
      })
      .finally(() => setLoading(false))
  }, [id, locationId])

  const handleSave = useCallback(async () => {
    if (!location) return
    const metadata: LocationMetadata = {}
    if (note.trim()) metadata.note = note.trim()
    if (entryCode.trim()) metadata.entryCode = entryCode.trim()
    if (floor.trim()) metadata.floor = floor.trim()

    setSaving(true)
    try {
      await updateLocationMetadata(id, locationId, metadata)
      setLocation((prev) => prev ? { ...prev, metadata } : prev)
      toast.success('Enregistré !')
    } catch {
      toast.error('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }, [id, locationId, note, entryCode, floor, location])

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size='large' color={theme.colors.primary} />
      </View>
    )
  }

  if (!location) return null

  const isOrganisator = (location as ArrathonLocation & { role?: string }).role === 'organisator'
  const gd = location.googleData ?? {}
  const md = location.metadata ?? {}
  const hasGoogleData = !!(gd.phone || gd.openingHours?.length || gd.websiteUri)
  const hasMetadata = !!(md.note || md.entryCode || md.floor)

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Pressable onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>← Retour</Text>
        </Pressable>

        <View style={styles.header}>
          <Text style={styles.typeIcon}>{LOCATION_TYPE_ICON[location.type]}</Text>
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

          {isOrganisator ? (
            <>
              {location.type === 'apartment' && (
                <>
                  <Text style={styles.label}>Code d'entrée</Text>
                  <TextInput
                    style={styles.input}
                    value={entryCode}
                    onChangeText={setEntryCode}
                    placeholder='Ex: A1234'
                    placeholderTextColor={theme.colors.navyMuted}
                  />
                  <Text style={styles.label}>Étage</Text>
                  <TextInput
                    style={styles.input}
                    value={floor}
                    onChangeText={setFloor}
                    placeholder='Ex: 3ème'
                    placeholderTextColor={theme.colors.navyMuted}
                  />
                </>
              )}
              <Text style={styles.label}>Note</Text>
              <TextInput
                style={[styles.input, styles.inputMultiline]}
                value={note}
                onChangeText={setNote}
                placeholder='Ex: Sonner 3 fois, demander Marie...'
                placeholderTextColor={theme.colors.navyMuted}
                multiline
                numberOfLines={3}
              />
              <Pressable onPress={handleSave} style={styles.saveButton} disabled={saving}>
                {saving
                  ? <ActivityIndicator size='small' color={theme.colors.white} />
                  : <Text style={styles.saveText}>Enregistrer</Text>
                }
              </Pressable>
            </>
          ) : hasMetadata ? (
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
          ) : null}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

function makeStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    flex: { flex: 1 },
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.background,
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
    header: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: theme.spacing.md,
      marginBottom: theme.spacing.xl,
    },
    typeIcon: {
      fontSize: 36,
      marginTop: 2,
    },
    headerInfo: {
      flex: 1,
    },
    name: {
      fontSize: theme.typography.size.xxl,
      fontWeight: theme.typography.weight.bold,
      color: theme.colors.navy,
    },
    address: {
      fontSize: theme.typography.size.sm,
      color: theme.colors.navyMuted,
      marginTop: theme.spacing.xs,
    },
    section: {
      marginBottom: theme.spacing.xl,
    },
    sectionTitle: {
      fontSize: theme.typography.size.md,
      fontWeight: theme.typography.weight.semiBold,
      color: theme.colors.navy,
      marginBottom: theme.spacing.md,
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      paddingVertical: theme.spacing.sm,
    },
    infoIcon: {
      fontSize: 18,
    },
    infoLink: {
      fontSize: theme.typography.size.md,
      color: theme.colors.primary,
      flex: 1,
    },
    hoursBox: {
      marginTop: theme.spacing.sm,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      gap: theme.spacing.xs,
    },
    hoursTitle: {
      fontSize: theme.typography.size.xs,
      fontWeight: theme.typography.weight.semiBold,
      color: theme.colors.navyMuted,
      marginBottom: theme.spacing.xs,
    },
    hoursRow: {
      fontSize: theme.typography.size.sm,
      color: theme.colors.navy,
    },
    label: {
      fontSize: theme.typography.size.sm,
      fontWeight: theme.typography.weight.semiBold,
      color: theme.colors.navy,
      marginBottom: theme.spacing.xs,
      marginTop: theme.spacing.md,
    },
    input: {
      padding: theme.spacing.md,
      fontSize: theme.typography.size.md,
      color: theme.colors.navy,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
    },
    inputMultiline: {
      minHeight: 80,
      textAlignVertical: 'top',
    },
    saveButton: {
      backgroundColor: theme.colors.primary,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      alignItems: 'center',
      marginTop: theme.spacing.xl,
    },
    saveText: {
      color: theme.colors.white,
      fontSize: theme.typography.size.md,
      fontWeight: theme.typography.weight.semiBold,
    },
    readRow: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.sm,
    },
    readLabel: {
      fontSize: theme.typography.size.xs,
      color: theme.colors.navyMuted,
      fontWeight: theme.typography.weight.medium,
      marginBottom: 2,
    },
    readValue: {
      fontSize: theme.typography.size.md,
      color: theme.colors.navy,
      fontWeight: theme.typography.weight.medium,
    },
  })
}
