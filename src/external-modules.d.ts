// src/external-modules.d.ts
// Minimal type declarations so TypeScript is happy.

declare module "react-simple-maps" {
  import * as React from "react";

  export interface ComposableMapProps extends React.SVGProps<SVGSVGElement> {
    projection?: string | ((width: number, height: number) => any);
    projectionConfig?: any;
    style?: React.CSSProperties;
    width?: number;
    height?: number;
  }
  export const ComposableMap: React.FC<ComposableMapProps>;

  export interface GeographyProps extends React.SVGProps<SVGPathElement> {
    geography: any;
    style?: {
      default?: React.CSSProperties;
      hover?: React.CSSProperties;
      pressed?: React.CSSProperties;
    };
  }
  export const Geography: React.FC<GeographyProps>;

  export interface GeographiesRenderProps {
    geographies: any[];
  }
  export interface GeographiesProps {
    geography: string | object;
    children: (props: GeographiesRenderProps) => React.ReactNode;
  }
  export const Geographies: React.FC<GeographiesProps>;

  // Very small Marker type – good enough for this demo
  export interface MarkerProps {
    coordinates: [number, number];
    children?: React.ReactNode;
    style?: React.CSSProperties;
  }
  export const Marker: React.FC<MarkerProps>;

  // NEW: minimal ZoomableGroup typing for zoom/pan
  export interface ZoomableGroupProps {
    center?: [number, number];
    zoom?: number;
    minZoom?: number;
    maxZoom?: number;
    translateExtent?: [[number, number], [number, number]];
    onMoveEnd?: (position: any) => void;
    children?: React.ReactNode;
  }
  export const ZoomableGroup: React.FC<ZoomableGroupProps>;
}

declare module "d3-scale" {
  // Very small subset we use: scaleLinear()
  export function scaleLinear<Output = number>(): {
    domain(domain: number[]): any;
    range(range: Output[]): any;
    (value: number): Output;
  };
}
