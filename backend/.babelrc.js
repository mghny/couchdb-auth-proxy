module.exports = {
  presets: [
    [
      "@babel/preset-env",
      {
        targets: {
          node: true,
          esmodules: true,
        },
      },
    ],
  ],
};
