ajaxHandle = {
	inputBoxId: 'waiting-ico',
	htmlSection: null,
	regexData: null,
	filters: [],
	nextLoad: 5,
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
		//get the String argument
		//parse string into array type split(' ');
		//if this.filters equals getText - return (do nothing)
		//empty this.matched -> []
		//find items in JSON object which match filters and add its indeces into this.matched
		//fire this.loadNext(true)

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
	},
	loadInputData: function(matchedNum){
		var getHTML = $(this.htmlSection).clone();
		var itemData = this.regexData[this.matchedData[matchedNum]];
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
		console.log("tworzę nowy button");
		var butt = $.parseHTML('<nav id="load-more"><span>load more</span</nav>');
		var bLoadNext = this.loadNext.bind(this,false);
		$(butt).on('click',bLoadNext);
		$('#inner-section').append(butt);

	},
	removeNextButton: function(){
		$('#inner-section').find('#load-more').remove();
	},
	loadNext: function(reset){
		if(reset) $('#inner-section').empty();

		var iter = $('#inner-section').children('.regex-item').length;
		var cMax = 0;
		var all = this.matchedData.length;
		var max = this.nextLoad;
		for(;iter<all&&cMax<max;iter++,cMax++){
			var getHTML = this.loadInputData(this.matchedData[iter]);
			this.scriptSection(getHTML);
			if(reset) $('#inner-section').append(getHTML);
			if(!reset) $('#load-more').before(getHTML);
		}
		
		if(reset) this.createNextButton();
		if(iter===all) this.removeNextButton();

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





//load ul menu elements into responsive select option
(function(){
	var getLis = $('#nav-max-menu').children().each(function(i,ob) {
		$(ob).on('mouseover mouseout',function(){
			$(this).children("span:first-of-type").toggleClass('line-hover');
			$(this).children("span:last-of-type").toggleClass('name-hover');
		});
		$("#nav-min-menu").append('<option>'+ob.innerHTML+'</option>');
	});
})();

//attach scrollbar for containers
$("#main-section,.regex-section").mCustomScrollbar();