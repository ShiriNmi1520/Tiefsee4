"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/**
 * 開啟檔案
 */
class FileLoad {
    constructor(M) {
        var arWaitingList = []; //待載入名單
        var flag; //目前在哪一張圖片
        var sortType = FileSortType.name; //排序方式
        /** unknown=未知 img=圖片  pdf=pdf、ai  movie=影片  imgs=多幀圖片  txt=文字 */
        var groupType = "img";
        var fileLoadType; //資料夾或自定名單
        this.getArray = () => { return arWaitingList; };
        this.loadFile = loadFile;
        this.loadFiles = loadFiles;
        this.next = next;
        this.prev = prev;
        this.getFilePath = getFilePath;
        this.getGroupType = getGroupType;
        this.setGroupType = setGroupType;
        this.getFileLoadType = getFileLoadType;
        /**
         * 載入檔案陣列
         * @param dirPath
         * @param arName
         */
        function loadFiles(dirPath, arName = []) {
            return __awaiter(this, void 0, void 0, function* () {
                fileLoadType = FileLoadType.userDefined; //名單類型，自定義
                //改用C#處理，增加執行效率
                arWaitingList = yield WV_Directory.GetFiles2(dirPath, arName);
                /*if (await WV_File.Exists(DirPath) === true) {
                    DirPath = await WV_Path.GetDirectoryName(DirPath);
                }*/
                /*if (arName.length > 0) {
                    for (let i = 0; i < arName.length; i++) {
                        let item = arName[i];
                        let filePath =  WV_Path.Combine([dirPath, item]);
                        if (await WV_File.Exists(filePath)) {//如果是檔案
                            arWaitingList.push(filePath);
    
                        } else if (await WV_Directory.Exists(filePath)) {//如果是資料夾
                            let arFile = await WV_Directory.GetFiles(filePath, "*.*");//取得資料夾內所有檔案
                            for (let j = 0; j < arFile.length; j++) {
                                arWaitingList.push(arFile[j]);
                            }
                        }
                    }
                }*/
                let path = arWaitingList[0]; //以拖曳進來的第一個檔案為開啟對象
                //arWaitingList = await filter();
                arWaitingList = yield sort(sortType);
                //目前檔案位置
                flag = 0;
                for (let i = 0; i < arWaitingList.length; i++) {
                    if (arWaitingList[i] == path) {
                        flag = i;
                        break;
                    }
                }
                show();
            });
        }
        /**
         * 載入單一檔案
         * @param path
         */
        function loadFile(path) {
            return __awaiter(this, void 0, void 0, function* () {
                fileLoadType = FileLoadType.dir; //名單類型，資料夾內所有檔案
                arWaitingList = [];
                if ((yield WV_Directory.Exists(path)) === true) { //如果是資料夾
                    arWaitingList = yield WV_Directory.GetFiles(path, "*.*"); //取得資料夾內所有檔案
                    arWaitingList = yield sort(sortType);
                    groupType = GroupType.img;
                    //groupType = await fileToGroupType(arWaitingList[0])
                    arWaitingList = yield filter();
                }
                else if ((yield WV_File.Exists(path)) === true) { //如果是檔案
                    let p = yield WV_Path.GetDirectoryName(path); //取得檔案所在的資料夾路徑
                    arWaitingList = yield WV_Directory.GetFiles(p, "*.*");
                    let fileInfo2 = yield Lib.GetFileInfo2(path);
                    groupType = fileToGroupType(fileInfo2);
                    arWaitingList = yield filter();
                    if (arWaitingList.indexOf(path) === -1) {
                        arWaitingList.splice(0, 0, path);
                    }
                    arWaitingList = yield sort(sortType);
                }
                /*var time = new Date();
                var int_毫秒 = (new Date()).getTime() - time.getTime();
                var s_輸出時間差 = (int_毫秒) + "ms";
                console.log(s_輸出時間差)*/
                //目前檔案位置
                flag = 0;
                for (let i = 0; i < arWaitingList.length; i++) {
                    if (arWaitingList[i] == path) {
                        flag = i;
                        break;
                    }
                }
                show();
            });
        }
        /**
         * 取得目前檔案的路徑
         * @returns
         */
        function getFilePath() {
            var p = arWaitingList[flag];
            return p;
        }
        /**
         * 取得名單類型
         * @returns
         */
        function getFileLoadType() {
            return fileLoadType;
        }
        /**
         *
         * @param _flag
         */
        function show(_flag) {
            return __awaiter(this, void 0, void 0, function* () {
                if (_flag !== undefined) {
                    flag = _flag;
                }
                let path = getFilePath();
                let fileInfo2 = yield Lib.GetFileInfo2(path);
                //console.log(Lib.GetFileType(fileInfo2))
                if (fileInfo2.Type == "none") {
                    M.fileShow.openWelcome();
                    return;
                }
                //如果是自定名單，就根據檔案類型判斷要用什麼方式顯示檔案
                if (fileLoadType === FileLoadType.userDefined) {
                    groupType = fileToGroupType(fileInfo2);
                }
                if (groupType === GroupType.img || groupType === GroupType.unknown) {
                    M.fileShow.openImage(fileInfo2);
                }
                if (groupType === GroupType.pdf) {
                    M.fileShow.openPdf(fileInfo2);
                }
                if (groupType === GroupType.txt) {
                    M.fileShow.openTxt(fileInfo2);
                }
                //修改視窗標題
                let title = `「${flag + 1}/${arWaitingList.length}」 ${Lib.GetFileName(path)}`;
                baseWindow.setTitle(title);
            });
        }
        /**
         * 載入下一個檔案
         */
        function next() {
            return __awaiter(this, void 0, void 0, function* () {
                flag += 1;
                if (flag >= arWaitingList.length) {
                    flag = 0;
                }
                show();
            });
        }
        /**
         * 載入上一個檔案
         */
        function prev() {
            return __awaiter(this, void 0, void 0, function* () {
                flag -= 1;
                if (flag < 0) {
                    flag = arWaitingList.length - 1;
                }
                show();
            });
        }
        /**
         * 從檔案類型判斷，要使用什麼用什麼類型來顯示
         * @returns
         */
        function fileToGroupType(fileInfo2) {
            //let fileExt = await M.config.getFileType(path)
            let fileExt = Lib.GetFileType(fileInfo2);
            for (var type in GroupType) {
                for (let j = 0; j < M.config.allowFileType(type).length; j++) {
                    const fileType = M.config.allowFileType(type)[j];
                    if (fileExt == fileType["ext"]) {
                        return type;
                    }
                }
            }
            return GroupType.unknown;
        }
        function getGroupType() {
            return groupType;
        }
        function setGroupType(type) {
            groupType = type;
        }
        /**
         * 篩選檔案
         * @returns
         */
        function filter() {
            return __awaiter(this, void 0, void 0, function* () {
                let ar = [];
                for (let i = 0; i < arWaitingList.length; i++) {
                    let path = arWaitingList[i];
                    let fileExt = (Lib.GetExtension(path)).toLocaleLowerCase();
                    for (let j = 0; j < M.config.allowFileType(groupType).length; j++) {
                        const fileType = M.config.allowFileType(groupType)[j];
                        if (fileExt == "." + fileType["ext"]) {
                            ar.push(path);
                            break;
                        }
                    }
                }
                return ar;
            });
        }
        /**
         * 排序檔案
         * @param _type 排序類型
         * @returns 排序後的陣列
         */
        function sort(_type) {
            return __awaiter(this, void 0, void 0, function* () {
                //檔名自然排序
                if (_type === FileSortType.name) {
                    return arWaitingList.sort(function (a, b) {
                        return a.localeCompare(b, undefined, {
                            numeric: true,
                            sensitivity: 'base'
                        });
                    });
                }
                //檔名自然排序(逆)
                if (_type === FileSortType.nameDesc) {
                    return arWaitingList.sort(function (a, b) {
                        return -1 * a.localeCompare(b, undefined, {
                            numeric: true,
                            sensitivity: 'base'
                        });
                    });
                }
                return [];
            });
        }
    }
}
/**
 * 名單類型
 */
var FileLoadType;
(function (FileLoadType) {
    /** 資料夾內的全部檔案 */
    FileLoadType[FileLoadType["dir"] = 0] = "dir";
    /** 自定名單 */
    FileLoadType[FileLoadType["userDefined"] = 1] = "userDefined";
})(FileLoadType || (FileLoadType = {}));
/**
 * 排序類型
 */
var FileSortType;
(function (FileSortType) {
    /** 檔名自然排序 */
    FileSortType[FileSortType["name"] = 0] = "name";
    /** 檔名自然排序(逆) */
    FileSortType[FileSortType["nameDesc"] = 1] = "nameDesc";
    /** 修改時間排序 */
    FileSortType[FileSortType["editDate"] = 2] = "editDate";
    /** 修改時間排序(逆) */
    FileSortType[FileSortType["editDateDesc"] = 3] = "editDateDesc";
})(FileSortType || (FileSortType = {}));