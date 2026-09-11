// Minimal type surface for the vendored offline React class-component runtime.
// Application models, numerical code and component props remain typed.
declare namespace React {
  type ReactNode = any;
  class Component<P = {}, S = {}> {
    constructor(props: P); props: Readonly<P>; state: Readonly<S>;
    setState(state: Partial<S> | ((prev: S) => Partial<S>), callback?: () => void): void;
    forceUpdate(callback?: () => void): void;
  }
  function createElement(type: any, props?: any, ...children: any[]): any;
}
declare const ReactDOM: { render(node: any, target: Element | null): void };
declare namespace JSX {
  interface Element {} interface ElementClass { render: any }
  interface ElementAttributesProperty { props: {} }
  interface IntrinsicElements { [name: string]: any }
}
