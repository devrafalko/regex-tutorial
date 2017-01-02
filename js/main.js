"use strict";

var ajaxHandle = {
	inputBoxId: 'waiting-ico',
	htmlSection: null,
	regexData: null,
	descData: null,
	kwrdOrder: null,
	syncLoad: [0,4],
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
		this.getDescriptionData();
		this.getKeywordsOrderList();
		this.addNavListeners();
		this.addItemListeners();
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
		
		s.on('click','.keyword-butt',function(){
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
			var dataObject = utils.itemData(item(this)).temp;
			if($(this).text()===dataObject.regex.output.toString()) return;
			var getItem = item(this);
			utils.validateRegex(getItem);
			that.testRegExp(getItem,true);
		});

		s.on('keydown', '.regex-code',function(event){
			if(event.keyCode===13) event.preventDefault();
		});		
		
		s.on('focus blur', '.test-text',function(event){
			var dataObject = utils.itemData(item(this)).temp.content;
			dataObject.focused = event.type==='focusin' ? true:false;
			if(event.type==='focusout') $(this).trigger('mouseout');
		});

		s.on('mouseover mouseout', '.test-text',function(event){
			var dataObject = utils.itemData(item(this)).temp.content;
			var isParentFocused = dataObject.focused;
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
			var dataObject = utils.itemData(item(this)).temp.content;
			if($(this).text()===dataObject.rText) return;
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
				var newText = textLeft + '\\n' + textRight;
				$(this).html(newText);
				var range = document.createRange();
				range.setStart(this.childNodes[0], textLeft.length+2);
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
				this.fireInitItems();
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
				this.utils.validateJSON('samples',this.regexData);
				this.generateTempDataObj();
				this.fireInitItems();
				$('#waiting-ico').remove();
			}
		});
	},
	
	generateTempDataObj: function(){
		for(var i=0;i<this.regexData.length;i++){
			this.regexData[i].temp = {parsed:{},regex:{},content:{}};
		}
	},
	getDescriptionData: function(){
		this.ajax({
			url:'ajax/descriptions.json',
			async:true,
			ready:function(o){
				this.descData = JSON.parse(o.responseText);
				this.utils.validateJSON('descriptions',this.descData);
				this.fireInitItems();
			}
		});
	},
	getKeywordsOrderList: function(){
		this.ajax({
			url:'ajax/keywordsOrder.json',
			async:true,
			ready:function(o){
				this.kwrdOrder = JSON.parse(o.responseText);
				this.utils.validateJSON('keywords',this.kwrdOrder);
				this.generateSearchKeywordsList();
				this.fireInitItems();
			}
		});
	},
	generateSearchKeywordsList: function(){
		for(var i=0;i<this.kwrdOrder.length;i++){
			$('#keywords').append('<option value="'+this.kwrdOrder[i]+'"/>');
		}
	},
	fireInitItems: function(){
		this.syncLoad[0]++;
		if(this.syncLoad[0]===this.syncLoad[1]) {
			this.generateItemKeywords();
			this.filterHash();
		};
	},
	generateItemKeywords: function(){
		for(var i=0;i<this.regexData.length;i++){
			var r = this.regexData[i];
			this.utils.validateRegex(r,true);
			var p = r.temp.parsed;
			var isPassed = r.temp.regex.passed;
			var generateKeywords = isPassed ? this.utils.generateKeywordsCollection(p.expression,p.flags,p.plain):[];	
			var sortedKeywords = this.utils.sortKeywords(generateKeywords,r.keywords);
			r.keywords = sortedKeywords;
		}
	},
	filterHash: function(){
		var that = this;
		var getHash = location.hash;
		var hash = getHash.length ? getHash.replace(/^\x23/,''):false;
		var found;

		if(hash){
			$.each(this.regexData,function(i,val){
				if(hash===val.id) {
					found = val.id;
					that.hash = hash;
					return false;	
				}
			});
		}
		if(typeof found === 'string'){
			this.matchedData = [found];
			this.loadNext(true);
			} else {
				this.filterItems('');
				}
	},

	selectHash: function(getItem){
		var getItemId = getItem[0].regexID;
		if(typeof getItemId==='undefined') return;
		if(getItemId===this.hash) return;
		this.hash = getItemId;
		location.hash = getItemId;
		this.matchedData = [getItemId];
		this.filters = [null];
		$('#searchInp').val('');
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
				that.matchedData.push(val.id);
			}
		});
		this.loadNext(true);
	},

	scriptSection: function(getHTML){
		var toggleClasses = '.regex-tips, .regex-keywords, .regex-console';
		
		$(getHTML).find(toggleClasses).hide();
		attachToggle(0,1,2);
		attachToggle(1,2,0);
		attachToggle(2,0,1);
		
		$(getHTML).find('[data-toggle="tooltip"]').tooltip({placement: "right",delay: {show: 300, hide: 0}});
		
			function attachToggle(a,b,c){
				var clss = ['tips','keywords','console'];
				$(getHTML).find('.regex-button-'+clss[a]).click(function(){
					$(getHTML).find(".regex-"+clss[b]).slideUp();
					$(getHTML).find(".regex-"+clss[c]).slideUp();
					$(getHTML).find(".regex-"+clss[a]).slideToggle();
				});
			}
	},
	testRegExp: function(getHTML,reg){
		var utils = this.utils;
		var dataObject = utils.itemData(getHTML).temp;
		var getRegEx = dataObject.regex;
		var button = $(getHTML).find('.regex-button-console');
		var consoleBox = $(getHTML).find('.inner-console');
		var getText = $(document.createElement('SPAN')).html(dataObject.content.rText).text();
		var parseEscapes = utils.replaceEscapes(getText);
		dataObject.content.mText = parseEscapes;
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
					if(coll[i]==='StrProto'){
						$.each(['test','exec'],function(c,v){
							consoleBox.append('<kbd>RegExp.prototype.'+v+'() return: '+utils.styleType(getRegEx.output[v](parseEscapes))+'</kbd>');	
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
		var elemData = this.utils.itemData(getItem);
		$(getItem).find('.regex-code').html(elemData.regex);
		
		this.utils.newRegularText(getItem,elemData.content);
		this.utils.appendRegularText(getItem);
		if(!isRefresh){
			$(getItem).find('.regex-keywords').append(this.utils.generateKeywordsSpans(elemData.keywords));
			$(getItem).find('.regex-tips').append(this.utils.generateDescriptions(this.descData,elemData.keywords,elemData.description));
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
		var iterA, iterB, getChildNum, prepNum, that = this, cMax = 0, all = this.matchedData.length,collection = [];
		
		if(clearAll) $('#inner-section').empty();
		if(this.loadingInterval!==null) clearInterval(this.loadingInterval);
		
		getChildNum = $('#inner-section').children('.regex-item').length;
		iterA = getChildNum;
		iterB = getChildNum;
		prepNum = all-getChildNum>this.nextLoad?this.nextLoad:all-getChildNum;
		for(var i=0;i<prepNum;i++){
			var newItem,getHTML;
			
			newItem = $(that.htmlSection).clone();
			newItem[0].regexID = that.matchedData[iterA];
			getHTML = that.loadData(newItem);
			collection.push(getHTML);
			that.scriptSection(getHTML);
			
			this.testRegExp(getHTML,true);			
			
			$(getHTML).hide();
			if(clearAll) $('#inner-section').append(getHTML);
			if(!clearAll) $('#load-more').before(getHTML);
			$(getHTML).find('.regex-section').mCustomScrollbar({theme:'minimal'});
			$(getHTML).find('.regex-console,.regex-tips,.regex-keywords,.regex-input').mCustomScrollbar({theme:'minimal-dark'});
			iterA++;
		}
		
		this.loadingInterval = setInterval(function(){
			if(cMax===prepNum) {
				clearInterval(that.loadingInterval);
				if(clearAll) that.createNextButton();
				if(iterB===all) that.removeNextButton();
				return;
			}
			$(collection[cMax]).fadeIn(300);			
			cMax++;
			iterB++;
		},150);
	},
	utils:{
		itemData: function(getItem){
			var id = getItem[0].regexID;
			var obj = this.getParent.regexData;
			for(var i=0;i<obj.length;i++){
				if(id===obj[i].id) return obj[i];
			}
			return null;
		},
		newRegularText: function(getObj,getText){
			var dataObject = this.itemData(getObj).temp.content;
			dataObject.rText = getText;
		},
		newHighlightText: function(getObj,reset){
			var dataObject = this.itemData(getObj).temp;
			var parse = this.escapeHtml;
			if(reset) delete dataObject.content.hText;
			var newText = dataObject.content.mText.replace(dataObject.regex.output,function(a){return '{mtch{'+a+'}mtch}';});
			newText = parse(newText);
			newText = newText.replace(/\x7Bmtch\x7B/g,'<span class="reg-hlight">');
			newText = newText.replace(/\x7Dmtch\x7D/g,'</span>');
			dataObject.content.hText = newText;
		},
		appendRegularText: function(getObj){
			var dataObject = this.itemData(getObj).temp.content;
			var getText = dataObject.rText;
			$(getObj).find('.test-text').html(getText);
		},
		appendHighlightText: function(getObj){
			var getTextBox = $(getObj).find('.test-text');
			var dataObject = this.itemData(getObj).temp.content;
			var getText = dataObject.hText;
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
		validateRegex: function(getObj,init){
			var getPlain = init ? getObj.regex:$(getObj).find('.regex-code').text();
			var dataObject = init ? getObj:this.itemData(getObj);
			var parseEscapes = this.parseSlashEscaped(getPlain);
			
			var err = [
				'SyntaxError: Invalid regular expression. Expression should begin and end with: /',
				'SyntaxError: Invalid regular expression. Expression should not contain \'/\' inside expression. Use \'\\/\' instead',
				'SyntaxError: Invalid regular expression. Incorrect flags. Use: g i m y',
				'SyntaxError: Invalid regular expression. Incorrect flags. Use: \'g\' \'i\' \'m\' \'y\' flag just once'];

			var tests = [
				/^\/.*\/\w*$/,
				/^\/(?!.*\/.*\/)/,
				/\/(g|i|m|y){0,4}$/g,
				/^\x2F.*\x2F(?!(.*g.*g|.*i.*i|.*m.*m))/];

			for(var i=0;i<tests.length;i++){
				if(!parseEscapes.match(tests[i])){
					return retObj(false,err[i]);
				};
			}

			var firstSlash = parseEscapes.indexOf('/');
			var lastSlash = parseEscapes.lastIndexOf('/');
			var parseExpression = parseEscapes.slice(firstSlash+1,lastSlash);
			var parseFlags = parseEscapes.slice(lastSlash+1,parseEscapes.length);

			try{
				var newRegEx = new RegExp(parseExpression,parseFlags);
				} catch(a){
					return retObj(false,a.name+': '+a.message);
					};

			return retObj(true,newRegEx);
				
				function retObj(test,output){
					dataObject.temp.regex = {passed:test,output:output};
					dataObject.temp.parsed = {plain:getPlain,expression:parseExpression,flags:parseFlags};
				}
		},
		parseSlashEscaped: function(getStr){
			return getStr
				.replace(/\\\!/g,'\\x21')
				.replace(/\\\$/g,'\\x24')
				.replace(/\\\(/g,'\\x28')
				.replace(/\\\)/g,'\\x29')
				.replace(/\\\*/g,'\\x2A')
				.replace(/\\\+/g,'\\x2B')
				.replace(/\\\,/g,'\\x2C')
				.replace(/\\\-/g,'\\x2D')
				.replace(/\\\./g,'\\x2E')
				.replace(/\\\//g,'\\x2F')
				.replace(/\\\:/g,'\\x3A')
				.replace(/\\\=/g,'\\x3D')
				.replace(/\\\?/g,'\\x3F')
				.replace(/\\\[/g,'\\x5B')
				.replace(/\\\\/g,'\\x5C')
				.replace(/\\\]/g,'\\x5D')
				.replace(/\\\^/g,'\\x5E')
				.replace(/\\\{/g,'\\x7B')
				.replace(/\\\|/g,'\\x7C')
				.replace(/\\\}/g,'\\x7D');
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
			var type = this.type;
			return createSpan(val);
			function createSpan(v){
				var t = ['null','undefined','boolean','string','number','array'];
				var cl = ['msgNull','msgUndefined','msgBoolean','msgString','msgNumber','msgArray'];
				var val = ['null','undefined',String(v),'&#8220;'+getEscapeFun(v)+'&#8221;',String(v)];

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

		},
		type: function(obj,t){
			t = t.toLowerCase();
			if(typeof obj==='undefined'&&t==='undefined') return true;
			if(obj===null&&t==='null') return true;
			if(obj===null||obj===undefined) return false;
			return obj.constructor.toString().toLowerCase().search(t)>=0;
		},
		escapeHtml: function(getStr) {
			if(typeof getStr!=='string') return getStr;
			return getStr
				 .replace(/&/g, "&amp;")
				 .replace(/</g, "&lt;")
				 .replace(/>/g, "&gt;");
		},
		generateDescriptions: function(defaultDefs,keywords,additionalDefs){
			var newList = '<ul class="description-list">';

			var keyColl = defaultDefs.filter(function(cA){
				return keywords.some(function(cB){
					return cA.key===cB;
				});
			});
			$.each(keyColl,function(i,c){
				keyColl[i] = c.desc;
			});

			var newKeyColl = keyColl.concat(additionalDefs);

			for(var i=0;i<newKeyColl.length;i++){
				newList += '<li>';
				if(typeof newKeyColl[i]==='string') {
					newList += parseStringToCode(newKeyColl[i]);
					} else if(newKeyColl[i].constructor.toString().match('Object')!==null){
						var name = Object.getOwnPropertyNames(newKeyColl[i])[0];
						newList += parseStringToCode(name)+this.generateDescriptions([],null,newKeyColl[i][name]);
						}
				newList += '</li>';
			}
			newList += '</ul>';
			return newList;

				//creating JSON LI tree:
				//description: ['a','b','c',{'d':['da','db','dc']},e,f]
				//spans types:
					//{code{abc}}
					//{mark{abc}}
					//{val{abc}}
					//{reg{abc}}
					//{search{abc}}
					//{link{http://url.com{abc}}}
					
				function parseStringToCode(getStr){
					return getStr.replace(/\x7B.*?\x7D{1,}/g,function(c){
						var el = c.split(/\x7B|\x7D/g);
						if(el[1]==='reg') return '<code class="tip-reg">'+el[2]+'</code>';
						if(el[1]==='code') return '<code class="tip-code">'+el[2]+'</code>';
						if(el[1]==='val') return '<kbd class="tip-val">'+el[2]+'</kbd>';
						if(el[1]==='mark') return '<span class="tip-mark">'+el[2]+'</span>';
						if(el[1]==='search') return '<span class="keyword-butt tip-search">'+el[2]+'</span>';
						if(el[1]==='link') return '<a href="'+el[2]+'" target="_blank" class="tip-link">'+el[3]+'</a>';
					});
				}
		},
		generateKeywordsSpans: function(getKeywords){
			var keywordsCollection = "";
			$.each(getKeywords,function(i,val){
				keywordsCollection += '<span class="keyword-butt">' + val + '</span>';
			});
			return keywordsCollection;
		},
		generateKeywordsCollection: function(expression,flags,plain){
			var newPlain, brackets, outSquares, inSquares = '', collection = [];
			prepareParsed();

			var grName = ['modifier','bracket','metacharacter','quantifier'];
			var group = [false,false,false,false];
			var tests = [
				[0,flags,/[gim]/,"flag"],
				[0,flags,/[g]/,"g","no-flag-g"],
				[0,flags,/[i]/,"i","no-flag-i"],
				[0,flags,/[m]/,"m","no-flag-m"],
				[1,outSquares,/\./,"."],
				[1,outSquares,/\(\?\:.+\)/,"(?:n)"],
				[1,outSquares,/\|/,"x|y"],
				[1,expression,/\[(?!\^).*\]/,"[xyz]"],
				[1,expression,/\[(?!\^).*[a-z]-[a-z].*\]/,"[a-z]"],
				[1,expression,/\[(?!\^).*[A-Z]-[A-Z].*\]/,"[A-Z]"],
				[1,expression,/\[(?!\^).*[A-Z]-[a-z].*\]/,"[A-z]"],
				[1,expression,/\[(?!\^).*[0-9]-[0-9].*\]/,"[0-9]"],
				[1,expression,/\[\^.*\]/,"[^xyz]"],
				[1,expression,/\[\^.*[a-z]-[a-z].*\]/,"[^a-z]"],
				[1,expression,/\[\^.*[A-Z]-[A-Z].*\]/,"[^A-Z]"],
				[1,expression,/\[\^.*[A-Z]-[a-z].*\]/,"[^A-z]"],
				[1,expression,/\[\^.*[0-9]-[0-9].*\]/,"[^0-9]"],
				[2,outSquares,/\\b/,"\\b"],
				[2,outSquares,/\\B/,"\\B"],
				[2,outSquares,/\\d/,"\\d"],
				[2,outSquares,/\\D/,"\\D"],
				[2,outSquares,/\\f/,"\\f"],
				[2,outSquares,/\\r/,"\\r"],
				[2,outSquares,/\\t/,"\\t"],
				[2,outSquares,/\\v/,"\\v"],
				[2,outSquares,/\\0/,"\\0"],
				[2,outSquares,/\\n/,"\\n"],
				[2,outSquares,/\\s/,"\\s"],
				[2,outSquares,/\\S/,"\\S"],
				[2,outSquares,/\\w/,"\\w"],
				[2,outSquares,/\\W/,"\\W"],
				[2,expression,/[bBdDfrtv0nsSwW]/,"non-special"],
				[2,expression,/\\u[0-9A-Fa-f]{4}/,"\\udddd"],
				[2,newPlain,/[^\\]\\x[0-9A-Fa-f]{2}/,"\\xdd"],
				[3,expression,/^\^/,"^n"],
				[3,expression,/\$$/,"n$"],
				[3,outSquares,/\*/,"n*"],
				[3,outSquares,/[^(]\?/,"n?"],
				[3,outSquares,/\+/,"n+"],
				[3,outSquares,/\(\?\=.+\)/,"x(?=y)"],
				[3,outSquares,/\(\?\!.+\)/,"x(?!y)"],
				[3,outSquares,/\{\d+\}/,"n{x}"],
				[3,outSquares,/\{\d+,\d+\}/,"n{x,y}"],
				[3,outSquares,/\{\d+,\}/,"n{x,}"],
				[3,outSquares,/(\*|\+|\?|\{\d+,\d+\}|\{\d+,\})(?=\?)/,"non-greedy"],
				[3,expression,/[!$()*+,-./:=?\[\]\\^{}|]/,"special"]
			];

			for(var i=0;i<tests.length;i++){
				var t = tests[i];
				if(t[2].test(t[1])&&typeof t[3]!=='undefined'){
					setKeys(t[3],t[0]);
					} else if(!t[2].test(t[1])&&typeof t[4]!=='undefined') {
						setKeys(t[4],t[0]);
						}
				}

			findParentheses();
			findOctal();
			findSpecial(1,outSquares,/\\(?!0)[0-9]{1,3}/g,'\\x',1);
			findSimplePattern();
			addGroupKeys();
			return collection;

				function setKeys(key,num){
					collection.push(key);
					if(num!==null) group[num] = true;
				}

				function addGroupKeys(){
					for(var i=0;i<group.length;i++){
						if(group[i]) collection.push(grName[i]);
					}
				}

				function prepareParsed(){
					newPlain = plain.replace(/\\\\/g,'');
					inSquares = '';
					outSquares = expression.replace(/(\[.+?\])/g,function(c){
						inSquares += c;
						return '[]';
					});
				}

				function findParentheses(){
					var bracketsReg = /\((?!(\?\=|\?\!|\?\:))/g;
					brackets = outSquares.match(bracketsReg);
					if(brackets&&brackets.length) {
						setKeys('(n)',1);
					};				
				}

				function findOctal(){
					if(/\\[0-7]{3}/.test(expression)){
						setKeys('\\ddd',2);
					} else if(/\\[0-7]{1,2}/.test(inSquares)) {
						setKeys('\\ddd',2);
					} else {
						findSpecial(2,outSquares,/\\[0-7]{1,2}/g,'\\ddd',0);
					}
				}

				function findSpecial(getGroup,getStr,getReg,key,assert){
					var c = getStr.match(getReg);
					if(c&&brackets){
						for(var i=0;i<c.length;i++){
							var a = Number(c[i].slice(1));
							var b = brackets.length;
							if(!assert ? a>b:a<=b){
								setKeys(key,getGroup);
								break;
							}
						}
					}				
				}

				function findSimplePattern(){
					var cond =  (/((^|[^\\])[bBdDfnrsStvwW]|[^0-9bBdDfnrsuxStvwW,=*+{}()\[\]^$\?.\\|]|\\[\*+{}()\[\]^$\?.\\|])/.test(outSquares)) ||
								(/[ux0-9]/.test(outSquares.replace(/(\(\?\:|\(\?\=|\(\?\!|\\u[0-9A-Fa-f]{4}|\\x[0-9A-Fa-f]{2}|\{\d+\,?\d*?\}|\\[0-7]{1,3})|\\[0-9]{1,2}/g,'')));
					if(cond) return setKeys('simple-pattern',null);
				}
		},
		sortKeywords: function(getGenerated,getAdditional){
			var srt = this.getParent.kwrdOrder.filter(function(order){
				return getGenerated.some(function(list){
					return order === list;
				});
			});
			return srt.concat(getAdditional);
		},
		validateJSON(jsonFile,jsonObj){
			var type = this.type;
			switch(jsonFile){
				case 'samples':
					samplesValid();
					break;
				case 'descriptions':
					descripitonsValid();
					break;
				case 'keywords':
					keywordsValid();
					break;
			}	
				
				function samplesValid(){
					if(!type(jsonObj,'array')) throw new SyntaxError("The JSON 'samples' object should be of type Array");
					$.each(jsonObj,function(i,v){
						if(!type(v,'object')) throw new SyntaxError("Each item of JSON 'samples' array should be of type Array");
						validateProps(v,['regex','content','description','keywords','id'],['String','String','Array','Array','String'],"JSON 'samples'");
					});
				}
				function descripitonsValid(){
					if(!type(jsonObj,'array')) throw new SyntaxError("The JSON 'descriptions' object should be of type Array");
					$.each(jsonObj,function(i,v){
						if(!type(v,'object')) throw new SyntaxError("Each item of JSON 'descriptions' array should be of type Array");
						validateProps(v,['key','desc'],['String','String'],"JSON 'descriptions'");
						
					});
				}
				function keywordsValid(){
					if(!type(jsonObj,'array')) throw new SyntaxError("The JSON 'keywords' object should be of type Array");
					$.each(jsonObj,function(i,v){
						if(!type(v,'string')) throw new SyntaxError("Each item of JSON 'keywords' array should be of type String");
					});
				}
				
				function validateProps(obj,propNames,dataTypes,src){
					$.each(propNames,function(iter,val){
						if(!type(obj[val],dataTypes[iter])) throw new SyntaxError("Each "+val+" property of "+src+" item should be of type "+dataTypes[iter]+".");
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
	//find some helpful samples of patterns on the internet
//DONE:
	