/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
var __webpack_exports__ = {};

;// CONCATENATED MODULE: ./src/js/libs/popup.js
// (c) Фрилансер по жизни, Хмурый Кот
// Документация: 
// Подключение функционала "Чертогов Фрилансера"


class popup_Popup {
	constructor(options) {
		let config = {
			logging: false,
			init: true,
			attributeOpenButton: 'data-popup', // Атрибут для кнопки, которая вызывает попап
			attributeCloseButton: 'data-close', // Атрибут для кнопки, которая закрывает попап
			fixElementSelector: '[data-lp]', // Атрибут для элементов с левым паддингом (которые fixed)

			youtubeAttribute: 'data-youtube', //Атрибут для кода youtube
			setAutoplayYoutube: true,

			// Изменение классов
			classes: {
				popup: 'popup',
				// popupWrapper: 'popup__wrapper',
				popupContent: 'popup__content',
				popupActive: 'popup_show', // Добавляется для попапа, когда он открывается
				bodyActive: 'popup-show', // Добавляется для боди, когда попап открыт
				popupVideo: 'popup__video',
			},

			focusCatch: true, // Фокус внутри попапа зациклен
			closeEsc: true, // Закрытие по ESC
			bodyLock: true, // Блокировка скролла
			bodyLockDelay: 500, // Задержка блокировки скролла

			hashSettings: {
				location: true, // Хэш в адресной строке
				goHash: true, // Переход по наличию в адресной строке
			},

			on: { // События
				beforeOpen: function () { },
				afterOpen: function () { },
				beforeClose: function () { },
				afterClose: function () { },
			},
		}
		this.isOpen = false;
		// Текущее окно
		this.targetOpen = {
			selector: false,
			element: false,
		}
		// Предыдущее открытое
		this.previousOpen = {
			selector: false,
			element: false,
		}
		// Последнее закрытое
		this.lastClosed = {
			selector: false,
			element: false,
		}
		this._dataValue = false;
		this.hash = false;

		this._reopen = false;
		this._selectorOpen = false;

		this.lastFocusEl = false;
		this._focusEl = [
			'a[href]',
			'input:not([disabled]):not([type="hidden"]):not([aria-hidden])',
			'button:not([disabled]):not([aria-hidden])',
			'select:not([disabled]):not([aria-hidden])',
			'textarea:not([disabled]):not([aria-hidden])',
			'area[href]',
			'iframe',
			'object',
			'embed',
			'[contenteditable]',
			'[tabindex]:not([tabindex^="-"])'
		];
		this.options = Object.assign(config, options);
		options.init ? this.initPopups() : null
	}
	initPopups() {
		this.popupLogging(`Проснулся`);
		this.eventsPopup();
	}
	eventsPopup() {
		// Клик на всем документе
		document.addEventListener("click", function (e) {
			// Клик по кнопке "открыть"
			const buttonOpen = e.target.closest(`[${this.options.attributeOpenButton}]`);
			if (buttonOpen) {
				e.preventDefault();
				this._dataValue = buttonOpen.getAttribute(this.options.attributeOpenButton) ?
					buttonOpen.getAttribute(this.options.attributeOpenButton) :
					'error';
				if (this._dataValue !== 'error') {
					if (!this.isOpen) this.lastFocusEl = buttonOpen;
					this.targetOpen.selector = `${this._dataValue}`;
					this._selectorOpen = true;
					this.open();
					return;

				} else this.popupLogging(`Ой ой, не заполнен атрибут у ${buttonOpen.classList}`);

				return;
			}
			// Закрытие на пустом месте (popup__wrapper) и кнопки закрытия (popup__close) для закрытия
			const buttonClose = e.target.closest(`[${this.options.attributeCloseButton}]`);
			if (buttonClose || !e.target.closest(`.${this.options.classes.popupContent}`) && this.isOpen) {
				e.preventDefault();
				this.close();
				return;
			}
		}.bind(this));

		// Закрытие по ESC
		document.addEventListener("keydown", function (e) {
			if (this.options.closeEsc && e.which == 27 && e.code === 'Escape' && this.isOpen) {
				e.preventDefault();
				this.close();
				return;
			}
			if (this.options.focusCatch && e.which == 9 && this.isOpen) {
				this._focusCatch(e);
				return;
			}
		}.bind(this))

		if (this.options.hashSettings.goHash) {
			// Проверка изменения адресной строки
			window.addEventListener('hashchange', function () {
				if (window.location.hash) {
					this._openToHash();
				} else {
					this.close(this.targetOpen.selector);
				}

			}.bind(this))

			window.addEventListener('load', function () {
				if (window.location.hash) {
					this._openToHash();
				}

			}.bind(this))
		}

	}
	open(selectorValue) {
		// Если ввести значение селектора (селектор настраивается в options)
		if (selectorValue && typeof (selectorValue) === "string" && selectorValue.trim() !== "") {
			this.targetOpen.selector = selectorValue;
			this._selectorOpen = true;
		}
		if (this.isOpen) {
			this._reopen = true;
			this.close();
		}
		if (!this._selectorOpen) this.targetOpen.selector = this.lastClosed.selector;
		if (!this._reopen) this.previousActiveElement = document.activeElement;

		this.targetOpen.element = document.querySelector(this.targetOpen.selector);

		if (this.targetOpen.element) {
			// YouTube
			if (this.targetOpen.element.hasAttribute(this.options.youtubeAttribute)) {
				const codeVideo = this.targetOpen.element.getAttribute(this.options.youtubeAttribute);

				const urlVideo = `https://www.youtube.com/embed/${codeVideo}?rel=0&showinfo=0&autoplay=1`

				const iframe = document.createElement('iframe');
				iframe.setAttribute('allowfullscreen', '');

				const autoplay = this.options.setAutoplayYoutube ? 'autoplay;' : '';
				iframe.setAttribute('allow', `${autoplay}; encrypted-media`);

				iframe.setAttribute('src', urlVideo);

				if (this.targetOpen.element.querySelector(`.${this.options.classes.popupVideo}`))
					this.targetOpen.element.querySelector(`.${this.options.classes.popupVideo}`).appendChild(iframe);
			}
			if (this.options.hashSettings.location) {
				// Получение хэша и его выставление 
				this._getHash();
				this._setHash();
			}

			// До открытия
			this.options.on.beforeOpen(this);

			this.targetOpen.element.classList.add(this.options.classes.popupActive);
			document.body.classList.add(this.options.classes.bodyActive);

			if (!this._reopen) bodyLockToggle();
			else this._reopen = false;

			this.targetOpen.element.setAttribute('aria-hidden', 'false');

			// // Запоминаю это открытое окно. Оно будет последним открытым
			this.previousOpen.selector = this.targetOpen.selector;
			this.previousOpen.element = this.targetOpen.element;

			this._selectorOpen = false;

			this.isOpen = true;

			setTimeout(() => {
				this._focusTrap();
			}, 50);

			// После открытия
			//this.options.on.afterOpen(this);

			// Создаем свое событие после открытия попапа
			document.dispatchEvent(new CustomEvent("afterPopupOpen", {
				detail: {
					popup: this
				}
			}));
			this.popupLogging(`Открыл попап`);

		} else this.popupLogging(`Ой ой, такого попапа нет. Проверьте корректность ввода. `);
	}
	close(selectorValue) {
		if (selectorValue && typeof (selectorValue) === "string" && selectorValue.trim() !== "") {
			this.previousOpen.selector = selectorValue;
		}
		if (!this.isOpen || !bodyLockStatus) {
			return;
		}
		// До закрытия
		this.options.on.beforeClose(this);
		// YouTube
		if (this.targetOpen.element.hasAttribute(this.options.youtubeAttribute)) {
			if (this.targetOpen.element.querySelector(`.${this.options.classes.popupVideo}`))
				this.targetOpen.element.querySelector(`.${this.options.classes.popupVideo}`).innerHTML = '';
		}
		this.previousOpen.element.classList.remove(this.options.classes.popupActive);
		// aria-hidden
		this.previousOpen.element.setAttribute('aria-hidden', 'true');
		if (!this._reopen) {
			document.body.classList.remove(this.options.classes.bodyActive);
			bodyLockToggle();
			this.isOpen = false;
		}
		// Очищение адресной строки
		this._removeHash();
		if (this._selectorOpen) {
			this.lastClosed.selector = this.previousOpen.selector;
			this.lastClosed.element = this.previousOpen.element;

		}
		// После закрытия
		this.options.on.afterClose(this);
		setTimeout(() => {
			this._focusTrap();
		}, 50);

		this.popupLogging(`Закрыл попап`);
	}
	// Получение хэша 
	_getHash() {
		if (this.options.hashSettings.location) {
			this.hash = this.targetOpen.selector.includes('#') ?
				this.targetOpen.selector : this.targetOpen.selector.replace('.', '#')
		}
	}
	_openToHash() {
		let classInHash = document.querySelector(`.${window.location.hash.replace('#', '')}`) ? `.${window.location.hash.replace('#', '')}` :
			document.querySelector(`${window.location.hash}`) ? `${window.location.hash}` :
				null;

		const buttons = document.querySelector(`[${this.options.attributeOpenButton}="${classInHash}"]`);
		if (buttons) {
			if (classInHash) this.open(classInHash)
		}
	}
	// Утсановка хэша
	_setHash() {
		history.pushState('', '', this.hash);
	}
	_removeHash() {
		history.pushState('', '', window.location.href.split('#')[0])
	}
	_focusCatch(e) {
		const focusable = this.targetOpen.element.querySelectorAll(this._focusEl);
		const focusArray = Array.prototype.slice.call(focusable);
		const focusedIndex = focusArray.indexOf(document.activeElement);

		if (e.shiftKey && focusedIndex === 0) {
			focusArray[focusArray.length - 1].focus();
			e.preventDefault();
		}
		if (!e.shiftKey && focusedIndex === focusArray.length - 1) {
			focusArray[0].focus();
			e.preventDefault();
		}
	}
	_focusTrap() {
		const focusable = this.previousOpen.element.querySelectorAll(this._focusEl);
		if (!this.isOpen && this.lastFocusEl) {
			this.lastFocusEl.focus();
		} else {
			focusable[0].focus();
		}
	}
	// Функция вывода в консоль
	popupLogging(message) {
		this.options.logging ? console.log(`[Попапос]: ${message}`) : null;
	}
}

