import {
  addListener,
  extensionApi,
  getCurrentWindow,
  getTab,
  recentlyClosed,
  removeTab,
  restoreSession,
  sendMessage,
  queryTabs,
  updateTab,
} from './browser-api';
import { Tab } from './types';

const activationHistory = new Map<number, number[]>();
const firstSeen = new Map<number, Map<number, number>>();
const paletteOwners = new Map<number, number>();
const undoByWindow = new Map<number, { sessionId?: string; expires: number }>();

function remember(windowId: number, tabId: number) {
  const history = activationHistory.get(windowId) || [];
  activationHistory.set(windowId, [tabId, ...history.filter((id) => id !== tabId)].slice(0, 50));
  const seen = firstSeen.get(windowId) || new Map<number, number>();
  if (!seen.has(tabId)) seen.set(tabId, Date.now());
  firstSeen.set(windowId, seen);
}

function tabInfo(tab: Record<string, any>): Tab | null {
  if (!Number.isInteger(tab.id)) return null;
  return {
    id: tab.id,
    windowId: tab.windowId,
    title: tab.title || 'New tab',
    url: tab.url || '',
    favIconUrl: tab.favIconUrl || '',
    status: tab.status || 'complete',
    active: Boolean(tab.active),
    hidden: Boolean(tab.hidden),
  };
}

function orderedTabs(windowId: number, tabs: Tab[]) {
  const history = activationHistory.get(windowId) || [];
  const seen = firstSeen.get(windowId) || new Map<number, number>();
  const rank = (tab: Tab) => {
    const recent = history.indexOf(tab.id);
    return recent < 0 ? 1000 : recent;
  };
  return [...tabs].sort(
    (a, b) =>
      Number(Boolean(b.active)) - Number(Boolean(a.active)) ||
      rank(a) - rank(b) ||
      (seen.get(a.id) || 0) - (seen.get(b.id) || 0) ||
      a.id - b.id,
  );
}

async function currentWindowTabs(windowId: number) {
  const tabs = (await queryTabs({ windowId }))
    .map(tabInfo)
    .filter((tab): tab is Tab => Boolean(tab));
  const seen = firstSeen.get(windowId) || new Map<number, number>();
  for (const tab of tabs) if (!seen.has(tab.id)) seen.set(tab.id, Date.now());
  firstSeen.set(windowId, seen);
  for (const tab of tabs) if (tab.active) remember(windowId, tab.id);
  return orderedTabs(windowId, tabs);
}

async function notifyPalette(windowId: number) {
  const owner = paletteOwners.get(windowId);
  if (owner === undefined) return;
  const tabs = await currentWindowTabs(windowId);
  if (!(await sendMessage(owner, { type: 'better-tabs:tabs-updated', tabs })))
    paletteOwners.delete(windowId);
}

async function openTabControls(tabId?: number) {
  const win = await getCurrentWindow().catch(() => null);
  if (!win || !Number.isInteger(win.id)) return;
  const tabs = await currentWindowTabs(win.id);
  const active = Number.isInteger(tabId) ? tabId : tabs.find((tab) => tab.active)?.id;
  if (!Number.isInteger(active)) return;
  const activeId = active as number;
  paletteOwners.set(win.id, activeId);
  await sendMessage(activeId, { type: 'better-tabs:launcher', tabs });
}

async function closeTab(tabId: number) {
  const tab = await getTab(tabId);
  if (!tab || !Number.isInteger(tab.windowId)) return;
  await removeTab(tabId);
  activationHistory.set(
    tab.windowId,
    (activationHistory.get(tab.windowId) || []).filter((id) => id !== tabId),
  );
  firstSeen.get(tab.windowId)?.delete(tabId);
  const closed = await recentlyClosed();
  undoByWindow.set(tab.windowId, {
    sessionId: closed[0]?.tab?.sessionId,
    expires: Date.now() + 5000,
  });
  await notifyPalette(tab.windowId);
}

addListener(extensionApi?.commands?.onCommand, (command: string) => {
  if (command === 'open-launcher') void openTabControls();
});
addListener(extensionApi?.action?.onClicked, () => void openTabControls());
addListener(extensionApi?.runtime?.onMessage, async (message: Record<string, any>) => {
  if (message.type === 'better-tabs:open-launcher') await openTabControls(message.tabId);
  if (message.type === 'better-tabs:activate' && Number.isInteger(message.tabId)) {
    const tab = await getTab(message.tabId);
    if (tab?.windowId !== undefined) remember(tab.windowId, message.tabId);
    await updateTab(message.tabId, { active: true });
    if (tab?.windowId !== undefined) await notifyPalette(tab.windowId);
  }
  if (message.type === 'better-tabs:close-tab' && Number.isInteger(message.tabId))
    await closeTab(message.tabId);
  if (message.type === 'better-tabs:undo') {
    const win = await getCurrentWindow().catch(() => null);
    const undo = win?.id === undefined ? undefined : undoByWindow.get(win.id);
    if (undo && undo.expires >= Date.now()) {
      await restoreSession(undo.sessionId);
      if (win?.id !== undefined) undoByWindow.delete(win.id);
    }
  }
});
addListener(
  extensionApi?.tabs?.onActivated,
  ({ windowId, tabId }: { windowId: number; tabId: number }) => {
    remember(windowId, tabId);
    void notifyPalette(windowId);
  },
);
addListener(
  extensionApi?.tabs?.onCreated,
  ({ windowId }: { windowId: number }) => void notifyPalette(windowId),
);
addListener(
  extensionApi?.tabs?.onUpdated,
  (_tabId: number, change: Record<string, any>, tab: Record<string, any>) => {
    if (
      change.title !== undefined ||
      change.url !== undefined ||
      change.status !== undefined ||
      change.favIconUrl !== undefined
    )
      void notifyPalette(tab.windowId);
  },
);
addListener(extensionApi?.tabs?.onRemoved, (tabId: number, { windowId }: { windowId: number }) => {
  activationHistory.set(
    windowId,
    (activationHistory.get(windowId) || []).filter((id) => id !== tabId),
  );
  firstSeen.get(windowId)?.delete(tabId);
  void notifyPalette(windowId);
});
