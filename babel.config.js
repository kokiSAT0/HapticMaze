module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // どのファイルでエラーが起きたか表示するためのプラグイン
      '@babel/plugin-transform-react-jsx-source',
      // Reanimated 用プラグインは必ず最後に置く
      'react-native-reanimated/plugin',
    ],
  };
};