;// CONCATENATED MODULE: ./src/js/files/functions.js
/* Проверка поддержки webp, добавление класса webp или no-webp для HTML */
function isWebp() {
	// Проверка поддержки webp
	function testWebP(callback) {
		let webP = new Image();
		webP.onload = webP.onerror = function () {
			callback(webP.height == 2);
		};
		webP.src = "data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA";
	}
	// Добавление класса _webp или _no-webp для HTML
	testWebP(function (support) {
		let className = support === true ? 'webp' : 'no-webp';
		document.documentElement.classList.add(className);
	});
}
/* Проверка мобильного браузера */
let isMobile = { Android: function () { return navigator.userAgent.match(/Android/i); }, BlackBerry: function () { return navigator.userAgent.match(/BlackBerry/i); }, iOS: function () { return navigator.userAgent.match(/iPhone|iPad|iPod/i); }, Opera: function () { return navigator.userAgent.match(/Opera Mini/i); }, Windows: function () { return navigator.userAgent.match(/IEMobile/i); }, any: function () { return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows()); } };
/* Добавление класса touch для HTML если браузер мобильный */
function addTouchClass() {
	// Добавление класса _touch для HTML если браузер мобильный
	if (isMobile.any()) document.documentElement.classList.add('touch');
}
// Добавление loaded для HTML после полной загрузки страницы
function addLoadedClass() {
	window.addEventListener("load", function () {
		setTimeout(function () {
			document.documentElement.classList.add('loaded');
		}, 0);
	});
}
// Получение хеша в адресе сайта
function getHash() {
	if (location.hash) { return location.hash.replace('#', ''); }
}
// Указание хеша в адресе сайта
function setHash(hash) {
	history.pushState('', '', hash);
}
// Учет плавающей панели на мобильных устройствах при 100vh
function fullVHfix() {
	const fullScreens = document.querySelectorAll('[data-fullscreen]');
	if (fullScreens.length && isMobile.any()) {
		window.addEventListener('resize', fixHeight);
		function fixHeight() {
			let vh = window.innerHeight * 0.01;
			document.documentElement.style.setProperty('--vh', `${vh}px`);
		}
		fixHeight();
	}
}
// Вспомогательные модули плавного расскрытия и закрытия объекта ======================================================================================================================================================================
let _slideUp = (target, duration = 500, showmore = 0) => {
	if (!target.classList.contains('_slide')) {
		target.classList.add('_slide');
		target.style.transitionProperty = 'height, margin, padding';
		target.style.transitionDuration = duration + 'ms';
		target.style.height = `${target.offsetHeight}px`;
		target.offsetHeight;
		target.style.overflow = 'hidden';
		target.style.height = showmore ? `${showmore}px` : `0px`;
		target.style.paddingTop = 0;
		target.style.paddingBottom = 0;
		target.style.marginTop = 0;
		target.style.marginBottom = 0;
		window.setTimeout(() => {
			target.hidden = !showmore ? true : false;
			!showmore ? target.style.removeProperty('height') : null;
			target.style.removeProperty('padding-top');
			target.style.removeProperty('padding-bottom');
			target.style.removeProperty('margin-top');
			target.style.removeProperty('margin-bottom');
			!showmore ? target.style.removeProperty('overflow') : null;
			target.style.removeProperty('transition-duration');
			target.style.removeProperty('transition-property');
			target.classList.remove('_slide');
		}, duration);
	}
}
let _slideDown = (target, duration = 500, showmore = 0) => {
	if (!target.classList.contains('_slide')) {
		target.classList.add('_slide');
		target.hidden = target.hidden ? false : null;
		showmore ? target.style.removeProperty('height') : null;
		let height = target.offsetHeight;
		target.style.overflow = 'hidden';
		target.style.height = showmore ? `${showmore}px` : `0px`;
		target.style.paddingTop = 0;
		target.style.paddingBottom = 0;
		target.style.marginTop = 0;
		target.style.marginBottom = 0;
		target.offsetHeight;
		target.style.transitionProperty = "height, margin, padding";
		target.style.transitionDuration = duration + 'ms';
		target.style.height = height + 'px';
		target.style.removeProperty('padding-top');
		target.style.removeProperty('padding-bottom');
		target.style.removeProperty('margin-top');
		target.style.removeProperty('margin-bottom');
		window.setTimeout(() => {
			target.style.removeProperty('height');
			target.style.removeProperty('overflow');
			target.style.removeProperty('transition-duration');
			target.style.removeProperty('transition-property');
			target.classList.remove('_slide');
		}, duration);
	}
}
let functions_slideToggle = (target, duration = 500) => {
	if (target.hidden) {
		return _slideDown(target, duration);
	} else {
		return _slideUp(target, duration);
	}
}
// Вспомогательные модули блокировки прокрутки и скочка ====================================================================================================================================================================================================================================================================================
let functions_bodyLockStatus = true;
let functions_bodyLockToggle = (delay = 500) => {
	if (document.documentElement.classList.contains('lock')) {
		bodyUnlock(delay);
	} else {
		bodyLock(delay);
	}
}
let bodyUnlock = (delay = 500) => {
	let body = document.querySelector("body");
	if (functions_bodyLockStatus) {
		let lock_padding = document.querySelectorAll("[data-lp]");
		setTimeout(() => {
			for (let index = 0; index < lock_padding.length; index++) {
				const el = lock_padding[index];
				el.style.paddingRight = '0px';
			}
			body.style.paddingRight = '0px';
			document.documentElement.classList.remove("lock");
		}, delay);
		functions_bodyLockStatus = false;
		setTimeout(function () {
			functions_bodyLockStatus = true;
		}, delay);
	}
}
let bodyLock = (delay = 500) => {
	let body = document.querySelector("body");
	if (functions_bodyLockStatus) {
		let lock_padding = document.querySelectorAll("[data-lp]");
		for (let index = 0; index < lock_padding.length; index++) {
			const el = lock_padding[index];
			el.style.paddingRight = window.innerWidth - document.querySelector('.wrapper').offsetWidth + 'px';
		}
		body.style.paddingRight = window.innerWidth - document.querySelector('.wrapper').offsetWidth + 'px';
		document.documentElement.classList.add("lock");

		functions_bodyLockStatus = false;
		setTimeout(function () {
			functions_bodyLockStatus = true;
		}, delay);
	}
}
// Модуь работы со спойлерами =======================================================================================================================================================================================================================
/*
Для родителя слойлеров пишем атрибут data-spollers
Для заголовков слойлеров пишем атрибут data-spoller
Если нужно включать\выключать работу спойлеров на разных размерах экранов
пишем параметры ширины и типа брейкпоинта.

Например: 
data-spollers="992,max" - спойлеры будут работать только на экранах меньше или равно 992px
data-spollers="768,min" - спойлеры будут работать только на экранах больше или равно 768px

Если нужно что бы в блоке открывался болько один слойлер добавляем атрибут data-one-spoller
*/
function spollers() {
	const spollersArray = document.querySelectorAll('[data-spollers]');
	if (spollersArray.length > 0) {
		// Получение обычных слойлеров
		const spollersRegular = Array.from(spollersArray).filter(function (item, index, self) {
			return !item.dataset.spollers.split(",")[0];
		});
		// Инициализация обычных слойлеров
		if (spollersRegular.length > 0) {
			initSpollers(spollersRegular);
		}
		// Получение слойлеров с медиа запросами
		const spollersMedia = Array.from(spollersArray).filter(function (item, index, self) {
			return item.dataset.spollers.split(",")[0];
		});
		// Инициализация слойлеров с медиа запросами
		if (spollersMedia.length > 0) {
			const breakpointsArray = [];
			spollersMedia.forEach(item => {
				const params = item.dataset.spollers;
				const breakpoint = {};
				const paramsArray = params.split(",");
				breakpoint.value = paramsArray[0];
				breakpoint.type = paramsArray[1] ? paramsArray[1].trim() : "max";
				breakpoint.item = item;
				breakpointsArray.push(breakpoint);
			});
			// Получаем уникальные брейкпоинты
			let mediaQueries = breakpointsArray.map(function (item) {
				return '(' + item.type + "-width: " + item.value + "px)," + item.value + ',' + item.type;
			});
			mediaQueries = mediaQueries.filter(function (item, index, self) {
				return self.indexOf(item) === index;
			});
			// Работаем с каждым брейкпоинтом
			mediaQueries.forEach(breakpoint => {
				const paramsArray = breakpoint.split(",");
				const mediaBreakpoint = paramsArray[1];
				const mediaType = paramsArray[2];
				const matchMedia = window.matchMedia(paramsArray[0]);
				// Объекты с нужными условиями
				const spollersArray = breakpointsArray.filter(function (item) {
					if (item.value === mediaBreakpoint && item.type === mediaType) {
						return true;
					}
				});
				// Событие
				matchMedia.addEventListener("change", function () {
					initSpollers(spollersArray, matchMedia);
				});
				initSpollers(spollersArray, matchMedia);
			});
		}
		// Инициализация
		function initSpollers(spollersArray, matchMedia = false) {
			spollersArray.forEach(spollersBlock => {
				spollersBlock = matchMedia ? spollersBlock.item : spollersBlock;
				if (matchMedia.matches || !matchMedia) {
					spollersBlock.classList.add('_spoller-init');
					initSpollerBody(spollersBlock);
					spollersBlock.addEventListener("click", setSpollerAction);
				} else {
					spollersBlock.classList.remove('_spoller-init');
					initSpollerBody(spollersBlock, false);
					spollersBlock.removeEventListener("click", setSpollerAction);
				}
			});
		}
		// Работа с контентом
		function initSpollerBody(spollersBlock, hideSpollerBody = true) {
			const spollerTitles = spollersBlock.querySelectorAll('[data-spoller]');
			if (spollerTitles.length > 0) {
				spollerTitles.forEach(spollerTitle => {
					if (hideSpollerBody) {
						spollerTitle.removeAttribute('tabindex');
						if (!spollerTitle.classList.contains('_spoller-active')) {
							spollerTitle.nextElementSibling.hidden = true;
						}
					} else {
						spollerTitle.setAttribute('tabindex', '-1');
						spollerTitle.nextElementSibling.hidden = false;
					}
				});
			}
		}
		function setSpollerAction(e) {
			const el = e.target;
			if (el.hasAttribute('data-spoller') || el.closest('[data-spoller]')) {
				const spollerTitle = el.hasAttribute('data-spoller') ? el : el.closest('[data-spoller]');
				const spollersBlock = spollerTitle.closest('[data-spollers]');
				const oneSpoller = spollersBlock.hasAttribute('data-one-spoller') ? true : false;
				if (!spollersBlock.querySelectorAll('._slide').length) {
					if (oneSpoller && !spollerTitle.classList.contains('_spoller-active')) {
						hideSpollersBody(spollersBlock);
					}
					spollerTitle.classList.toggle('_spoller-active');
					functions_slideToggle(spollerTitle.nextElementSibling, 500);
				}
				e.preventDefault();
			}
		}
		function hideSpollersBody(spollersBlock) {
			const spollerActiveTitle = spollersBlock.querySelector('[data-spoller]._spoller-active');
			if (spollerActiveTitle) {
				spollerActiveTitle.classList.remove('_spoller-active');
				_slideUp(spollerActiveTitle.nextElementSibling, 500);
			}
		}
	}
}
// Модуь работы с табами =======================================================================================================================================================================================================================
/*
Для родителя табов пишем атрибут data-tabs
Для родителя заголовков табов пишем атрибут data-tabs-titles
Для родителя блоков табов пишем атрибут data-tabs-body

Если нужно чтобы табы открывались с анимацией 
добавляем к data-tabs data-tabs-animate
По умолчанию, скорость анимации 500ms, 
указать свою скорость можно так: data-tabs-animate="1000"

Если нужно чтобы табы превращались в "спойлеры" на неком размере экранов пишем параметры ширины.
Например: data-tabs="992" - табы будут превращаться в спойлеры на экранах меньше или равно 992px
*/
function tabs() {
	const tabs = document.querySelectorAll('[data-tabs]');
	let tabsActiveHash = [];

	if (tabs.length > 0) {
		const hash = location.hash.replace('#', '');
		if (hash.startsWith('tab-')) {
			tabsActiveHash = hash.replace('tab-', '').split('-');
		}
		tabs.forEach((tabsBlock, index) => {
			tabsBlock.classList.add('_tab-init');
			tabsBlock.setAttribute('data-tabs-index', index);
			tabsBlock.addEventListener("click", setTabsAction);
			initTabs(tabsBlock);
		});

		// Получение табов с медиа запросами
		const tabsMedia = Array.from(tabs).filter(function (item, index, self) {
			return item.dataset.tabs;
		});
		// Инициализация табов с медиа запросами
		if (tabsMedia.length > 0) {
			initMediaTabs(tabsMedia);
		}
	}
	// Инициализация табов с медиа запросами
	function initMediaTabs(tabsMedia) {
		const breakpointsArray = [];
		tabsMedia.forEach(item => {
			const breakpointValue = item.dataset.tabs;

			const tabsBreakpointsObject = {};
			tabsBreakpointsObject.value = breakpointValue;
			tabsBreakpointsObject.item = item;

			breakpointsArray.push(tabsBreakpointsObject);
		});

		// Получаем уникальные брейкпоинты
		let mediaQueries = breakpointsArray.map(function (item) {
			return `(max-width:${item.value}px),${item.value}`;
		});
		mediaQueries = mediaQueries.filter(function (item, index, self) {
			return self.indexOf(item) === index;
		});

		// Работаем с каждым брейкпоинтом
		mediaQueries.forEach(breakpoint => {
			const paramsArray = breakpoint.split(",");
			const matchMedia = window.matchMedia(paramsArray[0]);
			const mediaBreakpoint = paramsArray[1];

			// Объекты с нужными условиями
			const tabsMediaArray = breakpointsArray.filter(function (item) {
				if (item.value === mediaBreakpoint) {
					return true;
				}
			});

			// Событие
			matchMedia.addEventListener("change", function () {
				setTitlePosition(tabsMediaArray, matchMedia);
			});
			setTitlePosition(tabsMediaArray, matchMedia);
		});
	}
	// Установка позиций заголовков
	function setTitlePosition(tabsMediaArray, matchMedia) {
		tabsMediaArray.forEach(tabsMediaItem => {
			tabsMediaItem = tabsMediaItem.item;
			const tabsTitles = tabsMediaItem.querySelector('[data-tabs-titles]');
			const tabsTitleItems = tabsMediaItem.querySelectorAll('[data-tabs-title]');
			const tabsContent = tabsMediaItem.querySelector('[data-tabs-body]');
			const tabsContentItems = tabsMediaItem.querySelectorAll('[data-tabs-item]');
			tabsContentItems.forEach((tabsContentItem, index) => {
				if (matchMedia.matches) {
					tabsContent.append(tabsTitleItems[index]);
					tabsContent.append(tabsContentItem);
					tabsMediaItem.classList.add('_tab-spoller');
				} else {
					tabsTitles.append(tabsTitleItems[index]);
					tabsMediaItem.classList.remove('_tab-spoller');
				}
			});
		});
	}
	// Работа с контентом
	function initTabs(tabsBlock) {
		const tabsTitles = tabsBlock.querySelectorAll('[data-tabs-titles]>*');
		const tabsContent = tabsBlock.querySelectorAll('[data-tabs-body]>*');
		const tabsBlockIndex = tabsBlock.dataset.tabsIndex;
		const tabsActiveHashBlock = tabsActiveHash[0] == tabsBlockIndex;

		if (tabsActiveHashBlock) {
			const tabsActiveTitle = tabsBlock.querySelector('[data-tabs-titles]>._tab-active');
			tabsActiveTitle.classList.remove('_tab-active');
		}
		if (tabsContent.length > 0) {
			tabsContent.forEach((tabsContentItem, index) => {
				tabsTitles[index].setAttribute('data-tabs-title', '');
				tabsContentItem.setAttribute('data-tabs-item', '');

				if (tabsActiveHashBlock && index == tabsActiveHash[1]) {
					tabsTitles[index].classList.add('_tab-active');
				}
				tabsContentItem.hidden = !tabsTitles[index].classList.contains('_tab-active');
			});
		}
	}
	function setTabsStatus(tabsBlock) {
		const tabsTitles = tabsBlock.querySelectorAll('[data-tabs-title]');
		const tabsContent = tabsBlock.querySelectorAll('[data-tabs-item]');
		const tabsBlockIndex = tabsBlock.dataset.tabsIndex;

		function isTabsAnamate(tabsBlock) {
			if (tabsBlock.hasAttribute('data-tabs-animate')) {
				return tabsBlock.dataset.tabsAnimate > 0 ? tabsBlock.dataset.tabsAnimate : 500;
			}
		}
		const tabsBlockAnimate = isTabsAnamate(tabsBlock);

		if (tabsContent.length > 0) {
			tabsContent.forEach((tabsContentItem, index) => {
				if (tabsTitles[index].classList.contains('_tab-active')) {
					if (tabsBlockAnimate) {
						_slideDown(tabsContentItem, tabsBlockAnimate);
					} else {
						tabsContentItem.hidden = false;
					}
					location.hash = `tab-${tabsBlockIndex}-${index}`;
				} else {
					if (tabsBlockAnimate) {
						_slideUp(tabsContentItem, tabsBlockAnimate);
					} else {
						tabsContentItem.hidden = true;
					}
				}
			});
		}
	}
	function setTabsAction(e) {
		const el = e.target;
		if (el.closest('[data-tabs-title]')) {
			const tabTitle = el.closest('[data-tabs-title]');
			const tabsBlock = tabTitle.closest('[data-tabs]');
			if (!tabTitle.classList.contains('_tab-active') && !tabsBlock.querySelectorAll('._slide').length) {

				const tabActiveTitle = tabsBlock.querySelector('[data-tabs-title]._tab-active');
				if (tabActiveTitle) {
					tabActiveTitle.classList.remove('_tab-active');
				}

				tabTitle.classList.add('_tab-active');
				setTabsStatus(tabsBlock);
			}
			e.preventDefault();
		}
	}
}
// Модуь работы с меню (бургер) =======================================================================================================================================================================================================================
function menuInit() {
	let iconMenu = document.querySelector(".icon-menu");
	if (iconMenu) {
		iconMenu.addEventListener("click", function (e) {
			if (functions_bodyLockStatus) {
				functions_bodyLockToggle();
				document.documentElement.classList.toggle("menu-open");
			}
		});
	};
}
function menuOpen() {
	bodyLock();
	document.documentElement.classList.add("menu-open");
}
function menuClose() {
	bodyUnlock();
	document.documentElement.classList.remove("menu-open");
}
// Модуль "показать еще" =======================================================================================================================================================================================================================
/*
Документация по работе в шаблоне:
data-showmore="size/items"
data-showmore-content="размер/кол-во"
data-showmore-button="скорость"
Сниппет (HTML): showmore
*/
function showMore() {
	const showMoreBlocks = document.querySelectorAll('[data-showmore]');
	if (showMoreBlocks.length) {
		initItems(showMoreBlocks);
		document.addEventListener("click", showMoreActions);
		window.addEventListener("resize", showMoreActions);
	}
	function initItems(showMoreBlocks) {
		showMoreBlocks.forEach(showMoreBlock => {
			initItem(showMoreBlock);
		});
	}
	function initItem(showMoreBlock) {
		const showMoreContent = showMoreBlock.querySelector('[data-showmore-content]');
		const showMoreButton = showMoreBlock.querySelector('[data-showmore-button]');
		const hiddenHeight = getHeight(showMoreBlock, showMoreContent);
		if (hiddenHeight < getOriginalHeight(showMoreContent)) {
			_slideUp(showMoreContent, 0, hiddenHeight);
			showMoreButton.hidden = false;
		}
	}
	function getHeight(showMoreBlock, showMoreContent) {
		let hiddenHeight = 0;
		const showMoreType = showMoreBlock.dataset.showmore ? showMoreBlock.dataset.showmore : 'size';
		if (showMoreType === 'items') {
			const showMoreTypeValue = showMoreContent.dataset.showmoreContent ? showMoreContent.dataset.showmoreContent : 3;
			const showMoreItems = showMoreContent.children;
			for (let index = 1; index < showMoreItems.length; index++) {
				const showMoreItem = showMoreItems[index - 1];
				hiddenHeight += showMoreItem.offsetHeight;
				if (index === showMoreTypeValue) break;
			}
		} else {
			const showMoreTypeValue = showMoreContent.dataset.showmoreContent ? showMoreContent.dataset.showmoreContent : 150;
			hiddenHeight = showMoreTypeValue;
		}
		return hiddenHeight;
	}
	function getOriginalHeight(showMoreContent) {
		let hiddenHeight = showMoreContent.offsetHeight;
		showMoreContent.style.removeProperty('height');
		let originalHeight = showMoreContent.offsetHeight;
		showMoreContent.style.height = `${hiddenHeight}px`;
		return originalHeight;
	}
	function showMoreActions(e) {
		const targetEvent = e.target;
		const targetType = e.type;
		if (targetType === 'click') {
			if (targetEvent.closest('[data-showmore-button]')) {
				const showMoreButton = targetEvent.closest('[data-showmore-button]');
				const showMoreBlock = showMoreButton.closest('[data-showmore]');
				const showMoreContent = showMoreBlock.querySelector('[data-showmore-content]');
				const showMoreSpeed = showMoreBlock.dataset.showmoreButton ? showMoreBlock.dataset.showmoreButton : '500';
				const hiddenHeight = getHeight(showMoreBlock, showMoreContent);
				if (!showMoreContent.classList.contains('_slide')) {
					showMoreBlock.classList.contains('_showmore-active') ? _slideUp(showMoreContent, showMoreSpeed, hiddenHeight) : _slideDown(showMoreContent, showMoreSpeed, hiddenHeight);
					showMoreBlock.classList.toggle('_showmore-active');
				}
			}
		} else if (targetType === 'resize') {
			initItems(showMoreBlocks);
		}
	}
}

