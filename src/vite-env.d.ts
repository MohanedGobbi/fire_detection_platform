/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MAPBOX_TOKEN: string;
  readonly VITE_DETECTION_SERVER?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
