import { React, molecule, Header, Content, getEventPosition } from "../../lib/molecule.js";
export class Packages {
    constructor(app) {
        this.app = app;
    }
    async refreshMy() {
        const engine = this.app.engine;
        const res = await engine.Fetch(document.location.origin + "/serv/my_packages", null, "json");
        if (res?.success) {
            const pkgs = res.data;
            for (let pkg of pkgs) {
                engine.resources.Register(pkg);
            }
            molecule.sidebar.update(this.sidebar);
        }
    }
    openUpload(item, callback) {
        const data = item.data;
        const pkg = data.reg;
        if (!pkg || pkg.location == "store" || !this.app.userInfo) {
            return;
        }
        const onClick = (form) => {
            if (this.uploading) {
                return;
            }
            this.uploading = true;
            this.app.Notify("开始执行资源包上传。", "info");
            molecule.editor.updateTab(tab);
            this.doUpload(form, data)
                .then(res => {
                if (res) {
                    const index = this.imports.findIndex((i) => { return i.name == data.key; });
                    this.imports.splice(index, 1);
                    molecule.sidebar.update(this.sidebar);
                    const groupId = molecule.editor.getGroupIdByTab(tab.id);
                    molecule.editor.closeTab(tab.id, groupId);
                    this.app.Notify("资源包上传成功。", "info");
                }
                else {
                    this.app.Notify("资源包上传失败！", "warn");
                }
                this.uploading = false;
                molecule.editor.updateTab(tab);
                callback(res);
            })
                .catch(e => {
                this.app.Notify(`资源包上传异常：${e}！`, "error", true);
                this.uploading = false;
                molecule.editor.updateTab(tab);
                callback(null);
            });
        };
        const tab = {
            id: data.key,
            name: "上传资源包",
            icon: "cloud-upload",
            closable: true,
            editable: false,
            status: undefined,
            breadcrumb: [{ id: 0, name: "upload" }, { id: 1, name: data.key }],
            renderPane: () => {
                return React.createElement(this.renderUpload, { uploading: this.uploading, data: data, onClick: onClick });
            }
        };
        molecule.editor.open(tab);
    }
    async doUpload(form, pkg) {
        const engine = this.app.engine;
        const Upload = async () => {
            const res_ask = await engine.Request("POST", document.location.origin + "/serv/upload_ask", "json", JSON.stringify(form), 'application/json', null);
            if (res_ask?.success) {
                const policy = res_ask.data;
                const datas = pkg.files.datas;
                const signatures = [];
                for (let i = 0; i < policy.files.length; i++) {
                    const info = policy.files[i];
                    const data = datas[i];
                    const form = new FormData();
                    form.append("OSSAccessKeyId", policy.accessid);
                    form.append("policy", policy.policy);
                    form.append("signature", policy.signature);
                    form.append("key", policy.dir + info.path);
                    form.append("callback", policy.callback);
                    form.append("success_action_status", "200");
                    form.append("file", data);
                    form.append("x:sign", info.sign);
                    const res_upload = await engine.Request("POST", policy.host, "json", form, null, null);
                    if (res_upload?.success) {
                        signatures.push(res_upload.message);
                        this.app.Notify(`上传文件成功：${info.path}！`, "info");
                    }
                    else {
                        signatures.push("");
                        this.app.Notify(`上传文件失败：${info.path}，${res_upload}！`, "warn");
                    }
                }
                return { usage: "packages", upload_id: policy.upload_id, signatures: signatures.join() };
            }
            else {
                this.app.Notify(`上传请求失败：${res_ask.message}！`, "warn", true);
                return null;
            }
        };
        const Verify = async (info) => {
            const res_verify = await engine.Request("POST", document.location.origin + "/serv/upload_verify", "json", JSON.stringify(info), 'application/json', null);
            if (res_verify?.success) {
                this.app.Notify(`上传验证成功。`, "info");
                return res_verify.data;
            }
            else {
                this.app.Notify(`上传验证失败：${res_verify?.message}！`, "warn", true);
                return null;
            }
        };
        const upload_res = await Upload();
        if (!upload_res) {
            return null;
        }
        const res = await Verify(upload_res);
        if (!res) {
            return null;
        }
        pkg.reg.invalid = res.invalid;
        pkg.reg.path = res.path;
        pkg.reg.zip = res.zip;
        pkg.reg.location = res.location;
        pkg.reg.private = res.private;
        pkg.reg.license = res.license;
        pkg.reg.price = res.price;
        pkg.reg.folder = res.folder;
        pkg.reg.tags = res.tags;
        pkg.reg.menu = res.menu;
        this.app.Notify(`资源包上传成功。`, "info");
        return pkg;
    }
    openImport(file, callback) {
        if (this.importing || !this.app.userInfo) {
            return;
        }
        this.importing = true;
        this.app.Notify("开始执行资源包导入。", "info");
        molecule.sidebar.update(this.sidebar);
        this.doImport(file).then(entry => {
            if (entry) {
                this.app.Notify("资源包导入成功。", "info");
            }
            else {
                this.app.Notify("资源包导入失败！", "warn");
            }
            this.importing = false;
            molecule.sidebar.update(this.sidebar);
            callback(entry);
        }).catch(e => {
            this.app.Notify(`资源包导入异常：${e}！`, "error", true);
            this.importing = false;
            molecule.sidebar.update(this.sidebar);
            callback(null);
        });
    }
    async doImport(file) {
        const engine = this.app.engine;
        const res = await engine.worker.Import_gltf_file(1, file, (rate, msg) => { console.log("import:", rate, msg); });
        engine.resources.Register(res.pkg, res.files);
        const menu = await engine.resources.Browse(res.pkg);
        await new Promise((resolve) => {
            this.app.AddSnapshot(menu, resolve);
            this.app.DrawFrame(10);
        });
        const entry = {
            id: res.pkg.uuid,
            name: res.pkg.key,
            icon: "archive",
            isLeaf: true,
            data: {
                key: res.pkg.key,
                reg: res.pkg,
                menu: (() => {
                    return {
                        thumbnail: "thumbnail.jpg",
                        thumbnail_per_row: menu.thumbnail_per_row,
                        thumbnail_row_count: menu.thumbnail_row_count,
                        list: menu.list.map((item) => {
                            return {
                                ...item,
                                thumbnail_href: null
                            };
                        }),
                    };
                })(),
                files: {
                    infos: [],
                    datas: [],
                    count: 0,
                    size: 0,
                },
            }
        };
        const files = entry.data.files;
        const meta = (() => {
            const materials = res.pkg.meta.material_library;
            for (let material of materials) {
                const textures = material.properties.textures;
                for (let key in textures) {
                    textures[key].texture = null;
                }
            }
            const str = JSON.stringify(res.pkg.meta);
            return new Blob([str]);
        })();
        files.infos.push({
            path: "package.json",
            size: meta.size,
            sign: meta
        });
        files.infos.push({
            path: "thumbnail.jpg",
            size: menu.thumbnail_blob.size,
            sign: menu.thumbnail_blob
        });
        for (let key in res.files) {
            const data = res.files[key];
            if (typeof data == "string") {
                const crlf = data.replace(/(?<!\r)\n/g, '\r\n');
                const blob = new Blob([crlf]);
                files.infos.push({
                    path: key,
                    size: blob.size,
                    sign: blob
                });
            }
            else {
                files.infos.push({
                    path: key,
                    size: data.byteLength,
                    sign: new Blob([data.buffer])
                });
            }
        }
        files.datas = files.infos.map((file) => {
            const data = file.sign;
            file.sign = null;
            files.count += 1;
            files.size += file.size;
            return data;
        });
        this.imports.push(entry);
        return entry;
    }
    activate(extensionCtx) {
        molecule.activityBar.add(this.activityBar);
        molecule.sidebar.add(this.sidebar);
    }
    dispose(extensionCtx) {
        molecule.activityBar.remove(this.activityBar.id);
        molecule.sidebar.remove(this.sidebar.id);
    }
    renderSidebar(props) {
        const { Toolbar, Collapse } = molecule.component;
        return (React.createElement("div", { style: { width: "100%", height: "100%", display: "flex", flexDirection: "column" } },
            React.createElement(Header, { title: '\u8D44\u6E90\u5305\u7BA1\u7406', toolbar: React.createElement(Toolbar, { data: props.toolbar }) }),
            React.createElement(Content, null,
                React.createElement(Collapse, { activePanelKeys: ['collections', 'imports'], data: props.collapse }))));
    }
    renderCollections(props) {
        const contextView = molecule.component.useContextViewEle();
        const { Menu, Scrollbar, TreeView } = molecule.component;
        const handleRightClick = (event, data) => {
            if (event.target.nodeName !== 'INPUT') {
                event.preventDefault();
                contextView.show(getEventPosition(event), () => (React.createElement(Menu, { role: "menu", onClick: (_, item) => item.handleClick(_, item, data), data: props.contentMenu })));
            }
        };
        return (React.createElement(Scrollbar, null,
            React.createElement(TreeView, { data: props.data, onSelect: props.onSelect, onRightClick: handleRightClick })));
    }
    renderImports(props) {
        const contextView = molecule.component.useContextViewEle();
        const { Menu, Scrollbar, TreeView } = molecule.component;
        const handleRightClick = (event, data) => {
            if (event.target.nodeName !== 'INPUT') {
                event.preventDefault();
                contextView.show(getEventPosition(event), () => (React.createElement(Menu, { role: "menu", onClick: (_, item) => item.handleClick(_, item, data), data: props.contentMenu })));
            }
        };
        return (React.createElement(React.Fragment, null,
            React.createElement("input", { type: "file", id: "pkg_import_input", accept: ".zip", style: { display: "none" }, onChange: (e) => {
                    props.onImport(e.target.files[0]);
                } }),
            React.createElement(Scrollbar, null,
                props.isImporting ? React.createElement("div", null, "\u6B63\u5728\u5BFC\u5165 ...") : React.createElement("div", null),
                React.createElement(TreeView, { data: props.data, onSelect: props.onSelect, onRightClick: handleRightClick }))));
    }
    renderUpload(props) {
        const pkg = props.data.reg;
        const { key, uuid } = pkg;
        const { size, count } = props.data.files;
        const { Input, Select, Option } = molecule.component;
        const [label, setLabel] = React.useState(pkg.key.split(".")[2]);
        const [priv, setPriv] = React.useState(pkg.private || false);
        const [license, setLicense] = React.useState(pkg.license || "CC0");
        const [price, setPrice] = React.useState(pkg.price || 0);
        const [folder, setFolder] = React.useState(pkg.folder || "");
        const [tags, setTags] = React.useState(pkg.tags || "");
        const Submit = () => {
            const form = {
                usage: "packages",
                label,
                key,
                uuid,
                byte_size: size,
                file_count: count,
                private: priv,
                license,
                price,
                folder,
                tags,
                menu: props.data.menu,
                files: props.data.files.infos,
            };
            props.onClick(form);
        };
        return (React.createElement("div", { style: {
                width: "50%",
                margin: "auto"
            } },
            React.createElement("div", null,
                React.createElement("h2", null, "\u8D44\u6E90\u5305\u4E0A\u4F20"),
                React.createElement("div", { style: { marginBottom: "10px" } },
                    React.createElement("div", { title: "\u540D\u79F0", style: { lineHeight: "28px" } }, "\u540D\u79F0"),
                    React.createElement(Input, { id: "label", name: "label", value: label, onChange: (e) => {
                            setLabel(e.target.value);
                        } })),
                React.createElement("div", { style: { marginBottom: "10px" } },
                    React.createElement("div", { title: "\u6807\u8BC6\u540D", style: { lineHeight: "28px" } }, "\u6807\u8BC6\u540D"),
                    React.createElement(Input, { id: "key", name: "key", value: key, disabled: true })),
                React.createElement("div", { style: { marginBottom: "10px" } },
                    React.createElement("div", { title: "\u552F\u4E00\u7F16\u53F7", style: { lineHeight: "28px" } }, "\u552F\u4E00\u7F16\u53F7"),
                    React.createElement(Input, { id: "uuid", name: "uuid", value: uuid, disabled: true })),
                React.createElement("div", { style: { marginBottom: "10px" } },
                    React.createElement("div", { title: "\u5206\u7C7B\u76EE\u5F55", style: { lineHeight: "28px" } }, "\u5206\u7C7B\u76EE\u5F55(\u6700\u591A3\u7EA7:/A/B/C)"),
                    React.createElement(Input, { id: "folder", name: "folder", value: folder, onChange: (e) => {
                            setFolder(e.target.value);
                        } })),
                React.createElement("div", { style: { marginBottom: "10px" } },
                    React.createElement("div", { title: "\u6807\u7B7E", style: { lineHeight: "28px" } }, "\u6807\u7B7E(\u4F7F\u7528\"\u3001\"\u5206\u9694\uFF0C\u5EFA\u8BAE\u4ECE\u4EE5\u4E0B\u70ED\u95E8\u8BCD\u6C47\u9009\u62E9)"),
                    React.createElement(Input, { id: "tags", name: "tags", value: tags, onChange: (e) => {
                            setTags(e.target.value);
                        } })),
                React.createElement("div", { style: { marginBottom: "10px" } },
                    React.createElement("div", { title: "\u6807\u7B7E\u8BCD\u6C47", style: { color: "gray", lineHeight: "28px" } }, "\u4EBA\u7269\u3001\u5973\u6027\u3001\u7537\u6027\u3001\u52A8\u7269\u3001\u5BA0\u7269\u3001\u751F\u7269\u3001\u89D2\u8272\u3001\u5EFA\u7B51\u3001\u5386\u53F2\u53E4\u8FF9\u3001\u6587\u5316\u9057\u4EA7\u3001\u6C7D\u8F66\u3001\u8F66\u8F86\u3001\u6B66\u5668\u3001\u5DE5\u5177\u3001\u7535\u5B50\u4EA7\u54C1\u3001\u670D\u88C5\u3001\u65F6\u5C1A\u3001\u98DF\u7269\u3001\u996E\u6599\u3001\u5BB6\u5177\u3001\u81EA\u7136\u3001\u690D\u7269\u3001\u827A\u672F\u3001\u62BD\u8C61")),
                React.createElement("div", { style: { marginBottom: "10px" } },
                    React.createElement("div", { title: "CC\u534F\u8BAE", style: { lineHeight: "28px" } }, "CC\u534F\u8BAE"),
                    React.createElement(Select, { defaultValue: license, onSelect: (e, option) => {
                            setLicense(option.value);
                        } },
                        React.createElement(Option, { value: "CC0" }, "CC0"),
                        React.createElement(Option, { value: "CC BY" }, "CC BY"),
                        React.createElement(Option, { value: "CC BY-SA" }, "CC BY-SA"),
                        React.createElement(Option, { value: "CC BY-ND" }, "CC BY-ND"),
                        React.createElement(Option, { value: "CC BY-NC" }, "CC BY-NC"),
                        React.createElement(Option, { value: "CC BY-NC-SA" }, "CC BY-NC-SA"),
                        React.createElement(Option, { value: "CC BY-NC-ND" }, "CC BY-NC-ND"))),
                React.createElement("div", { style: { display: "flex", flexDirection: "row", marginBottom: "10px" } },
                    React.createElement("div", { title: "\u79C1\u6709", style: { lineHeight: "28px" } }, "\u79C1\u6709"),
                    React.createElement(Input, { size: 'normal', type: "checkbox", checked: priv, disabled: true, style: { width: "18px", height: "18px" }, onChange: (e) => {
                            setPriv(e.target.checked && false);
                        } })),
                React.createElement("div", { style: { marginBottom: "10px" } },
                    React.createElement("div", { title: "\u6982\u8981", style: { color: "gray", lineHeight: "28px" } },
                        "\u6982\u8981\uFF1A\u4E0A\u4F20\u5927\u5C0F",
                        (size / 1024 / 1024).toFixed(2),
                        "MB\uFF0C\u6587\u4EF6\u6570\u91CF",
                        count)),
                React.createElement("div", { style: { display: "flex", flexDirection: "row", marginBottom: "10px" } },
                    React.createElement(Input, { size: 'normal', type: "button", style: { width: "120px", height: "auto" }, value: props.uploading ? "上传中 ..." : "上传", onClick: (e) => {
                            Submit();
                        } })))));
    }
    get collections() {
        const engine = this.app.engine;
        const resources = engine.resources;
        if (!engine.started) {
            return [];
        }
        const list = resources.packageList;
        const pathLut = {};
        const GetFolder = (path) => {
            let folder = pathLut[path];
            if (!folder) {
                let parts = path.split("/");
                let cur = "";
                for (let part of parts) {
                    if (part || !cur) {
                        cur += part;
                        let folder_ = pathLut[cur];
                        if (!folder_) {
                            folder_ = pathLut[cur] = {
                                id: cur,
                                name: part,
                                icon: "folder",
                                isLeaf: false,
                                children: []
                            };
                            if (folder) {
                                folder.children.push(folder_);
                            }
                        }
                        folder = folder_;
                        cur += "/";
                    }
                }
            }
            return folder;
        };
        const excludes = ["0-0-0", "1-1-1"];
        for (let pkg of list) {
            if (pkg && excludes.indexOf(pkg.uuid) == -1) {
                const folder = GetFolder(pkg.folder || "");
                folder.children.push({
                    id: pkg.uuid,
                    name: pkg.key,
                    icon: "archive",
                    isLeaf: true
                });
            }
        }
        return pathLut[""]?.children || [];
    }
    app;
    imports = [];
    importing;
    uploading;
    id = 'ext_packages';
    name = '资源包管理';
    displayName = '资源包管理';
    version = '1.0.0';
    categories = [molecule.model.IExtensionType.Workbench];
    icon = 'package';
    disable = false;
    activityBar = {
        title: this.name,
        id: this.id,
        name: this.name,
        hidden: false,
        data: this,
        icon: this.icon,
        checked: false,
        disabled: false,
        type: 'normal',
        contextMenu: undefined,
        sortIndex: -1,
        render: undefined,
    };
    sidebar = {
        id: this.id,
        title: this.name,
        render: () => {
            return React.createElement(this.renderSidebar, { toolbar: this.sidebarCfg.toolbar, collapse: this.sidebarCfg.collapse });
        }
    };
    sidebarCfg = {
        toolbar: [
            {
                id: 'download',
                title: '下载',
                name: '下载',
                icon: 'cloud-download',
                disabled: false,
                onClick: () => { }
            },
            {
                id: 'refresh',
                title: '刷新',
                name: '刷新',
                icon: 'refresh',
                disabled: false,
                onClick: () => { }
            }
        ],
        collapse: [
            {
                id: 'collections',
                name: '收集列表',
                hidden: undefined,
                config: {
                    grow: 3
                },
                toolbar: undefined,
                renderPanel: () => {
                    return React.createElement(this.renderCollections, { data: this.collections, contentMenu: [], onSelect: (node) => {
                            if (node.isLeaf) {
                                const pkg = this.app.engine.resources.GetPackageByUUID(node.id);
                                this.app.signals.select_package.Dispatch(pkg);
                            }
                        } });
                }
            },
            {
                id: 'imports',
                name: '导入列表',
                hidden: undefined,
                config: {
                    grow: 1
                },
                toolbar: [
                    {
                        id: 'import',
                        title: '导入',
                        name: '导入',
                        icon: 'add',
                        disabled: false,
                        onClick: () => {
                            if (!this.importing) {
                                document.getElementById('pkg_import_input').click();
                            }
                        },
                    }
                ],
                renderPanel: () => {
                    return React.createElement(this.renderImports, { data: this.imports, contentMenu: [
                            {
                                id: 'upload',
                                name: '上传',
                                icon: 'cloud-upload',
                                disabled: false,
                                handleClick: (e, menu, item) => {
                                    this.openUpload(item, (entry) => { console.log(entry); });
                                }
                            },
                        ], onSelect: (node) => {
                            if (node.isLeaf) {
                                const pkg = this.app.engine.resources.GetPackageByUUID(node.id);
                                this.app.signals.select_package.Dispatch(pkg);
                            }
                        }, onImport: (file) => {
                            this.openImport(file, (entry) => { console.log(this); });
                        }, isImporting: this.importing });
                }
            }
        ],
    };
}
