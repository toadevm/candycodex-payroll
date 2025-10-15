// Declare custom elements for Reown AppKit
declare namespace JSX {
  interface IntrinsicElements {
    "appkit-button": React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement>,
      HTMLElement
    >;
  }
}
