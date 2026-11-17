// 앞선 작업이 성공하든 실패하든 끝난 뒤에 다음 작업을 시작해, 입장·나가기처럼
// 같은 방을 건드리는 작업이 겹치지 않게 한다. 실패는 호출한 쪽에만 전달한다
export function createExclusiveQueue() {
  let queue: Promise<unknown> = Promise.resolve();

  return function runExclusive<T>(task: () => Promise<T>): Promise<T> {
    const run = queue.then(task, task);

    queue = run.catch(() => undefined);

    return run;
  };
}
