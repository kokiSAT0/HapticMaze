import React from 'react';
import { StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

import { PlainButton } from '@/components/PlainButton';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useLocale } from '@/src/locale/LocaleContext';
import { UI } from '@/constants/ui';

import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import Svg, { Circle, Line, Rect , Polygon } from 'react-native-svg';
import { View } from 'react-native';

/* ─────────  EnemyIcon  ───────── */
interface EnemyIconProps {
  size?: number;
  spokes?: number;          // ← 本数を外から指定
  color?: string;
}

function EnemyIcon({
  size = 36,
  spokes = 24,             // ← デフォルト 24 本
  color = 'white',
}: EnemyIconProps) {

  const cell = size;
  const cx = size / 2;
  const cy = size / 2;
  const rDot = cell * 0.1;
  const rLines = cell * 0.35;
  // spokes 本の放射線を生成
  const lines = Array.from({ length: spokes }, (_, i) => {
    const rad = (i * (2 * Math.PI)) / spokes - Math.PI / 2;
    return (
      <Line
        key={i}
        x1={cx}
        y1={cy}
        x2={cx + rLines * Math.cos(rad)}
        y2={cy + rLines * Math.sin(rad)}
        stroke="white"
        strokeWidth={1}
      />
    );
  });

  return (
    <Svg width={size} height={size} accessibilityLabel="Enemy">
      {lines}
      <Circle cx={cx} cy={cy} r={rDot} fill={color} />
    </Svg>
  );
}

/* ─────────  Player／Goal アイコン  ───────── */
function PlayerIcon({ size = 36, color = 'white' }: { size?: number; color?: string }) {
  const r = size * 0.3;
  const c = size / 2;
  return (
    <Svg width={size} height={size} accessibilityLabel="Player">
      <Circle cx={c} cy={c} r={r} fill={color} />
    </Svg>
  );
}

function GoalIcon({ size = 36, color = 'white' }: { size?: number; color?: string }) {
  const pad = size * 0.25;
  const len = size * 0.5;
  return (
    <Svg width={size} height={size} accessibilityLabel="Goal">
      <Rect x={pad} y={pad} width={len} height={len} fill={color} />
    </Svg>
  );
}

/* ─────────  Visited-Goal（菱形）アイコン ───────── */
function VisitedGoalIcon({ size = 28, color = 'white' }: { size?: number; color?: string }) {
  const c  = size / 2;
  const r  = size * 0.3;          // PlayerIcon より少し小さめ
  const pts = `${c},${c - r} ${c + r},${c} ${c},${c + r} ${c - r},${c}`;
  return (
    <Svg width={size} height={size} accessibilityLabel="VisitedGoal">
      <Polygon points={pts} fill={color} />
    </Svg>
  );
}


export default function RulesScreen() {
  const router = useRouter();
  const { t } = useLocale();
  return (
    <ThemedView lightColor="#000" darkColor="#000" style={styles.container}>
      {/* 画面タイトル */}
      <ThemedText type="title" lightColor="#fff" darkColor="#fff">
        {t('howToPlay')}
      </ThemedText>
      {/* ゲームの概要説明 */}
      <ThemedText lightColor="#fff" darkColor="#fff" style={styles.text}>
        {t('ruleIntro')}
      </ThemedText>
      {/* 現在地・ゴールのサンプル */}
      <View style={styles.enemyRow}>
        <PlayerIcon />
      </View>
      <ThemedText lightColor="#fff" darkColor="#fff" style={styles.text}>
        {t('player')}
      </ThemedText>
      <View style={styles.enemyRow}>
        <GoalIcon />
      </View>
      <ThemedText lightColor="#fff" darkColor="#fff" style={styles.text}>
        {t('Goal')}
      </ThemedText>
      <View style={styles.enemyRow}>
        <VisitedGoalIcon />
      </View>
      <ThemedText lightColor="#fff" darkColor="#fff" style={styles.text}>
        {t('visitedGoals')}
      </ThemedText>
        <Ionicons name="refresh" size={24} color="#fff" />
      {/* リスポーンボタンの説明 */}
      <ThemedText lightColor="#fff" darkColor="#fff" style={styles.text}>
        {t('respawnUsage')}
      </ThemedText>
        <MaterialIcons name= "visibility" size={24} color="#fff"/>
      {/* 可視化ボタンの説明 */}
      <ThemedText lightColor="#fff" darkColor="#fff" style={styles.text}>
        {t('revealUsage')}
      </ThemedText>
       {/*敵の種類サンプル (4,6,12,24 本) */}
      <View style={styles.enemyRow}>
        <EnemyIcon spokes={4}  />
        <EnemyIcon spokes={6}  />
        <EnemyIcon spokes={12} />
        <EnemyIcon spokes={24} />
      </View>
      <ThemedText lightColor="#fff" darkColor="#fff" style={styles.text}>
        {t('enermys')}
      </ThemedText>
      <PlainButton
        title={t('backToTitle')}
        onPress={() => router.replace('/')}
        accessibilityLabel={t('backToTitle')}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: UI.screenGap /2,
    paddingHorizontal: 10,
  },
  // 説明文の幅が広くなりすぎないよう中央揃えに
  text: {
    textAlign: 'center',
  },
  enemyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: UI.screenGap,
  },
});
