import React from 'react';
import { View, Text } from 'react-native';
import type { MessageKey } from '@/src/locale/LocaleContext';
import { IS_TESTFLIGHT } from '@/src/utils/appEnv';

interface ErrorBoundaryProps {
  /** エラー発生時に呼び出されるコールバック */
  onError: (msg: string) => void;
  /** 翻訳関数。エラーメッセージ表示に利用 */
  t: (key: MessageKey) => string;
  children?: React.ReactNode;
}

interface ErrorBoundaryState {
  /** エラー発生を示すフラグ */
  hasError: boolean;
}

/**
 * React.Component を継承したエラーバウンダリ
 * ここで画面全体の例外を捕捉し簡易的なメッセージを表示する
 */
export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // 詳細をコンソールに出力しデバッグしやすくする
    console.error(error, info);
    // TestFlight ではエラー詳細を通知
      const msg = IS_TESTFLIGHT
        ? String(error)
        : this.props.t('unexpectedError');
    this.props.onError(msg);
    // フォールバック UI を表示するためフラグを立てる
    this.setState({ hasError: true });
  }

  render() {
    if (this.state.hasError) {
      // シンプルなエラーメッセージだけを表示
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>{this.props.t('unexpectedError')}</Text>
        </View>
      );
    }
    return this.props.children;
  }
}
