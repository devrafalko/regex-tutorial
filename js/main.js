ajaxHandle = {
	inputBoxId: 'waiting-ico',
	htmlSection: null,
	regexData: null,
	filters: [],
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

		$('#nav-max-menu>li').on('click',function(){
			var getKeyword = $(this).attr('data-key');
			setNewFilter(getKeyword);
		});

		$('#nav-min-menu').on('input',function(){
			var getKeyword = $(this).find(':selected').attr('data-key');
			setNewFilter(getKeyword);
			this.selectedIndex = 0;
		});

		$('#sumInp').on('click',function(){
			that.filterItems($('#searchInp').val());		
		});

		$('#header-section>header').on('click',function(){
			setNewFilter('');
			that.filterItems('');	
		});

			function setNewFilter(getKeyword){
				$('#searchInp').val(getKeyword);
				that.filterItems(getKeyword);		
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
				if(this.htmlSection) this.initItems();
				$('#waiting-ico').remove();
			}
		});
	},
	initItems: function(){
		for(var i=0;i<this.regexData.length;i++){
			this.matchedData.push(i);
		}
		this.loadNext(true);
	},
	filterItems: function(getText){
		var collection = getText.match(/^\s*$/) ? []:getText.replace(/\s+/g,' ').replace(/^\s+|\s+$/,'').split(' ');
		var that = this;
		if(this.utils.equalArrays(collection,this.filters)) return;
		this.filters = collection.slice();
		this.matchedData = [];
		
		$.each(this.regexData,function(iter,val){
			if(that.utils.matchArrays(val.keywords,collection)) that.matchedData.push(iter);
		});
		
		this.loadNext(true);
	},
	scriptSection: function(getHTML){
		var toggleClasses = '.regex-tips, .regex-keywords, .regex-console';
		var that = this, utils = this.utils;
		
		$($(getHTML).find(toggleClasses)).hide();
		$($(getHTML).find(toggleClasses)).hide();
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

		$(getHTML).find('.regex-keywords>span').on('click',function(){
			var getSearch = $('#searchInp');
			var getSearchValue = getSearch.val();
			var setNew = $(this).html();
			if(getSearchValue.split(' ').some(function(c){return c===setNew;})) return;
			getSearch.val(getSearchValue + ' ' + setNew);
		});

		$(getHTML).find('.test-text').on('input', function(){
			testRegExp();
		});

		$(getHTML).find('.regex-code').on('input', function(){
			this.innerHTML = this.innerHTML.replace(/\n/g,'');
			utils.parseStringToRegExp($(this).html(),getHTML[0]);
			testRegExp();
		});
		
		$(getHTML).find('.regex-button-reset').on('click', function(){
			that.loadData(getHTML,true);
			$(getHTML).find('.regex-code').trigger('input');
		});		
		
		$(getHTML).find('.regex-code').trigger('input');
		
			function testRegExp(){
				var getRegEx = getHTML[0].dataRegExp;
				var button = $(getHTML).find('.regex-button-console');
				var consoleBox = $(getHTML).find('.inner-console');
				if(!getRegEx.passed){
					appendMessage(['fail','failMess']);
					} else {
						var getText = $(getHTML).find('.test-text').html();
						if(getRegEx.output.test(getText)){
							appendMessage(['ok','StrProto']);
							} else {
								appendMessage(['fail','StrProto']);
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
			};
	},
	loadData: function(getItem,isRefresh){
		var matchedNum = getItem[0].dataItemNumber;
		var itemData = this.regexData[matchedNum];
		var parseRegExp = new RegExp(itemData.regex[0],itemData.regex[1]).toString();
		$($(getItem).find('.regex-code')).html(parseRegExp);
		$($(getItem).find('.test-text')).html(itemData.content);
		
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
	loadNext: function(reset){
		var iter, that = this, cMax = 0, all = this.matchedData.length;
		
		if(reset) $('#inner-section').empty();
		iter = $('#inner-section').children('.regex-item').length;
		
		if(this.loadingInterval!==null) clearInterval(this.loadingInterval);

		this.loadingInterval = setInterval(function(){
			if(iter>=all||cMax>=that.nextLoad) {
				clearInterval(that.loadingInterval);
				if(reset) that.createNextButton();
				if(iter===all) that.removeNextButton();
				return;
			}
			var newItem = $(that.htmlSection).clone();
			newItem[0].dataItemNumber = that.matchedData[iter];
			var getHTML = that.loadData(newItem);
			that.scriptSection(getHTML);
			$(getHTML).hide();
			if(reset) $('#inner-section').append(getHTML);
			if(!reset) $('#load-more').before(getHTML);

			$(getHTML).find('.regex-section').mCustomScrollbar({theme:'minimal'});
			$(getHTML).find('.regex-console,.regex-tips,.regex-keywords,.regex-input').mCustomScrollbar({theme:'minimal-dark'});			
			
			$(getHTML).fadeIn(120);			
			iter++;
			cMax++;
		},120);
	},
	utils:{
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
		parseStringToRegExp: function(getString,getObj){
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
						 /^(?:(?!\x2F(.*g.*g.*|.*m.*m.*|.*i.*i.*|.*y.*y.*)$).)+$/gi];

			for(var i=0;i<tests.length;i++){
				if(!getString.match(tests[i])){
					return retObj(false,err[i]);
				};
			}
			
			var firstSlash = getString.indexOf('/');
			var lastSlash = getString.lastIndexOf('/');
			var parseExpression = getString.slice(firstSlash+1,lastSlash);
			var parseFlags = getString.slice(lastSlash+1,getString.length);
			return retObj(true,new RegExp(parseExpression,parseFlags));
			
				function retObj(test,output){
					var r = {};
					r.passed = test;
					r.output = output;
					getObj.dataRegExp = r;
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
			
			
		}
	}
};

ajaxHandle.init();





//TASKS:
//create sample text highlighting when the fragments matches regular expression
//put all signs into regExp and check if any errors appear
//when click on item-round-number should link the URL to the # (create id's for each item, maybe in JSON)