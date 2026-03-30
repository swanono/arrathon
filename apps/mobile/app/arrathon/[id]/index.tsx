import { useCallback, useState } from 'react'
import { View, Text, FlatList, Image, StyleSheet, ActivityIndicator, Pressable, ScrollView } from 'react-native'
import { useLocalSearchParams, router, useFocusEffect } from 'expo-router'
import { getArrathon, getParticipants, getLocations, type ArrathonSummary, type Participant, type ArrathonLocation, type LocationType } from '../../../src/api/arrathon.api'
import { useTheme } from '../../../src/theme'

const LOCATION_TYPE_ICON: Record<LocationType, string> = {
  bar: '🍺',
  apartment: '🏠',
  monument: '🏛️',
  pit_stand: '🍕',
}

export default function ArrathonScreen() {
  const theme = useTheme()
  const styles = makeStyles(theme)
  const { id } = useLocalSearchParams<{ id: string }>()

  const [arrathon, setArrathon] = useState<(ArrathonSummary & { inviteToken: string }) | null>(null)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [locations, setLocations] = useState<ArrathonLocation[]>([])
  const [loading, setLoading] = useState(true)

  useFocusEffect(
    useCallback(() => {
      if (!id) return
      setLoading(true)
      Promise.all([getArrathon(id), getParticipants(id), getLocations(id)])
        .then(([a, p, l]) => { setArrathon(a); setParticipants(p); setLocations(l) })
        .finally(() => setLoading(false))
    }, [id])
  )

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size='large' color={theme.colors.primary} />
      </View>
    )
  }

  if (!arrathon) return null

  const isOrganisator = arrathon.role === 'organisator'

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Pressable onPress={() => router.canGoBack() ? router.back() : router.replace('/(app)')} style={styles.back}>
        <Text style={styles.backText}>← Retour</Text>
      </Pressable>

      <Text style={styles.title}>{arrathon.name}</Text>
      <Text style={styles.date}>{arrathon.date}</Text>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Lieux ({locations.length})</Text>
        {isOrganisator && (
          <View style={styles.sectionActions}>
            {locations.length > 1 && (
              <Pressable onPress={() => router.push(`/arrathon/${id}/reorder-locations`)} style={styles.reorderButton}>
                <Text style={styles.reorderButtonText}>☰ Ordre</Text>
              </Pressable>
            )}
            <Pressable onPress={() => router.push(`/arrathon/${id}/add-location`)} style={styles.addButton}>
              <Text style={styles.addButtonText}>+ Ajouter</Text>
            </Pressable>
          </View>
        )}
      </View>

      {locations.length === 0 ? (
        <Text style={styles.emptyText}>Aucun lieu ajouté</Text>
      ) : (
        <View style={styles.locationList}>
          {locations.map((loc) => (
            <Pressable key={loc.id} style={styles.locationRow} onPress={() => router.push(`/arrathon/${id}/location/${loc.id}`)}>
              <Text style={styles.locationIcon}>{LOCATION_TYPE_ICON[loc.type]}</Text>
              <View style={styles.locationInfo}>
                <Text style={styles.locationName}>{loc.name}</Text>
                {loc.address && <Text style={styles.locationAddress}>{loc.address}</Text>}
              </View>
              <Text style={styles.locationOrder}>#{loc.orderPosition}</Text>
            </Pressable>
          ))}
        </View>
      )}

      <Text style={[styles.sectionTitle, styles.participantsSectionTitle]}>Participants ({participants.length})</Text>

      <View style={styles.participantList}>
        {participants.map((item) => (
          <View key={item.id} style={styles.row}>
            {item.avatarUrl ? (
              <Image source={{ uri: item.avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarInitials}>
                  {item.name.charAt(0)}{item.familyName.charAt(0)}
                </Text>
              </View>
            )}
            <Text style={styles.participantName}>{item.name} {item.familyName}</Text>
            {item.role === 'organisator' && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Orga</Text>
              </View>
            )}
          </View>
        ))}
      </View>
    </ScrollView>
  )
}

function makeStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
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
    title: {
      fontSize: theme.typography.size.xxl,
      fontWeight: theme.typography.weight.bold,
      color: theme.colors.navy,
    },
    date: {
      fontSize: theme.typography.size.md,
      color: theme.colors.navyMuted,
      marginTop: theme.spacing.xs,
      marginBottom: theme.spacing.xl,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.md,
    },
    sectionTitle: {
      fontSize: theme.typography.size.md,
      fontWeight: theme.typography.weight.semiBold,
      color: theme.colors.navy,
    },
    participantsSectionTitle: {
      marginTop: theme.spacing.xl,
      marginBottom: theme.spacing.md,
    },
    sectionActions: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    reorderButton: {
      backgroundColor: theme.colors.surface,
      paddingVertical: theme.spacing.xs,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.borderRadius.sm,
    },
    reorderButtonText: {
      color: theme.colors.navy,
      fontSize: theme.typography.size.sm,
      fontWeight: theme.typography.weight.medium,
    },
    addButton: {
      backgroundColor: theme.colors.primary,
      paddingVertical: theme.spacing.xs,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.borderRadius.sm,
    },
    addButtonText: {
      color: theme.colors.white,
      fontSize: theme.typography.size.sm,
      fontWeight: theme.typography.weight.medium,
    },
    emptyText: {
      color: theme.colors.navyMuted,
      fontSize: theme.typography.size.sm,
      marginBottom: theme.spacing.md,
    },
    locationList: {
      gap: theme.spacing.sm,
    },
    locationRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
    },
    locationIcon: {
      fontSize: 22,
    },
    locationInfo: {
      flex: 1,
    },
    locationName: {
      fontSize: theme.typography.size.md,
      fontWeight: theme.typography.weight.medium,
      color: theme.colors.navy,
    },
    locationAddress: {
      fontSize: theme.typography.size.xs,
      color: theme.colors.navyMuted,
      marginTop: 2,
    },
    locationOrder: {
      fontSize: theme.typography.size.xs,
      color: theme.colors.navyMuted,
      fontWeight: theme.typography.weight.medium,
    },
    participantList: {
      gap: theme.spacing.sm,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
    },
    avatarFallback: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarInitials: {
      color: theme.colors.white,
      fontWeight: theme.typography.weight.bold,
      fontSize: theme.typography.size.sm,
    },
    participantName: {
      flex: 1,
      fontSize: theme.typography.size.md,
      color: theme.colors.navy,
      fontWeight: theme.typography.weight.medium,
    },
    badge: {
      backgroundColor: theme.colors.primary,
      paddingVertical: 2,
      paddingHorizontal: theme.spacing.sm,
      borderRadius: theme.borderRadius.sm,
    },
    badgeText: {
      fontSize: theme.typography.size.xs,
      fontWeight: theme.typography.weight.medium,
      color: theme.colors.white,
    },
  })
}
