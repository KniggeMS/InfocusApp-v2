const withNextIntl = require('next-intl/plugin')();

// Trigger Vercel Build

const nextConfig = {
    transpilePackages: ["ui"],
    eslint: {
        ignoreDuringBuilds: true,
    },
};

module.exports = withNextIntl(nextConfig);
