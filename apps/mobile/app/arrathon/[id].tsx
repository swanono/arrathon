import { useEffect, useState } from 'react'
import { View, Text, FlatList, Image, StyleSheet, ActivityIndicator, Pressable } from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import { getArrathon, getParticipants, type ArrathonSummary, type Participant } from '../../src/api/arrathon.api'
import { useTheme } from '../../src/theme'

export default function ArrathonScreen() {
  const theme = useTheme()
  const styles = makeStyles(theme)
  const { id } = useLocalSearchParams<{ id: string }>()

  const [arrathon, setArrathon] = useState<(ArrathonSummary & { inviteToken: string }) | null>(null)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    Promise.all([getArrathon(id), getParticipants(id)])
      .then(([a, p]) => { setArrathon(a); setParticipants(p) })
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size='large' color={theme.colors.primary} />
      </View>
    )
  }

  if (!arrathon) return null

  return (
    <View style={styles.container}>
      <Pressable onPress={() => router.canGoBack() ? router.back() : router.replace('/(app)')} style={styles.back}>
        <Text style={styles.backText}>← Retour</Text>
      </Pressable>

      <Text style={styles.title}>{arrathon.name}</Text>
      <Text style={styles.date}>{arrathon.date}</Text>

      <Text style={styles.sectionTitle}>Participants ({participants.length})</Text>

      <FlatList
        data={participants}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.row}>
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
            <View style={[styles.badge, item.role === 'organisator' && styles.badgeOrga]}>
              <Text style={styles.badgeText}>
                {item.role === 'organisator' ? 'Orga' : 'Participant'}
              </Text>
            </View>
          </View>
        )}
      />
    </View>
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
      padding: theme.spacing.xl,
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
    sectionTitle: {
      fontSize: theme.typography.size.md,
      fontWeight: theme.typography.weight.semiBold,
      color: theme.colors.navy,
      marginBottom: theme.spacing.md,
    },
    list: {
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
