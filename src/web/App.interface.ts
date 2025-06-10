export type ComponentEvent = {
  flags: number | null;
  key: string | null;
  componentName?: string;
};

export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
}

export type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
};

export type CsvDataType = {
  animations: string;
  draw: string;
  gpu: string;
  input: string;
  measure: string;
  misc: string;
  sync: string;
  timestamp: string;
};

export type ReactEventType = {
  timestamp: string;
  event: {
    change?: {
      name: string | null;
      key: string | null;
    };
    list?: ComponentEvent[];
  };
};

export type ReactItemType = {
  x: string;
  y: number;
  label: string;
  data: ComponentEvent[];
  radius?: number;
  hoverRadius?: number;
  backgroundColor?: string;
  borderColor?: string;
};

export type LogItem = {
  x: string;
  y: number;
  label: string;
  data: string;
};
export type LogEvent = {
  timestamp: string;
  event: string;
};

export type ModalDataType = { label?: string; data?: ComponentEvent[] };
