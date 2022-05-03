/*jshint esversion:8*/
Object.prototype.copy = function()
{
	return JSON.parse(JSON.stringify(this));
};
Array.prototype.copy = function()
{
	let buffer = [];
	for(let e of this)
		buffer.push(e);
	for(let e in this)
		if(this.hasOwnProperty(e))
			buffer[e] = this[e];
	return buffer;
};
/* ************************************************************************************************************************ */
/* ************************************************************************************************************************ */
/* ************************************************************************************************************************ */
/* ************************************************************************************************************************ */

const Extends = (_class, _parent, args={}) =>
{
	if(!_class || !_parent) return;
	if(typeof _class !== 'function' || typeof _parent !== 'function') return;
	
	let config = args.copy();
	_class.prototype = new _parent(config);
	_class.prototype.constructor = _class;

	return _class;
};
const New = (_class, args={}) =>
{
	if(!_class) return null;
	if(typeof _class !== 'function') return null;
	if(!window[_class.name])
		window[_class.name] = _class;
	let slaves = false;
	if(args.slaves)
	{
		slaves = true;
		Leflex_slaves.add_slave(args.slaves);
		delete args.slaves;
	}
	if(_class.extends)
		_class = Extends(_class, _class.extends, args);
	let obj = new _class(args);
	if(slaves)
		Leflex_slaves._comps[obj.name()] = obj;
	return obj;
};

function load_html(src)
{
	let prom = new Promise((resolve) =>
	{
		let xhr = new XMLHttpRequest();
		xhr.open('GET', src, true);
		xhr.send();

		xhr.onload = (args) =>
		{
			resolve(xhr.responseText);
		};
	});
	return prom;
}

function load_script(src)
{
	let prom = new Promise((resolve) =>
	{
		let script = document.createElement('script');
		script.type = 'text/javascript';
		script.src = src;
		document.head.appendChild(script);
		script.onload = (ev) =>
		{
			resolve(ev);
		};
	});
	return prom;
}

const include = async (src, name=undefined) =>
{
	if(!src) return null;
	if(typeof src !== 'string') return null;
	if(src.match(/\.html/g))
	{
		let html = '[No HTML]';
		if(!window.htmls)
		{
			window.htmls = {};
			window.htmlsl = 0;
		}
		if(!window.htmls[name])
		{
			window.htmls[name] = false;
			window.htmlsl++;
		}
		let resp = await load_html(`${src}?${Math.floor(Math.random() * Date.now())}`).then((data) =>
			{
				html = data;
				window.htmls[name] = true;
				if(!window[name])
					window[name] = html;
				return html;
			});
		return html;
	}else if(src.match(/\.js/g))
	{
		let props = [];
		for(let p in window)
		{
			if(!window.hasOwnProperty(p)) continue;
			props.push(p);
		}
		let mods = await load_script(`${src}?${Math.floor(Math.random() * Date.now())}`).then((ev)=>{
			let new_props = [];
			for(let p in window)
			{
				if(!window.hasOwnProperty(p)) continue;
				new_props.push(p);
			}
			let buffer = new_props.filter(x => props.indexOf(x) === -1);
			let diffs = {};
			for(let c of buffer)
				diffs[c] = window[c];
			return diffs;
		});
		return mods;
	}
	return '[Not handled file]';
};

/* ************************************************************************************************************************ */
/* ************************************************************************************************************************ */
/* ************************************************************************************************************************ */
/* ************************************************************************************************************************ */

