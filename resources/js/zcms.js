
var Zcms = {
	config : {
		version : "1.1.2",
		config_file : "resources/xml/config.xml",
		config_file_tag : 'main_config',
		config_parent : 'config',
		container_div : "container_div",
		initialized : false,
		initialize : function(next){
			if (Zcms.config.initialized){
				if ((next!='') && (next!=undefined)) next()
				else return false
			}
			Zcms.structure.new_div(Zcms.config.config_parent,'','','body')
			Zcms.structure.new_div(Zcms.config.container_div,'','','body')
			Zcms.config.initialized = true
			
			next_par = Array.prototype.slice.call(arguments,0)
			Zcms.tools.add_file.apply(null,$.merge([Zcms.config.config_file,Zcms.config.config_file_tag],next_par))
			$('#'+Zcms.config.config_parent).css('visibility','hidden')
			$('#'+Zcms.config.config_parent).css('height','0px')
		},
		get_config : function(cfg){
			//return an array af all config found.
			if (!Zcms.config.initialized) return ""
			var list = new Array()
			$('#'+Zcms.config.config_parent).find(cfg).each(function(){
				list[list.length]=$(this).text()
			})
			return list
		},
		analize_config_post : function(){
			//analize_config_post: check for config after adding the content
			var cfg = $('#'+Zcms.config.config_parent)
			cfg.find('align_horiz').each(function(){
				w = $(this).text()
				dim = ($(window).width()-$(w).width())/2
				$(w).css('left',dim.toString()+"px")
				$('body').resize(function(){
					dim = ($(window).width()-$(w).width())/2
					$(w).css('left',dim.toString()+"px")
				})
			})
		},
		analize_config : function(id,next){
			//analize_config: check config in the DOM for new css, div, tab or xml to load
			//call this before adding the content
			next_par = Array.prototype.slice.call(arguments,1)
			var cfg = $('#'+Zcms.config.config_parent).find('config#'+id)
			if (!cfg.length) return false
			
			cfg.find('css').each(function(){
				Zcms.tools.load_css_config($(this).text(),$(this).attr('id'),id,false)
			})
			cfg.find('click').each(function(){
				$($(this).attr('source')).click(function(event){
					  var path = $(this).attr('href')
					  Zcms.tools.open_link_tab(path)
				})
			})
			cfg.find('structure_tab, structure_div').each(function(){
				var parent = $(this).attr('parent')
				if ((parent!='') || (parent==undefined)) parent='#'+Zcms.config.container_div
				if ($(this).is('structure_tab')) Zcms.structure.new_tab($(this).text(),'',parent)
				else {
					Zcms.structure.new_div($(this).text(),'','',parent)
					Zcms.structure.new_div($(this).text()+'_content','','','#'+$(this).text())
				}
			})
			cfg.find('home').each(function(){
				Zcms.home = $(this).text()
			})
						
			Zcms.config.load_xml_from_config.apply(null,$.merge([cfg.find('load_file'),0],next_par))
		},
		load_xml_from_config : function(cfg_tag,index,next){
			//load_xml_from_config: load all xml needed in the conf.
			//xmls are loaded serially through ajax
			 
			params = Array.prototype.slice.call(arguments,3)

			//if ((next=='') || (next==undefined)) alert("fail")
			if ((index=='') || (index==undefined)) index=0
			if (index>=cfg_tag.length){
				next.apply(null,params)
				return false
			}
			Zcms.tools.add_file.apply(null,$.merge([cfg_tag.eq(index).text(),cfg_tag.eq(index).attr('tag'),Zcms.config.load_xml_from_config,cfg_tag,index+1,next],params))		
		},
	},
		
	structure : {
		rebuild_structure : function(){
			//rebuild_structure: clear all content from the page and reload divs/tabs from config
			$('#'+container_div).remove()
			Zcms.structure.new_div(Zcms.config.container_div,'','',body)
			Zcms.config.get_config('structure_tab, structure_div').each(function(){
				var parent = $(this).attr('parent')
				if ((parent!='') || (parent==undefined)) parent='#'+Zcms.config.container_div
				if ($(this).is('structure_tab')) Zcms.structure.new_tab($(this).text(),'',parent)
				else Zcms.structure.new_div($(this).text(),'','',parent)
			})
		},
		new_tab : function(tab_name,parent,cls,anim,notab,comment){
			//new_tab: insert a new tab
			//cls: optional additional class... Default classes are already added.
			//parent must be a valid jquery selector (like '#id')
			
			if ($('#'+tab_name+'_entry').length) return false
			
			if (cls==undefined) cls=''
			if (comment) cls+=' comment'
			else cls+=' entry'
						
			var elm_list = ["title","content","comments"]
			if (notab) elm_list = ["content","comments"]
			var sub_list = ["text","text_right"]
			
			if ((tab_name==undefined) || (tab_name=='')) Zcms.structure.new_div('',cls,anim,parent)
			else Zcms.structure.new_div(tab_name+'_entry',cls,anim,parent)
			
			for (var i=0;i<elm_list.length;i++){
				if ((tab_name==undefined) || (tab_name=='')) Zcms.structure.new_div('',elm_list[i],anim,'#'+tab_name+'_entry')
				Zcms.structure.new_div(tab_name+'_'+elm_list[i],elm_list[i],anim,'#'+tab_name+'_entry')
				for (var j=0;j<sub_list.length;j++){
					if ((tab_name==undefined) || (tab_name=='')) Zcms.structure.new_div('',sub_list[j]+' '+elm_list[i]+'_'+sub_list[j],anim,'#'+tab_name+'_'+elm_list[i])
					Zcms.structure.new_div(tab_name+'_'+elm_list[i]+'_'+sub_list[j],sub_list[j]+' '+elm_list[i]+'_'+sub_list[j],anim,'#'+tab_name+'_'+elm_list[i])
				}
			}
			return true
		},
		
		new_div : function(div_name,cls,anim,parent){
			//add new div
			if ((cls!=undefined) && (cls!='')) cls = ' class="'+cls+'"'
			else cls=''
			
			if ((anim!=undefined) && (anim!='')) anm=' animation="'+anim+'"'
			else anm=''
			
			$(parent).find('#'+div_name).remove()
			if ((div_name==undefined) || (div_name=='')) $(parent).append('<div '+cls+anm+'></div>')
			$(parent).append('<div id="'+div_name+'"'+cls+anm+'></div>')
		}
	},
	
	tools : {
		var_parser : function(str){
			//search for variables in the string and evaluate them
			str = str.replace(/\_\$version/g,Zcms.config.version)
			return str
		},
		load_css_config : function(path,id,config_id,save){
			//load_css_config: load a css file and store it in the config. Is it really useful??
			var same_css = $('#'+Zcms.config.config_parent).find('config:not(#'+config_id+')').find('css#'+id)
			if (same_css.length){
				Zcms.tools.delete_css(same_css.text())
				same_css.remove()
			}
			Zcms.tools.load_css(path)
			if (save) $('#'+Zcms.config.config_parent).append('<css id="'+id+'">'+path+'</css>')
		},
		
		load_css : function(filename){
			//load_css: load a css
			if (!$("link[rel=stylesheet][href='"+filename+"']").length){
				$('head').append('<link rel="stylesheet" href="'+filename+'" type="text/css" />') 
			}
		},
		
		switch_css : function(oldcss,newcss){
			if (!$("link[rel=stylesheet][href='"+oldcss+"']").length) return false
			$("link[rel=stylesheet][href='"+oldcss+"']").attr({href : newcss})
		},
		
		replace_css : function(oldcss,newcss){
			if (!Zcms.tools.switch_css(oldcss,newcss)) Zcms.tools.load_css(newcss)
		},
		
		delete_css : function(filename){
			$("link[rel=stylesheet][href='"+filename+"']").remove()
		},
		
		
		open_link_tab : function(path){
			//open_link_tab: open link
				srv=false
				if (Zcms.config.get_config('server')=='true') srv=true
				
			  if (path.substr(0,1)=='#'){
				path = path.substring(1,path.length)
				if (srv=='true'){
					//php or server tech enabled
				}
				else{
					//use only xml reading through ajax
					Zcms.tools.add_file('resources/content/'+path,path.split('.')[0])
					
				}
			  }
		},
		add_file : function(path,tag,next){
			//add a file to the DOM. Seeks for the proper tag
			next_par = Array.prototype.slice.call(arguments,3)
			$.ajax({
			type: "GET",
			url: path,
			//dataType: "xml",
			success: function(xml){
				//alert(path)
				if (!$(xml).find(tag).length){	
				 //alert('add_xml: no tag found! '+tag)
				 //alert(tag)
				}
				else{
					//analyze config					
					var id = $(xml).find(tag).find('config').attr('id')
					var same_config = $('#'+Zcms.config.config_parent).find('config#'+id)
					if ((!same_config.length) && ($(xml).find(tag).find('config').children().length)){
												
						var obj2 = $(xml).find(tag).find('config').clone();
						var $div2 = $("<div/>").append(obj2);
						$('#'+Zcms.config.config_parent).append($div2.html());
						Zcms.config.analize_config.apply(null,$.merge([id,Zcms.tools.add_content_from_xml,xml,tag,next],next_par))
					}
					//no config found, load add_content directly
					else Zcms.tools.add_content_from_xml.apply(null,$.merge([xml,tag,next],next_par))
				}
			},
			error: function(){return false}
			})
		},
		add_content_from_xml : function (xml,tag,next){
				//add_content_from_xml.   Add the content from an xml object.
				//Call this after opening xml and reading its config
				//known issue: trying to load differents contents at the same time with animations may not work
				
				next_par = Array.prototype.slice.call(arguments,3)

				//prepare the target
				clrall = $(xml).find(tag).attr("clear_all")
				clr = $(xml).find(tag).attr("clear")
				trg = $(xml).find(tag).attr("target")
				if ((trg=='') || (trg==undefined)){
					trg=Zcms.config.get_config('default_target')[0]
				} 
				//default: clear target, not the whole structure
				if (clrall=="true") Zcms.structure.rebuild_structure()
				
				//add all entries to the DOM, check for animation
				if (clr!="false"){
						var anim_on = $(xml).find(tag).attr("animation")
						var anim = $('#'+Zcms.config.config_parent).find('animation').last().text()
						var speed = $('#'+Zcms.config.config_parent).find('animation').last().attr('speed')
						if (anim_on=="enabled"){
							if (anim=="fade") animfunc = ["fadeOut","fadeIn"]
							else if (anim=="slide") animfunc = ["slideUp","slideDown"]
							else animfunc = ["hide","show"]
							
							$(trg)[animfunc[0]](speed,function(){	
								$(trg).children().remove()
								Zcms.tools.add_entries_from_xml($(xml).find(tag),trg)
								$(trg)[animfunc[1]](speed)
								Zcms.config.analize_config_post()
								if ($(xml).find(tag).attr('comments')=='enabled') Zcms.tools.add_comments_to_content(trg)
								if ((next!='') && (next!=undefined)) next.apply(null,next_par)
							})
								
						}
						else {
								$(trg).children().remove()
								Zcms.tools.add_entries_from_xml($(xml).find(tag),trg)
								Zcms.config.analize_config_post()
								if ((next!='') && (next!=undefined)) next.apply(null,next_par)
						}
					}
				else {
					Zcms.tools.add_entries_from_xml($(xml).find(tag),trg)
					Zcms.config.analize_config_post()
					if ((next!='') && (next!=undefined)) next.apply(null,next_par)
				}
				
		},
		add_entries_from_xml : function(tag,trg){
						//add_entries_from_xml: add every <entry> tag to target
						animation = $(tag).attr('animation')
						if (animation==undefined) animation=''
						$(tag).find('entry').each(function(){
							//alert($(this).attr('id'))
							comment=false
							notab=false
							if ($(this).attr("type")=="div") notab=true
							else if ($(this).attr("type")=="tab") notab=false
							else if ($(this).attr("type")=="comment") comment=true
							else return true
							
							id = $(this).attr("id")
							if (comment) id = $(tag).attr('id') + '_' + id
							
							cls=''
							if ($(trg).children().length==0) cls='firstentry'
							
							//add a new tab or div and add the main content
							Zcms.structure.new_tab(id,trg,cls,animation,notab,comment)
							tabcnt = $("<div/>").append($(this).find('entrytitle').clone().contents()).html()
							contentcnt = $("<div/>").append($(this).find('content').clone().contents()).html()
							contentcnt = Zcms.tools.var_parser(contentcnt)
							if ((!notab) && (comment==false)) $(trg).find('#'+id+'_title_text').append(tabcnt)
							else if ((!notab) && (comment)){
								//add author and date of comment
								$(trg).find('#'+id+'_title_text').append($(this).attr('author'))
								$(trg).find('#'+id+'_title_text_right').append($(this).attr('date'))
							} 
							$(trg).find('#'+id+'_content_text').append(contentcnt)
							
							//hide non-first entry
							//TODO: add a setting for this
							if ((cls!='firstentry') && ($(this).attr('type')=='tab')){
								//$(trg).find('#'+id+'_content').hide()
								Zcms.tools.toggle_entry($(trg).find('#'+id+'_entry'),"hide","true")
							} 
							
							
							//add author and date if necessary
							author=date=''
							if ((!notab) && (!comment)){
								if ($(this).attr('author')!=undefined) author='<author>'+$(this).attr('author')+'</author> - '
								if ($(this).attr('date')!=undefined) date='<date>'+$(this).attr('date')+'</date>'
								$(trg).find('#'+id+'_title_text_right').html(author+date)
							}
							
							//add onclick event --> hide, show entry
							//alert($(trg).find('#'+id+'_title').attr('id'))
							if ($(trg).find('#'+id+'_title').length) $(trg).find('#'+id+'_title').click(function(){
								Zcms.tools.toggle_entry($(this).parent())
							})
						})
		},
		toggle_entry : function(trg,action,disable_animation){
				//toggle_entry: hide or show an entry (tab or div) created with new_tab
				//FIXME: Why hiding contents with animation at page loading won't work?
				// ----> Workaround: at page loading, use this with disable_animation="true"
				var anim_on = trg.attr('animation')
				var anim = $('#'+Zcms.config.config_parent).find('animation').last().text()
				var speed = $('#'+Zcms.config.config_parent).find('animation').last().attr('speed')
				
				animfunction=['toggle','show','hide']
				if ((anim_on!='enabled') || (disable_animation=="true")) {
					speed=''
				}
				else if (anim=='fade') animfunction=['fadeToggle','fadeIn','fadeOut']
				else if (anim=='slide') animfunction=['slideToggle','slideDown','slideUp']
				
				if (action=='show') i=1
				else if (action=='hide') i=2
				else i=0
				
				//alert($(trg).find('.content').css('display'))
				if ($(trg).find('.content').css('display')=='none') Zcms.tools.add_comments_to_content(trg)
				$(trg).find('.content').first()[animfunction[i]](speed)
				
				if (action=='show') Zcms.tools.add_comments_to_content($(trg).find('.content'))
				trg.find('.comments')[animfunction[i]](speed)
		},
		add_comments_to_content : function(tag,index,next){
			//alert(tag.find('.title').length)
			//add_comments_to_content : add comments to every active entry, if they exist
			//tag is the entry in the DOM
			params = Array.prototype.slice.call(arguments,3)
			if ((index=='') || (index==undefined)) index=0
			if (index>=$(tag).find('.entry').length){
				//alert('omg')
				if ((next!='') && (next!=undefined)) next.apply(null,params)
				return false
			}
			current_entry = $(tag).find('.entry').eq(index)
			id = current_entry.attr('id')
			filename = ('resources/comments/'+id.slice(0,id.length-6)+'.xml')
			comment_tag = "comments_"+id.slice(0,id.length-6)
			//alert(filename)
			
			Zcms.tools.add_file.apply(null,$.merge([filename,comment_tag,Zcms.tools.add_comments_to_content,tag,index+1,next],params))		

		},
	},
	
	init : function() {
                $('body').children().remove()
                Zcms.config.initialize(Zcms.main)
                
            },
	
	main : function(){
		//main, open #home page
		var hash = window.location.hash;
		if ((hash=='') || (hash==undefined)) hash=Zcms.home
		Zcms.tools.open_link_tab(hash)
		
		$(window).hashchange(function(){
			var hash = window.location.hash;
			if ((hash=='') || (hash==undefined)) hash=Zcms.home
			Zcms.tools.open_link_tab(hash)
		})
		
	}	
}

$(document).ready(Zcms.init)










