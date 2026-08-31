type AnyApi = Record<string, any>;

const globals = globalThis as typeof globalThis & { browser?: AnyApi; chrome?: AnyApi };
const api: AnyApi | undefined = globals.browser ?? globals.chrome;

export const extensionApi = api;
export const runtimeApi = api?.runtime;

function isPromise<T>(value: unknown): value is Promise<T> {
  return Boolean(value && typeof (value as Promise<T>).then === 'function');
}

export function callApi<T>(method: (...args: any[]) => any, context: AnyApi, ...args: any[]) {
  return new Promise<T>((resolve, reject) => {
    let settled = false;
    const done = (value: T) => {
      if (!settled) {
        settled = true;
        const error = globals.chrome?.runtime?.lastError;
        if (error) reject(new Error(error.message));
        else resolve(value);
      }
    };
    try {
      const result = method.call(context, ...args, done);
      if (isPromise<T>(result)) result.then(done).catch(reject);
      else if (result !== undefined) done(result);
    } catch (error) {
      reject(error);
    }
  });
}

export async function queryTabs(query: AnyApi) {
  return (await callApi<AnyApi[]>(api?.tabs.query, api?.tabs, query)) || [];
}

export async function getCurrentWindow() {
  return callApi<AnyApi>(api?.windows.getCurrent, api?.windows, { populate: false });
}

export async function sendMessage(tabId: number, message: AnyApi) {
  try {
    return await callApi(api?.tabs.sendMessage, api?.tabs, tabId, message);
  } catch {
    return false;
  }
}

export async function sendRuntimeMessage(message: AnyApi) {
  try {
    return await callApi(runtimeApi?.sendMessage, runtimeApi, message);
  } catch {
    return false;
  }
}

export async function updateTab(tabId: number, changes: AnyApi) {
  try {
    return await callApi(api?.tabs.update, api?.tabs, tabId, changes);
  } catch {
    return null;
  }
}

export async function removeTab(tabId: number) {
  try {
    return await callApi(api?.tabs.remove, api?.tabs, tabId);
  } catch {
    return null;
  }
}

export async function getTab(tabId: number) {
  try {
    return await callApi<AnyApi>(api?.tabs.get, api?.tabs, tabId);
  } catch {
    return null;
  }
}

export async function recentlyClosed(maxResults = 1) {
  try {
    return await callApi<AnyApi[]>(api?.sessions.getRecentlyClosed, api?.sessions, { maxResults });
  } catch {
    return [];
  }
}

export async function restoreSession(sessionId?: string) {
  try {
    return await callApi(api?.sessions.restore, api?.sessions, sessionId);
  } catch {
    return null;
  }
}

export function addListener(event: AnyApi, listener: (...args: any[]) => any) {
  event?.addListener?.(listener);
}
