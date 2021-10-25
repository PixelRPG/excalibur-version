declare module "esbuild" {
  export interface ESBuildBuildOptions {
    plugins: any[];
    entryPoints: string[];
    bundle: boolean;
    minify: boolean;
    outdir: string;
    platform: "browser" | "node" | "neutral";
    loader?: { [ext: string]: string }
    sourcemap: boolean;
    watch: boolean;
    define: {
      [key: string]: string;
    };
  }
  export interface ESBuildServeOptions {
    servedir: string;
    port?: number;
  }

  export interface Server {
    stop: () => void;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface Builder {}

  export const serve: (
    serveOptions: ESBuildServeOptions,
    options: ESBuildBuildOptions
  ) => Promise<Server>;

  export const build: (options: ESBuildBuildOptions) => Promise<Builder>;
}
