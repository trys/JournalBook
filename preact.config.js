import envVars from 'preact-cli-plugin-env-vars';
import netlifyPlugin from 'preact-cli-plugin-netlify';

export default function(config, env, helpers) {
  if (env.isProd) {
    // Make async work
    let babel = config.module.loaders.filter(
      loader => loader.loader === 'babel-loader'
    )[0].options;
    // Blacklist regenerator within env preset:
    babel.presets[0][1].exclude.push('transform-async-to-generator');
    // Add fast-async
    babel.plugins.push([require.resolve('fast-async'), { spec: true }]);
  }

  netlifyPlugin(config);

  envVars(config, env, helpers);
}
