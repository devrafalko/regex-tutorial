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
		this.getHtmlSection();
		this.getRegExData();
		this.addListeners();
	},
	addListeners: function(){
		var that = this;
		
		$("#main-section,.regex-section").mCustomScrollbar();

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
		
		function setNewFilter(getKeyword){
			$('#searchInp').val(getKeyword);
			that.filterItems(getKeyword);		
		}
		
		$('#sumInp').on('click',function(){
			that.filterItems($('#searchInp').val());		
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
		var getClasses = '.regex-tips, .regex-keywords, .regex-console';
		$($(getHTML).find(getClasses)).hide();
		$($(getHTML).find(getClasses)).hide();

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
	},
	loadInputData: function(matchedNum){
		var getHTML = $(this.htmlSection).clone();
		var itemData = this.regexData[matchedNum];
		var parseRegExp = new RegExp(itemData.regex[0],itemData.regex[1]).toString();
		var regBox = $($(getHTML).find('.regex-keywords'));
		
		$($(getHTML).find('.regex-code')).html(parseRegExp);
		$($(getHTML).find('.regex-input>textarea')).html(itemData.content);
		$($(getHTML).find('.regex-tips')).html(itemData.description);
		
		$.each(itemData.keywords,function(ind,val){
			regBox.append('<span>'+val+'</span>');
		});
		
		return getHTML;
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
			if(iter>=all||cMax>=this.nextLoad) {
				clearInterval(that.loadingInterval);
				if(reset) that.createNextButton();
				if(iter===all) that.removeNextButton();
				return;
			}
			var getHTML = that.loadInputData(that.matchedData[iter]);
			that.scriptSection(getHTML);
			$(getHTML).hide();
			if(reset) $('#inner-section').append(getHTML);
			if(!reset) $('#load-more').before(getHTML);
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
		}
	}
};

ajaxHandle.init();







