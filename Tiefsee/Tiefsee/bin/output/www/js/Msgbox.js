"use strict";
/**
 * 訊息方塊
 */
class Msgbox {
    constructor() { }
    /**
     * 判斷目前是否有任何顯示中的訊息方塊
     */
    static isShow() {
        return this._isShow;
    }
    /**
     * 顯示
     * @param json
     */
    static show(json) {
        this._isShow = true;
        let txt = ""; //內容文字
        let type = "txt"; //類型
        let inputTxt = ""; //預設的輸入框內容
        let isAllowClose = true; //是否允許關閉
        let isShowBtn = true; //是否顯示按鈕
        let arRadio = []; //radio選項
        let radioValue = ""; //radio預設值
        let funcYes = (dom, value) => { this.close(dom); };
        if (json.txt !== undefined) {
            txt = json.txt;
        }
        if (json.type !== undefined) {
            type = json.type;
        }
        if (json.inputTxt !== undefined) {
            inputTxt = json.inputTxt;
        }
        if (json.isAllowClose !== undefined) {
            isAllowClose = json.isAllowClose;
        }
        if (json.isShowBtn !== undefined) {
            isShowBtn = json.isShowBtn;
        }
        if (json.arRadio !== undefined) {
            arRadio = json.arRadio;
        }
        if (json.radioValue !== undefined) {
            radioValue = json.radioValue;
        }
        if (json.funcYes !== undefined) {
            funcYes = json.funcYes;
        }
        let htmlRadio = "";
        for (let i = 0; i < arRadio.length; i++) {
            const item = arRadio[i];
            let checked = (item.value == radioValue) ? "checked" : ""; //是否選取
            htmlRadio += `
            <label class="msgbox-radio">
                <input type="radio" name="msgbox-radio" value="${item.value}" ${checked}>
                <span>${item.name}</span>
            </label>`;
        }
        if (arRadio.length > 0) {
            htmlRadio = `
            <div class="msgbox-radioList">
                ${htmlRadio}
            </div>`;
        }
        let dom = newDiv(`<div class="msgbox">
                <div class="msgbox-box" active="false">
                    <div class="msgbox-close"></div>
                    <div class="msgbox-txt base-scrollbar">${txt}</div>
                    <input class="msgbox-input" type="text">
                   
                    ${htmlRadio}
                
                    <div class="msgbox-bottom">
                        <div class="msgbox-btn msgbox-btn__no">取消</div>
                        <div class="msgbox-btn msgbox-btn__yes">確定</div>
                    </div>
                </div>
            </div>`);
        let donBox = dom.querySelector(".msgbox-box");
        let donInput = dom.querySelector(".msgbox-input");
        let donBtnClose = dom.querySelector(".msgbox-close");
        let donBottom = dom.querySelector(".msgbox-bottom");
        let donBtnNo = dom.querySelector(".msgbox-btn__no");
        let donBtnYes = dom.querySelector(".msgbox-btn__yes");
        setTimeout(() => {
            donBox.setAttribute("active", "true");
        }, 1);
        if (json.funcYes === undefined) { //如果沒有指定按下「確定」的事件，就隱藏「取消」按鈕
            donBtnNo.style.display = "none";
        }
        if (isAllowClose === false) { //禁止關閉
            donBtnClose.style.display = "none";
            donBtnNo.style.display = "none";
        }
        if (isShowBtn === false) {
            donBottom.style.display = "none";
        } //不顯示按鈕
        if (type !== "text") {
            donInput.style.display = "none";
        } //沒有輸入框
        donInput.value = inputTxt;
        donBtnClose.addEventListener("click", () => { this.close(dom); });
        donBtnNo.addEventListener("click", () => { this.close(dom); });
        donBtnYes.addEventListener("click", () => {
            let value = "";
            if (type === "txt") { }
            if (type === "text") {
                value = donInput.value;
            }
            if (type === "radio") {
                let radioChecked = dom.querySelector(".msgbox-radio :checked");
                if (radioChecked != null) {
                    value = radioChecked.value;
                }
            }
            funcYes(dom, value);
        });
        document.body.appendChild(dom);
        //setRadio(``, radioValue);
        return dom;
    }
    /**
     * 關閉特定的訊息方塊
     * @param dom
     */
    static close(dom) {
        var _a;
        (_a = dom.parentNode) === null || _a === void 0 ? void 0 : _a.removeChild(dom); //移除dom
        //判斷是否還有其他的 訊息方塊
        let arMsgbox = document.querySelectorAll(".msgbox-box");
        for (let i = 0; i < arMsgbox.length; i++) {
            const item = arMsgbox[i];
            if (item.getAttribute("active") == "true") {
                this._isShow = true;
                return;
            }
        }
        this._isShow = false;
    }
    /**
     * 關閉全部
     */
    static closeAll() {
        var _a;
        let arMsgbox = document.querySelectorAll(".msgbox");
        for (let i = 0; i < arMsgbox.length; i++) {
            const dom = arMsgbox[i];
            (_a = dom.parentNode) === null || _a === void 0 ? void 0 : _a.removeChild(dom);
        }
        this._isShow = false;
    }
}
Msgbox._isShow = false;
