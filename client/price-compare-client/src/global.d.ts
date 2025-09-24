declare namespace NodeJS {
    interface ProcessEnv {
      USER_DETAILS_SERVICE_HOST: string;
    }
}

declare module '*.svg' {
    import React from 'react';
    export const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement> & { title?: string }>;
    const src: string;
    export default src;
}