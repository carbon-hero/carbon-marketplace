declare module '*.less' {
  const content: any;
  export default content;
}

declare module '*.svg' {
  const value: any;
  export default value;
}

declare module '*.png' {
  const value: any;
  export default value;
}

declare namespace JSX {
  interface IntrinsicElements {
    'model-viewer': ModelViewerElement;
  }
}

declare global {
  interface Window {
    ethereum: any;
  }
}
