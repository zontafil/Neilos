
var Zcms = {
	config : {
		version : "1.2",
		config_file : "resources/xml/config.xml",
		config_file_tag : 'main',
		config_parent : 'config',
		container_div : "container",
		initialized : false,
		initialize : function(next){
			if (Zcms.config.initialized){
				if ((next!='') && (next!=undefined)) next()
				else return false
			}
			Zcms.structure.new_div(Zcms.config.config_parent,'','body')
			Zcms.structure.new_div(Zcms.config.container_div,'','body')
			Zcms.config.initialized = true
			
			next_par = Array.prototype.slice.call(arguments,0)
			Zcms.tools.add_file.apply(null,$.merge([Zcms.config.config_file,Zcms.config.config_file_tag,''],next_par))
			$('#'+Zcms.config.config_parent).css('visibility','hidden')
			$('#'+Zcms.config.config_parent).css('height','0px')
		},
		get_config : function(cfg,id,eredit){
			//return an array af all config found. if id is set, search inside its config. If eredit is true, search for
			//parents config.
			if (!Zcms.config.initialized) return ""
			var list = new Array()
			if ((id==undefined) || (id=='')) id=Zcms.config.config_file_tag
			obj = id
				while (true){
					list.length = 0
					$('config#'+obj+'_config > '+cfg).each(function(){
						list[list.length]=$(this).text()
					})
					if (list.length > 0) break
					if (eredit!=true) break
					obj = $('#'+obj+'_config').attr('parent')
					if ((obj==undefined) || (obj=='')) break
				}
			return list
		},
		get_config_obj : function(cfg,id,eredit){
			//return an array af all config found. if id is set, search inside its config. If eredit is true, search for
			//parents config.
			if (!Zcms.config.initialized) return ""
			var list = new Array()
			if ((id==undefined) || (id=='')) id=Zcms.config.config_file_tag
			obj = id
				while (true){
					list = $('config#'+obj+'_config > '+cfg)
					if (list.length>0) break
					if (eredit!=true) break
					obj = $('#'+obj+'_config').attr('parent')
					if ((obj==undefined) || (obj=='')) break
				}
			return list
		},		
		analize_config_post : function(id,next){
			
			var next_par = Array.prototype.slice.call(arguments,1)
			
			//analize_config_post: check for config after adding the content
			var cfg = $('#'+Zcms.config.config_parent).find('#'+id+'_config')
			cfg.find('align_horiz').each(function(){
				w = $(this).text()
				dim = ($(window).width()-$(w).width())/2
				$(w).css('left',dim.toString()+"px")
				$('body').resize(function(){
					dim = ($(window).width()-$(w).width())/2
					$(w).css('left',dim.toString()+"px")
				})
			})
			
			//decide if the entry should be visible or not
			skip = Zcms.config.get_config('skipcontent',id) 
			if (skip[0]==undefined){
				dspl = Zcms.config.get_config_obj('display',id,true).last().attr('entries')
				if (dspl=="hide") Zcms.tools.toggle_entry(id,'hide',true)
				else if (dspl=='showfirst'){
					obj = $('#'+id+'_entry')
					if (obj.is(obj.parent().children().first())) Zcms.tools.toggle_entry(id,'show')
					else Zcms.tools.toggle_entry(id,'hide')
				}
				else Zcms.tools.toggle_entry(id,'show')
				//$('#'+id+'_content').attr('style','display: none;')
			}
			Zcms.config.load_xml_from_config.apply(null,$.merge([cfg.find('load_file[mode!="LoadWhenShown"]'),0],next_par))
		},
		analize_config : function(id,next){
			
			//analize_config: check config in the DOM for new css, div, tab or xml to load
			//call this before adding the content
			next_par = Array.prototype.slice.call(arguments,2)

			var cfg = $('#'+Zcms.config.config_parent).find('config#'+id+'_config')
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
					Zcms.structure.new_div($(this).text(),'',parent)
					//Zcms.structure.new_div($(this).text()+'_content','','#'+$(this).text())
				}
			})

			$('config#'+id+'_config').attr('target',Zcms.config.get_config('target',id,true)[0])

			cfg.find('home').each(function(){
				Zcms.home = $(this).text()
			})
			if ((next!='') && (next!=undefined)) next.apply(null,next_par)
			
		},
		load_xml_from_config : function(cfg_tag,index,next){
			//load_xml_from_config: load all xml needed in the conf.
			//xmls are loaded serially through ajax

			params = Array.prototype.slice.call(arguments,3)
			
			if ((index=='') || (index==undefined)) index=0
			if (index>=cfg_tag.length){
				if ((next!='') && (next!=undefined)) next.apply(null,params)
				return false
			}
			parent = $(cfg_tag).eq(index).parent().attr('id')
			if ((parent=='') || (parent==undefined)) return false
			parent = parent.substring(0,parent.indexOf('_config'))
			Zcms.tools.add_file.apply(null,$.merge([cfg_tag.eq(index).text(),cfg_tag.eq(index).attr('entryid'),parent,Zcms.config.load_xml_from_config,cfg_tag,index+1,next],params))		
		},
		remove_config_from_trg : function(trg){
			//remove_config_from_trg
			//delete all config belonging to the specified trg and all subconfigs
			$('#'+Zcms.config.config_parent+' [option!="preserve"][target="'+trg+'"]').each(function(){
				$('#'+Zcms.config.config_parent+' [option!="preserve"][parent="'+$(this).attr('id').split('_config')[0]+'"]').each(function(){
					Zcms.config.remove_config_id($(this).attr('id').split('_config')[0])
				})
				$(this).remove()
			})
		},
		remove_config_id : function(id){
			if ($('#'+Zcms.config.config_parent+' #'+id+'_config').attr('option')!='preserve'){
				$('#'+Zcms.config.config_parent+' [option!="preserve"][parent="'+id+'"]').each(function(){
					Zcms.config.remove_config_id($(this).attr('id').split('_config')[0])
				})
				$('#'+Zcms.config.config_parent+' #'+id+'_config').remove()
			}
		}
		
	},
		
	structure : {
		rebuild_structure : function(){
			$('#'+container_div).remove()
			//rebuild_structure: clear all content from the page and reload divs/tabs from config
			Zcms.structure.new_div(Zcms.config.container_div,'','',body)
			Zcms.config.get_config('structure_tab, structure_div').each(function(){
				var parent = $(this).attr('parent')
				if ((parent!='') || (parent==undefined)) parent='#'+Zcms.config.container_div
				if ($(this).is('structure_tab')) Zcms.structure.new_tab($(this).text(),'',parent)
				else Zcms.structure.new_div($(this).text(),'','',parent)
			})
		},
		new_tab : function(tab_name,parent,notab,cls){
			//new_tab: insert a new tab
			//cls: optional additional class... Default classes are already added.
			//parent must be a valid jquery selector (like '#id')
			//notab: if set don't add the title
			if ($('#'+tab_name+'_entry').length) return false
						
			if (cls==undefined) cls=''
			
			if (notab==true) cls+=' notab'
			else cls+=' tab'
						
			var elm_list = ["title","content","comments"]
			if (notab) elm_list = ["content","comments"]
			
			if ((tab_name==undefined) || (tab_name=='')) Zcms.structure.new_div('',cls,parent)
			else Zcms.structure.new_div(tab_name+'_entry',cls,parent)
			
			for (var i=0;i<elm_list.length;i++){
				if ((tab_name==undefined) || (tab_name=='')) Zcms.structure.new_div('',elm_list[i],'#'+tab_name+'_entry')
				Zcms.structure.new_div(tab_name+'_'+elm_list[i],elm_list[i],'#'+tab_name+'_entry')
			}
			return true
		},
		
		new_div : function(div_name,cls,parent){
			//add new div
			if ((cls!=undefined) && (cls!='')) cls = ' class="'+cls+'"'
			else cls=''
						
			$(parent).find('#'+div_name).remove()
			if ((div_name==undefined) || (div_name=='')) $(parent).append('<div '+cls+anm+'></div>')
			$(parent).append('<div id="'+div_name+'"'+cls+'></div>')
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
					Zcms.tools.add_file('resources/content/'+path,path.split('.')[0],Zcms.config.config_file_tag)
					
				}
			  }
		},
		add_file : function(path,id,parent,next){
			//add a file to the DOM. Seeks for the proper id, and call next when done.
			// parent is optional.. It is useful only for config ereditariety
			var params = Array.prototype.slice.call(arguments,4)
			
			$.ajax({
			type: "GET",
			url: path,
			dataType: "xml",
			success: function(xml){
				if (!$(xml).find('entry#'+id).length){
					if ((next!='') && (next!=undefined)) next.apply(null,params)
				}
				else{
					//id found. Load it with add_entry
					Zcms.tools.add_entry.apply(null,$.merge([xml,id,parent,next],params))
				}
			},
			error: function(){
				if ((next!='') && (next!=undefined)) next.apply(null,params)
				return false}
			})
		},
		add_entry: function (xml,id,parent,next){
			//add_entry: Load an entry.. --> loads config and content
			next_par = Array.prototype.slice.call(arguments,3)
			
			//analyze config					
			var same_config = $('#'+Zcms.config.config_parent).find('config#'+id+'_config')
			if ((!same_config.length) && ($(xml).find('*').andSelf().filter('entry#'+id+' > config').children().length)){

				if ($(xml).find('*').andSelf().filter('entry#'+id+' > config > clear').text()=='true'){
					var trg = $(xml).find('*').andSelf().filter('entry#'+id+' > config > target').text()
					if ((trg==undefined) || (trg=='')) trg = Zcms.config.get_config('target',parent,true)[0]
					Zcms.config.remove_config_from_trg(trg)
				}
				
				//add config div to the DOM		
				var obj2 = $(xml).find('*').andSelf().filter('entry#'+id+' > config').attr('id',id+'_config').clone()
				var $div2 = $("<div/>").append(obj2);
				
				$('#'+Zcms.config.config_parent).append($div2.html());
				if ((parent!='') && (parent!=undefined)) $('config#'+id+'_config').attr('parent',parent)
				Zcms.config.analize_config.apply(null,$.merge([id,Zcms.tools.add_content_check,xml,id],next_par))
			}
			//no config found, load add_content directly
			else {
				var $obj = $('<config/>')
				$obj.attr('id',id+'_config')
				if ((parent!=undefined) && (parent!='')) $obj.attr('parent',parent)
				$('#'+Zcms.config.config_parent).append($obj);
				Zcms.tools.add_content_check.apply(null,$.merge([xml,id],next_par))
			}
		},
		add_content_check : function (xml,id,next){
				//add_content.   Add the content from an xml object.
				//Call this after opening xml and reading its config
				//known issue: trying to load differents contents at the same time with animations may not work
				var next_par = Array.prototype.slice.call(arguments,3)
				
				//prepare the target
				var clr = Zcms.config.get_config('clear',id)[0]
				var trg = Zcms.config.get_config('target',id,true)[0]
				
				var type = Zcms.config.get_config('type',id)[0]
								
				var subentries = $(xml).find('entry#'+id+' > entry')
				var anim_on = Zcms.config.get_config('animation',id,true)
				var anim_type = Zcms.config.get_config_obj("animation",id,true).last().attr('type')
				var speed = Zcms.config.get_config_obj("animation",id,true).last().attr('speed')

				if (anim_type=="fade") animfunc = ["fadeOut","fadeIn"]
				else if (anim_type=="slide") animfunc = ["slideUp","slideDown"]
				else animfunc = ["hide","show"]
				if ((speed!='fast') && (speed!='normal') && (speed!='slow')) speed = 'normal'

				//add all entries to the DOM, check for animation
				if (clr=="true"){
						if (anim_on=="enabled"){

							$(trg)[animfunc[0]](speed,function(){
								$(trg).children().remove()
								$(trg).attr('style','display: block;')
								if (Zcms.config.get_config('skipcontent',id)[0]==undefined)
									Zcms.tools.add_content(xml,id,trg,type)
								Zcms.config.analize_config_post(id)
								//$(trg).find('#'+id+'_entry').attr('style','display: block;') 
								if (Zcms.config.get_config('skipsubentries',id,true)!='true') Zcms.tools.load_entries(subentries,0)
								/*$(trg)[animfunc[1]](speed,function(){
									console.log('oh hai')
								})*/
								if ((next!='') && (next!=undefined)) next.apply(null,next_par)
							})
								
						}
						else {
								$(trg).children().remove()
								$(trg).attr('style','display: none;')
								if (Zcms.config.get_config('skipcontent',id)[0]==undefined)
									Zcms.tools.add_content(xml,id,trg,type)
								Zcms.config.analize_config_post(id)
								$(trg).find('#'+id+'_entry').attr('style','display: block;')
								$(trg).attr('style','display: block;')
								if (Zcms.config.get_config('skipsubentries',id,true)!='true') Zcms.tools.load_entries(subentries,0)
								if ((next!='') && (next!=undefined)) next.apply(null,next_par)
						}
					}
				else {
					if (Zcms.config.get_config('skipcontent',id)[0]==undefined)
						Zcms.tools.add_content(xml,id,trg,type)
					Zcms.config.analize_config_post(id)
					if (Zcms.config.get_config('skipsubentries',id,true)!='true') Zcms.tools.load_entries(subentries,0)
					if ((next!='') && (next!=undefined)) next.apply(null,next_par)
				}
				
		},
		add_content : function(xml,id,trg,type){
				//add_content.. Add <title> and <content> from an entry to the DOM
				//check if content should be added or not
				if (trg!=undefined){
					
					//compute the index of the entry
					if ($(trg).children().length==0) e_index = 1
					else{
						l = $(trg).children().last().attr('class')
						l = l.substring(l.indexOf('index')+5)
						e_index = parseInt(l)+1
					}
					tl = $(xml).find('*').andSelf().filter('entry#'+id+' > title')
					aut  = $('config#'+id+'_config > author')
					dat = $('config#'+id+'_config > date')
					
					if (type!='notab')
					if ((tl.length!=0) || (aut.length!=0) || (dat.length!=0)){
						//add title
						Zcms.structure.new_tab(id,trg,type,'index'+e_index)
						
						title = $('<div/>')
						title.append(aut.clone())
						title.append(dat.clone())
						title.append(tl.clone().contents())
						$(trg).find('#'+id+'_entry > #'+id+'_title').append(title.html())		
					}
					if ($(xml).find('*').andSelf().filter('entry#'+id+' > content').length!=0){
						//add content
						Zcms.structure.new_tab(id,trg,type)
						$(trg).find('#'+id+'_entry').attr('style','display: none;')
						
						content = $('<div/>')
						content.append($(xml).find('*').andSelf().filter('entry#'+id+' > content').clone().contents())
						content = Zcms.tools.var_parser(content.html())
						$(trg).find('#'+id+'_entry > #'+id+'_content').append(content)	

						//add onclick event --> hide, show entry
						$(trg).find('#'+id+'_entry > #'+id+'_title').click(function(){
							str = $(this).parent().attr('id')
							Zcms.tools.toggle_entry(str.substring(0,str.indexOf('_entry')))
						})
					}
				}  
		},
		toggle_entry : function(id,action,disable_animation){
				//toggle_entry: hide or show an entry (tab or div) created with new_tab
				//action(optional) = show/hide
				if (action=='show') act=1
				else if ((action!='hide') && (!$('#'+id+'_entry > #'+id+'_content').is(':visible'))) act=1
				else act=2
				Zcms.tools.toggle_entry_int(id,act,disable_animation)
		},
		toggle_entry_int : function(id,i,disable_animation){
				//toggle_entry_int: hide or show an entry (tab or div) created with new_tab
				//action(mandatory) = 1(show),  2(hide)
				var anim_on = Zcms.config.get_config('animation',id,true)
				var anim_type = Zcms.config.get_config_obj("animation",id,true).last().attr('type')
				var speed = Zcms.config.get_config_obj("animation",id,true).last().attr('speed')
	
				if ((speed!='fast') && (speed!='normal') && (speed!='slow')) speed = 'normal'
				var animfunction=['toggle','show','hide']
				if ((anim_on!='enabled') || (disable_animation=="true")) {
					speed=''
				}
				else if (anim_type=='fade') animfunction=['fadeToggle','fadeIn','fadeOut']
				else if (anim_type=='slide') animfunction=['slideToggle','slideDown','slideUp']
				
				if ($('#'+id+'_entry').is(':visible')==false){
					$('#'+id+'_entry > #'+id+'_title').attr('style','display: block;')
					if (i==1) prp = 'block'
					else prp = 'none'
					$('#'+id+'_entry > #'+id+'_content').attr('style','display: '+prp+';')
					$('#'+id+'_entry > #'+id+'_comments').attr('style','display: '+prp+';')
				}
				else{
					$('#'+id+'_entry > #'+id+'_title')[animfunction[1]](speed,function(){
						$('#'+id+'_entry > #'+id+'_content')[animfunction[i]](speed,function(){
							$('#'+id+'_entry > #'+id+'_comments')[animfunction[i]](speed)
						})
					})
				}
				
				$('#'+id+'_entry')[animfunction[1]](speed)
								
				if (i==1){
					var cfg = $('#'+Zcms.config.config_parent).find('config#'+id+'_config > load_file[mode="LoadWhenShown"]')				
					Zcms.config.load_xml_from_config(cfg,0,function(){cfg.remove()})
				}
		},
		load_entries : function(tag,index,next){
			//load_entries: load all entries in tag
			//entries are loaded serially through ajax

			params = Array.prototype.slice.call(arguments,3)
			
			if ((index=='') || (index==undefined)) index=0
			if (index>=tag.length){
				if ((next!=undefined) && (next!='')) next.apply(null,params)
				return false
			}
			parent = $(tag).eq(index).parent().attr('id')
			id = $(tag).eq(index).attr('id')
			if ((parent=='') || (parent==undefined)) return false
			Zcms.tools.add_entry.apply(null,$.merge([tag,id,parent,Zcms.tools.load_entries,tag,index+1,next],params))		
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










