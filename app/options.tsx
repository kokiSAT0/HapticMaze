import React from 'react';
import { Modal, StyleSheet, View, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';

import { PlainButton } from '@/components/PlainButton';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useLocale, type Lang } from '@/src/locale/LocaleContext';
import { useAudioControls } from '@/src/hooks/useAudioControls';
import { UI } from '@/constants/ui';
import { useHandleError } from '@/src/utils/handleError';
import { useSnackbar } from '@/src/hooks/useSnackbar';
// 広告削除機能
import { useRemoveAds, isAdsRemoved } from '@/src/iap/removeAds';

export default function OptionsScreen() {
  const router = useRouter();
  const { t, changeLang } = useLocale();

  const [showLang, setShowLang] = React.useState(false);
  const [showVolume, setShowVolume] = React.useState(false);
  // 共通エラー処理とスナックバー表示を利用
  const handleError = useHandleError();
  const { show: showSnackbar } = useSnackbar();

  // BGM や効果音の音量調整に利用する
  const audio = useAudioControls(
    require('../assets/sounds/歩く音200ms_調整.mp3'),
    require('../assets/sounds/弓と矢_調整.mp3'),
  );

  const select = (lang: Lang) => {
    changeLang(lang);
    setShowLang(false);
  };

  // 広告削除復元処理を提供するフック
  const { restore } = useRemoveAds();

  // 購入済み情報を復元する処理
  const handleRestore = async () => {
    try {
      // 購入履歴の取得結果を受け取る
      const result = await restore();
      // 復元後のフラグを参照してメッセージを切り替え
      if (result && isAdsRemoved()) {
        showSnackbar(t('restoreSuccess'));
      } else if (isAdsRemoved()) {
        // result が false でもフラグが立っていれば成功扱い
        showSnackbar(t('restoreSuccess'));
      } else {
        // 購入情報が見つからない場合はこちら
        showSnackbar(t('purchaseNotFound'));
      }
    } catch (e) {
      handleError('復元に失敗しました', e);
    }
  };


  return (
    <ThemedView lightColor="#000" darkColor="#000" style={{ flex: 1 }}>
      {/* 中央揃えを保ったままスクロールできるようにする */}
      <ScrollView contentContainerStyle={styles.container}>
        <ThemedText type="title" lightColor="#fff" darkColor="#fff">
          {t('options')}
        </ThemedText>

      <PlainButton
        title={t('volumeSettings')}
        onPress={() => setShowVolume(true)}
        accessibilityLabel={t('volumeSettings')}
      />
      <PlainButton
        title={t('changeLang')}
        onPress={() => setShowLang(true)}
        accessibilityLabel={t('changeLang')}
      />
      {/* 購入済みの復元ボタン */}
      <PlainButton
        title={t('restorePurchase')}
        onPress={handleRestore}
        accessibilityLabel={t('restorePurchase')}
      />
      <PlainButton
        title={t('backToTitle')}
        onPress={() => router.replace('/')}
        accessibilityLabel={t('backToTitle')}
      />
      </ScrollView>

      {/* 言語選択モーダル */}
      <Modal transparent visible={showLang} animationType="fade">
        <View style={styles.modalWrapper} accessible accessibilityLabel="言語選択オーバーレイ">
          <ThemedView style={styles.modalContent}>
            <ThemedText type="title" lightColor="#fff" darkColor="#fff">
              {t('selectLang')}
            </ThemedText>
            <PlainButton title={t('japanese')} onPress={() => select('ja')} accessibilityLabel={t('japanese')} />
            <PlainButton title={t('english')} onPress={() => select('en')} accessibilityLabel={t('english')} />
          </ThemedView>
        </View>
      </Modal>

      {/* 音量設定モーダル */}
      <Modal transparent visible={showVolume} animationType="fade">
        <View style={styles.modalWrapper} accessible accessibilityLabel="音量設定オーバーレイ">
          <ThemedView style={styles.modalContent}>
            <ThemedText type="title" lightColor="#fff" darkColor="#fff">
              {t('volumeSettings')}
            </ThemedText>
            <View style={styles.volumeRow}>
              <ThemedText lightColor="#fff" darkColor="#fff">
                {t('bgmVolume')}:
              </ThemedText>
              <View style={styles.volBtns}>
                <PlainButton
                  title="-"
                  onPress={audio.decBgm}
                  accessibilityLabel={t('decrease', { label: t('bgmVolume') })}
                  style={styles.volBtn}
                />
                <ThemedText style={styles.volumeNumber} lightColor="#fff" darkColor="#fff">
                  {Math.round(audio.bgmVolume * 10)}
                </ThemedText>
                <PlainButton
                  title="+"
                  onPress={audio.incBgm}
                  accessibilityLabel={t('increase', { label: t('bgmVolume') })}
                  style={styles.volBtn}
                />
              </View>
            </View>
            <View style={styles.volumeRow}>
              <ThemedText lightColor="#fff" darkColor="#fff">
                {t('seVolume')}:
              </ThemedText>
              <View style={styles.volBtns}>
                <PlainButton
                  title="-"
                  onPress={audio.decSe}
                  accessibilityLabel={t('decrease', { label: t('seVolume') })}
                  style={styles.volBtn}
                />
                <ThemedText style={styles.volumeNumber} lightColor="#fff" darkColor="#fff">
                  {Math.round(audio.seVolume * 10)}
                </ThemedText>
                <PlainButton
                  title="+"
                  onPress={audio.incSe}
                  accessibilityLabel={t('increase', { label: t('seVolume') })}
                  style={styles.volBtn}
                />
              </View>
            </View>
            <PlainButton title={t('back')} onPress={() => setShowVolume(false)} accessibilityLabel={t('cancel')} />
          </ThemedView>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: UI.screenGap,
    paddingVertical: UI.screenGap,
  },
  modalWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  modalContent: {
    gap: UI.modalGap,
    padding: UI.modalPadding,
    backgroundColor: '#000',
  },
  volumeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  volumeLabelArea: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4, // ラベルと数値の間隔
  },
  volumeNumber: {
    width: 24, // 0〜10 を右寄せで固定表示
    textAlign: 'right',
    marginLeft: 0,
  },
  volBtns: {
    flexDirection: 'row',
    gap: 2,
    alignItems: 'center',
  },
  volBtn: {
    padding: 4,
  },
});

