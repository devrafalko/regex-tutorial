"use strict";

var ajaxHandle = {
	
	props:{
		loadIcon: 'waiting-ico',
		syncLoad: [0,4],
		hash: null
	},
	ajaxData:{
		htmlSection: null,
		regexData: null,
		descriptionData: null,
		keywordOrder: null
	},
	init: function(){
		this.setPrototypes();
		var ajax = this.ajaxUtils;
		ajax.defaultFormSubmit();
		ajax.getHtmlSection();
		ajax.getRegExData();
		ajax.getDescriptionData();
		ajax.getKeywordsOrderList();
		this.addListeners();
	},	
	setPrototypes: function(){
		var propNames = Object.getOwnPropertyNames(this);
		var that = this, objectNames = [], protoObject = {root:this};
		$.each(propNames,function(_,propName){
			if(that[propName]!==null&&that.utils.type(that[propName],'Object')) {
				objectNames.push(propName);
				protoObject[propName] = that[propName];
				Object.setPrototypeOf(that[propName],protoObject);
			}
		});
	},	
	addListeners: function(){
		var that = this, utils = this.utils, props = this.props;
		var contentUtils = this.contentUtils;
		var renderUtils = this.renderUtils;
		var s = $('#inner-section');
		$("#main-section").mCustomScrollbar({theme:'minimal-dark',scrollInertia:250,mouseWheel:{scrollAmount:160},keyboard:{scrollAmount: 160, scrollType:'stepped'}});

		$('*').tooltip({track:true,show: {delay:300,duration: 200},hide: {delay:0,duration: 100}});

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
			renderUtils.filterItems(getKeyword);
			props.hash = null;
			location.hash = '';
		});

		$('#nav-min-menu').on('change',function(){
			var getKeyword = $(this).find(':selected').attr('data-key');
			$('#searchInp').val(getKeyword);
			renderUtils.filterItems(getKeyword);
			this.selectedIndex = 0;
			props.hash = null;
			location.hash = '';
		});

		$('#sumInp').on('click',function(){
			var getKeyword = $('#searchInp').val();
			renderUtils.filterItems(getKeyword);
			props.hash = null;
			location.hash = '';
		});

		$('#header-section>header').on('click',function(){
			location.hash = '';
			renderUtils.filterItems('');
			$('#searchInp').val('');
			props.hash = null;
		});

		$('#searchInp').on('mouseover',function(){
			$(this).attr('title',$(this).val());
		});

		//regex-section listeners
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
			var elem = item(this);
			var data = utils.itemData(elem);
			contentUtils.onResetContent(elem,data);
			$(elem).find('.regex-code').trigger('keyup');
		});		

		s.on('click','.regex-header',function(){
			var elem = item(this);
			var elemID = elem[0].regexID;
			var encodedID = encodeURI(elemID);
			if(typeof elemID==='undefined') return;
			if(elemID===props.hash) return;
			props.hash = elemID;
			location.hash = encodedID;
			renderUtils.matchedData = [elemID];
			renderUtils.filters = [null];
			$('#searchInp').val('');
			that.renderUtils.loadNextSection(true);
		});

		s.on('keyup cut paste', '.regex-code',function(){
			var elem = item(this);
			var data = utils.itemData(elem);
			if($(this).text()===data.temp.regex.output.toString()) return;
			that.regexpUtils.validateRegex(elem,false);
			contentUtils.render(elem,data);
			renderUtils.loadContent(elem,data,'match');
		});

		s.on('keydown', '.regex-code',function(event){
			if(event.keyCode===13) event.preventDefault();
		});		

		s.on('focus blur', '.test-text',function(event){
			var elem = item(this);
			var data = utils.itemData(elem);
			data.temp.content.focused = event.type==='focusin' ? true:false;
			$(this).toggleClass("bounce");
			if(event.type==='focusin') {
				$(this).closest('.regex-input-cont').addClass('regex-input-focus');
				$(elem).find('.regexpChars').fadeIn();
				} else {
					this.blur();
					$(this).closest('.regex-input-cont').removeClass('regex-input-focus');
					$(elem).find('.regexpChars').fadeOut();
					$(this).trigger('mouseout');
					}
		});
		
		s.on('mouseover mouseout', '.test-text',function(event){
			var elem = item(this);
			var data = utils.itemData(elem);
			if(data.temp.content.focused) return;
			var type = event.type==='mouseover' ? 'edit':'match';
			renderUtils.loadContent(elem,data,type);
		});

		s.on('paste', '.test-text, .regex-code', contentUtils.pasteIntoContentBox.bind(null,'clipboard'));		

		s.on('mousedown','.reg-char',function(event){
			event.preventDefault();
			contentUtils.pasteIntoContentBox('buttons',event);
		});
		
		s.on('keyup cut', '.test-text', function(){
			var elem = item(this);
			var data = utils.itemData(elem);
			var dataObject = data.temp.content;
			if($(this).text()===dataObject.editText) return;
			contentUtils.onEditContent(elem,data);
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
	ajaxUtils:{
		ajax: function(o){
			var that = this.root, ajax = new XMLHttpRequest();
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
		defaultFormSubmit: function(){
			$("#nav-search").submit(function(e){
				e.preventDefault();
			});
		},
		getHtmlSection: function(){
			this.ajax({
				url:'ajax/section.html',
				async:true,
				ready:function(o){
					this.ajaxData.htmlSection = $.parseHTML(o.responseText)[0];
					this.ajaxUtils.fireInitItems();
				}
			});
		},
		getRegExData: function(){
			var that = this;
			this.ajax({
				url:'ajax/samples.json',
				async:true,
				process:function(){
					$('#inner-section').append('<aside id="'+this.props.loadIcon+'"></aside>');
				},
				ready:function(o){
					this.ajaxData.regexData = JSON.parse(o.responseText);
					validateJSON(this.ajaxData.regexData);
					generateTempDataObj.call(this);
					this.ajaxUtils.fireInitItems();
					$('#waiting-ico').remove();
				}
			});
			
				function generateTempDataObj(){
					for(var i=0;i<this.ajaxData.regexData.length;i++){
						this.ajaxData.regexData[i].temp = {parsed:{},regex:{},content:{}};
					}
				}
				
				function validateJSON(jsonObj){
					if(!that.utils.type(jsonObj,'array')) throw new TypeError("The JSON 'samples' object should be of type Array");
					var idCollection = [];
					$.each(jsonObj,function(i,v,b){
						if(!that.utils.type(v,'object')) throw new TypeError("Each item of JSON 'samples' array should be of type Array");
						that.propsValid(v,['regex','content','description','keywords','id'],['String','String','Array','Array','String'],"JSON 'samples'");
						idCollection.push(v.id);
					});
					idCollection.sort(function(a,b){
						if(a===b) throw new SyntaxError("The id '"+a+"' of JSON 'samples' array is doubled.");
						return a<b ? -1:a>b ? 1:0;
					});
				}				
		},		
		getDescriptionData: function(){
			var that = this;
			this.ajax({
				url:'ajax/descriptions.json',
				async:true,
				ready:function(o){
					this.ajaxData.descriptionData = JSON.parse(o.responseText);
					validateJSON(this.ajaxData.descriptionData);
					this.ajaxUtils.fireInitItems();
				}
			});
			
				function validateJSON(jsonObj){
					if(!that.utils.type(jsonObj,'array')) throw new TypeError("The JSON 'descriptions' object should be of type Array");
					$.each(jsonObj,function(i,v){
						if(!that.utils.type(v,'object')) throw new TypeError("Each item of JSON 'descriptions' array should be of type Array");
						that.propsValid(v,['key','desc'],['String','String'],"JSON 'descriptions'");
					});
				}			
		},
		getKeywordsOrderList: function(){
			var that = this;
			this.ajax({
				url:'ajax/keywordsOrder.json',
				async:true,
				ready:function(o){
					this.ajaxData.keywordOrder = JSON.parse(o.responseText);
					validateJSON(this.ajaxData.keywordOrder);
					generateSearchKeywordsList.call(this);
					this.ajaxUtils.fireInitItems();
				}
			});
			
				function generateSearchKeywordsList(){
					for(var i=0;i<this.ajaxData.keywordOrder.length;i++){
						$('#keywords').append('<option value="'+this.ajaxData.keywordOrder[i]+'"/>');
					}
				}
				function validateJSON(jsonObj){
					if(!that.utils.type(jsonObj,'array')) throw new TypeError("The JSON 'keywords' object should be of type Array.");
					$.each(jsonObj,function(i,v){
						if(!that.utils.type(v,'string')) throw new TypeError("Each item of JSON 'keywords' array should be of type String.");
					});
				}
		},
		propsValid: function(getObject,propNames,dataTypes,source){
			var that = this;
			$.each(propNames,function(iter,val){
				if(!that.utils.type(getObject[val],dataTypes[iter])) {
					throw new TypeError("Each "+val+" property of "+source+" item should be of type "+dataTypes[iter]+".");
					} else if(val==="keywords"){
						 $.each(getObject[val],function(_,item){
							if(!that.utils.type(item,"String")) throw new TypeError("Each keywords property of JSON 'samples' item should contain items of type String.");
							if(item.search(/\s/g)!==-1) throw new SyntaxError("Each keywords property of JSON 'samples' item should contain items that do not contain space character.");
						 });
					}
			});
		},

		fireInitItems: function(){
			this.props.syncLoad[0]++;
			if(this.props.syncLoad[0]===this.props.syncLoad[1]) {
				generateItemKeywords.call(this);
				sortDescriptions.call(this);
				filterHash.call(this);
			};
			
				function generateItemKeywords(){
					for(var i=0;i<this.ajaxData.regexData.length;i++){
						var data = this.ajaxData.regexData[i];
						this.regexpUtils.parseInitRegex(data);
						this.regexpUtils.validateRegex(data,true);
						var generateKeywords = data.temp.regex.passed ? this.generateKeywordsCollection(data):[];	
						var sortedKeywords = sortKeywords.call(this,generateKeywords,data.keywords);
						data.keywords = sortedKeywords;
					}
					
						function sortKeywords(defaultKeywords,addKeywords){
							return this.ajaxData.keywordOrder.filter(function(order){
								return defaultKeywords.some(function(list){
									return order === list;
								});
							}).concat(addKeywords);
						}				
				}
				
				function sortDescriptions(){
					var d = this.ajaxData.descriptionData, k = this.ajaxData.keywordOrder, newD = [];
					for(var i=0;i<k.length;i++){
						for(var ii=0;ii<d.length;ii++){
							if(k[i]===d[ii].key){
								newD.push(d.splice(ii,1)[0]);
								break;
							};
						}
					}
					this.ajaxData.descriptionData = newD.concat(d);
				}
			
				function filterHash(){
					var found, that = this, getHash = location.hash;
					var hash = getHash.length ? getHash.replace(/^\x23/,''):false;
					
					
					if(hash){
						hash = decodeURI(hash);
						$.each(this.ajaxData.regexData,function(i,val){
							if(hash===val.id) {
								found = val.id;
								that.props.hash = hash;
								return false;	
							}
						});
					}
					if(typeof found === 'string'){
						this.renderUtils.matchedData = [found];
						this.renderUtils.loadNextSection(true);
						} else {
							this.renderUtils.filterItems('');
							}
				}	
		},
		generateKeywordsCollection: function(data){
			var parsed = data.temp.parsed;
			var plain = parsed.plain;
			var newPlain = plain.replace(/\\\\/g,'');
			var expression = parsed.expression;
			var flags = parsed.flags;
			var inSquares = parsed.inSquares;
			var outSquares = parsed.outSquares;
			var brackets, collection = [];
			var group = [false,false,false,false];
			var tests = [
				[0,flags,/[gim]/,"flag"],
				[0,flags,/[g]/,"g","no-flag-g"],
				[0,flags,/[i]/,"i","no-flag-i"],
				[0,flags,/[m]/,"m","no-flag-m"],
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
				[2,expression,/\\d/,"\\d"],
				[2,expression,/\\D/,"\\D"],
				[2,expression,/\\f/,"\\f"],
				[2,expression,/\\r/,"\\r"],
				[2,expression,/\\t/,"\\t"],
				[2,expression,/\\v/,"\\v"],
				[2,expression,/\\n/,"\\n"],
				[2,expression,/\\s/,"\\s"],
				[2,expression,/\\S/,"\\S"],
				[2,expression,/\\w/,"\\w"],
				[2,expression,/\\W/,"\\W"],
				[2,expression,/[bBdDfrtv0nsSwW]/,"non-special"],
				[2,expression,/\\u[0-9A-Fa-f]{4}/,"\\udddd"],
				[2,newPlain,/[^\\]\\x[0-9A-Fa-f]{2}/,"\\xdd"],
				[3,expression,/^\^/,"^n"],
				[3,expression,/\$$/,"n$"],
				[2,outSquares,/\./,"."],
				[3,outSquares,/\*/,"n*"],
				[3,outSquares,/[^(]\?/,"n?"],
				[3,outSquares,/\+/,"n+"],
				[3,outSquares,/\(\?\=.+\)/,"x(?=y)"],
				[3,outSquares,/\(\?\!.+\)/,"x(?!y)"],
				[3,outSquares,/\{\d+\}/,"n{x}"],
				[3,outSquares,/\{\d+,\d+\}/,"n{x,y}"],
				[3,outSquares,/\{\d+,\}/,"n{x,}"],
				[3,outSquares,/(\*|\+|\?|\{\d+,\d+\}|\{\d+,\})(?=\?)/,"non-greedy"],
				[3,expression,/[$()*+./?\[\]\\^{}|]/,"special"]
			];

			addKeys();
			findParentheses();
			findOctal();
			findSimplePattern();
			addGroupKeys();
			return collection;

				function addKeys(){
					for(var i=0;i<tests.length;i++){
						var t = tests[i];
						if(t[2].test(t[1])&&typeof t[3]!=='undefined'){
							setKeys(t[3],t[0]);
							} else if(!t[2].test(t[1])&&typeof t[4]!=='undefined') {
								setKeys(t[4],t[0]);
								}
						}
				}

				function setKeys(key,num){
					collection.push(key);
					if(num!==null) group[num] = true;
				}

				function addGroupKeys(){
					var grName = ['modifier','bracket','metacharacter','quantifier'];
					for(var i=0;i<group.length;i++){
						if(group[i]) collection.push(grName[i]);
					}
				}

				function findParentheses(){
					var bracketsReg = /\((?!(\?\=|\?\!|\?\:))/g;
					brackets = outSquares.match(bracketsReg);
					brackets = brackets === null ? []:brackets;
					if(brackets&&brackets.length) {
						setKeys('(n)',1);
					};				
				}

				function findOctal(){
					var outDecimals = outSquares.match(/\\\d{1,3}/g);
					var inDecimals = inSquares.match(/\\\d{1,3}/g);
					var numOfGroups = brackets.length;
					var hasGroupRef = false;
					outDecimals = outDecimals===null ? []:outDecimals;
					inDecimals = inDecimals===null ? []:inDecimals;

					var withoutGroups = outDecimals.filter(function(curr){
						for(var i=1;i<=numOfGroups;i++){
							if(curr===("\\"+i)) {
								hasGroupRef = true;
								return false;
							};
						}
						return true;
					});
					
					withoutGroups = withoutGroups.concat(inDecimals);

					var hasZero = withoutGroups.some(function(curr){
						return /(^\\0$)|(^\\0[89]{1,2}$)/.test(curr);
					});

					var hasOctal = withoutGroups.some(function(curr){
						return /(\\[0-7]{2,3})|(\\[1-7])/.test(curr);
					});

					if(hasGroupRef) setKeys('\\x',1);
					if(hasZero) setKeys('\\0',2);
					if(hasOctal) setKeys('\\ddd',2);
				}

				function findSimplePattern(){
					var cond =  (/((^|[^\\])[bBdDfnrsStvwW]|[^0-9bBdDfnrsuxStvwW,=*+{}()\[\]^$\?.\\|]|\\[\*+{}()\[\]^$\?.\\|])/.test(outSquares)) ||
								(/[ux0-9]/.test(outSquares.replace(/(\(\?\:|\(\?\=|\(\?\!|\\u[0-9A-Fa-f]{4}|\\x[0-9A-Fa-f]{2}|\{\d+\,?\d*?\}|\\[0-7]{1,3})|\\[0-9]{1,2}/g,'')));
					if(cond) return setKeys('simple-pattern',null);
				}
		}
	},
	
	renderUtils: {
		loadingInterval:null,
		matchedData: [],
		nextLoad: 5,
		filters: [null],
		filterItems: function(getText){
			var collection = getText.match(/^\s*$/) ? []:getText.replace(/\s+/g,' ').replace(/^\s+|\s+$/,'').split(' ');
			var that = this;
			if(equalArrays(collection,this.filters)) return;
			this.filters = collection.slice();
			this.matchedData = [];
			$.each(this.ajaxData.regexData,function(_,val){
				if(matchArrays(val.keywords,collection)){
					that.matchedData.push(val.id);
				}
			});
			this.loadNextSection(true);
			
				function matchArrays(a,b){
					for(var i=0;i<b.length;i++){
						var test = a.some(function(curr){
							return curr === b[i];
						});
						if(!test) return false;
					}
					return true;
				}
				
				function equalArrays(a,b){
					if(a.length!==b.length) return false;
					var a = a.slice(), b = b.slice();
					for(var i=0;i<a.length;i++){
						var getIndex = b.findIndex(function(curr){
							return curr === a[i];
						});
						if (getIndex===-1) return false;
						b.splice(getIndex,1);
					}
					return true;
				}
		},
		loadNextSection: function(clearAll){
			var iterA, iterB, getChildNum, prepNum, that = this, cMax = 0, all = this.matchedData.length,collection = [];
			if(clearAll) $('#inner-section').empty();
			if(this.loadingInterval!==null) clearInterval(this.loadingInterval);
			getChildNum = $('#inner-section').children('.regex-item').length;
			iterA = getChildNum;
			iterB = getChildNum;
			prepNum = all-getChildNum>this.nextLoad?this.nextLoad:all-getChildNum;
			
			for(var i=0;i<prepNum;i++){
				var elem,data;
				elem = $(this.ajaxData.htmlSection).clone();
				elem[0].regexID = this.matchedData[iterA];
				data = this.utils.itemData(elem);

				this.contentUtils.onResetContent(elem,data);
				this.loadKeywords(elem,data);
				this.loadDescriptions(elem,data);
						
				collection.push(elem);
				scriptSection(elem);

				$(elem).hide();
				if(clearAll) $('#inner-section').append(elem);
				if(!clearAll) $('#load-more').before(elem);
				$(elem).find('.regex-section').mCustomScrollbar({theme:'minimal'});
				$(elem).find('.regex-console,.regex-tips,.regex-keywords,.regex-input').mCustomScrollbar({theme:'minimal-dark'});
				iterA++;
			}

			this.loadingInterval = setInterval(interval,150);

				function interval(){
					if(cMax===prepNum) {
						clearInterval(that.loadingInterval);
						if(clearAll) createNextButton();
						if(iterB===all) removeNextButton();
						return;
						}
					$(collection[cMax]).fadeIn(300);			
					cMax++;
					iterB++;				
				}

				function createNextButton(){
					var button = $.parseHTML('<nav id="load-more"><span>load more</span></nav>');
					var bLoadNextSection = that.loadNextSection.bind(that,false);
					$(button).on('click',bLoadNextSection);
					$('#inner-section').append(button);
				}

				function removeNextButton(){
					$('#inner-section').find('#load-more').remove();
				}

				function scriptSection(elem){
					var toggleClasses = '.regex-tips, .regex-keywords, .regex-console';
					$(elem).find(toggleClasses).hide();
					attachToggle(elem,0,1,2);
					attachToggle(elem,1,2,0);
					attachToggle(elem,2,0,1);
				}

				function attachToggle(elem,a,b,c){
					var setClass = ['tips','keywords','console'];
					$(elem).find('.regex-button-'+setClass[a]).click(function(){
						$(elem).find(".regex-"+setClass[b]).slideUp();
						$(elem).find(".regex-"+setClass[c]).slideUp();
						$(elem).find(".regex-"+setClass[a]).slideToggle();
					});
				}
		},
		loadKeywords: function(elem,data){
			$(elem).find('.regex-keywords').append(generateKeywordsSpans());
			
				function generateKeywordsSpans(){
					var keywordsCollection = "";
					$.each(data.keywords,function(i,val){
						keywordsCollection += '<span class="keyword-butt">' + val + '</span>';
					});
					return keywordsCollection;
				}
		},
		loadDescriptions: function(elem,data){
			var utils = this.utils;
			$(elem).find('.regex-tips').append(generateDescriptions.call(this,this.ajaxData.descriptionData,data.keywords,data.description));
				function generateDescriptions(defaultDefinitions,keywords,addDefinitions){
					var newList = '<ul class="description-list">';
					var keyCollection = defaultDefinitions.filter(function(cA){
						return keywords.some(function(cB){
							return cA.key===cB;
						});
					});
					$.each(keyCollection,function(i,c){
						keyCollection[i] = c.desc;
					});
					var newKeyCollection = addDefinitions.concat(keyCollection);
					for(var i=0;i<newKeyCollection.length;i++){
						newList += '<li>';
						if(utils.type(newKeyCollection[i],'String')) {
							newList += parseStringToCode(newKeyCollection[i]);
							} else if(utils.type(newKeyCollection[i],'Object')){
								var name = Object.getOwnPropertyNames(newKeyCollection[i])[0];
								var value = newKeyCollection[i][name];
								if(utils.type(name,'undefined')) throw new SyntaxError("Each description property of JSON 'samples' item should contain items of type Object with header property.");
								if(!utils.type(value,'Array')) throw new TypeError("Each description property of JSON 'samples' item should be of type Array.");
								newList += parseStringToCode(name)+generateDescriptions([],null,value);
								} else {
									throw new TypeError("Each description property of JSON 'samples' item should contain items of type String or Object.");
								}
						newList += '</li>';
					}
					newList += '</ul>';
					return newList;

						function parseStringToCode(value){
							return value.replace(/\x7B.*?\x7D{1,}/g,function(c){
								var el = c.split(/\x7B|\x7D/g);
								if(el[1]==='reg') return '<code class="tip-reg">'+el[2]+'</code>';
								if(el[1]==='code') return '<code class="tip-code">'+el[2]+'</code>';
								if(el[1]==='val') return '<kbd class="tip-val">'+el[2]+'</kbd>';
								if(el[1]==='mark') return '<span class="tip-mark">'+el[2]+'</span>';
								if(el[1]==='search') return '<span class="keyword-butt tip-search">'+el[2]+'</span>';
								if(el[1]==='link') return '<a href="'+el[2]+'" target="_blank" class="tip-link">'+el[3]+'</a>';
							});
						}
				}
		},
		loadRegexp: function(elem,data){
			$(elem).find('.regex-code').text(data.regex);
		},
		loadContent: function(elem,data,state){
			var contentBox = $(elem).find('.test-text');
			var content = data.temp.content;
			if(state==='match'){
				contentBox.html(content.renderText);
				} else {
					contentBox.text(content.editText);
					}
		}
	},
	consoleUtils: {
		printConsoleMessage: function(elem,data){
			var that = this;
			var tempRegex = data.temp.regex;
			var tempContent = data.temp.content.matchingText;
			var consoleBox = $(elem).find('.inner-console');
			var cData = !tempRegex.passed ? [false,false]:tempRegex.output.test(tempContent) ? [true,true]:[false,true];
			consoleBox.empty();
			printResult(cData[0]);
			printConsolePrototypes(cData[1]);

			function printResult(p){
				var button = $(elem).find('.regex-button-console');
				var setMsg = p ? "passed":"failed";
				var classOk = ['ok','fail'][Number(p)];
				var classFail = ['ok','fail'][Number(!p)];
				button.removeClass('test-status-'+classOk).addClass('test-status-'+classFail);
				consoleBox.append('<samp class="'+classFail+'">Test '+setMsg+'</samp>');
			}

			function printConsolePrototypes(msg){
				if(!msg){
					consoleBox.append('<samp class="fail">' + 'SyntaxError: Invalid regular expression. ' + tempRegex.output + '</samp>');				
					} else {
						$.each(['match','search','split'],function(c,v){
							consoleBox.append('<samp>String.prototype.' + v + '() return: ' + styleType.call(that,tempContent[v](tempRegex.output)) + '</samp>');	
						});
						$.each(['test','exec'],function(c,v){
							consoleBox.append('<samp>RegExp.prototype.' + v + '() return: ' + styleType.call(that,tempRegex.output[v](tempContent)) + '</samp>');	
						});
						}
						
					function styleType(dataType){
						return createSpan.call(this,dataType);
							
							function createSpan(value){
								var t = ['null','undefined','boolean','string','number','array'];
								var cl = ['msgNull','msgUndefined','msgBoolean','msgString','msgNumber','msgArray'];
								var val = ['null','undefined',String(value),'&#8220;'+this.parsers.escapeHtml(value)+'&#8221;',String(value)];

								for(var i=0;i<t.length;i++){
									var addArr = i<t.length-1 ? val[i]:createArray.call(this,value);
									if(this.utils.type(value,t[i])) return '<span class="'+cl[i]+'">'+addArr+'</span>';
								}
							}

							function createArray(arr){
								var spanArr = '[';
								for(var i=0;i<arr.length;i++){
									spanArr += createSpan.call(this,arr[i]);
									if(i<arr.length-1) spanArr += ",<wbr/>";
								}
								spanArr += ']';
								return spanArr;
							}
					}					
			}
		}		
	},
	regexpUtils: {
		validateRegex: function(elemData,init){
			var fullExpression,parseSlashes,divide,expression,flags,squares,inSquares,outSquares,newRegEx,that=this;
			fullExpression = init ? elemData.regex:$(elemData).find('.regex-code').text();
			parseSlashes = this.parseSlashEscaped(fullExpression);
			divide = this.parseExpressionFlags(parseSlashes);
			expression = divide.expression;
			flags = divide.flags;
			squares = this.parseSquares(expression);
			inSquares = squares.inside;
			outSquares = squares.outside;

			if(validSyntax()) return;
			if(validDefaultRegErrors()) return;
			returnPassedTest();

				function validSyntax(){
					var dataObject = [
						{str:parseSlashes,errMsg:'Expression should begin and end with: /',regTest:/^\/.*\/\w*$/},
						{str:outSquares,errMsg:'Expression should not contain \'/\' inside expression. Use \'\\/\' instead',regTest:/^[^/]*$/},
						{str:parseSlashes,errMsg:'Incorrect flags. Use: g i m y',regTest:/\/(g|i|m|y){0,4}$/g},
						{str:parseSlashes,errMsg:'Incorrect flags. Use: \'g\' \'i\' \'m\' \'y\' flag just once',regTest:/^\x2F.*\x2F(?!(.*g.*g|.*i.*i|.*m.*m))/}];
					for(var i=0;i<dataObject.length;i++){
						if(!dataObject[i].str.match(dataObject[i].regTest)){
							returnObject(false,dataObject[i].errMsg);
							return true;
						};
					}				
				}

				function validDefaultRegErrors(){
					try{
						newRegEx = new RegExp(expression,flags);
					} catch(a){
						returnObject(false,a.name+': '+a.message);
						return true;
					};					
				}

				function returnPassedTest(){
					returnObject(true,newRegEx);
					return true;
				}

				function returnObject(test,output){
					var getObject = init ? elemData:that.utils.itemData(elemData);
					if(init&&!test) throw new SyntaxError('SyntaxError: Invalid regular expression "'+fullExpression+'". '+output);
					getObject.temp.regex = {passed:test,output:output};
					getObject.temp.parsed = {plain:fullExpression,expression:expression,flags:flags,inSquares:inSquares,outSquares:outSquares};
				}
		},
		parseSlashEscaped: function(getPlain){
			return getPlain
				.replace(/\\\\/g,'\\x5C')
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
				.replace(/\\\]/g,'\\x5D')
				.replace(/\\\^/g,'\\x5E')
				.replace(/\\\{/g,'\\x7B')
				.replace(/\\\|/g,'\\x7C')
				.replace(/\\\}/g,'\\x7D');
		},
		parseExpressionFlags: function(getSlashed){
			var firstSlash = getSlashed.indexOf('/');
			var lastSlash = getSlashed.lastIndexOf('/');
			var expression = getSlashed.slice(firstSlash+1,lastSlash);
			var flags = getSlashed.slice(lastSlash+1,getSlashed.length);
			return {expression:expression,flags:flags};
		},
		parseSquares: function(getExpression){
			var inSquares = '';
			var outSquares = getExpression.replace(/(\[.+?\])/g,function(c){
				inSquares += c;
				return '[]';
			});			
			return {inside:inSquares,outside:outSquares};
		},
		parseInitRegex: function(data){
			data.regex = data.regex
				.replace(/\f/g,'\\f')
				.replace(/\n/g,'\\n')
				.replace(/\r/g,'\\r')
				.replace(/\t/g,'\\t');			
		}
	},
	contentUtils: {
		virtualDIV: (function(){return document.createElement('DIV');})(),
		onResetContent: function(elem,data){
			var temp = data.temp.content;
			var parseHtmlChars = this.parsers.escapeHTMLChars(data.content);
			var parseFNRT = parseHtmlChars.replace(/\\+(?=f|\f|n|\n|r|\r|t|\t|v|\v|0|\0)/g,function(a){return a+a;});
			var parseJS = this.parsers.escapeJS(parseFNRT);
			temp.editText = parseJS;
			temp.matchingText = parseHtmlChars;
			this.render(elem,data);
			this.renderUtils.loadRegexp(elem,data);
			this.renderUtils.loadContent(elem,data,'match');
		},
		onEditContent: function(elem,data){
			var temp = data.temp.content;
			var inputText = $(elem).find('.test-text').text();
			var escapedHTML = this.parsers.escapeHTMLChars(inputText);
			var escapedJS = this.parsers.escapeJS(escapedHTML);
			var parsedFNRT = escapedHTML
					.replace(/(\\+)(f|n|r|t|v|0)/g,function(_,b,c){
						var chars = {'f':'\f','n':'\n','r':'\r','t':'\t','v':'\v','0':'\0'};
						var getChar = c in chars ? chars[c] : '';
						var slashes = b.slice(0,b.length/2);
						var isOdd = !!(b.length%2) ? getChar:c;
						return slashes + isOdd;
					});
			
			temp.editText = escapedJS;
			temp.matchingText = parsedFNRT;			
			this.render(elem,data);
		},
		render: function(elem,data){
			var temp = data.temp.content;
			var matches = data.temp.regex.output;
			var value = temp.matchingText.replace(matches,render);
			var parseHtml = this.parsers.escapeHtml(value)
					.replace(/\x7Bmtch\x7B/g,'<mark class="reg-hlight">')
					.replace(/\x7Dmtch\x7D/g,'</mark><wbr/>');
			temp.renderText = parseHtml;
			this.consoleUtils.printConsoleMessage(elem,data);		
			
				function render(a){
					return '{mtch{'+a+'}mtch}';
				}
		},
		pasteIntoContentBox: function(type,event){
			event.preventDefault();
			var contentBox = type==='buttons' ? $(event.target).closest('.regex-item').find('.test-text').get()[0]:event.target;
			var getText = $(contentBox).text();
			var getPaste = type==='clipboard' ? (event.originalEvent.clipboardData || window.clipboardData).getData("text"):event.target.textContent;
			var s = window.getSelection();
			var a = s.anchorOffset;
			var f = s.focusOffset;
			var selSide = a>f ? [f,a]:[a,f];
			var textLeft = getText.slice(0,selSide[0]);
			var textRight = getText.slice(selSide[1],getText.length);
			var newText = textLeft + getPaste + textRight;
			setTimeout(function(){
				$(this).text(newText);
				var range = document.createRange();
				range.setStart (this.childNodes[0], textLeft.length+getPaste.length);
				range.collapse(false);
				s.removeAllRanges();
				s.addRange(range);
				$(this).trigger('keyup');
			}.call(contentBox),0);
		}
	},
	parsers: {
		escapeHtml: function(value) {
			if(typeof value!=='string') return value;
			return value
				 .replace(/</g, "&lt;")
				 .replace(/>/g, "&gt;");
		},
		escapeHTMLChars: function(value){
			var box = this.contentUtils.virtualDIV;
			var withoutHTML = this.escapeHtml(value).replace(/\r/g,'&#013;');
			box.innerHTML = withoutHTML;
			var esc = box.textContent.replace(/\uFFFD/g,'\0');
			return esc;
		},
		escapeJS: function(value){
			return value
				.replace(/\r/g,'\\r')
				.replace(/\n/g,'\\n')
				.replace(/\f/g,'\\f')
				.replace(/\t/g,'\\t')
				.replace(/\v/g,'\\v')
				.replace(/\0/g,'\\0');
		}
	},
	utils:{
		itemData: function(elem){
			var id = elem[0].regexID;
			var obj = this.ajaxData.regexData;
			for(var i=0;i<obj.length;i++){
				if(id===obj[i].id) return obj[i];
			}
			return null;
		},
		type: function(value,type){
			type = type.toLowerCase();
				if(typeof value==='undefined'&&type==='undefined') return true;
				if(value===null&&type==='null') return true;
				if(value===null||value===undefined) return false;
				return value.constructor.toString().toLowerCase().search(type)>=0;
		},
		generateId: function(numOfSamples,callback){
			if(typeof numOfSamples !== 'number' || typeof callback !== 'function' || numOfSamples<=0) return;
			var ret = "", iter = 0;
			var newInt = setInterval(function(){
				var newID = new Date().getTime().toString(36);
				ret += '{\n\t"regex":"",\n\t"content":"",\n\t"description":[],\n\t"keywords":[],\n\t"id":"'+newID+'"\n},\n';
				iter++;
				if(iter===numOfSamples) {
					clearInterval(newInt);
					return callback(ret);
				}
			},20);
		}
	}
};

//ajaxHandle.utils.generateId(10,function(a){console.log(a);});

ajaxHandle.init();

//to do:
	//paste into regex input does not work!


//for jasmine unit tests
//	module.exports.generateKeywordsCollection = ajaxHandle.ajaxUtils.generateKeywordsCollection;
//	module.exports.parseSlashEscaped = ajaxHandle.regexpUtils.parseSlashEscaped;;	
//	module.exports.parseExpressionFlags = ajaxHandle.regexpUtils.parseExpressionFlags;	
//	module.exports.parseSquares = ajaxHandle.regexpUtils.parseSquares;