// Модуль попапов ===========================================================================================================================================================================================================================
/*
Документация по работе в шаблоне:
data-popup - Атрибут для кнопки, которая вызывает попап
data-close - Атрибут для кнопки, которая закрывает попап
data-youtube - Атрибут для кода youtube
Сниппет (HTML): pl
*/

const initPopups = (logging = false, init = true) => new Popup({ logging: logging, init: init });

//================================================================================================================================================================================================================================================================================================================
// Прочие полезные функции ================================================================================================================================================================================================================================================================================================================
//================================================================================================================================================================================================================================================================================================================

// Получить цифры из строки
function getDigFromString(item) {
	return parseInt(item.replace(/[^\d]/g, ''))
}
// Форматирование цифр типа 100 000 000
function getDigFormat(item) {
	return item.toString().replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, "$1 ");
}
// Убрать класс из всех элементов массива
function removeClasses(array, className) {
	for (var i = 0; i < array.length; i++) {
		array[i].classList.remove(className);
	}
}
// Уникализация массива
function functions_uniqArray(array) {
	return array.filter(function (item, index, self) {
		return self.indexOf(item) === index;
	});
}
// Функция получения индекса внутри родителя
function indexInParent(parent, element) {
	const array = Array.prototype.slice.call(parent.children);
	return Array.prototype.indexOf.call(array, element);
};

//================================================================================================================================================================================================================================================================================================================
;// CONCATENATED MODULE: ./src/js/files/scroll/gotoblock.js
// Импорт функционала ====================================================================================================================================================================================================================================================================================================
// Вспомогательные функции

// Подключение дополнения для увеличения возможностей
// Документация: https://github.com/cferdinandi/smooth-scroll
//import SmoothScroll from 'smooth-scroll';
//==============================================================================================================================================================================================================================================================================================================================

