/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import createNextIntlPlugin from 'next-intl/plugin';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  webpack: (config) => {
    // Add resolve alias for ~ to point to node_modules
    config.resolve.alias['~'] = path.resolve(__dirname, 'node_modules');
    return config;
  },
  turbopack: {
    root: path.resolve(__dirname),
    resolveAlias: {
      '~': path.resolve(__dirname, 'node_modules'),
    },
  },
};

export default withNextIntl(nextConfig);
