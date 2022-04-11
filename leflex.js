/*jshint esversion:6*/
Object.prototype.copy = function()
{
	return JSON.parse(JSON.stringify(this));
};
// ************************************************************************************************************************
// ************************************************************************************************************************
// ************************************************************************************************************************
// ************************************************************************************************************************

const Extends = (_class, _parent, args) =>
{
	if(!_class || !_parent) return;
	if(typeof _class !== 'function' || typeof _parent !== 'function') return;
	
	let config = args.copy();
	_class.prototype = new _parent(config);
	_class.prototype.constructor = _class;

	return _class;
};
const New = (_class, args) =>
{
	if(!_class) return null;
	if(typeof _class !== 'function') return null;
	if(!window[_class.name])
		window[_class.name] = _class;
	if(_class.extends)
		_class = Extends(_class, _class.extends, args);
	let obj = new _class(args);
	return obj;
};

// ************************************************************************************************************************
// ************************************************************************************************************************
// ************************************************************************************************************************
// ************************************************************************************************************************

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

	let _view = ``;
	let _styles = ``;

	let _span_states = {};
	let _input_states = {};
	let _remover_attrs_buffer = [];

	let _conditions = {};

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
	this.state = (k, v = undefined) =>
	{
		if(v === undefined || v === null)
			return _states[k];
		else{
			sync_states();
			_states[k] = v;
			this.render();
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

			let strRegex = `\\<${window[c].name}\\s+[a-z|A-Z|0-9|\\'|\\"|\\=|\\_|\\s*]*\\s*\\/?\\>`;
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
						this.new_comp({class: window[c], name: name, id:id});

						let args_regex = /\s+[a-z|A-Z]+[0-9|\_|\-|\s*]?\=+[\s*|\'|\"]+[a-z|A-Z|0-9|\_|\-|\s]+[\'|\"]+/g;
						let args = match[0].match(args_regex);
						let class_styles = ``;
						if(args)
						{
							for(let a of args)
							{
								let arg = a.trim();
								let split = arg.split('=');
								if(split.length <= 1) continue;
								let arg_name = split[0];
								let arg_val = split[1].substring(1, split[1].length - 1);
								_subclasses[name].conf[arg_name] = arg_val;
								if(arg_name.trim().toLowerCase() === `class`)
								{
									class_styles = arg_val;
								}
							}
						}

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
				let _else = if_sentences(condition.else);
				view = view.replace(i, eval(question) ? _then : _else);
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

		let view = _view;
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

/* 	START ENGINE ---------------------------------------------------------------------- */
	_bbox = this.bbox(config.bbox);
}