// Модуль плавной проктутки к блоку
let gotoblock_gotoBlock = (targetBlock, noHeader = false, speed = 500, offset = 0) => {
	const targetBlockElement = document.querySelector(targetBlock);
	if (targetBlockElement) {
		let headerItem = '';
		let headerItemHeight = 0;
		//OffsetHeader
		if (noHeader) {
			headerItem = 'header.header';
			headerItemHeight = document.querySelector(headerItem).offsetHeight;
		}
		let options = {
			speedAsDuration: true,
			speed: speed,
			header: headerItem,
			offset: offset,
			easing: 'easeOutQuad',
		};
		// Закрываем меню, если оно открыто
		document.documentElement.classList.contains("menu-open") ? menuClose() : null;

		if (typeof SmoothScroll !== 'undefined') {
			// Прокрутка с использованием дополнения
			new SmoothScroll().animateScroll(targetBlockElement, '', options);
		} else {
			// Прокрутка стандартными средствами
			window.scrollTo({
				top: headerItemHeight ? targetBlockElement.getBoundingClientRect().top - headerItemHeight : targetBlockElement.getBoundingClientRect().top,
				behavior: "smooth"
			});
		}

	} else {
		console.log(`[gotoBlock]: Такого блока нет на странице: ${targetBlock}`);
	}
};
;// CONCATENATED MODULE: ./src/js/libs/select.js
//----- Импорт зависимостей ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------



// Подключение файла стилей
// Базовые стили поключаются в src/scss/forms.scss
// Файл базовых стилей src/scss/forms/select.scss

/*
Документация:
Снипет (HTML): sel
*/
/*
// Настройки
Для селекта (select):
class="имя класса" - модификатор к конкретному селекту
multiple - мультивыбор
data-tags - режим тегов, только для (только для multiple)
data-scroll - включит прокрутку для выпадающего списка, дополнительно можно подключить кастомный скролл simplebar в app.js. Указанное число для атрибута ограничит высоту
data-checkbox - стилизация элементов по checkbox (только для multiple)
data-show-selected - отключает скрытие выбранного элемента
data-search - позволяет искать по выпадающему списку
data-open - селект открыт сразу
data-submit - отправляет форму при изменении селекта

Для плейсхолдера (Плейсхолдер - это option с value=""):
data-label для плейсхолдера, добавляет label к селекту
data-show для плейсхолдера, показывает его в списке (только для единичного выбора)

Для элемента (option):
data-class="имя класса" - добавляет класс
data-asset="путь к картинке или текст" - добавляет структуру 2х колонок и данными
data-href="адрес ссылки" - добавляет ссылку в элемент списка
data-href-blank - откроет ссылку в новом окне
*/

/*
// Возможные доработки:
попап на мобилке
*/

