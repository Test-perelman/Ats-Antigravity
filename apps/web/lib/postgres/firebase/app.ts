const apps: unknown[] = [];

export function initializeApp(config: unknown) {
    const app = { config };
    apps.push(app);
    return app;
}

export function getApps() {
    return apps;
}
