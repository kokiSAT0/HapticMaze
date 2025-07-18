import * as Updates from 'expo-updates';

/**
 * TestFlight ビルドかどうか判定する定数
 * expo-updates の channel 名が 'testflight' のとき true
 */
export const IS_TESTFLIGHT = Updates.channel === 'testflight';
