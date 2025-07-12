import React from 'react';
import { View, Text } from 'react-native';

interface ErrorBoundaryProps {
  /** エラー発生時に呼び出されるコールバック */
  onError: (msg: string) => void;
  children?: React.ReactNode;
}

interface ErrorBoundaryState {
  /** エラー発生を示すフラグ */
  hasError: boolean;
  /** コンポーネントスタック情報。どのファイルで起きたか確認できる */
  info?: React.ErrorInfo;
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
    // 呼び出し元にエラーを通知する
    this.props.onError('予期せぬエラーが発生しました');
    // フォールバック UI を表示するためフラグを立てる
    this.setState({ hasError: true, info });
  }

  render() {
      if (this.state.hasError) {
        // エラー時にはコンポーネントスタックを併せて表示し
        // どのファイルで発生したか確認しやすくする
        return (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>エラーが発生しました</Text>
            {this.state.info ? (
              <Text style={{ marginTop: 8, fontSize: 12, color: '#f00' }}>
                {this.state.info.componentStack}
              </Text>
            ) : null}
          </View>
        );
      }
    return this.props.children;
  }
}
