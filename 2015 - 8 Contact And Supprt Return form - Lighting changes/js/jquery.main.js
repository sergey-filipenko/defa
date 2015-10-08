jQuery(function(){
	jcf.customForms.replaceAll();
	initCustomForms();
	initColorBox();
	initSlideShow();
	initOpen();
	clearInputs();
	initMenu();
	initRows();
	initDrops();
	initFirstLast();
	initScrollGallery();
	initAutoScalingNav({
		menuId: "tabset"
	});
	initOpenClose();
	initTabs();
	initFieldJump();
	initSlideText();
	initPagePrint();
	initDatePicker();
	initRadioText();
	formState.init();
	initDisapbledFields();
	initStepsValidation();
	productsForms.init();
	initPrintBlock();
});

// print block init
function initPrintBlock() {
	var clonedClass = 'cloned-item';
	var closedPerPage = 9;
	var openedPerPage = 2;
	jQuery('.print-page').each(function() {
		var printHolder = jQuery(this);
		if (printHolder.length) {
			var headingPart = printHolder.find('.main-section-holder');
			var bottomBlock = printHolder.find('.bottom-print').eq(0);
			var bottomBlockAlt = printHolder.find('.bottom-print').eq(1);
			var openCloses = jQuery('form.add-form').eq(0).find('.open-close');
			var topBlock = jQuery('<div class="page-top" />').append(headingPart).append(openCloses.eq(0).clone()).append(openCloses.eq(1).clone());
			var currDate = topBlock.find('.curr-date');
			function setDate() {
				var curDate = new Date();
				var result = prepareNum(curDate.getDate()) + '.' +  prepareNum(curDate.getMonth()+1) + '.' + curDate.getFullYear();
				currDate.text(result);
			}
			setDate();
			var title = openCloses.eq(2).find('>h2').clone();
			var itemsClosedWrap = jQuery('<div class="container-slide" />');
			var itemsClosed = openCloses.eq(2).find('.container-holder').clone().wrapAll(itemsClosedWrap);
			
			var itemsOpenedWrap = jQuery('<div class="container-slide opened-items" />');
			var itemsOpened = itemsClosed.clone().addClass('opened-state');

			printHolder.empty()
			topBlock.appendTo(printHolder);
			title.appendTo(printHolder);
			// closed items
			itemsClosed.appendTo(printHolder);
			wrapItems(itemsClosed, closedPerPage, '<div class="items-wrap"/>', bottomBlock, topBlock);
			// opened items
			topBlock.clone().appendTo(printHolder);
			itemsOpened.appendTo(printHolder);
			wrapItems(itemsOpened, openedPerPage, '<div class="items-wrap opened-wrap"/>', bottomBlockAlt, topBlock);
		}
	});
	
	
	function wrapItems(items, count, wrapElement, deviderPrev, deviderNext) {
		var itemsGroup = jQuery();
		items.each(function(ind) {
			var item = jQuery(this);
			itemsGroup = itemsGroup.add(item);
			if ((ind + 1) % count == 0) {
				wrapItemsGroup(itemsGroup, wrapElement, function() {
					if ((ind + 1) != items.length) {
						deviderNext.clone().insertAfter(itemsGroup.parent());
					}
					deviderPrev.clone().insertAfter(itemsGroup.parent());
					itemsGroup = jQuery();
				});
			}
		});
		wrapItemsGroup(itemsGroup, wrapElement, function() {
			deviderPrev.clone().insertAfter(itemsGroup.parent());
			itemsGroup = jQuery();
		});
	}
	function wrapItemsGroup(itemsGroup, wrap, complete) {
		if (itemsGroup.length) {
			itemsGroup.wrapAll(wrap);
			if (typeof complete == 'function') {
				complete();
			}
		}
	}
	function prepareNum(num) {
		if (num < 10) {
			num = '0' + num;
		}
		return ''+num;
	}
}

var productsForms = {
	options: {
		disabledClass: 'disabled-product',
		createLink: '.add-product',
		successClass: 'success'
	},
	init: function() {
		this.holder = jQuery('#products-holder');
		if (this.holder.length) {
			this.holderParent = this.holder.closest('.open-close.validate-field');
			this.allBlocks = jQuery();
			this.generateNewBlock(true);
			this.newBlock.removeClass(this.options.disabledClass);
			if (this.newBlock.data('OpenClose')) {
				this.newBlock.data('OpenClose').showSlide();
			}
			this.generateNewBlock();
		}
	},
	generateNewBlock: function(initial) {
		this.newBlock = jQuery(tmpl('new_product', {index:this.getNewIndex()}));
		this.newBlock.appendTo(this.holder);
		this.allBlocks = this.allBlocks.add(this.newBlock);
		this.initNewBlock();
		this.refreshState();
	},
	initNewBlock: function(initial) {
		var self = this;
		// init validation
		this.newBlock.validation({
			onInit: function(that) {
				this.validateAll();
				self.refreshState();
				formState.checkState();
			},
			onStateChange: function(that) {
				self.refreshState();
				formState.checkState();
			}
		});
		// init diabled fields
		this.newBlock.find('input:checkbox[data-fields]').disapbledFields({
			holderParent: this.newBlock,
			onChange: function(holder) {
				// change event
				if (holder.data('Validation')) {
					holder.data('Validation').validateAll();
				}
			}
		});
		// init openclose
		this.newBlock.openClose({
			activeClass: 'active',
			opener: '.add-more',
			slider: '.container-wrap',
			animSpeed: 400,
			effect: 'slide',
			onInit: function() {
				var that = this;
				var addOpener = that.holder.find(self.options.createLink);
				addOpener.on('click', function(e) {
					e.preventDefault();
					if (self.allowFlag) {
						self.newBlock.removeClass(self.options.disabledClass);
						self.generateNewBlock();
						that.showSlide();
					}
				});
			}
		});
		// datepicker init
		this.newBlock.find('.datepicker').each(function() {
			var input = jQuery(this);
			input.datepicker();
		});
	},
	getNewIndex: function() {
		return this.holder.find('.container-holder').length+1;
	},
	refreshState: function() {
		var self = this;
		var allPrev = self.allBlocks.not(':last');
		if (allPrev.filter('.'+this.options.successClass).length == allPrev.length) {
			this.allowFlag = true;
			this.holderParent.addClass(this.options.successClass);
		} else {
			this.allowFlag = false;
			this.holderParent.removeClass(this.options.successClass);
		}
	}
}

var formState = {
	options: {
		successClass: 'success',
		formSuccessClass: 'form-success',
		validationBlocks: '.open-close.validate-field'
	},
	init: function() {
		this.findElements();
		this.attachEvent();
	},
	findElements: function() {
		this.form = jQuery('form.validation-holder');
		this.validationBlocks = this.form.find(this.options.validationBlocks);
	},
	attachEvent: function() {
		var self = this;
		this.form.on('submit', function(e) {
			if (!self.allowSend) e.preventDefault();
		});
	},
	checkState: function() {
		if (this.validationBlocks.filter('.'+this.options.successClass).length == this.validationBlocks.length) {
			this.allowSend = true;
			this.form.addClass(this.options.formSuccessClass);
		} else {
			this.allowSend = false;
			this.form.removeClass(this.options.formSuccessClass);
		}
	}
}

function initDisapbledFields() {
	jQuery('input:checkbox[data-fields]').disapbledFields({
		onChange: function(holder) {
			if (holder.data('Validation')) {
				holder.data('Validation').validateAll();
			}
		}
	});
}

function initStepsValidation() {
	jQuery('.validation-holder .open-close.single-level').validation({
		onInit: function(self) {
			this.validateAll();
			formState.checkState();
		},
		onStateChange: function(self) {
			formState.checkState();
		}
	});
}

(function(){
  var cache = {};
  this.tmpl = function tmpl(str, data){
    // Figure out if we're getting a template, or if we need to
    // load the template - and be sure to cache the result.
    var fn = !/\W/.test(str) ?
      cache[str] = cache[str] ||
        tmpl(document.getElementById(str).innerHTML) :
     
      // Generate a reusable function that will serve as a template
      // generator (and which will be cached).
      new Function("obj",
        "var p=[],print=function(){p.push.apply(p,arguments);};" +
       
        // Introduce the data as local variables using with(){}
        "with(obj){p.push('" +
       
        // Convert the template into pure JavaScript
        str
          .replace(/[\r\t\n]/g, " ")
          .split("<%").join("\t")
          .replace(/((^|%>)[^\t]*)'/g, "$1\r")
          .replace(/\t=(.*?)%>/g, "',$1,'")
          .split("\t").join("');")
          .split("%>").join("p.push('")
          .split("\r").join("\\'")
      + "');}return p.join('');");
   
    // Provide some basic currying to the user
    return data ? fn( data ) : fn;
  };
})();

// datepicker init
function initDatePicker() {
	jQuery.datepicker.regional['da'];
	jQuery('.datepicker').each(function() {
		var input = jQuery(this);
		input.datepicker();
	});
}

// page print init
function initPagePrint() {
	jQuery('.btn-print').click(function(e) {
		e.preventDefault();
		window.print();
	});
}

// show text on radio change
function initRadioText() {
	var activeClass = 'active';
	var hiddenClass = 'hidden';

	jQuery('.radio-text').each(function() {
		var holder = jQuery(this);
		var text = holder.find('.text-slide').hide().addClass(hiddenClass);
		var radios = holder.find('input:radio');
		var listItems = holder.find('li').removeClass(activeClass);
		var visibleItem = listItems.filter('.visible-item');

		listItems.each(function() {
			var listItem = jQuery(this);;
			var radio = listItem.find('input:radio');
			if (radio.is(':checked')) {
				refreshState();
			}
			radio.click(refreshState);
			function refreshState() {
				listItems.removeClass(activeClass);
				listItem.addClass(activeClass);
				refreshText();
			}
		});

		function refreshText() {
			if (visibleItem.hasClass(activeClass)) {
				text.show().removeClass(hiddenClass);
			} else {
				text.hide().addClass(hiddenClass);
			}
		}
	});
}

function initSlideShow(){
	$('div.news-mask').gallSlide({
		duration: 700,
		autoSlide: 6000
	});
}

function initColorBox(){
	$('a.dcb').colorbox();
	$('a.colorbox-video').colorbox({
		innerWidth:600,
		innerHeight:400
	});
}

function initRows(){
	$('ul.item-list > li:nth-child(even)').addClass('odd');
}

// scrolling init
function initScrollGallery(){
	var imgHold = jQuery('#slideshow').find('#img');
	var g1 = new initGallery(jQuery('#slideshow'),{
		list: '.list-switcher',
		prev: 'a.prev',
		next: 'a.next',
		effect: 'slide',
		disableBtn: true,
		onStart: function(obj){
			
		}
	});
	$('#slideshow .hold .frame').fadeGallery({
		autoRotation:false,
		autoHeight:true,
		switchTime:3000,
		duration:0
	});
}

// init slide text
function initSlideText(){
	jQuery('div.crown-line-area').marquee({
		line: 'ul > li',
		pauseOnHover: false, 
		animSpeed: 10
	});
}

//init field jump
function initFieldJump() {
	jQuery('.row').each(function (){
		var holder = jQuery(this),
			boxes = holder.find('.input-holder');
			
		boxes.each(function(){
			var box = jQuery(this),
				input = box.find('input:text'),
				maxCount = input.attr('maxlength'),
				nextBox = box.next('div');
				
			if(maxCount){
				input.keyup(function(){
					if(input.val().length >= maxCount){
						input.blur();
						if(nextBox.length){
							nextBox.find('input:text').focus();
						}
					}
				});
			}
		});
	});
}

// Tabs
function initTabs(){
	var sets = document.getElementsByTagName("ul");
	for (var i = 0; i < sets.length; i++)
	{
		if (sets[i].className.indexOf("tabset") != -1)
		{
			var tabs = [];
			var links = sets[i].getElementsByTagName("a");
			for (var j = 0; j < links.length; j++)
			{
				if (links[j].className.indexOf("tab") != -1)
				{
					tabs.push(links[j]);
					links[j].tabs = tabs;
					var c = document.getElementById(links[j].href.substr(links[j].href.indexOf("#") + 1));

					if (c) if (links[j].className.indexOf("active") != -1) c.style.display = "block";
					else c.style.display = "none";

					links[j].onclick = function ()
					{
						var c = document.getElementById(this.href.substr(this.href.indexOf("#") + 1));
						if (c)
						{
							for (var i = 0; i < this.tabs.length; i++)
							{
								var tab = document.getElementById(this.tabs[i].href.substr(this.tabs[i].href.indexOf("#") + 1));
								if (tab)
								{
									tab.style.display = "none";
								}
								this.tabs[i].className = this.tabs[i].className.replace("active", "");
							}
							this.className += " active";
							c.style.display = "block";
							return false;
						}
					}
				}
			}
		}
	}
}

// open-close init
function initOpenClose() {
	jQuery('div.static-openclose').openClose({
		activeClass: 'active',
		opener: '.add-more',
		slider: '.container-wrap',
		animSpeed: 400,
		effect: 'slide'
	});
	jQuery('div.open-close').openClose({
		activeClass: 'active',
		opener: '.opener-area, .slide-close',
		slider: '.container-slide',
		animSpeed: 400,
		effect: 'slide',
		onInit: function() {
			var self = this;
			var inputHolder = self.opener.find('.opener-holder');
			var labels = inputHolder.find('.label');
			var radios = jQuery();
			labels.each(function() {
				var label = jQuery(this);
				var radio = label.find('input:radio').data('label', label);
				radios = radios.add(radio);
				label.click(function() {
					radio.prop('checked', true);
					if (label.hasClass('active-item')) {
						self.holder.addClass('validate-field-active');
					} else {
						self.holder.removeClass('validate-field-active');
					}
					radios.each(function() {
						var api = this.jcf;
						if (api) {
							api.refreshState();
						}
					});
				});
			});
			radios.each(function() {
				var radio = jQuery(this);
				if (radio.is(':checked')) {
					if (radio.data('label').hasClass('active-item')) {
						self.holder.addClass('validate-field-active');
					} else {
						self.holder.removeClass('validate-field-active');
					}
				}
			});
		}
	});
	jQuery('.menu li').openClose({
		activeClass: 'active',
		opener: '.opener',
		slider: '.slide',
		animSpeed: 400,
		effect: 'slide'
	});
	
	jQuery('.menu li li').openClose({
		activeClass: 'sub-active',
		opener: '.sub-opener',
		slider: '.sub-slide',
		animSpeed: 400,
		effect: 'slide'
	});
}

/*
 * jQuery <marquee> plugin
 */
;(function($){
	function Marquee(options) {
		this.options = $.extend({
			holder: null,
			handleFlexible: true,
			pauseOnHover: true,
			hoverClass: 'hover',
			direction: 'left',
			cloneClass: 'cloned',
			mask: null,
			line: '>*',
			items: '>*',
			animSpeed: 10, // px per second
			initialDelay: 0
		}, options);
		this.init();
	}
	Marquee.prototype = {
		init: function() {
			if(this.options.holder) {
				this.initStructure();
				this.attachEvents();
			}
		},
		initStructure: function() {
			// find elements
			this.holder = $(this.options.holder);
			this.mask = this.options.mask ? this.holder.find(this.options.mask) : this.holder,
			this.line = this.mask.find(this.options.line),
			this.items = this.line.find(this.options.items)//.css({'float':'left'});
			this.direction = (this.options.direction === 'left') ? -1 : 1;
			this.recalculateDimensions();

			// prepare structure
			this.cloneItems = this.items.clone().addClass(this.options.cloneClass).appendTo(this.line);
			if(this.itemHeight >= this.maskHeight) {
				this.activeLine = true;
				this.offset = (this.direction === -1 ? 0 : this.maxOffset);
			} else {
				this.activeLine = false;
				this.cloneItems.hide();
				this.offset = 0;
			}
			this.line.css({
				height: this.itemHeight * 2,
				marginTop: this.offset
			});
		},
		attachEvents: function() {
			// flexible layout handling
			var self = this;
			if(this.options.handleFlexible) {
				this.resizeHandler = function() {
					self.recalculateDimensions();
					if(self.itemHeight < self.maskHeight) {
						self.activeLine = false;
						self.cloneItems.hide();
						self.stopMoving();
						self.offset = 0;
						self.line.css({marginTop: self.offset});
					} else {
						self.activeLine = true;
						self.cloneItems.show();
						self.startMoving();
					}
				};
				$(window).bind('resize orientationchange', this.resizeHandler);
			}

			// pause on hover
			if(this.options.pauseOnHover) {
				this.hoverHandler = function() {
					self.stopMoving();
					self.holder.addClass(self.options.hoverClass);
				};
				this.leaveHandler = function() {
					self.startMoving();
					self.holder.removeClass(self.options.hoverClass);
				};
				this.holder.bind({ mouseenter: this.hoverHandler, mouseleave: this.leaveHandler });
			}

			// initial delay
			setTimeout(function(){
				self.initialFlag = true;
				self.startMoving();
			}, self.options.initialDelay || 1);
		},
		recalculateDimensions: function() {
			// calculate block dimensions
			var self = this;
			this.maskHeight = this.mask.height();
			this.itemHeight = 1;
			this.items.each(function(){
				self.itemHeight += $(this).outerHeight(true) - 2;
			});
			this.maxOffset = -this.itemHeight;
		},
		startMoving: function() {
			// start animation
			var self = this;
			if(self.activeLine && self.initialFlag) {
				var targetOffset = (self.direction < 0 ? self.maxOffset : 0);

				self.offset = parseInt(self.line.css('marginTop'), 10) || 0;
				self.line.stop().animate({
					marginTop: targetOffset
				}, {
					duration: Math.abs(1000 * (self.offset - targetOffset) / self.options.animSpeed),
					easing: 'linear',
					complete: function() {
						self.offset = (self.direction < 0 ? 0 : self.maxOffset);
						self.line.css({marginTop: self.offset});
						self.startMoving();
					}
				});
			}
		},
		stopMoving: function() {
			// stop animation
			this.line.stop();
		},
		destroy: function() {
			this.stopMoving();
			this.cloneItems.remove();
			this.items.css({'float':''});
			this.line.css({marginTop:'',height:''});
			this.holder.removeClass(this.options.hoverClass);
			$(window).unbind('resize orientationchange', this.resizeHandler);
			this.holder.unbind({ mouseenter: this.hoverHandler, mouseleave: this.leaveHandler });
		}
	};

	// jQuery plugin interface
	$.fn.marquee = function(opt) {
		return this.each(function() {
			jQuery(this).data('Marquee', new Marquee($.extend(opt, {holder: this})));
		});
	};
}(jQuery));

// slideshow plugin
jQuery.fn.fadeGallery = function(_options){
	var _options = jQuery.extend({
		slideElements:'.gallery-holder > ul > li',
		pagerLinks:'.list-switcher li',
		btnNext:'.btn-next',
		btnPrev:'.btn-prev',
		btnPlayPause:'a.btn-pouse',
		btnPlay:'a.play',
		btnPause:'a.pause',
		pausedClass:'paused',
		disabledClass: 'disabled',
		playClass:'playing',
		activeClass:'active',
		loadingClass:'ajax-loading',
		loadedClass:'slide-loaded',
		dynamicImageLoad:false,
		dynamicImageLoadAttr:'alt',
		currentNum:false,
		allNum:false,
		startSlide:0,
		noCircle:false,
		pauseOnHover:false,
		autoRotation:false,
		autoHeight:false,
		onBeforeFade:false,
		onAfterFade:false,
		onChange:false,
		disableWhileAnimating:false,
		switchTime:3000,
		duration:650,
		showBtnsOnHover:false,
		event:'click'
	},_options);

	return this.each(function(){
		// gallery options
		if(this.slideshowInit) return; else this.slideshowInit;
		var _this = jQuery(this);
		var _slides = jQuery(_options.slideElements, _this);
		var _pagerLinks = jQuery(_options.pagerLinks, _this);
		var _btnPrev = jQuery(_options.btnPrev, _this);
		var _btnNext = jQuery(_options.btnNext, _this);
		var _btnPlayPause = jQuery(_options.btnPlayPause, _this);
		var _btnPause = jQuery(_options.btnPause, _this);
		var _btnPlay = jQuery(_options.btnPlay, _this);
		var _pauseOnHover = _options.pauseOnHover;
		var _dynamicImageLoad = _options.dynamicImageLoad;
		var _dynamicImageLoadAttr = _options.dynamicImageLoadAttr;
		var _autoRotation = _options.autoRotation;
		var _activeClass = _options.activeClass;
		var _loadingClass = _options.loadingClass;
		var _loadedClass = _options.loadedClass;
		var _disabledClass = _options.disabledClass;
		var _pausedClass = _options.pausedClass;
		var _playClass = _options.playClass;
		var _autoHeight = _options.autoHeight;
		var _duration = _options.duration;
		var _switchTime = _options.switchTime;
		var _controlEvent = _options.event;
		var _currentNum = (_options.currentNum ? jQuery(_options.currentNum, _this) : false);
		var _allNum = (_options.allNum ? jQuery(_options.allNum, _this) : false);
		var _startSlide = _options.startSlide;
		var _noCycle = _options.noCircle;
		var _onChange = _options.onChange;
		var _onBeforeFade = _options.onBeforeFade;
		var _onAfterFade = _options.onAfterFade;
		var _disableWhileAnimating = _options.disableWhileAnimating;

		// gallery init
		var _anim = false;
		var _hover = false;
		var _prevIndex = 0;
		var _currentIndex = 0;
		var _slideCount = _slides.length;
		var _timer;
		if(_slideCount < 2) return;
		if(_options.showBtnsOnHover){
			_btnPrev.css({opacity:0}).hide();
			_btnNext.css({opacity:0}).hide();
			_this.find('.gallery-fade-frame').mouseenter(function(){
				_btnPrev.show().stop().animate({opacity:1},{duration:400});
				_btnNext.show().stop().animate({opacity:1},{duration:400});
			}).mouseleave(function(){
				_btnPrev.stop().animate({opacity:0},{duration:400,complete:function(){
					$(this).hide();
				}});
				_btnNext.stop().animate({opacity:0},{duration:400,complete:function(){
					$(this).hide();
				}});
			});
		}
		_prevIndex = _slides.index(_slides.filter('.'+_activeClass));
		if(_prevIndex < 0) _prevIndex = _currentIndex = 0;
		else _currentIndex = _prevIndex;
		if(_startSlide != null) {
			if(_startSlide == 'random') _prevIndex = _currentIndex = Math.floor(Math.random()*_slideCount);
			else _prevIndex = _currentIndex = parseInt(_startSlide);
		}
		_slides.hide().eq(_currentIndex).show();
		if(_autoRotation) _this.removeClass(_pausedClass).addClass(_playClass);
		else _this.removeClass(_playClass).addClass(_pausedClass);

		// gallery control
		if(_btnPrev.length) {
			_btnPrev.bind(_controlEvent,function(){
				prevSlide();
				return false;
			});
		}
		if(_btnNext.length) {
			_btnNext.bind(_controlEvent,function(){
				nextSlide();
				return false;
			});
		}
		if(_pagerLinks.length) {
			_pagerLinks.each(function(_ind){
				jQuery(this).bind(_controlEvent,function(){
					if(_currentIndex != _ind) {
						if(_disableWhileAnimating && _anim) return;
						_prevIndex = _currentIndex;
						_currentIndex = _ind;
						switchSlide();
					}
					return false;
				});
			});
		}

		// play pause section
		if(_btnPlayPause.length) {
			_btnPlayPause.bind(_controlEvent,function(){
				if(_this.hasClass(_pausedClass)) {
					_this.removeClass(_pausedClass).addClass(_playClass);
					_autoRotation = true;
					autoSlide();
				} else {
					_autoRotation = false;
					if(_timer) clearTimeout(_timer);
					_this.removeClass(_playClass).addClass(_pausedClass);
				}
				return false;
			});
		}
		if(_btnPlay.length) {
			_btnPlay.bind(_controlEvent,function(){
				_this.removeClass(_pausedClass).addClass(_playClass);
				_autoRotation = true;
				autoSlide();
				return false;
			});
		}
		if(_btnPause.length) {
			_btnPause.bind(_controlEvent,function(){
				_autoRotation = false;
				if(_timer) clearTimeout(_timer);
				_this.removeClass(_playClass).addClass(_pausedClass);
				return false;
			});
		}

		// dynamic image loading (swap from ATTRIBUTE)
		function loadSlide(slide) {
			if(!slide.hasClass(_loadingClass) && !slide.hasClass(_loadedClass)) {
				var images = slide.find(_dynamicImageLoad) // pass selector here
				var imagesCount = images.length;
				if(imagesCount) {
					slide.addClass(_loadingClass);
					images.each(function(){
						var img = this;
						img.onload = function(){
							img.loaded = true;
							img.onload = null;
							setTimeout(reCalc,_duration);
						}
						img.setAttribute('src', img.getAttribute(_dynamicImageLoadAttr));
						img.setAttribute(_dynamicImageLoadAttr,'');
					}).css({opacity:0});

					function reCalc() {
						var cnt = 0;
						images.each(function(){
							if(this.loaded) cnt++;
						});
						if(cnt == imagesCount) {
							slide.removeClass(_loadingClass);
							images.animate({opacity:1},{duration:_duration,complete:function(){
								if(jQuery.browser.msie && jQuery.browser.version < 9) jQuery(this).css({opacity:'auto'})
							}});
							slide.addClass(_loadedClass)
						}
					}
				}
			}
		}

		// gallery animation
		function prevSlide() {
			if(_disableWhileAnimating && _anim) return;
			_prevIndex = _currentIndex;
			if(_currentIndex > 0) _currentIndex--;
			else {
				if(_noCycle) return;
				else _currentIndex = _slideCount-1;
			}
			switchSlide();
		}
		function nextSlide() {
			if(_disableWhileAnimating && _anim) return;
			_prevIndex = _currentIndex;
			if(_currentIndex < _slideCount-1) _currentIndex++;
			else {
				if(_noCycle) return;
				else _currentIndex = 0;
			}
			switchSlide();
		}
		function refreshStatus() {
			if(_dynamicImageLoad) loadSlide(_slides.eq(_currentIndex));
			if(_pagerLinks.length) _pagerLinks.removeClass(_activeClass).eq(_currentIndex).addClass(_activeClass);
			if(_currentNum) _currentNum.text(_currentIndex+1);
			if(_allNum) _allNum.text(_slideCount);
			_slides.eq(_prevIndex).removeClass(_activeClass);
			_slides.eq(_currentIndex).addClass(_activeClass);
			if(_noCycle) {
				if(_btnPrev.length) {
					if(_currentIndex == 0) _btnPrev.addClass(_disabledClass);
					else _btnPrev.removeClass(_disabledClass);
				}
				if(_btnNext.length) {
					if(_currentIndex == _slideCount-1) _btnNext.addClass(_disabledClass);
					else _btnNext.removeClass(_disabledClass);
				}
			}
			if(typeof _onChange === 'function') {
				_onChange(_this, _slides, _prevIndex, _currentIndex);
			}
		}
		function switchSlide() {
			_anim = true;
			if(typeof _onBeforeFade === 'function') _onBeforeFade(_this, _slides, _prevIndex, _currentIndex);
			_slides.eq(_prevIndex).stop().animate({opacity:0},{
				duration:_duration,
				complete:function(){
					_anim = false;
					_slides.eq(_prevIndex).hide();
				}
			});
			_slides.eq(_currentIndex).css({display:'block',opacity:0}).stop().animate({opacity:1},{
				duration:_duration,
				complete:function(){
					if(typeof _onAfterFade === 'function') _onAfterFade(_this, _slides, _prevIndex, _currentIndex);
				}
			});
			if(_autoHeight) _slides.eq(_currentIndex).parent().animate({height:_slides.eq(_currentIndex).outerHeight(true)},{duration:_duration,queue:false});
			refreshStatus();
			autoSlide();
		}

		// autoslide function
		function autoSlide() {
			if(!_autoRotation || _hover) return;
			if(_timer) clearTimeout(_timer);
			_timer = setTimeout(nextSlide,_switchTime+_duration);
		}
		if(_pauseOnHover) {
			_pagerLinks.hover(function(){
				_hover = true;
				if(_timer) clearTimeout(_timer);
			},function(){
				_hover = false;
				autoSlide();
			});
			_this.hover(function(){
				_hover = true;
				if(_timer) clearTimeout(_timer);
			},function(){
				_hover = false;
				autoSlide();
			});
		}
		refreshStatus();
		autoSlide();
	});
}

// main gallery module
function initGallery(context, options){this.init(context, options)}
(function( $ ){
	initGallery.prototype = {
		autoRotation: false,
		disableBtn: false,
		list: 'ul.g1',
		switcher: false,
		prev: false,
		next: false,
		effect: false,
		event:'click',
		onStart: function(){},
		beforeChange: function(){},
		onChange: function(){},
		switcherClick: function(){},
		callback: function(){},
		
		init: function(context, options){
			for ( var i in options ) this[i] = options[i]; 
			this.holder = $(context);
			if(this.holder == undefined) return;
			
			this.list = this.holder.find(this.list);
			this.animation = true, this.active = 0;
			this.prevActive = this.active, this.wait;
			this.count = this.list.children().length,
			this.w = this.list.children().eq(0).outerWidth(true);
			this.holdW = this.list.parent().width();
			this.visEl = Math.ceil(this.holdW/this.w);
			
			if(this.count <= this.visEl) this.animation = false;
			
			if(this.effect == 'fade' && !jQuery.browser.msie) this.list.children().css('opacity', 0).eq(this.active).css('opacity', 1).addClass('active');
			else if(this.effect == 'fade' && jQuery.browser.msie) this.list.children().hide().eq(this.active).show().addClass('active');
			else if(this.effect == 'slide') this.list.css('marginLeft', -this.w*this.active);
			else if(this.effect == 'slideY') {
				this.h = this.list.children().eq(0).outerHeight(true);
				this.list.css('marginTop', -this.h*this.active);
			}

			this.initControls(this);
			
			this.toggleState.listItem(this);
			if(this.switcher) this.toggleState.switchItem(this);
			
			this.onStart(this, this.list, this.active);
			
			if(this.autoRotation && this.animation) this.runTimer(this);
		},
		initControls: function(_this){
			if(_this.prev && _this.next){
				_this.prev = _this.holder.find(_this.prev).attr('rel', 'prev').click(function(e){
					_this.beforeChange(_this, e);
					_this.refreshState(e);
					return false;
				});
				_this.next = _this.holder.find(_this.next).attr('rel', 'next').click(function(e){
					_this.beforeChange(_this, e);
					_this.refreshState(e);
					return false;
				});
			}
			if(_this.switcher){
				_this.switcher = _this.holder.find(_this.switcher);
				_this.toggleState.switchItem(_this);
				_this.switcher.bind(_this.event, function(){
					var ind = _this.switcher.index($(this));
					_this.switcherClick(_this);
					_this.refreshState(ind);
					return false;
				});
			}
			if(this.disableBtn) this.disabledConrtol();
		},
		toggleState:{
			listItem: function(_this){
				// _this.list.children().eq(_this.prevActive).removeClass('active');
				// _this.list.children().eq(_this.active).addClass('active');
			},
			switchItem: function(_this){
				_this.switcher.eq(_this.prevActive).removeClass('active');
				_this.switcher.eq(_this.active).addClass('active');
			}
		},
		disabledConrtol: function(){
			if(this.active == 0) {
				this.prev.addClass('disabled');
				this.next.removeClass('disabled');
			}
			else if(this.active == this.count-1 || (this.visEl > 2 && this.active + this.visEl == this.count)) {
				this.prev.removeClass('disabled');
				this.next.addClass('disabled');
				this.autoRotation = false;
			}
			else {
				this.prev.removeClass('disabled');
				this.next.removeClass('disabled');
			}
		},
		runTimer: function(_this){
			_this.beforeChange(_this);
			this.wait = setTimeout(function(){_this.refreshState('next')}, this.autoRotation)
		},
		stop: function(){
			if(this.wait) clearTimeout(this.wait)
		},
		play: function(){
			if(this.wait) clearTimeout(this.wait);
			if(this.autoRotation) this.runTimer(this);
		},
		changeSlide:{
			fade:function(_this){
				if(jQuery.browser.msie && jQuery.browser.version < 8){
					_this.list.children().eq(_this.prevActive).hide();
					_this.list.children().eq(_this.active).show();
					_this.play();
					_this.onChange(_this, _this.list, _this.active);
				}
				else {
					_this.list.children().eq(_this.prevActive).animate({opacity:0}, {queue:false, duration:700});
					_this.list.children().eq(_this.active).animate({opacity:1}, {queue:false, duration:700, complete:function(){
						_this.play();
						_this.onChange(_this, _this.list, _this.active);
					}});
				}
			},
			slide:function(_this){
				if(_this.active + _this.visEl <= _this.count) {
					_this.list.animate({marginLeft:-_this.w*_this.active}, {queue:false, duration:500, complete:function(){
						_this.play();
						_this.onChange(_this, _this.list, _this.active);
					}});
				}
				_this.callback(_this);
			},
			slideY:function(_this){
				_this.list.animate({marginTop:-_this.h*_this.active}, {queue:false, duration:500, complete:function(){
					_this.play();
					_this.onChange(_this, _this.list, _this.active);
				}});
			}
		},
		refreshState: function(e){
			if(this.animation){
				this.prevActive = this.active;
				if(typeof e == 'string' && e == 'next') this.active++;
				else if(typeof e == 'number') this.active=e;
				else{
					if(e.currentTarget.rel == 'next') this.active++;
					else if(e.currentTarget.rel == 'prev') this.active--;
				}
				if(this.wait) clearTimeout(this.wait);
				if(this.active == this.count) this.active = 0;
				else if(this.active == -1) this.active=this.count - 1;
				
				// this.toggleState.listItem(this);
				if(this.switcher) this.toggleState.switchItem(this);
				
				if(this.disableBtn) this.disabledConrtol();
				
				if(this.effect == 'fade') this.changeSlide.fade(this);
				else if(this.effect == 'slide') this.changeSlide.slide(this);
				else if(this.effect == 'slideY') this.changeSlide.slideY(this);
			}
		}	
	}
})( jQuery );


//gallery
jQuery.fn.gallSlide = function(_options){
	// defaults options	
	var _options = jQuery.extend({
		duration: 700,
		autoSlide: 5000
	},_options);

	return this.each(function(){
		var _hold = $(this);
		var _speed = _options.duration;
		var _timer = _options.autoSlide;
		var _wrap = _hold.find('ul');
		var _el = _hold.find('ul > li');
		var _count = _el.index(_el.filter(':last'));
		var _h = _el.outerHeight();
		var _wrapHolderW = 1;
		var _t;
		var _active = 0;
		
		var temp = _el.clone();
		_wrap.append(temp);
		
		function scrollEl(){
			_wrap.eq(0).animate({
				marginTop: -(_h * _active) + "px"
			}, _speed, function(){
				if (_count+1 == _active) {
					_active = 0;
					_wrap.eq(0).css({marginTop: -(_h * _active) + "px"});
				}
			});
		}
		function runTimer(){
			_t = setInterval(function(){
				_active++;
				scrollEl();
			}, _timer);
		}
		runTimer();
	});
}

/*
 * jQuery Disabled Fields plugin
 */
;(function($){
	$.fn.disapbledFields = function(opt){
		// default options
		var options = $.extend({
			holderParent: '.inputs-group',
			inactiveClass: 'inactive',
			attrName: 'data-fields'
		},opt);

		return this.each(function(){
			// options
			var checkbox = jQuery(this);
			var holder = checkbox.closest(options.holderParent);
			var inputs = holder.find('input.'+checkbox.attr(options.attrName));
			var parents = inputs.parent();

			refreshState();
			checkbox.on('change', refreshState);
			function refreshState() {
				if (checkbox.is(':checked')) {
					parents.removeClass(options.inactiveClass);
					inputs.removeAttr('disabled');
				} else {
					parents.addClass(options.inactiveClass);
					inputs.attr('disabled', 'disabled');
				}
				if($.isFunction(options.onChange)) {
					options.onChange(holder);
				}
			}
		});
	};
}(jQuery));

/*
 * jQuery Validation plugin
 */
;(function($) {
	function Validation(options) {
		this.options = $.extend({
			successClass: 'success',
			errorClass: 'error',
			classHolder: '.input-holder',
			delay: 200
		}, options);
		this.init();
	}
	Validation.prototype = {
		init: function() {
			if(this.options.holder) {
				this.findElements();
				this.attachEvents();
				this.makeCallback('onInit', this);
			}
		},
		findElements: function() {
			this.holder = $(this.options.holder);
			this.requiredInputs = this.holder.find('input.required, textarea.required, input.required-email, input.required-number, input.number-length');
			this.allParents = this.requiredInputs.closest(this.options.classHolder);
			this.regEmail = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
			this.regPhone = /^[0-9]+$/;
			this.state = false;
		},
		attachEvents: function() {
			// add handler
			var self = this;
			this.requiredInputs.each(function() {
				var input = jQuery(this);
				var parent = input.closest(self.options.classHolder);
				var stateTimer;

				if (input.hasClass('number-length')) {
					input.data('length', +input.attr('title') || 10);
					input.removeAttr('title');
				}
				input.on('keyup blur', function() {
					clearTimeout(stateTimer);
					stateTimer = setTimeout(function() {
						self.validateFields(parent, input);
					}, 200);
				});
			});
		},
		validateAll: function() {
			var self = this;
			this.requiredInputs.each(function() {
				var input = jQuery(this);
				var parent = input.closest(self.options.classHolder);
				self.validateFields(parent, input);
			});
		},
		checkBlockState: function() {
			var self = this;
			var prevState = this.state;
			var currInputs = this.requiredInputs.not('[disabled]');
			var currParents = currInputs.closest(this.options.classHolder);
			if (currParents.filter('.' + this.options.successClass).length == currParents.length) {
				this.holder.addClass(this.options.successClass);
				this.state = true;
			} else {
				this.holder.removeClass(this.options.successClass);
				this.state = false;
			}
			if (prevState != this.state) {
				this.makeCallback('onStateChange', this);
			}
		},
		validateFields: function(parent, input) {
			if(input.hasClass('required')) {
				this.setState(parent, input, !input.val().length || input.val() === input.prop('defaultValue'));
			}
			if(input.hasClass('required-email')) {
				this.setState(parent, input, !this.regEmail.test(input.val()));
			}
			if(input.hasClass('required-number')) {
				this.setState(parent, input, !this.regPhone.test(input.val()));
			}
			if(input.hasClass('number-length')) {
				this.setState(parent, input, !this.regPhone.test(input.val()) || (input.data('length') != input.val().length));
			}
		},
		setState: function(hold, field, error) {
			hold.removeClass(this.options.successClass).removeClass(this.options.errorClass);
			if(error) {
				hold.addClass(this.options.errorClass);
			} else {
				hold.addClass(this.options.successClass);
			}
			this.checkBlockState();
		},
		destroy: function() {
			
		},
		makeCallback: function(name) {
			if(typeof this.options[name] === 'function') {
				var args = Array.prototype.slice.call(arguments);
				args.shift();
				this.options[name].apply(this, args);
			}
		}
	};

	// jQuery plugin interface
	$.fn.validation = function(opt) {
		return this.each(function() {
			jQuery(this).data('Validation', new Validation($.extend(opt, {holder: this})));
		});
	};
}(jQuery));

/*
 * JavaScript Custom Forms Module
 */
jcf = {
	// global options
	modules: {},
	plugins: {},
	baseOptions: {
		unselectableClass:'jcf-unselectable',
		labelActiveClass:'jcf-label-active',
		labelDisabledClass:'jcf-label-disabled',
		classPrefix: 'jcf-class-',
		hiddenClass:'jcf-hidden',
		focusClass:'jcf-focus',
		wrapperTag: 'div'
	},
	// replacer function
	customForms: {
		setOptions: function(obj) {
			for(var p in obj) {
				if(obj.hasOwnProperty(p) && typeof obj[p] === 'object') {
					jcf.lib.extend(jcf.modules[p].prototype.defaultOptions, obj[p]);
				}
			}
		},
		replaceAll: function(context) {
			for(var k in jcf.modules) {
				var els = jcf.lib.queryBySelector(jcf.modules[k].prototype.selector, context);
				for(var i = 0; i<els.length; i++) {
					if(els[i].jcf) {
						// refresh form element state
						els[i].jcf.refreshState();
					} else {
						// replace form element
						if(!jcf.lib.hasClass(els[i], 'default') && jcf.modules[k].prototype.checkElement(els[i])) {
							new jcf.modules[k]({
								replaces:els[i]
							});
						}
					}
				}
			}
		},
		refreshAll: function(context) {
			for(var k in jcf.modules) {
				var els = jcf.lib.queryBySelector(jcf.modules[k].prototype.selector, context);
				for(var i = 0; i<els.length; i++) {
					if(els[i].jcf) {
						// refresh form element state
						els[i].jcf.refreshState();
					}
				}
			}
		},
		refreshElement: function(obj) {
			if(obj && obj.jcf) {
				obj.jcf.refreshState();
			}
		},
		destroyAll: function() {
			for(var k in jcf.modules) {
				var els = jcf.lib.queryBySelector(jcf.modules[k].prototype.selector);
				for(var i = 0; i<els.length; i++) {
					if(els[i].jcf) {
						els[i].jcf.destroy();
					}
				}
			}
		}
	},
	// detect device type
	isTouchDevice: ('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch,
	isWinPhoneDevice: navigator.msPointerEnabled && /MSIE 10.*Touch/.test(navigator.userAgent),
	// define base module
	setBaseModule: function(obj) {
		jcf.customControl = function(opt){
			this.options = jcf.lib.extend({}, jcf.baseOptions, this.defaultOptions, opt);
			this.init();
		};
		for(var p in obj) {
			jcf.customControl.prototype[p] = obj[p];
		}
	},
	// add module to jcf.modules
	addModule: function(obj) {
		if(obj.name){
			// create new module proto class
			jcf.modules[obj.name] = function(){
				jcf.modules[obj.name].superclass.constructor.apply(this, arguments);
			}
			jcf.lib.inherit(jcf.modules[obj.name], jcf.customControl);
			for(var p in obj) {
				jcf.modules[obj.name].prototype[p] = obj[p]
			}
			// on create module
			jcf.modules[obj.name].prototype.onCreateModule();
			// make callback for exciting modules
			for(var mod in jcf.modules) {
				if(jcf.modules[mod] != jcf.modules[obj.name]) {
					jcf.modules[mod].prototype.onModuleAdded(jcf.modules[obj.name]);
				}
			}
		}
	},
	// add plugin to jcf.plugins
	addPlugin: function(obj) {
		if(obj && obj.name) {
			jcf.plugins[obj.name] = function() {
				this.init.apply(this, arguments);
			}
			for(var p in obj) {
				jcf.plugins[obj.name].prototype[p] = obj[p];
			}
		}
	},
	// miscellaneous init
	init: function(){
		if(navigator.pointerEnabled || navigator.msPointerEnabled) {
			// use pointer events instead of mouse events
			this.eventPress = navigator.pointerEnabled ? 'pointerdown' : 'MSPointerDown';
			this.eventMove = navigator.pointerEnabled ? 'pointermove' : 'MSPointerMove';
			this.eventRelease = navigator.pointerEnabled ? 'pointerup' : 'MSPointerUp';
		} else {
			// handle default desktop mouse events
			this.eventPress = 'mousedown';
			this.eventMove = 'mousemove';
			this.eventRelease = 'mouseup';
		}
		if(this.isTouchDevice) {
			// handle touch events also
			this.eventPress += ' touchstart';
			this.eventMove += ' touchmove';
			this.eventRelease += ' touchend';
		}

		setTimeout(function(){
			jcf.lib.domReady(function(){
				jcf.initStyles();
			});
		},1);
		return this;
	},
	initStyles: function() {
		// create <style> element and rules
		var head = document.getElementsByTagName('head')[0],
			style = document.createElement('style'),
			rules = document.createTextNode('.'+jcf.baseOptions.unselectableClass+'{'+
				'-moz-user-select:none;'+
				'-webkit-tap-highlight-color:rgba(255,255,255,0);'+
				'-webkit-user-select:none;'+
				'user-select:none;'+
			'}');

		// append style element
		style.type = 'text/css';
		if(style.styleSheet) {
			style.styleSheet.cssText = rules.nodeValue;
		} else {
			style.appendChild(rules);
		}
		head.appendChild(style);
	}
}.init();

/*
 * Custom Form Control prototype
 */
jcf.setBaseModule({
	init: function(){
		if(this.options.replaces) {
			this.realElement = this.options.replaces;
			this.realElement.jcf = this;
			this.replaceObject();
		}
	},
	defaultOptions: {
		// default module options (will be merged with base options)
	},
	checkElement: function(el){
		return true; // additional check for correct form element
	},
	replaceObject: function(){
		this.createWrapper();
		this.attachEvents();
		this.fixStyles();
		this.setupWrapper();
	},
	createWrapper: function(){
		this.fakeElement = jcf.lib.createElement(this.options.wrapperTag);
		this.labelFor = jcf.lib.getLabelFor(this.realElement);
		jcf.lib.disableTextSelection(this.fakeElement);
		jcf.lib.addClass(this.fakeElement, jcf.lib.getAllClasses(this.realElement.className, this.options.classPrefix));
		jcf.lib.addClass(this.realElement, jcf.baseOptions.hiddenClass);
	},
	attachEvents: function(){
		jcf.lib.event.add(this.realElement, 'focus', this.onFocusHandler, this);
		jcf.lib.event.add(this.realElement, 'blur', this.onBlurHandler, this);
		jcf.lib.event.add(this.fakeElement, 'click', this.onFakeClick, this);
		jcf.lib.event.add(this.fakeElement, jcf.eventPress, this.onFakePressed, this);
		jcf.lib.event.add(this.fakeElement, jcf.eventRelease, this.onFakeReleased, this);

		if(this.labelFor) {
			this.labelFor.jcf = this;
			jcf.lib.event.add(this.labelFor, 'click', this.onFakeClick, this);
			jcf.lib.event.add(this.labelFor, jcf.eventPress, this.onFakePressed, this);
			jcf.lib.event.add(this.labelFor, jcf.eventRelease, this.onFakeReleased, this);
		}
	},
	fixStyles: function() {
		// hide mobile webkit tap effect
		if(jcf.isTouchDevice) {
			var tapStyle = 'rgba(255,255,255,0)';
			this.realElement.style.webkitTapHighlightColor = tapStyle;
			this.fakeElement.style.webkitTapHighlightColor = tapStyle;
			if(this.labelFor) {
				this.labelFor.style.webkitTapHighlightColor = tapStyle;
			}
		}
	},
	setupWrapper: function(){
		// implement in subclass
	},
	refreshState: function(){
		// implement in subclass
	},
	destroy: function() {
		if(this.fakeElement && this.fakeElement.parentNode) {
			this.fakeElement.parentNode.insertBefore(this.realElement, this.fakeElement);
			this.fakeElement.parentNode.removeChild(this.fakeElement);
		}
		jcf.lib.removeClass(this.realElement, jcf.baseOptions.hiddenClass);
		this.realElement.jcf = null;
	},
	onFocus: function(){
		// emulated focus event
		jcf.lib.addClass(this.fakeElement,this.options.focusClass);
	},
	onBlur: function(cb){
		// emulated blur event
		jcf.lib.removeClass(this.fakeElement,this.options.focusClass);
	},
	onFocusHandler: function() {
		// handle focus loses
		if(this.focused) return;
		this.focused = true;

		// handle touch devices also
		if(jcf.isTouchDevice) {
			if(jcf.focusedInstance && jcf.focusedInstance.realElement != this.realElement) {
				jcf.focusedInstance.onBlur();
				jcf.focusedInstance.realElement.blur();
			}
			jcf.focusedInstance = this;
		}
		this.onFocus.apply(this, arguments);
	},
	onBlurHandler: function() {
		// handle focus loses
		if(!this.pressedFlag) {
			this.focused = false;
			this.onBlur.apply(this, arguments);
		}
	},
	onFakeClick: function(){
		if(jcf.isTouchDevice) {
			this.onFocus();
		} else if(!this.realElement.disabled) {
			this.realElement.focus();
		}
	},
	onFakePressed: function(e){
		this.pressedFlag = true;
	},
	onFakeReleased: function(){
		this.pressedFlag = false;
	},
	onCreateModule: function(){
		// implement in subclass
	},
	onModuleAdded: function(module) {
		// implement in subclass
	},
	onControlReady: function() {
		// implement in subclass
	}
});

/*
 * JCF Utility Library
 */
jcf.lib = {
	bind: function(func, scope){
		return function() {
			return func.apply(scope, arguments);
		};
	},
	browser: (function() {
		var ua = navigator.userAgent.toLowerCase(), res = {},
		match = /(webkit)[ \/]([\w.]+)/.exec(ua) || /(opera)(?:.*version)?[ \/]([\w.]+)/.exec(ua) ||
				/(msie) ([\w.]+)/.exec(ua) || ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+))?/.exec(ua) || [];
		res[match[1]] = true;
		res.version = match[2] || "0";
		res.safariMac = ua.indexOf('mac') != -1 && ua.indexOf('safari') != -1;
		return res;
	})(),
	getOffset: function (obj) {
		if (obj.getBoundingClientRect && !jcf.isWinPhoneDevice) {
			var scrollLeft = window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft;
			var scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
			var clientLeft = document.documentElement.clientLeft || document.body.clientLeft || 0;
			var clientTop = document.documentElement.clientTop || document.body.clientTop || 0;
			return {
				top:Math.round(obj.getBoundingClientRect().top + scrollTop - clientTop),
				left:Math.round(obj.getBoundingClientRect().left + scrollLeft - clientLeft)
			};
		} else {
			var posLeft = 0, posTop = 0;
			while (obj.offsetParent) {posLeft += obj.offsetLeft; posTop += obj.offsetTop; obj = obj.offsetParent;}
			return {top:posTop,left:posLeft};
		}
	},
	getScrollTop: function() {
		return window.pageYOffset || document.documentElement.scrollTop;
	},
	getScrollLeft: function() {
		return window.pageXOffset || document.documentElement.scrollLeft;
	},
	getWindowWidth: function(){
		return document.compatMode=='CSS1Compat' ? document.documentElement.clientWidth : document.body.clientWidth;
	},
	getWindowHeight: function(){
		return document.compatMode=='CSS1Compat' ? document.documentElement.clientHeight : document.body.clientHeight;
	},
	getStyle: function(el, prop) {
		if (document.defaultView && document.defaultView.getComputedStyle) {
			return document.defaultView.getComputedStyle(el, null)[prop];
		} else if (el.currentStyle) {
			return el.currentStyle[prop];
		} else {
			return el.style[prop];
		}
	},
	getParent: function(obj, selector) {
		while(obj.parentNode && obj.parentNode != document.body) {
			if(obj.parentNode.tagName.toLowerCase() == selector.toLowerCase()) {
				return obj.parentNode;
			}
			obj = obj.parentNode;
		}
		return false;
	},
	isParent: function(parent, child) {
		while(child.parentNode) {
			if(child.parentNode === parent) {
				return true;
			}
			child = child.parentNode;
		}
		return false;
	},
	getLabelFor: function(object) {
		var parentLabel = jcf.lib.getParent(object,'label');
		if(parentLabel) {
			return parentLabel;
		} else if(object.id) {
			return jcf.lib.queryBySelector('label[for="' + object.id + '"]')[0];
		}
	},
	disableTextSelection: function(el){
		if (typeof el.onselectstart !== 'undefined') {
			el.onselectstart = function() {return false;};
		} else if(window.opera) {
			el.setAttribute('unselectable', 'on');
		} else {
			jcf.lib.addClass(el, jcf.baseOptions.unselectableClass);
		}
	},
	enableTextSelection: function(el) {
		if (typeof el.onselectstart !== 'undefined') {
			el.onselectstart = null;
		} else if(window.opera) {
			el.removeAttribute('unselectable');
		} else {
			jcf.lib.removeClass(el, jcf.baseOptions.unselectableClass);
		}
	},
	queryBySelector: function(selector, scope){
		if(typeof scope === 'string') {
			var result = [];
			var holders = this.getElementsBySelector(scope);
			for (var i = 0, contextNodes; i < holders.length; i++) {
				contextNodes = Array.prototype.slice.call(this.getElementsBySelector(selector, holders[i]));
				result = result.concat(contextNodes);
			}
			return result;
		} else {
			return this.getElementsBySelector(selector, scope);
		}
	},
	prevSibling: function(node) {
		while(node = node.previousSibling) if(node.nodeType == 1) break;
		return node;
	},
	nextSibling: function(node) {
		while(node = node.nextSibling) if(node.nodeType == 1) break;
		return node;
	},
	fireEvent: function(element,event) {
		if(element.dispatchEvent){
			var evt = document.createEvent('HTMLEvents');
			evt.initEvent(event, true, true );
			return !element.dispatchEvent(evt);
		}else if(document.createEventObject){
			var evt = document.createEventObject();
			return element.fireEvent('on'+event,evt);
		}
	},
	inherit: function(Child, Parent) {
		var F = function() { }
		F.prototype = Parent.prototype
		Child.prototype = new F()
		Child.prototype.constructor = Child
		Child.superclass = Parent.prototype
	},
	extend: function(obj) {
		for(var i = 1; i < arguments.length; i++) {
			for(var p in arguments[i]) {
				if(arguments[i].hasOwnProperty(p)) {
					obj[p] = arguments[i][p];
				}
			}
		}
		return obj;
	},
	hasClass: function (obj,cname) {
		return (obj.className ? obj.className.match(new RegExp('(\\s|^)'+cname+'(\\s|$)')) : false);
	},
	addClass: function (obj,cname) {
		if (!this.hasClass(obj,cname)) obj.className += (!obj.className.length || obj.className.charAt(obj.className.length - 1) === ' ' ? '' : ' ') + cname;
	},
	removeClass: function (obj,cname) {
		if (this.hasClass(obj,cname)) obj.className=obj.className.replace(new RegExp('(\\s|^)'+cname+'(\\s|$)'),' ').replace(/\s+$/, '');
	},
	toggleClass: function(obj, cname, condition) {
		if(condition) this.addClass(obj, cname); else this.removeClass(obj, cname);
	},
	createElement: function(tagName, options) {
		var el = document.createElement(tagName);
		for(var p in options) {
			if(options.hasOwnProperty(p)) {
				switch (p) {
					case 'class': el.className = options[p]; break;
					case 'html': el.innerHTML = options[p]; break;
					case 'style': this.setStyles(el, options[p]); break;
					default: el.setAttribute(p, options[p]);
				}
			}
		}
		return el;
	},
	setStyles: function(el, styles) {
		for(var p in styles) {
			if(styles.hasOwnProperty(p)) {
				switch (p) {
					case 'float': el.style.cssFloat = styles[p]; break;
					case 'opacity': el.style.filter = 'progid:DXImageTransform.Microsoft.Alpha(opacity='+styles[p]*100+')'; el.style.opacity = styles[p]; break;
					default: el.style[p] = (typeof styles[p] === 'undefined' ? 0 : styles[p]) + (typeof styles[p] === 'number' ? 'px' : '');
				}
			}
		}
		return el;
	},
	getInnerWidth: function(el) {
		return el.offsetWidth - (parseInt(this.getStyle(el,'paddingLeft')) || 0) - (parseInt(this.getStyle(el,'paddingRight')) || 0);
	},
	getInnerHeight: function(el) {
		return el.offsetHeight - (parseInt(this.getStyle(el,'paddingTop')) || 0) - (parseInt(this.getStyle(el,'paddingBottom')) || 0);
	},
	getAllClasses: function(cname, prefix, skip) {
		if(!skip) skip = '';
		if(!prefix) prefix = '';
		return cname ? cname.replace(new RegExp('(\\s|^)'+skip+'(\\s|$)'),' ').replace(/[\s]*([\S]+)+[\s]*/gi,prefix+"$1 ") : '';
	},
	getElementsBySelector: function(selector, scope) {
		if(typeof document.querySelectorAll === 'function') {
			return (scope || document).querySelectorAll(selector);
		}
		var selectors = selector.split(',');
		var resultList = [];
		for(var s = 0; s < selectors.length; s++) {
			var currentContext = [scope || document];
			var tokens = selectors[s].replace(/^\s+/,'').replace(/\s+$/,'').split(' ');
			for (var i = 0; i < tokens.length; i++) {
				token = tokens[i].replace(/^\s+/,'').replace(/\s+$/,'');
				if (token.indexOf('#') > -1) {
					var bits = token.split('#'), tagName = bits[0], id = bits[1];
					var element = document.getElementById(id);
					if (tagName && element.nodeName.toLowerCase() != tagName) {
						return [];
					}
					currentContext = [element];
					continue;
				}
				if (token.indexOf('.') > -1) {
					var bits = token.split('.'), tagName = bits[0] || '*', className = bits[1], found = [], foundCount = 0;
					for (var h = 0; h < currentContext.length; h++) {
						var elements;
						if (tagName == '*') {
							elements = currentContext[h].getElementsByTagName('*');
						} else {
							elements = currentContext[h].getElementsByTagName(tagName);
						}
						for (var j = 0; j < elements.length; j++) {
							found[foundCount++] = elements[j];
						}
					}
					currentContext = [];
					var currentContextIndex = 0;
					for (var k = 0; k < found.length; k++) {
						if (found[k].className && found[k].className.match(new RegExp('(\\s|^)'+className+'(\\s|$)'))) {
							currentContext[currentContextIndex++] = found[k];
						}
					}
					continue;
				}
				if (token.match(/^(\w*)\[(\w+)([=~\|\^\$\*]?)=?"?([^"]*)"?\]$/)) {
					var tagName = RegExp.$1 || '*', attrName = RegExp.$2, attrOperator = RegExp.$3, attrValue = RegExp.$4;
					if(attrName.toLowerCase() == 'for' && this.browser.msie && this.browser.version < 8) {
						attrName = 'htmlFor';
					}
					var found = [], foundCount = 0;
					for (var h = 0; h < currentContext.length; h++) {
						var elements;
						if (tagName == '*') {
							elements = currentContext[h].getElementsByTagName('*');
						} else {
							elements = currentContext[h].getElementsByTagName(tagName);
						}
						for (var j = 0; elements[j]; j++) {
							found[foundCount++] = elements[j];
						}
					}
					currentContext = [];
					var currentContextIndex = 0, checkFunction;
					switch (attrOperator) {
						case '=': checkFunction = function(e) { return (e.getAttribute(attrName) == attrValue) }; break;
						case '~': checkFunction = function(e) { return (e.getAttribute(attrName).match(new RegExp('(\\s|^)'+attrValue+'(\\s|$)'))) }; break;
						case '|': checkFunction = function(e) { return (e.getAttribute(attrName).match(new RegExp('^'+attrValue+'-?'))) }; break;
						case '^': checkFunction = function(e) { return (e.getAttribute(attrName).indexOf(attrValue) == 0) }; break;
						case '$': checkFunction = function(e) { return (e.getAttribute(attrName).lastIndexOf(attrValue) == e.getAttribute(attrName).length - attrValue.length) }; break;
						case '*': checkFunction = function(e) { return (e.getAttribute(attrName).indexOf(attrValue) > -1) }; break;
						default : checkFunction = function(e) { return e.getAttribute(attrName) };
					}
					currentContext = [];
					var currentContextIndex = 0;
					for (var k = 0; k < found.length; k++) {
						if (checkFunction(found[k])) {
							currentContext[currentContextIndex++] = found[k];
						}
					}
					continue;
				}
				tagName = token;
				var found = [], foundCount = 0;
				for (var h = 0; h < currentContext.length; h++) {
					var elements = currentContext[h].getElementsByTagName(tagName);
					for (var j = 0; j < elements.length; j++) {
						found[foundCount++] = elements[j];
					}
				}
				currentContext = found;
			}
			resultList = [].concat(resultList,currentContext);
		}
		return resultList;
	},
	scrollSize: (function(){
		var content, hold, sizeBefore, sizeAfter;
		function buildSizer(){
			if(hold) removeSizer();
			content = document.createElement('div');
			hold = document.createElement('div');
			hold.style.cssText = 'position:absolute;overflow:hidden;width:100px;height:100px';
			hold.appendChild(content);
			document.body.appendChild(hold);
		}
		function removeSizer(){
			document.body.removeChild(hold);
			hold = null;
		}
		function calcSize(vertical) {
			buildSizer();
			content.style.cssText = 'height:'+(vertical ? '100%' : '200px');
			sizeBefore = (vertical ? content.offsetHeight : content.offsetWidth);
			hold.style.overflow = 'scroll'; content.innerHTML = 1;
			sizeAfter = (vertical ? content.offsetHeight : content.offsetWidth);
			if(vertical && hold.clientHeight) sizeAfter = hold.clientHeight;
			removeSizer();
			return sizeBefore - sizeAfter;
		}
		return {
			getWidth:function(){
				return calcSize(false);
			},
			getHeight:function(){
				return calcSize(true)
			}
		}
	}()),
	domReady: function (handler){
		var called = false
		function ready() {
			if (called) return;
			called = true;
			handler();
		}
		if (document.addEventListener) {
			document.addEventListener("DOMContentLoaded", ready, false);
		} else if (document.attachEvent) {
			if (document.documentElement.doScroll && window == window.top) {
				function tryScroll(){
					if (called) return
					if (!document.body) return
					try {
						document.documentElement.doScroll("left")
						ready()
					} catch(e) {
						setTimeout(tryScroll, 0)
					}
				}
				tryScroll()
			}
			document.attachEvent("onreadystatechange", function(){
				if (document.readyState === "complete") {
					ready()
				}
			})
		}
		if (window.addEventListener) window.addEventListener('load', ready, false)
		else if (window.attachEvent) window.attachEvent('onload', ready)
	},
	event: (function(){
		var guid = 0;
		function fixEvent(e) {
			e = e || window.event;
			if (e.isFixed) {
				return e;
			}
			e.isFixed = true; 
			e.preventDefault = e.preventDefault || function(){this.returnValue = false}
			e.stopPropagation = e.stopPropagation || function(){this.cancelBubble = true}
			if (!e.target) {
				e.target = e.srcElement
			}
			if (!e.relatedTarget && e.fromElement) {
				e.relatedTarget = e.fromElement == e.target ? e.toElement : e.fromElement;
			}
			if (e.pageX == null && e.clientX != null) {
				var html = document.documentElement, body = document.body;
				e.pageX = e.clientX + (html && html.scrollLeft || body && body.scrollLeft || 0) - (html.clientLeft || 0);
				e.pageY = e.clientY + (html && html.scrollTop || body && body.scrollTop || 0) - (html.clientTop || 0);
			}
			if (!e.which && e.button) {
				e.which = e.button & 1 ? 1 : (e.button & 2 ? 3 : (e.button & 4 ? 2 : 0));
			}
			if(e.type === "DOMMouseScroll" || e.type === 'mousewheel') {
				e.mWheelDelta = 0;
				if (e.wheelDelta) {
					e.mWheelDelta = e.wheelDelta/120;
				} else if (e.detail) {
					e.mWheelDelta = -e.detail/3;
				}
			}
			return e;
		}
		function commonHandle(event, customScope) {
			event = fixEvent(event);
			var handlers = this.events[event.type];
			for (var g in handlers) {
				var handler = handlers[g];
				var ret = handler.call(customScope || this, event);
				if (ret === false) {
					event.preventDefault()
					event.stopPropagation()
				}
			}
		}
		var publicAPI = {
			add: function(elem, type, handler, forcedScope) {
				// handle multiple events
				if(type.indexOf(' ') > -1) {
					var eventList = type.split(' ');
					for(var i = 0; i < eventList.length; i++) {
						publicAPI.add(elem, eventList[i], handler, forcedScope);
					}
					return;
				}

				if (elem.setInterval && (elem != window && !elem.frameElement)) {
					elem = window;
				}
				if (!handler.guid) {
					handler.guid = ++guid;
				}
				if (!elem.events) {
					elem.events = {};
					elem.handle = function(event) {
						return commonHandle.call(elem, event);
					}
				}
				if (!elem.events[type]) {
					elem.events[type] = {};
					if (elem.addEventListener) elem.addEventListener(type, elem.handle, false);
					else if (elem.attachEvent) elem.attachEvent("on" + type, elem.handle);
					if(type === 'mousewheel') {
						publicAPI.add(elem, 'DOMMouseScroll', handler, forcedScope);
					}
				}
				var fakeHandler = jcf.lib.bind(handler, forcedScope);
				fakeHandler.guid = handler.guid;
				elem.events[type][handler.guid] = forcedScope ? fakeHandler : handler;
			},
			remove: function(elem, type, handler) {
				// handle multiple events
				if(type.indexOf(' ') > -1) {
					var eventList = type.split(' ');
					for(var i = 0; i < eventList.length; i++) {
						publicAPI.remove(elem, eventList[i], handler);
					}
					return;
				}

				var handlers = elem.events && elem.events[type];
				if (!handlers) return;
				delete handlers[handler.guid];
				for(var any in handlers) return;
				if (elem.removeEventListener) elem.removeEventListener(type, elem.handle, false);
				else if (elem.detachEvent) elem.detachEvent("on" + type, elem.handle);
				delete elem.events[type];
				for (var any in elem.events) return;
				try {
					delete elem.handle;
					delete elem.events;
				} catch(e) {
					if(elem.removeAttribute) {
						elem.removeAttribute("handle");
						elem.removeAttribute("events");
					}
				}
				if(type === 'mousewheel') {
					publicAPI.remove(elem, 'DOMMouseScroll', handler);
				}
			}
		}
		return publicAPI;
	}())
}

