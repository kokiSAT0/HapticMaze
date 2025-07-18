import React from 'react';
import { View, Text } from 'react-native';
import { IS_TESTFLIGHT } from '@/src/utils/appEnv';

interface ErrorBoundaryProps {
  /** エラー発生時に呼び出されるコールバック */
  onError: (msg: string) => void;
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
      : '予期せぬエラーが発生しました';
    this.props.onError(msg);
    // フォールバック UI を表示するためフラグを立てる
    this.setState({ hasError: true });
  }

  render() {
    if (this.state.hasError) {
      // シンプルなエラーメッセージだけを表示
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>エラーが発生しました</Text>
        </View>
      );
    }
    return this.props.children;
  }
}
