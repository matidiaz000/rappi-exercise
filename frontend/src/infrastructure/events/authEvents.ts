type Listener = () => void;

const listeners = new Set<Listener>();

/** Canal mínimo para que la capa HTTP avise un 401 sin conocer React. */
export const authEvents = {
  onUnauthorized(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  emitUnauthorized(): void {
    for (const listener of listeners) listener();
  },
};
