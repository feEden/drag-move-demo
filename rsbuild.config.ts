import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginLess } from '@rsbuild/plugin-less';
import path from 'path';

export default defineConfig({
  plugins: [pluginLess(), pluginReact()],
  html: {
    title: 'drag move demo',
  },
  output: {
    distPath: {
      root: 'docs'
    },
  }
});
