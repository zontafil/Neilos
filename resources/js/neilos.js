
var Neilos = {
	config : {
		version : "1.4.1",
		debug : 0,
		config_file : "resources/xml/config.xml",
		config_file_tag : 'main',
		config_parent : 'config',
		container_div : "container",
		initialized : false,
		initialize : function(next){
			if (Neilos.config.initialized){
				if ((next!='') && (next!=undefined)) next()
				else return false
			}
			Neilos.structure.new_div(Neilos.config.config_parent,'','body')
			Neilos.structure.new_div(Neilos.config.container_div,'','body')
			Neilos.config.initialized = true
			
			next_par = Array.prototype.slice.call(arguments,0)
			Neilos.tools.add_file.apply(null,$.merge([Neilos.config.config_file,Neilos.config.config_file_tag,''],next_par))
			$('#'+Neilos.config.config_parent).css('visibility','hidden')
			$('#'+Neilos.config.config_parent).css('height','0px')
			return true
		},
		get_config : function(cfg,id,eredit){
			//return an array af all config found. if id is set, search inside its config.
			if (!Neilos.config.initialized) return ""
			var list = new Array()
			if ((id==undefined) || (id=='')) id=Neilos.config.config_file_tag
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
			//TODO: Unificate the 3 functions... use an argument to pass before, mid, after
			//analize config after target clearing and before content loading
			//return an array af all config found. if id is set, search inside its config. If eredit is true, search for
			//parents config.
			if (!Neilos.config.initialized) return ""
			var list = new Array()
			if ((id==undefined) || (id=='')) id=Neilos.config.config_file_tag
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

		analize_config : function(id,section,next){
			//analize_config: check config in the DOM for new css, div, tab or xml to load
			//section can be pre, mid or post.
			//pre: before adding the entry
			//mid: after clearing target, before adding content
			//post: after adding content
			
			if (Neilos.config.debug) console.log('analize_config '+id+' '+section)
			var next_par = Array.prototype.slice.call(arguments,3)
			
			var cfg = $('#'+Neilos.config.config_parent).find('#'+id+'_config')
			
			if (config.length==0) return false
			
			if (section=='pre'){
				//PRE CONFIG
				
				cfg.find('css').each(function(){
					Neilos.tools.load_css_config($(this).text(),$(this).attr('id'),id,false)
				})
	
				$('config#'+id+'_config').attr('target',Neilos.config.get_config('target',id,true)[0])
	
				cfg.find('home').each(function(){
					Neilos.home = $(this).text()
				})
				cfg.find('pagetitle').each(function(){
					if ($('head title').length==0) $('head').append('<title/>')
					$('head title').eq(0).text($(this).text())
				})
				if ((next!='') && (next!=undefined)) next.apply(null,next_par)
	
					
			}
			
			if (section=='mid'){
				//MID CONFIG
				cfg.find('structure_tab, structure_div').each(function(){
					var parent = $(this).attr('parent')
					var overwrite = $(this).attr('overwrite')
					if ((parent=='') || (parent==undefined)) parent='#'+Neilos.config.container_div
					if ($(this).is('structure_tab')) Neilos.structure.new_tab($(this).text(),'',parent)
					else {
						Neilos.structure.new_div($(this).text()+'_container','',parent,overwrite)
						Neilos.structure.new_div($(this).text(),'','#'+$(this).text()+'_container',overwrite)
					}
				})
			}
			
			if (section=='post'){
				//POST CONFIG
				
				cfg.find('align_horiz').each(function(){
					w = $(this).text()
					dim = ($(window).width()-$(w).width())/2
					$(w).css('left',dim.toString()+"px")
					$('body').resize(function(){
						dim = ($(window).width()-$(w).width())/2
						$(w).css('left',dim.toString()+"px")
					})
				})
				
				//add additional classes to entry
				cfg.find('class').each(function(){
					$('#'+id+'_entry').addClass($(this).text())
				})
				
				//add default onclick event --> hide, show entry
				$('#'+id+'_entry > #'+id+'_title').off('click')
				$('#'+id+'_entry > #'+id+'_title').click(function(){
					str = $(this).parent().attr('id')
					Neilos.tools.toggle_entry(str.substring(0,str.indexOf('_entry')))
				})
				
				//add additional onclick events
				cfg.find('click').each(function(){
					var href = $(this).attr('href')
					var upd = $(this).attr('updateurl')
					var remove = $(this).attr('remove')
					if ($(this).attr('prevent_default')=='true') $('#'+id+'_entry > #'+id+'_title').off('click')
					$('#'+id+'_entry').off('click')
					$('#'+id+'_entry').click(function(event){
						  if (remove=='true') Neilos.tools.remove_entry(id)
						  if ((href!='') && (href!=undefined)) {
							if (upd=='true') Neilos.tools.pushUrl('#!'+href)
							Neilos.tools.open_link_tab(href)
						  }
					})
				})
				
				//update the url bar if necessary
				cfg.find('updateurl').each(function(){
					if ($(this).text()!='') Neilos.tools.pushUrl($(this).text())
				})
				
				
				//delete needed entries
				cfg.find('delete').each(function(){
					var deleteid = $(this).attr('id')
					Neilos.config.remove_config_id(deleteid)
					$('#'+deleteid+'_entry').remove()
				})
				
				//check forms
				cfg.find('checkform').each(function(){
					//TODO: THIS IS ONLY A PROOF OF CONCEPT!
					var formid = $(this).attr('selector')
					var href = $(this).attr('href')
					$(formid).submit(function(){
						var param = ''
						var i=0
						$(this).find('input[check="true"]').each(function(){
							i=i+1;
							param = param + '&param'+i+'='+$(this).val()
						})
						//href = href.split('#!')[href.split('#!').length-1] + '&param='+param
						href = href.split('#!')[href.split('#!').length-1] + param
						Neilos.tools.open_link_tab(href)
						return false
					})
					
				})
				
				
				//decide if the entry should be visible or not
				var skip = Neilos.config.get_config('skipcontent',id) 
				var tagl = cfg.find('load_file[mode!="LoadWhenShown"]')
				if (skip[0]!='true'){
					var dspl = Neilos.config.get_config_obj('display',id,true).last().attr('entries')
					if (dspl=="hide")
						Neilos.tools.toggle_entry.apply(null,$.merge([id,'hide','',Neilos.config.load_xml_from_config,tagl,0,next],next_par))
					else if (dspl=='showfirst'){
						obj = $('#'+id+'_entry')
						if (obj.is(obj.parent().children().first()))
							Neilos.tools.toggle_entry.apply(null,$.merge([id,'show','',Neilos.config.load_xml_from_config,tagl,0,next],next_par))
						else
							Neilos.tools.toggle_entry.apply(null,$.merge([id,'hide','',Neilos.config.load_xml_from_config,tagl,0,next],next_par))
					}
					else
						Neilos.tools.toggle_entry.apply(null,$.merge([id,'show','',Neilos.config.load_xml_from_config,tagl,0,next],next_par))
				}
				//skip the content, should be loaded when the entry is toggled
				else
					Neilos.config.load_xml_from_config.apply(null,$.merge([tagl,0,next],next_par))
			}
			
			
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
			var parent = $(cfg_tag).eq(index).parent().attr('id')
			if ((parent=='') || (parent==undefined)) return false
			parent = parent.substring(0,parent.indexOf('_config'))
			Neilos.tools.add_file.apply(null,$.merge([cfg_tag.eq(index).text(),cfg_tag.eq(index).attr('entryid'),parent,Neilos.config.load_xml_from_config,cfg_tag,index+1,next],params))		
		},
		remove_config_from_trg : function(trg){
			//remove_config_from_trg
			//delete all config belonging to the specified trg and all subconfigs
			var parent = ''
			$('#'+Neilos.config.config_parent+' [option!="preserve"][target="'+trg+'"]').each(function(){
				$('#'+Neilos.config.config_parent+' [option!="preserve"][parent="'+$(this).attr('id').split('_config')[0]+'"]').each(function(){
					Neilos.config.remove_config_id($(this).attr('id').split('_config')[0])
				})
				parent = $(this).attr('parent')
				$(this).remove()
			})
			return parent
		},
		remove_config_id : function(id){
			if ($('#'+Neilos.config.config_parent+' #'+id+'_config').attr('option')!='preserve'){
				//remove child configs
				$('#'+Neilos.config.config_parent+' [option!="preserve"][parent="'+id+'"]').each(function(){
					Neilos.config.remove_config_id($(this).attr('id').split('_config')[0])
				})
				//try to link parent directly with the children before remove the entry
				
				$('#'+Neilos.config.config_parent+' #'+id+'_config').remove()
			}
		},
		get_parent_before_target : function(parent,trg){
			//go up the tree of configs and get the closer parent outside trg
			//useful when deleting configs and we need to link the eisting configs
			if ((parent=='') || (parent==undefined) || (trg=='') || (trg==undefined)) return ''
			var p = parent
			var res = ''
			var add = false
			while (true){
				if (!$('config#'+p+'_config').length) return false
				
				if ((add==true) && (($('config#'+p+'_config').attr('target')!=trg) || $('config#'+p+'_config').attr('option')=='preserve')) res = p
				
				if ($('config#'+p+'_config').attr('target')==trg) add=true
				else add = false
				
				p = $('config#'+p+'_config').attr('parent')
				if ((p==undefined) || (p=='')) break
			}
			return res
		}
	},
		
	structure : {
		rebuild_structure : function(){
			$('#'+container_div).remove()
			//rebuild_structure: clear all content from the page and reload divs/tabs from config
			Neilos.structure.new_div(Neilos.config.container_div,'','',body)
			Neilos.config.get_config('structure_tab, structure_div').each(function(){
				var parent = $(this).attr('parent')
				if ((parent!='') || (parent==undefined)) parent='#'+Neilos.config.container_div
				if ($(this).is('structure_tab')) Neilos.structure.new_tab($(this).text(),'',parent)
				else Neilos.structure.new_div($(this).text(),'','',parent)
			})
		},
		new_tab : function(tab_name,parent,type,cls){
			//new_tab: insert a new tab
			//cls: optional additional class... Default classes are already added.
			//parent must be a valid jquery selector (like '#id')
			//notab: if set don't add the title
			if ($('#'+tab_name+'_entry').length) return false
						
			if (cls==undefined) cls=''
			
			if (type=='notitle') cls+=' notab'
			else cls+=' tab'
						
			var elm_list = ["title","content","comments"]
			if (type=='notitle') elm_list = ["content","comments"]
			
			if ((tab_name==undefined) || (tab_name=='')) Neilos.structure.new_div('',cls,parent)
			else Neilos.structure.new_div(tab_name+'_entry',cls,parent)
			
			for (var i=0;i<elm_list.length;i++){
				if ((tab_name==undefined) || (tab_name=='')) Neilos.structure.new_div('',elm_list[i],'#'+tab_name+'_entry')
				Neilos.structure.new_div(tab_name+'_'+elm_list[i],elm_list[i],'#'+tab_name+'_entry')
			}
			return true
		},
		
		new_div : function(div_name,cls,parent,overwrite){
			//add new div
			if ((cls!=undefined) && (cls!='')) cls = ' class="'+cls+'"'
			else cls=''
			
			if (($(parent).find('#'+div_name).length==0) || (overwrite!='false')){			
				$(parent).find('#'+div_name).remove()
				if ((div_name==undefined) || (div_name=='')) $(parent).append('<div '+cls+anm+'></div>')
				$(parent).append('<div id="'+div_name+'"'+cls+'></div>')
			}
		}
	},
	
	tools : {
		var_parser : function(str){
			//search for variables in the string and evaluate them
			str = str.replace(/\_\$version/g,Neilos.config.version)
			return str
		},
		load_css_config : function(path,id,config_id,save){
			//load_css_config: load a css file and store it in the config. Is it really useful??
			var same_css = $('#'+Neilos.config.config_parent).find('config:not(#'+config_id+')').find('css#'+id)
			if (same_css.length){
				Neilos.tools.delete_css(same_css.text())
				same_css.remove()
			}
			Neilos.tools.load_css(path)
			if (save) $('#'+Neilos.config.config_parent).append('<css id="'+id+'">'+path+'</css>')
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
			if (!Neilos.tools.switch_css(oldcss,newcss)) Neilos.tools.load_css(newcss)
		},
		
		delete_css : function(filename){
			$("link[rel=stylesheet][href='"+filename+"']").remove()
		},
		
		open_link_tab : function(filename){
			//open_link_tab: open link
			if (Neilos.config.debug) console.log("open_link "+filename)
			//check if we have to use the php core loader or loading the single files
			var loader = false
			if (filename.split('/')[0]=='load'){
				var loader_tag = filename.split('/')[1].split('&')[0].split('.')[0]
				filename="load.php?data="+filename.split('/')[1]+'&id='+loader_tag
				loader = true
			}
			else if (filename.split('?')[0]=='load.php'){
				var loader_tag = filename.split('data=')[1].split('&')[0].split('/')
				loader_tag = loader_tag[loader_tag.length-1]
				//filename="load.php?data=resources/content/"+filename.split('/')[1]+'&tag='+loader_tag
				loader = true

			}
			
		  	var fs_p = filename.split('?')
		  	if (fs_p.length>1) php_get = '?'+fs_p[1]
		  	else php_get = ''
		  	filename = fs_p[0]
		  	
		  	var default_ext = Neilos.config.get_config('default_extension')[0]
		  	if ((default_ext!='xml') && (default_ext!='php')) default_ext = ''
		  	
		  	fs = filename.split('.')
		  	if (fs.length>1) ext = fs[fs.length-1]
		  	else ext = ''
		  	
			if (!loader) path = 'resources/content/'+fs[0]
			else {
				path = 'resources/'+fs[0]
				
				//update the tag to the correct one
				fs[0]=loader_tag
			}
		  	
		  	if ((ext=='php') || (ext=='xml')) Neilos.tools.add_file(path+'.'+ext+php_get,fs[0],Neilos.config.config_file_tag)
			else{
				if (default_ext=='php') var exttry = new Array('.php'+php_get,'','.xml')
				else if (default_ext=='xml') var exttry = new Array('.xml','','.php'+php_get)
				else var exttry = new Array('','.xml','.php'+php_get)
				
				
				Neilos.tools.add_file(path+exttry[0],fs[0],Neilos.config.config_file_tag,function(res){
					if (!res) Neilos.tools.add_file(path+exttry[1],fs[0],Neilos.config.config_file_tag,function(res){
						if (!res) Neilos.tools.add_file(path+exttry[2],fs[0],Neilos.config.config_file_tag)
					},'_pass_result')
				},'_pass_result')
			}
		},
		add_file : function(path,id,parent,next){
			//add a file to the DOM. Seeks for the proper id, and call next when done.
			// parent is optional.. It is useful only for config ereditariety
			if (Neilos.config.debug) console.log('add_file '+path+' '+id+' '+parent)
			var params = Array.prototype.slice.call(arguments,4)
			
			$.ajax({
			type: "GET",
			url: path,
			dataType: "xml",
			success: function(xml){
				if (!$(xml).find('entry#'+id).length){
					if ((next!='') && (next!=undefined)){
						if (params[0]=='_pass_result') next(true)
						else next.apply(null,params)
					} 
				}
				else{
					//id found. Load it with add_entry
					if (params[0]=='_pass_result') Neilos.tools.add_entry(xml,id,parent,next,true)
					else Neilos.tools.add_entry.apply(null,$.merge([xml,id,parent,next],params))
				}
			},
			error: function(){
				if (Neilos.config.debug) console.log('error loading file '+path)
				if ((next!='') && (next!=undefined)){
					if (params[0]=='_pass_result') next(false) 
					else next.apply(null,params)
				} 
			}
			})
		},
		add_entry: function (xml,id,parent,next){
			//add_entry: Load an entry.. --> loads config and content
			
			//WARNING: if a previous config is found, it is not overwritten (the new config is merged)
			//problem?
			
			if (Neilos.config.debug) console.log('add_entry '+id+' '+parent)
			var next_par = Array.prototype.slice.call(arguments,3)
			//analyze config					
			var same_config = $('#'+Neilos.config.config_parent).find('config#'+id+'_config')
			if (($(xml).find('*').andSelf().filter('entry#'+id+' > config').children().length)){
				var prnt = ''
				if ($(xml).find('*').andSelf().filter('entry#'+id+' > config > clear').text()=='true'){
					//we have to clear the target's configs
					var trg = $(xml).find('*').andSelf().filter('entry#'+id+' > config > target').text()
					if ((trg==undefined) || (trg=='')) trg = Neilos.config.get_config('target',parent,true)[0]
					prnt = Neilos.config.get_parent_before_target(parent,trg)
					Neilos.config.remove_config_from_trg(trg)
					same_config.length=0
				}
				
				//add config div to the DOM
						
				if (same_config.length<=0){
					var obj2 = $(xml).find('*').andSelf().filter('entry#'+id+' > config').attr('id',id+'_config').clone()
					var $div2 = $("<div/>").append(obj2);	
					$('#'+Neilos.config.config_parent).append($div2.html());
					if ((parent!='') && ($('config#'+parent+'_config').length)) $('config#'+id+'_config').attr('parent',parent)
					else if ((prnt != '') && (prnt!=false)) $('config#'+id+'_config').attr('parent',prnt)
				}
				else{
					var obj2 = $(xml).find('*').andSelf().filter('entry#'+id+' > config').attr('id',id+'_config').children().clone()
					var $div2 = $("<div/>").append(obj2);
					same_config.eq(0).append($div2.html())
				}				
				if ((parent!='') && (parent!=undefined)){
					//check if the parent does really exist, otherwise don't add it to the present config
					if ($('config#'+parent+'_config').length) $('config#'+id+'_config').attr('parent',parent)
				}
				Neilos.config.analize_config.apply(null,$.merge([id,'pre',Neilos.tools.add_content_check,xml,id],next_par))
			}
			else {
					if (same_config.length<=0){
						var $obj = $('<config/>')
						$obj.attr('id',id+'_config')
						if ((parent!=undefined) && (parent!='')) $obj.attr('parent',parent)
						$('#'+Neilos.config.config_parent).append($obj);
					}
				
				Neilos.tools.add_content_check.apply(null,$.merge([xml,id],next_par))
			}
			
		},
		add_content_check : function (xml,id,next){
				//add_content.   Add the content from an xml object.
				//Call this after opening xml and reading its config
				//known issue: trying to load differents contents at the same time with animations may not work
				if (Neilos.config.debug) console.log('add_content_check '+id)
				var next_par = Array.prototype.slice.call(arguments,3)
				//prepare the target
				var clr = Neilos.config.get_config('clear',id).pop()
				var trg = Neilos.config.get_config('target',id,true)[0]
				
				var type = Neilos.config.get_config('type',id,true)[0]

				//var subentries = $(xml).find('entry#'+id+' > entry')
				var subentries = $(xml).find('*').andSelf().filter('entry#'+id+' > entry')
				var anim_on = Neilos.config.get_config('animation',id,true)
				var anim_type = Neilos.config.get_config_obj("animation",id,true).last().attr('type')
				var speed = Neilos.config.get_config_obj("animation",id,true).last().attr('speed')

				if (anim_type=="fade") animfunc = ["fadeOut","fadeIn"]
				else if (anim_type=="slide") animfunc = ["slideUp","slideDown"]
				else animfunc = ["hide","show"]
				
				//determine animation speed
				if (anim_on!='enabled') speed=0
				else{
					var speed = Neilos.config.get_config_obj("animation",id,true).last().attr('speed')
					var speedhide = Neilos.config.get_config_obj("animation",id,true).last().attr('speedhide')
					if (speedhide==undefined) speedhide=speed
					if ((speedhide!=undefined) && (speedhide.indexOf('#')>=0)) speedhide = parseInt(speedhide.split('#')[1])
				}
				//add all entries to the DOM, check for animation
				if ((clr=="true") && ($(trg).children().length>0))  {
						if (anim_on=="enabled"){

							$(trg)[animfunc[0]](speedhide,function(){
								$(trg).children().remove()
								$(trg).attr('style','display: block;')
								Neilos.config.analize_config(id,'mid')
								if (Neilos.config.get_config('visibility',id)[0]!='false')
									Neilos.tools.add_content(xml,id,trg,type)
								if (Neilos.config.get_config('skipsubentries',id,true)!='true')
									Neilos.config.analize_config.apply(null,$.merge([id,'post',Neilos.tools.load_entries,subentries,0,next],next_par))
								else
									Neilos.config.analize_config.apply(null,$.merge([id,'post',next],next_par))
							})
								
						}
						else {
								$(trg).children().remove()
								Neilos.config.analize_config(id,'mid')
								if (Neilos.config.get_config('visibility',id)[0]!='false')
									Neilos.tools.add_content(xml,id,trg,type)
								if (Neilos.config.get_config('skipsubentries',id,true)!='true')
									Neilos.config.analize_config.apply(null,$.merge([id,'post',Neilos.tools.load_entries,subentries,0,next],next_par))
								else
									Neilos.config.analize_config(id,'post')
						}
					}
				else {
					Neilos.config.analize_config(id,'mid')
					if (Neilos.config.get_config('visibility',id)[0]!='false')
						Neilos.tools.add_content(xml,id,trg,type)
					if (Neilos.config.get_config('skipsubentries',id,true)!='true')
						Neilos.config.analize_config.apply(null,$.merge([id,'post',Neilos.tools.load_entries,subentries,0,next],next_par))
					else
						Neilos.config.analize_config.apply(null,$.merge([id,'post',next],next_par))

					
				}
				
		},
		add_content : function(xml,id,trg,type){
				//add_content.. Add <title> and <content> from an entry to the DOM
				//check if content should be added or not
				if (Neilos.config.debug) console.log('add_content '+id+' '+trg+' '+type)
				if (trg!=undefined){
					
					//compute the index of the entry
					if ($(trg).children().filter('[class]').length==0) e_index = 1
					else{
						l = $(trg).children().filter('[class]').last().attr('class')
						l = l.substring(l.indexOf('index')+5)
						e_index = parseInt(l)+1
					}
					var tl = $(xml).find('*').andSelf().filter('entry#'+id+' > config > title')
					var aut = $(xml).find('*').andSelf().filter('entry#'+id+' > config > author')
					var dat = $(xml).find('*').andSelf().filter('entry#'+id+' > config > date')
					
					if (!$(trg).find('#'+id+'_entry').length) var hide = 1
					else return false
					
					if (type!='notitle')
					if ((tl.length!=0) || (aut.length!=0) || (dat.length!=0)){
						//add title
						Neilos.structure.new_tab(id,trg,type,'index'+e_index)
						if (hide) $(trg).find('#'+id+'_entry').attr('style','display: none;')
						
						title = $('<div/>')
						title.append(aut.clone())
						title.append(dat.clone())
						title.append(tl.clone().contents())
						
						$(trg).find('#'+id+'_entry > #'+id+'_title').children().remove()
						$(trg).find('#'+id+'_entry > #'+id+'_title').append(title.html())		
					}
					if ($(xml).find('*').andSelf().filter('entry#'+id+' > content').length!=0){
						//add content
						Neilos.structure.new_tab(id,trg,type)
						if (hide) $(trg).find('#'+id+'_entry').attr('style','display: none;')
						
						content = $('<div/>')
						content.append($(xml).find('*').andSelf().filter('entry#'+id+' > content').clone().contents())
						content = Neilos.tools.var_parser(content.html())
						
						$(trg).find('#'+id+'_entry > #'+id+'_content').children().remove()
						$(trg).find('#'+id+'_entry > #'+id+'_content').append(content)	

					}
				}  
		},
		toggle_entry : function(id,action,disable_animation,next){
				//toggle_entry_int: hide or show an entry (tab or div) created with new_tab
				//action(optional) = show/hide
				if (Neilos.config.debug) console.log('toggle_entry '+id+' '+action+' '+disable_animation)
				next_par = Array.prototype.slice.call(arguments,4)
				//check if entry exists
				if ($('#'+id+'_entry').length==0){
					if ((next!='') && (next!=undefined)) next.apply(null,next_par)
					else return false;
				}
				
				var i=0
				if (action=='show') i=1
				else if ((action!='hide') && (!$('#'+id+'_entry > #'+id+'_content').is(':visible'))) i=1
				else i=2
				
				var anim_on = Neilos.config.get_config('animation',id,true)[0]
				var anim_type = Neilos.config.get_config_obj("animation",id,true).last().attr('type')
				
				//determine animation speed
				var speed = Neilos.config.get_config_obj("animation",id,true).last().attr('speed')
				var speedshow = Neilos.config.get_config_obj("animation",id,true).last().attr('speedshow')
				var speedhide = Neilos.config.get_config_obj("animation",id,true).last().attr('speedhide')
				if (speedshow==undefined) speedshow=speed
				if (speedhide==undefined) speedhide=speed
				if (i==1) speed=speedshow
				if (i==2) speed=speedhide
				if (speed==undefined) speed = 0
				if (((typeof speed)=="string") && (speed.indexOf('#')>=0)) speed = parseInt(speed.split('#')[1])
	
				var animfunction=['toggle','show','hide']
				if ((anim_on!='enabled') || (disable_animation=="true") || disable_animation==true) {
					speed=0
				}
				else if (anim_type=='fade') animfunction=['fadeToggle','fadeIn','fadeOut']
				else if (anim_type=='slide') animfunction=['slideToggle','slideDown','slideUp']
				
				
				if (i==1) prp = 'block'
				else prp = 'none'
				
				if ($('#'+id+'_entry').is(':visible')==false){
					$('#'+id+'_entry > #'+id+'_title').attr('style','display: block;')
					$('#'+id+'_entry > #'+id+'_content').attr('style','display: '+prp+';')
					$('#'+id+'_entry > #'+id+'_comments').attr('style','display: '+prp+';')
					$('#'+id+'_entry')[animfunction[1]](speedshow,function(){
						if (i==1){
							var cfg = $('#'+Neilos.config.config_parent).find('config#'+id+'_config > load_file[mode="LoadWhenShown"]')				
							Neilos.config.load_xml_from_config.apply(null,$.merge([cfg,0,next],next_par))
						}
						else if ((next!='') && (next!=undefined))
							next.apply(null,next_par)
					})
					if (speed==0){
						if (i==1){
							var cfg = $('#'+Neilos.config.config_parent).find('config#'+id+'_config > load_file[mode="LoadWhenShown"]')				
							Neilos.config.load_xml_from_config.apply(null,$.merge([cfg,0,next],next_par))
						}
						else if ((next!='') && (next!=undefined))
							next.apply(null,next_par)
					}
				}
				else{
					$('#'+id+'_entry > #'+id+'_title')[animfunction[1]](speed,function(){
						$('#'+id+'_entry > #'+id+'_content')[animfunction[i]](speed,function(){
							if ($('#'+id+'_entry > #'+id+'_comments').length){
								$('#'+id+'_entry > #'+id+'_comments')[animfunction[i]](speed,function(){
										if (i==1){
											var cfg = $('#'+Neilos.config.config_parent).find('config#'+id+'_config > load_file[mode="LoadWhenShown"]')				
											Neilos.config.load_xml_from_config.apply(null,$.merge([cfg,0,next],next_par))
										}
										else if ((next!='') && (next!=undefined))
											next.apply(null,next_par)
								})
							}
							else {
									$('#'+id+'_entry > #'+id+'_comments').attr('style','display: '+prp+';')
									if (i==1){
										var cfg = $('#'+Neilos.config.config_parent).find('config#'+id+'_config > load_file[mode="LoadWhenShown"]')				
										Neilos.config.load_xml_from_config.apply(null,$.merge([cfg,0,next],next_par))
									}
									else if ((next!='') && (next!=undefined))
										next.apply(null,next_par)
							}
						})
					})
				}
				
				if (i==1){
					//set focus on needed elements and clear them
					$('#'+id+'_entry .focus').each(function(){
						$(this).val('')
						$(this).focus()
					})
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
			Neilos.tools.add_entry.apply(null,$.merge([tag,id,parent,Neilos.tools.load_entries,tag,index+1,next],params))		
		},
		
		remove_entry : function(id,next){
			//remove an entry
			if (Neilos.config.debug) console.log('removing entry '+id)

			params = Array.prototype.slice.call(arguments,3)
						
			if ($('#'+id+'_entry').length<1) if ((next!=undefined) && (next!='')) next.apply(null,params)
			Neilos.config.remove_config_id(id)
			$('#'+id+'_entry').remove()
			if ((next!=undefined) && (next!='')) next.apply(null,params)
		},
		check_hash : function(){
			//check hash in the url and open the page
			
			var hash = window.location.hash;
			if ((hash=='') || (hash==undefined) || (hash=='#!')) hash=Neilos.home
			else if (hash.substr(1,1)=='!') hash = hash.substr(2,hash.length)
			else hash = hash.substr(1,hash.length)
			
			//check if there is an alias for the current hash
			var file = ''
			Neilos.config.get_config_obj('alias','',true).each(function(){
				if ($(this).attr('source')==hash) file = $(this).attr('file')
			})
			
			if (file!='') hash=file
			Neilos.tools.open_link_tab(hash)
		},
		pushUrl : function(link){
			//write link to the URL bar
			var stateObj = { foo: link };
			history.pushState(stateObj, "", link);
		}

	},
	
	init : function() {
                $('body').children().remove()
                Neilos.config.initialize(Neilos.main)
            },
	
	main : function(){
		//main, open #home page
		Neilos.tools.check_hash()
		$(window).hashchange(function(){
			Neilos.tools.check_hash()
		})
		
	}	
}


$(document).ready(Neilos.init)