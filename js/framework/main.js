(function () {
    'use strict';
    let support = {transitions: Modernizr.csstransitions},
        // transition end event name
        transEndEventNames = {
            'WebkitTransition': 'webkitTransitionEnd',
            'MozTransition': 'transitionend',
            'OTransition': 'oTransitionEnd',
            'msTransition': 'MSTransitionEnd',
            'transition': 'transitionend'
        },
        transEndEventName = transEndEventNames[Modernizr.prefixed('transition')],
        onEndTransition = function (el, callback) {
            let onEndCallbackFn = function (ev) {
                if (support.transitions) {
                    if (ev.target !== this) return;
                    this.removeEventListener(transEndEventName, onEndCallbackFn);
                }
                if (callback && typeof callback === 'function') {
                    callback.call(this);
                }
            };
            if (support.transitions) {
                el.addEventListener(transEndEventName, onEndCallbackFn);
            } else {
                onEndCallbackFn();
            }
        },
        // the pages wrapper
        stack = document.querySelector('.pages-stack'),
        // the page elements
        pages = [].slice.call(stack.children),
        // total number of page elements
        pagesTotal = pages.length,
        // index of current page
        current = 0,
        // menu button
        menuCtrl = document.querySelector('button.menu-button'),
        // the navigation wrapper
        nav = document.querySelector('.pages-nav'),
        // the menu nav items
        navItems = [].slice.call(nav.querySelectorAll('.link--page')),
        // check if menu is open
        isMenuOpen = false,
        // array for page id
        pageArray = ["page-home", "page-docu", "page-manuals", "page-software",
            "page-custom", "page-training", "page-buy", "page-blog", "page-contact"];

    function init() {
        let pageId = window.location.hash.replace("#", "");
        // console.log(pageId);
        pageArray.forEach(function (value, index) {
            if (pageId && pageId === value)
                current = index;
        });
        // console.log(current);
        buildStack();
        initEvents();
    }

    function buildStack() {
        let stackPagesIds = getStackPagesIds();

        // set z-index, opacity, initial transforms to pages and
        // add class page--inactive to all except the current one
        for (let i = 0; i < pagesTotal; ++i) {
            const page = pages[i],
                posIdx = stackPagesIds.indexOf(i);

            if (current !== i) {
                classier.add(page, 'page--inactive');

                if (posIdx !== -1) {
                    // visible pages in the stack
                    page.style.WebkitTransform = 'translate3d(0,100%,0)';
                    page.style.transform = 'translate3d(0,100%,0)';
                } else {
                    // invisible pages in the stack
                    page.style.WebkitTransform = 'translate3d(0,75%,-300px)';
                    page.style.transform = 'translate3d(0,75%,-300px)';
                }
            } else {
                classier.remove(page, 'page--inactive');
            }

            page.style.zIndex = i < current ? parseInt((current - i).toString())
                : parseInt((pagesTotal + current - i).toString()) + "";

            if (posIdx !== -1) {
                page.style.opacity = parseFloat((1 - 0.1 * posIdx).toString()) + "";
            } else {
                page.style.opacity = "0";
            }
        }
    }

    // event binding
    function initEvents() {
        // menu button click
        menuCtrl.addEventListener('click', toggleMenu);

        // navigation menu clicks
        navItems.forEach(function (item) {
            // which page to open?
            const pageId = item.getAttribute('href').slice(1);
            item.addEventListener('click', function (ev) {
                ev.preventDefault();
                openPage(pageId);
            });
        });

        // clicking on a page when the menu is open triggers the menu to close again and open the clicked page
        pages.forEach(function (page) {
            const pageId = page.getAttribute('id');
            page.addEventListener('click', function (ev) {
                if (isMenuOpen) {
                    ev.preventDefault();
                    openPage(pageId);
                }
            });
        });

        // keyboard navigation events
        document.addEventListener('keydown', function (ev) {
            if (!isMenuOpen) return;
            let keyCode = ev.keyCode || ev.which;
            if (keyCode === 27) {
                closeMenu();
            }
        });
    }

    // toggle menu fn
    function toggleMenu() {
        if (isMenuOpen) {
            closeMenu();
        } else {
            openMenu();
            isMenuOpen = true;
        }
    }

    // opens the menu
    function openMenu() {
        // toggle the menu button
        classier.add(menuCtrl, 'menu-button--open');
        // stack gets the class "pages-stack--open" to add the transitions
        classier.add(stack, 'pages-stack--open');
        // reveal the menu
        classier.add(nav, 'pages-nav--open');

        // now set the page transforms
        const stackPagesIds = getStackPagesIds();
        for (let i = 0, len = stackPagesIds.length; i < len; ++i) {
            const page = pages[stackPagesIds[i]];
            page.style.WebkitTransform = 'translate3d(0, 75%, ' + parseInt((-1 * 200 - 50 * i).toString()) + 'px)'; // -200px, -230px, -260px
            page.style.transform = 'translate3d(0, 75%, ' + parseInt((-1 * 200 - 50 * i).toString()) + 'px)';
        }
    }

    // closes the menu
    function closeMenu() {
        // same as opening the current page again
        openPage();
    }

    // opens a page
    function openPage(id) {
        let futurePage = id ? document.getElementById(id) : pages[current],
            futureCurrent = pages.indexOf(futurePage),
            stackPagesIds = getStackPagesIds(futureCurrent);

        // set transforms for the new current page
        futurePage.style.WebkitTransform = 'translate3d(0, 0, 0)';
        futurePage.style.transform = 'translate3d(0, 0, 0)';
        futurePage.style.opacity = "1";

        // set transforms for the other items in the stack
        for (let i = 0, len = stackPagesIds.length; i < len; ++i) {
            const page = pages[stackPagesIds[i]];
            page.style.WebkitTransform = 'translate3d(0,100%,0)';
            page.style.transform = 'translate3d(0,100%,0)';
        }

        // set current
        if (id) {
            current = futureCurrent;
        }

        // close menu..
        classier.remove(menuCtrl, 'menu-button--open');
        classier.remove(nav, 'pages-nav--open');
        onEndTransition(futurePage, function () {
            classier.remove(stack, 'pages-stack--open');
            // reorganize stack
            buildStack();
            isMenuOpen = false;
        });
    }

    // gets the current stack pages indexes. If any of them is the excludePage then this one is not part of the returned array
    function getStackPagesIds(excludePageIdx) {
        const nextStackPageIdx = current + 1 < pagesTotal ? current + 1 : 0,
            nextStackPageIdx_2 = current + 2 < pagesTotal ? current + 2 : 1,
            ids = [];
            // excludeIdx = excludePageIdx || -1;

        if (excludePageIdx !== current) {
            ids.push(current);
        }
        if (excludePageIdx !== nextStackPageIdx) {
            ids.push(nextStackPageIdx);
        }
        if (excludePageIdx !== nextStackPageIdx_2) {
            ids.push(nextStackPageIdx_2);
        }

        return ids;
    }
    init();
})(window);