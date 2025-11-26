// instrumentation.ts
export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        console.log('[Instrumentation] Starting NanoSystem initialization...');
        const NanoSystem = (await import('@/service/nano/System')).default;
        NanoSystem.initialize();
        console.log('[Instrumentation] NanoSystem successfully initialized.');
    }
}
