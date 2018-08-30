module.exports = {
  "env": {},
  "extends": [
      "eslint-config-alloy",
  ],
  "plugins": [],
  "rules": {
      "no-use-before-define": 'off'
  },
  "globals": {
      "global": true,
      "describe": true,
      "it": true,
      "expect": true,
      "before": true,
      "after": true,
      "sinon": true
  }
};
