(function() {
    let width, height, largeHeader, canvas, ctx, circles, target, animateHeader = true;
    let bubbleCanvasId = "particle-canvas", bubbleContainer = "particle-container";

    initHeader();
    addListeners();

    function initHeader() {
        width = window.innerWidth;
        height = window.innerHeight;
        target = { x: 0, y: height };

        largeHeader = document.getElementById(bubbleContainer);
        largeHeader.style.height = "100%";

        canvas = document.getElementById(bubbleCanvasId);
        canvas.width = width;
        canvas.height = height;
        ctx = canvas.getContext('2d');

        // 创建泡泡
        circles = [];
        for(let x = 0; x < width * 0.5; x++) {
            const bubble = new Circle();
            circles.push(bubble);
        }
        animate();
    }

    function addListeners() { // 事件监听
        window.addEventListener('scroll', function () {
            animateHeader = document.body.scrollTop <= height;
        });

        window.addEventListener('resize', function () {
            width = window.innerWidth;
            height = window.innerHeight;
            largeHeader.style.height = height+'px';
            canvas.width = width;
            canvas.height = height;
        });
    }

    function animate() {     // 执行动画
        if(animateHeader) {
            ctx.clearRect(0,0,width,height);
            for(let i in circles) {
                if (circles.hasOwnProperty(i)) circles[i].draw();
            }
        }
        requestAnimationFrame(animate);
    }

    function Circle() {     // 气泡绘制
        let _this = this;
        // constructor
        (function () {
            _this.pos = {};
            init();
        })();

        function init() {
            _this.pos.x = Math.random()*width;
            _this.pos.y = height+Math.random()*100;
            _this.alpha = 0.1+Math.random()*0.3;
            _this.scale = 0.1+Math.random()*0.3;
            _this.velocity = Math.random();
        }

        this.draw = function() {
            if(_this.alpha <= 0) {
                init();
            }
            _this.pos.y -= _this.velocity;
            _this.alpha -= 0.0005;
            ctx.beginPath();
            ctx.arc(_this.pos.x, _this.pos.y, _this.scale*10, 0, 2 * Math.PI, false);
            ctx.fillStyle = 'rgba(38,38,75,'+ _this.alpha +')';
            ctx.fill();
        };
    }
})();