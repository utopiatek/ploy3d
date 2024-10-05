// 安装打包工具
// npm install -D webpack

// 打包代码
// npx webpack

// 生成声明文件
// tsc --declaration true --emitDeclarationOnly true --removeComments false -p ./tsconfig.json

// 引入路径模块
const path = require("path");
const webpack = require("webpack");

// 模块导出规则
module.exports = {
    // 从哪里开始编译
    entry: "./molecule.ts",
    // 编译到哪里
    output: {
        path: path.resolve(__dirname, '../../lib'),
        filename: "molecule.js",
        library: {
            type: 'module',
        }
    },
    // 打包为ES模块
    experiments: {
        outputModule: true,
    },
    // 配置模块规则
    module: {
        rules: [
            {
                test: /\.tsx?$/,			// .ts或者.tsx后缀的文件
                use: "ts-loader",			// 就是上面安装的ts-loader
                exclude: /node-modules/		// 排除node-modules目录
            },
            {
                test: /\.css$/,							// .css后缀的文件
                use: ["style-loader", "css-loader"],	// 两个加载器顺序不能错
                exclude: /node-modules/					// 排除node-modules目录
            }
        ]
    },
    plugins: [
        new webpack.optimize.LimitChunkCountPlugin({
            maxChunks: 1
        }),
    ],
    // 编译模式
    mode: "production",
}
