import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    turbopack: {
        resolveAlias: {
            'firebase/app': './lib/postgres/firebase/app.ts',
            'firebase/auth': './lib/postgres/firebase/auth.ts',
            'firebase/firestore': './lib/postgres/firebase/firestore.ts',
            'firebase/storage': './lib/postgres/firebase/storage.ts',
        },
    },
};

export default nextConfig;
