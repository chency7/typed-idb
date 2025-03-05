import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "rollup-plugin-typescript2";
import { terser } from "rollup-plugin-terser";

export default {
  input: "src/index.ts",
  output: [
    {
      file: "dist/cjs/index.cjs.js",
      format: "cjs",
      sourcemap: true,
    },
    {
      file: "dist/esm/index.esm.js",
      format: "esm",
      sourcemap: true,
    },
  ],
  external: ["comlink", "idb", "immer", "xstate"],
  plugins: [
    resolve(),
    commonjs(),
    typescript({
      tsconfig: "./tsconfig.json",
      clean: true,
    }),
    terser(),
  ],
  watch: {
    include: "src/**",
  },
};