// Класс построения Select
class select_SelectConstructor {
	constructor(props, data = null) {
		let defaultConfig = {
			init: true,
			logging: false,
		}
		this.config = Object.assign(defaultConfig, props);
		// CSS классы модуля
		this.selectClasses = {
			classSelect: "select", // Главный блок
			classSelectBody: "select__body", // Тело селекта
			classSelectTitle: "select__title", // Заголовок
			classSelectValue: "select__value", // Значение в заголовке
			classSelectLabel: "select__label", // Лабел
			classSelectInput: "select__input", // Поле ввода
			classSelectText: "select__text", // Оболочка текстовых данных
			classSelectLink: "select__link", // Ссылка в элементе
			classSelectOptions: "select__options", // Выпадающий список
			classSelectOptionsScroll: "select__scroll", // Оболочка при скролле
			classSelectOption: "select__option", // Пункт
			classSelectContent: "select__content", // Оболочка контента в заголовке
			classSelectRow: "select__row", // Ряд
			classSelectData: "select__asset", // Дополнительные данные
			classSelectDisabled: "_select-disabled", // Запрешен
			classSelectTag: "_select-tag", // Класс тега
			classSelectOpen: "_select-open", // Список открыт
			classSelectActive: "_select-active", // Список выбран
			classSelectFocus: "_select-focus", // Список в фокусе
			classSelectMultiple: "_select-multiple", // Мультивыбор
			classSelectCheckBox: "_select-checkbox", // Стиль чекбокса
			classSelectOptionSelected: "_select-selected", // Выбранный пункт
		}
		this._this = this;
		// Запуск инициализации
		if (this.config.init) {
			// Получение всех select на странице
			const selectItems = data ? document.querySelectorAll(data) : document.querySelectorAll('select');
			if (selectItems.length) {
				this.selectsInit(selectItems);
				this.setLogging(`Проснулся, построил селектов: (${selectItems.length})`);
			} else {
				this.setLogging('Нет ни одного select. Сплю...zzZZZzZZz...');
			}
		}
	}
	// Конструктор CSS класса
	getSelectClass(className) {
		return `.${className}`;
	}
	// Геттер элементов псевдоселекта
	getSelectElement(selectItem, className) {
		return {
			originalSelect: selectItem.querySelector('select'),
			selectElement: selectItem.querySelector(this.getSelectClass(className)),
		}
	}
	// Функция инициализации всех селектов
	selectsInit(selectItems) {
		selectItems.forEach((originalSelect, index) => {
			this.selectInit(originalSelect, index + 1);
		});
		// Обработчики событий...
		// ...при клике
		document.addEventListener('click', function (e) {
			this.selectsActions(e);
		}.bind(this));
		// ...при нажатии клавиши
		document.addEventListener('keydown', function (e) {
			this.selectsActions(e);
		}.bind(this));
		// ...при фокусе
		document.addEventListener('focusin', function (e) {
			this.selectsActions(e);
		}.bind(this));
		// ...при потере фокуса
		document.addEventListener('focusout', function (e) {
			this.selectsActions(e);
		}.bind(this));
	}
	// Функция инициализации конкретного селекта
	selectInit(originalSelect, index) {
		const _this = this;
		// Создаем оболочку
		let selectItem = document.createElement("div");
		selectItem.classList.add(this.selectClasses.classSelect);
		// Выводим оболочку перед оригинальным селектом
		originalSelect.parentNode.insertBefore(selectItem, originalSelect);
		// Помещаем оригинальный селект в оболочку
		selectItem.appendChild(originalSelect);
		// Скрываем оригинальный селект
		originalSelect.hidden = true;
		// Присваиваем уникальный ID
		index ? originalSelect.dataset.id = index : null;

		// Конструктор косновных элементов
		selectItem.insertAdjacentHTML('beforeend', `<div class="${this.selectClasses.classSelectBody}"><div hidden class="${this.selectClasses.classSelectOptions}"></div></div>`);
		// Запускаем конструктор псевдоселекта
		this.selectBuild(originalSelect);

		// Работа с плейсхолдером
		if (this.getSelectPlaceholder(originalSelect)) {
			// Запоминаем плейсхолдер
			originalSelect.dataset.placeholder = this.getSelectPlaceholder(originalSelect).value;
			// Если включен режим label
			if (this.getSelectPlaceholder(originalSelect).label.show) {
				const selectItemTitle = this.getSelectElement(selectItem, this.selectClasses.classSelectTitle).selectElement;
				selectItemTitle.insertAdjacentHTML('afterbegin', `<span class="${this.selectClasses.classSelectLabel}">${this.getSelectPlaceholder(originalSelect).label.text ? this.getSelectPlaceholder(originalSelect).label.text : this.getSelectPlaceholder(originalSelect).value}</span>`);
			}
		}
		// Запоминаем скорость
		originalSelect.dataset.speed = originalSelect.dataset.speed ? originalSelect.dataset.speed : "150";
		// Событие при изменении оригинального select
		originalSelect.addEventListener('change', function (e) {
			_this.selectChange(e);
		});
	}
	// Конструктор псевдоселекта
	selectBuild(originalSelect) {
		const selectItem = originalSelect.parentElement;
		// Добавляем ID селекта
		selectItem.dataset.id = originalSelect.dataset.id;
		// Получаем класс оригинального селекта, создаем модификатор и добавляем его
		selectItem.classList.add(originalSelect.getAttribute('class') ? `select_${originalSelect.getAttribute('class')}` : "");
		// Если множественный выбор, добавляем класс
		originalSelect.multiple ? selectItem.classList.add(this.selectClasses.classSelectMultiple) : selectItem.classList.remove(this.selectClasses.classSelectMultiple);
		// Cтилизация элементов под checkbox (только для multiple)
		originalSelect.hasAttribute('data-checkbox') && originalSelect.multiple ? selectItem.classList.add(this.selectClasses.classSelectCheckBox) : selectItem.classList.remove(this.selectClasses.classSelectCheckBox);
		// Сеттер значения заголовка селекта
		this.setSelectTitleValue(selectItem, originalSelect);
		// Сеттер элементов списка (options)
		this.setOptions(selectItem, originalSelect);
		// Если включена опция поиска data-search, запускаем обработчик
		originalSelect.hasAttribute('data-search') ? this.searchActions(selectItem) : null;
		// Если указана настройка data-open, открываем селект
		originalSelect.hasAttribute('data-open') ? this.selectAction(selectItem) : null;
		// Обработчик disabled
		this.selectDisabled(selectItem, originalSelect);
	}
	// Функция реакций на события
	selectsActions(e) {
		const targetElement = e.target;
		const targetType = e.type;
		if (targetElement.closest(this.getSelectClass(this.selectClasses.classSelect)) || targetElement.closest(this.getSelectClass(this.selectClasses.classSelectTag))) {
			const selectItem = targetElement.closest('.select') ? targetElement.closest('.select') : document.querySelector(`.${this.selectClasses.classSelect}[data-id="${targetElement.closest(this.getSelectClass(this.selectClasses.classSelectTag)).dataset.selectId}"]`);
			const originalSelect = this.getSelectElement(selectItem).originalSelect;
			if (targetType === 'click') {
				if (!originalSelect.disabled) {
					if (targetElement.closest(this.getSelectClass(this.selectClasses.classSelectTag))) {
						// Обработка клика на тег
						const targetTag = targetElement.closest(this.getSelectClass(this.selectClasses.classSelectTag));
						const optionItem = document.querySelector(`.${this.selectClasses.classSelect}[data-id="${targetTag.dataset.selectId}"] .select__option[data-value="${targetTag.dataset.value}"]`);
						this.optionAction(selectItem, originalSelect, optionItem);
					} else if (targetElement.closest(this.getSelectClass(this.selectClasses.classSelectTitle))) {
						// Обработка клика на заголовок селекта
						this.selectAction(selectItem);
					} else if (targetElement.closest(this.getSelectClass(this.selectClasses.classSelectOption))) {
						// Обработка клика на элемент селекта
						const optionItem = targetElement.closest(this.getSelectClass(this.selectClasses.classSelectOption));
						this.optionAction(selectItem, originalSelect, optionItem);
					}
				}
			} else if (targetType === 'focusin' || targetType === 'focusout') {
				if (targetElement.closest(this.getSelectClass(this.selectClasses.classSelect))) {
					targetType === 'focusin' ? selectItem.classList.add(this.selectClasses.classSelectFocus) : selectItem.classList.remove(this.selectClasses.classSelectFocus);
				}
			} else if (targetType === 'keydown' && e.code === 'Escape') {
				this.selectsСlose();
			}
		} else {
			this.selectsСlose();
		}
	}
	// Функция закрытия всех селектов
	selectsСlose() {
		const selectActiveItems = document.querySelectorAll(`${this.getSelectClass(this.selectClasses.classSelect)}${this.getSelectClass(this.selectClasses.classSelectOpen)}`);
		if (selectActiveItems.length) {
			selectActiveItems.forEach(selectActiveItem => {
				this.selectAction(selectActiveItem);
			});
		}
	}
	// Функция открытия/закрытия конкретного селекта
	selectAction(selectItem) {
		const originalSelect = this.getSelectElement(selectItem).originalSelect;
		const selectOptions = this.getSelectElement(selectItem, this.selectClasses.classSelectOptions).selectElement;
		if (!selectOptions.classList.contains('_slide')) {
			selectItem.classList.toggle(this.selectClasses.classSelectOpen);
			_slideToggle(selectOptions, originalSelect.dataset.speed);
		}
	}
	// Сеттер значения заголовка селекта
	setSelectTitleValue(selectItem, originalSelect) {
		const selectItemBody = this.getSelectElement(selectItem, this.selectClasses.classSelectBody).selectElement;
		const selectItemTitle = this.getSelectElement(selectItem, this.selectClasses.classSelectTitle).selectElement;
		if (selectItemTitle) selectItemTitle.remove();
		selectItemBody.insertAdjacentHTML("afterbegin", this.getSelectTitleValue(selectItem, originalSelect));
	}
	// Конструктор значения заголовка
	getSelectTitleValue(selectItem, originalSelect) {
		// Получаем выбранные текстовые значения
		let selectTitleValue = this.getSelectedOptionsData(originalSelect, 2).html;
		// Обработка значений мультивыбора
		// Если включен режим тегов (указана настройка data-tags)
		if (originalSelect.multiple && originalSelect.hasAttribute('data-tags')) {
			selectTitleValue = this.getSelectedOptionsData(originalSelect).elements.map(option => `<span role="button" data-select-id="${selectItem.dataset.id}" data-value="${option.value}" class="_select-tag">${this.getSelectElementContent(option)}</span>`).join('');
			// Если вывод тегов во внешний блок
			if (originalSelect.dataset.tags && document.querySelector(originalSelect.dataset.tags)) {
				document.querySelector(originalSelect.dataset.tags).innerHTML = selectTitleValue;
				if (originalSelect.hasAttribute('data-search')) selectTitleValue = false;
			}
		}
		// Значение(я) или плейсхолдер
		selectTitleValue = selectTitleValue.length ? selectTitleValue : originalSelect.dataset.placeholder;
		// Если есть значение, добавляем класс
		this.getSelectedOptionsData(originalSelect).values.length ? selectItem.classList.add(this.selectClasses.classSelectActive) : selectItem.classList.remove(this.selectClasses.classSelectActive);
		// Возвращаем поле ввода для поиска или текст
		if (originalSelect.hasAttribute('data-search')) {
			// Выводим поле ввода для поиска

			return `<div class="${this.selectClasses.classSelectTitle}"><span class="${this.selectClasses.classSelectValue}"><input autocomplete="off" type="text" placeholder="${selectTitleValue}" data-placeholder="${selectTitleValue}" class="${this.selectClasses.classSelectInput}"></span></div>`;
		} else {
			// Если выбран элемент со своим классом
			const customClass = this.getSelectedOptionsData(originalSelect).elements.length && this.getSelectedOptionsData(originalSelect).elements[0].dataset.class ? ` ${this.getSelectedOptionsData(originalSelect).elements[0].dataset.class}` : '';
			// Выводим текстовое значение
			return `<button type="button" class="${this.selectClasses.classSelectTitle}"><span class="${this.selectClasses.classSelectValue}"><span class="${this.selectClasses.classSelectContent}${customClass}">${selectTitleValue}</span></span></button>`;
		}
	}
	// Конструктор данных для значения заголовка
	getSelectElementContent(selectOption) {
		// Если для элемента указан вывод картинки или текста, перестраиваем конструкцию
		const selectOptionData = selectOption.dataset.asset ? `${selectOption.dataset.asset}` : '';
		const selectOptionDataHTML = selectOptionData.indexOf('img') >= 0 ? `<img src="${selectOptionData}" alt="">` : selectOptionData;
		let selectOptionContentHTML = ``;
		selectOptionContentHTML += selectOptionData ? `<span class="${this.selectClasses.classSelectRow}">` : '';
		selectOptionContentHTML += selectOptionData ? `<span class="${this.selectClasses.classSelectData}">` : '';
		selectOptionContentHTML += selectOptionData ? selectOptionDataHTML : '';
		selectOptionContentHTML += selectOptionData ? `</span>` : '';
		selectOptionContentHTML += selectOptionData ? `<span class="${this.selectClasses.classSelectText}">` : '';
		selectOptionContentHTML += selectOption.textContent;
		selectOptionContentHTML += selectOptionData ? `</span>` : '';
		selectOptionContentHTML += selectOptionData ? `</span>` : '';
		return selectOptionContentHTML;
	}
	// Получение данных плейсхолдера
	getSelectPlaceholder(originalSelect) {
		const selectPlaceholder = Array.from(originalSelect.options).find(option => !option.value);
		if (selectPlaceholder) {
			return {
				value: selectPlaceholder.textContent,
				show: selectPlaceholder.hasAttribute("data-show"),
				label: {
					show: selectPlaceholder.hasAttribute("data-label"),
					text: selectPlaceholder.dataset.label
				}
			}
		}
	}
	// Получение данных из выбранных элементов
	getSelectedOptionsData(originalSelect, type) {
		// Получаем все выбранные объекты из select
		let selectedOptions = [];
		if (originalSelect.multiple) {
			// Если мультивыбор
			// Убираем плейсхолдер, получаем остальные выбранные элементы
			selectedOptions = Array.from(originalSelect.options).filter(option => option.value).filter(option => option.selected);
		} else {
			// Если единичный выбор
			selectedOptions.push(originalSelect.options[originalSelect.selectedIndex]);
		}
		return {
			elements: selectedOptions.map(option => option),
			values: selectedOptions.filter(option => option.value).map(option => option.value),
			html: selectedOptions.map(option => this.getSelectElementContent(option))
		}
	}
	// Конструктор элементов списка
	getOptions(originalSelect) {
		// Настрока скролла элементов
		let selectOptionsScroll = originalSelect.hasAttribute('data-scroll') ? `data-simplebar` : '';
		let selectOptionsScrollHeight = originalSelect.dataset.scroll ? `style="max-height:${originalSelect.dataset.scroll}px"` : '';
		// Получаем элементы списка
		let selectOptions = Array.from(originalSelect.options);
		if (selectOptions.length > 0) {
			let selectOptionsHTML = ``;
			// Если указана настройка data-show, показываем плейсхолдер в списке
			if ((this.getSelectPlaceholder(originalSelect) && !this.getSelectPlaceholder(originalSelect).show) || originalSelect.multiple) {
				selectOptions = selectOptions.filter(option => option.value);
			}
			// Строим и выводим основную конструкцию
			selectOptionsHTML += selectOptionsScroll ? `<div ${selectOptionsScroll} ${selectOptionsScrollHeight} class="${this.selectClasses.classSelectOptionsScroll}">` : '';
			selectOptions.forEach(selectOption => {
				// Получаем конструкцию конкретного элемента списка
				selectOptionsHTML += this.getOption(selectOption, originalSelect);
			});
			selectOptionsHTML += selectOptionsScroll ? `</div>` : '';
			return selectOptionsHTML;
		}
	}
	// Конструктор конкретного элемента списка
	getOption(selectOption, originalSelect) {
		// Если элемент выбран и включен режим мультивыбора, добавляем класс
		const selectOptionSelected = selectOption.selected && originalSelect.multiple ? ` ${this.selectClasses.classSelectOptionSelected}` : '';
		// Если элемент выбрани нет настройки data-show-selected, скрываем элемент
		const selectOptionHide = selectOption.selected && !originalSelect.hasAttribute('data-show-selected') ? `hidden` : ``;
		// Если для элемента указан класс добавляем
		const selectOptionClass = selectOption.dataset.class ? ` ${selectOption.dataset.class}` : '';
		// Если указан режим ссылки
		const selectOptionLink = selectOption.dataset.href ? selectOption.dataset.href : false;
		const selectOptionLinkTarget = selectOption.hasAttribute('data-href-blank') ? `target="_blank"` : '';
		// Строим и возвращаем конструкцию элемента
		let selectOptionHTML = ``;
		selectOptionHTML += selectOptionLink ? `<a ${selectOptionLinkTarget} ${selectOptionHide} href="${selectOptionLink}" data-value="${selectOption.value}" class="${this.selectClasses.classSelectOption}${selectOptionClass}${selectOptionSelected}">` : `<button ${selectOptionHide} class="${this.selectClasses.classSelectOption}${selectOptionClass}${selectOptionSelected}" data-value="${selectOption.value}" type="button">`;
		selectOptionHTML += this.getSelectElementContent(selectOption);
		selectOptionHTML += selectOptionLink ? `</a>` : `</button>`;
		return selectOptionHTML;
	}
	// Сеттер элементов списка (options)
	setOptions(selectItem, originalSelect) {
		// Получаем объект тела псевдоселекта
		const selectItemOptions = this.getSelectElement(selectItem, this.selectClasses.classSelectOptions).selectElement;
		// Запускаем конструктор элементов списка (options) и добавляем в тело псевдоселекта
		selectItemOptions.innerHTML = this.getOptions(originalSelect);
	}
	// Обработчик клика на элемент списка
	optionAction(selectItem, originalSelect, optionItem) {
		if (originalSelect.multiple) { // Если мультивыбор
			// Выделяем классом элемент
			optionItem.classList.toggle(this.selectClasses.classSelectOptionSelected);
			// Очищаем выбранные элементы 
			const originalSelectSelectedItems = this.getSelectedOptionsData(originalSelect).elements;
			originalSelectSelectedItems.forEach(originalSelectSelectedItem => {
				originalSelectSelectedItem.removeAttribute('selected');
			});
			// Выбираем элементы 
			const selectSelectedItems = selectItem.querySelectorAll(this.getSelectClass(this.selectClasses.classSelectOptionSelected));
			selectSelectedItems.forEach(selectSelectedItems => {
				originalSelect.querySelector(`option[value="${selectSelectedItems.dataset.value}"]`).setAttribute('selected', 'selected');
			});
		} else { // Если единичный выбор
			// Если не указана настройка data-show-selected, скрываем выбранный элемент
			if (!originalSelect.hasAttribute('data-show-selected')) {
				// Сначала все показать
				if (selectItem.querySelector(`${this.getSelectClass(this.selectClasses.classSelectOption)}[hidden]`)) {
					selectItem.querySelector(`${this.getSelectClass(this.selectClasses.classSelectOption)}[hidden]`).hidden = false;
				}
				// Скрываем выбранную
				optionItem.hidden = true;
			}
			originalSelect.value = optionItem.hasAttribute('data-value') ? optionItem.dataset.value : optionItem.textContent;
			this.selectAction(selectItem);
		}
		// Обновляем заголовок селекта
		this.setSelectTitleValue(selectItem, originalSelect);
		// Вызываем реакцию на изменение селекта
		this.setSelectChange(originalSelect);
	}
	// Реакция на измененение оригинального select
	selectChange(e) {
		const originalSelect = e.target;
		this.selectBuild(originalSelect);
		this.setSelectChange(originalSelect);
	}
	// Обработчик изменения в селекте
	setSelectChange(originalSelect) {
		// Моментальная валидация селекта
		if (originalSelect.hasAttribute('data-validate')) {
			formValidate.validateInput(originalSelect);
		}
		// При изменении селекта отправляем форму
		if (originalSelect.hasAttribute('data-submit') && originalSelect.value) {
			let tempButton = document.createElement("button");
			tempButton.type = "submit";
			originalSelect.closest('form').append(tempButton);
			tempButton.click();
			tempButton.remove();
		}
		const selectItem = originalSelect.parentElement;
		// Вызов коллбэк функции
		this.selectCallback(selectItem, originalSelect);
	}
	// Обработчик disabled
	selectDisabled(selectItem, originalSelect) {
		if (originalSelect.disabled) {
			selectItem.classList.add(this.selectClasses.classSelectDisabled);
			this.getSelectElement(selectItem, this.selectClasses.classSelectTitle).selectElement.disabled = true;
		} else {
			selectItem.classList.remove(this.selectClasses.classSelectDisabled);
			this.getSelectElement(selectItem, this.selectClasses.classSelectTitle).selectElement.disabled = false;
		}
	}
	// Обработчик поиска по элементам списка
	searchActions(selectItem) {
		const originalSelect = this.getSelectElement(selectItem).originalSelect;
		const selectInput = this.getSelectElement(selectItem, this.selectClasses.classSelectInput).selectElement;
		const selectOptions = this.getSelectElement(selectItem, this.selectClasses.classSelectOptions).selectElement;
		const selectOptionsItems = selectOptions.querySelectorAll(`.${this.selectClasses.classSelectOption}`);
		const _this = this;
		selectInput.addEventListener("input", function () {
			selectOptionsItems.forEach(selectOptionsItem => {
				if (selectOptionsItem.textContent.toUpperCase().indexOf(selectInput.value.toUpperCase()) >= 0) {
					selectOptionsItem.hidden = false;
				} else {
					selectOptionsItem.hidden = true;
				}
			});
			// Если список закрыт открываем
			selectOptions.hidden === true ? _this.selectAction(selectItem) : null;
		});
	}
	// Коллбэк функция
	selectCallback(selectItem, originalSelect) {
		document.dispatchEvent(new CustomEvent("selectCallback", {
			detail: {
				select: originalSelect
			}
		}));
	}
	// Логгинг в консоль
	setLogging(message) {
		this.config.logging ? console.log(`[select]: ${message}`) : null;
	}
}


