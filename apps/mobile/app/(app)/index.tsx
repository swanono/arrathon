import { useState, useCallback } from 'react'
import { View, Text, FlatList, Pressable, StyleSheet, ActivityIndicator, Share } from 'react-native'
import { router, useFocusEffect } from 'expo-router'
import { getMyArrathons, getArrathon, type ArrathonSummary } from '../../src/api/arrathon.api'
import { useTheme } from '../../src/theme'

export default function HomeScreen() {
  const theme = useTheme()
  const styles = makeStyles(theme)
  const [arrathons, setArrathons] = useState<ArrathonSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState('')

  async function handleShare(id: string) {
    const arrathon = await getArrathon(id)
    const url = `${process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000'}/join/${arrathon.inviteToken}`
    await Share.share({ message: url })
  }

  useFocusEffect(
    useCallback(() => {
      setLoading(true)
      setFetchError('')
      getMyArrathons()
        .then(setArrathons)
        .catch((e) => setFetchError(e?.message ?? 'Erreur inconnue'))
        .finally(() => setLoading(false))
    }, [])
  )

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
      ) : fetchError ? (
        <Text style={styles.empty}>Erreur : {fetchError}</Text>
      ) : arrathons.length === 0 ? (
        <Text style={styles.empty}>Aucun arrathon pour l'instant</Text>
      ) : (
        <FlatList
          data={arrathons}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Pressable style={styles.card} onPress={() => router.push(`/arrathon/${item.id}` as never)}>
              <View style={styles.cardRow}>
                <Text style={styles.cardName}>{item.name}</Text>
                {item.role === 'organisator' && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>Orga</Text>
                  </View>
                )}
              </View>
              <Text style={styles.cardDate}>{item.date}</Text>
              {item.role === 'organisator' && (
                <Pressable onPress={() => handleShare(item.id)} style={styles.shareBtn}>
                  <Text style={styles.shareBtnText}>Inviter des participants</Text>
                </Pressable>
              )}
            </Pressable>
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
    shareBtn: {
      marginTop: theme.spacing.xs,
      alignSelf: 'flex-start',
    },
    shareBtnText: {
      fontSize: theme.typography.size.xs,
      color: theme.colors.primary,
      fontWeight: theme.typography.weight.medium,
    },
  })
}
