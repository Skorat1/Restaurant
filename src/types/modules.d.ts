declare module "@vercel/speed-insights/next" {
  import React from "react";
  export function SpeedInsights(props: {
    beforeSend?: (data: any) => any;
    sampleRate?: number;
    route?: string;
    endpoint?: string;
    dsn?: string;
  }): React.ReactElement | null;
}

declare module "@vercel/speed-insights/react" {
  import React from "react";
  export function SpeedInsights(props: {
    beforeSend?: (data: any) => any;
    sampleRate?: number;
    route?: string;
    endpoint?: string;
    dsn?: string;
  }): React.ReactElement | null;
}