// custom radio module
jcf.addModule({
	name:'radio',
	selector: 'input[type="radio"]',
	defaultOptions: {
		wrapperClass:'rad-area',
		focusClass:'rad-focus',
		checkedClass:'rad-checked',
		uncheckedClass:'rad-unchecked',
		disabledClass:'rad-disabled',
		radStructure:'<span></span>'
	},
	getRadioGroup: function(item){
		var name = item.getAttribute('name');
		if(name) {
			return jcf.lib.queryBySelector('input[name="'+name+'"]', jcf.lib.getParent('form'));
		} else {
			return [item];
		}
	},
	setupWrapper: function(){
		jcf.lib.addClass(this.fakeElement, this.options.wrapperClass);
		this.fakeElement.innerHTML = this.options.radStructure;
		this.realElement.parentNode.insertBefore(this.fakeElement, this.realElement);
		this.refreshState();
		this.addEvents();
	},
	addEvents: function(){
		jcf.lib.event.add(this.fakeElement, 'click', this.toggleRadio, this);
		if(this.labelFor) {
			jcf.lib.event.add(this.labelFor, 'click', this.toggleRadio, this);
		}
	},
	onFocus: function(e) {
		jcf.modules[this.name].superclass.onFocus.apply(this, arguments);
		setTimeout(jcf.lib.bind(function(){
			this.refreshState();
		},this),10);
	},
	toggleRadio: function(){
		if(!this.realElement.disabled && !this.realElement.checked) {
			this.realElement.checked = true;
			jcf.lib.fireEvent(this.realElement, 'change');
		}
		this.refreshState();
	},
	refreshState: function(){
		var els = this.getRadioGroup(this.realElement);
		for(var i = 0; i < els.length; i++) {
			var curEl = els[i].jcf;
			if(curEl) {
				if(curEl.realElement.checked) {
					jcf.lib.addClass(curEl.fakeElement, curEl.options.checkedClass);
					jcf.lib.removeClass(curEl.fakeElement, curEl.options.uncheckedClass);
					if(curEl.labelFor) {
						jcf.lib.addClass(curEl.labelFor, curEl.options.labelActiveClass);
					}
				} else {
					jcf.lib.removeClass(curEl.fakeElement, curEl.options.checkedClass);
					jcf.lib.addClass(curEl.fakeElement, curEl.options.uncheckedClass);
					if(curEl.labelFor) {
						jcf.lib.removeClass(curEl.labelFor, curEl.options.labelActiveClass);
					}
				}
				if(curEl.realElement.disabled) {
					jcf.lib.addClass(curEl.fakeElement, curEl.options.disabledClass);
					if(curEl.labelFor) {
						jcf.lib.addClass(curEl.labelFor, curEl.options.labelDisabledClass);
					}
				} else {
					jcf.lib.removeClass(curEl.fakeElement, curEl.options.disabledClass);
					if(curEl.labelFor) {
						jcf.lib.removeClass(curEl.labelFor, curEl.options.labelDisabledClass);
					}
				}
			}
		}
	}
});

