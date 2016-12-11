/* global MutationObserver */

ajaxHandle = {
	inputBoxId: 'waiting-ico',
	htmlSection: null,
	regexData: null,
	filters: [null],
	hash: null,
	observer: null,
	nextLoad: 5,
	loadingInterval:null,
	matchedData: [],
	ajax: function(o){
		var that = this, ajax = new XMLHttpRequest();
		ajax.onreadystatechange = function(){
			var ok = this.status===200;
			var finish = this.readyState === 4;
			var process = this.readyState === 3;
			if(ok&&process&&o.process) o.process.call(that,this);
			if(ok&&finish&&o.ready) o.ready.call(that,this);
		};
		ajax.open('GET',o.url,o.async);
		ajax.send();
	},
	init: function(){
		this.utils.getParent = this;
		this.defaultFormSubmit();
		this.getHtmlSection();
		this.getRegExData();
		this.addListeners();
	},
	defaultFormSubmit: function(){
		$("#nav-search").submit(function(e){
			e.preventDefault();
		});		
	},
	addListeners: function(){
		var that = this;
		$("#main-section").mCustomScrollbar({theme:'minimal-dark'});

		$('#nav-max-menu').children().each(function(i,ob) {
			$(ob).on('mouseover mouseout',function(){
				$(ob).find(".nav-menu-line").toggleClass('line-hover');
				$(ob).find(".nav-menu-name").toggleClass('name-hover');
			});
			var createOpt = $.parseHTML('<option>'+$(ob).find(".nav-menu-name").html()+'</option>');
			$(createOpt).attr('data-key',$(ob).attr('data-key'));
			$("#nav-min-menu").append(createOpt);
		});

		$('#nav-max-menu>li').on('mouseup',function(){
			var getKeyword = $(this).attr('data-key');
			$('#searchInp').val(getKeyword);
			that.filterItems(getKeyword);
			that.hash = null;
			location.hash = '';
		});

		$('#nav-min-menu').on('input',function(){
			var getKeyword = $(this).find(':selected').attr('data-key');
			$('#searchInp').val(getKeyword);
			that.filterItems(getKeyword);
			this.selectedIndex = 0;
			that.hash = null;
			location.hash = '';
		});

		$('#sumInp').on('click',function(){
			var getKeyword = $('#searchInp').val();
			that.filterItems(getKeyword);
			that.hash = null;
			location.hash = '';
		});

		$('#header-section>header').on('click',function(){
			location.hash = '';
			that.filterItems('');
			$('#searchInp').val('');
			that.hash = null;
		});
		
		$('#searchInp').on('mouseover',function(){
			$(this).attr('title',$(this).val());
		});
	},
	getHtmlSection: function(){
		this.ajax({
			url:'ajax/section.html',
			async:true,
			ready:function(o){
				this.htmlSection = $.parseHTML(o.responseText)[0];
				if(this.regexData) this.initItems();
			}
		});
	},
	getRegExData: function(){
		this.ajax({
			url:'ajax/samples.json',
			async:true,
			process:function(){
				$('#inner-section').append('<aside id="waiting-ico"></aside>');
			},
			ready:function(o){
				this.regexData = JSON.parse(o.responseText);
				if(this.htmlSection) this.initItems();
				$('#waiting-ico').remove();
			}
		});
	},
	initItems: function(){
		this.filterHash();
	},
	filterHash: function(){
		var that = this;
		var getHash = location.hash;
		var hash = getHash.length ? getHash.replace(/^\x23/,''):false;
		var found;

		if(hash){
			$.each(this.regexData,function(iter,val){
				if(hash===val.id) {
					found = iter;
					that.hash = hash;
					return false;	
				}
			});
		}

		if(typeof found === 'number'){
			this.matchedData = [];
			this.matchedData.push(found);
			this.loadNext(true);
			} else {
				this.filterItems('');
				}
	},

	selectHash: function(getItem){
		var getItemNumber = getItem[0].regexData.itemNum;
		var getItemId = this.regexData[getItemNumber].id;
		if(typeof getItemId==='undefined') return;
		if(getItemId===this.hash) return;
		this.hash = getItemId;

		location.hash = getItemId;
		this.matchedData = [];
		this.filters = [null];
		$('#searchInp').val('');
		this.matchedData.push(getItemNumber);
		this.loadNext(true);
	},

	filterItems: function(getText){
		var collection = getText.match(/^\s*$/) ? []:getText.replace(/\s+/g,' ').replace(/^\s+|\s+$/,'').split(' ');
		var that = this;
		if(this.utils.equalArrays(collection,this.filters)) return;
		this.filters = collection.slice();
		this.matchedData = [];

		$.each(this.regexData,function(iter,val){
			if(that.utils.matchArrays(val.keywords,collection)){
				that.matchedData.push(iter);
			}
		});
		this.loadNext(true);
	},

	scriptSection: function(getHTML){
		var that = this, utils = this.utils;
		var toggleClasses = '.regex-tips, .regex-keywords, .regex-console';
		var keyword = $(getHTML).find('.regex-keywords>span');
		var regex = $(getHTML).find('.regex-code');
		var text = $(getHTML).find('.test-text');
		var resetButton = $(getHTML).find('.regex-button-reset');
		var itemHeader = $(getHTML).find('.regex-header');
		
		$(getHTML).find(toggleClasses).hide();
		attachToggle(0,1,2);
		attachToggle(1,2,0);
		attachToggle(2,0,1);

		function attachToggle(a,b,c){
			var clss = ['tips','keywords','console'];
			$($(getHTML).find('.regex-button-'+clss[a])).click(function(){
				$($(getHTML).find(".regex-"+clss[b])).slideUp();
				$($(getHTML).find(".regex-"+clss[c])).slideUp();
				$($(getHTML).find(".regex-"+clss[a])).slideToggle();
			});
		}

		$(keyword).on('click',function(){
			var getSearch = $('#searchInp');
			var getSearchValue = getSearch.val();
			var setNew = $(this).html();
			if(getSearchValue.split(' ').some(function(c){return c===setNew;})) return;
			getSearch.val(getSearchValue + ' ' + setNew);
		});
		
		$(resetButton).on('click', function(){
			that.loadData(getHTML,true);
			$(regex).trigger('keyup');
		});		

		$(itemHeader).on('click',function(){
			that.selectHash(getHTML);
		});

		$(regex).on('keyup cut paste',function(){
			utils.parseStringToRegExp(getHTML);
			that.testRegExp(getHTML,true);
		});

		$(regex).on('keydown', function(event){
			if(event.keyCode===13) event.preventDefault();
		});
		
		var rText = utils.appendRegularText.bind(this,getHTML);
		var hText = utils.appendHighlightText.bind(this,getHTML);
		
		$(text).on('focus',function(){
			$(this).off('mouseover mouseout');
		});
		
		$(text).on('blur',function(){
			$(this).on('mouseover',rText);
			$(this).on('mouseout',hText);
			$(this).trigger('mouseout');
		});
		
		$(text).on('mouseover',rText);
		$(text).on('mouseout',hText);
		
		$(text).on('keyup cut paste', function(event){
			utils.newRegularText(getHTML);
			that.testRegExp(getHTML);
		});

		$(text).on('keydown', function(event){
			if(event.keyCode===13){
				event.preventDefault();
				var range = document.createRange();
				var getSelObj = window.getSelection();
				var getPosition = getSelObj.focusOffset;
				var getText = $(text).html();
				var textLeft = getText.slice(0,getPosition);
				var textRight = getText.slice(getPosition,getText.length);
				var insertBreak = !textRight.length ? '\n\n':'\n';
				var newText = textLeft + insertBreak + textRight;
				$(this).html(newText);
				range.setStart(this.childNodes[0], textLeft.length+1);
				range.collapse(true);
				getSelObj.removeAllRanges();
				getSelObj.addRange(range);
				$(text).trigger('keyup');
			}			
		});
		
		utils.parseStringToRegExp(getHTML);
		this.testRegExp(getHTML,true);		
		
	},
	testRegExp: function(getHTML,reg){
		var utils = this.utils;
		var getRegEx = getHTML[0].regexData.regex;
		var button = $(getHTML).find('.regex-button-console');
		var consoleBox = $(getHTML).find('.inner-console');
		var getText = getHTML[0].regexData.rText;
		if(!getRegEx.passed){
			appendMessage(['fail','failMess']);
			utils.newHighlightText(getHTML,true);
			if(reg) utils.appendRegularText(getHTML);
			} else {
				if(getRegEx.output.test(getText)){
					appendMessage(['ok','StrProto']);
					utils.newHighlightText(getHTML);
					if(reg) utils.appendHighlightText(getHTML);
					} else {
						appendMessage(['fail','StrProto']);
						utils.newHighlightText(getHTML,true);
						if(reg) utils.appendRegularText(getHTML);
						}
				}
				
			function appendMessage(coll){
				consoleBox.empty();
				for(var i=0;i<coll.length;i++){
					if(coll[i]==='ok') {
						setClass(button,true);
						consoleBox.append('<kbd class="ok">Test passed</kbd>');
					}
					if(coll[i]==='fail') {
						setClass(button,false);
						consoleBox.append('<kbd class="fail">Test failed</kbd>');
					}
					if(coll[i]==='failMess') consoleBox.append('<kbd class="fail">'+getRegEx.output+'</kbd>');
					if(coll[i]==='StrProto'){
						$.each(['match','search','split'],function(c,v){
							consoleBox.append('<kbd>String.prototype.'+v+'() return: '+utils.styleType(getText[v](getRegEx.output))+'</kbd>');						
						});
					}
				}
					function setClass(obj,bool){
						var end = ['fail','ok'];
						obj.removeClass('test-status-'+end[Number(!bool)]).addClass('test-status-'+end[Number(bool)]);
					};
			}
	},
	loadData: function(getItem,isRefresh){
		var matchedNum = getItem[0].regexData.itemNum;
		var itemData = this.regexData[matchedNum];
		var parseRegExp = new RegExp(itemData.regex[0],itemData.regex[1]).toString();
		$(getItem).find('.regex-code').html(parseRegExp);
		this.utils.newRegularText(getItem,itemData.content);
		this.utils.appendRegularText(getItem);
		
		if(!isRefresh){
			var regBox = $(getItem).find('.regex-keywords');
			$($(getItem).find('.regex-tips')).html(itemData.description);
			$.each(itemData.keywords,function(ind,val){
				regBox.append('<span>'+val+'</span>');
			});
		}

		return getItem;
	},
	createNextButton: function(){
		var butt = $.parseHTML('<nav id="load-more"><span>load more</span</nav>');
		var bLoadNext = this.loadNext.bind(this,false);
		$(butt).on('click',bLoadNext);
		$('#inner-section').append(butt);

	},
	removeNextButton: function(){
		$('#inner-section').find('#load-more').remove();
	},
	loadNext: function(clearAll){
		var iter, that = this, cMax = 0, all = this.matchedData.length;
		if(clearAll) $('#inner-section').empty();
		iter = $('#inner-section').children('.regex-item').length;
		
		if(this.loadingInterval!==null) clearInterval(this.loadingInterval);

		this.loadingInterval = setInterval(function(){
			if(iter>=all||cMax>=that.nextLoad) {
				clearInterval(that.loadingInterval);
				if(clearAll) that.createNextButton();
				if(iter===all) that.removeNextButton();
				return;
			}
			var newItem = $(that.htmlSection).clone();
			newItem[0].regexData = {itemNum:that.matchedData[iter]};
			var getHTML = that.loadData(newItem);
			that.scriptSection(getHTML);
			$(getHTML).hide();
			if(clearAll) $('#inner-section').append(getHTML);
			if(!clearAll) $('#load-more').before(getHTML);

			$(getHTML).find('.regex-section').mCustomScrollbar({theme:'minimal'});
			$(getHTML).find('.regex-console,.regex-tips,.regex-keywords,.regex-input').mCustomScrollbar({theme:'minimal-dark'});			
			
			$(getHTML).fadeIn(300);			
			iter++;
			cMax++;
		},150);
	},
	utils:{
		newRegularText: function(getObj,getText){
			var data = getObj[0].regexData;
			data.rText = typeof getText==='string' ? getText:$(getObj).find('.test-text').html();
		},
		newHighlightText: function(getObj,reset){
			var data = getObj[0].regexData;
			if(reset) delete data.hText;
			var newText = data.rText.replace(data.regex.output,function(a){
				return '<span class="reg-hlight">'+a+'</span>';
			});
			data.hText = newText;
		},
		appendRegularText: function(getObj){
			var getText = getObj[0].regexData.rText;
			$(getObj).find('.test-text').html(getText);
		},
		appendHighlightText: function(getObj){
			var getText = getObj[0].regexData.hText;
			if(typeof getText==='undefined') this.appendRegularText(getObj);
			$(getObj).find('.test-text').html(getText);
		},
		matchArrays: function(item,filter){
			for(var i=0;i<filter.length;i++){
				var test = item.some(function(curr,ind,arr){
					return curr === filter[i];
				});
				if(!test) return false;
			}
			return true;
		},
		equalArrays: function(arrA,arrB){
			if(arrA.length!==arrB.length) return false;

			var a = arrA.slice();
			var b = arrB.slice();

			for(var i=0;i<a.length;i++){
				var getIndex = b.findIndex(function(curr){
					return curr === a[i];
				});
				if (getIndex===-1) return false;
				b.splice(getIndex,1);
			}
			return true;
		},
		parseStringToRegExp: function(getObj){
			var getString = $(getObj).find('.regex-code').text();
			var err = [
				'SyntaxError: Invalid regular expression. Expression should begin and end with: /',
				'SyntaxError: Invalid regular expression. Expression should not end with: \\/',
				'SyntaxError: Invalid regular expression. Expression should not contain \'/\' inside expression. Use \'\\/\' instead',
				'SyntaxError: Invalid regular expression. Incorrect flags. Use: g i m y',
				'SyntaxError: Invalid regular expression. Incorrect flags. Use: \'g\' \'i\' \'m\' \'y\' flag just once'
			];

			var tests = [/^\x2F.*\x2F\w*$/gi,
						 /^(?:(?!(^|[^\x5C])\x5C(\x5C\x5C)*\x2F\w*$).)+$/gi,
						 /^(?:(?![^\x5C](\x5C\x5C)*\x2F(?!\w*$)).)+$/gi,
						 /\x2F(g|i|m|y){0,4}$/gi,
						 /^(?:(?!\x2F.*\x2F(.*g.*g.*|.*m.*m.*|.*i.*i.*|.*y.*y.*)$).)+$/gi
					 ];
			for(var i=0;i<tests.length;i++){
				if(!getString.match(tests[i])){
					return retObj(false,err[i]);
				};
			}

			var firstSlash = getString.indexOf('/');
			var lastSlash = getString.lastIndexOf('/');
			var parseExpression = getString.slice(firstSlash+1,lastSlash);
			var parseFlags = getString.slice(lastSlash+1,getString.length);
			
			try{
				var newRegEx = new RegExp(parseExpression,parseFlags);
				} catch(a){
					return retObj(false,a.name+': '+a.message);
					};
			
			return retObj(true,newRegEx);
			
				function retObj(test,output){
					var r = {};
					r.passed = test;
					r.output = output;
					getObj[0].regexData.regex = r;
					return r;
				}
		},
		styleType: function(val){
			return createSpan(val);
			
			function createSpan(v){
				var t = ['null','undefined','string','number','array'];
				var cl = ['msgNull','msgUndefined','msgString','msgNumber','msgArray'];
				var val = ['null','undefined','&#8220;'+v+'&#8221;',String(v)];
				
				for(var i=0;i<t.length;i++){
					var addArr = i<t.length-1 ? val[i]:createArray(v);
					if(type(v,t[i])) return '<span class="'+cl[i]+'">'+addArr+'</span>';
				}
			}
			
			function createArray(arr){
				var spanArr = '[';
				for(var i=0;i<arr.length;i++){
					spanArr += createSpan(arr[i]);
					if(i<arr.length-1) spanArr += ",";
				}
				spanArr += ']';
				return spanArr;
			}
			
			function type(obj,t){
				var type = t.toLowerCase();
				if(typeof obj==='undefined'&&type==='undefined') return true;
				if(obj===null&&type==='null') return true;
				return obj.constructor.toString().toLowerCase().search(type)>=0;
			}
		},
		generateId: function(){
			return new Date().getTime().toString(36);
		}
	}
};

ajaxHandle.init();

//TO DO:
//create search propositions made of all keywords

//DONE:
//add keyup cut paste events instead of input event for regex-input and text-input to support IE
//change the easing time of sliding items