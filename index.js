/** 导入PLOY3D引擎。 */
import * as ploycloud from "./dist/esm/mod.js"
/** 导入应用实现[test]。 */
import * as app_test from "./examples/test.js"

/** 需要存在Deno定义。 */
globalThis.Deno = undefined;

/**
 * 入口函数。
 * @param {FileSystemDirectoryHandle} fs_root 如果非未定义，则启用本地文件系统。
 * @returns 返回事件处理协程。
 */
async function Main(fs_root) {
    if (fs_root !== undefined) {
        if (fs_root == null && window.showDirectoryPicker) {
            fs_root = await (new Promise(function (resolve) {
                const button = document.createElement("button");
                button.innerText = "打开站点根目录";
                button.style.position = "absolute";
                button.style.zIndex = "999";
                button.onclick = function () {
                    window.showDirectoryPicker({
                        id: "LocalFileSystem",
                        mode: "readwrite",
                        startIn: "documents"
                    }).then(function (root) {
                        document.body.removeChild(button);
                        resolve(root);
                    }).catch(function () {
                        if (window.confirm("确定不读写本地文件系统目录么？")) {
                            console.info("用户未授权读写本地文件系统目录。");
                            document.body.removeChild(button);
                            resolve(null);
                        }
                    });
                };

                document.body.appendChild(button);
            }));
        }
    }

    if (fs_root) {
        console.info("用户已授权读写本地文件系统目录。");
    }

    const engine = new ploycloud.Ploy3D({
        config: {
            web: true
        },
        rootFS: fs_root,
        appLut: {
            "test": app_test.PloyApp_test
        }
    });

    return ploycloud.Start(engine, "test", "PLOY3D引擎", 1280, 720);
}

Main(null).then(() => {
    console.log("应用运行中，按ESC键结束运行 ...")
}).catch((e) => {
    console.error(e);
});