/* IE6 Hover fix module */
var ieHover = {
	lazyMode: true,
	init: function(){
		this.setDefaults();
		return this;
	},
	setDefaults: function() {
		this.fixActive = /MSIE 6/.test(navigator.userAgent);
		if(this.fixActive) {
			this.hoverEvents = []; this.hoverQueue = [];
			this.activators = {
				onhover:{on:'onmouseenter', off:'onmouseleave'},
				onactive:{on:'onmousedown', off:'onmouseup'}
			}
			window.attachEvent('onload', this.bind(this.domReady,this));
			window.attachEvent('onunload', this.bind(this.unhookHoverEvents,this));
		}
	},
	domReady: function() {
		this.pageReady = true;
		if(this.lazyMode) {
			this.processStylesheets();
		}
		if(this.hoverQueue.length) {
			for(var i = 0; i < this.hoverQueue.length; i++) {
				this.doFix(this.hoverQueue[i].s,this.hoverQueue[i].c);
			}
		}
	},
	processStylesheets: function() {
		var sheets = document.styleSheets, len = sheets.length;
		for(var i = 0; i < len; i++) { this.parseStylesheet(sheets[i]); }
	},
	parseStylesheet: function(sheet) {
		if(sheet.imports) {
			try {
				var imports = sheet.imports, l = imports.length;
				for(var i=0; i<l; i++) this.parseStylesheet(sheet.imports[i]);
			} catch(e){}
		}
		try {
			var rules = (this.currentSheet = sheet).rules, l = rules.length;
			for(var j=0; j<l; j++) this.parseCSSRule(rules[j]);
		} catch(e){}
	},
	parseCSSRule: function(rule) {
		var select = rule.selectorText, style = rule.style.cssText;
		if(!/(^|\s)(([^a]([^ ]+)?)|(a([^#.][^ ]+)+)):(hover|active)/i.test(select) || !style) return;
		var pseudo = select.replace(/[^:]+:([a-z-]+).*/i, 'on$1');
		var newSelect = select.replace(/(\.([a-z0-9_-]+):[a-z]+)|(:[a-z]+)/gi, '.$2' + pseudo);
		var className = (/\.([a-z0-9_-]*on(hover|active))/i).exec(newSelect)[1];
		var affected = select.replace(/:(hover|active).*$/, '');
		var elements = this.parseSelector(affected);
		if(!elements.length) return;
		this.currentSheet.addRule(newSelect, style);
		for(var i=0; i < elements.length; i++) {
			this.addHoverElement(elements[i], className, this.activators[pseudo]);
		}
	},
	fix: function(selector, className) {
		if(this.fixActive) {
			if(this.pageReady) {
				this.doFix(selector,className)
			} else {
				this.hoverQueue.push({s:selector,c:className});
			}
		}
	},
	doFix: function(selector, className) {
		if(this.fixActive && typeof selector === 'string') {
			var elements = this.parseSelector(selector);
			for(var i=0; i < elements.length; i++) {
				this.addHoverElement(elements[i], className || 'hover', this.activators['onhover']);
			}
		}
	},
	addHoverElement: function(node, className, events) {
		if(!node.hovers) node.hovers = {};
		if(node.hovers[className]) return;
		node.hovers[className] = true;
		this.hookHoverEvent(node, events.on, function() { node.className += ' ' + className; });
		this.hookHoverEvent(node, events.off, function() { node.className = node.className.replace(new RegExp('\\s+'+className, 'g'),''); });
	},
	hookHoverEvent: function(node, type, handler) {
		node.attachEvent(type, handler);
		this.hoverEvents[this.hoverEvents.length] = {
			node:node, type:type, handler:handler
		};
	},
	unhookHoverEvents: function() {
		for(var e,i=0; i < this.hoverEvents.length; i++) {
			e = this.hoverEvents[i];
			e.node.detachEvent(e.type, e.handler);
		}
	},
	parseSelector: (function () {
		var g = /^([^#.>`]*)(#|\.|\>|\`)(.+)$/;
		function parseSelector(a, b) {
			var c = a.split(/\s*\,\s*/);
			var d = [];
			for (var i = 0; i < c.length; i++) {
				d = d.concat(doParse(c[i], b))
			};
			return d
		};
		function doParse(a, b, c) {
			a = a.replace(" ", "`");
			var d = a.match(g);
			var e, listNodes, listSubNodes, subselector, i, limit;
			var f = [];
			if (d == null) {
				d = [a, a]
			};
			if (d[1] == "") {
				d[1] = "*"
			};
			if (c == null) {
				c = "`"
			};
			if (b == null) {
				b = document
			};
			switch (d[2]) {
			case "#":
				subselector = d[3].match(g);
				if (subselector == null) {
					subselector = [null, d[3]]
				};
				e = document.getElementById(subselector[1]);
				if (e == null || (d[1] != "*" && !matchNodeNames(e, d[1]))) {
					return f
				};
				if (subselector.length == 2) {
					f.push(e);
					return f
				};
				return doParse(subselector[3], e, subselector[2]);
			case ".":
				if (c != ">") {
					listNodes = getElementsByTagName(b, d[1])
				} else {
					listNodes = b.childNodes
				};
				for (i = 0, limit = listNodes.length; i < limit; i++) {
					e = listNodes[i];
					if (e.nodeType != 1) {
						continue
					};
					subselector = d[3].match(g);
					if (subselector != null) {
						if (e.className == null || e.className.match("(\\s|^)" + subselector[1] + "(\\s|$)") == null) {
							continue
						};
						listSubNodes = doParse(subselector[3], e, subselector[2]);
						f = f.concat(listSubNodes)
					} else if (e.className != null && e.className.match("(\\s|^)" + d[3] + "(\\s|$)") != null) {
						f.push(e)
					}
				};
				return f;
			case ">":
				if (c != ">") {
					listNodes = getElementsByTagName(b, d[1])
				} else {
					listNodes = b.childNodes
				};
				for (i = 0, limit = listNodes.length; i < limit; i++) {
					e = listNodes[i];
					if (e.nodeType != 1) {
						continue
					};
					if (!matchNodeNames(e, d[1])) {
						continue
					};
					listSubNodes = doParse(d[3], e, ">");
					f = f.concat(listSubNodes)
				};
				return f;
			case "`":
				listNodes = getElementsByTagName(b, d[1]);
				for (i = 0, limit = listNodes.length; i < limit; i++) {
					e = listNodes[i];
					listSubNodes = doParse(d[3], e, "`");
					f = f.concat(listSubNodes)
				};
				return f;
			default:
				if (c != ">") {
					listNodes = getElementsByTagName(b, d[1])
				} else {
					listNodes = b.childNodes
				};
				for (i = 0, limit = listNodes.length; i < limit; i++) {
					e = listNodes[i];
					if (e.nodeType != 1) {
						continue
					};
					if (!matchNodeNames(e, d[1])) {
						continue
					};
					f.push(e)
				};
				return f
			}
		};
		function getElementsByTagName(a, b) {
			if (b == "*" && a.all != null) {
				return a.all
			};
			return a.getElementsByTagName(b)
		};
		function matchNodeNames(a, b) {
			if (b == "*") {
				return true
			};
			return a.nodeName.toLowerCase().replace("html:", "") == b.toLowerCase()
		};
		return parseSelector
	}()),
	bind: function(fn, scope, args) {
		return function() {
			return fn.apply(scope, args || arguments);
		}
	}
}.init();

function initAutoScalingNav(o) {
	if (!o.menuId) o.menuId = "tabset";
	if (!o.tag) o.tag = "a";
	if (!o.spacing) o.spacing = 0;
	if (!o.constant) o.constant = 0;
	if (!o.minPaddings) o.minPaddings = 0;
	if (!o.liHovering) o.liHovering = false;
	if (!o.sideClasses) o.sideClasses = false;
	if (!o.equalLinks) o.equalLinks = false;
	if (!o.flexible) o.flexible = false;
	var nav = document.getElementById(o.menuId);
	if(nav) {
		nav.className += " scaling-active";
		var lis = nav.getElementsByTagName("li");
		var asFl = [];
		var lisFl = [];
		var width = 0;
		for (var i=0, j=0; i<lis.length; i++) {
			if(lis[i].parentNode == nav) {
				var t = lis[i].getElementsByTagName(o.tag).item(0);
				asFl.push(t);
				asFl[j++].width = t.offsetWidth;
				lisFl.push(lis[i]);
				if(width < t.offsetWidth) width = t.offsetWidth;
			}
			if(o.liHovering) {
				lis[i].onmouseover = function() {
					this.className += " hover";
				}
				lis[i].onmouseout = function() {
					this.className = this.className.replace("hover", "");
				}
			}
		}
		var menuWidth = nav.clientWidth - asFl.length*o.spacing - o.constant;
		if(o.equalLinks && width * asFl.length < menuWidth) {
			for (var i=0; i<asFl.length; i++) {
				asFl[i].width = width;
			}
		}
		width = getItemsWidth(asFl);
		if(width < menuWidth) {
			var version = navigator.userAgent.toLowerCase();
			for (var i=0; getItemsWidth(asFl) < menuWidth; i++) {
				asFl[i].width++;
				if(!o.flexible) {
					asFl[i].style.width = asFl[i].width + "px";
				}
				if(i >= asFl.length-1) i=-1;
			}
			if(o.flexible) {
				for (var i=0; i<asFl.length; i++) {
					width = (asFl[i].width - o.spacing - o.constant/asFl.length)/menuWidth*100;
					if(i != asFl.length-1) {
						lisFl[i].style.width = width + "%";
					}
					else {
						if(navigator.appName.indexOf("Microsoft Internet Explorer") == -1 || version.indexOf("msie 8") != -1 || version.indexOf("msie 9") != -1)
							lisFl[i].style.width = width + "%";
					}
				}
			}
		}
		else if(o.minPaddings > 0) {
			for (var i=0; i<asFl.length; i++) {
				asFl[i].style.paddingLeft = o.minPaddings + "px";
				asFl[i].style.paddingRight = o.minPaddings + "px";
			}
		}
		if(o.sideClasses) {
			lisFl[0].className += " first-child";
			lisFl[0].getElementsByTagName(o.tag).item(0).className += " first-child-a";
			lisFl[lisFl.length-1].className += " last-child";
			lisFl[lisFl.length-1].getElementsByTagName(o.tag).item(0).className += " last-child-a";
		}
		nav.className += " scaling-ready";
	}
	function getItemsWidth(a) {
		var w = 0;
		for(var q=0; q<a.length; q++) {
			w += a[q].width;
		}
		return w;
	}
}

// First last tab
function initFirstLast() {
	$('.tabset >li:first').addClass('first');
	$('.tabset >li:last').addClass('last');
}

function initDrops(){
	var holders = $('#main-nav > li,div.login');
	
	holders.each(function(){
		var holder = $(this);
		var opener = $('>a',holder);
		var drop = $('div.drop,div.tooltip',holder)
		
		holder.data('drop',drop);
		holder.data('opener',opener);
		
		if (drop.length) {
			opener.click(function(){
				var closeFlag = false;
				if (drop.is(':visible')) closeFlag = true;
					
				holders.each(function(){
					var _this = $(this);
					_this.data('opener').removeClass('open');
					_this.data('drop').hide();
				});
				
				if (!closeFlag) {
					opener.addClass('open')
					drop.show();
				}
				return false;
			});
		}
	});
}

function initOpen(){
	$('#lang').each(function(){
		var hold = $(this);
		var link = hold.find('> li > a');
		var box = hold.find('> li > div.drop');
		
		link.click(function(){
			if (box.is(':hidden')){
				box.show();
			}
			else{
				box.hide();
			}
			return false;
		});
		hold.hover(function(){
			$(this).addClass('hovering');
		}, function(){
			$(this).removeClass('hovering');
		});
		$('body').click(function(){
			if (!hold.hasClass('hovering')){
				box.hide();
			}
		});
	});
}

function clearInputs()
{
	clearFormFields({
		clearInputs: true,
		clearTextareas: true,
		passwordFieldText: true,
		addClassFocus: "focus",
		filterClass: "default"
	});
}
function clearFormFields(o)
{
	if (o.clearInputs == null) o.clearInputs = true;
	if (o.clearTextareas == null) o.clearTextareas = true;
	if (o.passwordFieldText == null) o.passwordFieldText = false;
	if (o.addClassFocus == null) o.addClassFocus = false;
	if (!o.filter) o.filter = "default";
	if(o.clearInputs) {
		var inputs = document.getElementsByTagName("input");
		for (var i = 0; i < inputs.length; i++ ) {
			if((inputs[i].type == "text" || inputs[i].type == "password") && inputs[i].className.indexOf(o.filterClass)) {
				inputs[i].valueHtml = inputs[i].value;
				inputs[i].onfocus = function ()	{
					if(this.valueHtml == this.value) this.value = "";
					if(this.fake) {
						inputsSwap(this, this.previousSibling);
						this.previousSibling.focus();
					}
					if(o.addClassFocus && !this.fake) {
						this.className += " " + o.addClassFocus;
						this.parentNode.className += " parent-" + o.addClassFocus;
					}
				}
				inputs[i].onblur = function () {
					if(this.value == "") {
						this.value = this.valueHtml;
						if(o.passwordFieldText && this.type == "password") inputsSwap(this, this.nextSibling);
					}
					if(o.addClassFocus) {
						this.className = this.className.replace(o.addClassFocus, "");
						this.parentNode.className = this.parentNode.className.replace("parent-"+o.addClassFocus, "");
					}
				}
				if(o.passwordFieldText && inputs[i].type == "password") {
					var fakeInput = document.createElement("input");
					fakeInput.type = "text";
					fakeInput.value = inputs[i].value;
					fakeInput.className = inputs[i].className;
					fakeInput.fake = true;
					inputs[i].parentNode.insertBefore(fakeInput, inputs[i].nextSibling);
					inputsSwap(inputs[i], null);
				}
			}
		}
	}
	if(o.clearTextareas) {
		var textareas = document.getElementsByTagName("textarea");
		for(var i=0; i<textareas.length; i++) {
			if(textareas[i].className.indexOf(o.filterClass)) {
				textareas[i].valueHtml = textareas[i].value;
				textareas[i].onfocus = function() {
					if(this.value == this.valueHtml) this.value = "";
					if(o.addClassFocus) {
						this.className += " " + o.addClassFocus;
						this.parentNode.className += " parent-" + o.addClassFocus;
					}
				}
				textareas[i].onblur = function() {
					if(this.value == "") this.value = this.valueHtml;
					if(o.addClassFocus) {
						this.className = this.className.replace(o.addClassFocus, "");
						this.parentNode.className = this.parentNode.className.replace("parent-"+o.addClassFocus, "");
					}
				}
			}
		}
	}
	function inputsSwap(el, el2) {
		if(el) el.style.display = "none";
		if(el2) el2.style.display = "inline";
	}
}

/* has-drop-down */
function initMenu() {
	initDropDown();
}
function initDropDown() {
	var nav = document.getElementById("main-nav");
	if(nav) {
		var lis = nav.getElementsByTagName("li");
		for (var i=0; i<lis.length; i++) {
			if(lis[i].getElementsByTagName("ul").length > 0) {
				lis[i].className += " has-sub-menu"
				lis[i].getElementsByTagName("a")[0].className += " has-sub-menu-a"
			}
		}
	}
}

// scrolling gallery plugin
jQuery.fn.scrollGallery = function(_options){
	var _options = jQuery.extend({
		sliderHolder: '>div',
		slider:'>ul',
		slides: '>li',
		pagerLinks:'div.pager a',
		btnPrev:'a.link-prev',
		btnNext:'a.link-next',
		activeClass:'active',
		disabledClass:'disabled',
		generatePagination:false,
		curNum:'em.scur-num',
		allNum:'em.sall-num',
		circleSlide:true,
		pauseClass:'gallery-paused',
		pauseButton:'none',
		pauseOnHover:true,
		autoRotation:false,
		stopAfterClick:false,
		switchTime:5000,
		duration:650,
		easing:'swing',
		event:'click',
		splitCount:false,
		afterInit:false,
		vertical:false,
		step:1
	},_options);

	return this.each(function(){
		// gallery options
		var _this = jQuery(this);
		var _sliderHolder = jQuery(_options.sliderHolder, _this);
		var _slider = jQuery(_options.slider, _sliderHolder);
		var _slides = jQuery(_options.slides, _slider);
		var _btnPrev = jQuery(_options.btnPrev, _this);
		var _btnNext = jQuery(_options.btnNext, _this);
		var _pagerLinks = jQuery(_options.pagerLinks, _this);
		var _generatePagination = jQuery(_options.generatePagination, _this);
		var _curNum = jQuery(_options.curNum, _this);
		var _allNum = jQuery(_options.allNum, _this);
		var _pauseButton = jQuery(_options.pauseButton, _this);
		var _pauseOnHover = _options.pauseOnHover;
		var _pauseClass = _options.pauseClass;
		var _autoRotation = _options.autoRotation;
		var _activeClass = _options.activeClass;
		var _disabledClass = _options.disabledClass;
		var _easing = _options.easing;
		var _duration = _options.duration;
		var _switchTime = _options.switchTime;
		var _controlEvent = _options.event;
		var _step = _options.step;
		var _vertical = _options.vertical;
		var _circleSlide = _options.circleSlide;
		var _stopAfterClick = _options.stopAfterClick;
		var _afterInit = _options.afterInit;
		var _splitCount = _options.splitCount;
		
		// gallery init
		if(!_slides.length) return;

		if(_splitCount) {
			var curStep = 0;
			var newSlide = $('<slide>').addClass('split-slide');
			_slides.each(function(){
				newSlide.append(this);
				curStep++;
				if(curStep > _splitCount-1) {
					curStep = 0;
					_slider.append(newSlide);
					newSlide = $('<slide>').addClass('split-slide');
				}
			});
			if(curStep) _slider.append(newSlide);
			_slides = _slider.children();
		}

		var _currentStep = 0;
		var _sumWidth = 0;
		var _sumHeight = 0;
		var _hover = false;
		var _stepWidth;
		var _stepHeight;
		var _stepCount;
		var _offset;
		var _timer;

		_slides.each(function(){
			_sumWidth+=$(this).outerWidth(true);
			_sumHeight+=$(this).outerHeight(true);
		});

		// calculate gallery offset
		function recalcOffsets() {
			if(_vertical) {
				if(_step) {
					_stepHeight = _slides.eq(_currentStep).outerHeight(true);
					_stepCount = Math.ceil((_sumHeight-_sliderHolder.height())/_stepHeight)+1;
					_offset = -_stepHeight*_currentStep;
				} else {
					_stepHeight = _sliderHolder.height();
					_stepCount = Math.ceil(_sumHeight/_stepHeight);
					_offset = -_stepHeight*_currentStep;
					if(_offset < _stepHeight-_sumHeight) _offset = _stepHeight-_sumHeight;
				}
			} else {
				if(_step) {
					_stepWidth = _slides.eq(_currentStep).outerWidth(true)*_step;
					_stepCount = Math.ceil((_sumWidth-_sliderHolder.width())/_stepWidth)+1;
					_offset = -_stepWidth*_currentStep;
					if(_offset < _sliderHolder.width()-_sumWidth) _offset = _sliderHolder.width()-_sumWidth;
				} else {
					_stepWidth = _sliderHolder.width();
					_stepCount = Math.ceil(_sumWidth/_stepWidth);
					_offset = -_stepWidth*_currentStep;
					if(_offset < _stepWidth-_sumWidth) _offset = _stepWidth-_sumWidth;
				}
			}
		}

		// gallery control
		if(_btnPrev.length) {
			_btnPrev.bind(_controlEvent,function(){
				if(_stopAfterClick) stopAutoSlide();
				prevSlide();
				return false;
			});
		}
		if(_btnNext.length) {
			_btnNext.bind(_controlEvent,function(){
				if(_stopAfterClick) stopAutoSlide();
				nextSlide();
				return false;
			});
		}
		if(_generatePagination.length) {
			_generatePagination.empty();
			recalcOffsets();
			var _list = $('<ul />');
			for(var i=0; i<_stepCount; i++) $('<li><a href="#">'+(i+1)+'</a></li>').appendTo(_list);
			_list.appendTo(_generatePagination);
			_pagerLinks = _list.children();
		}
		if(_pagerLinks.length) {
			_pagerLinks.each(function(_ind){
				jQuery(this).bind(_controlEvent,function(){
					if(_currentStep != _ind) {
						if(_stopAfterClick) stopAutoSlide();
						_currentStep = _ind;
						switchSlide();
					}
					return false;
				});
			});
		}

		// gallery animation
		function prevSlide() {
			recalcOffsets();
			if(_currentStep > 0) _currentStep--;
			else if(_circleSlide) _currentStep = _stepCount-1;
			switchSlide();
		}
		function nextSlide() {
			recalcOffsets();
			if(_currentStep < _stepCount-1) _currentStep++;
			else if(_circleSlide) _currentStep = 0;
			switchSlide();
		}
		function refreshStatus() {
			if(_pagerLinks.length) _pagerLinks.removeClass(_activeClass).eq(_currentStep).addClass(_activeClass);
			if(!_circleSlide) {
				_btnPrev.removeClass(_disabledClass);
				_btnNext.removeClass(_disabledClass);
				if(_currentStep == 0) _btnPrev.addClass(_disabledClass);
				if(_currentStep == _stepCount-1) _btnNext.addClass(_disabledClass);
			}
			if(_curNum.length) _curNum.text(_currentStep+1);
			if(_allNum.length) _allNum.text(_stepCount);
		}
		function switchSlide() {
			recalcOffsets();
			if(_vertical) _slider.animate({marginTop:_offset},{duration:_duration,queue:false,easing:_easing});
			else _slider.animate({marginLeft:_offset},{duration:_duration,queue:false,easing:_easing});
			refreshStatus();
			autoSlide();
		}

		// autoslide function
		function stopAutoSlide() {
			if(_timer) clearTimeout(_timer);
			_autoRotation = false;
		}
		function autoSlide() {
			if(!_autoRotation || _hover) return;
			if(_timer) clearTimeout(_timer);
			_timer = setTimeout(nextSlide,_switchTime+_duration);
		}
		if(_pauseOnHover) {
			_this.hover(function(){
				_hover = true;
				if(_timer) clearTimeout(_timer);
			},function(){
				_hover = false;
				autoSlide();
			});
		}
		recalcOffsets();
		refreshStatus();
		autoSlide();

		// pause buttton
		if(_pauseButton.length) {
			_pauseButton.click(function(){
				if(_this.hasClass(_pauseClass)) {
					_this.removeClass(_pauseClass);
					_autoRotation = true;
					autoSlide();
				} else {
					_this.addClass(_pauseClass);
					stopAutoSlide();
				}
				return false;
			});
		}

		if(_afterInit && typeof _afterInit === 'function') _afterInit(_this, _slides);
	});
}

/* custom forms */
var _selectHeight = 23;

var _forms = document.getElementsByTagName('form');
var inputs = new Array();
var selects = new Array();
var labels = new Array();
var radios = new Array();
var radioLabels = new Array();
var checkboxes = new Array();
var checkboxLabels = new Array();
var buttons = new Array();
var selects = new Array();
var all_selects = false;
var active_select = null;
var agt = navigator.userAgent.toLowerCase();
var selectText = "please select";
var IN_CFORMS = true;

function initCustomForms() {
	if(!document.getElementById) {return false;}
	getElements();
	separateElements();
	replaceCheckboxes();
	replaceSelects();

	var _selects = document.getElementsByTagName('select');
	var _SelctClassName = [];
	if (_selects) {
		for (var i = 0; i < _selects.length; i++) {
			if (_selects[i].className != '' && _selects[i].className != 'outtaHere')
				_SelctClassName[i] = ' drop-'+_selects[i].className;
		}
		for (var i = 0; i < _SelctClassName.length; i++) {
			var _selectDrop = document.getElementById('optionsDiv'+i);
			if (_selectDrop) {
				if (_SelctClassName[i]) 
					_selectDrop.className += _SelctClassName[i];
			}
		}
	}
}


// getting all the required elements
function getElements() {
	for (var nf = 0; nf < document.getElementsByTagName("form").length; nf++) {
		for(var nfi = 0; nfi < document.forms[nf].getElementsByTagName("input").length; nfi++) {inputs.push(document.forms[nf].getElementsByTagName("input")[nfi]);}
		for(var nfl = 0; nfl < document.forms[nf].getElementsByTagName("label").length; nfl++) {labels.push(document.forms[nf].getElementsByTagName("label")[nfl]);}
		for(var nfs = 0; nfs < document.forms[nf].getElementsByTagName("select").length; nfs++) {selects.push(document.forms[nf].getElementsByTagName("select")[nfs]);}
	}
}

// separating all the elements in their respective arrays
function separateElements() {
	var r = 0; var c = 0; var t = 0; var rl = 0; var cl = 0; var tl = 0; var b = 0;
	for (var q = 0; q < inputs.length; q++) {
		if(inputs[q].type == "radio") {
			radios[r] = inputs[q]; ++r;
			for(var w = 0; w < labels.length; w++) {
				if((inputs[q].id) && labels[w].htmlFor == inputs[q].id)
				{
					radioLabels[rl] = labels[w];
					++rl;
				}
			}
		}
		if(inputs[q].type == "checkbox") {
			checkboxes[c] = inputs[q]; ++c;
			for(var w = 0; w < labels.length; w++) {
				if((inputs[q].id) && (labels[w].htmlFor == inputs[q].id))
				{
					checkboxLabels[cl] = labels[w];
					++cl;
				}
			}
		}
		if((inputs[q].type == "submit") || (inputs[q].type == "button")) {
			buttons[b] = inputs[q]; ++b;
		}
	}
}

//replacing radio buttons
function replaceRadios() {
	for (var q = 0; q < radios.length; q++) {
		radios[q].className += " outtaHere";
		var radioArea = document.createElement("div");
		if(radios[q].checked) {
			radioArea.className = "radioAreaChecked";
		}
		else
		{
			radioArea.className = "radioArea";
		}
		radioArea.id = "myRadio" + q;
		radios[q].parentNode.insertBefore(radioArea, radios[q]);
		radios[q]._ra = radioArea;

		radioArea.onclick = new Function('rechangeRadios('+q+')');
		if (radioLabels[q])
		{
			radioLabels[q].onclick = new Function('rechangeRadios('+q+')');
		}
	}
	return true;
}

//checking radios
function checkRadios(who) {
	var what = radios[who]._ra;
	for(var q = 0; q < radios.length; q++) {
		if((radios[q]._ra.className == "radioAreaChecked")&&(radios[q]._ra.nextSibling.name == radios[who].name))
		{
			radios[q]._ra.className = "radioArea";
		}
	}
	what.className = "radioAreaChecked";
}

//changing radios
function changeRadios(who) {
	if(radios[who].checked) {
		for(var q = 0; q < radios.length; q++) {
			if(radios[q].name == radios[who].name) {
				radios[q].checked = false;
			} 
			radios[who].checked = true; 
			checkRadios(who);
		}
	}
}

//rechanging radios
function rechangeRadios(who) {
	if(!radios[who].checked) {
		for(var q = 0; q < radios.length; q++) {
			if(radios[q].name == radios[who].name)	{
				radios[q].checked = false; 
			}
			radios[who].checked = true; 
			checkRadios(who);
		}
	}
}

//replacing checkboxes
function replaceCheckboxes() {
	for (var q = 0; q < checkboxes.length; q++) {
		checkboxes[q].className += " outtaHere";
		var checkboxArea = document.createElement("div");
		if(checkboxes[q].checked) {
			checkboxArea.className = "checkboxAreaChecked";
		}
		else {
			checkboxArea.className = "checkboxArea";
		}
		checkboxArea.id = "myCheckbox" + q;
		checkboxes[q].parentNode.insertBefore(checkboxArea, checkboxes[q]);
		checkboxes[q]._ca = checkboxArea;
		checkboxArea.onclick = checkboxArea.onclick2 = new Function('rechangeCheckboxes('+q+')');
		if (checkboxLabels[q])
		{
			checkboxLabels[q].onclick = new Function('changeCheckboxes('+q+')');
		}
		
		checkboxes[q].onkeydown = checkEvent;
	}
	return true;
}

//checking checkboxes
function checkCheckboxes(who, action) {
	var what = checkboxes[who]._ca;
	if(action == true) {
		what.className = "checkboxAreaChecked";
		what.checked = true;
	}
	if(action == false) {
		what.className = "checkboxArea";
		what.checked = false;
	}
}

//changing checkboxes
function changeCheckboxes(who) {
	if(checkboxes[who].checked) {
		checkCheckboxes(who, false);
	}
	else {
		checkCheckboxes(who, true);
	} 
}

//rechanging checkboxes
function rechangeCheckboxes(who) {
	var tester = false;
	if(checkboxes[who].checked == true) {
		tester = false;
	}
	else {
		tester = true;
	}
	checkboxes[who].checked = tester;
	checkCheckboxes(who, tester);
}

//check event
function checkEvent(e) {
	if (!e) var e = window.event;
	if(e.keyCode == 32) {for (var q = 0; q < checkboxes.length; q++) {if(this == checkboxes[q]) {changeCheckboxes(q);}}} //check if space is pressed
}


function replaceSelects() {
	for(var q = 0; q < selects.length; q++) {
	if (!selects[q].replaced && selects[q].offsetWidth)
	{
		selects[q]._number = q;
		//create and build div structure
		var selectArea = document.createElement("div");
		var left = document.createElement("span");
		left.className = "left";
		selectArea.appendChild(left);
		
		var disabled = document.createElement("span");
		disabled.className = "disabled";
		selectArea.appendChild(disabled);
		
		selects[q]._disabled = disabled;
		var center = document.createElement("span");
		var button = document.createElement("a");
		var text = document.createTextNode(selectText);
		center.id = "mySelectText"+q;
		
		var stWidth = selects[q].offsetWidth;
		selectArea.style.width = stWidth + "px";
		if (selects[q].parentNode.className.indexOf("type2") != -1){
			button.href = "javascript:showOptions("+q+",true)";
		} else {
			button.href = "javascript:showOptions("+q+",false)";
		}
		button.className = "selectButton";
		selectArea.className = "selectArea";

		selectArea.className += " " + selects[q].className;
		selectArea.id = "sarea"+q;
		center.className = "center";
		center.appendChild(text);
		selectArea.appendChild(center);
		selectArea.appendChild(button);
		
		//hide the select field
		selects[q].className += " outtaHere";
		//insert select div
		selects[q].parentNode.insertBefore(selectArea, selects[q]);
		//build & place options div

		var optionsDiv = document.createElement("div");
		
		var optionsList = document.createElement("ul");
		optionsDiv.innerHTML += "<div class='select-top'><div></div></div>";
		optionsDiv.appendChild(optionsList);
		
		selects[q]._options = optionsList;
		
		optionsDiv.style.width = stWidth + "px";
		optionsDiv._parent = selectArea;
		
		optionsDiv.className = "optionsDivInvisible";
		optionsDiv.id = "optionsDiv"+q;
		
	
		populateSelectOptions(selects[q]);
		optionsDiv.innerHTML += "<div class='select-bottom'><div class='select-bottom-left'></div><div class='select-bottom-right'></div></div>";
		document.getElementsByTagName("body")[0].appendChild(optionsDiv);
		selects[q].replaced = true;
		}
	all_selects = true;
	}
}

//collecting select options
function populateSelectOptions(me) {
	me._options.innerHTML = "";
	
	for(var w = 0; w < me.options.length; w++) {
		
		var optionHolder = document.createElement('li');
		var optionLink = document.createElement('a');
		var optionTxt;
		if (me.options[w].title.indexOf('image') != -1) {
			optionTxt = document.createElement('img');
			optionSpan = document.createElement('span');
			optionTxt.src = me.options[w].title;
			optionSpan = document.createTextNode(me.options[w].text);
		} else {
			optionTxt = document.createTextNode(me.options[w].text);
		}
		
		optionLink.href = "javascript:showOptions("+me._number+"); selectMe('"+me.id+"',"+w+","+me._number+");";
		if (me.options[w].title.indexOf('image') != -1) {
			optionLink.appendChild(optionTxt);
			optionLink.appendChild(optionSpan);
		} else {
			optionLink.appendChild(optionTxt);
		}
		optionHolder.appendChild(optionLink);
		me._options.appendChild(optionHolder);
		//check for pre-selected items
		if(me.options[w].selected) {
			selectMe(me.id,w,me._number);
		}
	}
	if (me.disabled) {
		me._disabled.style.display = "block";
	}
	else {
		me._disabled.style.display = "none";
	}
}

//selecting me
function selectMe(selectFieldId,linkNo,selectNo) {
	selectField = selects[selectNo];
	for(var k = 0; k < selectField.options.length; k++) {
		if(k==linkNo) {
			selectField.options[k].selected = true;
		}
		else {
			selectField.options[k].selected = false;
		}
	}
	
	//show selected option
	textVar = document.getElementById("mySelectText"+selectNo);
	var newText;
	var optionSpan;
	if (selectField.options[linkNo].title.indexOf('image') != -1) {
		newText = document.createElement('img');
		newText.src = selectField.options[linkNo].title;
		optionSpan = document.createElement('span');
		optionSpan = document.createTextNode(selectField.options[linkNo].text);
	} else {
		newText = document.createTextNode(selectField.options[linkNo].text);
	}
	if (selectField.options[linkNo].title.indexOf('image') != -1) {
		if (textVar.childNodes.length > 1) textVar.removeChild(textVar.childNodes[0]);
		textVar.replaceChild(newText, textVar.childNodes[0]);	
		textVar.appendChild(optionSpan);	
	} else {
		if (textVar.childNodes.length > 1) textVar.removeChild(textVar.childNodes[0]);
		textVar.replaceChild(newText, textVar.childNodes[0]);	
	}
	if (selectField.onchange && all_selects)
		{
			eval(selectField.onchange());
		}
}
//showing options
function showOptions(g) {
		_elem = document.getElementById("optionsDiv"+g);
		var divArea = document.getElementById("sarea"+g);
		if (active_select && active_select != _elem) {
			active_select.className = active_select.className.replace('optionsDivVisible',' optionsDivInvisible');
			active_select.style.height = "auto";
		}
		if(_elem.className.indexOf("optionsDivInvisible") != -1) {
			_elem.style.left = "-9999px";
			_elem.style.top = findPosY(divArea) + _selectHeight + 'px';
			_elem.className = _elem.className.replace('optionsDivInvisible','');
			_elem.className += " optionsDivVisible";
			/*if (_elem.offsetHeight > 200)
			{
				_elem.style.height = "200px";
			}*/
			_elem.style.left = findPosX(divArea) + 'px';
			
			active_select = _elem;
			if(document.documentElement)
			{
				document.documentElement.onclick = hideSelectOptions;
			}
			else
			{
				window.onclick = hideSelectOptions;
			}
		}
		else if(_elem.className.indexOf("optionsDivVisible") != -1) {
			_elem.style.height = "auto";
			_elem.className = _elem.className.replace('optionsDivVisible','');
			_elem.className += " optionsDivInvisible";
		}
		
		// for mouseout
		/*_elem.timer = false;
		_elem.onmouseover = function() {
			if (this.timer) clearTimeout(this.timer);
		}
		_elem.onmouseout = function() {
			var _this = this;
			this.timer = setTimeout(function(){
				_this.style.height = "auto";
				_this.className = _this.className.replace('optionsDivVisible','');
				if (_elem.className.indexOf('optionsDivInvisible') == -1)
					_this.className += " optionsDivInvisible";
			},200);
		}*/
}

function hideSelectOptions(e)
{
	if(active_select)
	{
		if(!e) e = window.event;
		var _target = (e.target || e.srcElement);
		if(isElementBefore(_target,'selectArea') == 0 && isElementBefore(_target,'optionsDiv') == 0)
		{
			active_select.className = active_select.className.replace('optionsDivVisible', '');
			active_select.className = active_select.className.replace('optionsDivInvisible', '');
			active_select.className += " optionsDivInvisible";
			active_select = false;

			if(document.documentElement)
			{
				document.documentElement.onclick = function(){};
			}
			else
			{
				window.onclick = null;
			}
		}
	}
}

function isElementBefore(_el,_class)
{
	var _parent = _el;
	do
	{
		_parent = _parent.parentNode;
	}
	while(_parent && _parent.className != null && _parent.className.indexOf(_class) == -1)
	
	if(_parent.className && _parent.className.indexOf(_class) != -1)
	{
		return 1;
	}
	else
	{
		return 0;
	}
	
}

function findPosY(obj) {
	var posTop = 0;
	while (obj.offsetParent) {posTop += obj.offsetTop; obj = obj.offsetParent;}
	return posTop;
}
function findPosX(obj) {
	var posLeft = 0;
	while (obj.offsetParent) {posLeft += obj.offsetLeft; obj = obj.offsetParent;}
	return posLeft;
}

/*
 * jQuery Open/Close plugin
 */
;(function($) {
	function OpenClose(options) {
		this.options = $.extend({
			addClassBeforeAnimation: true,
			hideOnClickOutside: false,
			activeClass:'active',
			opener:'.opener',
			slider:'.slide',
			animSpeed: 400,
			effect:'fade',
			event:'click'
		}, options);
		this.init();
	}
	OpenClose.prototype = {
		init: function() {
			if(this.options.holder) {
				this.findElements();
				this.attachEvents();
				this.makeCallback('onInit');
			}
		},
		findElements: function() {
			this.holder = $(this.options.holder);
			this.opener = this.holder.find(this.options.opener);
			this.slider = this.holder.find(this.options.slider);

			if (!this.holder.hasClass(this.options.activeClass)) {
				this.slider.addClass(slideHiddenClass);
			}
		},
		attachEvents: function() {
			// add handler
			var self = this;
			this.eventHandler = function(e) {
				if (self.slider.hasClass(slideHiddenClass)) {
					self.showSlide();
				} else {
					self.hideSlide();
				}
			};
			self.opener.each(function() {
				var opener = jQuery(this);
				opener.click(function(e) {
					if (opener[0].tagName.toLowerCase() == 'a' ) {
						e.preventDefault();
					}
					self.eventHandler();
				});
			});
			// self.opener.bind(self.options.event, this.eventHandler);

			// hover mode handler
			if(self.options.event === 'over') {
				self.opener.bind('mouseenter', function() {
					self.holder.removeClass(self.options.activeClass);
					self.opener.trigger(self.options.event);
				});
				self.holder.bind('mouseleave', function() {
					self.holder.addClass(self.options.activeClass);
					self.opener.trigger(self.options.event);
				});
			}

			// outside click handler
			self.outsideClickHandler = function(e) {
				if(self.options.hideOnClickOutside) {
					var target = $(e.target);
					if (!target.is(self.holder) && !target.closest(self.holder).length) {
						self.hideSlide();
					}
				}
			};
		},
		showSlide: function() {
			var self = this;
			if (self.options.addClassBeforeAnimation) {
				self.holder.addClass(self.options.activeClass);
			}
			self.slider.removeClass(slideHiddenClass);
			$(document).bind('click touchstart', self.outsideClickHandler);

			self.makeCallback('animStart', true);
			toggleEffects[self.options.effect].show({
				box: self.slider,
				speed: self.options.animSpeed,
				complete: function() {
					if (!self.options.addClassBeforeAnimation) {
						self.holder.addClass(self.options.activeClass);
					}
					self.makeCallback('animEnd', true);
				}
			});
		},
		hideSlide: function() {
			var self = this;
			if (self.options.addClassBeforeAnimation) {
				self.holder.removeClass(self.options.activeClass);
			}
			$(document).unbind('click touchstart', self.outsideClickHandler);

			self.makeCallback('animStart', false);
			toggleEffects[self.options.effect].hide({
				box: self.slider,
				speed: self.options.animSpeed,
				complete: function() {
					if (!self.options.addClassBeforeAnimation) {
						self.holder.removeClass(self.options.activeClass);
					}
					self.slider.addClass(slideHiddenClass);
					self.makeCallback('animEnd', false);
				}
			});
		},
		destroy: function() {
			this.slider.removeClass(slideHiddenClass).css({display:''});
			this.opener.unbind(this.options.event, this.eventHandler);
			this.holder.removeClass(this.options.activeClass).removeData('OpenClose');
			$(document).unbind('click touchstart', this.outsideClickHandler);
		},
		makeCallback: function(name) {
			if(typeof this.options[name] === 'function') {
				var args = Array.prototype.slice.call(arguments);
				args.shift();
				this.options[name].apply(this, args);
			}
		}
	};

	// add stylesheet for slide on DOMReady
	var slideHiddenClass = 'js-slide-hidden';
	$(function() {
		var tabStyleSheet = $('<style type="text/css">')[0];
		var tabStyleRule = '.' + slideHiddenClass;
		tabStyleRule += '{position:absolute !important;left:-9999px !important;top:-9999px !important;display:block !important}';
		if (tabStyleSheet.styleSheet) {
			tabStyleSheet.styleSheet.cssText = tabStyleRule;
		} else {
			tabStyleSheet.appendChild(document.createTextNode(tabStyleRule));
		}
		$('head').append(tabStyleSheet);
	});

	// animation effects
	var toggleEffects = {
		slide: {
			show: function(o) {
				o.box.stop(true).hide().slideDown(o.speed, o.complete);
			},
			hide: function(o) {
				o.box.stop(true).slideUp(o.speed, o.complete);
			}
		},
		fade: {
			show: function(o) {
				o.box.stop(true).hide().fadeIn(o.speed, o.complete);
			},
			hide: function(o) {
				o.box.stop(true).fadeOut(o.speed, o.complete);
			}
		},
		none: {
			show: function(o) {
				o.box.hide().show(0, o.complete);
			},
			hide: function(o) {
				o.box.hide(0, o.complete);
			}
		}
	};

	// jQuery plugin interface
	$.fn.openClose = function(opt) {
		return this.each(function() {
			jQuery(this).data('OpenClose', new OpenClose($.extend(opt, {holder: this})));
		});
	};
}(jQuery));

// ColorBox v1.3.15 - a full featured, light-weight, customizable lightbox based on jQuery 1.3+
// Copyright (c) 2010 Jack Moore - jack@colorpowered.com
// Licensed under the MIT license: http://www.opensource.org/licenses/mit-license.php
;(function(b,ib){var t="none",M="LoadedContent",c=false,v="resize.",o="y",q="auto",e=true,L="nofollow",m="x";function f(a,c){a=a?' id="'+i+a+'"':"";c=c?' style="'+c+'"':"";return b("<div"+a+c+"/>")}function p(a,b){b=b===m?n.width():n.height();return typeof a==="string"?Math.round(/%/.test(a)?b/100*parseInt(a,10):parseInt(a,10)):a}function U(b){return a.photo||/\.(gif|png|jpg|jpeg|bmp)(?:\?([^#]*))?(?:#(\.*))?$/i.test(b)}function cb(a){for(var c in a)if(b.isFunction(a[c])&&c.substring(0,2)!=="on")a[c]=a[c].call(l);a.rel=a.rel||l.rel||L;a.href=a.href||b(l).attr("href");a.title=a.title||l.title;return a}function w(c,a){a&&a.call(l);b.event.trigger(c)}function jb(){var b,e=i+"Slideshow_",c="click."+i,f,k;if(a.slideshow&&h[1]){f=function(){F.text(a.slideshowStop).unbind(c).bind(V,function(){if(g<h.length-1||a.loop)b=setTimeout(d.next,a.slideshowSpeed)}).bind(W,function(){clearTimeout(b)}).one(c+" "+N,k);j.removeClass(e+"off").addClass(e+"on");b=setTimeout(d.next,a.slideshowSpeed)};k=function(){clearTimeout(b);F.text(a.slideshowStart).unbind([V,W,N,c].join(" ")).one(c,f);j.removeClass(e+"on").addClass(e+"off")};a.slideshowAuto?f():k()}}function db(c){if(!O){l=c;a=cb(b.extend({},b.data(l,r)));h=b(l);g=0;if(a.rel!==L){h=b("."+G).filter(function(){return (b.data(this,r).rel||this.rel)===a.rel});g=h.index(l);if(g===-1){h=h.add(l);g=h.length-1}}if(!u){u=D=e;j.show();if(a.returnFocus)try{l.blur();b(l).one(eb,function(){try{this.focus()}catch(a){}})}catch(f){}x.css({opacity:+a.opacity,cursor:a.overlayClose?"pointer":q}).show();a.w=p(a.initialWidth,m);a.h=p(a.initialHeight,o);d.position(0);X&&n.bind(v+P+" scroll."+P,function(){x.css({width:n.width(),height:n.height(),top:n.scrollTop(),left:n.scrollLeft()})}).trigger("scroll."+P);w(fb,a.onOpen);Y.add(H).add(I).add(F).add(Z).hide();ab.html(a.close).show()}d.load(e)}}var gb={transition:"elastic",speed:300,width:c,initialWidth:"600",innerWidth:c,maxWidth:c,height:c,initialHeight:"450",innerHeight:c,maxHeight:c,scalePhotos:e,scrolling:e,inline:c,html:c,iframe:c,photo:c,href:c,title:c,rel:c,opacity:.9,preloading:e,current:"image {current} of {total}",previous:"previous",next:"next",close:"close",open:c,returnFocus:e,loop:e,slideshow:c,slideshowAuto:e,slideshowSpeed:2500,slideshowStart:"start slideshow",slideshowStop:"stop slideshow",onOpen:c,onLoad:c,onComplete:c,onCleanup:c,onClosed:c,overlayClose:e,escKey:e,arrowKey:e},r="colorbox",i="cbox",fb=i+"_open",W=i+"_load",V=i+"_complete",N=i+"_cleanup",eb=i+"_closed",Q=i+"_purge",hb=i+"_loaded",E=b.browser.msie&&!b.support.opacity,X=E&&b.browser.version<7,P=i+"_IE6",x,j,A,s,bb,T,R,S,h,n,k,J,K,Z,Y,F,I,H,ab,B,C,y,z,l,g,a,u,D,O=c,d,G=i+"Element";d=b.fn[r]=b[r]=function(c,f){var a=this,d;if(!a[0]&&a.selector)return a;c=c||{};if(f)c.onComplete=f;if(!a[0]||a.selector===undefined){a=b("<a/>");c.open=e}a.each(function(){b.data(this,r,b.extend({},b.data(this,r)||gb,c));b(this).addClass(G)});d=c.open;if(b.isFunction(d))d=d.call(a);d&&db(a[0]);return a};d.init=function(){var l="hover",m="clear:left";n=b(ib);j=f().attr({id:r,"class":E?i+"IE":""});x=f("Overlay",X?"position:absolute":"").hide();A=f("Wrapper");s=f("Content").append(k=f(M,"width:0; height:0; overflow:hidden"),K=f("LoadingOverlay").add(f("LoadingGraphic")),Z=f("Title"),Y=f("Current"),I=f("Next"),H=f("Previous"),F=f("Slideshow").bind(fb,jb),ab=f("Close"));A.append(f().append(f("TopLeft"),bb=f("TopCenter"),f("TopRight")),f(c,m).append(T=f("MiddleLeft"),s,R=f("MiddleRight")),f(c,m).append(f("BottomLeft"),S=f("BottomCenter"),f("BottomRight"))).children().children().css({"float":"left"});J=f(c,"position:absolute; width:9999px; visibility:hidden; display:none");b("body").prepend(x,j.append(A,J));s.children().hover(function(){b(this).addClass(l)},function(){b(this).removeClass(l)}).addClass(l);B=bb.height()+S.height()+s.outerHeight(e)-s.height();C=T.width()+R.width()+s.outerWidth(e)-s.width();y=k.outerHeight(e);z=k.outerWidth(e);j.css({"padding-bottom":B,"padding-right":C}).hide();I.click(d.next);H.click(d.prev);ab.click(d.close);s.children().removeClass(l);b("."+G).live("click",function(a){if(!(a.button!==0&&typeof a.button!=="undefined"||a.ctrlKey||a.shiftKey||a.altKey)){a.preventDefault();db(this)}});x.click(function(){a.overlayClose&&d.close()});b(document).bind("keydown",function(b){if(u&&a.escKey&&b.keyCode===27){b.preventDefault();d.close()}if(u&&a.arrowKey&&!D&&h[1])if(b.keyCode===37&&(g||a.loop)){b.preventDefault();H.click()}else if(b.keyCode===39&&(g<h.length-1||a.loop)){b.preventDefault();I.click()}})};d.remove=function(){j.add(x).remove();b("."+G).die("click").removeData(r).removeClass(G)};d.position=function(f,d){function b(a){bb[0].style.width=S[0].style.width=s[0].style.width=a.style.width;K[0].style.height=K[1].style.height=s[0].style.height=T[0].style.height=R[0].style.height=a.style.height}var e,h=Math.max(document.documentElement.clientHeight-a.h-y-B,0)/2+n.scrollTop(),g=Math.max(n.width()-a.w-z-C,0)/2+n.scrollLeft();e=j.width()===a.w+z&&j.height()===a.h+y?0:f;A[0].style.width=A[0].style.height="9999px";j.dequeue().animate({width:a.w+z,height:a.h+y,top:h,left:g},{duration:e,complete:function(){b(this);D=c;A[0].style.width=a.w+z+C+"px";A[0].style.height=a.h+y+B+"px";d&&d()},step:function(){b(this)}})};d.resize=function(b){if(u){b=b||{};if(b.width)a.w=p(b.width,m)-z-C;if(b.innerWidth)a.w=p(b.innerWidth,m);k.css({width:a.w});if(b.height)a.h=p(b.height,o)-y-B;if(b.innerHeight)a.h=p(b.innerHeight,o);if(!b.innerHeight&&!b.height){b=k.wrapInner("<div style='overflow:auto'></div>").children();a.h=b.height();b.replaceWith(b.children())}k.css({height:a.h});d.position(a.transition===t?0:a.speed)}};d.prep=function(m){var c="hidden";function l(s){var p,f,m,c,l=h.length,q=a.loop;d.position(s,function(){function s(){E&&j[0].style.removeAttribute("filter")}if(u){E&&o&&k.fadeIn(100);k.show();w(hb);Z.show().html(a.title);if(l>1){typeof a.current==="string"&&Y.html(a.current.replace(/\{current\}/,g+1).replace(/\{total\}/,l)).show();I[q||g<l-1?"show":"hide"]().html(a.next);H[q||g?"show":"hide"]().html(a.previous);p=g?h[g-1]:h[l-1];m=g<l-1?h[g+1]:h[0];a.slideshow&&F.show();if(a.preloading){c=b.data(m,r).href||m.href;f=b.data(p,r).href||p.href;c=b.isFunction(c)?c.call(m):c;f=b.isFunction(f)?f.call(p):f;if(U(c))b("<img/>")[0].src=c;if(U(f))b("<img/>")[0].src=f}}K.hide();a.transition==="fade"?j.fadeTo(e,1,function(){s()}):s();n.bind(v+i,function(){d.position(0)});w(V,a.onComplete)}})}if(u){var o,e=a.transition===t?0:a.speed;n.unbind(v+i);k.remove();k=f(M).html(m);k.hide().appendTo(J.show()).css({width:function(){a.w=a.w||k.width();a.w=a.mw&&a.mw<a.w?a.mw:a.w;return a.w}(),overflow:a.scrolling?q:c}).css({height:function(){a.h=a.h||k.height();a.h=a.mh&&a.mh<a.h?a.mh:a.h;return a.h}()}).prependTo(s);J.hide();b("#"+i+"Photo").css({cssFloat:t,marginLeft:q,marginRight:q});X&&b("select").not(j.find("select")).filter(function(){return this.style.visibility!==c}).css({visibility:c}).one(N,function(){this.style.visibility="inherit"});a.transition==="fade"?j.fadeTo(e,0,function(){l(0)}):l(e)}};d.load=function(u){var n,c,s,q=d.prep;D=e;l=h[g];u||(a=cb(b.extend({},b.data(l,r))));w(Q);w(W,a.onLoad);a.h=a.height?p(a.height,o)-y-B:a.innerHeight&&p(a.innerHeight,o);a.w=a.width?p(a.width,m)-z-C:a.innerWidth&&p(a.innerWidth,m);a.mw=a.w;a.mh=a.h;if(a.maxWidth){a.mw=p(a.maxWidth,m)-z-C;a.mw=a.w&&a.w<a.mw?a.w:a.mw}if(a.maxHeight){a.mh=p(a.maxHeight,o)-y-B;a.mh=a.h&&a.h<a.mh?a.h:a.mh}n=a.href;K.show();if(a.inline){f().hide().insertBefore(b(n)[0]).one(Q,function(){b(this).replaceWith(k.children())});q(b(n))}else if(a.iframe){j.one(hb,function(){var c=b("<iframe frameborder='0' style='width:100%; height:100%; border:0; display:block'/>")[0];c.name=i+ +new Date;c.src=a.href;if(!a.scrolling)c.scrolling="no";if(E)c.allowtransparency="true";b(c).appendTo(k).one(Q,function(){c.src="//about:blank"})});q(" ")}else if(a.html)q(a.html);else if(U(n)){c=new Image;c.onload=function(){var e;c.onload=null;c.id=i+"Photo";b(c).css({border:t,display:"block",cssFloat:"left"});if(a.scalePhotos){s=function(){c.height-=c.height*e;c.width-=c.width*e};if(a.mw&&c.width>a.mw){e=(c.width-a.mw)/c.width;s()}if(a.mh&&c.height>a.mh){e=(c.height-a.mh)/c.height;s()}}if(a.h)c.style.marginTop=Math.max(a.h-c.height,0)/2+"px";h[1]&&(g<h.length-1||a.loop)&&b(c).css({cursor:"pointer"}).click(d.next);if(E)c.style.msInterpolationMode="bicubic";setTimeout(function(){q(c)},1)};setTimeout(function(){c.src=n},1)}else n&&J.load(n,function(d,c,a){q(c==="error"?"Request unsuccessful: "+a.statusText:b(this).children())})};d.next=function(){if(!D){g=g<h.length-1?g+1:0;d.load()}};d.prev=function(){if(!D){g=g?g-1:h.length-1;d.load()}};d.close=function(){if(u&&!O){O=e;u=c;w(N,a.onCleanup);n.unbind("."+i+" ."+P);x.fadeTo("fast",0);j.stop().fadeTo("fast",0,function(){w(Q);k.remove();j.add(x).css({opacity:1,cursor:q}).hide();setTimeout(function(){O=c;w(eb,a.onClosed)},1)})}};d.element=function(){return b(l)};d.settings=gb;b(d.init)})(jQuery,this);


/**
 * justcorners.js 2.0 (10-Aug-2010) (c) by Christian Effenberger
 * All Rights Reserved. Source: corner.netzgesta.de
 * Distributed under Netzgestade Software License Agreement.
 * This license permits free of charge use on non-commercial
 * and private web sites only under special conditions.
 * Read more at... http://www.netzgesta.de/cvi/LICENSE.html
 * Commercial licenses available via... cvi[at]netzgesta[dot]de
**/
var tmp=navigator.appName=="Microsoft Internet Explorer"&&navigator.userAgent.indexOf("Opera")<1?1:0;if(tmp){var isIE=document.namespaces&&!window.opera&&(!document.documentMode||document.documentMode<9)?1:0}if(isIE){if(document.namespaces.v==null){var e=["shape","shapetype","group","background","path","formulas","handles","fill","stroke","shadow","textbox","textpath","imagedata","line","polyline","curve","roundrect","oval","rect","arc","image"],s=document.createStyleSheet();for(var i=0;i<e.length;i++){s.addRule("v\\:"+e[i],"behavior: url(#default#VML);")}document.namespaces.add("v","urn:schemas-microsoft-com:vml")}}function roundedCorners(k,b,j,g,f,d,c,a,h){k.beginPath();k.moveTo(0,g);if(c==1){k.lineTo(0,j-g);if(h){k.lineTo(g,j)}else{k.quadraticCurveTo(0,j,g,j)}}else{k.lineTo(0,j)}if(a==1){k.lineTo(b-g,j);if(h){k.lineTo(b,j-g)}else{k.quadraticCurveTo(b,j,b,j-g)}}else{k.lineTo(b,j)}if(d==1){k.lineTo(b,g);if(h){k.lineTo(b-g,0)}else{k.quadraticCurveTo(b,0,b-g,0)}}else{k.lineTo(b,0)}if(f==1){k.lineTo(g,0);if(h){k.lineTo(0,g)}else{k.quadraticCurveTo(0,0,0,g)}}else{k.lineTo(0,0)}k.closePath()}function addRoundedIECorners(){var n,F,c,z,E,x="";var C=0,l=0,m="",D="";var w=0,h=0,v,u,k,B=false,y="";var f=null,t="",r="",q="";var d=1,b=1,a=1,A=1;var g=document.getElementsByTagName("img");var p=new Array();for(v=0;v<g.length;v++){k=g[v];z=k.className.split(" ");for(u=0;u<z.length;u++){if(z[u]=="corners"){p.push(k);break}}}for(v=0;v<p.length;v++){n=p[v];C=16;q="0000ff";d=1;b=1;a=1;A=1;B=false;l=0;F=n.parentNode;x=n.className.split(" ");for(u=0;u<x.length;u++){if(x[u].indexOf("iradius")==0){C=x[u].substring(7)}else{if(x[u].indexOf("iborder")==0){l=x[u].substring(7)}else{if(x[u].indexOf("icolor")==0){m=x[u].substring(6)}else{if(x[u].indexOf("ibezel")==0){B=true}else{if(x[u].indexOf("iradiae")==0){y=x[u].substring(7);d=(y.substr(0,1)!="1"?0:1);b=(y.substr(1,1)!="1"?0:1);a=(y.substr(2,1)!="1"?0:1);A=(y.substr(3,1)!="1"?0:1)}}}}}}D="";for(u=0;u<x.length;u++){if(x[u]!="corners"){if(D){D+=" "}D+=x[u]}}w=Math.min(n.width,n.height)/2;h=(C==0?16:C);f=Math.min(w,h);l=Math.min(l,2);q=(m.match(/^[0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f]$/i)?m:q);t=(n.currentStyle.display.toLowerCase()=="block")?"block":"inline-block";c=document.createElement(['<var style="zoom:1;overflow:hidden;display:'+t+";width:"+n.width+"px;height:"+n.height+'px;padding:0;">'].join(""));r=n.currentStyle.styleFloat.toLowerCase();t=(r=="left"||r=="right")?"inline":t;var o="m 0,"+f;if(a==1){o+=" l 0,"+(n.height-f)+(B?" l ":" qy ")+f+","+n.height}else{o+=" l 0,"+n.height}if(A==1){o+=" l "+(n.width-f)+","+n.height+(B?" l ":" qx ")+n.width+","+(n.height-f)}else{o+=" l "+n.width+","+n.height}if(b==1){o+=" l "+n.width+","+f+(B?" l ":" qy ")+(n.width-f)+",0"}else{o+=" l "+n.width+",0"}if(d==1){o+=" l "+f+",0 "+(B?" l ":" qx ")+" 0,"+f}else{o+=" l 0,0"}o+=" x e";E='<v:shape strokeweight="'+l+'px" stroked="'+(l>0?"t":"f")+'" strokecolor="#'+q+'" filled="t" fillcolor="#ffffff" coordorigin="0,0" coordsize="'+n.width+","+n.height+'" path="'+o+'" style="zoom:1;margin:-1px 0 0 -1px;padding: 0;display:'+t+";width:"+n.width+"px;height:"+n.height+'px;"><v:fill src="'+n.src+'" type="frame" /></v:shape>';c.innerHTML=[E].join("");c.className=D;c.style.cssText=n.style.cssText;c.style.visibility="visible";c.src=n.src;c.alt=n.alt;if(n.id!=""){c.id=n.id}if(n.title!=""){c.title=n.title}if(n.getAttribute("onclick")!=""){c.setAttribute("onclick",n.getAttribute("onclick"))}n.insertAdjacentElement("BeforeBegin",c);if(n.getAttribute("usemap")){F.style.position="relative";F.style.height=n.height+"px";F.style.width=n.width+"px";n.left=0;n.top=0;n.style.position="absolute";n.style.height=n.height+"px";n.style.width=n.width+"px";n.style.left=0+"px";n.style.top=0+"px";n.style.filter="Alpha(opacity=0)"}else{n.style.display="none"}}}function addRoundedCorners(){var n,B,d,c,w,u="";var z=0,l=0,m="",y=false,A="";var t=0,h=0,r,q,k,v="";var f=1,b=1,a=1,x=1,p="";var g=document.getElementsByTagName("img");var o=new Array();for(r=0;r<g.length;r++){k=g[r];w=k.className.split(" ");for(q=0;q<w.length;q++){if(w[q]=="corners"){o.push(k);break}}}for(r=0;r<o.length;r++){n=o[r];z=16;p="0000ff";f=1;b=1;a=1;x=1;y=false;l=0;B=n.parentNode;d=document.createElement("canvas");if(d.getContext){u=n.className.split(" ");for(q=0;q<u.length;q++){if(u[q].indexOf("iradius")==0){z=u[q].substring(7)}else{if(u[q].indexOf("iborder")==0){l=u[q].substring(7)}else{if(u[q].indexOf("icolor")==0){m=u[q].substring(6)}else{if(u[q].indexOf("ibezel")==0){y=true}else{if(u[q].indexOf("iradiae")==0){v=u[q].substring(7);f=(v.substr(0,1)!="1"?0:1);b=(v.substr(1,1)!="1"?0:1);a=(v.substr(2,1)!="1"?0:1);x=(v.substr(3,1)!="1"?0:1)}}}}}}A="";for(q=0;q<u.length;q++){if(u[q]!="corners"){if(A){A+=" "}A+=u[q]}}d.className=A;d.style.cssText=n.style.cssText;d.style.height=n.height+"px";d.style.width=n.width+"px";d.height=n.height;d.width=n.width;d.src=n.src;d.alt=n.alt;if(n.id!=""){d.id=n.id}if(n.title!=""){d.title=n.title}if(n.getAttribute("onclick")!=""){d.setAttribute("onclick",n.getAttribute("onclick"))}t=Math.min(d.width,d.height)/2;h=(z==0?16:z);z=Math.min(t,h);l=Math.min(l*2,z);p=(m.match(/^[0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f]$/i)?m:p);c=d.getContext("2d");if(n.getAttribute("usemap")){B.style.position="relative";B.style.height=n.height+"px";B.style.width=n.width+"px";d.left=0;d.top=0;d.style.position="absolute";d.style.left=0+"px";d.style.top=0+"px";n.left=0;n.top=0;n.style.position="absolute";n.style.height=n.height+"px";n.style.width=n.width+"px";n.style.left=0+"px";n.style.top=0+"px";n.style.opacity=0;B.insertBefore(d,n)}else{B.replaceChild(d,n)}c.clearRect(0,0,d.width,d.height);globalCompositeOperation="source-in";roundedCorners(c,d.width,d.height,z,f,b,a,x,y);c.clip();c.fillStyle="rgba(0,0,0,0)";c.fillRect(0,0,d.width,d.height);c.drawImage(n,0,0,d.width,d.height);if(l>0){roundedCorners(c,d.width,d.height,z,f,b,a,x,y);c.strokeStyle="#"+p;c.lineWidth=l;c.stroke()}d.style.visibility="visible"}}}if(window.addEventListener){window.addEventListener("load",addRoundedCorners,false)}else{window.attachEvent("onload",addRoundedIECorners)};

/**
 * corner.js 2.1 (10-Aug-2010) (c) by Christian Effenberger
 * All Rights Reserved. Source: corner.netzgesta.de
 * Distributed under Netzgestade Software License Agreement.
 * This license permits free of charge use on non-commercial
 * and private web sites only under special conditions.
 * Read more at... http://www.netzgesta.de/cvi/LICENSE.html
 * Commercial licenses available via... cvi[at]netzgesta[dot]de
**/
var tmp=navigator.appName=="Microsoft Internet Explorer"&&navigator.userAgent.indexOf("Opera")<1?1:0;if(tmp){var isIE=document.namespaces&&(!document.documentMode||document.documentMode<9)?1:0}if(isIE){if(document.namespaces.v==null){var e=["shape","shapetype","group","background","path","formulas","handles","fill","stroke","shadow","textbox","textpath","imagedata","line","polyline","curve","roundrect","oval","rect","arc","image"],s=document.createStyleSheet();for(var i=0;i<e.length;i++){s.addRule("v\\:"+e[i],"behavior: url(#default#VML);")}document.namespaces.add("v","urn:schemas-microsoft-com:vml")}}function getRadius(b,d,a){var c=(Math.min(d,a)/100);b=Math.max(Math.min(100,b/c),0);return b+"%"}function getImages(d){var c=document.getElementsByTagName("img");var f=new Array();var b=0;var h;var g;var a=0;for(b=0;b<c.length;b++){h=c[b];g=h.className.split(" ");for(var a=0;a<g.length;a++){if(g[a]==d){f.push(h);break}}}return f}function getClasses(d,c){var a="";for(var b=0;b<d.length;b++){if(d[b]!=c){if(a){a+=" "}a+=d[b]}}return a}function getClassValue(d,c){var a=0;var f=c.length;for(var b=0;b<d.length;b++){if(d[b].indexOf(c)==0){a=Math.min(d[b].substring(f),100);break}}return Math.max(0,a)}function getClassAttribute(d,c){var a=0;var f=c.length;for(var b=0;b<d.length;b++){if(d[b].indexOf(c)==0){a=1;break}}return a}function roundedRect(d,c,h,g,b,a,f){if(!f){d.beginPath()}d.moveTo(c,h+a);d.lineTo(c,h+b-a);d.quadraticCurveTo(c,h+b,c+a,h+b);d.lineTo(c+g-a,h+b);d.quadraticCurveTo(c+g,h+b,c+g,h+b-a);d.lineTo(c+g,h+a);d.quadraticCurveTo(c+g,h,c+g-a,h);d.lineTo(c+a,h);d.quadraticCurveTo(c,h,c,h+a);if(!f){d.closePath()}}function addGradient(l,j,g,k,d,b,f){var c=l.createLinearGradient(j,g,k,d);var a=(b>0?0.25:0.2);c.addColorStop(0,"rgba("+b+","+b+","+b+",0.9)");c.addColorStop(a,"rgba("+b+","+b+","+b+","+f+")");c.addColorStop(0.75,"rgba("+b+","+b+","+b+",0)");c.addColorStop(1,"rgba("+b+","+b+","+b+",0)");return c}function addRadialStyle(l,c,k,f,a,j,d,h){var g=l.createRadialGradient(c,k,f,a,j,d);var b=Math.min(parseFloat(h+0.1),1);g.addColorStop(0,"rgba(0,0,0,"+b+")");g.addColorStop(0.25,"rgba(0,0,0,"+h+")");g.addColorStop(1,"rgba(0,0,0,0)");return g}function addLinearStyle(c,a,k,b,j,d){var g=c.createLinearGradient(a,k,b,j);var f=Math.min(parseFloat(d+0.1),1);g.addColorStop(0,"rgba(0,0,0,"+f+")");g.addColorStop(0.25,"rgba(0,0,0,"+d+")");g.addColorStop(1,"rgba(0,0,0,0)");return g}function addShine(d,j,c,b,g,a){var h;var f=(a!=1?254:0);h=addGradient(d,0,b,b,b,f,g);d.beginPath();d.moveTo(0,0);d.lineTo(0,c);d.lineTo(b,c);d.lineTo(b,b);d.closePath();d.fillStyle=h;d.fill();h=addGradient(d,b,0,b,b,f,g);d.beginPath();d.moveTo(0,0);d.lineTo(j,0);d.lineTo(j,b);d.lineTo(b,b);d.closePath();d.fillStyle=h;d.fill()}function addShade(c,g,b,a,d){var f;f=addGradient(c,g,a,g-a,a,0,d);c.beginPath();c.moveTo(g,0);c.lineTo(g,b);c.lineTo(g-a,b-a);c.lineTo(g-a,0);c.closePath();c.fillStyle=f;c.fill();f=addGradient(c,a,b,a,b-a,0,d);c.beginPath();c.moveTo(g,b);c.lineTo(0,b);c.lineTo(0,b-a);c.lineTo(g-a,b-a);c.closePath();c.fillStyle=f;c.fill()}function roundedShadow(d,c,j,h,b,a,f){var g;d.beginPath();d.rect(c,j+b-a,a,a);d.closePath();g=addRadialStyle(d,c+a,j+b-a,a-c,c+a,j+b-a,a,f);d.fillStyle=g;d.fill();d.beginPath();d.rect(c+a,j+b-j,h-(a*2.25),j);d.closePath();g=addLinearStyle(d,c+a,j+b-j,c+a,j+b,f);d.fillStyle=g;d.fill();d.beginPath();d.rect(c+h-(a*1.25),j+b-(a*1.25),a*1.25,a*1.25);d.closePath();g=addRadialStyle(d,c+h-(a*1.25),j+b-(a*1.25),(a*1.25)-1.5-c,c+h-(a*1.25),j+b-(a*1.25),a*1.25,f);d.fillStyle=g;d.fill();d.beginPath();d.rect(c+h-c,j+a,c,b-(a*2.25));d.closePath();g=addLinearStyle(d,c+h-c,j+a,c+h,j+a,f);d.fillStyle=g;d.fill();d.beginPath();d.rect(c+h-a,j,a,a);d.closePath();g=addRadialStyle(d,c+h-a,j+a,a-c,c+h-a,j+a,a,f);d.fillStyle=g;d.fill()}function addIECorners(){var w=getImages("corner");var t;var L;var b;var p;var m;var A;var F="";var J=null;var a=null;var D=null;var c=null;var K="";var C=null;var k=null;var g=null;var z="";var x=null;var u=null;var r=null;var h,j,B,n,y,H,d;var f,q,o,G,l,I,E,v;for(A=0;A<w.length;A++){t=w[A];L=t.parentNode;F=t.className.split(" ");J=getClassValue(F,"iradius");a=getClassValue(F,"ishadow");D=getClassValue(F,"ishade");c=getClassAttribute(F,"inverse");K=getClasses(F,"corner");u=t.width;r=t.height;C=Math.min(u,r)/2;J=Math.min(C,J);k=4;k=(a>0?(c>0?0:Math.min(Math.max(k,J/2),16)):0);g=getRadius(J,u,r);z=(t.currentStyle.display.toLowerCase()=="block")?"block":"inline-block";b=document.createElement(['<var style="overflow:hidden;display:'+z+";width:"+u+"px;height:"+r+'px;padding:0;">'].join(""));x=t.currentStyle.styleFloat.toLowerCase();z=(x=="left"||x=="right")?"inline":z;h='<v:group style="zoom:1; display:'+z+"; margin:-1px 0 0 -1px; padding:0; position:relative; width:"+u+"px;height:"+r+'px;" coordsize="'+u+","+r+'">';y='<v:fill src="'+t.src+'" type="frame" />';H=(J>0?"</v:roundrect>":"</v:rect>");d="</v:group>";B="";n="";l="";f="";q="";o="";G="";if(J<=0){if(a>0){if(c<=0){a=a/50;k=8;v=4;B='<v:rect strokeweight="0" filled="t" stroked="f" fillcolor="#ffffff" style="position:absolute; margin:-1px 0 0 -1px;padding:0 ;width:'+u+"px;height:"+r+'px;"><v:fill color="#ffffff" opacity="0.0" /></v:rect><v:rect strokeweight="0" filled="t" stroked="f" fillcolor="#000000" style="filter:Alpha(opacity='+(a*64)+"), progid:dxImageTransform.Microsoft.Blur(PixelRadius="+v+", MakeShadow=false); zoom:1;margin:-1px 0 0 -1px;padding: 0;display:block;position:absolute;top:"+v+"px;left:"+v+"px;width:"+(u-(3*v))+"px;height:"+(r-(3*v))+'px;"><v:fill color="#000000" opacity="1" /></v:rect>';j='<v:rect strokeweight="0" filled="t" stroked="f" fillcolor="#ffffff" style="position:absolute; margin:-1px 0 0 -1px;padding:0 ;width:'+(u-k)+"px;height:"+(r-k)+'px;">'}else{if(c>0){a=a/50;J=12;E="linear";j='<v:rect filled="t" stroked="t" fillcolor="#ffffff" style="position:absolute; margin:-1px 0 0 -1px;padding:0; width:'+u+"px;height:"+r+'px;">';n='<v:stroke weight="0.5" opacity="'+(a/2)+'" color="#000000" />';q='<v:shape strokeweight="0" filled="t" stroked="f" fillcolor="#000000" coordorigin="0,0" coordsize="'+u+","+J+'" path="m 0,0 l '+u+",0,"+u+","+J+","+J+","+J+' x e" style="position:absolute; margin: -1px 0 0 -1px; top: 0px; left: 0px; width:'+u+"px; height:"+J+'px;"><v:fill method="'+E+'" type="gradient" angle="0" color="#000000" opacity="0" color2="#000000" o:opacity2="'+a+'" /></v:shape>';f='<v:shape strokeweight="0" filled="t" stroked="f" fillcolor="#000000" coordorigin="0,0" coordsize="'+J+","+r+'" path="m 0,0 l 0,'+r+","+J+","+r+","+J+","+J+' x e" style="position:absolute; margin: -1px 0 0 -1px; top: 0px; left: 0px; width:'+J+"px; height:"+r+'px;"><v:fill method="'+E+'" type="gradient" angle="90" color="#000000" opacity="0" color2="#000000" o:opacity2="'+a+'" /></v:shape>'}}}else{j='<v:rect strokeweight="0" filled="t" stroked="f" fillcolor="#ffffff" style="margin:-1px 0 0 -1px;padding:0;display:'+z+";width:"+u+"px;height:"+r+'px;">'}if(D>0){D=D/50;J=12;q='<v:shape strokeweight="0" filled="t" stroked="f" fillcolor="#ffffff" coordorigin="0,0" coordsize="'+(u-k)+","+J+'" path="m 0,0 l '+(u-k)+",0,"+(u-k)+","+J+","+J+","+J+' x e" style="position:absolute; margin: -1px 0 0 -1px; top: 0px; left: 0px; width:'+(u-k)+"px; height:"+J+'px;"><v:fill method="linear" type="gradient" angle="0" color="#ffffff" opacity="0" color2="#ffffff" o:opacity2="'+D+'" /></v:shape>';f='<v:shape strokeweight="0" filled="t" stroked="f" fillcolor="#ffffff" coordorigin="0,0" coordsize="'+J+","+(r-k)+'" path="m 0,0 l 0,'+(r-k)+","+J+","+(r-k)+","+J+","+J+' x e" style="position:absolute; margin: -1px 0 0 -1px; top: 0px; left: 0px; width:'+J+"px; height:"+(r-k)+'px;"><v:fill method="linear" type="gradient" angle="90" color="#ffffff" opacity="0" color2="#ffffff" o:opacity2="'+D+'" /></v:shape>';o='<v:shape strokeweight="0" filled="t" stroked="f" fillcolor="#000000" coordorigin="0,0" coordsize="'+(u-k)+","+J+'" path="m 0,'+J+" l "+(u-k)+","+J+","+(u-k-J)+",0,"+J+',0 x e" style="position:absolute; margin: 0; top:'+(r-k-J)+"px; left: 0px; width:"+(u-k)+"px; height:"+J+'px;"><v:fill method="linear" type="gradient" angle="180" color="#000000" opacity="0" color2="#000000" o:opacity2="'+D+'" /></v:shape>';G='<v:shape strokeweight="0" filled="t" stroked="f" fillcolor="#000000" coordorigin="0,0" coordsize="'+J+","+(r-k)+'" path="m '+J+",0 l "+J+","+(r-k)+",0,"+(r-k-J)+",0,"+J+' x e" style="position:absolute; margin: 0; top: 0px; left:'+(u-k-J)+"px; width:"+J+"px; height:"+(r-k)+'px;"><v:fill method="linear" type="gradient" angle="270" color="#000000" opacity="0" color2="#000000" o:opacity2="'+D+'" /></v:shape>'}}else{if(a>0){E="linear sigma";m=2;if(c<=0){a=a/50;v=Math.round(k*0.5);B='<v:rect strokeweight="0" filled="t" stroked="f" fillcolor="#ffffff" style="position:absolute; margin:-1px 0 0 -1px;padding:0 ;width:'+u+"px;height:"+r+'px;"><v:fill color="#ffffff" opacity="0.0" /></v:rect><v:roundrect arcsize="'+(g+v)+'" strokeweight="0" filled="t" stroked="f" fillcolor="#000000" style="filter:Alpha(opacity='+(a*64)+"), progid:dxImageTransform.Microsoft.Blur(PixelRadius="+v+", MakeShadow=false); zoom:1;margin:-1px 0 0 -1px;padding: 0;display:block;position:absolute;top:"+v+"px;left:"+v+"px;width:"+(u-(3*v))+"px;height:"+(r-(3*v))+'px;"><v:fill color="#000000" opacity="1" /></v:roundrect>';j='<v:roundrect arcsize="'+g+'" strokeweight="0" filled="t" stroked="f" fillcolor="#ffffff" style="position:absolute; margin:-1px 0 0 -1px;padding:0; width:'+(u-k)+"px;height:"+(r-k)+'px;">'}else{if(c>0){a=a/50;j='<v:roundrect arcsize="'+g+'" filled="t" stroked="t" fillcolor="#ffffff" style="position:absolute; margin:-1px 0 0 -1px;padding:0; width:'+u+"px;height:"+r+'px;">';n='<v:stroke weight="0.5" opacity="'+(a/2)+'" color="#000000" />';q='<v:shape strokeweight="0" filled="t" stroked="f" fillcolor="#000000" coordorigin="0,0" coordsize="'+u+","+J+'" path="m '+J+","+J+" l "+u+","+J+" qy "+(u-J)+",0 l "+J+',0 x e" style="position:absolute; margin: -1px 0 0 -1px; top: 0px; left: -1px; width:'+(u+1)+"px; height:"+J+'px;"><v:fill method="'+E+'" type="gradient" angle="0" color="#000000" opacity="0" color2="#000000" o:opacity2="'+a+'" /></v:shape>';f='<v:shape strokeweight="0" filled="t" stroked="f" fillcolor="#000000" coordorigin="0,0" coordsize="'+J+","+r+'" path="m 0,'+J+" l 0,"+(r-J)+" qy "+J+","+r+" l "+J+","+J+' x e" style="position:absolute; margin: -1px 0 0 -1px; top: -1px; left: 0px; width:'+J+"px; height:"+(r+1)+'px;"><v:fill method="'+E+'" type="gradient" angle="90" color="#000000" opacity="0" color2="#000000" o:opacity2="'+a+'" /></v:shape>';l='<v:shape strokeweight="0" filled="t" stroked="f" fillcolor="#000000" coordorigin="0,0" coordsize="'+J+","+J+'" path="m '+J+","+J+" l 0,"+J+" qy "+J+",0 l "+J+","+J+' x e" style="position:absolute; margin: -1px 0 0 -1px; top: 0px; left: 0px; width:'+J+"px; height:"+J+'px;"><v:fill method="'+E+'" focus="1" focusposition="1,1" focussize="0.5,0.5" type="gradientradial" color="#000000" opacity="0" color2="#000000" o:opacity2="'+a+'" /></v:shape>'}}}else{m=1;k=0;j='<v:roundrect arcsize="'+g+'" strokeweight="0" filled="t" stroked="f" fillcolor="#ffffff" style="position:absolute; margin:-1px 0 0 -1px;padding:0; width:'+u+"px;height:"+r+'px;">'}if(D>0){D=D/50;E="linear";q='<v:shape strokeweight="0" filled="t" stroked="f" fillcolor="#ffffff" coordorigin="0,0" coordsize="'+(u-k)+","+J+'" path="m '+J+","+J+" l "+(u-k)+","+J+" qy "+(u-k-J)+",0 l "+J+',0 x e" style="position:absolute; margin: -1px 0 0 -1px; top: 0px; left: -1px; width:'+(u-k+m)+"px; height:"+J+'px;"><v:fill method="'+E+'" type="gradient" angle="0" color="#ffffff" opacity="0" color2="#ffffff" o:opacity2="'+D+'" /></v:shape>';f='<v:shape strokeweight="0" filled="t" stroked="f" fillcolor="#ffffff" coordorigin="0,0" coordsize="'+J+","+(r-k)+'" path="m 0,'+J+" l 0,"+(r-J-k)+" qy "+J+","+(r-k)+" l "+J+","+J+' x e" style="position:absolute; margin: -1px 0 0 -1px; top: -1px; left: 0px; width:'+J+"px; height:"+(r-k+m)+'px;"><v:fill method="'+E+'" type="gradient" angle="90" color="#ffffff" opacity="0" color2="#ffffff" o:opacity2="'+D+'" /></v:shape>';l='<v:shape strokeweight="0" filled="t" stroked="f" fillcolor="#ffffff" coordorigin="0,0" coordsize="'+J+","+J+'" path="m '+J+","+J+" l 0,"+J+" qy "+J+",0 l "+J+","+J+' x e" style="position:absolute; margin: -1px 0 0 -1px; top: 0px; left: 0px; width:'+J+"px; height:"+J+'px;"><v:fill method="'+E+'" focus="1" focusposition="1,1" focussize="0.5,0.5" type="gradientradial" color="#ffffff" opacity="0" color2="#ffffff" o:opacity2="'+D+'" /></v:shape>'}}b.innerHTML=h+B+j+y+n+H+G+o+q+f+l+d;b.className=K;b.style.cssText=t.style.cssText;b.style.height=t.height+"px";b.style.width=t.width+"px";b.height=t.height;b.width=t.width;b.src=t.src;b.alt=t.alt;if(t.id!=""){b.id=t.id}if(t.title!=""){b.title=t.title}if(t.getAttribute("onclick")!=""){b.setAttribute("onclick",t.getAttribute("onclick"))}if(t.getAttribute("usemap")){if(J>0){m=k}else{m=0}L.style.position="relative";L.style.height=r+"px";L.style.width=u+"px";t.left=0;t.top=0;t.style.position="absolute";t.style.height=r+"px";t.style.width=u+"px";t.style.left=0+"px";t.style.top=0+"px";t.style.filter="Alpha(opacity=0)";L.insertBefore(b,t)}else{L.replaceChild(b,t)}}}function addCorners(){var p=getImages("corner");var g;var h;var d;var b;var n;var m=null;var q=null;var o=null;var l=null;var f="";var k="";var c=null;var a=null;var j=null;for(n=0;n<p.length;n++){g=p[n];h=g.parentNode;d=document.createElement("canvas");if(d.getContext){f=g.className.split(" ");m=getClassValue(f,"iradius");o=getClassValue(f,"ishadow");q=getClassValue(f,"ishade");l=getClassAttribute(f,"inverse");k=getClasses(f,"corner");d.className=k;d.style.cssText=g.style.cssText;d.style.height=g.height+"px";d.style.width=g.width+"px";d.height=g.height;d.width=g.width;d.src=g.src;d.alt=g.alt;if(g.id!=""){d.id=g.id}if(g.title!=""){d.title=g.title}if(g.getAttribute("onclick")!=""){d.setAttribute("onclick",g.getAttribute("onclick"))}c=Math.min(d.width,d.height)/2;m=Math.min(c,m);j=4;j=(o>0?(l>0?0:Math.min(Math.max(j,m/2),16)):0);b=d.getContext("2d");if(g.getAttribute("usemap")){h.style.position="relative";h.style.height=g.height+"px";h.style.width=g.width+"px";d.left=0;d.top=0;d.style.position="absolute";d.style.left=0+"px";d.style.top=0+"px";g.left=0;g.top=0;g.style.position="absolute";g.style.height=g.height+"px";g.style.width=g.width+"px";g.style.left=0+"px";g.style.top=0+"px";g.style.opacity=0;h.insertBefore(d,g)}else{h.replaceChild(d,g)}b.clearRect(0,0,d.width,d.height);b.save();if(o>0&&l<=0){o=o/100;if(m>0){roundedShadow(b,j,j,d.width-j,d.height-j,m,o)}else{j=8;roundedShadow(b,j,j,d.width-j,d.height-j,j,o)}}if(m<=0){b.beginPath();b.rect(0,0,d.width-j,d.height-j);b.closePath()}else{roundedRect(b,0,0,d.width-j,d.height-j,m)}b.clip();b.fillStyle="rgba(0,0,0,0)";b.fillRect(0,0,d.width,d.height);b.drawImage(g,0,0,d.width-j,d.height-j);if(o>0&&l>0){o=o/100;if(m>0){addShine(b,d.width,d.height,m,o,1);roundedRect(b,0,0,d.width,d.height,m)}else{m=16;addShine(b,d.width,d.height,m,o,1);b.beginPath();b.rect(0,0,d.width,d.height);b.closePath()}b.strokeStyle="rgba(0,0,0,"+o+")";b.lineWidth=2;b.stroke()}if(q>0){q=q/100;if(m<=0){m=16}addShade(b,d.width-j,d.height-j,m,q);addShine(b,d.width-j,d.height-j,m,q)}d.style.visibility="visible"}}}if(window.addEventListener){window.addEventListener("load",addCorners,false)}else{window.attachEvent("onload",addIECorners)};

/*! jQuery UI - v1.10.4 - 2014-04-01
* http://jqueryui.com
* Includes: jquery.ui.core.js, jquery.ui.widget.js, jquery.ui.mouse.js, jquery.ui.position.js, jquery.ui.draggable.js, jquery.ui.droppable.js, jquery.ui.resizable.js, jquery.ui.selectable.js, jquery.ui.sortable.js, jquery.ui.datepicker.js
* Copyright 2014 jQuery Foundation and other contributors; Licensed MIT */

(function(e,t){function i(t,i){var s,a,o,r=t.nodeName.toLowerCase();return"area"===r?(s=t.parentNode,a=s.name,t.href&&a&&"map"===s.nodeName.toLowerCase()?(o=e("img[usemap=#"+a+"]")[0],!!o&&n(o)):!1):(/input|select|textarea|button|object/.test(r)?!t.disabled:"a"===r?t.href||i:i)&&n(t)}function n(t){return e.expr.filters.visible(t)&&!e(t).parents().addBack().filter(function(){return"hidden"===e.css(this,"visibility")}).length}var s=0,a=/^ui-id-\d+$/;e.ui=e.ui||{},e.extend(e.ui,{version:"1.10.4",keyCode:{BACKSPACE:8,COMMA:188,DELETE:46,DOWN:40,END:35,ENTER:13,ESCAPE:27,HOME:36,LEFT:37,NUMPAD_ADD:107,NUMPAD_DECIMAL:110,NUMPAD_DIVIDE:111,NUMPAD_ENTER:108,NUMPAD_MULTIPLY:106,NUMPAD_SUBTRACT:109,PAGE_DOWN:34,PAGE_UP:33,PERIOD:190,RIGHT:39,SPACE:32,TAB:9,UP:38}}),e.fn.extend({focus:function(t){return function(i,n){return"number"==typeof i?this.each(function(){var t=this;setTimeout(function(){e(t).focus(),n&&n.call(t)},i)}):t.apply(this,arguments)}}(e.fn.focus),scrollParent:function(){var t;return t=e.ui.ie&&/(static|relative)/.test(this.css("position"))||/absolute/.test(this.css("position"))?this.parents().filter(function(){return/(relative|absolute|fixed)/.test(e.css(this,"position"))&&/(auto|scroll)/.test(e.css(this,"overflow")+e.css(this,"overflow-y")+e.css(this,"overflow-x"))}).eq(0):this.parents().filter(function(){return/(auto|scroll)/.test(e.css(this,"overflow")+e.css(this,"overflow-y")+e.css(this,"overflow-x"))}).eq(0),/fixed/.test(this.css("position"))||!t.length?e(document):t},zIndex:function(i){if(i!==t)return this.css("zIndex",i);if(this.length)for(var n,s,a=e(this[0]);a.length&&a[0]!==document;){if(n=a.css("position"),("absolute"===n||"relative"===n||"fixed"===n)&&(s=parseInt(a.css("zIndex"),10),!isNaN(s)&&0!==s))return s;a=a.parent()}return 0},uniqueId:function(){return this.each(function(){this.id||(this.id="ui-id-"+ ++s)})},removeUniqueId:function(){return this.each(function(){a.test(this.id)&&e(this).removeAttr("id")})}}),e.extend(e.expr[":"],{data:e.expr.createPseudo?e.expr.createPseudo(function(t){return function(i){return!!e.data(i,t)}}):function(t,i,n){return!!e.data(t,n[3])},focusable:function(t){return i(t,!isNaN(e.attr(t,"tabindex")))},tabbable:function(t){var n=e.attr(t,"tabindex"),s=isNaN(n);return(s||n>=0)&&i(t,!s)}}),e("<a>").outerWidth(1).jquery||e.each(["Width","Height"],function(i,n){function s(t,i,n,s){return e.each(a,function(){i-=parseFloat(e.css(t,"padding"+this))||0,n&&(i-=parseFloat(e.css(t,"border"+this+"Width"))||0),s&&(i-=parseFloat(e.css(t,"margin"+this))||0)}),i}var a="Width"===n?["Left","Right"]:["Top","Bottom"],o=n.toLowerCase(),r={innerWidth:e.fn.innerWidth,innerHeight:e.fn.innerHeight,outerWidth:e.fn.outerWidth,outerHeight:e.fn.outerHeight};e.fn["inner"+n]=function(i){return i===t?r["inner"+n].call(this):this.each(function(){e(this).css(o,s(this,i)+"px")})},e.fn["outer"+n]=function(t,i){return"number"!=typeof t?r["outer"+n].call(this,t):this.each(function(){e(this).css(o,s(this,t,!0,i)+"px")})}}),e.fn.addBack||(e.fn.addBack=function(e){return this.add(null==e?this.prevObject:this.prevObject.filter(e))}),e("<a>").data("a-b","a").removeData("a-b").data("a-b")&&(e.fn.removeData=function(t){return function(i){return arguments.length?t.call(this,e.camelCase(i)):t.call(this)}}(e.fn.removeData)),e.ui.ie=!!/msie [\w.]+/.exec(navigator.userAgent.toLowerCase()),e.support.selectstart="onselectstart"in document.createElement("div"),e.fn.extend({disableSelection:function(){return this.bind((e.support.selectstart?"selectstart":"mousedown")+".ui-disableSelection",function(e){e.preventDefault()})},enableSelection:function(){return this.unbind(".ui-disableSelection")}}),e.extend(e.ui,{plugin:{add:function(t,i,n){var s,a=e.ui[t].prototype;for(s in n)a.plugins[s]=a.plugins[s]||[],a.plugins[s].push([i,n[s]])},call:function(e,t,i){var n,s=e.plugins[t];if(s&&e.element[0].parentNode&&11!==e.element[0].parentNode.nodeType)for(n=0;s.length>n;n++)e.options[s[n][0]]&&s[n][1].apply(e.element,i)}},hasScroll:function(t,i){if("hidden"===e(t).css("overflow"))return!1;var n=i&&"left"===i?"scrollLeft":"scrollTop",s=!1;return t[n]>0?!0:(t[n]=1,s=t[n]>0,t[n]=0,s)}})})(jQuery);(function(t,e){var i=0,s=Array.prototype.slice,n=t.cleanData;t.cleanData=function(e){for(var i,s=0;null!=(i=e[s]);s++)try{t(i).triggerHandler("remove")}catch(o){}n(e)},t.widget=function(i,s,n){var o,a,r,h,l={},c=i.split(".")[0];i=i.split(".")[1],o=c+"-"+i,n||(n=s,s=t.Widget),t.expr[":"][o.toLowerCase()]=function(e){return!!t.data(e,o)},t[c]=t[c]||{},a=t[c][i],r=t[c][i]=function(t,i){return this._createWidget?(arguments.length&&this._createWidget(t,i),e):new r(t,i)},t.extend(r,a,{version:n.version,_proto:t.extend({},n),_childConstructors:[]}),h=new s,h.options=t.widget.extend({},h.options),t.each(n,function(i,n){return t.isFunction(n)?(l[i]=function(){var t=function(){return s.prototype[i].apply(this,arguments)},e=function(t){return s.prototype[i].apply(this,t)};return function(){var i,s=this._super,o=this._superApply;return this._super=t,this._superApply=e,i=n.apply(this,arguments),this._super=s,this._superApply=o,i}}(),e):(l[i]=n,e)}),r.prototype=t.widget.extend(h,{widgetEventPrefix:a?h.widgetEventPrefix||i:i},l,{constructor:r,namespace:c,widgetName:i,widgetFullName:o}),a?(t.each(a._childConstructors,function(e,i){var s=i.prototype;t.widget(s.namespace+"."+s.widgetName,r,i._proto)}),delete a._childConstructors):s._childConstructors.push(r),t.widget.bridge(i,r)},t.widget.extend=function(i){for(var n,o,a=s.call(arguments,1),r=0,h=a.length;h>r;r++)for(n in a[r])o=a[r][n],a[r].hasOwnProperty(n)&&o!==e&&(i[n]=t.isPlainObject(o)?t.isPlainObject(i[n])?t.widget.extend({},i[n],o):t.widget.extend({},o):o);return i},t.widget.bridge=function(i,n){var o=n.prototype.widgetFullName||i;t.fn[i]=function(a){var r="string"==typeof a,h=s.call(arguments,1),l=this;return a=!r&&h.length?t.widget.extend.apply(null,[a].concat(h)):a,r?this.each(function(){var s,n=t.data(this,o);return n?t.isFunction(n[a])&&"_"!==a.charAt(0)?(s=n[a].apply(n,h),s!==n&&s!==e?(l=s&&s.jquery?l.pushStack(s.get()):s,!1):e):t.error("no such method '"+a+"' for "+i+" widget instance"):t.error("cannot call methods on "+i+" prior to initialization; "+"attempted to call method '"+a+"'")}):this.each(function(){var e=t.data(this,o);e?e.option(a||{})._init():t.data(this,o,new n(a,this))}),l}},t.Widget=function(){},t.Widget._childConstructors=[],t.Widget.prototype={widgetName:"widget",widgetEventPrefix:"",defaultElement:"<div>",options:{disabled:!1,create:null},_createWidget:function(e,s){s=t(s||this.defaultElement||this)[0],this.element=t(s),this.uuid=i++,this.eventNamespace="."+this.widgetName+this.uuid,this.options=t.widget.extend({},this.options,this._getCreateOptions(),e),this.bindings=t(),this.hoverable=t(),this.focusable=t(),s!==this&&(t.data(s,this.widgetFullName,this),this._on(!0,this.element,{remove:function(t){t.target===s&&this.destroy()}}),this.document=t(s.style?s.ownerDocument:s.document||s),this.window=t(this.document[0].defaultView||this.document[0].parentWindow)),this._create(),this._trigger("create",null,this._getCreateEventData()),this._init()},_getCreateOptions:t.noop,_getCreateEventData:t.noop,_create:t.noop,_init:t.noop,destroy:function(){this._destroy(),this.element.unbind(this.eventNamespace).removeData(this.widgetName).removeData(this.widgetFullName).removeData(t.camelCase(this.widgetFullName)),this.widget().unbind(this.eventNamespace).removeAttr("aria-disabled").removeClass(this.widgetFullName+"-disabled "+"ui-state-disabled"),this.bindings.unbind(this.eventNamespace),this.hoverable.removeClass("ui-state-hover"),this.focusable.removeClass("ui-state-focus")},_destroy:t.noop,widget:function(){return this.element},option:function(i,s){var n,o,a,r=i;if(0===arguments.length)return t.widget.extend({},this.options);if("string"==typeof i)if(r={},n=i.split("."),i=n.shift(),n.length){for(o=r[i]=t.widget.extend({},this.options[i]),a=0;n.length-1>a;a++)o[n[a]]=o[n[a]]||{},o=o[n[a]];if(i=n.pop(),1===arguments.length)return o[i]===e?null:o[i];o[i]=s}else{if(1===arguments.length)return this.options[i]===e?null:this.options[i];r[i]=s}return this._setOptions(r),this},_setOptions:function(t){var e;for(e in t)this._setOption(e,t[e]);return this},_setOption:function(t,e){return this.options[t]=e,"disabled"===t&&(this.widget().toggleClass(this.widgetFullName+"-disabled ui-state-disabled",!!e).attr("aria-disabled",e),this.hoverable.removeClass("ui-state-hover"),this.focusable.removeClass("ui-state-focus")),this},enable:function(){return this._setOption("disabled",!1)},disable:function(){return this._setOption("disabled",!0)},_on:function(i,s,n){var o,a=this;"boolean"!=typeof i&&(n=s,s=i,i=!1),n?(s=o=t(s),this.bindings=this.bindings.add(s)):(n=s,s=this.element,o=this.widget()),t.each(n,function(n,r){function h(){return i||a.options.disabled!==!0&&!t(this).hasClass("ui-state-disabled")?("string"==typeof r?a[r]:r).apply(a,arguments):e}"string"!=typeof r&&(h.guid=r.guid=r.guid||h.guid||t.guid++);var l=n.match(/^(\w+)\s*(.*)$/),c=l[1]+a.eventNamespace,u=l[2];u?o.delegate(u,c,h):s.bind(c,h)})},_off:function(t,e){e=(e||"").split(" ").join(this.eventNamespace+" ")+this.eventNamespace,t.unbind(e).undelegate(e)},_delay:function(t,e){function i(){return("string"==typeof t?s[t]:t).apply(s,arguments)}var s=this;return setTimeout(i,e||0)},_hoverable:function(e){this.hoverable=this.hoverable.add(e),this._on(e,{mouseenter:function(e){t(e.currentTarget).addClass("ui-state-hover")},mouseleave:function(e){t(e.currentTarget).removeClass("ui-state-hover")}})},_focusable:function(e){this.focusable=this.focusable.add(e),this._on(e,{focusin:function(e){t(e.currentTarget).addClass("ui-state-focus")},focusout:function(e){t(e.currentTarget).removeClass("ui-state-focus")}})},_trigger:function(e,i,s){var n,o,a=this.options[e];if(s=s||{},i=t.Event(i),i.type=(e===this.widgetEventPrefix?e:this.widgetEventPrefix+e).toLowerCase(),i.target=this.element[0],o=i.originalEvent)for(n in o)n in i||(i[n]=o[n]);return this.element.trigger(i,s),!(t.isFunction(a)&&a.apply(this.element[0],[i].concat(s))===!1||i.isDefaultPrevented())}},t.each({show:"fadeIn",hide:"fadeOut"},function(e,i){t.Widget.prototype["_"+e]=function(s,n,o){"string"==typeof n&&(n={effect:n});var a,r=n?n===!0||"number"==typeof n?i:n.effect||i:e;n=n||{},"number"==typeof n&&(n={duration:n}),a=!t.isEmptyObject(n),n.complete=o,n.delay&&s.delay(n.delay),a&&t.effects&&t.effects.effect[r]?s[e](n):r!==e&&s[r]?s[r](n.duration,n.easing,o):s.queue(function(i){t(this)[e](),o&&o.call(s[0]),i()})}})})(jQuery);(function(t){var e=!1;t(document).mouseup(function(){e=!1}),t.widget("ui.mouse",{version:"1.10.4",options:{cancel:"input,textarea,button,select,option",distance:1,delay:0},_mouseInit:function(){var e=this;this.element.bind("mousedown."+this.widgetName,function(t){return e._mouseDown(t)}).bind("click."+this.widgetName,function(i){return!0===t.data(i.target,e.widgetName+".preventClickEvent")?(t.removeData(i.target,e.widgetName+".preventClickEvent"),i.stopImmediatePropagation(),!1):undefined}),this.started=!1},_mouseDestroy:function(){this.element.unbind("."+this.widgetName),this._mouseMoveDelegate&&t(document).unbind("mousemove."+this.widgetName,this._mouseMoveDelegate).unbind("mouseup."+this.widgetName,this._mouseUpDelegate)},_mouseDown:function(i){if(!e){this._mouseStarted&&this._mouseUp(i),this._mouseDownEvent=i;var s=this,n=1===i.which,a="string"==typeof this.options.cancel&&i.target.nodeName?t(i.target).closest(this.options.cancel).length:!1;return n&&!a&&this._mouseCapture(i)?(this.mouseDelayMet=!this.options.delay,this.mouseDelayMet||(this._mouseDelayTimer=setTimeout(function(){s.mouseDelayMet=!0},this.options.delay)),this._mouseDistanceMet(i)&&this._mouseDelayMet(i)&&(this._mouseStarted=this._mouseStart(i)!==!1,!this._mouseStarted)?(i.preventDefault(),!0):(!0===t.data(i.target,this.widgetName+".preventClickEvent")&&t.removeData(i.target,this.widgetName+".preventClickEvent"),this._mouseMoveDelegate=function(t){return s._mouseMove(t)},this._mouseUpDelegate=function(t){return s._mouseUp(t)},t(document).bind("mousemove."+this.widgetName,this._mouseMoveDelegate).bind("mouseup."+this.widgetName,this._mouseUpDelegate),i.preventDefault(),e=!0,!0)):!0}},_mouseMove:function(e){return t.ui.ie&&(!document.documentMode||9>document.documentMode)&&!e.button?this._mouseUp(e):this._mouseStarted?(this._mouseDrag(e),e.preventDefault()):(this._mouseDistanceMet(e)&&this._mouseDelayMet(e)&&(this._mouseStarted=this._mouseStart(this._mouseDownEvent,e)!==!1,this._mouseStarted?this._mouseDrag(e):this._mouseUp(e)),!this._mouseStarted)},_mouseUp:function(e){return t(document).unbind("mousemove."+this.widgetName,this._mouseMoveDelegate).unbind("mouseup."+this.widgetName,this._mouseUpDelegate),this._mouseStarted&&(this._mouseStarted=!1,e.target===this._mouseDownEvent.target&&t.data(e.target,this.widgetName+".preventClickEvent",!0),this._mouseStop(e)),!1},_mouseDistanceMet:function(t){return Math.max(Math.abs(this._mouseDownEvent.pageX-t.pageX),Math.abs(this._mouseDownEvent.pageY-t.pageY))>=this.options.distance},_mouseDelayMet:function(){return this.mouseDelayMet},_mouseStart:function(){},_mouseDrag:function(){},_mouseStop:function(){},_mouseCapture:function(){return!0}})})(jQuery);(function(t,e){function i(t,e,i){return[parseFloat(t[0])*(p.test(t[0])?e/100:1),parseFloat(t[1])*(p.test(t[1])?i/100:1)]}function s(e,i){return parseInt(t.css(e,i),10)||0}function n(e){var i=e[0];return 9===i.nodeType?{width:e.width(),height:e.height(),offset:{top:0,left:0}}:t.isWindow(i)?{width:e.width(),height:e.height(),offset:{top:e.scrollTop(),left:e.scrollLeft()}}:i.preventDefault?{width:0,height:0,offset:{top:i.pageY,left:i.pageX}}:{width:e.outerWidth(),height:e.outerHeight(),offset:e.offset()}}t.ui=t.ui||{};var a,o=Math.max,r=Math.abs,l=Math.round,h=/left|center|right/,c=/top|center|bottom/,u=/[\+\-]\d+(\.[\d]+)?%?/,d=/^\w+/,p=/%$/,f=t.fn.position;t.position={scrollbarWidth:function(){if(a!==e)return a;var i,s,n=t("<div style='display:block;position:absolute;width:50px;height:50px;overflow:hidden;'><div style='height:100px;width:auto;'></div></div>"),o=n.children()[0];return t("body").append(n),i=o.offsetWidth,n.css("overflow","scroll"),s=o.offsetWidth,i===s&&(s=n[0].clientWidth),n.remove(),a=i-s},getScrollInfo:function(e){var i=e.isWindow||e.isDocument?"":e.element.css("overflow-x"),s=e.isWindow||e.isDocument?"":e.element.css("overflow-y"),n="scroll"===i||"auto"===i&&e.width<e.element[0].scrollWidth,a="scroll"===s||"auto"===s&&e.height<e.element[0].scrollHeight;return{width:a?t.position.scrollbarWidth():0,height:n?t.position.scrollbarWidth():0}},getWithinInfo:function(e){var i=t(e||window),s=t.isWindow(i[0]),n=!!i[0]&&9===i[0].nodeType;return{element:i,isWindow:s,isDocument:n,offset:i.offset()||{left:0,top:0},scrollLeft:i.scrollLeft(),scrollTop:i.scrollTop(),width:s?i.width():i.outerWidth(),height:s?i.height():i.outerHeight()}}},t.fn.position=function(e){if(!e||!e.of)return f.apply(this,arguments);e=t.extend({},e);var a,p,g,m,v,_,b=t(e.of),y=t.position.getWithinInfo(e.within),k=t.position.getScrollInfo(y),w=(e.collision||"flip").split(" "),D={};return _=n(b),b[0].preventDefault&&(e.at="left top"),p=_.width,g=_.height,m=_.offset,v=t.extend({},m),t.each(["my","at"],function(){var t,i,s=(e[this]||"").split(" ");1===s.length&&(s=h.test(s[0])?s.concat(["center"]):c.test(s[0])?["center"].concat(s):["center","center"]),s[0]=h.test(s[0])?s[0]:"center",s[1]=c.test(s[1])?s[1]:"center",t=u.exec(s[0]),i=u.exec(s[1]),D[this]=[t?t[0]:0,i?i[0]:0],e[this]=[d.exec(s[0])[0],d.exec(s[1])[0]]}),1===w.length&&(w[1]=w[0]),"right"===e.at[0]?v.left+=p:"center"===e.at[0]&&(v.left+=p/2),"bottom"===e.at[1]?v.top+=g:"center"===e.at[1]&&(v.top+=g/2),a=i(D.at,p,g),v.left+=a[0],v.top+=a[1],this.each(function(){var n,h,c=t(this),u=c.outerWidth(),d=c.outerHeight(),f=s(this,"marginLeft"),_=s(this,"marginTop"),x=u+f+s(this,"marginRight")+k.width,C=d+_+s(this,"marginBottom")+k.height,M=t.extend({},v),T=i(D.my,c.outerWidth(),c.outerHeight());"right"===e.my[0]?M.left-=u:"center"===e.my[0]&&(M.left-=u/2),"bottom"===e.my[1]?M.top-=d:"center"===e.my[1]&&(M.top-=d/2),M.left+=T[0],M.top+=T[1],t.support.offsetFractions||(M.left=l(M.left),M.top=l(M.top)),n={marginLeft:f,marginTop:_},t.each(["left","top"],function(i,s){t.ui.position[w[i]]&&t.ui.position[w[i]][s](M,{targetWidth:p,targetHeight:g,elemWidth:u,elemHeight:d,collisionPosition:n,collisionWidth:x,collisionHeight:C,offset:[a[0]+T[0],a[1]+T[1]],my:e.my,at:e.at,within:y,elem:c})}),e.using&&(h=function(t){var i=m.left-M.left,s=i+p-u,n=m.top-M.top,a=n+g-d,l={target:{element:b,left:m.left,top:m.top,width:p,height:g},element:{element:c,left:M.left,top:M.top,width:u,height:d},horizontal:0>s?"left":i>0?"right":"center",vertical:0>a?"top":n>0?"bottom":"middle"};u>p&&p>r(i+s)&&(l.horizontal="center"),d>g&&g>r(n+a)&&(l.vertical="middle"),l.important=o(r(i),r(s))>o(r(n),r(a))?"horizontal":"vertical",e.using.call(this,t,l)}),c.offset(t.extend(M,{using:h}))})},t.ui.position={fit:{left:function(t,e){var i,s=e.within,n=s.isWindow?s.scrollLeft:s.offset.left,a=s.width,r=t.left-e.collisionPosition.marginLeft,l=n-r,h=r+e.collisionWidth-a-n;e.collisionWidth>a?l>0&&0>=h?(i=t.left+l+e.collisionWidth-a-n,t.left+=l-i):t.left=h>0&&0>=l?n:l>h?n+a-e.collisionWidth:n:l>0?t.left+=l:h>0?t.left-=h:t.left=o(t.left-r,t.left)},top:function(t,e){var i,s=e.within,n=s.isWindow?s.scrollTop:s.offset.top,a=e.within.height,r=t.top-e.collisionPosition.marginTop,l=n-r,h=r+e.collisionHeight-a-n;e.collisionHeight>a?l>0&&0>=h?(i=t.top+l+e.collisionHeight-a-n,t.top+=l-i):t.top=h>0&&0>=l?n:l>h?n+a-e.collisionHeight:n:l>0?t.top+=l:h>0?t.top-=h:t.top=o(t.top-r,t.top)}},flip:{left:function(t,e){var i,s,n=e.within,a=n.offset.left+n.scrollLeft,o=n.width,l=n.isWindow?n.scrollLeft:n.offset.left,h=t.left-e.collisionPosition.marginLeft,c=h-l,u=h+e.collisionWidth-o-l,d="left"===e.my[0]?-e.elemWidth:"right"===e.my[0]?e.elemWidth:0,p="left"===e.at[0]?e.targetWidth:"right"===e.at[0]?-e.targetWidth:0,f=-2*e.offset[0];0>c?(i=t.left+d+p+f+e.collisionWidth-o-a,(0>i||r(c)>i)&&(t.left+=d+p+f)):u>0&&(s=t.left-e.collisionPosition.marginLeft+d+p+f-l,(s>0||u>r(s))&&(t.left+=d+p+f))},top:function(t,e){var i,s,n=e.within,a=n.offset.top+n.scrollTop,o=n.height,l=n.isWindow?n.scrollTop:n.offset.top,h=t.top-e.collisionPosition.marginTop,c=h-l,u=h+e.collisionHeight-o-l,d="top"===e.my[1],p=d?-e.elemHeight:"bottom"===e.my[1]?e.elemHeight:0,f="top"===e.at[1]?e.targetHeight:"bottom"===e.at[1]?-e.targetHeight:0,g=-2*e.offset[1];0>c?(s=t.top+p+f+g+e.collisionHeight-o-a,t.top+p+f+g>c&&(0>s||r(c)>s)&&(t.top+=p+f+g)):u>0&&(i=t.top-e.collisionPosition.marginTop+p+f+g-l,t.top+p+f+g>u&&(i>0||u>r(i))&&(t.top+=p+f+g))}},flipfit:{left:function(){t.ui.position.flip.left.apply(this,arguments),t.ui.position.fit.left.apply(this,arguments)},top:function(){t.ui.position.flip.top.apply(this,arguments),t.ui.position.fit.top.apply(this,arguments)}}},function(){var e,i,s,n,a,o=document.getElementsByTagName("body")[0],r=document.createElement("div");e=document.createElement(o?"div":"body"),s={visibility:"hidden",width:0,height:0,border:0,margin:0,background:"none"},o&&t.extend(s,{position:"absolute",left:"-1000px",top:"-1000px"});for(a in s)e.style[a]=s[a];e.appendChild(r),i=o||document.documentElement,i.insertBefore(e,i.firstChild),r.style.cssText="position: absolute; left: 10.7432222px;",n=t(r).offset().left,t.support.offsetFractions=n>10&&11>n,e.innerHTML="",i.removeChild(e)}()})(jQuery);(function(t){t.widget("ui.draggable",t.ui.mouse,{version:"1.10.4",widgetEventPrefix:"drag",options:{addClasses:!0,appendTo:"parent",axis:!1,connectToSortable:!1,containment:!1,cursor:"auto",cursorAt:!1,grid:!1,handle:!1,helper:"original",iframeFix:!1,opacity:!1,refreshPositions:!1,revert:!1,revertDuration:500,scope:"default",scroll:!0,scrollSensitivity:20,scrollSpeed:20,snap:!1,snapMode:"both",snapTolerance:20,stack:!1,zIndex:!1,drag:null,start:null,stop:null},_create:function(){"original"!==this.options.helper||/^(?:r|a|f)/.test(this.element.css("position"))||(this.element[0].style.position="relative"),this.options.addClasses&&this.element.addClass("ui-draggable"),this.options.disabled&&this.element.addClass("ui-draggable-disabled"),this._mouseInit()},_destroy:function(){this.element.removeClass("ui-draggable ui-draggable-dragging ui-draggable-disabled"),this._mouseDestroy()},_mouseCapture:function(e){var i=this.options;return this.helper||i.disabled||t(e.target).closest(".ui-resizable-handle").length>0?!1:(this.handle=this._getHandle(e),this.handle?(t(i.iframeFix===!0?"iframe":i.iframeFix).each(function(){t("<div class='ui-draggable-iframeFix' style='background: #fff;'></div>").css({width:this.offsetWidth+"px",height:this.offsetHeight+"px",position:"absolute",opacity:"0.001",zIndex:1e3}).css(t(this).offset()).appendTo("body")}),!0):!1)},_mouseStart:function(e){var i=this.options;return this.helper=this._createHelper(e),this.helper.addClass("ui-draggable-dragging"),this._cacheHelperProportions(),t.ui.ddmanager&&(t.ui.ddmanager.current=this),this._cacheMargins(),this.cssPosition=this.helper.css("position"),this.scrollParent=this.helper.scrollParent(),this.offsetParent=this.helper.offsetParent(),this.offsetParentCssPosition=this.offsetParent.css("position"),this.offset=this.positionAbs=this.element.offset(),this.offset={top:this.offset.top-this.margins.top,left:this.offset.left-this.margins.left},this.offset.scroll=!1,t.extend(this.offset,{click:{left:e.pageX-this.offset.left,top:e.pageY-this.offset.top},parent:this._getParentOffset(),relative:this._getRelativeOffset()}),this.originalPosition=this.position=this._generatePosition(e),this.originalPageX=e.pageX,this.originalPageY=e.pageY,i.cursorAt&&this._adjustOffsetFromHelper(i.cursorAt),this._setContainment(),this._trigger("start",e)===!1?(this._clear(),!1):(this._cacheHelperProportions(),t.ui.ddmanager&&!i.dropBehaviour&&t.ui.ddmanager.prepareOffsets(this,e),this._mouseDrag(e,!0),t.ui.ddmanager&&t.ui.ddmanager.dragStart(this,e),!0)},_mouseDrag:function(e,i){if("fixed"===this.offsetParentCssPosition&&(this.offset.parent=this._getParentOffset()),this.position=this._generatePosition(e),this.positionAbs=this._convertPositionTo("absolute"),!i){var s=this._uiHash();if(this._trigger("drag",e,s)===!1)return this._mouseUp({}),!1;this.position=s.position}return this.options.axis&&"y"===this.options.axis||(this.helper[0].style.left=this.position.left+"px"),this.options.axis&&"x"===this.options.axis||(this.helper[0].style.top=this.position.top+"px"),t.ui.ddmanager&&t.ui.ddmanager.drag(this,e),!1},_mouseStop:function(e){var i=this,s=!1;return t.ui.ddmanager&&!this.options.dropBehaviour&&(s=t.ui.ddmanager.drop(this,e)),this.dropped&&(s=this.dropped,this.dropped=!1),"original"!==this.options.helper||t.contains(this.element[0].ownerDocument,this.element[0])?("invalid"===this.options.revert&&!s||"valid"===this.options.revert&&s||this.options.revert===!0||t.isFunction(this.options.revert)&&this.options.revert.call(this.element,s)?t(this.helper).animate(this.originalPosition,parseInt(this.options.revertDuration,10),function(){i._trigger("stop",e)!==!1&&i._clear()}):this._trigger("stop",e)!==!1&&this._clear(),!1):!1},_mouseUp:function(e){return t("div.ui-draggable-iframeFix").each(function(){this.parentNode.removeChild(this)}),t.ui.ddmanager&&t.ui.ddmanager.dragStop(this,e),t.ui.mouse.prototype._mouseUp.call(this,e)},cancel:function(){return this.helper.is(".ui-draggable-dragging")?this._mouseUp({}):this._clear(),this},_getHandle:function(e){return this.options.handle?!!t(e.target).closest(this.element.find(this.options.handle)).length:!0},_createHelper:function(e){var i=this.options,s=t.isFunction(i.helper)?t(i.helper.apply(this.element[0],[e])):"clone"===i.helper?this.element.clone().removeAttr("id"):this.element;return s.parents("body").length||s.appendTo("parent"===i.appendTo?this.element[0].parentNode:i.appendTo),s[0]===this.element[0]||/(fixed|absolute)/.test(s.css("position"))||s.css("position","absolute"),s},_adjustOffsetFromHelper:function(e){"string"==typeof e&&(e=e.split(" ")),t.isArray(e)&&(e={left:+e[0],top:+e[1]||0}),"left"in e&&(this.offset.click.left=e.left+this.margins.left),"right"in e&&(this.offset.click.left=this.helperProportions.width-e.right+this.margins.left),"top"in e&&(this.offset.click.top=e.top+this.margins.top),"bottom"in e&&(this.offset.click.top=this.helperProportions.height-e.bottom+this.margins.top)},_getParentOffset:function(){var e=this.offsetParent.offset();return"absolute"===this.cssPosition&&this.scrollParent[0]!==document&&t.contains(this.scrollParent[0],this.offsetParent[0])&&(e.left+=this.scrollParent.scrollLeft(),e.top+=this.scrollParent.scrollTop()),(this.offsetParent[0]===document.body||this.offsetParent[0].tagName&&"html"===this.offsetParent[0].tagName.toLowerCase()&&t.ui.ie)&&(e={top:0,left:0}),{top:e.top+(parseInt(this.offsetParent.css("borderTopWidth"),10)||0),left:e.left+(parseInt(this.offsetParent.css("borderLeftWidth"),10)||0)}},_getRelativeOffset:function(){if("relative"===this.cssPosition){var t=this.element.position();return{top:t.top-(parseInt(this.helper.css("top"),10)||0)+this.scrollParent.scrollTop(),left:t.left-(parseInt(this.helper.css("left"),10)||0)+this.scrollParent.scrollLeft()}}return{top:0,left:0}},_cacheMargins:function(){this.margins={left:parseInt(this.element.css("marginLeft"),10)||0,top:parseInt(this.element.css("marginTop"),10)||0,right:parseInt(this.element.css("marginRight"),10)||0,bottom:parseInt(this.element.css("marginBottom"),10)||0}},_cacheHelperProportions:function(){this.helperProportions={width:this.helper.outerWidth(),height:this.helper.outerHeight()}},_setContainment:function(){var e,i,s,n=this.options;return n.containment?"window"===n.containment?(this.containment=[t(window).scrollLeft()-this.offset.relative.left-this.offset.parent.left,t(window).scrollTop()-this.offset.relative.top-this.offset.parent.top,t(window).scrollLeft()+t(window).width()-this.helperProportions.width-this.margins.left,t(window).scrollTop()+(t(window).height()||document.body.parentNode.scrollHeight)-this.helperProportions.height-this.margins.top],undefined):"document"===n.containment?(this.containment=[0,0,t(document).width()-this.helperProportions.width-this.margins.left,(t(document).height()||document.body.parentNode.scrollHeight)-this.helperProportions.height-this.margins.top],undefined):n.containment.constructor===Array?(this.containment=n.containment,undefined):("parent"===n.containment&&(n.containment=this.helper[0].parentNode),i=t(n.containment),s=i[0],s&&(e="hidden"!==i.css("overflow"),this.containment=[(parseInt(i.css("borderLeftWidth"),10)||0)+(parseInt(i.css("paddingLeft"),10)||0),(parseInt(i.css("borderTopWidth"),10)||0)+(parseInt(i.css("paddingTop"),10)||0),(e?Math.max(s.scrollWidth,s.offsetWidth):s.offsetWidth)-(parseInt(i.css("borderRightWidth"),10)||0)-(parseInt(i.css("paddingRight"),10)||0)-this.helperProportions.width-this.margins.left-this.margins.right,(e?Math.max(s.scrollHeight,s.offsetHeight):s.offsetHeight)-(parseInt(i.css("borderBottomWidth"),10)||0)-(parseInt(i.css("paddingBottom"),10)||0)-this.helperProportions.height-this.margins.top-this.margins.bottom],this.relative_container=i),undefined):(this.containment=null,undefined)},_convertPositionTo:function(e,i){i||(i=this.position);var s="absolute"===e?1:-1,n="absolute"!==this.cssPosition||this.scrollParent[0]!==document&&t.contains(this.scrollParent[0],this.offsetParent[0])?this.scrollParent:this.offsetParent;return this.offset.scroll||(this.offset.scroll={top:n.scrollTop(),left:n.scrollLeft()}),{top:i.top+this.offset.relative.top*s+this.offset.parent.top*s-("fixed"===this.cssPosition?-this.scrollParent.scrollTop():this.offset.scroll.top)*s,left:i.left+this.offset.relative.left*s+this.offset.parent.left*s-("fixed"===this.cssPosition?-this.scrollParent.scrollLeft():this.offset.scroll.left)*s}},_generatePosition:function(e){var i,s,n,a,o=this.options,r="absolute"!==this.cssPosition||this.scrollParent[0]!==document&&t.contains(this.scrollParent[0],this.offsetParent[0])?this.scrollParent:this.offsetParent,l=e.pageX,h=e.pageY;return this.offset.scroll||(this.offset.scroll={top:r.scrollTop(),left:r.scrollLeft()}),this.originalPosition&&(this.containment&&(this.relative_container?(s=this.relative_container.offset(),i=[this.containment[0]+s.left,this.containment[1]+s.top,this.containment[2]+s.left,this.containment[3]+s.top]):i=this.containment,e.pageX-this.offset.click.left<i[0]&&(l=i[0]+this.offset.click.left),e.pageY-this.offset.click.top<i[1]&&(h=i[1]+this.offset.click.top),e.pageX-this.offset.click.left>i[2]&&(l=i[2]+this.offset.click.left),e.pageY-this.offset.click.top>i[3]&&(h=i[3]+this.offset.click.top)),o.grid&&(n=o.grid[1]?this.originalPageY+Math.round((h-this.originalPageY)/o.grid[1])*o.grid[1]:this.originalPageY,h=i?n-this.offset.click.top>=i[1]||n-this.offset.click.top>i[3]?n:n-this.offset.click.top>=i[1]?n-o.grid[1]:n+o.grid[1]:n,a=o.grid[0]?this.originalPageX+Math.round((l-this.originalPageX)/o.grid[0])*o.grid[0]:this.originalPageX,l=i?a-this.offset.click.left>=i[0]||a-this.offset.click.left>i[2]?a:a-this.offset.click.left>=i[0]?a-o.grid[0]:a+o.grid[0]:a)),{top:h-this.offset.click.top-this.offset.relative.top-this.offset.parent.top+("fixed"===this.cssPosition?-this.scrollParent.scrollTop():this.offset.scroll.top),left:l-this.offset.click.left-this.offset.relative.left-this.offset.parent.left+("fixed"===this.cssPosition?-this.scrollParent.scrollLeft():this.offset.scroll.left)}},_clear:function(){this.helper.removeClass("ui-draggable-dragging"),this.helper[0]===this.element[0]||this.cancelHelperRemoval||this.helper.remove(),this.helper=null,this.cancelHelperRemoval=!1},_trigger:function(e,i,s){return s=s||this._uiHash(),t.ui.plugin.call(this,e,[i,s]),"drag"===e&&(this.positionAbs=this._convertPositionTo("absolute")),t.Widget.prototype._trigger.call(this,e,i,s)},plugins:{},_uiHash:function(){return{helper:this.helper,position:this.position,originalPosition:this.originalPosition,offset:this.positionAbs}}}),t.ui.plugin.add("draggable","connectToSortable",{start:function(e,i){var s=t(this).data("ui-draggable"),n=s.options,a=t.extend({},i,{item:s.element});s.sortables=[],t(n.connectToSortable).each(function(){var i=t.data(this,"ui-sortable");i&&!i.options.disabled&&(s.sortables.push({instance:i,shouldRevert:i.options.revert}),i.refreshPositions(),i._trigger("activate",e,a))})},stop:function(e,i){var s=t(this).data("ui-draggable"),n=t.extend({},i,{item:s.element});t.each(s.sortables,function(){this.instance.isOver?(this.instance.isOver=0,s.cancelHelperRemoval=!0,this.instance.cancelHelperRemoval=!1,this.shouldRevert&&(this.instance.options.revert=this.shouldRevert),this.instance._mouseStop(e),this.instance.options.helper=this.instance.options._helper,"original"===s.options.helper&&this.instance.currentItem.css({top:"auto",left:"auto"})):(this.instance.cancelHelperRemoval=!1,this.instance._trigger("deactivate",e,n))})},drag:function(e,i){var s=t(this).data("ui-draggable"),n=this;t.each(s.sortables,function(){var a=!1,o=this;this.instance.positionAbs=s.positionAbs,this.instance.helperProportions=s.helperProportions,this.instance.offset.click=s.offset.click,this.instance._intersectsWith(this.instance.containerCache)&&(a=!0,t.each(s.sortables,function(){return this.instance.positionAbs=s.positionAbs,this.instance.helperProportions=s.helperProportions,this.instance.offset.click=s.offset.click,this!==o&&this.instance._intersectsWith(this.instance.containerCache)&&t.contains(o.instance.element[0],this.instance.element[0])&&(a=!1),a})),a?(this.instance.isOver||(this.instance.isOver=1,this.instance.currentItem=t(n).clone().removeAttr("id").appendTo(this.instance.element).data("ui-sortable-item",!0),this.instance.options._helper=this.instance.options.helper,this.instance.options.helper=function(){return i.helper[0]},e.target=this.instance.currentItem[0],this.instance._mouseCapture(e,!0),this.instance._mouseStart(e,!0,!0),this.instance.offset.click.top=s.offset.click.top,this.instance.offset.click.left=s.offset.click.left,this.instance.offset.parent.left-=s.offset.parent.left-this.instance.offset.parent.left,this.instance.offset.parent.top-=s.offset.parent.top-this.instance.offset.parent.top,s._trigger("toSortable",e),s.dropped=this.instance.element,s.currentItem=s.element,this.instance.fromOutside=s),this.instance.currentItem&&this.instance._mouseDrag(e)):this.instance.isOver&&(this.instance.isOver=0,this.instance.cancelHelperRemoval=!0,this.instance.options.revert=!1,this.instance._trigger("out",e,this.instance._uiHash(this.instance)),this.instance._mouseStop(e,!0),this.instance.options.helper=this.instance.options._helper,this.instance.currentItem.remove(),this.instance.placeholder&&this.instance.placeholder.remove(),s._trigger("fromSortable",e),s.dropped=!1)})}}),t.ui.plugin.add("draggable","cursor",{start:function(){var e=t("body"),i=t(this).data("ui-draggable").options;e.css("cursor")&&(i._cursor=e.css("cursor")),e.css("cursor",i.cursor)},stop:function(){var e=t(this).data("ui-draggable").options;e._cursor&&t("body").css("cursor",e._cursor)}}),t.ui.plugin.add("draggable","opacity",{start:function(e,i){var s=t(i.helper),n=t(this).data("ui-draggable").options;s.css("opacity")&&(n._opacity=s.css("opacity")),s.css("opacity",n.opacity)},stop:function(e,i){var s=t(this).data("ui-draggable").options;s._opacity&&t(i.helper).css("opacity",s._opacity)}}),t.ui.plugin.add("draggable","scroll",{start:function(){var e=t(this).data("ui-draggable");e.scrollParent[0]!==document&&"HTML"!==e.scrollParent[0].tagName&&(e.overflowOffset=e.scrollParent.offset())},drag:function(e){var i=t(this).data("ui-draggable"),s=i.options,n=!1;i.scrollParent[0]!==document&&"HTML"!==i.scrollParent[0].tagName?(s.axis&&"x"===s.axis||(i.overflowOffset.top+i.scrollParent[0].offsetHeight-e.pageY<s.scrollSensitivity?i.scrollParent[0].scrollTop=n=i.scrollParent[0].scrollTop+s.scrollSpeed:e.pageY-i.overflowOffset.top<s.scrollSensitivity&&(i.scrollParent[0].scrollTop=n=i.scrollParent[0].scrollTop-s.scrollSpeed)),s.axis&&"y"===s.axis||(i.overflowOffset.left+i.scrollParent[0].offsetWidth-e.pageX<s.scrollSensitivity?i.scrollParent[0].scrollLeft=n=i.scrollParent[0].scrollLeft+s.scrollSpeed:e.pageX-i.overflowOffset.left<s.scrollSensitivity&&(i.scrollParent[0].scrollLeft=n=i.scrollParent[0].scrollLeft-s.scrollSpeed))):(s.axis&&"x"===s.axis||(e.pageY-t(document).scrollTop()<s.scrollSensitivity?n=t(document).scrollTop(t(document).scrollTop()-s.scrollSpeed):t(window).height()-(e.pageY-t(document).scrollTop())<s.scrollSensitivity&&(n=t(document).scrollTop(t(document).scrollTop()+s.scrollSpeed))),s.axis&&"y"===s.axis||(e.pageX-t(document).scrollLeft()<s.scrollSensitivity?n=t(document).scrollLeft(t(document).scrollLeft()-s.scrollSpeed):t(window).width()-(e.pageX-t(document).scrollLeft())<s.scrollSensitivity&&(n=t(document).scrollLeft(t(document).scrollLeft()+s.scrollSpeed)))),n!==!1&&t.ui.ddmanager&&!s.dropBehaviour&&t.ui.ddmanager.prepareOffsets(i,e)}}),t.ui.plugin.add("draggable","snap",{start:function(){var e=t(this).data("ui-draggable"),i=e.options;e.snapElements=[],t(i.snap.constructor!==String?i.snap.items||":data(ui-draggable)":i.snap).each(function(){var i=t(this),s=i.offset();this!==e.element[0]&&e.snapElements.push({item:this,width:i.outerWidth(),height:i.outerHeight(),top:s.top,left:s.left})})},drag:function(e,i){var s,n,a,o,r,l,h,c,u,d,p=t(this).data("ui-draggable"),g=p.options,f=g.snapTolerance,m=i.offset.left,_=m+p.helperProportions.width,v=i.offset.top,b=v+p.helperProportions.height;for(u=p.snapElements.length-1;u>=0;u--)r=p.snapElements[u].left,l=r+p.snapElements[u].width,h=p.snapElements[u].top,c=h+p.snapElements[u].height,r-f>_||m>l+f||h-f>b||v>c+f||!t.contains(p.snapElements[u].item.ownerDocument,p.snapElements[u].item)?(p.snapElements[u].snapping&&p.options.snap.release&&p.options.snap.release.call(p.element,e,t.extend(p._uiHash(),{snapItem:p.snapElements[u].item})),p.snapElements[u].snapping=!1):("inner"!==g.snapMode&&(s=f>=Math.abs(h-b),n=f>=Math.abs(c-v),a=f>=Math.abs(r-_),o=f>=Math.abs(l-m),s&&(i.position.top=p._convertPositionTo("relative",{top:h-p.helperProportions.height,left:0}).top-p.margins.top),n&&(i.position.top=p._convertPositionTo("relative",{top:c,left:0}).top-p.margins.top),a&&(i.position.left=p._convertPositionTo("relative",{top:0,left:r-p.helperProportions.width}).left-p.margins.left),o&&(i.position.left=p._convertPositionTo("relative",{top:0,left:l}).left-p.margins.left)),d=s||n||a||o,"outer"!==g.snapMode&&(s=f>=Math.abs(h-v),n=f>=Math.abs(c-b),a=f>=Math.abs(r-m),o=f>=Math.abs(l-_),s&&(i.position.top=p._convertPositionTo("relative",{top:h,left:0}).top-p.margins.top),n&&(i.position.top=p._convertPositionTo("relative",{top:c-p.helperProportions.height,left:0}).top-p.margins.top),a&&(i.position.left=p._convertPositionTo("relative",{top:0,left:r}).left-p.margins.left),o&&(i.position.left=p._convertPositionTo("relative",{top:0,left:l-p.helperProportions.width}).left-p.margins.left)),!p.snapElements[u].snapping&&(s||n||a||o||d)&&p.options.snap.snap&&p.options.snap.snap.call(p.element,e,t.extend(p._uiHash(),{snapItem:p.snapElements[u].item})),p.snapElements[u].snapping=s||n||a||o||d)}}),t.ui.plugin.add("draggable","stack",{start:function(){var e,i=this.data("ui-draggable").options,s=t.makeArray(t(i.stack)).sort(function(e,i){return(parseInt(t(e).css("zIndex"),10)||0)-(parseInt(t(i).css("zIndex"),10)||0)});s.length&&(e=parseInt(t(s[0]).css("zIndex"),10)||0,t(s).each(function(i){t(this).css("zIndex",e+i)}),this.css("zIndex",e+s.length))}}),t.ui.plugin.add("draggable","zIndex",{start:function(e,i){var s=t(i.helper),n=t(this).data("ui-draggable").options;s.css("zIndex")&&(n._zIndex=s.css("zIndex")),s.css("zIndex",n.zIndex)},stop:function(e,i){var s=t(this).data("ui-draggable").options;s._zIndex&&t(i.helper).css("zIndex",s._zIndex)}})})(jQuery);(function(t){function e(t,e,i){return t>e&&e+i>t}t.widget("ui.droppable",{version:"1.10.4",widgetEventPrefix:"drop",options:{accept:"*",activeClass:!1,addClasses:!0,greedy:!1,hoverClass:!1,scope:"default",tolerance:"intersect",activate:null,deactivate:null,drop:null,out:null,over:null},_create:function(){var e,i=this.options,s=i.accept;this.isover=!1,this.isout=!0,this.accept=t.isFunction(s)?s:function(t){return t.is(s)},this.proportions=function(){return arguments.length?(e=arguments[0],undefined):e?e:e={width:this.element[0].offsetWidth,height:this.element[0].offsetHeight}},t.ui.ddmanager.droppables[i.scope]=t.ui.ddmanager.droppables[i.scope]||[],t.ui.ddmanager.droppables[i.scope].push(this),i.addClasses&&this.element.addClass("ui-droppable")},_destroy:function(){for(var e=0,i=t.ui.ddmanager.droppables[this.options.scope];i.length>e;e++)i[e]===this&&i.splice(e,1);this.element.removeClass("ui-droppable ui-droppable-disabled")},_setOption:function(e,i){"accept"===e&&(this.accept=t.isFunction(i)?i:function(t){return t.is(i)}),t.Widget.prototype._setOption.apply(this,arguments)},_activate:function(e){var i=t.ui.ddmanager.current;this.options.activeClass&&this.element.addClass(this.options.activeClass),i&&this._trigger("activate",e,this.ui(i))},_deactivate:function(e){var i=t.ui.ddmanager.current;this.options.activeClass&&this.element.removeClass(this.options.activeClass),i&&this._trigger("deactivate",e,this.ui(i))},_over:function(e){var i=t.ui.ddmanager.current;i&&(i.currentItem||i.element)[0]!==this.element[0]&&this.accept.call(this.element[0],i.currentItem||i.element)&&(this.options.hoverClass&&this.element.addClass(this.options.hoverClass),this._trigger("over",e,this.ui(i)))},_out:function(e){var i=t.ui.ddmanager.current;i&&(i.currentItem||i.element)[0]!==this.element[0]&&this.accept.call(this.element[0],i.currentItem||i.element)&&(this.options.hoverClass&&this.element.removeClass(this.options.hoverClass),this._trigger("out",e,this.ui(i)))},_drop:function(e,i){var s=i||t.ui.ddmanager.current,n=!1;return s&&(s.currentItem||s.element)[0]!==this.element[0]?(this.element.find(":data(ui-droppable)").not(".ui-draggable-dragging").each(function(){var e=t.data(this,"ui-droppable");return e.options.greedy&&!e.options.disabled&&e.options.scope===s.options.scope&&e.accept.call(e.element[0],s.currentItem||s.element)&&t.ui.intersect(s,t.extend(e,{offset:e.element.offset()}),e.options.tolerance)?(n=!0,!1):undefined}),n?!1:this.accept.call(this.element[0],s.currentItem||s.element)?(this.options.activeClass&&this.element.removeClass(this.options.activeClass),this.options.hoverClass&&this.element.removeClass(this.options.hoverClass),this._trigger("drop",e,this.ui(s)),this.element):!1):!1},ui:function(t){return{draggable:t.currentItem||t.element,helper:t.helper,position:t.position,offset:t.positionAbs}}}),t.ui.intersect=function(t,i,s){if(!i.offset)return!1;var n,a,o=(t.positionAbs||t.position.absolute).left,r=(t.positionAbs||t.position.absolute).top,l=o+t.helperProportions.width,h=r+t.helperProportions.height,c=i.offset.left,u=i.offset.top,d=c+i.proportions().width,p=u+i.proportions().height;switch(s){case"fit":return o>=c&&d>=l&&r>=u&&p>=h;case"intersect":return o+t.helperProportions.width/2>c&&d>l-t.helperProportions.width/2&&r+t.helperProportions.height/2>u&&p>h-t.helperProportions.height/2;case"pointer":return n=(t.positionAbs||t.position.absolute).left+(t.clickOffset||t.offset.click).left,a=(t.positionAbs||t.position.absolute).top+(t.clickOffset||t.offset.click).top,e(a,u,i.proportions().height)&&e(n,c,i.proportions().width);case"touch":return(r>=u&&p>=r||h>=u&&p>=h||u>r&&h>p)&&(o>=c&&d>=o||l>=c&&d>=l||c>o&&l>d);default:return!1}},t.ui.ddmanager={current:null,droppables:{"default":[]},prepareOffsets:function(e,i){var s,n,a=t.ui.ddmanager.droppables[e.options.scope]||[],o=i?i.type:null,r=(e.currentItem||e.element).find(":data(ui-droppable)").addBack();t:for(s=0;a.length>s;s++)if(!(a[s].options.disabled||e&&!a[s].accept.call(a[s].element[0],e.currentItem||e.element))){for(n=0;r.length>n;n++)if(r[n]===a[s].element[0]){a[s].proportions().height=0;continue t}a[s].visible="none"!==a[s].element.css("display"),a[s].visible&&("mousedown"===o&&a[s]._activate.call(a[s],i),a[s].offset=a[s].element.offset(),a[s].proportions({width:a[s].element[0].offsetWidth,height:a[s].element[0].offsetHeight}))}},drop:function(e,i){var s=!1;return t.each((t.ui.ddmanager.droppables[e.options.scope]||[]).slice(),function(){this.options&&(!this.options.disabled&&this.visible&&t.ui.intersect(e,this,this.options.tolerance)&&(s=this._drop.call(this,i)||s),!this.options.disabled&&this.visible&&this.accept.call(this.element[0],e.currentItem||e.element)&&(this.isout=!0,this.isover=!1,this._deactivate.call(this,i)))}),s},dragStart:function(e,i){e.element.parentsUntil("body").bind("scroll.droppable",function(){e.options.refreshPositions||t.ui.ddmanager.prepareOffsets(e,i)})},drag:function(e,i){e.options.refreshPositions&&t.ui.ddmanager.prepareOffsets(e,i),t.each(t.ui.ddmanager.droppables[e.options.scope]||[],function(){if(!this.options.disabled&&!this.greedyChild&&this.visible){var s,n,a,o=t.ui.intersect(e,this,this.options.tolerance),r=!o&&this.isover?"isout":o&&!this.isover?"isover":null;r&&(this.options.greedy&&(n=this.options.scope,a=this.element.parents(":data(ui-droppable)").filter(function(){return t.data(this,"ui-droppable").options.scope===n}),a.length&&(s=t.data(a[0],"ui-droppable"),s.greedyChild="isover"===r)),s&&"isover"===r&&(s.isover=!1,s.isout=!0,s._out.call(s,i)),this[r]=!0,this["isout"===r?"isover":"isout"]=!1,this["isover"===r?"_over":"_out"].call(this,i),s&&"isout"===r&&(s.isout=!1,s.isover=!0,s._over.call(s,i)))}})},dragStop:function(e,i){e.element.parentsUntil("body").unbind("scroll.droppable"),e.options.refreshPositions||t.ui.ddmanager.prepareOffsets(e,i)}}})(jQuery);(function(t){function e(t){return parseInt(t,10)||0}function i(t){return!isNaN(parseInt(t,10))}t.widget("ui.resizable",t.ui.mouse,{version:"1.10.4",widgetEventPrefix:"resize",options:{alsoResize:!1,animate:!1,animateDuration:"slow",animateEasing:"swing",aspectRatio:!1,autoHide:!1,containment:!1,ghost:!1,grid:!1,handles:"e,s,se",helper:!1,maxHeight:null,maxWidth:null,minHeight:10,minWidth:10,zIndex:90,resize:null,start:null,stop:null},_create:function(){var e,i,s,n,a,o=this,r=this.options;if(this.element.addClass("ui-resizable"),t.extend(this,{_aspectRatio:!!r.aspectRatio,aspectRatio:r.aspectRatio,originalElement:this.element,_proportionallyResizeElements:[],_helper:r.helper||r.ghost||r.animate?r.helper||"ui-resizable-helper":null}),this.element[0].nodeName.match(/canvas|textarea|input|select|button|img/i)&&(this.element.wrap(t("<div class='ui-wrapper' style='overflow: hidden;'></div>").css({position:this.element.css("position"),width:this.element.outerWidth(),height:this.element.outerHeight(),top:this.element.css("top"),left:this.element.css("left")})),this.element=this.element.parent().data("ui-resizable",this.element.data("ui-resizable")),this.elementIsWrapper=!0,this.element.css({marginLeft:this.originalElement.css("marginLeft"),marginTop:this.originalElement.css("marginTop"),marginRight:this.originalElement.css("marginRight"),marginBottom:this.originalElement.css("marginBottom")}),this.originalElement.css({marginLeft:0,marginTop:0,marginRight:0,marginBottom:0}),this.originalResizeStyle=this.originalElement.css("resize"),this.originalElement.css("resize","none"),this._proportionallyResizeElements.push(this.originalElement.css({position:"static",zoom:1,display:"block"})),this.originalElement.css({margin:this.originalElement.css("margin")}),this._proportionallyResize()),this.handles=r.handles||(t(".ui-resizable-handle",this.element).length?{n:".ui-resizable-n",e:".ui-resizable-e",s:".ui-resizable-s",w:".ui-resizable-w",se:".ui-resizable-se",sw:".ui-resizable-sw",ne:".ui-resizable-ne",nw:".ui-resizable-nw"}:"e,s,se"),this.handles.constructor===String)for("all"===this.handles&&(this.handles="n,e,s,w,se,sw,ne,nw"),e=this.handles.split(","),this.handles={},i=0;e.length>i;i++)s=t.trim(e[i]),a="ui-resizable-"+s,n=t("<div class='ui-resizable-handle "+a+"'></div>"),n.css({zIndex:r.zIndex}),"se"===s&&n.addClass("ui-icon ui-icon-gripsmall-diagonal-se"),this.handles[s]=".ui-resizable-"+s,this.element.append(n);this._renderAxis=function(e){var i,s,n,a;e=e||this.element;for(i in this.handles)this.handles[i].constructor===String&&(this.handles[i]=t(this.handles[i],this.element).show()),this.elementIsWrapper&&this.originalElement[0].nodeName.match(/textarea|input|select|button/i)&&(s=t(this.handles[i],this.element),a=/sw|ne|nw|se|n|s/.test(i)?s.outerHeight():s.outerWidth(),n=["padding",/ne|nw|n/.test(i)?"Top":/se|sw|s/.test(i)?"Bottom":/^e$/.test(i)?"Right":"Left"].join(""),e.css(n,a),this._proportionallyResize()),t(this.handles[i]).length},this._renderAxis(this.element),this._handles=t(".ui-resizable-handle",this.element).disableSelection(),this._handles.mouseover(function(){o.resizing||(this.className&&(n=this.className.match(/ui-resizable-(se|sw|ne|nw|n|e|s|w)/i)),o.axis=n&&n[1]?n[1]:"se")}),r.autoHide&&(this._handles.hide(),t(this.element).addClass("ui-resizable-autohide").mouseenter(function(){r.disabled||(t(this).removeClass("ui-resizable-autohide"),o._handles.show())}).mouseleave(function(){r.disabled||o.resizing||(t(this).addClass("ui-resizable-autohide"),o._handles.hide())})),this._mouseInit()},_destroy:function(){this._mouseDestroy();var e,i=function(e){t(e).removeClass("ui-resizable ui-resizable-disabled ui-resizable-resizing").removeData("resizable").removeData("ui-resizable").unbind(".resizable").find(".ui-resizable-handle").remove()};return this.elementIsWrapper&&(i(this.element),e=this.element,this.originalElement.css({position:e.css("position"),width:e.outerWidth(),height:e.outerHeight(),top:e.css("top"),left:e.css("left")}).insertAfter(e),e.remove()),this.originalElement.css("resize",this.originalResizeStyle),i(this.originalElement),this},_mouseCapture:function(e){var i,s,n=!1;for(i in this.handles)s=t(this.handles[i])[0],(s===e.target||t.contains(s,e.target))&&(n=!0);return!this.options.disabled&&n},_mouseStart:function(i){var s,n,a,o=this.options,r=this.element.position(),h=this.element;return this.resizing=!0,/absolute/.test(h.css("position"))?h.css({position:"absolute",top:h.css("top"),left:h.css("left")}):h.is(".ui-draggable")&&h.css({position:"absolute",top:r.top,left:r.left}),this._renderProxy(),s=e(this.helper.css("left")),n=e(this.helper.css("top")),o.containment&&(s+=t(o.containment).scrollLeft()||0,n+=t(o.containment).scrollTop()||0),this.offset=this.helper.offset(),this.position={left:s,top:n},this.size=this._helper?{width:this.helper.width(),height:this.helper.height()}:{width:h.width(),height:h.height()},this.originalSize=this._helper?{width:h.outerWidth(),height:h.outerHeight()}:{width:h.width(),height:h.height()},this.originalPosition={left:s,top:n},this.sizeDiff={width:h.outerWidth()-h.width(),height:h.outerHeight()-h.height()},this.originalMousePosition={left:i.pageX,top:i.pageY},this.aspectRatio="number"==typeof o.aspectRatio?o.aspectRatio:this.originalSize.width/this.originalSize.height||1,a=t(".ui-resizable-"+this.axis).css("cursor"),t("body").css("cursor","auto"===a?this.axis+"-resize":a),h.addClass("ui-resizable-resizing"),this._propagate("start",i),!0},_mouseDrag:function(e){var i,s=this.helper,n={},a=this.originalMousePosition,o=this.axis,r=this.position.top,h=this.position.left,l=this.size.width,c=this.size.height,u=e.pageX-a.left||0,d=e.pageY-a.top||0,p=this._change[o];return p?(i=p.apply(this,[e,u,d]),this._updateVirtualBoundaries(e.shiftKey),(this._aspectRatio||e.shiftKey)&&(i=this._updateRatio(i,e)),i=this._respectSize(i,e),this._updateCache(i),this._propagate("resize",e),this.position.top!==r&&(n.top=this.position.top+"px"),this.position.left!==h&&(n.left=this.position.left+"px"),this.size.width!==l&&(n.width=this.size.width+"px"),this.size.height!==c&&(n.height=this.size.height+"px"),s.css(n),!this._helper&&this._proportionallyResizeElements.length&&this._proportionallyResize(),t.isEmptyObject(n)||this._trigger("resize",e,this.ui()),!1):!1},_mouseStop:function(e){this.resizing=!1;var i,s,n,a,o,r,h,l=this.options,c=this;return this._helper&&(i=this._proportionallyResizeElements,s=i.length&&/textarea/i.test(i[0].nodeName),n=s&&t.ui.hasScroll(i[0],"left")?0:c.sizeDiff.height,a=s?0:c.sizeDiff.width,o={width:c.helper.width()-a,height:c.helper.height()-n},r=parseInt(c.element.css("left"),10)+(c.position.left-c.originalPosition.left)||null,h=parseInt(c.element.css("top"),10)+(c.position.top-c.originalPosition.top)||null,l.animate||this.element.css(t.extend(o,{top:h,left:r})),c.helper.height(c.size.height),c.helper.width(c.size.width),this._helper&&!l.animate&&this._proportionallyResize()),t("body").css("cursor","auto"),this.element.removeClass("ui-resizable-resizing"),this._propagate("stop",e),this._helper&&this.helper.remove(),!1},_updateVirtualBoundaries:function(t){var e,s,n,a,o,r=this.options;o={minWidth:i(r.minWidth)?r.minWidth:0,maxWidth:i(r.maxWidth)?r.maxWidth:1/0,minHeight:i(r.minHeight)?r.minHeight:0,maxHeight:i(r.maxHeight)?r.maxHeight:1/0},(this._aspectRatio||t)&&(e=o.minHeight*this.aspectRatio,n=o.minWidth/this.aspectRatio,s=o.maxHeight*this.aspectRatio,a=o.maxWidth/this.aspectRatio,e>o.minWidth&&(o.minWidth=e),n>o.minHeight&&(o.minHeight=n),o.maxWidth>s&&(o.maxWidth=s),o.maxHeight>a&&(o.maxHeight=a)),this._vBoundaries=o},_updateCache:function(t){this.offset=this.helper.offset(),i(t.left)&&(this.position.left=t.left),i(t.top)&&(this.position.top=t.top),i(t.height)&&(this.size.height=t.height),i(t.width)&&(this.size.width=t.width)},_updateRatio:function(t){var e=this.position,s=this.size,n=this.axis;return i(t.height)?t.width=t.height*this.aspectRatio:i(t.width)&&(t.height=t.width/this.aspectRatio),"sw"===n&&(t.left=e.left+(s.width-t.width),t.top=null),"nw"===n&&(t.top=e.top+(s.height-t.height),t.left=e.left+(s.width-t.width)),t},_respectSize:function(t){var e=this._vBoundaries,s=this.axis,n=i(t.width)&&e.maxWidth&&e.maxWidth<t.width,a=i(t.height)&&e.maxHeight&&e.maxHeight<t.height,o=i(t.width)&&e.minWidth&&e.minWidth>t.width,r=i(t.height)&&e.minHeight&&e.minHeight>t.height,h=this.originalPosition.left+this.originalSize.width,l=this.position.top+this.size.height,c=/sw|nw|w/.test(s),u=/nw|ne|n/.test(s);return o&&(t.width=e.minWidth),r&&(t.height=e.minHeight),n&&(t.width=e.maxWidth),a&&(t.height=e.maxHeight),o&&c&&(t.left=h-e.minWidth),n&&c&&(t.left=h-e.maxWidth),r&&u&&(t.top=l-e.minHeight),a&&u&&(t.top=l-e.maxHeight),t.width||t.height||t.left||!t.top?t.width||t.height||t.top||!t.left||(t.left=null):t.top=null,t},_proportionallyResize:function(){if(this._proportionallyResizeElements.length){var t,e,i,s,n,a=this.helper||this.element;for(t=0;this._proportionallyResizeElements.length>t;t++){if(n=this._proportionallyResizeElements[t],!this.borderDif)for(this.borderDif=[],i=[n.css("borderTopWidth"),n.css("borderRightWidth"),n.css("borderBottomWidth"),n.css("borderLeftWidth")],s=[n.css("paddingTop"),n.css("paddingRight"),n.css("paddingBottom"),n.css("paddingLeft")],e=0;i.length>e;e++)this.borderDif[e]=(parseInt(i[e],10)||0)+(parseInt(s[e],10)||0);n.css({height:a.height()-this.borderDif[0]-this.borderDif[2]||0,width:a.width()-this.borderDif[1]-this.borderDif[3]||0})}}},_renderProxy:function(){var e=this.element,i=this.options;this.elementOffset=e.offset(),this._helper?(this.helper=this.helper||t("<div style='overflow:hidden;'></div>"),this.helper.addClass(this._helper).css({width:this.element.outerWidth()-1,height:this.element.outerHeight()-1,position:"absolute",left:this.elementOffset.left+"px",top:this.elementOffset.top+"px",zIndex:++i.zIndex}),this.helper.appendTo("body").disableSelection()):this.helper=this.element},_change:{e:function(t,e){return{width:this.originalSize.width+e}},w:function(t,e){var i=this.originalSize,s=this.originalPosition;return{left:s.left+e,width:i.width-e}},n:function(t,e,i){var s=this.originalSize,n=this.originalPosition;return{top:n.top+i,height:s.height-i}},s:function(t,e,i){return{height:this.originalSize.height+i}},se:function(e,i,s){return t.extend(this._change.s.apply(this,arguments),this._change.e.apply(this,[e,i,s]))},sw:function(e,i,s){return t.extend(this._change.s.apply(this,arguments),this._change.w.apply(this,[e,i,s]))},ne:function(e,i,s){return t.extend(this._change.n.apply(this,arguments),this._change.e.apply(this,[e,i,s]))},nw:function(e,i,s){return t.extend(this._change.n.apply(this,arguments),this._change.w.apply(this,[e,i,s]))}},_propagate:function(e,i){t.ui.plugin.call(this,e,[i,this.ui()]),"resize"!==e&&this._trigger(e,i,this.ui())},plugins:{},ui:function(){return{originalElement:this.originalElement,element:this.element,helper:this.helper,position:this.position,size:this.size,originalSize:this.originalSize,originalPosition:this.originalPosition}}}),t.ui.plugin.add("resizable","animate",{stop:function(e){var i=t(this).data("ui-resizable"),s=i.options,n=i._proportionallyResizeElements,a=n.length&&/textarea/i.test(n[0].nodeName),o=a&&t.ui.hasScroll(n[0],"left")?0:i.sizeDiff.height,r=a?0:i.sizeDiff.width,h={width:i.size.width-r,height:i.size.height-o},l=parseInt(i.element.css("left"),10)+(i.position.left-i.originalPosition.left)||null,c=parseInt(i.element.css("top"),10)+(i.position.top-i.originalPosition.top)||null;i.element.animate(t.extend(h,c&&l?{top:c,left:l}:{}),{duration:s.animateDuration,easing:s.animateEasing,step:function(){var s={width:parseInt(i.element.css("width"),10),height:parseInt(i.element.css("height"),10),top:parseInt(i.element.css("top"),10),left:parseInt(i.element.css("left"),10)};n&&n.length&&t(n[0]).css({width:s.width,height:s.height}),i._updateCache(s),i._propagate("resize",e)}})}}),t.ui.plugin.add("resizable","containment",{start:function(){var i,s,n,a,o,r,h,l=t(this).data("ui-resizable"),c=l.options,u=l.element,d=c.containment,p=d instanceof t?d.get(0):/parent/.test(d)?u.parent().get(0):d;p&&(l.containerElement=t(p),/document/.test(d)||d===document?(l.containerOffset={left:0,top:0},l.containerPosition={left:0,top:0},l.parentData={element:t(document),left:0,top:0,width:t(document).width(),height:t(document).height()||document.body.parentNode.scrollHeight}):(i=t(p),s=[],t(["Top","Right","Left","Bottom"]).each(function(t,n){s[t]=e(i.css("padding"+n))}),l.containerOffset=i.offset(),l.containerPosition=i.position(),l.containerSize={height:i.innerHeight()-s[3],width:i.innerWidth()-s[1]},n=l.containerOffset,a=l.containerSize.height,o=l.containerSize.width,r=t.ui.hasScroll(p,"left")?p.scrollWidth:o,h=t.ui.hasScroll(p)?p.scrollHeight:a,l.parentData={element:p,left:n.left,top:n.top,width:r,height:h}))},resize:function(e){var i,s,n,a,o=t(this).data("ui-resizable"),r=o.options,h=o.containerOffset,l=o.position,c=o._aspectRatio||e.shiftKey,u={top:0,left:0},d=o.containerElement;d[0]!==document&&/static/.test(d.css("position"))&&(u=h),l.left<(o._helper?h.left:0)&&(o.size.width=o.size.width+(o._helper?o.position.left-h.left:o.position.left-u.left),c&&(o.size.height=o.size.width/o.aspectRatio),o.position.left=r.helper?h.left:0),l.top<(o._helper?h.top:0)&&(o.size.height=o.size.height+(o._helper?o.position.top-h.top:o.position.top),c&&(o.size.width=o.size.height*o.aspectRatio),o.position.top=o._helper?h.top:0),o.offset.left=o.parentData.left+o.position.left,o.offset.top=o.parentData.top+o.position.top,i=Math.abs((o._helper?o.offset.left-u.left:o.offset.left-u.left)+o.sizeDiff.width),s=Math.abs((o._helper?o.offset.top-u.top:o.offset.top-h.top)+o.sizeDiff.height),n=o.containerElement.get(0)===o.element.parent().get(0),a=/relative|absolute/.test(o.containerElement.css("position")),n&&a&&(i-=Math.abs(o.parentData.left)),i+o.size.width>=o.parentData.width&&(o.size.width=o.parentData.width-i,c&&(o.size.height=o.size.width/o.aspectRatio)),s+o.size.height>=o.parentData.height&&(o.size.height=o.parentData.height-s,c&&(o.size.width=o.size.height*o.aspectRatio))},stop:function(){var e=t(this).data("ui-resizable"),i=e.options,s=e.containerOffset,n=e.containerPosition,a=e.containerElement,o=t(e.helper),r=o.offset(),h=o.outerWidth()-e.sizeDiff.width,l=o.outerHeight()-e.sizeDiff.height;e._helper&&!i.animate&&/relative/.test(a.css("position"))&&t(this).css({left:r.left-n.left-s.left,width:h,height:l}),e._helper&&!i.animate&&/static/.test(a.css("position"))&&t(this).css({left:r.left-n.left-s.left,width:h,height:l})}}),t.ui.plugin.add("resizable","alsoResize",{start:function(){var e=t(this).data("ui-resizable"),i=e.options,s=function(e){t(e).each(function(){var e=t(this);e.data("ui-resizable-alsoresize",{width:parseInt(e.width(),10),height:parseInt(e.height(),10),left:parseInt(e.css("left"),10),top:parseInt(e.css("top"),10)})})};"object"!=typeof i.alsoResize||i.alsoResize.parentNode?s(i.alsoResize):i.alsoResize.length?(i.alsoResize=i.alsoResize[0],s(i.alsoResize)):t.each(i.alsoResize,function(t){s(t)})},resize:function(e,i){var s=t(this).data("ui-resizable"),n=s.options,a=s.originalSize,o=s.originalPosition,r={height:s.size.height-a.height||0,width:s.size.width-a.width||0,top:s.position.top-o.top||0,left:s.position.left-o.left||0},h=function(e,s){t(e).each(function(){var e=t(this),n=t(this).data("ui-resizable-alsoresize"),a={},o=s&&s.length?s:e.parents(i.originalElement[0]).length?["width","height"]:["width","height","top","left"];t.each(o,function(t,e){var i=(n[e]||0)+(r[e]||0);i&&i>=0&&(a[e]=i||null)}),e.css(a)})};"object"!=typeof n.alsoResize||n.alsoResize.nodeType?h(n.alsoResize):t.each(n.alsoResize,function(t,e){h(t,e)})},stop:function(){t(this).removeData("resizable-alsoresize")}}),t.ui.plugin.add("resizable","ghost",{start:function(){var e=t(this).data("ui-resizable"),i=e.options,s=e.size;e.ghost=e.originalElement.clone(),e.ghost.css({opacity:.25,display:"block",position:"relative",height:s.height,width:s.width,margin:0,left:0,top:0}).addClass("ui-resizable-ghost").addClass("string"==typeof i.ghost?i.ghost:""),e.ghost.appendTo(e.helper)},resize:function(){var e=t(this).data("ui-resizable");e.ghost&&e.ghost.css({position:"relative",height:e.size.height,width:e.size.width})},stop:function(){var e=t(this).data("ui-resizable");e.ghost&&e.helper&&e.helper.get(0).removeChild(e.ghost.get(0))}}),t.ui.plugin.add("resizable","grid",{resize:function(){var e=t(this).data("ui-resizable"),i=e.options,s=e.size,n=e.originalSize,a=e.originalPosition,o=e.axis,r="number"==typeof i.grid?[i.grid,i.grid]:i.grid,h=r[0]||1,l=r[1]||1,c=Math.round((s.width-n.width)/h)*h,u=Math.round((s.height-n.height)/l)*l,d=n.width+c,p=n.height+u,f=i.maxWidth&&d>i.maxWidth,g=i.maxHeight&&p>i.maxHeight,m=i.minWidth&&i.minWidth>d,v=i.minHeight&&i.minHeight>p;i.grid=r,m&&(d+=h),v&&(p+=l),f&&(d-=h),g&&(p-=l),/^(se|s|e)$/.test(o)?(e.size.width=d,e.size.height=p):/^(ne)$/.test(o)?(e.size.width=d,e.size.height=p,e.position.top=a.top-u):/^(sw)$/.test(o)?(e.size.width=d,e.size.height=p,e.position.left=a.left-c):(p-l>0?(e.size.height=p,e.position.top=a.top-u):(e.size.height=l,e.position.top=a.top+n.height-l),d-h>0?(e.size.width=d,e.position.left=a.left-c):(e.size.width=h,e.position.left=a.left+n.width-h))}})})(jQuery);(function(t){t.widget("ui.selectable",t.ui.mouse,{version:"1.10.4",options:{appendTo:"body",autoRefresh:!0,distance:0,filter:"*",tolerance:"touch",selected:null,selecting:null,start:null,stop:null,unselected:null,unselecting:null},_create:function(){var e,i=this;this.element.addClass("ui-selectable"),this.dragged=!1,this.refresh=function(){e=t(i.options.filter,i.element[0]),e.addClass("ui-selectee"),e.each(function(){var e=t(this),i=e.offset();t.data(this,"selectable-item",{element:this,$element:e,left:i.left,top:i.top,right:i.left+e.outerWidth(),bottom:i.top+e.outerHeight(),startselected:!1,selected:e.hasClass("ui-selected"),selecting:e.hasClass("ui-selecting"),unselecting:e.hasClass("ui-unselecting")})})},this.refresh(),this.selectees=e.addClass("ui-selectee"),this._mouseInit(),this.helper=t("<div class='ui-selectable-helper'></div>")},_destroy:function(){this.selectees.removeClass("ui-selectee").removeData("selectable-item"),this.element.removeClass("ui-selectable ui-selectable-disabled"),this._mouseDestroy()},_mouseStart:function(e){var i=this,s=this.options;this.opos=[e.pageX,e.pageY],this.options.disabled||(this.selectees=t(s.filter,this.element[0]),this._trigger("start",e),t(s.appendTo).append(this.helper),this.helper.css({left:e.pageX,top:e.pageY,width:0,height:0}),s.autoRefresh&&this.refresh(),this.selectees.filter(".ui-selected").each(function(){var s=t.data(this,"selectable-item");s.startselected=!0,e.metaKey||e.ctrlKey||(s.$element.removeClass("ui-selected"),s.selected=!1,s.$element.addClass("ui-unselecting"),s.unselecting=!0,i._trigger("unselecting",e,{unselecting:s.element}))}),t(e.target).parents().addBack().each(function(){var s,n=t.data(this,"selectable-item");return n?(s=!e.metaKey&&!e.ctrlKey||!n.$element.hasClass("ui-selected"),n.$element.removeClass(s?"ui-unselecting":"ui-selected").addClass(s?"ui-selecting":"ui-unselecting"),n.unselecting=!s,n.selecting=s,n.selected=s,s?i._trigger("selecting",e,{selecting:n.element}):i._trigger("unselecting",e,{unselecting:n.element}),!1):undefined}))},_mouseDrag:function(e){if(this.dragged=!0,!this.options.disabled){var i,s=this,n=this.options,a=this.opos[0],o=this.opos[1],r=e.pageX,l=e.pageY;return a>r&&(i=r,r=a,a=i),o>l&&(i=l,l=o,o=i),this.helper.css({left:a,top:o,width:r-a,height:l-o}),this.selectees.each(function(){var i=t.data(this,"selectable-item"),h=!1;i&&i.element!==s.element[0]&&("touch"===n.tolerance?h=!(i.left>r||a>i.right||i.top>l||o>i.bottom):"fit"===n.tolerance&&(h=i.left>a&&r>i.right&&i.top>o&&l>i.bottom),h?(i.selected&&(i.$element.removeClass("ui-selected"),i.selected=!1),i.unselecting&&(i.$element.removeClass("ui-unselecting"),i.unselecting=!1),i.selecting||(i.$element.addClass("ui-selecting"),i.selecting=!0,s._trigger("selecting",e,{selecting:i.element}))):(i.selecting&&((e.metaKey||e.ctrlKey)&&i.startselected?(i.$element.removeClass("ui-selecting"),i.selecting=!1,i.$element.addClass("ui-selected"),i.selected=!0):(i.$element.removeClass("ui-selecting"),i.selecting=!1,i.startselected&&(i.$element.addClass("ui-unselecting"),i.unselecting=!0),s._trigger("unselecting",e,{unselecting:i.element}))),i.selected&&(e.metaKey||e.ctrlKey||i.startselected||(i.$element.removeClass("ui-selected"),i.selected=!1,i.$element.addClass("ui-unselecting"),i.unselecting=!0,s._trigger("unselecting",e,{unselecting:i.element})))))}),!1}},_mouseStop:function(e){var i=this;return this.dragged=!1,t(".ui-unselecting",this.element[0]).each(function(){var s=t.data(this,"selectable-item");s.$element.removeClass("ui-unselecting"),s.unselecting=!1,s.startselected=!1,i._trigger("unselected",e,{unselected:s.element})}),t(".ui-selecting",this.element[0]).each(function(){var s=t.data(this,"selectable-item");s.$element.removeClass("ui-selecting").addClass("ui-selected"),s.selecting=!1,s.selected=!0,s.startselected=!0,i._trigger("selected",e,{selected:s.element})}),this._trigger("stop",e),this.helper.remove(),!1}})})(jQuery);(function(t){function e(t,e,i){return t>e&&e+i>t}function i(t){return/left|right/.test(t.css("float"))||/inline|table-cell/.test(t.css("display"))}t.widget("ui.sortable",t.ui.mouse,{version:"1.10.4",widgetEventPrefix:"sort",ready:!1,options:{appendTo:"parent",axis:!1,connectWith:!1,containment:!1,cursor:"auto",cursorAt:!1,dropOnEmpty:!0,forcePlaceholderSize:!1,forceHelperSize:!1,grid:!1,handle:!1,helper:"original",items:"> *",opacity:!1,placeholder:!1,revert:!1,scroll:!0,scrollSensitivity:20,scrollSpeed:20,scope:"default",tolerance:"intersect",zIndex:1e3,activate:null,beforeStop:null,change:null,deactivate:null,out:null,over:null,receive:null,remove:null,sort:null,start:null,stop:null,update:null},_create:function(){var t=this.options;this.containerCache={},this.element.addClass("ui-sortable"),this.refresh(),this.floating=this.items.length?"x"===t.axis||i(this.items[0].item):!1,this.offset=this.element.offset(),this._mouseInit(),this.ready=!0},_destroy:function(){this.element.removeClass("ui-sortable ui-sortable-disabled"),this._mouseDestroy();for(var t=this.items.length-1;t>=0;t--)this.items[t].item.removeData(this.widgetName+"-item");return this},_setOption:function(e,i){"disabled"===e?(this.options[e]=i,this.widget().toggleClass("ui-sortable-disabled",!!i)):t.Widget.prototype._setOption.apply(this,arguments)},_mouseCapture:function(e,i){var s=null,n=!1,o=this;return this.reverting?!1:this.options.disabled||"static"===this.options.type?!1:(this._refreshItems(e),t(e.target).parents().each(function(){return t.data(this,o.widgetName+"-item")===o?(s=t(this),!1):undefined}),t.data(e.target,o.widgetName+"-item")===o&&(s=t(e.target)),s?!this.options.handle||i||(t(this.options.handle,s).find("*").addBack().each(function(){this===e.target&&(n=!0)}),n)?(this.currentItem=s,this._removeCurrentsFromItems(),!0):!1:!1)},_mouseStart:function(e,i,s){var n,o,a=this.options;if(this.currentContainer=this,this.refreshPositions(),this.helper=this._createHelper(e),this._cacheHelperProportions(),this._cacheMargins(),this.scrollParent=this.helper.scrollParent(),this.offset=this.currentItem.offset(),this.offset={top:this.offset.top-this.margins.top,left:this.offset.left-this.margins.left},t.extend(this.offset,{click:{left:e.pageX-this.offset.left,top:e.pageY-this.offset.top},parent:this._getParentOffset(),relative:this._getRelativeOffset()}),this.helper.css("position","absolute"),this.cssPosition=this.helper.css("position"),this.originalPosition=this._generatePosition(e),this.originalPageX=e.pageX,this.originalPageY=e.pageY,a.cursorAt&&this._adjustOffsetFromHelper(a.cursorAt),this.domPosition={prev:this.currentItem.prev()[0],parent:this.currentItem.parent()[0]},this.helper[0]!==this.currentItem[0]&&this.currentItem.hide(),this._createPlaceholder(),a.containment&&this._setContainment(),a.cursor&&"auto"!==a.cursor&&(o=this.document.find("body"),this.storedCursor=o.css("cursor"),o.css("cursor",a.cursor),this.storedStylesheet=t("<style>*{ cursor: "+a.cursor+" !important; }</style>").appendTo(o)),a.opacity&&(this.helper.css("opacity")&&(this._storedOpacity=this.helper.css("opacity")),this.helper.css("opacity",a.opacity)),a.zIndex&&(this.helper.css("zIndex")&&(this._storedZIndex=this.helper.css("zIndex")),this.helper.css("zIndex",a.zIndex)),this.scrollParent[0]!==document&&"HTML"!==this.scrollParent[0].tagName&&(this.overflowOffset=this.scrollParent.offset()),this._trigger("start",e,this._uiHash()),this._preserveHelperProportions||this._cacheHelperProportions(),!s)for(n=this.containers.length-1;n>=0;n--)this.containers[n]._trigger("activate",e,this._uiHash(this));return t.ui.ddmanager&&(t.ui.ddmanager.current=this),t.ui.ddmanager&&!a.dropBehaviour&&t.ui.ddmanager.prepareOffsets(this,e),this.dragging=!0,this.helper.addClass("ui-sortable-helper"),this._mouseDrag(e),!0},_mouseDrag:function(e){var i,s,n,o,a=this.options,r=!1;for(this.position=this._generatePosition(e),this.positionAbs=this._convertPositionTo("absolute"),this.lastPositionAbs||(this.lastPositionAbs=this.positionAbs),this.options.scroll&&(this.scrollParent[0]!==document&&"HTML"!==this.scrollParent[0].tagName?(this.overflowOffset.top+this.scrollParent[0].offsetHeight-e.pageY<a.scrollSensitivity?this.scrollParent[0].scrollTop=r=this.scrollParent[0].scrollTop+a.scrollSpeed:e.pageY-this.overflowOffset.top<a.scrollSensitivity&&(this.scrollParent[0].scrollTop=r=this.scrollParent[0].scrollTop-a.scrollSpeed),this.overflowOffset.left+this.scrollParent[0].offsetWidth-e.pageX<a.scrollSensitivity?this.scrollParent[0].scrollLeft=r=this.scrollParent[0].scrollLeft+a.scrollSpeed:e.pageX-this.overflowOffset.left<a.scrollSensitivity&&(this.scrollParent[0].scrollLeft=r=this.scrollParent[0].scrollLeft-a.scrollSpeed)):(e.pageY-t(document).scrollTop()<a.scrollSensitivity?r=t(document).scrollTop(t(document).scrollTop()-a.scrollSpeed):t(window).height()-(e.pageY-t(document).scrollTop())<a.scrollSensitivity&&(r=t(document).scrollTop(t(document).scrollTop()+a.scrollSpeed)),e.pageX-t(document).scrollLeft()<a.scrollSensitivity?r=t(document).scrollLeft(t(document).scrollLeft()-a.scrollSpeed):t(window).width()-(e.pageX-t(document).scrollLeft())<a.scrollSensitivity&&(r=t(document).scrollLeft(t(document).scrollLeft()+a.scrollSpeed))),r!==!1&&t.ui.ddmanager&&!a.dropBehaviour&&t.ui.ddmanager.prepareOffsets(this,e)),this.positionAbs=this._convertPositionTo("absolute"),this.options.axis&&"y"===this.options.axis||(this.helper[0].style.left=this.position.left+"px"),this.options.axis&&"x"===this.options.axis||(this.helper[0].style.top=this.position.top+"px"),i=this.items.length-1;i>=0;i--)if(s=this.items[i],n=s.item[0],o=this._intersectsWithPointer(s),o&&s.instance===this.currentContainer&&n!==this.currentItem[0]&&this.placeholder[1===o?"next":"prev"]()[0]!==n&&!t.contains(this.placeholder[0],n)&&("semi-dynamic"===this.options.type?!t.contains(this.element[0],n):!0)){if(this.direction=1===o?"down":"up","pointer"!==this.options.tolerance&&!this._intersectsWithSides(s))break;this._rearrange(e,s),this._trigger("change",e,this._uiHash());break}return this._contactContainers(e),t.ui.ddmanager&&t.ui.ddmanager.drag(this,e),this._trigger("sort",e,this._uiHash()),this.lastPositionAbs=this.positionAbs,!1},_mouseStop:function(e,i){if(e){if(t.ui.ddmanager&&!this.options.dropBehaviour&&t.ui.ddmanager.drop(this,e),this.options.revert){var s=this,n=this.placeholder.offset(),o=this.options.axis,a={};o&&"x"!==o||(a.left=n.left-this.offset.parent.left-this.margins.left+(this.offsetParent[0]===document.body?0:this.offsetParent[0].scrollLeft)),o&&"y"!==o||(a.top=n.top-this.offset.parent.top-this.margins.top+(this.offsetParent[0]===document.body?0:this.offsetParent[0].scrollTop)),this.reverting=!0,t(this.helper).animate(a,parseInt(this.options.revert,10)||500,function(){s._clear(e)})}else this._clear(e,i);return!1}},cancel:function(){if(this.dragging){this._mouseUp({target:null}),"original"===this.options.helper?this.currentItem.css(this._storedCSS).removeClass("ui-sortable-helper"):this.currentItem.show();for(var e=this.containers.length-1;e>=0;e--)this.containers[e]._trigger("deactivate",null,this._uiHash(this)),this.containers[e].containerCache.over&&(this.containers[e]._trigger("out",null,this._uiHash(this)),this.containers[e].containerCache.over=0)}return this.placeholder&&(this.placeholder[0].parentNode&&this.placeholder[0].parentNode.removeChild(this.placeholder[0]),"original"!==this.options.helper&&this.helper&&this.helper[0].parentNode&&this.helper.remove(),t.extend(this,{helper:null,dragging:!1,reverting:!1,_noFinalSort:null}),this.domPosition.prev?t(this.domPosition.prev).after(this.currentItem):t(this.domPosition.parent).prepend(this.currentItem)),this},serialize:function(e){var i=this._getItemsAsjQuery(e&&e.connected),s=[];return e=e||{},t(i).each(function(){var i=(t(e.item||this).attr(e.attribute||"id")||"").match(e.expression||/(.+)[\-=_](.+)/);i&&s.push((e.key||i[1]+"[]")+"="+(e.key&&e.expression?i[1]:i[2]))}),!s.length&&e.key&&s.push(e.key+"="),s.join("&")},toArray:function(e){var i=this._getItemsAsjQuery(e&&e.connected),s=[];return e=e||{},i.each(function(){s.push(t(e.item||this).attr(e.attribute||"id")||"")}),s},_intersectsWith:function(t){var e=this.positionAbs.left,i=e+this.helperProportions.width,s=this.positionAbs.top,n=s+this.helperProportions.height,o=t.left,a=o+t.width,r=t.top,h=r+t.height,l=this.offset.click.top,c=this.offset.click.left,u="x"===this.options.axis||s+l>r&&h>s+l,d="y"===this.options.axis||e+c>o&&a>e+c,p=u&&d;return"pointer"===this.options.tolerance||this.options.forcePointerForContainers||"pointer"!==this.options.tolerance&&this.helperProportions[this.floating?"width":"height"]>t[this.floating?"width":"height"]?p:e+this.helperProportions.width/2>o&&a>i-this.helperProportions.width/2&&s+this.helperProportions.height/2>r&&h>n-this.helperProportions.height/2},_intersectsWithPointer:function(t){var i="x"===this.options.axis||e(this.positionAbs.top+this.offset.click.top,t.top,t.height),s="y"===this.options.axis||e(this.positionAbs.left+this.offset.click.left,t.left,t.width),n=i&&s,o=this._getDragVerticalDirection(),a=this._getDragHorizontalDirection();return n?this.floating?a&&"right"===a||"down"===o?2:1:o&&("down"===o?2:1):!1},_intersectsWithSides:function(t){var i=e(this.positionAbs.top+this.offset.click.top,t.top+t.height/2,t.height),s=e(this.positionAbs.left+this.offset.click.left,t.left+t.width/2,t.width),n=this._getDragVerticalDirection(),o=this._getDragHorizontalDirection();return this.floating&&o?"right"===o&&s||"left"===o&&!s:n&&("down"===n&&i||"up"===n&&!i)},_getDragVerticalDirection:function(){var t=this.positionAbs.top-this.lastPositionAbs.top;return 0!==t&&(t>0?"down":"up")},_getDragHorizontalDirection:function(){var t=this.positionAbs.left-this.lastPositionAbs.left;return 0!==t&&(t>0?"right":"left")},refresh:function(t){return this._refreshItems(t),this.refreshPositions(),this},_connectWith:function(){var t=this.options;return t.connectWith.constructor===String?[t.connectWith]:t.connectWith},_getItemsAsjQuery:function(e){function i(){r.push(this)}var s,n,o,a,r=[],h=[],l=this._connectWith();if(l&&e)for(s=l.length-1;s>=0;s--)for(o=t(l[s]),n=o.length-1;n>=0;n--)a=t.data(o[n],this.widgetFullName),a&&a!==this&&!a.options.disabled&&h.push([t.isFunction(a.options.items)?a.options.items.call(a.element):t(a.options.items,a.element).not(".ui-sortable-helper").not(".ui-sortable-placeholder"),a]);for(h.push([t.isFunction(this.options.items)?this.options.items.call(this.element,null,{options:this.options,item:this.currentItem}):t(this.options.items,this.element).not(".ui-sortable-helper").not(".ui-sortable-placeholder"),this]),s=h.length-1;s>=0;s--)h[s][0].each(i);return t(r)},_removeCurrentsFromItems:function(){var e=this.currentItem.find(":data("+this.widgetName+"-item)");this.items=t.grep(this.items,function(t){for(var i=0;e.length>i;i++)if(e[i]===t.item[0])return!1;return!0})},_refreshItems:function(e){this.items=[],this.containers=[this];var i,s,n,o,a,r,h,l,c=this.items,u=[[t.isFunction(this.options.items)?this.options.items.call(this.element[0],e,{item:this.currentItem}):t(this.options.items,this.element),this]],d=this._connectWith();if(d&&this.ready)for(i=d.length-1;i>=0;i--)for(n=t(d[i]),s=n.length-1;s>=0;s--)o=t.data(n[s],this.widgetFullName),o&&o!==this&&!o.options.disabled&&(u.push([t.isFunction(o.options.items)?o.options.items.call(o.element[0],e,{item:this.currentItem}):t(o.options.items,o.element),o]),this.containers.push(o));for(i=u.length-1;i>=0;i--)for(a=u[i][1],r=u[i][0],s=0,l=r.length;l>s;s++)h=t(r[s]),h.data(this.widgetName+"-item",a),c.push({item:h,instance:a,width:0,height:0,left:0,top:0})},refreshPositions:function(e){this.offsetParent&&this.helper&&(this.offset.parent=this._getParentOffset());var i,s,n,o;for(i=this.items.length-1;i>=0;i--)s=this.items[i],s.instance!==this.currentContainer&&this.currentContainer&&s.item[0]!==this.currentItem[0]||(n=this.options.toleranceElement?t(this.options.toleranceElement,s.item):s.item,e||(s.width=n.outerWidth(),s.height=n.outerHeight()),o=n.offset(),s.left=o.left,s.top=o.top);if(this.options.custom&&this.options.custom.refreshContainers)this.options.custom.refreshContainers.call(this);else for(i=this.containers.length-1;i>=0;i--)o=this.containers[i].element.offset(),this.containers[i].containerCache.left=o.left,this.containers[i].containerCache.top=o.top,this.containers[i].containerCache.width=this.containers[i].element.outerWidth(),this.containers[i].containerCache.height=this.containers[i].element.outerHeight();return this},_createPlaceholder:function(e){e=e||this;var i,s=e.options;s.placeholder&&s.placeholder.constructor!==String||(i=s.placeholder,s.placeholder={element:function(){var s=e.currentItem[0].nodeName.toLowerCase(),n=t("<"+s+">",e.document[0]).addClass(i||e.currentItem[0].className+" ui-sortable-placeholder").removeClass("ui-sortable-helper");return"tr"===s?e.currentItem.children().each(function(){t("<td>&#160;</td>",e.document[0]).attr("colspan",t(this).attr("colspan")||1).appendTo(n)}):"img"===s&&n.attr("src",e.currentItem.attr("src")),i||n.css("visibility","hidden"),n},update:function(t,n){(!i||s.forcePlaceholderSize)&&(n.height()||n.height(e.currentItem.innerHeight()-parseInt(e.currentItem.css("paddingTop")||0,10)-parseInt(e.currentItem.css("paddingBottom")||0,10)),n.width()||n.width(e.currentItem.innerWidth()-parseInt(e.currentItem.css("paddingLeft")||0,10)-parseInt(e.currentItem.css("paddingRight")||0,10)))}}),e.placeholder=t(s.placeholder.element.call(e.element,e.currentItem)),e.currentItem.after(e.placeholder),s.placeholder.update(e,e.placeholder)},_contactContainers:function(s){var n,o,a,r,h,l,c,u,d,p,f=null,g=null;for(n=this.containers.length-1;n>=0;n--)if(!t.contains(this.currentItem[0],this.containers[n].element[0]))if(this._intersectsWith(this.containers[n].containerCache)){if(f&&t.contains(this.containers[n].element[0],f.element[0]))continue;f=this.containers[n],g=n}else this.containers[n].containerCache.over&&(this.containers[n]._trigger("out",s,this._uiHash(this)),this.containers[n].containerCache.over=0);if(f)if(1===this.containers.length)this.containers[g].containerCache.over||(this.containers[g]._trigger("over",s,this._uiHash(this)),this.containers[g].containerCache.over=1);else{for(a=1e4,r=null,p=f.floating||i(this.currentItem),h=p?"left":"top",l=p?"width":"height",c=this.positionAbs[h]+this.offset.click[h],o=this.items.length-1;o>=0;o--)t.contains(this.containers[g].element[0],this.items[o].item[0])&&this.items[o].item[0]!==this.currentItem[0]&&(!p||e(this.positionAbs.top+this.offset.click.top,this.items[o].top,this.items[o].height))&&(u=this.items[o].item.offset()[h],d=!1,Math.abs(u-c)>Math.abs(u+this.items[o][l]-c)&&(d=!0,u+=this.items[o][l]),a>Math.abs(u-c)&&(a=Math.abs(u-c),r=this.items[o],this.direction=d?"up":"down"));if(!r&&!this.options.dropOnEmpty)return;if(this.currentContainer===this.containers[g])return;r?this._rearrange(s,r,null,!0):this._rearrange(s,null,this.containers[g].element,!0),this._trigger("change",s,this._uiHash()),this.containers[g]._trigger("change",s,this._uiHash(this)),this.currentContainer=this.containers[g],this.options.placeholder.update(this.currentContainer,this.placeholder),this.containers[g]._trigger("over",s,this._uiHash(this)),this.containers[g].containerCache.over=1}},_createHelper:function(e){var i=this.options,s=t.isFunction(i.helper)?t(i.helper.apply(this.element[0],[e,this.currentItem])):"clone"===i.helper?this.currentItem.clone():this.currentItem;return s.parents("body").length||t("parent"!==i.appendTo?i.appendTo:this.currentItem[0].parentNode)[0].appendChild(s[0]),s[0]===this.currentItem[0]&&(this._storedCSS={width:this.currentItem[0].style.width,height:this.currentItem[0].style.height,position:this.currentItem.css("position"),top:this.currentItem.css("top"),left:this.currentItem.css("left")}),(!s[0].style.width||i.forceHelperSize)&&s.width(this.currentItem.width()),(!s[0].style.height||i.forceHelperSize)&&s.height(this.currentItem.height()),s},_adjustOffsetFromHelper:function(e){"string"==typeof e&&(e=e.split(" ")),t.isArray(e)&&(e={left:+e[0],top:+e[1]||0}),"left"in e&&(this.offset.click.left=e.left+this.margins.left),"right"in e&&(this.offset.click.left=this.helperProportions.width-e.right+this.margins.left),"top"in e&&(this.offset.click.top=e.top+this.margins.top),"bottom"in e&&(this.offset.click.top=this.helperProportions.height-e.bottom+this.margins.top)},_getParentOffset:function(){this.offsetParent=this.helper.offsetParent();var e=this.offsetParent.offset();return"absolute"===this.cssPosition&&this.scrollParent[0]!==document&&t.contains(this.scrollParent[0],this.offsetParent[0])&&(e.left+=this.scrollParent.scrollLeft(),e.top+=this.scrollParent.scrollTop()),(this.offsetParent[0]===document.body||this.offsetParent[0].tagName&&"html"===this.offsetParent[0].tagName.toLowerCase()&&t.ui.ie)&&(e={top:0,left:0}),{top:e.top+(parseInt(this.offsetParent.css("borderTopWidth"),10)||0),left:e.left+(parseInt(this.offsetParent.css("borderLeftWidth"),10)||0)}},_getRelativeOffset:function(){if("relative"===this.cssPosition){var t=this.currentItem.position();return{top:t.top-(parseInt(this.helper.css("top"),10)||0)+this.scrollParent.scrollTop(),left:t.left-(parseInt(this.helper.css("left"),10)||0)+this.scrollParent.scrollLeft()}}return{top:0,left:0}},_cacheMargins:function(){this.margins={left:parseInt(this.currentItem.css("marginLeft"),10)||0,top:parseInt(this.currentItem.css("marginTop"),10)||0}},_cacheHelperProportions:function(){this.helperProportions={width:this.helper.outerWidth(),height:this.helper.outerHeight()}},_setContainment:function(){var e,i,s,n=this.options;"parent"===n.containment&&(n.containment=this.helper[0].parentNode),("document"===n.containment||"window"===n.containment)&&(this.containment=[0-this.offset.relative.left-this.offset.parent.left,0-this.offset.relative.top-this.offset.parent.top,t("document"===n.containment?document:window).width()-this.helperProportions.width-this.margins.left,(t("document"===n.containment?document:window).height()||document.body.parentNode.scrollHeight)-this.helperProportions.height-this.margins.top]),/^(document|window|parent)$/.test(n.containment)||(e=t(n.containment)[0],i=t(n.containment).offset(),s="hidden"!==t(e).css("overflow"),this.containment=[i.left+(parseInt(t(e).css("borderLeftWidth"),10)||0)+(parseInt(t(e).css("paddingLeft"),10)||0)-this.margins.left,i.top+(parseInt(t(e).css("borderTopWidth"),10)||0)+(parseInt(t(e).css("paddingTop"),10)||0)-this.margins.top,i.left+(s?Math.max(e.scrollWidth,e.offsetWidth):e.offsetWidth)-(parseInt(t(e).css("borderLeftWidth"),10)||0)-(parseInt(t(e).css("paddingRight"),10)||0)-this.helperProportions.width-this.margins.left,i.top+(s?Math.max(e.scrollHeight,e.offsetHeight):e.offsetHeight)-(parseInt(t(e).css("borderTopWidth"),10)||0)-(parseInt(t(e).css("paddingBottom"),10)||0)-this.helperProportions.height-this.margins.top])},_convertPositionTo:function(e,i){i||(i=this.position);var s="absolute"===e?1:-1,n="absolute"!==this.cssPosition||this.scrollParent[0]!==document&&t.contains(this.scrollParent[0],this.offsetParent[0])?this.scrollParent:this.offsetParent,o=/(html|body)/i.test(n[0].tagName);return{top:i.top+this.offset.relative.top*s+this.offset.parent.top*s-("fixed"===this.cssPosition?-this.scrollParent.scrollTop():o?0:n.scrollTop())*s,left:i.left+this.offset.relative.left*s+this.offset.parent.left*s-("fixed"===this.cssPosition?-this.scrollParent.scrollLeft():o?0:n.scrollLeft())*s}},_generatePosition:function(e){var i,s,n=this.options,o=e.pageX,a=e.pageY,r="absolute"!==this.cssPosition||this.scrollParent[0]!==document&&t.contains(this.scrollParent[0],this.offsetParent[0])?this.scrollParent:this.offsetParent,h=/(html|body)/i.test(r[0].tagName);return"relative"!==this.cssPosition||this.scrollParent[0]!==document&&this.scrollParent[0]!==this.offsetParent[0]||(this.offset.relative=this._getRelativeOffset()),this.originalPosition&&(this.containment&&(e.pageX-this.offset.click.left<this.containment[0]&&(o=this.containment[0]+this.offset.click.left),e.pageY-this.offset.click.top<this.containment[1]&&(a=this.containment[1]+this.offset.click.top),e.pageX-this.offset.click.left>this.containment[2]&&(o=this.containment[2]+this.offset.click.left),e.pageY-this.offset.click.top>this.containment[3]&&(a=this.containment[3]+this.offset.click.top)),n.grid&&(i=this.originalPageY+Math.round((a-this.originalPageY)/n.grid[1])*n.grid[1],a=this.containment?i-this.offset.click.top>=this.containment[1]&&i-this.offset.click.top<=this.containment[3]?i:i-this.offset.click.top>=this.containment[1]?i-n.grid[1]:i+n.grid[1]:i,s=this.originalPageX+Math.round((o-this.originalPageX)/n.grid[0])*n.grid[0],o=this.containment?s-this.offset.click.left>=this.containment[0]&&s-this.offset.click.left<=this.containment[2]?s:s-this.offset.click.left>=this.containment[0]?s-n.grid[0]:s+n.grid[0]:s)),{top:a-this.offset.click.top-this.offset.relative.top-this.offset.parent.top+("fixed"===this.cssPosition?-this.scrollParent.scrollTop():h?0:r.scrollTop()),left:o-this.offset.click.left-this.offset.relative.left-this.offset.parent.left+("fixed"===this.cssPosition?-this.scrollParent.scrollLeft():h?0:r.scrollLeft())}},_rearrange:function(t,e,i,s){i?i[0].appendChild(this.placeholder[0]):e.item[0].parentNode.insertBefore(this.placeholder[0],"down"===this.direction?e.item[0]:e.item[0].nextSibling),this.counter=this.counter?++this.counter:1;var n=this.counter;this._delay(function(){n===this.counter&&this.refreshPositions(!s)})},_clear:function(t,e){function i(t,e,i){return function(s){i._trigger(t,s,e._uiHash(e))}}this.reverting=!1;var s,n=[];if(!this._noFinalSort&&this.currentItem.parent().length&&this.placeholder.before(this.currentItem),this._noFinalSort=null,this.helper[0]===this.currentItem[0]){for(s in this._storedCSS)("auto"===this._storedCSS[s]||"static"===this._storedCSS[s])&&(this._storedCSS[s]="");this.currentItem.css(this._storedCSS).removeClass("ui-sortable-helper")}else this.currentItem.show();for(this.fromOutside&&!e&&n.push(function(t){this._trigger("receive",t,this._uiHash(this.fromOutside))}),!this.fromOutside&&this.domPosition.prev===this.currentItem.prev().not(".ui-sortable-helper")[0]&&this.domPosition.parent===this.currentItem.parent()[0]||e||n.push(function(t){this._trigger("update",t,this._uiHash())}),this!==this.currentContainer&&(e||(n.push(function(t){this._trigger("remove",t,this._uiHash())}),n.push(function(t){return function(e){t._trigger("receive",e,this._uiHash(this))}}.call(this,this.currentContainer)),n.push(function(t){return function(e){t._trigger("update",e,this._uiHash(this))}}.call(this,this.currentContainer)))),s=this.containers.length-1;s>=0;s--)e||n.push(i("deactivate",this,this.containers[s])),this.containers[s].containerCache.over&&(n.push(i("out",this,this.containers[s])),this.containers[s].containerCache.over=0);if(this.storedCursor&&(this.document.find("body").css("cursor",this.storedCursor),this.storedStylesheet.remove()),this._storedOpacity&&this.helper.css("opacity",this._storedOpacity),this._storedZIndex&&this.helper.css("zIndex","auto"===this._storedZIndex?"":this._storedZIndex),this.dragging=!1,this.cancelHelperRemoval){if(!e){for(this._trigger("beforeStop",t,this._uiHash()),s=0;n.length>s;s++)n[s].call(this,t);this._trigger("stop",t,this._uiHash())}return this.fromOutside=!1,!1}if(e||this._trigger("beforeStop",t,this._uiHash()),this.placeholder[0].parentNode.removeChild(this.placeholder[0]),this.helper[0]!==this.currentItem[0]&&this.helper.remove(),this.helper=null,!e){for(s=0;n.length>s;s++)n[s].call(this,t);this._trigger("stop",t,this._uiHash())}return this.fromOutside=!1,!0},_trigger:function(){t.Widget.prototype._trigger.apply(this,arguments)===!1&&this.cancel()},_uiHash:function(e){var i=e||this;return{helper:i.helper,placeholder:i.placeholder||t([]),position:i.position,originalPosition:i.originalPosition,offset:i.positionAbs,item:i.currentItem,sender:e?e.element:null}}})})(jQuery);(function(e,t){function i(){this._curInst=null,this._keyEvent=!1,this._disabledInputs=[],this._datepickerShowing=!1,this._inDialog=!1,this._mainDivId="ui-datepicker-div",this._inlineClass="ui-datepicker-inline",this._appendClass="ui-datepicker-append",this._triggerClass="ui-datepicker-trigger",this._dialogClass="ui-datepicker-dialog",this._disableClass="ui-datepicker-disabled",this._unselectableClass="ui-datepicker-unselectable",this._currentClass="ui-datepicker-current-day",this._dayOverClass="ui-datepicker-days-cell-over",this.regional=[],this.regional[""]={closeText:"Done",prevText:"Prev",nextText:"Next",currentText:"Today",monthNames:["January","February","March","April","May","June","July","August","September","October","November","December"],monthNamesShort:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],dayNames:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],dayNamesShort:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],dayNamesMin:["Su","Mo","Tu","We","Th","Fr","Sa"],weekHeader:"Wk",dateFormat:"mm/dd/yy",firstDay:0,isRTL:!1,showMonthAfterYear:!1,yearSuffix:""},this._defaults={showOn:"focus",showAnim:"fadeIn",showOptions:{},defaultDate:null,appendText:"",buttonText:"...",buttonImage:"",buttonImageOnly:!1,hideIfNoPrevNext:!1,navigationAsDateFormat:!1,gotoCurrent:!1,changeMonth:!1,changeYear:!1,yearRange:"c-10:c+10",showOtherMonths:!1,selectOtherMonths:!1,showWeek:!1,calculateWeek:this.iso8601Week,shortYearCutoff:"+10",minDate:null,maxDate:null,duration:"fast",beforeShowDay:null,beforeShow:null,onSelect:null,onChangeMonthYear:null,onClose:null,numberOfMonths:1,showCurrentAtPos:0,stepMonths:1,stepBigMonths:12,altField:"",altFormat:"",constrainInput:!0,showButtonPanel:!1,autoSize:!1,disabled:!1},e.extend(this._defaults,this.regional[""]),this.dpDiv=a(e("<div id='"+this._mainDivId+"' class='ui-datepicker ui-widget ui-widget-content ui-helper-clearfix ui-corner-all'></div>"))}function a(t){var i="button, .ui-datepicker-prev, .ui-datepicker-next, .ui-datepicker-calendar td a";return t.delegate(i,"mouseout",function(){e(this).removeClass("ui-state-hover"),-1!==this.className.indexOf("ui-datepicker-prev")&&e(this).removeClass("ui-datepicker-prev-hover"),-1!==this.className.indexOf("ui-datepicker-next")&&e(this).removeClass("ui-datepicker-next-hover")}).delegate(i,"mouseover",function(){e.datepicker._isDisabledDatepicker(n.inline?t.parent()[0]:n.input[0])||(e(this).parents(".ui-datepicker-calendar").find("a").removeClass("ui-state-hover"),e(this).addClass("ui-state-hover"),-1!==this.className.indexOf("ui-datepicker-prev")&&e(this).addClass("ui-datepicker-prev-hover"),-1!==this.className.indexOf("ui-datepicker-next")&&e(this).addClass("ui-datepicker-next-hover"))})}function s(t,i){e.extend(t,i);for(var a in i)null==i[a]&&(t[a]=i[a]);return t}e.extend(e.ui,{datepicker:{version:"1.10.4"}});var n,r="datepicker";e.extend(i.prototype,{markerClassName:"hasDatepicker",maxRows:4,_widgetDatepicker:function(){return this.dpDiv},setDefaults:function(e){return s(this._defaults,e||{}),this},_attachDatepicker:function(t,i){var a,s,n;a=t.nodeName.toLowerCase(),s="div"===a||"span"===a,t.id||(this.uuid+=1,t.id="dp"+this.uuid),n=this._newInst(e(t),s),n.settings=e.extend({},i||{}),"input"===a?this._connectDatepicker(t,n):s&&this._inlineDatepicker(t,n)},_newInst:function(t,i){var s=t[0].id.replace(/([^A-Za-z0-9_\-])/g,"\\\\$1");return{id:s,input:t,selectedDay:0,selectedMonth:0,selectedYear:0,drawMonth:0,drawYear:0,inline:i,dpDiv:i?a(e("<div class='"+this._inlineClass+" ui-datepicker ui-widget ui-widget-content ui-helper-clearfix ui-corner-all'></div>")):this.dpDiv}},_connectDatepicker:function(t,i){var a=e(t);i.append=e([]),i.trigger=e([]),a.hasClass(this.markerClassName)||(this._attachments(a,i),a.addClass(this.markerClassName).keydown(this._doKeyDown).keypress(this._doKeyPress).keyup(this._doKeyUp),this._autoSize(i),e.data(t,r,i),i.settings.disabled&&this._disableDatepicker(t))},_attachments:function(t,i){var a,s,n,r=this._get(i,"appendText"),o=this._get(i,"isRTL");i.append&&i.append.remove(),r&&(i.append=e("<span class='"+this._appendClass+"'>"+r+"</span>"),t[o?"before":"after"](i.append)),t.unbind("focus",this._showDatepicker),i.trigger&&i.trigger.remove(),a=this._get(i,"showOn"),("focus"===a||"both"===a)&&t.focus(this._showDatepicker),("button"===a||"both"===a)&&(s=this._get(i,"buttonText"),n=this._get(i,"buttonImage"),i.trigger=e(this._get(i,"buttonImageOnly")?e("<img/>").addClass(this._triggerClass).attr({src:n,alt:s,title:s}):e("<button type='button'></button>").addClass(this._triggerClass).html(n?e("<img/>").attr({src:n,alt:s,title:s}):s)),t[o?"before":"after"](i.trigger),i.trigger.click(function(){return e.datepicker._datepickerShowing&&e.datepicker._lastInput===t[0]?e.datepicker._hideDatepicker():e.datepicker._datepickerShowing&&e.datepicker._lastInput!==t[0]?(e.datepicker._hideDatepicker(),e.datepicker._showDatepicker(t[0])):e.datepicker._showDatepicker(t[0]),!1}))},_autoSize:function(e){if(this._get(e,"autoSize")&&!e.inline){var t,i,a,s,n=new Date(2009,11,20),r=this._get(e,"dateFormat");r.match(/[DM]/)&&(t=function(e){for(i=0,a=0,s=0;e.length>s;s++)e[s].length>i&&(i=e[s].length,a=s);return a},n.setMonth(t(this._get(e,r.match(/MM/)?"monthNames":"monthNamesShort"))),n.setDate(t(this._get(e,r.match(/DD/)?"dayNames":"dayNamesShort"))+20-n.getDay())),e.input.attr("size",this._formatDate(e,n).length)}},_inlineDatepicker:function(t,i){var a=e(t);a.hasClass(this.markerClassName)||(a.addClass(this.markerClassName).append(i.dpDiv),e.data(t,r,i),this._setDate(i,this._getDefaultDate(i),!0),this._updateDatepicker(i),this._updateAlternate(i),i.settings.disabled&&this._disableDatepicker(t),i.dpDiv.css("display","block"))},_dialogDatepicker:function(t,i,a,n,o){var u,c,h,l,d,p=this._dialogInst;return p||(this.uuid+=1,u="dp"+this.uuid,this._dialogInput=e("<input type='text' id='"+u+"' style='position: absolute; top: -100px; width: 0px;'/>"),this._dialogInput.keydown(this._doKeyDown),e("body").append(this._dialogInput),p=this._dialogInst=this._newInst(this._dialogInput,!1),p.settings={},e.data(this._dialogInput[0],r,p)),s(p.settings,n||{}),i=i&&i.constructor===Date?this._formatDate(p,i):i,this._dialogInput.val(i),this._pos=o?o.length?o:[o.pageX,o.pageY]:null,this._pos||(c=document.documentElement.clientWidth,h=document.documentElement.clientHeight,l=document.documentElement.scrollLeft||document.body.scrollLeft,d=document.documentElement.scrollTop||document.body.scrollTop,this._pos=[c/2-100+l,h/2-150+d]),this._dialogInput.css("left",this._pos[0]+20+"px").css("top",this._pos[1]+"px"),p.settings.onSelect=a,this._inDialog=!0,this.dpDiv.addClass(this._dialogClass),this._showDatepicker(this._dialogInput[0]),e.blockUI&&e.blockUI(this.dpDiv),e.data(this._dialogInput[0],r,p),this},_destroyDatepicker:function(t){var i,a=e(t),s=e.data(t,r);a.hasClass(this.markerClassName)&&(i=t.nodeName.toLowerCase(),e.removeData(t,r),"input"===i?(s.append.remove(),s.trigger.remove(),a.removeClass(this.markerClassName).unbind("focus",this._showDatepicker).unbind("keydown",this._doKeyDown).unbind("keypress",this._doKeyPress).unbind("keyup",this._doKeyUp)):("div"===i||"span"===i)&&a.removeClass(this.markerClassName).empty())},_enableDatepicker:function(t){var i,a,s=e(t),n=e.data(t,r);s.hasClass(this.markerClassName)&&(i=t.nodeName.toLowerCase(),"input"===i?(t.disabled=!1,n.trigger.filter("button").each(function(){this.disabled=!1}).end().filter("img").css({opacity:"1.0",cursor:""})):("div"===i||"span"===i)&&(a=s.children("."+this._inlineClass),a.children().removeClass("ui-state-disabled"),a.find("select.ui-datepicker-month, select.ui-datepicker-year").prop("disabled",!1)),this._disabledInputs=e.map(this._disabledInputs,function(e){return e===t?null:e}))},_disableDatepicker:function(t){var i,a,s=e(t),n=e.data(t,r);s.hasClass(this.markerClassName)&&(i=t.nodeName.toLowerCase(),"input"===i?(t.disabled=!0,n.trigger.filter("button").each(function(){this.disabled=!0}).end().filter("img").css({opacity:"0.5",cursor:"default"})):("div"===i||"span"===i)&&(a=s.children("."+this._inlineClass),a.children().addClass("ui-state-disabled"),a.find("select.ui-datepicker-month, select.ui-datepicker-year").prop("disabled",!0)),this._disabledInputs=e.map(this._disabledInputs,function(e){return e===t?null:e}),this._disabledInputs[this._disabledInputs.length]=t)},_isDisabledDatepicker:function(e){if(!e)return!1;for(var t=0;this._disabledInputs.length>t;t++)if(this._disabledInputs[t]===e)return!0;return!1},_getInst:function(t){try{return e.data(t,r)}catch(i){throw"Missing instance data for this datepicker"}},_optionDatepicker:function(i,a,n){var r,o,u,c,h=this._getInst(i);return 2===arguments.length&&"string"==typeof a?"defaults"===a?e.extend({},e.datepicker._defaults):h?"all"===a?e.extend({},h.settings):this._get(h,a):null:(r=a||{},"string"==typeof a&&(r={},r[a]=n),h&&(this._curInst===h&&this._hideDatepicker(),o=this._getDateDatepicker(i,!0),u=this._getMinMaxDate(h,"min"),c=this._getMinMaxDate(h,"max"),s(h.settings,r),null!==u&&r.dateFormat!==t&&r.minDate===t&&(h.settings.minDate=this._formatDate(h,u)),null!==c&&r.dateFormat!==t&&r.maxDate===t&&(h.settings.maxDate=this._formatDate(h,c)),"disabled"in r&&(r.disabled?this._disableDatepicker(i):this._enableDatepicker(i)),this._attachments(e(i),h),this._autoSize(h),this._setDate(h,o),this._updateAlternate(h),this._updateDatepicker(h)),t)},_changeDatepicker:function(e,t,i){this._optionDatepicker(e,t,i)},_refreshDatepicker:function(e){var t=this._getInst(e);t&&this._updateDatepicker(t)},_setDateDatepicker:function(e,t){var i=this._getInst(e);i&&(this._setDate(i,t),this._updateDatepicker(i),this._updateAlternate(i))},_getDateDatepicker:function(e,t){var i=this._getInst(e);return i&&!i.inline&&this._setDateFromField(i,t),i?this._getDate(i):null},_doKeyDown:function(t){var i,a,s,n=e.datepicker._getInst(t.target),r=!0,o=n.dpDiv.is(".ui-datepicker-rtl");if(n._keyEvent=!0,e.datepicker._datepickerShowing)switch(t.keyCode){case 9:e.datepicker._hideDatepicker(),r=!1;break;case 13:return s=e("td."+e.datepicker._dayOverClass+":not(."+e.datepicker._currentClass+")",n.dpDiv),s[0]&&e.datepicker._selectDay(t.target,n.selectedMonth,n.selectedYear,s[0]),i=e.datepicker._get(n,"onSelect"),i?(a=e.datepicker._formatDate(n),i.apply(n.input?n.input[0]:null,[a,n])):e.datepicker._hideDatepicker(),!1;case 27:e.datepicker._hideDatepicker();break;case 33:e.datepicker._adjustDate(t.target,t.ctrlKey?-e.datepicker._get(n,"stepBigMonths"):-e.datepicker._get(n,"stepMonths"),"M");break;case 34:e.datepicker._adjustDate(t.target,t.ctrlKey?+e.datepicker._get(n,"stepBigMonths"):+e.datepicker._get(n,"stepMonths"),"M");break;case 35:(t.ctrlKey||t.metaKey)&&e.datepicker._clearDate(t.target),r=t.ctrlKey||t.metaKey;break;case 36:(t.ctrlKey||t.metaKey)&&e.datepicker._gotoToday(t.target),r=t.ctrlKey||t.metaKey;break;case 37:(t.ctrlKey||t.metaKey)&&e.datepicker._adjustDate(t.target,o?1:-1,"D"),r=t.ctrlKey||t.metaKey,t.originalEvent.altKey&&e.datepicker._adjustDate(t.target,t.ctrlKey?-e.datepicker._get(n,"stepBigMonths"):-e.datepicker._get(n,"stepMonths"),"M");break;case 38:(t.ctrlKey||t.metaKey)&&e.datepicker._adjustDate(t.target,-7,"D"),r=t.ctrlKey||t.metaKey;break;case 39:(t.ctrlKey||t.metaKey)&&e.datepicker._adjustDate(t.target,o?-1:1,"D"),r=t.ctrlKey||t.metaKey,t.originalEvent.altKey&&e.datepicker._adjustDate(t.target,t.ctrlKey?+e.datepicker._get(n,"stepBigMonths"):+e.datepicker._get(n,"stepMonths"),"M");break;case 40:(t.ctrlKey||t.metaKey)&&e.datepicker._adjustDate(t.target,7,"D"),r=t.ctrlKey||t.metaKey;break;default:r=!1}else 36===t.keyCode&&t.ctrlKey?e.datepicker._showDatepicker(this):r=!1;r&&(t.preventDefault(),t.stopPropagation())},_doKeyPress:function(i){var a,s,n=e.datepicker._getInst(i.target);return e.datepicker._get(n,"constrainInput")?(a=e.datepicker._possibleChars(e.datepicker._get(n,"dateFormat")),s=String.fromCharCode(null==i.charCode?i.keyCode:i.charCode),i.ctrlKey||i.metaKey||" ">s||!a||a.indexOf(s)>-1):t},_doKeyUp:function(t){var i,a=e.datepicker._getInst(t.target);if(a.input.val()!==a.lastVal)try{i=e.datepicker.parseDate(e.datepicker._get(a,"dateFormat"),a.input?a.input.val():null,e.datepicker._getFormatConfig(a)),i&&(e.datepicker._setDateFromField(a),e.datepicker._updateAlternate(a),e.datepicker._updateDatepicker(a))}catch(s){}return!0},_showDatepicker:function(t){if(t=t.target||t,"input"!==t.nodeName.toLowerCase()&&(t=e("input",t.parentNode)[0]),!e.datepicker._isDisabledDatepicker(t)&&e.datepicker._lastInput!==t){var i,a,n,r,o,u,c;i=e.datepicker._getInst(t),e.datepicker._curInst&&e.datepicker._curInst!==i&&(e.datepicker._curInst.dpDiv.stop(!0,!0),i&&e.datepicker._datepickerShowing&&e.datepicker._hideDatepicker(e.datepicker._curInst.input[0])),a=e.datepicker._get(i,"beforeShow"),n=a?a.apply(t,[t,i]):{},n!==!1&&(s(i.settings,n),i.lastVal=null,e.datepicker._lastInput=t,e.datepicker._setDateFromField(i),e.datepicker._inDialog&&(t.value=""),e.datepicker._pos||(e.datepicker._pos=e.datepicker._findPos(t),e.datepicker._pos[1]+=t.offsetHeight),r=!1,e(t).parents().each(function(){return r|="fixed"===e(this).css("position"),!r}),o={left:e.datepicker._pos[0],top:e.datepicker._pos[1]},e.datepicker._pos=null,i.dpDiv.empty(),i.dpDiv.css({position:"absolute",display:"block",top:"-1000px"}),e.datepicker._updateDatepicker(i),o=e.datepicker._checkOffset(i,o,r),i.dpDiv.css({position:e.datepicker._inDialog&&e.blockUI?"static":r?"fixed":"absolute",display:"none",left:o.left+"px",top:o.top+"px"}),i.inline||(u=e.datepicker._get(i,"showAnim"),c=e.datepicker._get(i,"duration"),i.dpDiv.zIndex(e(t).zIndex()+1),e.datepicker._datepickerShowing=!0,e.effects&&e.effects.effect[u]?i.dpDiv.show(u,e.datepicker._get(i,"showOptions"),c):i.dpDiv[u||"show"](u?c:null),e.datepicker._shouldFocusInput(i)&&i.input.focus(),e.datepicker._curInst=i))}},_updateDatepicker:function(t){this.maxRows=4,n=t,t.dpDiv.empty().append(this._generateHTML(t)),this._attachHandlers(t),t.dpDiv.find("."+this._dayOverClass+" a").mouseover();var i,a=this._getNumberOfMonths(t),s=a[1],r=17;t.dpDiv.removeClass("ui-datepicker-multi-2 ui-datepicker-multi-3 ui-datepicker-multi-4").width(""),s>1&&t.dpDiv.addClass("ui-datepicker-multi-"+s).css("width",r*s+"em"),t.dpDiv[(1!==a[0]||1!==a[1]?"add":"remove")+"Class"]("ui-datepicker-multi"),t.dpDiv[(this._get(t,"isRTL")?"add":"remove")+"Class"]("ui-datepicker-rtl"),t===e.datepicker._curInst&&e.datepicker._datepickerShowing&&e.datepicker._shouldFocusInput(t)&&t.input.focus(),t.yearshtml&&(i=t.yearshtml,setTimeout(function(){i===t.yearshtml&&t.yearshtml&&t.dpDiv.find("select.ui-datepicker-year:first").replaceWith(t.yearshtml),i=t.yearshtml=null},0))},_shouldFocusInput:function(e){return e.input&&e.input.is(":visible")&&!e.input.is(":disabled")&&!e.input.is(":focus")},_checkOffset:function(t,i,a){var s=t.dpDiv.outerWidth(),n=t.dpDiv.outerHeight(),r=t.input?t.input.outerWidth():0,o=t.input?t.input.outerHeight():0,u=document.documentElement.clientWidth+(a?0:e(document).scrollLeft()),c=document.documentElement.clientHeight+(a?0:e(document).scrollTop());return i.left-=this._get(t,"isRTL")?s-r:0,i.left-=a&&i.left===t.input.offset().left?e(document).scrollLeft():0,i.top-=a&&i.top===t.input.offset().top+o?e(document).scrollTop():0,i.left-=Math.min(i.left,i.left+s>u&&u>s?Math.abs(i.left+s-u):0),i.top-=Math.min(i.top,i.top+n>c&&c>n?Math.abs(n+o):0),i},_findPos:function(t){for(var i,a=this._getInst(t),s=this._get(a,"isRTL");t&&("hidden"===t.type||1!==t.nodeType||e.expr.filters.hidden(t));)t=t[s?"previousSibling":"nextSibling"];return i=e(t).offset(),[i.left,i.top]},_hideDatepicker:function(t){var i,a,s,n,o=this._curInst;!o||t&&o!==e.data(t,r)||this._datepickerShowing&&(i=this._get(o,"showAnim"),a=this._get(o,"duration"),s=function(){e.datepicker._tidyDialog(o)},e.effects&&(e.effects.effect[i]||e.effects[i])?o.dpDiv.hide(i,e.datepicker._get(o,"showOptions"),a,s):o.dpDiv["slideDown"===i?"slideUp":"fadeIn"===i?"fadeOut":"hide"](i?a:null,s),i||s(),this._datepickerShowing=!1,n=this._get(o,"onClose"),n&&n.apply(o.input?o.input[0]:null,[o.input?o.input.val():"",o]),this._lastInput=null,this._inDialog&&(this._dialogInput.css({position:"absolute",left:"0",top:"-100px"}),e.blockUI&&(e.unblockUI(),e("body").append(this.dpDiv))),this._inDialog=!1)},_tidyDialog:function(e){e.dpDiv.removeClass(this._dialogClass).unbind(".ui-datepicker-calendar")},_checkExternalClick:function(t){if(e.datepicker._curInst){var i=e(t.target),a=e.datepicker._getInst(i[0]);(i[0].id!==e.datepicker._mainDivId&&0===i.parents("#"+e.datepicker._mainDivId).length&&!i.hasClass(e.datepicker.markerClassName)&&!i.closest("."+e.datepicker._triggerClass).length&&e.datepicker._datepickerShowing&&(!e.datepicker._inDialog||!e.blockUI)||i.hasClass(e.datepicker.markerClassName)&&e.datepicker._curInst!==a)&&e.datepicker._hideDatepicker()}},_adjustDate:function(t,i,a){var s=e(t),n=this._getInst(s[0]);this._isDisabledDatepicker(s[0])||(this._adjustInstDate(n,i+("M"===a?this._get(n,"showCurrentAtPos"):0),a),this._updateDatepicker(n))},_gotoToday:function(t){var i,a=e(t),s=this._getInst(a[0]);this._get(s,"gotoCurrent")&&s.currentDay?(s.selectedDay=s.currentDay,s.drawMonth=s.selectedMonth=s.currentMonth,s.drawYear=s.selectedYear=s.currentYear):(i=new Date,s.selectedDay=i.getDate(),s.drawMonth=s.selectedMonth=i.getMonth(),s.drawYear=s.selectedYear=i.getFullYear()),this._notifyChange(s),this._adjustDate(a)},_selectMonthYear:function(t,i,a){var s=e(t),n=this._getInst(s[0]);n["selected"+("M"===a?"Month":"Year")]=n["draw"+("M"===a?"Month":"Year")]=parseInt(i.options[i.selectedIndex].value,10),this._notifyChange(n),this._adjustDate(s)},_selectDay:function(t,i,a,s){var n,r=e(t);e(s).hasClass(this._unselectableClass)||this._isDisabledDatepicker(r[0])||(n=this._getInst(r[0]),n.selectedDay=n.currentDay=e("a",s).html(),n.selectedMonth=n.currentMonth=i,n.selectedYear=n.currentYear=a,this._selectDate(t,this._formatDate(n,n.currentDay,n.currentMonth,n.currentYear)))},_clearDate:function(t){var i=e(t);this._selectDate(i,"")},_selectDate:function(t,i){var a,s=e(t),n=this._getInst(s[0]);i=null!=i?i:this._formatDate(n),n.input&&n.input.val(i),this._updateAlternate(n),a=this._get(n,"onSelect"),a?a.apply(n.input?n.input[0]:null,[i,n]):n.input&&n.input.trigger("change"),n.inline?this._updateDatepicker(n):(this._hideDatepicker(),this._lastInput=n.input[0],"object"!=typeof n.input[0]&&n.input.focus(),this._lastInput=null)},_updateAlternate:function(t){var i,a,s,n=this._get(t,"altField");n&&(i=this._get(t,"altFormat")||this._get(t,"dateFormat"),a=this._getDate(t),s=this.formatDate(i,a,this._getFormatConfig(t)),e(n).each(function(){e(this).val(s)}))},noWeekends:function(e){var t=e.getDay();return[t>0&&6>t,""]},iso8601Week:function(e){var t,i=new Date(e.getTime());return i.setDate(i.getDate()+4-(i.getDay()||7)),t=i.getTime(),i.setMonth(0),i.setDate(1),Math.floor(Math.round((t-i)/864e5)/7)+1},parseDate:function(i,a,s){if(null==i||null==a)throw"Invalid arguments";if(a="object"==typeof a?""+a:a+"",""===a)return null;var n,r,o,u,c=0,h=(s?s.shortYearCutoff:null)||this._defaults.shortYearCutoff,l="string"!=typeof h?h:(new Date).getFullYear()%100+parseInt(h,10),d=(s?s.dayNamesShort:null)||this._defaults.dayNamesShort,p=(s?s.dayNames:null)||this._defaults.dayNames,g=(s?s.monthNamesShort:null)||this._defaults.monthNamesShort,m=(s?s.monthNames:null)||this._defaults.monthNames,f=-1,_=-1,v=-1,k=-1,y=!1,b=function(e){var t=i.length>n+1&&i.charAt(n+1)===e;return t&&n++,t},D=function(e){var t=b(e),i="@"===e?14:"!"===e?20:"y"===e&&t?4:"o"===e?3:2,s=RegExp("^\\d{1,"+i+"}"),n=a.substring(c).match(s);if(!n)throw"Missing number at position "+c;return c+=n[0].length,parseInt(n[0],10)},w=function(i,s,n){var r=-1,o=e.map(b(i)?n:s,function(e,t){return[[t,e]]}).sort(function(e,t){return-(e[1].length-t[1].length)});if(e.each(o,function(e,i){var s=i[1];return a.substr(c,s.length).toLowerCase()===s.toLowerCase()?(r=i[0],c+=s.length,!1):t}),-1!==r)return r+1;throw"Unknown name at position "+c},M=function(){if(a.charAt(c)!==i.charAt(n))throw"Unexpected literal at position "+c;c++};for(n=0;i.length>n;n++)if(y)"'"!==i.charAt(n)||b("'")?M():y=!1;else switch(i.charAt(n)){case"d":v=D("d");break;case"D":w("D",d,p);break;case"o":k=D("o");break;case"m":_=D("m");break;case"M":_=w("M",g,m);break;case"y":f=D("y");break;case"@":u=new Date(D("@")),f=u.getFullYear(),_=u.getMonth()+1,v=u.getDate();break;case"!":u=new Date((D("!")-this._ticksTo1970)/1e4),f=u.getFullYear(),_=u.getMonth()+1,v=u.getDate();break;case"'":b("'")?M():y=!0;break;default:M()}if(a.length>c&&(o=a.substr(c),!/^\s+/.test(o)))throw"Extra/unparsed characters found in date: "+o;if(-1===f?f=(new Date).getFullYear():100>f&&(f+=(new Date).getFullYear()-(new Date).getFullYear()%100+(l>=f?0:-100)),k>-1)for(_=1,v=k;;){if(r=this._getDaysInMonth(f,_-1),r>=v)break;_++,v-=r}if(u=this._daylightSavingAdjust(new Date(f,_-1,v)),u.getFullYear()!==f||u.getMonth()+1!==_||u.getDate()!==v)throw"Invalid date";return u},ATOM:"yy-mm-dd",COOKIE:"D, dd M yy",ISO_8601:"yy-mm-dd",RFC_822:"D, d M y",RFC_850:"DD, dd-M-y",RFC_1036:"D, d M y",RFC_1123:"D, d M yy",RFC_2822:"D, d M yy",RSS:"D, d M y",TICKS:"!",TIMESTAMP:"@",W3C:"yy-mm-dd",_ticksTo1970:1e7*60*60*24*(718685+Math.floor(492.5)-Math.floor(19.7)+Math.floor(4.925)),formatDate:function(e,t,i){if(!t)return"";var a,s=(i?i.dayNamesShort:null)||this._defaults.dayNamesShort,n=(i?i.dayNames:null)||this._defaults.dayNames,r=(i?i.monthNamesShort:null)||this._defaults.monthNamesShort,o=(i?i.monthNames:null)||this._defaults.monthNames,u=function(t){var i=e.length>a+1&&e.charAt(a+1)===t;return i&&a++,i},c=function(e,t,i){var a=""+t;if(u(e))for(;i>a.length;)a="0"+a;return a},h=function(e,t,i,a){return u(e)?a[t]:i[t]},l="",d=!1;if(t)for(a=0;e.length>a;a++)if(d)"'"!==e.charAt(a)||u("'")?l+=e.charAt(a):d=!1;else switch(e.charAt(a)){case"d":l+=c("d",t.getDate(),2);break;case"D":l+=h("D",t.getDay(),s,n);break;case"o":l+=c("o",Math.round((new Date(t.getFullYear(),t.getMonth(),t.getDate()).getTime()-new Date(t.getFullYear(),0,0).getTime())/864e5),3);break;case"m":l+=c("m",t.getMonth()+1,2);break;case"M":l+=h("M",t.getMonth(),r,o);break;case"y":l+=u("y")?t.getFullYear():(10>t.getYear()%100?"0":"")+t.getYear()%100;break;case"@":l+=t.getTime();break;case"!":l+=1e4*t.getTime()+this._ticksTo1970;break;case"'":u("'")?l+="'":d=!0;break;default:l+=e.charAt(a)}return l},_possibleChars:function(e){var t,i="",a=!1,s=function(i){var a=e.length>t+1&&e.charAt(t+1)===i;return a&&t++,a};for(t=0;e.length>t;t++)if(a)"'"!==e.charAt(t)||s("'")?i+=e.charAt(t):a=!1;else switch(e.charAt(t)){case"d":case"m":case"y":case"@":i+="0123456789";break;case"D":case"M":return null;case"'":s("'")?i+="'":a=!0;break;default:i+=e.charAt(t)}return i},_get:function(e,i){return e.settings[i]!==t?e.settings[i]:this._defaults[i]},_setDateFromField:function(e,t){if(e.input.val()!==e.lastVal){var i=this._get(e,"dateFormat"),a=e.lastVal=e.input?e.input.val():null,s=this._getDefaultDate(e),n=s,r=this._getFormatConfig(e);try{n=this.parseDate(i,a,r)||s}catch(o){a=t?"":a}e.selectedDay=n.getDate(),e.drawMonth=e.selectedMonth=n.getMonth(),e.drawYear=e.selectedYear=n.getFullYear(),e.currentDay=a?n.getDate():0,e.currentMonth=a?n.getMonth():0,e.currentYear=a?n.getFullYear():0,this._adjustInstDate(e)}},_getDefaultDate:function(e){return this._restrictMinMax(e,this._determineDate(e,this._get(e,"defaultDate"),new Date))},_determineDate:function(t,i,a){var s=function(e){var t=new Date;return t.setDate(t.getDate()+e),t},n=function(i){try{return e.datepicker.parseDate(e.datepicker._get(t,"dateFormat"),i,e.datepicker._getFormatConfig(t))}catch(a){}for(var s=(i.toLowerCase().match(/^c/)?e.datepicker._getDate(t):null)||new Date,n=s.getFullYear(),r=s.getMonth(),o=s.getDate(),u=/([+\-]?[0-9]+)\s*(d|D|w|W|m|M|y|Y)?/g,c=u.exec(i);c;){switch(c[2]||"d"){case"d":case"D":o+=parseInt(c[1],10);break;case"w":case"W":o+=7*parseInt(c[1],10);break;case"m":case"M":r+=parseInt(c[1],10),o=Math.min(o,e.datepicker._getDaysInMonth(n,r));break;case"y":case"Y":n+=parseInt(c[1],10),o=Math.min(o,e.datepicker._getDaysInMonth(n,r))}c=u.exec(i)}return new Date(n,r,o)},r=null==i||""===i?a:"string"==typeof i?n(i):"number"==typeof i?isNaN(i)?a:s(i):new Date(i.getTime());return r=r&&"Invalid Date"==""+r?a:r,r&&(r.setHours(0),r.setMinutes(0),r.setSeconds(0),r.setMilliseconds(0)),this._daylightSavingAdjust(r)},_daylightSavingAdjust:function(e){return e?(e.setHours(e.getHours()>12?e.getHours()+2:0),e):null},_setDate:function(e,t,i){var a=!t,s=e.selectedMonth,n=e.selectedYear,r=this._restrictMinMax(e,this._determineDate(e,t,new Date));e.selectedDay=e.currentDay=r.getDate(),e.drawMonth=e.selectedMonth=e.currentMonth=r.getMonth(),e.drawYear=e.selectedYear=e.currentYear=r.getFullYear(),s===e.selectedMonth&&n===e.selectedYear||i||this._notifyChange(e),this._adjustInstDate(e),e.input&&e.input.val(a?"":this._formatDate(e))},_getDate:function(e){var t=!e.currentYear||e.input&&""===e.input.val()?null:this._daylightSavingAdjust(new Date(e.currentYear,e.currentMonth,e.currentDay));return t},_attachHandlers:function(t){var i=this._get(t,"stepMonths"),a="#"+t.id.replace(/\\\\/g,"\\");t.dpDiv.find("[data-handler]").map(function(){var t={prev:function(){e.datepicker._adjustDate(a,-i,"M")},next:function(){e.datepicker._adjustDate(a,+i,"M")},hide:function(){e.datepicker._hideDatepicker()},today:function(){e.datepicker._gotoToday(a)},selectDay:function(){return e.datepicker._selectDay(a,+this.getAttribute("data-month"),+this.getAttribute("data-year"),this),!1},selectMonth:function(){return e.datepicker._selectMonthYear(a,this,"M"),!1},selectYear:function(){return e.datepicker._selectMonthYear(a,this,"Y"),!1}};e(this).bind(this.getAttribute("data-event"),t[this.getAttribute("data-handler")])})},_generateHTML:function(e){var t,i,a,s,n,r,o,u,c,h,l,d,p,g,m,f,_,v,k,y,b,D,w,M,C,x,I,N,T,A,E,S,Y,F,P,O,j,K,R,H=new Date,W=this._daylightSavingAdjust(new Date(H.getFullYear(),H.getMonth(),H.getDate())),L=this._get(e,"isRTL"),U=this._get(e,"showButtonPanel"),B=this._get(e,"hideIfNoPrevNext"),z=this._get(e,"navigationAsDateFormat"),q=this._getNumberOfMonths(e),G=this._get(e,"showCurrentAtPos"),J=this._get(e,"stepMonths"),Q=1!==q[0]||1!==q[1],V=this._daylightSavingAdjust(e.currentDay?new Date(e.currentYear,e.currentMonth,e.currentDay):new Date(9999,9,9)),$=this._getMinMaxDate(e,"min"),X=this._getMinMaxDate(e,"max"),Z=e.drawMonth-G,et=e.drawYear;if(0>Z&&(Z+=12,et--),X)for(t=this._daylightSavingAdjust(new Date(X.getFullYear(),X.getMonth()-q[0]*q[1]+1,X.getDate())),t=$&&$>t?$:t;this._daylightSavingAdjust(new Date(et,Z,1))>t;)Z--,0>Z&&(Z=11,et--);for(e.drawMonth=Z,e.drawYear=et,i=this._get(e,"prevText"),i=z?this.formatDate(i,this._daylightSavingAdjust(new Date(et,Z-J,1)),this._getFormatConfig(e)):i,a=this._canAdjustMonth(e,-1,et,Z)?"<a class='ui-datepicker-prev ui-corner-all' data-handler='prev' data-event='click' title='"+i+"'><span class='ui-icon ui-icon-circle-triangle-"+(L?"e":"w")+"'>"+i+"</span></a>":B?"":"<a class='ui-datepicker-prev ui-corner-all ui-state-disabled' title='"+i+"'><span class='ui-icon ui-icon-circle-triangle-"+(L?"e":"w")+"'>"+i+"</span></a>",s=this._get(e,"nextText"),s=z?this.formatDate(s,this._daylightSavingAdjust(new Date(et,Z+J,1)),this._getFormatConfig(e)):s,n=this._canAdjustMonth(e,1,et,Z)?"<a class='ui-datepicker-next ui-corner-all' data-handler='next' data-event='click' title='"+s+"'><span class='ui-icon ui-icon-circle-triangle-"+(L?"w":"e")+"'>"+s+"</span></a>":B?"":"<a class='ui-datepicker-next ui-corner-all ui-state-disabled' title='"+s+"'><span class='ui-icon ui-icon-circle-triangle-"+(L?"w":"e")+"'>"+s+"</span></a>",r=this._get(e,"currentText"),o=this._get(e,"gotoCurrent")&&e.currentDay?V:W,r=z?this.formatDate(r,o,this._getFormatConfig(e)):r,u=e.inline?"":"<button type='button' class='ui-datepicker-close ui-state-default ui-priority-primary ui-corner-all' data-handler='hide' data-event='click'>"+this._get(e,"closeText")+"</button>",c=U?"<div class='ui-datepicker-buttonpane ui-widget-content'>"+(L?u:"")+(this._isInRange(e,o)?"<button type='button' class='ui-datepicker-current ui-state-default ui-priority-secondary ui-corner-all' data-handler='today' data-event='click'>"+r+"</button>":"")+(L?"":u)+"</div>":"",h=parseInt(this._get(e,"firstDay"),10),h=isNaN(h)?0:h,l=this._get(e,"showWeek"),d=this._get(e,"dayNames"),p=this._get(e,"dayNamesMin"),g=this._get(e,"monthNames"),m=this._get(e,"monthNamesShort"),f=this._get(e,"beforeShowDay"),_=this._get(e,"showOtherMonths"),v=this._get(e,"selectOtherMonths"),k=this._getDefaultDate(e),y="",D=0;q[0]>D;D++){for(w="",this.maxRows=4,M=0;q[1]>M;M++){if(C=this._daylightSavingAdjust(new Date(et,Z,e.selectedDay)),x=" ui-corner-all",I="",Q){if(I+="<div class='ui-datepicker-group",q[1]>1)switch(M){case 0:I+=" ui-datepicker-group-first",x=" ui-corner-"+(L?"right":"left");break;case q[1]-1:I+=" ui-datepicker-group-last",x=" ui-corner-"+(L?"left":"right");break;default:I+=" ui-datepicker-group-middle",x=""}I+="'>"}for(I+="<div class='ui-datepicker-header ui-widget-header ui-helper-clearfix"+x+"'>"+(/all|left/.test(x)&&0===D?L?n:a:"")+(/all|right/.test(x)&&0===D?L?a:n:"")+this._generateMonthYearHeader(e,Z,et,$,X,D>0||M>0,g,m)+"</div><table class='ui-datepicker-calendar'><thead>"+"<tr>",N=l?"<th class='ui-datepicker-week-col'>"+this._get(e,"weekHeader")+"</th>":"",b=0;7>b;b++)T=(b+h)%7,N+="<th"+((b+h+6)%7>=5?" class='ui-datepicker-week-end'":"")+">"+"<span title='"+d[T]+"'>"+p[T]+"</span></th>";for(I+=N+"</tr></thead><tbody>",A=this._getDaysInMonth(et,Z),et===e.selectedYear&&Z===e.selectedMonth&&(e.selectedDay=Math.min(e.selectedDay,A)),E=(this._getFirstDayOfMonth(et,Z)-h+7)%7,S=Math.ceil((E+A)/7),Y=Q?this.maxRows>S?this.maxRows:S:S,this.maxRows=Y,F=this._daylightSavingAdjust(new Date(et,Z,1-E)),P=0;Y>P;P++){for(I+="<tr>",O=l?"<td class='ui-datepicker-week-col'>"+this._get(e,"calculateWeek")(F)+"</td>":"",b=0;7>b;b++)j=f?f.apply(e.input?e.input[0]:null,[F]):[!0,""],K=F.getMonth()!==Z,R=K&&!v||!j[0]||$&&$>F||X&&F>X,O+="<td class='"+((b+h+6)%7>=5?" ui-datepicker-week-end":"")+(K?" ui-datepicker-other-month":"")+(F.getTime()===C.getTime()&&Z===e.selectedMonth&&e._keyEvent||k.getTime()===F.getTime()&&k.getTime()===C.getTime()?" "+this._dayOverClass:"")+(R?" "+this._unselectableClass+" ui-state-disabled":"")+(K&&!_?"":" "+j[1]+(F.getTime()===V.getTime()?" "+this._currentClass:"")+(F.getTime()===W.getTime()?" ui-datepicker-today":""))+"'"+(K&&!_||!j[2]?"":" title='"+j[2].replace(/'/g,"&#39;")+"'")+(R?"":" data-handler='selectDay' data-event='click' data-month='"+F.getMonth()+"' data-year='"+F.getFullYear()+"'")+">"+(K&&!_?"&#xa0;":R?"<span class='ui-state-default'>"+F.getDate()+"</span>":"<a class='ui-state-default"+(F.getTime()===W.getTime()?" ui-state-highlight":"")+(F.getTime()===V.getTime()?" ui-state-active":"")+(K?" ui-priority-secondary":"")+"' href='#'>"+F.getDate()+"</a>")+"</td>",F.setDate(F.getDate()+1),F=this._daylightSavingAdjust(F);I+=O+"</tr>"}Z++,Z>11&&(Z=0,et++),I+="</tbody></table>"+(Q?"</div>"+(q[0]>0&&M===q[1]-1?"<div class='ui-datepicker-row-break'></div>":""):""),w+=I}y+=w}return y+=c,e._keyEvent=!1,y},_generateMonthYearHeader:function(e,t,i,a,s,n,r,o){var u,c,h,l,d,p,g,m,f=this._get(e,"changeMonth"),_=this._get(e,"changeYear"),v=this._get(e,"showMonthAfterYear"),k="<div class='ui-datepicker-title'>",y="";if(n||!f)y+="<span class='ui-datepicker-month'>"+r[t]+"</span>";else{for(u=a&&a.getFullYear()===i,c=s&&s.getFullYear()===i,y+="<select class='ui-datepicker-month' data-handler='selectMonth' data-event='change'>",h=0;12>h;h++)(!u||h>=a.getMonth())&&(!c||s.getMonth()>=h)&&(y+="<option value='"+h+"'"+(h===t?" selected='selected'":"")+">"+o[h]+"</option>");y+="</select>"}if(v||(k+=y+(!n&&f&&_?"":"&#xa0;")),!e.yearshtml)if(e.yearshtml="",n||!_)k+="<span class='ui-datepicker-year'>"+i+"</span>";else{for(l=this._get(e,"yearRange").split(":"),d=(new Date).getFullYear(),p=function(e){var t=e.match(/c[+\-].*/)?i+parseInt(e.substring(1),10):e.match(/[+\-].*/)?d+parseInt(e,10):parseInt(e,10);
return isNaN(t)?d:t},g=p(l[0]),m=Math.max(g,p(l[1]||"")),g=a?Math.max(g,a.getFullYear()):g,m=s?Math.min(m,s.getFullYear()):m,e.yearshtml+="<select class='ui-datepicker-year' data-handler='selectYear' data-event='change'>";m>=g;g++)e.yearshtml+="<option value='"+g+"'"+(g===i?" selected='selected'":"")+">"+g+"</option>";e.yearshtml+="</select>",k+=e.yearshtml,e.yearshtml=null}return k+=this._get(e,"yearSuffix"),v&&(k+=(!n&&f&&_?"":"&#xa0;")+y),k+="</div>"},_adjustInstDate:function(e,t,i){var a=e.drawYear+("Y"===i?t:0),s=e.drawMonth+("M"===i?t:0),n=Math.min(e.selectedDay,this._getDaysInMonth(a,s))+("D"===i?t:0),r=this._restrictMinMax(e,this._daylightSavingAdjust(new Date(a,s,n)));e.selectedDay=r.getDate(),e.drawMonth=e.selectedMonth=r.getMonth(),e.drawYear=e.selectedYear=r.getFullYear(),("M"===i||"Y"===i)&&this._notifyChange(e)},_restrictMinMax:function(e,t){var i=this._getMinMaxDate(e,"min"),a=this._getMinMaxDate(e,"max"),s=i&&i>t?i:t;return a&&s>a?a:s},_notifyChange:function(e){var t=this._get(e,"onChangeMonthYear");t&&t.apply(e.input?e.input[0]:null,[e.selectedYear,e.selectedMonth+1,e])},_getNumberOfMonths:function(e){var t=this._get(e,"numberOfMonths");return null==t?[1,1]:"number"==typeof t?[1,t]:t},_getMinMaxDate:function(e,t){return this._determineDate(e,this._get(e,t+"Date"),null)},_getDaysInMonth:function(e,t){return 32-this._daylightSavingAdjust(new Date(e,t,32)).getDate()},_getFirstDayOfMonth:function(e,t){return new Date(e,t,1).getDay()},_canAdjustMonth:function(e,t,i,a){var s=this._getNumberOfMonths(e),n=this._daylightSavingAdjust(new Date(i,a+(0>t?t:s[0]*s[1]),1));return 0>t&&n.setDate(this._getDaysInMonth(n.getFullYear(),n.getMonth())),this._isInRange(e,n)},_isInRange:function(e,t){var i,a,s=this._getMinMaxDate(e,"min"),n=this._getMinMaxDate(e,"max"),r=null,o=null,u=this._get(e,"yearRange");return u&&(i=u.split(":"),a=(new Date).getFullYear(),r=parseInt(i[0],10),o=parseInt(i[1],10),i[0].match(/[+\-].*/)&&(r+=a),i[1].match(/[+\-].*/)&&(o+=a)),(!s||t.getTime()>=s.getTime())&&(!n||t.getTime()<=n.getTime())&&(!r||t.getFullYear()>=r)&&(!o||o>=t.getFullYear())},_getFormatConfig:function(e){var t=this._get(e,"shortYearCutoff");return t="string"!=typeof t?t:(new Date).getFullYear()%100+parseInt(t,10),{shortYearCutoff:t,dayNamesShort:this._get(e,"dayNamesShort"),dayNames:this._get(e,"dayNames"),monthNamesShort:this._get(e,"monthNamesShort"),monthNames:this._get(e,"monthNames")}},_formatDate:function(e,t,i,a){t||(e.currentDay=e.selectedDay,e.currentMonth=e.selectedMonth,e.currentYear=e.selectedYear);var s=t?"object"==typeof t?t:this._daylightSavingAdjust(new Date(a,i,t)):this._daylightSavingAdjust(new Date(e.currentYear,e.currentMonth,e.currentDay));return this.formatDate(this._get(e,"dateFormat"),s,this._getFormatConfig(e))}}),e.fn.datepicker=function(t){if(!this.length)return this;e.datepicker.initialized||(e(document).mousedown(e.datepicker._checkExternalClick),e.datepicker.initialized=!0),0===e("#"+e.datepicker._mainDivId).length&&e("body").append(e.datepicker.dpDiv);var i=Array.prototype.slice.call(arguments,1);return"string"!=typeof t||"isDisabled"!==t&&"getDate"!==t&&"widget"!==t?"option"===t&&2===arguments.length&&"string"==typeof arguments[1]?e.datepicker["_"+t+"Datepicker"].apply(e.datepicker,[this[0]].concat(i)):this.each(function(){"string"==typeof t?e.datepicker["_"+t+"Datepicker"].apply(e.datepicker,[this].concat(i)):e.datepicker._attachDatepicker(this,t)}):e.datepicker["_"+t+"Datepicker"].apply(e.datepicker,[this[0]].concat(i))},e.datepicker=new i,e.datepicker.initialized=!1,e.datepicker.uuid=(new Date).getTime(),e.datepicker.version="1.10.4"})(jQuery);

/* Danish initialisation for the jQuery UI date picker plugin. */
/* Written by Jan Christensen ( deletestuff@gmail.com). */
jQuery(function($){
	$.datepicker.regional['da'] = {
		closeText: 'Luk',
		prevText: '&#x3C;Forrige',
		nextText: 'N?ste&#x3E;',
		currentText: 'Idag',
		monthNames: ['Januar','Februar','Marts','April','Maj','Juni',
		'Juli','August','September','Oktober','November','December'],
		monthNamesShort: ['Jan','Feb','Mar','Apr','Maj','Jun',
		'Jul','Aug','Sep','Okt','Nov','Dec'],
		dayNames: ['Sondag','Mandag','Tirsdag','Onsdag','Torsdag','Fredag','Lordag'],
		dayNamesShort: ['Son','Man','Tir','Ons','Tor','Fre','Lor'],
		dayNamesMin: ['So','Ma','Ti','On','To','Fr','Lo'],
		weekHeader: 'Uge',
		dateFormat: 'dd-mm-yy',
		firstDay: 1,
		isRTL: false,
		showMonthAfterYear: false,
		yearSuffix: ''};
	$.datepicker.setDefaults($.datepicker.regional['da']);
});
