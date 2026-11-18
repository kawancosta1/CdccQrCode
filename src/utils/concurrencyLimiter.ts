/**
 * Limita quantas tarefas assíncronas rodam ao mesmo tempo; as demais ficam na fila.
 * Usado para não disparar dezenas de requisições simultâneas a APIs externas.
 */
export function createLimiter(maxConcurrent: number) {
  const max = Math.max(1, Math.floor(maxConcurrent));
  let active = 0;
  const queue: Array<() => void> = [];

  const release = () => {
    active -= 1;
    const next = queue.shift();
    if (next) next();
  };

  return function limit<T>(task: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const run = () => {
        active += 1;
        task().then(resolve, reject).finally(release);
      };
      if (active < max) run();
      else queue.push(run);
    });
  };
}
