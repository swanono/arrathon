import { useEffect, useState } from 'react'
import { View, Text, FlatList, Pressable, StyleSheet, ActivityIndicator } from 'react-native'
import { router } from 'expo-router'
import { getMyArrathons, type ArrathonSummary } from '../../src/api/arrathon.api'
import { useTheme } from '../../src/theme'

export default function HomeScreen() {
  const theme = useTheme()
  const styles = makeStyles(theme)
  const [arrathons, setArrathons] = useState<ArrathonSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMyArrathons()
      .then(setArrathons)
      .finally(() => setLoading(false))
  }, [])

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mes Arrathons</Text>
        <Pressable
          style={({ pressed }) => [styles.createBtn, pressed && styles.createBtnPressed]}
          onPress={() => router.push('/create-arrathon')}
        >
          <Text style={styles.createBtnText}>+ Créer</Text>
        </Pressable>
      </View>

      {loading ? (
        <ActivityIndicator color={theme.colors.primary} style={styles.loader} />
      ) : arrathons.length === 0 ? (
        <Text style={styles.empty}>Aucun arrathon pour l'instant</Text>
      ) : (
        <FlatList
          data={arrathons}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardRow}>
                <Text style={styles.cardName}>{item.name}</Text>
                <View style={[styles.badge, item.role === 'organisator' && styles.badgeOrga]}>
                  <Text style={styles.badgeText}>
                    {item.role === 'organisator' ? 'Orga' : 'Participant'}
                  </Text>
                </View>
              </View>
              <Text style={styles.cardDate}>{item.date}</Text>
            </View>
          )}
        />
      )}
    </View>
  )
}

function makeStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: theme.spacing.xl,
      paddingBottom: theme.spacing.md,
    },
    title: {
      fontSize: theme.typography.size.xl,
      fontWeight: theme.typography.weight.bold,
      color: theme.colors.navy,
    },
    createBtn: {
      backgroundColor: theme.colors.primary,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.borderRadius.sm,
      ...theme.shadows.btn3dPrimary,
    },
    createBtnPressed: {
      transform: [{ translateY: 2 }],
      elevation: 2,
    },
    createBtnText: {
      color: theme.colors.white,
      fontWeight: theme.typography.weight.semiBold,
      fontSize: theme.typography.size.sm,
    },
    loader: {
      marginTop: theme.spacing.xxl,
    },
    empty: {
      textAlign: 'center',
      marginTop: theme.spacing.xxl,
      color: theme.colors.navyMuted,
      fontSize: theme.typography.size.md,
    },
    list: {
      padding: theme.spacing.md,
      gap: theme.spacing.md,
    },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      gap: theme.spacing.xs,
      ...theme.shadows.card,
    },
    cardRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    cardName: {
      fontSize: theme.typography.size.md,
      fontWeight: theme.typography.weight.semiBold,
      color: theme.colors.navy,
      flex: 1,
    },
    cardDate: {
      fontSize: theme.typography.size.sm,
      color: theme.colors.navyMuted,
    },
    badge: {
      backgroundColor: theme.colors.border,
      paddingVertical: 2,
      paddingHorizontal: theme.spacing.sm,
      borderRadius: theme.borderRadius.sm,
    },
    badgeOrga: {
      backgroundColor: theme.colors.primary,
    },
    badgeText: {
      fontSize: theme.typography.size.xs,
      fontWeight: theme.typography.weight.medium,
      color: theme.colors.white,
    },
  })
}
