type RuntimeApi = {
  onMessage?: {
    addListener(listener: (...args: any[]) => any): void;
    removeListener(listener: (...args: any[]) => any): void;
  };
  sendMessage?: (...args: any[]) => any;
};

const globals = globalThis as typeof globalThis & {
  browser?: { runtime?: RuntimeApi };
  chrome?: { runtime?: RuntimeApi };
};
export const runtimeApi: RuntimeApi | undefined =
  globals.browser?.runtime ?? globals.chrome?.runtime;

export function sendRuntimeMessage(message: Record<string, unknown>) {
  try {
    const result = runtimeApi?.sendMessage?.(message);
    return result && typeof result.then === 'function'
      ? result.catch(() => false)
      : Promise.resolve(result);
  } catch {
    return Promise.resolve(false);
  }
}