;// CONCATENATED MODULE: ./src/js/files/forms/forms.js
// Подключение функционала "Чертогов Фрилансера"
// Вспомогательные функции

// Модуль прокрутки к блоку

// Класс select

// Класс масок

// Функционал попапа
// const popupItem = initPopups();
//==============================================================================================================================================================================================================================================================================================================================
// Объект модулей форм для экспорта
const formsModules = {
   inputMaskModule: null,
   selectModule: null
}
//================================================================================================================================================================================================================================================================================================================================

/*
Чтобы поле участвовало в валидации добавляем атрибут data-required
Особые проверки:
data-required="email" - вадидация E-mail

Чтобы поле валидировалось при потере фокуса, 
к атрибуту data-required добавляем атрибут data-validate

Чтобы вывести текст ошибки, нужно указать его в атрибуте data-error
*/

// Работа с полями формы. Добавление классов, работа с placeholder
function formFieldsInit() {
   const formFields = document.querySelectorAll('input[placeholder],textarea[placeholder]');
   if (formFields.length) {
      formFields.forEach(formField => {
         formField.dataset.placeholder = formField.placeholder;
      });
   }
   document.body.addEventListener("focusin", function (e) {
      const targetElement = e.target;
      if ((targetElement.tagName === 'INPUT' || targetElement.tagName === 'TEXTAREA')) {
         if (targetElement.dataset.placeholder) {
            targetElement.placeholder = '';
         }
         targetElement.classList.add('_form-focus');
         targetElement.parentElement.classList.add('_form-focus');

         forms_formValidate.removeError(targetElement);
      }
   });
   document.body.addEventListener("focusout", function (e) {
      const targetElement = e.target;
      if ((targetElement.tagName === 'INPUT' || targetElement.tagName === 'TEXTAREA')) {
         if (targetElement.dataset.placeholder) {
            targetElement.placeholder = targetElement.dataset.placeholder;
         }
         targetElement.classList.remove('_form-focus');
         targetElement.parentElement.classList.remove('_form-focus');

         // Моментальная валидация
         if (targetElement.hasAttribute('data-validate')) {
            forms_formValidate.validateInput(targetElement);
         }
      }
   });
}
// Валидация форм
let forms_formValidate = {
   getErrors(form) {
      let error = 0;
      let formRequiredItems = form.querySelectorAll('*[data-required]');
      if (formRequiredItems.length) {
         formRequiredItems.forEach(formRequiredItem => {
            if ((formRequiredItem.offsetParent !== null || formRequiredItem.tagName === "SELECT") && !formRequiredItem.disabled) {
               error += this.validateInput(formRequiredItem);
            }
         });
      }
      return error;
   },
   validateInput(formRequiredItem) {
      let error = 0;
      if (formRequiredItem.dataset.required === "email") {
         formRequiredItem.value = formRequiredItem.value.replace(" ", "");
         if (this.emailTest(formRequiredItem)) {
            this.addError(formRequiredItem);
            error++;
         } else {
            this.removeError(formRequiredItem);
         }
      } else if (formRequiredItem.type === "checkbox" && !formRequiredItem.checked) {
         this.addError(formRequiredItem);
         error++;
      } else {
         if (!formRequiredItem.value) {
            this.addError(formRequiredItem);
            error++;
         } else {
            this.removeError(formRequiredItem);
         }
      }
      return error;
   },
   addError(formRequiredItem) {
      formRequiredItem.classList.add('_form-error');
      formRequiredItem.parentElement.classList.add('_form-error');
      let inputError = formRequiredItem.parentElement.querySelector('.form__error');
      if (inputError) formRequiredItem.parentElement.removeChild(inputError);
      if (formRequiredItem.dataset.error) {
         formRequiredItem.parentElement.insertAdjacentHTML('beforeend', `<div class="form__error">${formRequiredItem.dataset.error}</div>`);
      }
   },
   removeError(formRequiredItem) {
      formRequiredItem.classList.remove('_form-error');
      formRequiredItem.parentElement.classList.remove('_form-error');
      if (formRequiredItem.parentElement.querySelector('.form__error')) {
         formRequiredItem.parentElement.removeChild(formRequiredItem.parentElement.querySelector('.form__error'));
      }
   },
   formClean(form) {
      form.reset();
      setTimeout(() => {
         let inputs = form.querySelectorAll('input,textarea');
         for (let index = 0; index < inputs.length; index++) {
            const el = inputs[index];
            el.parentElement.classList.remove('_form-focus');
            el.classList.remove('_form-focus');
            forms_formValidate.removeError(el);
            el.value = el.dataset.placeholder;
         }
         let checkboxes = form.querySelectorAll('.checkbox__input');
         if (checkboxes.length > 0) {
            for (let index = 0; index < checkboxes.length; index++) {
               const checkbox = checkboxes[index];
               checkbox.checked = false;
            }
         }
         if (formsModules.selectModule) {
            let selects = form.querySelectorAll('.select');
            if (selects.length) {
               for (let index = 0; index < selects.length; index++) {
                  const select = selects[index].querySelector('select');
                  formsModules.selectModule.selectBuild(select);
               }
            }
         }
      }, 0);
   },
   emailTest(formRequiredItem) {
      return !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,8})+$/.test(formRequiredItem.value);
   }
}

//Получаем инпут file в переменную
const formImage = document.getElementById('formImage');
//Получаем див для превью в переменную
const formPreview = document.getElementById('formPreview');

//Слушаем изменения в инпуте file
formImage.addEventListener('change', () => {
   uploadFile(formImage.files[0]);
});

function uploadFile(file) {
   // провераяем тип файла
   if (!['image/jpeg', 'image/png', 'image/pdf'].includes(file.type)) {
      alert('Разрешены только изображения.');
      formImage.value = '';
      return;
   }
   // проверим размер файла (<2 Мб)
   if (file.size > 20 * 1024 * 1024) {
      alert('Файл должен быть менее 20 МБ.');
      return;
   }

   var reader = new FileReader();
   reader.onload = function (e) {
      formPreview.insertAdjacentHTML('afterbegin', `
         <img src="${e.target.result}" alt="Фото">
      `)
   };

   // reader.onload = function (e) {
   //    formPreview.innerHTML = `<img src="${e.target.result}" alt="Фото">`;
   // };
   reader.onerror = function (e) {
      alert('Ошибка');
   };
   reader.readAsDataURL(file);
}

/* Отправка форм */
function formSubmit(validate) {
   const forms = document.forms;
   if (forms.length) {
      for (const form of forms) {
         form.addEventListener('submit', function (e) {
            const form = e.target;
            formSubmitAction(form, e);
         });
         form.addEventListener('reset', function (e) {
            const form = e.target;
            forms_formValidate.formClean(form);
         });
      }
   }
   async function formSubmitAction(form, e) {
      const error = validate ? forms_formValidate.getErrors(form) : 0;
      if (error === 0) {
         const popup = form.dataset.popup;
         const ajax = form.hasAttribute('data-ajax');
         //SendForm
         if (ajax) {
            e.preventDefault();
            const formAction = form.getAttribute('action') ? form.getAttribute('action').trim() : '#';
            const formMethod = form.getAttribute('method') ? form.getAttribute('method').trim() : 'GET';
            const formData = new FormData(form);

            formData.append('image', formImage.files[0]);

            form.classList.add('_sending');
            const response = await fetch('sendmail.php', {
               method: 'POST',
               body: formData
            });
            if (response.ok) {
               let responseResult = await response.json();
               form.classList.remove('_sending');
               if (popup) {
                  // Нужно подключить зависимость
                  popupItem.open(`#${popup}`);
               }
               // formValidate.formClean(form);
            } else {
               alert("Ошибка");
               form.classList.remove('_sending');
            }
         }
         // Если режим разработки 
         if (form.hasAttribute('data-dev')) {
            e.preventDefault();
            if (popup) {
               // Нужно подключить зависимость
               popupItem.open(`#${popup}`);
            }
            forms_formValidate.formClean(form);
         }
      } else {
         e.preventDefault();
         const formError = form.querySelector('._form-error');
         if (formError && form.hasAttribute('data-goto-error')) {
            gotoblock_gotoBlock(formError, true, 1000);
         }

      }
   }
}

