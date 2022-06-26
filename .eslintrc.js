module.exports = {
    root: true,
    env: {
      browser: true,
      node: true,
    },
    extends: [
        'plugin:vue/essential',
        'eslint:recommended',
    ],
    plugins: [],
    // add your custom rules here
    rules: {
      'vue/multi-word-component-names': 'off',
    },
  }