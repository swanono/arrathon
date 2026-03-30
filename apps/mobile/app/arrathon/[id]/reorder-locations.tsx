import { useCallback, useEffect, useState } from 'react'
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import DraggableFlatList, { ScaleDecorator, type RenderItemParams } from 'react-native-draggable-flatlist'
import { toast } from 'sonner-native'
import { getLocations, reorderLocations, type ArrathonLocation, type LocationType } from '../../../src/api/arrathon.api'
import { useTheme } from '../../../src/theme'

const LOCATION_TYPE_ICON: Record<LocationType, string> = {
  bar: '🍺',
  apartment: '🏠',
  monument: '🏛️',
  pit_stand: '🍕',
}

export default function ReorderLocationsScreen() {
  const theme = useTheme()
  const styles = makeStyles(theme)
  const { id } = useLocalSearchParams<{ id: string }>()

  const [locations, setLocations] = useState<ArrathonLocation[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!id) return
    getLocations(id)
      .then((locs) => setLocations([...locs].sort((a, b) => a.orderPosition - b.orderPosition)))
      .finally(() => setLoading(false))
  }, [id])

  const handleSave = useCallback(async () => {
    setSaving(true)
    try {
      const order = locations.map((loc, i) => ({ id: loc.id, orderPosition: i + 1 }))
      await reorderLocations(id, order)
      toast.success('Ordre enregistré !')
      router.back()
    } catch {
      toast.error('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }, [id, locations])

  const renderItem = useCallback(({ item, drag, isActive }: RenderItemParams<ArrathonLocation>) => (
    <ScaleDecorator>
      <View style={[styles.row, isActive && styles.rowActive]}>
        <Text style={styles.icon}>{LOCATION_TYPE_ICON[item.type]}</Text>
        <View style={styles.info}>
          <Text style={styles.name}>{item.name}</Text>
          {item.address && <Text style={styles.address}>{item.address}</Text>}
        </View>
        <Pressable onPressIn={drag} style={styles.handle} hitSlop={12}>
          <Text style={styles.handleIcon}>☰</Text>
        </Pressable>
      </View>
    </ScaleDecorator>
  ), [styles])

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size='large' color={theme.colors.primary} />
      </View>
    )
  }

  return (
    <View style={styles.flex}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.cancelBtn}>
          <Text style={styles.cancelText}>Annuler</Text>
        </Pressable>
        <Text style={styles.title}>Réordonner</Text>
        <Pressable onPress={handleSave} style={styles.saveBtn} disabled={saving}>
          {saving
            ? <ActivityIndicator size='small' color={theme.colors.white} />
            : <Text style={styles.saveText}>Enregistrer</Text>
          }
        </Pressable>
      </View>

      <DraggableFlatList
        data={locations}
        onDragEnd={({ data }) => setLocations(data)}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />
    </View>
  )
}

function makeStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    flex: { flex: 1, backgroundColor: theme.colors.background },
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.background,
    },
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.xl,
      paddingTop: theme.spacing.xl * 2,
      paddingBottom: theme.spacing.md,
      backgroundColor: theme.colors.background,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.surface,
    },
    title: {
      fontSize: theme.typography.size.md,
      fontWeight: theme.typography.weight.semiBold,
      color: theme.colors.navy,
    },
    cancelBtn: {},
    cancelText: {
      color: theme.colors.navyMuted,
      fontSize: theme.typography.size.sm,
    },
    saveBtn: {
      backgroundColor: theme.colors.primary,
      paddingVertical: theme.spacing.xs,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.borderRadius.sm,
      minWidth: 90,
      alignItems: 'center',
    },
    saveText: {
      color: theme.colors.white,
      fontSize: theme.typography.size.sm,
      fontWeight: theme.typography.weight.medium,
    },
    list: {
      padding: theme.spacing.xl,
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
    rowActive: {
      opacity: 0.9,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 8,
    },
    icon: { fontSize: 22 },
    info: { flex: 1 },
    name: {
      fontSize: theme.typography.size.md,
      fontWeight: theme.typography.weight.medium,
      color: theme.colors.navy,
    },
    address: {
      fontSize: theme.typography.size.xs,
      color: theme.colors.navyMuted,
      marginTop: 2,
    },
    handle: {
      paddingHorizontal: theme.spacing.sm,
    },
    handleIcon: {
      fontSize: 20,
      color: theme.colors.navyMuted,
    },
  })
}