/* Маски для полей (в работе) */
function formMasks(logging) {
   formsModules.inputMaskModule = new InputMask({
      logging: logging
   });
}
/* Модуль работы с select */
function formSelect(logging) {
   formsModules.selectModule = new SelectConstructor({
      logging: logging
   });
}
/* Модуь формы "показать пароль" */
function formViewpass() {
   document.addEventListener("click", function (e) {
      let targetElement = e.target;
      if (targetElement.closest('[class*="__viewpass"]')) {
         let inputType = targetElement.classList.contains('active') ? "password" : "text";
         targetElement.parentElement.querySelector('input').setAttribute("type", inputType);
         targetElement.classList.toggle('active');
      }
   });
}
/* Модуь формы "колличество" */
function formQuantity() {
   document.addEventListener("click", function (e) {
      let targetElement = e.target;
      if (targetElement.closest('.quantity__button')) {
         let value = parseInt(targetElement.closest('.quantity').querySelector('input').value);
         if (targetElement.classList.contains('quantity__button_plus')) {
            value++;
         } else {
            --value;
            if (value < 1) value = 1;
         }
         targetElement.closest('.quantity').querySelector('input').value = value;
      }
   });
}
/* Модуь звездного рейтинга */
function formRating() {
   const ratings = document.querySelectorAll('.rating');
   if (ratings.length > 0) {
      initRatings();
   }
   // Основная функция
   function initRatings() {
      let ratingActive, ratingValue;
      // "Бегаем" по всем рейтингам на странице
      for (let index = 0; index < ratings.length; index++) {
         const rating = ratings[index];
         initRating(rating);
      }
      // Инициализируем конкретный рейтинг
      function initRating(rating) {
         initRatingVars(rating);

         setRatingActiveWidth();

         if (rating.classList.contains('rating_set')) {
            setRating(rating);
         }
      }
      // Инициализайция переменных
      function initRatingVars(rating) {
         ratingActive = rating.querySelector('.rating__active');
         ratingValue = rating.querySelector('.rating__value');
      }
      // Изменяем ширину активных звезд
      function setRatingActiveWidth(index = ratingValue.innerHTML) {
         const ratingActiveWidth = index / 0.05;
         ratingActive.style.width = `${ratingActiveWidth}%`;
      }
      // Возможность указать оценку 
      function setRating(rating) {
         const ratingItems = rating.querySelectorAll('.rating__item');
         for (let index = 0; index < ratingItems.length; index++) {
            const ratingItem = ratingItems[index];
            ratingItem.addEventListener("mouseenter", function (e) {
               // Обновление переменных
               initRatingVars(rating);
               // Обновление активных звезд
               setRatingActiveWidth(ratingItem.value);
            });
            ratingItem.addEventListener("mouseleave", function (e) {
               // Обновление активных звезд
               setRatingActiveWidth();
            });
            ratingItem.addEventListener("click", function (e) {
               // Обновление переменных
               initRatingVars(rating);

               if (rating.dataset.ajax) {
                  // "Отправить" на сервер
                  setRatingValue(ratingItem.value, rating);
               } else {
                  // Отобразить указанную оцнку
                  ratingValue.innerHTML = index + 1;
                  setRatingActiveWidth();
               }
            });
         }
      }
      async function setRatingValue(value, rating) {
         if (!rating.classList.contains('rating_sending')) {
            rating.classList.add('rating_sending');

            // Отправика данных (value) на сервер
            let response = await fetch('rating.json', {
               method: 'GET',

               //body: JSON.stringify({
               //	userRating: value
               //}),
               //headers: {
               //	'content-type': 'application/json'
               //}

            });
            if (response.ok) {
               const result = await response.json();

               // Получаем новый рейтинг
               const newRating = result.newRating;

               // Вывод нового среднего результата
               ratingValue.innerHTML = newRating;

               // Обновление активных звезд
               setRatingActiveWidth();

               rating.classList.remove('rating_sending');
            } else {
               alert("Ошибка");

               rating.classList.remove('rating_sending');
            }
         }
      }
   }
}
;// CONCATENATED MODULE: ./src/js/libs/watcher.js
// Подключение функционала "Чертогов Фрилансера"


// Наблюдатель объектов [всевидещее око]
// data-watch - можно писать значение для применения кастомного кода
// data-watch-root - родитель внутри которого налюдать за объектом
// data-watch-margin - отступ
// data-watch-threshold - процент показа объекта для срабатывания
// data-watch-once - наблюдать только один раз
// _watcher-view - класс который добавляется при появлении объекта

class watcher_ScrollWatcher {
	constructor(props) {
		let defaultConfig = {
			logging: false,
		}
		this.config = Object.assign(defaultConfig, props);
		this.observer;
		!document.documentElement.classList.contains('watcher') ? this.scrollWatcherRun() : null;
	}
	// Обновляем конструктор
	scrollWatcherUpdate() {
		this.scrollWatcherRun();
	}
	// Запускаем конструктор
	scrollWatcherRun() {
		document.documentElement.classList.add('watcher');
		this.scrollWatcherConstructor(document.querySelectorAll('[data-watch]'));
	}
	// Конструктор наблюдателей
	scrollWatcherConstructor(items) {
		if (items.length) {
			this.scrollWatcherLogging(`Проснулся, слежу за объектами (${items.length})...`);
			// Уникализируем параметры
			let uniqParams = uniqArray(Array.from(items).map(function (item) {
				return `${item.dataset.watchRoot ? item.dataset.watchRoot : null}|${item.dataset.watchMargin ? item.dataset.watchMargin : '0px'}|${item.dataset.watchThreshold ? item.dataset.watchThreshold : 0}`;
			}));
			// Получаем группы объектов с одинаковыми параметрами,
			// создаем настройки, инициализируем наблюдатель
			uniqParams.forEach(uniqParam => {
				let uniqParamArray = uniqParam.split('|');
				let paramsWatch = {
					root: uniqParamArray[0],
					margin: uniqParamArray[1],
					threshold: uniqParamArray[2]
				}
				let groupItems = Array.from(items).filter(function (item) {
					let watchRoot = item.dataset.watchRoot ? item.dataset.watchRoot : null;
					let watchMargin = item.dataset.watchMargin ? item.dataset.watchMargin : '0px';
					let watchThreshold = item.dataset.watchThreshold ? item.dataset.watchThreshold : 0;
					if (
						String(watchRoot) === paramsWatch.root &&
						String(watchMargin) === paramsWatch.margin &&
						String(watchThreshold) === paramsWatch.threshold
					) {
						return item;
					}
				});

				let configWatcher = this.getScrollWatcherConfig(paramsWatch);

				// Инициализация наблюдателя со своими настройками
				this.scrollWatcherInit(groupItems, configWatcher);
			});
		} else {
			this.scrollWatcherLogging('Сплю, нет объектов для слежения. ZzzZZzz');
		}
	}
	// Функция создания настроек
	getScrollWatcherConfig(paramsWatch) {
		// Создаем настройки
		let configWatcher = {}
		// Родитель, внутри которого ведется наблюдение
		if (document.querySelector(paramsWatch.root)) {
			configWatcher.root = document.querySelector(paramsWatch.root);
		} else if (paramsWatch.root !== 'null') {
			this.scrollWatcherLogging(`Эмм... родительского объекта ${paramsWatch.root} нет на странице`);
		}
		// Отступ срабатывания
		configWatcher.rootMargin = paramsWatch.margin;
		if (paramsWatch.margin.indexOf('px') < 0 && paramsWatch.margin.indexOf('%') < 0) {
			this.scrollWatcherLogging(`Ой ой, настройку data-watch-margin нужно задавать в PX или %`);
			return
		}
		// Точки срабатывания
		if (paramsWatch.threshold === 'prx') {
			// Режим параллакса
			paramsWatch.threshold = [];
			for (let i = 0; i <= 1.0; i += 0.005) {
				paramsWatch.threshold.push(i);
			}
		} else {
			paramsWatch.threshold = paramsWatch.threshold.split(',');
		}
		configWatcher.threshold = paramsWatch.threshold;

		return configWatcher;
	}
	// Функция создания нового наблюдателя со своими настройками
	scrollWatcherCreate(configWatcher) {
		this.observer = new IntersectionObserver((entries, observer) => {
			entries.forEach(entry => {
				this.scrollWatcherCallback(entry, observer);
			});
		}, configWatcher);
	}
	// Функция инициализации наблюдателя со своими настройками
	scrollWatcherInit(items, configWatcher) {
		// Создание нового наблюдателя со своими настройками
		this.scrollWatcherCreate(configWatcher);
		// Передача наблюдателю элементов
		items.forEach(item => this.observer.observe(item));
	}
	// Функция обработки базовых действий точек срабатываения
	scrollWatcherIntersecting(entry, targetElement) {
		if (entry.isIntersecting) {
			// Видим объект
			// Добавляем класс
			!targetElement.classList.contains('_watcher-view') ? targetElement.classList.add('_watcher-view') : null;
			this.scrollWatcherLogging(`Я вижу ${targetElement.classList}, добавил класс _watcher-view`);
		} else {
			// Не видим объект
			// Убираем класс
			targetElement.classList.contains('_watcher-view') ? targetElement.classList.remove('_watcher-view') : null;
			this.scrollWatcherLogging(`Я не вижу ${targetElement.classList}, убрал класс _watcher-view`);
		}
	}
	// Функция отключения слежения за объектом
	scrollWatcherOff(targetElement, observer) {
		observer.unobserve(targetElement);
		this.scrollWatcherLogging(`Я перестал следить за ${targetElement.classList}`);
	}
	// Функция вывода в консоль
	scrollWatcherLogging(message) {
		this.config.logging ? console.log(`[Наблюдатель]: ${message}`) : null;
	}
	// Функция обработки наблюдения
	scrollWatcherCallback(entry, observer) {
		const targetElement = entry.target;
		// Обработка базовых действий точек срабатываения
		this.scrollWatcherIntersecting(entry, targetElement);
		// Если есть атрибут data-watch-once убираем слежку
		targetElement.hasAttribute('data-watch-once') && entry.isIntersecting ? this.scrollWatcherOff(targetElement, observer) : null;
		// Создаем свое событие отбратной связи
		document.dispatchEvent(new CustomEvent("watcherCallback", {
			detail: {
				entry: entry
			}
		}));

		/*
		// Выбираем нужные объекты
		if (targetElement.dataset.watch === 'some value') {
			// пишем уникальную специфику
		}
		if (entry.isIntersecting) {
			// Видим объект
		} else {
			// Не видим объект
		}
		*/
	}
}

;// CONCATENATED MODULE: ./src/js/files/scroll/scroll.js
// Импорт функционала ====================================================================================================================================================================================================================================================================================================
// Вспомогательные функции.

// Импорт класса наблюдателя.

// Модуль прокрутки к блоку (раскомментировать при использовании).

