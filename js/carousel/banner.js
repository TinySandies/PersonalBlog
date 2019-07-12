(function () {
    let lastTime = 0;
    const vendors = ['webkit', 'moz'];
    for (let x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] ||
            window[vendors[x] + 'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = (callback) => {
            let currTime = new Date().getTime();
            let timeToCall = Math.max(0, 16.7 - (currTime - lastTime));
            let id = window.setTimeout(function () {
                callback(currTime + timeToCall);
            }, timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
    }
    if (!window.cancelAnimationFrame) {
        window.cancelAnimationFrame = function (id) {
            clearTimeout(id);
        };
    }
}());

window.cancelAnimationFrame = window.cancelAnimationFrame || clearTimeout;

let container = ".banner", controller = {
    view: ".banner-view",
    btn: ".banner-btn",
    num: ".banner-number",
    progress: ".banner-progress"
}, grid = {
    line: 12,
    list: 14
}, whiteList = [
    'container', 'controller', 'size', 'images', 'size', 'grid', 'index', 'fnTime', 'boxTime', 'type'
], size = {
    // width: document.body.clientWidth || document.documentElement.clientWidth,
    // height: document.body.clientHeight || document.documentElement.clientHeight
    width: window.innerWidth || document.documentElement.clientWidth,
    height: window.innerHeight || document.documentElement.clientHeight
};

let type = 1, index = 0, fnTime = 5000, boxTime = 2000, activeTime;

let w, h, images, numFind;

function FragmentBanner(option) {
    //栅格运动结束的时间
    activeTime = new Date();

    for (let a = 0, attrLength = whiteList.length; a < attrLength; a++) {
        const attr = whiteList[a];
        if (option[attr] !== undefined) {
            this[attr] = option[attr];
            if (attr === "images") images = option[attr]
        }
    }

    this.init();
}

FragmentBanner.prototype = {
    constructor: FragmentBanner,

    init: function () {
        this.container = document.querySelector(container);
        if (!this.container) {
            return alert('获取banner容器失败');
        } else {
            this.container.style.width = size.width + 'px';
            this.container.style.height = size.height + 'px';
        }

        this.elem = {};
        for (let e in controller) {
            this.elem[e] = this.container.querySelector(controller[e]);
            if (this.elem[e] == null) {
                return alert('获取' + e + '容器失败');
            }
        }

        //栅格单元宽高计算
        const fw = size.width / grid.list + "",
            fh = size.height / grid.line + "";

        w = fw.substr(0, fw.indexOf(".") + 3);
        h = fh.substr(0, fh.indexOf(".") + 3);

        this.elem.viewBox = [];
        for (let i = 0, iL = grid.line; i < iL; i++) {
            for (let j = 0, jL = grid.list; j < jL; j++) {
                let newI = document.createElement('i');
                this.setCss(newI, {
                    width: w + 'px',
                    height: h + 'px',
                    left: 0,
                    top: 0,
                    opacity: 1,
                    backgroundImage: 'url("' + images[index] + '")',
                    backgroundSize: size.width + 'px ' + size.height + 'px',
                    backgroundPosition: w * -j + 'px ' + h * -i + 'px'
                });

                this.elem.view.appendChild(newI);
                this.elem.viewBox.push(newI);
            }
        }

        //数量
        for (let n = 0, nL = images.length; n < nL; n++) {
            let oI = document.createElement('i');

            oI.setIndex = n;
            oI.onclick = function (obj) {
                //显示动画
                FragmentBanner.prototype.show({
                    switch: true,
                    change: obj.setIndex
                });
            }.bind(this, oI);
            this.elem.num.appendChild(oI);
        }
        numFind = this.elem.num.querySelectorAll('i');

        //进度条
        this.progress = [];
        for (let p = 1; p >= 0; p--) {

            let oP = document.createElement('i');
            this.setCss(oP, {
                width: 0,
                // backgroundColor: p ? '#53fc00' : '#5900a0'
            });
            this.elem.progress.appendChild(oP);
            this.progress.push(oP);
        }

        //显示动画
        this.show();

        numFind[index].className = 'on';
    },

    setIndex: function () {

        index %= images.length;

        index = (index < 0) ? images.length - 1 : index;

        numFind[index].className = 'on';
    },

    getTypeTime: function () {
        let timer = [];
        if (type === 1) {
            timer.push(boxTime / 4 + Math.random() * boxTime / 4);
            timer.push(timer[0]);
        } else {
            timer.push([Math.random() * boxTime / 5, boxTime / 10 * 3]);
            timer.push(timer[0][0] + timer[0][1]);
        }
        return timer;
    },

    show: function (order) {
        order = order || {};
        if (new Date() >= activeTime) {
            numFind[index].className = '';
            //下次播放动画时候的进度条
            this.setCss(this.progress[1], {width: 0})
                .animate(this.progress[1], {
                    width: size.width
                }, this.fnTime, function () {
                    this.show({
                        switch: true,
                        change: true
                    });
                }.bind(this));

            let status = true,
                activeTime = 0;

            for (let i = 0, iL = this.elem.viewBox.length; i < iL; i++) {
                let startTime = this.getTypeTime(),
                    endTime = this.getTypeTime(),
                    obj = this.elem.viewBox[i];

                activeTime = Math.max(activeTime, startTime[1] + endTime[1]);

                this.animate(obj, {
                    left: Math.ceil(Math.random() * size.width * 2 - size.width),
                    top: Math.ceil(Math.random() * size.height * 2 - size.height),
                    opacity: 0
                }, startTime[0], function (obj) {
                    if (order.switch && status) {
                        if (/number/i.test(typeof order.change)) {
                            index = order.change;
                        } else {
                            (order.change) ? ++index : --index;
                        }
                        this.setIndex();
                        numFind[index].className = 'on';
                        status = false;
                    }

                    FragmentBanner.prototype.setCss(obj,
                        {backgroundImage: 'url("' + images[index] + '")'})
                        .animate(obj, {
                            left: 0,
                            top: 0,
                            opacity: 1
                        }, endTime[0]);
                }.bind(this, obj));
            }

            //栅格结束运动的时间
            // this.activeTime = new Date(new Date().getTime() + activeTime);
            //             //
            //             // this.setCss(this.progress[0], {width: 0})
            //             //     .animate(this.progress[0], {
            //             //         width: this.size.width
            //             //     }, activeTime);
        }
    },

    setCss: function (obj, json) {
        for (let c in json) {
            if (c === 'opacity' && json.hasOwnProperty(c)) {
                obj.style.opacity = c;
                obj.style.filter = "alpha(opacity=" + (json[c] * 100) + ")";
            } else {
                obj.style[c] = json[c];
            }
        }
        return this;
    },

    animate: function (obj, attr, endTime, callback) {
        (obj.timer) && cancelAnimationFrame(obj.timer);

        let cssJson = obj.currentStyle || getComputedStyle(obj, null),
            start = {}, end = {}, goTime;

        //设置初始属性值和结束属性值
        for (let key in attr) {
            if (attr.hasOwnProperty(key) && attr[key] !== parseFloat(cssJson[key])) {
                start[key] = parseFloat(cssJson[key]);
                end[key] = attr[key] - start[key];
            }
        }

        goTime = new Date();

        if (endTime instanceof Array) {
            (function delayFn() {
                if ((new Date() - goTime) >= endTime[0]) {
                    endTime = endTime[1];
                    goTime = new Date();
                    ref();
                } else {
                    obj.timer = requestAnimationFrame(delayFn);
                }
            })();
        } else {
            ref();
        }

        function ref() {
            let prop = (new Date() - goTime) / endTime;
            (prop >= 1) ? prop = 1 : obj.timer = requestAnimationFrame(ref);
            for (let key in start) {
                if (start.hasOwnProperty(key)) {
                    let val = -end[key] * prop * (prop - 2) + start[key];

                    if (key === 'opacity') {
                        obj.style.opacity = val;
                        obj.style.filter = "alpha(opacity=" + (val * 100) + ")";
                    } else {
                        obj.style[key] = val + 'px';
                    }
                }
            }
            (prop === 1) && callback && callback.call(obj);
        }
    }
};

let counter = -1;
window.onresize = function () {
    let banner = document.querySelector("#banner")
        || document.querySelector(container);
    if (banner) banner.remove();

    let imageIndex = Math.floor(Math.random() * images.length);
    if (++counter % 5 === 0)
        $("body").css({
            "background-image": "url('" + images[imageIndex] + "')"
        });
};
