import { Miaoworker } from "./dist/esm/worker/worker.js"

/** 子线程脚本装载后自动实例化事务处理器。 */
const __worker = new Miaoworker();
