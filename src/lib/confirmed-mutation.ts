/** Serialize dependent writes. A failed write must not publish a successful local state. */
export function createMutationQueue() {
  let tail: Promise<unknown> = Promise.resolve();
  return function enqueue<T>(operation: () => Promise<T>): Promise<T> {
    const result = tail.then(operation);
    tail = result.catch(() => undefined);
    return result;
  };
}

export async function confirmMutation(write: () => Promise<boolean>, commit: () => void): Promise<void> {
  if (!await write()) throw new Error("No se pudo guardar en la nube. Revisa tu conexión y tu sesión de administrador; los cambios no se confirmaron.");
  commit();
}
