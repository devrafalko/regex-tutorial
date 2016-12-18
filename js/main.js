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
		this.addNavListeners();
		this.addItemListeners();
	},
	generateSearchKeywordsList: function(){
		var keywordsCollection = [];
		var data = this.regexData;
		var findList = $('#keywords');
		for(var i=0;i<data.length;i++){
			var kWords = this.regexData[i].keywords;
			for(var ii=0;ii<kWords.length;ii++){
				var current = kWords[ii];
				var hasKeyword = keywordsCollection.some(function(c){
					return c === current;
				});
				if(!hasKeyword) keywordsCollection.push(current);
			}
		}
		for(var i=0;i<keywordsCollection.length;i++){
			$(findList).append('<option value="'+keywordsCollection[i]+'"/>');
		}
	},
	defaultFormSubmit: function(){
		$("#nav-search").submit(function(e){
			e.preventDefault();
		});
	},
	addNavListeners: function(){
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
	addItemListeners:function(){
		var utils = this.utils;
		var that = this;
		var s = $('#inner-section');
		
		s.on('click','.regex-keywords span',function(){
			var getSearch = $('#searchInp');
			var getSearchValue = getSearch.val();
			var setNew = $(this).html();
			if(getSearchValue.split(' ').some(function(c){return c===setNew;})) return;
			getSearch.val(getSearchValue + ' ' + setNew);
		});	
		
		s.on('click','.tip-reg',function(){
			var getRegInp = item(this).find('.regex-code');
			getRegInp.text($(this).text());
			getRegInp.trigger('keyup');
		});	
	
		s.on('click','.regex-button-reset', function(){
			var getItem = item(this);
			that.loadData(getItem,true);
			$(getItem).find('.regex-code').trigger('keyup');
		});		

		s.on('click','.regex-header',function(){
			that.selectHash(item(this));
		});
		
		s.on('keyup cut paste', '.regex-code',function(){
			if($(this).text()===item(this)[0].regexData.regex.output.toString()) return;
			var getItem = item(this);
			utils.parseStringToRegExp(getItem);
			that.testRegExp(getItem,true);
		});

		s.on('keydown', '.regex-code',function(event){
			if(event.keyCode===13) event.preventDefault();
		});		
		
		s.on('focus blur', '.test-text',function(event){
			item(this).get(0).regexData.focused = event.type==='focusin' ? true:false;
			if(event.type==='focusout') $(this).trigger('mouseout');
		});

		s.on('mouseover mouseout', '.test-text',function(event){
			var isParentFocused = item(this).get(0).regexData.focused;
			if(isParentFocused) return;
			var type = event.type==='mouseover' ? 'appendRegularText':'appendHighlightText';
			utils[type](item(this));
		});
		
		s.on('paste', '.test-text, .regex-code', function(event){
			event.preventDefault();
			var text = this;
			var getText = $(text).html();
			var getPaste = (event.originalEvent.clipboardData || window.clipboardData).getData("text");
			var s = window.getSelection();
			var a = s.anchorOffset;
			var f = s.focusOffset;
			var selSide = a>f ? [f,a]:[a,f];
			var textLeft = getText.slice(0,selSide[0]);
			var textRight = getText.slice(selSide[1],getText.length);
			var newText = textLeft + getPaste + textRight;

			setTimeout(function(){
				$(text).html(newText);
				var range = document.createRange();
				range.setStart (text.childNodes[0], textLeft.length+getPaste.length);
				range.collapse(false);
				s.removeAllRanges();
				s.addRange(range);
				$(text).trigger('keyup');
			},0);
		});		
		
		s.on('keyup cut', '.test-text', function(){
			if($(this).text()===item(this)[0].regexData.rText) return;
			utils.newRegularText(item(this));
			that.testRegExp(item(this));
		});		
		
		s.on('keydown', '.test-text', function(event){
			if(event.keyCode===13){
				event.preventDefault();
				var getSelObj = window.getSelection();
				var getPosition = getSelObj.focusOffset;
				var getText = $(this).html();
				var textLeft = getText.slice(0,getPosition);
				var textRight = getText.slice(getPosition,getText.length);
				var insertBreak = !textRight.length ? '\n\n':'\n';
				var newText = textLeft + insertBreak + textRight;
				$(this).html(newText);
				var range = document.createRange();
				range.setStart(this.childNodes[0], textLeft.length+1);
				range.collapse(true);
				getSelObj.removeAllRanges();
				getSelObj.addRange(range);
				$(this).trigger('keyup');
			}			
		});
		
			function item(child){
				return $(child).parents('.regex-item');
			}	
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
				this.generateSearchKeywordsList();
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
		var utils = this.utils;
		var toggleClasses = '.regex-tips, .regex-keywords, .regex-console';
		
		$(getHTML).find(toggleClasses).hide();
		attachToggle(0,1,2);
		attachToggle(1,2,0);
		attachToggle(2,0,1);
		
		utils.parseStringToRegExp(getHTML);
		this.testRegExp(getHTML,true);	
		
			function attachToggle(a,b,c){
				var clss = ['tips','keywords','console'];
				$($(getHTML).find('.regex-button-'+clss[a])).click(function(){
					$($(getHTML).find(".regex-"+clss[b])).slideUp();
					$($(getHTML).find(".regex-"+clss[c])).slideUp();
					$($(getHTML).find(".regex-"+clss[a])).slideToggle();
				});
			}
	},
	testRegExp: function(getHTML,reg){
		var utils = this.utils;
		var getRegEx = getHTML[0].regexData.regex;
		var button = $(getHTML).find('.regex-button-console');
		var consoleBox = $(getHTML).find('.inner-console');
		var getText = $(document.createElement('SPAN')).html(getHTML[0].regexData.rText).text();
		var parseEscapes = utils.replaceEscapes(getText);
		getHTML[0].regexData.mText = parseEscapes;
		if(!getRegEx.passed){
			appendMessage(['fail','failMess']);
			utils.newHighlightText(getHTML,true);
			if(reg) utils.appendHighlightText(getHTML);
			} else {
				if(getRegEx.output.test(parseEscapes)){
					appendMessage(['ok','StrProto']);
					utils.newHighlightText(getHTML);
					if(reg) utils.appendHighlightText(getHTML);
					} else {
						appendMessage(['fail','StrProto']);
						utils.newHighlightText(getHTML,true);
						if(reg) utils.appendHighlightText(getHTML);
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
							consoleBox.append('<kbd>String.prototype.'+v+'() return: '+utils.styleType(parseEscapes[v](getRegEx.output))+'</kbd>');	
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
			$($(getItem).find('.regex-tips')).html(this.utils.generateList(itemData.description));
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
			var pierogi = typeof getText==='string' ? getText:$(getObj).find('.test-text').html();
			
			
			getObj[0].regexData.rText = typeof getText==='string' ? getText:$(getObj).find('.test-text').html();
		},
		newHighlightText: function(getObj,reset){
			var data = getObj[0].regexData;
			var parse = this.escapeHtml;
			if(reset) delete data.hText;
			var newText = data.mText.replace(data.regex.output,function(a){return '{mtch{'+a+'}mtch}';});
			newText = parse(newText);
			newText = newText.replace(/\x7Bmtch\x7B/g,'<span class="reg-hlight">');
			newText = newText.replace(/\x7Dmtch\x7D/g,'</span>');
			data.hText = newText;
		},
		appendRegularText: function(getObj){
			var getText = getObj[0].regexData.rText;
			$(getObj).find('.test-text').html(getText);
		},
		appendHighlightText: function(getObj){
			var getTextBox = $(getObj).find('.test-text');
			var getText = getObj[0].regexData.hText;
			getTextBox.html(getText);
		},
		matchArrays: function(item,filter){
			for(var i=0;i<filter.length;i++){
				var test = item.some(function(curr){
					return curr.toLowerCase() === filter[i].toLowerCase();
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
		replaceEscapes: function(getText){
			return getText
				.replace(/\\b/g, "\b")
				.replace(/\\f/g, "\f")
				.replace(/\\n/g, "\n")
				.replace(/\\r/g, "\r")
				.replace(/\\t/g, "\t")
				.replace(/\\v/g, "\v")
				.replace(/\\0/g, "\0");
		},
		styleType: function(val){
			var getEscapeFun = this.escapeHtml;
			return createSpan(val);
			function createSpan(v){
				var t = ['null','undefined','string','number','array'];
				var cl = ['msgNull','msgUndefined','msgString','msgNumber','msgArray'];
				var val = ['null','undefined','&#8220;'+getEscapeFun(v)+'&#8221;',String(v)];
				
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
				if(typeof obj==='undefined'&&t==='undefined') return true;
				if(obj===null&&t==='null') return true;
				if(obj===null||obj===undefined) return false;
				return obj.constructor.toString().toLowerCase().search(t)>=0;
			}
		},
		escapeHtml: function(getStr) {
			if(typeof getStr!=='string') return getStr;
			return getStr
				 .replace(/&/g, "&amp;")
				 .replace(/</g, "&lt;")
				 .replace(/>/g, "&gt;");
		},
		generateList: function(getArr){
			var newList = '<ul class="description-list">';
			for(var i=0;i<getArr.length;i++){
				newList += '<li>';
				if(typeof getArr[i]==='string') {
					newList += parseStringToCode(getArr[i]);
					} else if(getArr[i].constructor.toString().match('Object')!==null){
						var name = Object.getOwnPropertyNames(getArr[i])[0];
						newList += parseStringToCode(name)+this.generateList(getArr[i][name]);
						}
				newList += '</li>';
			}
			newList += '</ul>';
			return newList;
			
				function parseStringToCode(getStr){
					return getStr.replace(/\x7B.*?\x7D{1,}/g,function(c){
						var el = c.split(/\x7B|\x7D/g);
						if(el[1]==='reg') return '<code class="tip-reg">'+el[2]+'</code>';
						if(el[1]==='code') return '<code class="tip-code">'+el[2]+'</code>';
						if(el[1]==='val') return '<kbd class="tip-val">'+el[2]+'</kbd>';
						if(el[1]==='mark') return '<span class="tip-mark">'+el[2]+'</span>';
						if(el[1]==='link') return '<a href="'+el[2]+'" target="_blank" class="tip-link">'+el[3]+'</a>';
					});
				}
		},
		generateId: function(){
			return new Date().getTime().toString(36);
		}
	}
};

ajaxHandle.init();

//TO DO:


//DONE:
	
	
	
