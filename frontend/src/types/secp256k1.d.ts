declare module 'secp256k1' {
  /**
   * Type definitions for secp256k1
   * This helps resolve TypeScript errors when this library is used in the project
   */
  
  export function privateKeyVerify(privateKey: Uint8Array): boolean;
  
  export function publicKeyCreate(
    privateKey: Uint8Array,
    compressed?: boolean
  ): Uint8Array;
  
  export function publicKeyVerify(publicKey: Uint8Array): boolean;
  
  export function publicKeyConvert(
    publicKey: Uint8Array,
    compressed?: boolean
  ): Uint8Array;
  
  export function sign(
    message: Uint8Array,
    privateKey: Uint8Array,
    options?: {
      data?: Uint8Array;
      noncefn?: (message: Uint8Array, privateKey: Uint8Array, algo: Uint8Array, data: Uint8Array, attempt: number) => Uint8Array;
    }
  ): { signature: Uint8Array; recovery: number };
  
  export function verify(
    message: Uint8Array,
    signature: Uint8Array,
    publicKey: Uint8Array
  ): boolean;
  
  export function recover(
    message: Uint8Array,
    signature: Uint8Array, 
    recovery: number,
    compressed?: boolean
  ): Uint8Array;
}