function Leflex(config)
{
/* 	SECRET VARS ---------------------------------------------------------------------- */
	let _id = config.id || Math.random() * 3823288;
	let _name = config.name || `unknow_component`;
	let _bbox = null;
	let _subclasses = {};
	let _childs = {};
	let _states = {};
	let _actions = {};
	let _prev_states = {};
	let _flags = config.flags || {};
	// console.log(_flags);

	let _view = ``;
	let _styles = ``;

	let _span_states = {};
	let _input_states = {};
	let _remover_attrs_buffer = [];

	let _conditions = {};
	let _loops = {};
	let _effects = {states: {}, effect: {} };

/* 	SETTERS AND GETTERS ---------------------------------------------------------------------- */
	this.name = () => {	return _name; };
	this.bbox = (value) =>
	{
		if(!value)
			return this._bbox;
		else{
			this._bbox = typeof value === 'string' ? document.getElementById(value) : ( typeof value === 'object' ? value : null );
			if(this._bbox)
				this._bbox.removeAttribute(`id`);
		}
	};
	this.effect = (f, states=[]) =>
	{
		let buffer = [];
		if(Array.isArray(states))
		{
			for(let s of states)
				if(_states[s])
					buffer.push(s);
		}else{
			if(_states[states])
				buffer.push(states);
		}

		if(buffer.length === 0)
		{
			for(let s in _states)
				if(_states.hasOwnProperty(s))
					buffer.push(s);
		}
		
		let id = Math.ceil(Math.random() * Date.now());
		_effects.states[id] = buffer;
		_effects.effect[id] = f;
	};
	let call_effects = (state) =>
	{
		let ids = [];
		for(let e in _effects.states)
		{
			if(!_effects.states.hasOwnProperty(e)) continue;
			for(let s of _effects.states[e])
			{
				if(s === state)
					ids.push(e);
			}
		}
		for(let id of ids)
		{
			if(_effects.effect[id])
				_effects.effect[id]({state: state});
		}
	};
	this.state = (k, v = undefined) =>
	{
		if(v === undefined || v === null)
			return _states[k];
		else{
			sync_states();
			_states[k] = v;
			this.render();
			call_effects(k);
		}
	};
	this.action = (k, action = undefined) =>
	{
		if(!action)
			return _actions[k];
		else
			_actions[k] = action;
	};
	this.call_action = (k, args) =>
	{
		if(_actions[k])
			_actions[k](args);
	};
	this.view = (v) =>
	{
		if(!v)
			return _view;
		else
			_view = v;
	};
	this.styles = (v) =>
	{
		if(!v)
			return _styles;
		else
			_styles = v;
	};

/* 	SECRET METHODS ---------------------------------------------------------------------- */
	let sync_states = () =>
	{
		for(let s in _states)
		{
			if(!_states.hasOwnProperty(s)) continue;
			_prev_states[s] = _states[s];
		}
	};
	let remove_all_comps = () =>
	{
		_subclasses = {};
		_childs = {};
	};
	let str_2_comp_bbox = (str) => 
	{
		for(let c in _subclasses)
		{
			if(!_subclasses.hasOwnProperty(c)) continue;
			let regex = new RegExp(`\\[comp\\:${_subclasses[c].conf.name}\\]`, `g`);
			str = str.replace(regex, `<section comp:id='${config.name}_${_subclasses[c].conf.name}' id='${config.name}_${_subclasses[c].conf.name}'></section>`);
		}
		for(let c in window)
		{
			if(!window.hasOwnProperty(c)) continue;
			if(!window[c]) continue;
			if(!window[c].name) continue;

			let strRegex = `\\<${window[c].name}\\s+[a-z|A-Z|0-9|\\'|\\"|\\=|\\_|\\[|\\]|\\:|\\s*]*\\s*\\/?\\>`;
			let regex = new RegExp(strRegex, `g`);
			let match = str.match(regex);
			if(match)
			{
				if(match.length > 0)
				{
					for(let c2 of match)
					{
						let id = Math.ceil(Math.random() * 324233);
						let name = `${c}_${id}`;

						let args_regex = /\s+[a-z|A-Z]+[0-9|\_|\-|\s*]?\=+[\s*|\'|\"]+[a-z|A-Z|0-9|\_|\-|\s|\[|\]|\:]+[\'|\"]+/g;
						let args = c2.match(args_regex);
						let class_styles = ``;
						let flags = {};
						let comp_args = {};
						if(args)
						{
							for(let a of args)
							{
								let arg = a.trim();
								let split = arg.split('=');
								if(split.length <= 1) continue;
								let arg_name = split[0];
								let arg_val = split[1].substring(1, split[1].length - 1);
								let flags_match = arg_val.match(/\[flag:[a-z|A-Z|_|0-9]+\]/g);
								if(flags_match)
								{
									if(flags_match.length > 0)
									{
										let flag = flags_match[0];
										flag = flag.replace('[', '').replace(']', '').split(':');
										if(flag.length == 2)
											flags[arg_name] = flag[1];
									}
								}else{
									comp_args[arg_name] = arg_val;
								}
								// _subclasses[name].conf[arg_name] = arg_val;
								if(arg_name.trim().toLowerCase() === `class`)
								{
									class_styles = arg_val;
								}
							}
						}

						this.new_comp({class: window[c], name: name, id:id, flags: flags, args: comp_args});
						str = str.replace(c2, `<section comp:id='${config.name}_${name}' id='${config.name}_${name}' class='${class_styles}'></section>`);
					}
				}
			}
		}
		return str;
	};
	let str_2_readable_states = (str) =>
	{
		for(let s in _states)
		{
			if(!_states.hasOwnProperty(s)) continue;
			let regex = new RegExp(`\\[state\\:${s}\\]`, `g`);
			str = str.replace(regex, `<span state:read='${config.name}_${s}'>${_states[s].toString()}</span>`);
			regex = new RegExp(`\\[input\\:${s}\\]`, `g`);
			str = str.replace(regex, `<input type='text' state:set='${config.name}_${s}' value='${_states[s].toString()}' />`);
			regex = new RegExp(`\\[radio\\:${s}\\]`, `g`);
			str = str.replace(regex, `<input type='radio' name='${config.name}_${s}' state:set='${config.name}_${s}' value='${_states[s] ? true : false}' />`);
			regex = new RegExp(`\\[cb\\:${s}\\]`, `g`);
			str = str.replace(regex, `<input type='checkbox' name='${config.name}_${s}' state:set='${config.name}_${s}' value='${_states[s] ? true : false}' ${_states[s] ? `checked` : ``} />`);
		}
		return str;
	};
	let read_dom = (node) =>
	{
		if(!node.childNodes) return;
		for(let n of node.childNodes)
		{
			if(n.nodeType === 3) // text
			{
			}else if(n.nodeType === 1) // node
			{
				if(n.tagName.toLowerCase() === `style`) continue;
				if(n.attributes)
				{
					for(let a of n.attributes)
					{
						if(a.name === `comp:id`)
						{
							let name = a.value.replace(`${config.name}_`, ``);
							if(_subclasses[name])
								_subclasses[name].section = n;
						}
						else if(a.name === `state:read`)
						{
							if(!_span_states[a.value])
								_span_states[a.value] = [];
							_span_states[a.value].push(n);
							_remover_attrs_buffer.push({node: n, attr: a.name});
						}else if(a.name === `state:set`){
							if(!_span_states[a.value])
								_span_states[a.value] = [];
							_span_states[a.value].push(n);

							if(!_input_states[a.value])
								_input_states[a.value] = [];
							_input_states[a.value].push(n);
							_remover_attrs_buffer.push({node: n, attr: a.name});
						}else{
							let event_checker = `${a.name}='${a.value}'`;
							if(event_checker.match(/on[a-z|A-Z]+=[\'|\"]*[a-z|A-Z|0-9]+[\'|\"]*/g))
							{
								n.addEventListener(`${a.name.replace(`on`, ``)}`, (ev) =>
								{
									if(a.name.toLowerCase() === `onsubmit` && n.nodeName.toLowerCase() === `form`)
									{
										ev.preventDefault();
									}
									this.call_action(a.value, {ev: ev, el: n});
								});
							}
						}
						if(a.name !== `value` && a.name !== `class` && a.name !== `type` && a.name !== `id` && a.name !== `checked`)
							_remover_attrs_buffer.push({node:n, attr: a.name});
					}
				}
			}
			read_dom(n);
		}
	};
	let set_readable_states_value = (state, value) =>
	{
		for(let read of _span_states[state])
		{
			read.innerHTML = value;
		}
	};
	let set_bindable_states_value = (state, input) =>
	{
		for(let control of _input_states[state])
		{
			if(control === input) continue;
			control.value = input.value;
		}
	};
	let states_binder = () =>
	{
		for(let i in _input_states)
		{
			if(!_input_states.hasOwnProperty(i)) continue;
			let state_name = i.replace(`${config.name}_`, ``);
			let inputs = _input_states[i];
			for(let input of inputs)
			{
				if(input.type.toLowerCase() === `text`)
				{
					input.onkeyup = (ev) =>
					{
						set_bindable_states_value(i, ev.target);
						set_readable_states_value(i, ev.target.value);
					};
					input.onchange = (ev) =>
					{
						_prev_states[state_name] = _states[state_name];
						_states[state_name] = ev.target.value;
						call_effects(state_name);
					};	
				}else if(input.type.toLowerCase() === `checkbox` || input.type.toLowerCase() === `radio`)
				{
					input.onclick = (ev) =>
					{
						set_bindable_states_value(i, ev.target.checked);
						set_readable_states_value(i, ev.target.checked);
						_prev_states[state_name] = _states[state_name];
						_states[state_name] = ev.target.checked;
						this.state(i, ev.target.checked);
					};	
				}
			}
		}
	};
	let strDiv_2_comp = () =>
	{
		for(let c in _subclasses)
		{
			if(!_subclasses.hasOwnProperty(c)) continue;
			_subclasses[c].conf.bbox = `${config.name}_${_subclasses[c].conf.name}`;
			_childs[_subclasses[c].conf.name] = New(_subclasses[c].class, _subclasses[c].conf);
			if(_childs[_subclasses[c].conf.name].init) _childs[_subclasses[c].conf.name].init();
		}
	};
	let remove_attrs = () =>
	{
		for(let i of _remover_attrs_buffer)
		{
			i.node.removeAttribute(i.attr);
		}
		_remover_attrs_buffer = [];
	};
	let if_sentences = (view) =>
	{
		let conds = view.match(/\[if:[0-9]+\]/g);
		if(!conds) return view;
		for(let i of conds)
		{
			let condition = _conditions[i.replace(`[if:`, ``).replace(`]`, ``)];
			if(!condition) continue;
			let states_match = condition.if.match(/\[state:[a-z|A-Z|0-9|_|-]*\]/g);
			let question = condition.if;
			if(states_match)
			{
				for(let s of states_match)
				{
					let state_name = s.replace(`[state:`, ``).replace(`]`, ``);
					let state = _states[state_name];
					if(state !== undefined && state !== null)
						question = question.replace(s, state);
				}
			}
			try{
				let _then = if_sentences(condition.then);
				_then = for_sentences(_then);
				let _else = if_sentences(condition.else);
				_else = for_sentences(_else);
				view = view.replace(i, eval(question) ? _then : _else);
			}catch(e)
			{
			}
		}
		return view;
	};
	let for_sentences = (view) =>
	{
		let fors = view.match(/\[for:[0-9]+\]/g);
		if(!fors) return view;
		for(let i of fors)
		{
			let loop = _loops[i.replace(`[for:`, ``).replace(`]`, ``)];
			if(!loop) continue;
			let states_match = loop.for.match(/\[state:[a-z|A-Z|0-9|_|-]*\]/g);
			let looper = loop.for;
			if(states_match)
			{
				let __view = ``;
				for(let s of states_match)
				{
					let state_name = s.replace(`[state:`, ``).replace(`]`, ``);
					let state = _states[state_name];
					if(state !== undefined && state !== null)
					{
						looper = looper.replace(s, state);
						if(Array.isArray(state))
						{
							for(let sv of state)
							{
								__view += `${loop.block}\n`;
								if(typeof sv === 'object')
								{
									for(let k in sv)
									{
										if(!sv.hasOwnProperty(k)) continue;
										let regex = new RegExp(`\\[${k}\\]*`, `g`);
										__view = __view.replace(regex, sv[k]);
									}
								}
							}
						}
						view = view.replace(i, `${__view}`);
					}
				}
			}
			try{
				view = for_sentences(view);
				view = if_sentences(view);
			}catch(e)
			{
			}
		}
		return view;
	};

/* 	METHODS ---------------------------------------------------------------------- */
	this.sub_classes = () =>
	{
		return _subclasses.copy();
	};
	this.new_comp = (conf) =>
	{
		if(!conf.class || !conf.name) return;
		let args = conf.copy();
		delete args.class;
		// let comp = New(conf.class, args);
		_subclasses[conf.name] = {class: conf.class, conf: args};
	};
	this.render = () =>
	{
		if(!this._bbox) return;

		remove_all_comps();

		let view = _view;
		view = for_sentences(view);
		view = if_sentences(view);
		view = str_2_comp_bbox(view);
		view = str_2_readable_states(view);
		this._bbox.innerHTML = `<style rel='stylesheet'>${_styles}</style>${view}`;

		read_dom(this._bbox);
		states_binder();
		remove_attrs();
		strDiv_2_comp();
	};
	this.if = (condition, _then, _else = '') =>
	{
		let __if = {
			if: condition,
			then: _then,
			else: _else
		};
		let name = Math.ceil(Math.random() * 67153765);
		_conditions[name] = __if;
		return `[if:${name}]`;
	};
	this.for = (iterator, iteration) =>
	{
		let __for = {
			for: iterator,
			block: iteration
		};
		let name = Math.ceil(Math.random() * 67153765);
		_loops[name] = __for;
		return `[for:${name}]`;
	};

/* 	START ENGINE ---------------------------------------------------------------------- */
	_bbox = this.bbox(config.bbox);
}

Leflex.new_app = async function(_class, config={})
{
	let loader = null;
	function start_app()
	{
		delete window.htmlsl;
		window.clearInterval(loader);
		loader = undefined;
		let slaves = config.slaves || undefined;
		let app = New(_class, config);
		app.init();
		if(slaves)
			Leflex_slaves._main = app;
		return app;
	}
	let prom = new Promise(resolve =>
	{
		let c = 0;
		loader = window.setInterval(()=>
		{
			if(!window.htmls)
			{
				let app = start_app();
				resolve(app);
				return app;
			}
			for(let h in window.htmls)
			{
				if(!window.htmls.hasOwnProperty(h)) continue;
				if(window.htmls[h])
				{
					delete window.htmls[h];
					c++;
				}
			}
			if(c >= window.htmlsl)
			{
				let app = start_app();
				resolve(app);
				return app;
			}
		}, 100);
	});
	return prom;
};

/* ************************************************************************************************************************ */
/* ************************************************************************************************************************ */
/* ************************************************************************************************************************ */
/* ************************************************************************************************************************ */

const Leflex_slaves = {
	_buffer: {},
	_main: null,
	_comps: {},
	add_slave: function(slave, comp = undefined)
	{
		if(!slave) return;
		if(comp)
			this._comps[comp.name()] = comp;
		if(Array.isArray(slave))
		{
			for(let w of slave)
				this.add_slave(w);
		}else{
			this._buffer[slave.name] = New(slave);
		}
	},
	aid_flag: function(slave, flag, caller=undefined, args = {})
	{
		if(!slave) return;
		if(Array.isArray(slave))
		{
			for(let s of slave)
				aid_flag(s, f, caller, args);
		}else{
			if(!this._buffer[slave]) return;
			if(!this._buffer[slave].aid_flag) return;
			if(Array.isArray(flag))
			{
				for(let f of flag)
					aid_flag(slave, f, caller, args);
			}else
			{
				args.root = this._main;
				args.comps = this._comps;
				args.caller = caller;
				this._buffer[slave].aid_flag(flag, args);
			}
		}
	}
};

function Slave(config)
{
	let _flags = [];
	let _actions = [];

	this.get_flags = () =>
	{
		return _flags.copy();
	};

	this.flag = (k, actions, comps) =>
	{
		_flags[k] = {
			actions: actions,
			comps: comps
		};
	};
	this.aid_flag = (k, args={}) =>
	{
		if(!_flags[k]) return;
		for(let a of _flags[k].actions)
		{
			if(_actions[a])
				_actions[a](args);
		}
	};
	this.action = (k, action) =>
	{
		_actions[k] = action;
	};
}

/* ************************************************************************************************************************ */
/* ************************************************************************************************************************ */
/* ************************************************************************************************************************ */
/* ************************************************************************************************************************ */