// Переменная контроля добавления события window scroll.
let addWindowScrollEvent = false;
//====================================================================================================================================================================================================================================================================================================
// Запуск наблюдателя
// Создание дополнительной обработки элемента
// Требует импорта ScrollWatcher
function scrollWatcher(logging = false) {
	new ScrollWatcher({
		logging: logging
	});
}
// Плавная навигация по странице
function pageNavigation() {
	// data-goto - указать ID блока
	// data-goto-header - учитывать header
	// data-goto-speed - скорость (только если используется доп плагин)
	// Работаем при клике на пункт
	document.addEventListener("click", pageNavigationAction);
	// Если подключен scrollWatcher, подсвечиваем текущий пукт меню
	document.addEventListener("watcherCallback", pageNavigationAction);
	// Основная функция
	function pageNavigationAction(e) {
		if (e.type === "click") {
			const targetElement = e.target;
			if (targetElement.closest('[data-goto]')) {
				const gotoLink = targetElement.closest('[data-goto]');
				const noHeader = gotoLink.hasAttribute('data-goto-header') ? true : false;
				const gotoSpeed = gotoLink.dataset.gotoSpeed ? gotoLink.dataset.gotoSpeed : '500';
				gotoBlock(`#${gotoLink.dataset.goto}`, noHeader, gotoSpeed);
				e.preventDefault();
			}
		} else if (e.type === "watcherCallback") {
			if (e.detail) {
				const entry = e.detail.entry;
				const targetElement = entry.target;
				// Обработка пунктов навигации, если указано значение navigator подсвечиваем текущий пукт меню
				if (targetElement.dataset.watch === 'navigator') {
					const navigatorItem = targetElement.id;
					const navigatorActiveItem = document.querySelector(`[data-goto]._navigator-active`);
					const navigatorCurrentItem = document.querySelector(`[data-goto="${navigatorItem}"]`);
					if (entry.isIntersecting) {
						// Видим объект
						// navigatorActiveItem ? navigatorActiveItem.classList.remove('_navigator-active') : null;
						navigatorCurrentItem ? navigatorCurrentItem.classList.add('_navigator-active') : null;
					} else {
						// Не видим объект
						navigatorCurrentItem ? navigatorCurrentItem.classList.remove('_navigator-active') : null;
					}
				}
			}
		}
	}
}
// Работа с шапкой при скроле
function headerScroll() {
	addWindowScrollEvent = true;
	const header = document.querySelector('header.header');
	const headerShow = header.hasAttribute('data-scroll-show'); // Добавить
	const headerShowTimer = header.dataset.scrollShow ? header.dataset.scrollShow : 500;
	const startPoint = header.dataset.scroll ? header.dataset.scroll : 1;
	let scrollDirection = 0;
	let timer;
	document.addEventListener("windowScroll", function (e) {
		const scrollTop = window.scrollY;
		clearTimeout(timer);
		if (scrollTop >= startPoint) {
			!header.classList.contains('_header-scroll') ? header.classList.add('_header-scroll') : null;
			if (headerShow) {
				if (scrollTop > scrollDirection) {
					// downscroll code
					header.classList.contains('_header-show') ? header.classList.remove('_header-show') : null;
				} else {
					// upscroll code
					!header.classList.contains('_header-show') ? header.classList.add('_header-show') : null;
				}
				timer = setTimeout(() => {
					!header.classList.contains('_header-show') ? header.classList.add('_header-show') : null;
				}, headerShowTimer);
			}
		} else {
			header.classList.contains('_header-scroll') ? header.classList.remove('_header-scroll') : null;
			if (headerShow) {
				header.classList.contains('_header-show') ? header.classList.remove('_header-show') : null;
			}
		}
		scrollDirection = scrollTop <= 0 ? 0 : scrollTop;
	});
}
// Прилипающий блок
function stickyBlock() {
	addWindowScrollEvent = true;
	// data-sticky для родителя внутри которого прилипает блок *
	// data-sticky-header для родителя, учитываем высоту хедера
	// data-sticky-top="" для родителя, можно указать отступ сверху
	// data-sticky-bottom="" для родителя, можно указать отступ снизу
	// data-sticky-item для прилипающего блока *
	function stickyBlockInit() {
		const stickyParents = document.querySelectorAll('[data-sticky]');
		if (stickyParents.length) {
			stickyParents.forEach(stickyParent => {
				let stickyConfig = {
					top: stickyParent.dataset.stickyTop ? stickyParent.dataset.stickyTop : 0,
					bottom: stickyParent.dataset.stickyBottom ? stickyParent.dataset.stickyBottom : 0,
					header: stickyParent.hasAttribute('data-sticky-header')
				}
				stickyBlockItem(stickyParent, stickyConfig);
			});
		}
	}
	function stickyBlockItem(stickyParent, stickyConfig) {
		const stickyBlockItem = stickyParent.querySelector('[data-sticky-item]');
		const headerHeight = stickyConfig.header ? document.querySelector('header.header').offsetHeight : 0;
		const offsetTop = headerHeight + stickyConfig.top;
		document.addEventListener("windowScroll", function (e) {
			const startPoint = stickyBlockItem.getBoundingClientRect().top + scrollY - offsetTop;
			const endPoint = (stickyParent.offsetHeight + stickyParent.getBoundingClientRect().top + scrollY) - (offsetTop + stickyBlockItem.offsetHeight + stickyConfig.bottom);
			let stickyItemValues = {
				position: "relative",
				bottom: "auto",
				top: "0px",
				left: "0px",
				width: "auto"
			}
			if (offsetTop + stickyConfig.bottom + stickyBlockItem.offsetHeight < window.innerHeight) {
				if (scrollY >= startPoint && scrollY <= endPoint) {
					stickyItemValues.position = `fixed`;
					stickyItemValues.bottom = `auto`;
					stickyItemValues.top = `${offsetTop}px`;
					stickyItemValues.left = `${stickyBlockItem.getBoundingClientRect().left}px`;
					stickyItemValues.width = `${stickyBlockItem.offsetWidth}px`;
				} else if (scrollY >= endPoint) {
					stickyItemValues.position = `absolute`;
					stickyItemValues.bottom = `${stickyConfig.bottom}px`;
					stickyItemValues.top = `auto`;
					stickyItemValues.left = `0px`;
					stickyItemValues.width = `${stickyBlockItem.offsetWidth}px`;
				}
			}
			stickyBlockType(stickyBlockItem, stickyItemValues);
		});
	}
	function stickyBlockType(stickyBlockItem, stickyItemValues) {
		stickyBlockItem.style.cssText = `position:${stickyItemValues.position};bottom:${stickyItemValues.bottom};top:${stickyItemValues.top};left:${stickyItemValues.left};width:${stickyItemValues.width};`;
	}
	stickyBlockInit();
}
// При подключении модуля обработчик события запустится автоматически
setTimeout(() => {
	if (addWindowScrollEvent) {
		let windowScroll = new Event("windowScroll");
		window.addEventListener("scroll", function (e) {
			document.dispatchEvent(windowScroll);
		});
	}
}, 0);


;// CONCATENATED MODULE: ./src/js/files/script.js
// Импорт функционала ==============================================================================================================================================================================================================================================================================================================================
//mport { isMobile } from "./functions.js";
// import { formsModules } from "./forms/forms.js";
const btnMore = document.querySelector('.form-spoller__more');
const script_images = document.querySelector('.form-spoller__images');

btnMore.addEventListener('click', () => {
   script_images.classList.toggle('_active');
})

const btnMore_first = document.querySelector('.form-spoller__more-first');
const images_first = document.querySelector('.form-spoller__images-first');

btnMore_first.addEventListener('click', () => {
   images_first.classList.toggle('_active');
})
const btnMore_last = document.querySelector('.form-spoller__more-last');
const images_last = document.querySelector('.form-spoller__images-last');

btnMore_last.addEventListener('click', () => {
   images_last.classList.toggle('_active');
})
//========================================================================================================================================================
const inputFirst = document.querySelector('.input-more__first');
inputFirst.addEventListener("focus", function (e) {
   btnMore_first.classList.add('_hidden');
});
inputFirst.addEventListener("blur", function (e) {
   btnMore_first.classList.remove('_hidden');
   if(inputFirst.value !== ''){
      btnMore_first.classList.add('_hidden');
   }else{
      btnMore_first.classList.remove('_hidden');
   }
});
//========================================================================================================================================================
const inputLast = document.querySelector('.input-more__last');
inputLast.addEventListener("focus", function (e) {
   btnMore_last.classList.add('_hidden');
});
inputLast.addEventListener("blur", function (e) {
   btnMore_last.classList.remove('_hidden');
   if(inputLast.value !== ''){
      btnMore_last.classList.add('_hidden');
   }else{
      btnMore_last.classList.remove('_hidden');
   }
});


;// CONCATENATED MODULE: ./src/js/app.js
/*
(i) Код попадает в итоговый файл,
только когда вызвана функция,
например flsFunctions.spollers();
Или когда импортирован весь файл,
например import "files/script.js";
Неиспользуемый (не вызванный)
код в итоговый файл не попадает.

Если мы хотим добавить модуль
следует его расскоментировать
*/

// Подключение основного файла стилей


// Плагины ============================================================================================================================================================================================================================================================================================================

/* Динамический адаптив */
//import "./libs/dynamic_adapt.js";

/* Форматирование чисел */
//import './libs/wNumb.min.js';

// Основные модули ========================================================================================================================================================================================================================================================


/* Проверка поддержки webp, добавление класса webp или no-webp для HTML */
/* (i) необходимо для корректного отображения webp из css  */
isWebp();
/* Добавление класса touch для HTML если браузер мобильный */
// flsFunctions.addTouchClass();
/* Добавление loaded для HTML после полной загрузки страницы */
// flsFunctions.addLoadedClass();
/* Модуль для работы с меню (Бургер) */
// flsFunctions.menuInit();
/* Учет плавающей панели на мобильных устройствах при 100vh */
// flsFunctions.fullVHfix();

/*
Модуль работы со спойлерами
Документация:
Сниппет (HTML): spollers
*/
spollers();

/*
Модуль работы с табами
Документация:
Сниппет (HTML): tabs
*/
// flsFunctions.tabs();

/*
Модуль "показать еще"
Документация по работе в шаблоне:
Сниппет (HTML): showmore
*/
// flsFunctions.showMore();

/*
Попапы
Документация по работе в шаблоне:
Сниппет (HTML): pl
*/
// Для включения ??? (подсказок в консоли) передать true * /
// flsFunctions.initPopups(false);

// Работа с формами ========================================================================================================================================================================================================================================================


/* Работа с полями формы: добавление классов, работа с placeholder. */
formFieldsInit();

/* Oтправка формы со встроенной валидацией полей. false - отключит валидацию */
formSubmit(true);

/* (В работе) Работа с масками. Для включения ??? (подсказок в консоли) передать true */
// flsForms.formMasks(true);

/* Модуль формы "колличество" */
// flsForms.formQuantity();

/* Модуль формы "показать пароль" */
// flsForms.formViewpass();

/* Модуль звездного рейтинга */
// flsForms.formRating();

/* Модуль работы с select. Для включения ??? (подсказок в консоли) передать true */
// flsForms.formSelect(false);

// Модуль работы с ползунком  ===================================================================================================================================================================================================================================================================================
/*
Подключение и настройка выполняется в файле js/files/forms/range.js
Документация по работе в шаблоне:
Документация плагина: https://refreshless.com/nouislider/
Сниппет (HTML): range
*/
// import "./files/forms/range.js";

// Модуль работы с подсказками (tippy) ====================================================================================================================================================================================================================================================================================
/*
Подключение плагина Tippy.js и настройка выполняется в файле js/files/tippy.js
Документация по работе в шаблоне:
Документация плагина: https://atomiks.github.io/tippyjs/
Сниппет (HTML): tip (добавляет атрибут с подсказкой для html тега)
*/
// import "./files/tippy.js";

// Работа со слайдером (Swiper) ========================================================================================================================================================================================================================================================
/*
Настройка подключения плагина слайдера Swiper и новых слайдеров выполняется в файле js/files/sliders.js
Документация по работе в шаблоне:
Документация плагина: https://swiperjs.com/
Сниппет(HTML): swiper
*/
// import "./files/sliders.js";

// Модули работы с прокруткой страницы ========================================================================================================================================================================================================================================================

/*
Изменение дизайна скроллбара
Документация по работе в шаблоне: В HTML добавляем к блоку атрибут data-simplebar
Документация плагина: https://github.com/Grsmto/simplebar/tree/master/packages/simplebar
Сниппет(HTML): 
*/
// import './files/scroll/simplebar.js';

/*
Ленивая (отложенная) загрузка картинок
Документация по работе в шаблоне: В HTML добавляем img, video, audio, iframe но вместо src пишем data-src
Документация плагина: https://github.com/verlok/vanilla-lazyload
Сниппет(HTML):
*/
// import './files/scroll/lazyload.js';

// Функции работы скроллом ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------


// Наблюдатель за объектами c атрибутом data-watch
// Документация по работе в шаблоне: js/libs/watcher.js
// Сниппет(HTML):
// Для включения ??? (подсказок в консоли), указать параметр true
// flsScroll.scrollWatcher(false);

// Плавная навигация по странице
// flsScroll.pageNavigation();

// Функционал добавления классов к хедеру при прокрутке
// flsScroll.headerScroll();

// Функционал липкого блока
// flsScroll.stickyBlock();

// Галерея ========================================================================================================================================================================================================================================================
/*
Документация по работе в шаблоне: https://www.lightgalleryjs.com/docs/
Документация плагина: https://www.lightgalleryjs.com/docs/
Сниппет(HTML):
*/
// import "./files/gallery.js";

// Прочее ========================================================================================================================================================================================================================================================
/* Подключаем файлы со своим кодом */

//============================================================================================================================================================================================================================================
/******/ })()
;