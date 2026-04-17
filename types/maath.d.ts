declare module 'maath/random/dist/maath-random.esm' {
  export function inSphere(array: Float32Array, options: { radius: number }): Float32Array;
  export function inBox(array: Float32Array, options: { width: number; height: number; depth: number }): Float32Array;
  export function onSphere(array: Float32Array, options: { radius: number }): Float32Array;
}
