export type Tab = {
  id: number;
  windowId?: number;
  title: string;
  url: string;
  favIconUrl: string;
  status: string;
  active?: boolean;
  hidden?: boolean;
};

export type View = { kind: 'tab-controls'; tabs: Tab[] };
