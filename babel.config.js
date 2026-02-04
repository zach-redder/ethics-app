module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // No Reanimated plugin needed - using gesture-handler instead
  };
};
