import { useCallback, useState } from 'react'
import { View, Text, Image, StyleSheet, ActivityIndicator, Pressable } from 'react-native'
import { useLocalSearchParams, router, useFocusEffect } from 'expo-router'
import DraggableFlatList, { ScaleDecorator, type RenderItemParams } from 'react-native-draggable-flatlist'
import { toast } from 'sonner-native'
import {
  getArrathon,
  getParticipants,
  getLocations,
  reorderLocations,
  type ArrathonSummary,
  type Participant,
  type ArrathonLocation,
  type LocationType,
} from '../../../src/api/arrathon.api'
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
  const [reorderMode, setReorderMode] = useState(false)
  const [reorderBuffer, setReorderBuffer] = useState<ArrathonLocation[]>([])
  const [savingOrder, setSavingOrder] = useState(false)

  useFocusEffect(
    useCallback(() => {
      if (!id) return
      setLoading(true)
      Promise.all([getArrathon(id), getParticipants(id), getLocations(id)])
        .then(([a, p, l]) => { setArrathon(a); setParticipants(p); setLocations(l) })
        .finally(() => setLoading(false))
    }, [id])
  )

  const enterReorderMode = useCallback(() => {
    setReorderBuffer([...locations])
    setReorderMode(true)
  }, [locations])

  const cancelReorder = useCallback(() => {
    setReorderMode(false)
    setReorderBuffer([])
  }, [])

  const saveReorder = useCallback(async () => {
    setSavingOrder(true)
    try {
      const order = reorderBuffer.map((loc, i) => ({ id: loc.id, orderPosition: i + 1 }))
      await reorderLocations(id, order)
      setLocations(reorderBuffer)
      setReorderMode(false)
      toast.success('Ordre enregistré !')
    } catch {
      toast.error('Erreur lors de la sauvegarde')
    } finally {
      setSavingOrder(false)
    }
  }, [id, reorderBuffer])

  const renderLocationItem = useCallback(({ item, drag, isActive }: RenderItemParams<ArrathonLocation>) => (
    <ScaleDecorator>
      {reorderMode ? (
        <View style={[styles.locationRow, styles.locationRowGap, isActive && styles.locationRowActive]}>
          <Text style={styles.locationIcon}>{LOCATION_TYPE_ICON[item.type]}</Text>
          <View style={styles.locationInfo}>
            <Text style={styles.locationName}>{item.name}</Text>
            {item.address && <Text style={styles.locationAddress}>{item.address}</Text>}
          </View>
          <Pressable onPressIn={drag} style={styles.dragHandle} hitSlop={12}>
            <Text style={styles.dragHandleIcon}>☰</Text>
          </Pressable>
        </View>
      ) : (
        <Pressable
          style={[styles.locationRow, styles.locationRowGap]}
          onPress={() => router.push(`/arrathon/${id}/location/${item.id}`)}
        >
          <Text style={styles.locationIcon}>{LOCATION_TYPE_ICON[item.type]}</Text>
          <View style={styles.locationInfo}>
            <Text style={styles.locationName}>{item.name}</Text>
            {item.address && <Text style={styles.locationAddress}>{item.address}</Text>}
          </View>
          <Text style={styles.locationOrder}>#{item.orderPosition}</Text>
        </Pressable>
      )}
    </ScaleDecorator>
  ), [reorderMode, id, styles])

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size='large' color={theme.colors.primary} />
      </View>
    )
  }

  if (!arrathon) return null

  const isOrganisator = arrathon.role === 'organisator'
  const listData = reorderMode ? reorderBuffer : locations

  const ListHeader = (
    <View style={styles.header}>
      <Pressable onPress={() => router.canGoBack() ? router.back() : router.replace('/(app)')} style={styles.back}>
        <Text style={styles.backText}>← Retour</Text>
      </Pressable>

      <Text style={styles.title}>{arrathon.name}</Text>
      <Text style={styles.date}>{arrathon.date}</Text>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Lieux ({locations.length})</Text>
        {isOrganisator && (
          reorderMode ? (
            <View style={styles.sectionActions}>
              <Pressable onPress={cancelReorder} style={styles.cancelReorderButton}>
                <Text style={styles.cancelReorderText}>Annuler</Text>
              </Pressable>
              <Pressable onPress={saveReorder} style={styles.saveReorderButton} disabled={savingOrder}>
                {savingOrder
                  ? <ActivityIndicator size='small' color={theme.colors.white} />
                  : <Text style={styles.saveReorderText}>Enregistrer</Text>
                }
              </Pressable>
            </View>
          ) : (
            <View style={styles.sectionActions}>
              {locations.length > 1 && (
                <Pressable onPress={enterReorderMode} style={styles.reorderButton}>
                  <Text style={styles.reorderButtonText}>☰ Ordre</Text>
                </Pressable>
              )}
              <Pressable onPress={() => router.push(`/arrathon/${id}/add-location`)} style={styles.addButton}>
                <Text style={styles.addButtonText}>+ Ajouter</Text>
              </Pressable>
            </View>
          )
        )}
      </View>

      {locations.length === 0 && (
        <Text style={styles.emptyText}>Aucun lieu ajouté</Text>
      )}
    </View>
  )

  const ListFooter = (
    <View style={styles.footer}>
      <Text style={[styles.sectionTitle, styles.participantsSectionTitle]}>
        Participants ({participants.length})
      </Text>
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
    </View>
  )

  return (
    <DraggableFlatList
      data={listData}
      onDragEnd={({ data }) => setReorderBuffer(data)}
      keyExtractor={(item) => item.id}
      renderItem={renderLocationItem}
      ListHeaderComponent={ListHeader}
      ListFooterComponent={ListFooter}
      contentContainerStyle={styles.content}
      containerStyle={styles.container}
      keyboardShouldPersistTaps='handled'
      activationDistance={reorderMode ? 5 : 999}
    />
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
      paddingBottom: theme.spacing.xl * 2,
    },
    header: {
      padding: theme.spacing.xl,
      paddingBottom: 0,
    },
    footer: {
      padding: theme.spacing.xl,
      paddingTop: 0,
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
    cancelReorderButton: {
      paddingVertical: theme.spacing.xs,
      paddingHorizontal: theme.spacing.md,
    },
    cancelReorderText: {
      color: theme.colors.navyMuted,
      fontSize: theme.typography.size.sm,
    },
    saveReorderButton: {
      backgroundColor: theme.colors.primary,
      paddingVertical: theme.spacing.xs,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.borderRadius.sm,
      minWidth: 90,
      alignItems: 'center',
    },
    saveReorderText: {
      color: theme.colors.white,
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
    locationRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
    },
    locationRowGap: {
      marginHorizontal: theme.spacing.xl,
      marginBottom: theme.spacing.sm,
    },
    locationRowActive: {
      opacity: 0.9,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 8,
    },
    locationIcon: { fontSize: 22 },
    locationInfo: { flex: 1 },
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
    dragHandle: { paddingHorizontal: theme.spacing.sm },
    dragHandleIcon: { fontSize: 20, color: theme.colors.navyMuted },
    participantsSectionTitle: {
      marginTop: theme.spacing.xl,
      marginBottom: theme.spacing.md,
    },
    participantList: { gap: theme.spacing.sm },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
    },
    avatar: { width: 40, height: 40, borderRadius: 20 },
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
