/*jshint esversion:8*/
include(`external_component1.js`);
include(`App.html`, `App_html`);

const App = function (config)
{
	// this.new_comp({class: Comp1, name: 'comptest1', arg1: 'componente 1'});
	// this.new_comp({class: Comp2, name: 'comptest2', arg1: 'componente 2'});

	this.state(`state1`, 0);
	this.state(`state2`, `hello`);
	this.state(`validate`, false);
	this.state(`state3`, [{number:22, label: 'Num'}, {number:31, label:'AAA'}]);

	this.state(`fname`, ``);
	this.state(`lname`, ``);

	this.init = () =>
	{
		this.render();
	};


	this.action(`clicktest`, (args) =>
	{
		Leflex_slaves.aid_flag(`Slave1`, `flag1`, this);
		this.state(`state1`, this.state(`state1`) + 1);
	});
	this.action(`grewgergwe`, (args)=>
	{
		this.state(`validate`, true);
	});
	this.action(`changeState2`, (args)=>
	{
	});

	this.effect(data =>
	{
		console.log(`State changed: ${data.state}`);
	});

	this.effect(data =>
	{
		console.log(11111);
	});

	this.view(
		App_html.
		replace(`{%conditional1%}`, 
			this.if(`[state:state1] > 1`, 
				this.if(`1`, `aaaaa`, `bbbbbbb`),
			this.if(`[state:validate]`, 
				`<Comp2 />`
			))
		).
		replace(`{%conditional2%}`, 
			this.if(`[state:validate] && [state:state1] == 2`, `<Comp3 />`, `<Comp2 />`)
		).replace(`{%for1%}`, 
			this.for(`[state:state3]`, `<my_component [label]='[number]' />`)
		).replace(`{%for2%}`, 
			this.for(`[state:state3]`, `<div>[label]:[number]</div>`)
		)
	);
	
	// this.view(`<div>
	// 	[state:state1]
	// 	<button onclick='clicktest'>fweqfwef</button>
	// 	[state:state2]|[state:state2]
	// 	${
	// 		this.if(`[state:state1] > 1`, 
	// 			this.if(`1`, `aaaaa`, `bbbbbbb`),
	// 		this.if(`[state:validate]`, 
	// 			`<Comp2 />`
	// 		))
	// 	}
	// 	[state:validate]
	// 	${this.if(`[state:validate] && [state:state1] == 2`, `<Comp3 />`, `<Comp2 />`)}
	// 	<form onsubmit='grewgergwe'>
	// 		[input:state2]
	// 		[input:state2]
	// 		[cb:validate]
	// 		<div>
	// 			[state:fname]
	// 			[state:lname]
	// 		</div>
	// 		[input:fname]
	// 		[input:lname]
	// 		<input type='submit' value='rewfwe' />
	// 	</form>
	// 	${this.for(`[state:state3]`, `<div>[number]</div>`)}
	// 	<Comp1 class='class1 class2' />
	// 	<my_component />
	// </div>`);

	this.styles(`
		.${this.name()}_test1
		{
		}
	`);
};

App.extends = Leflex;



function Comp1(config)
{
	this.state(`state1`, `ofbiwefwefb`);

	this.init = () =>
	{
		this.render();
	};

	this.action(`click_test1`, (args)=>
		{
			Leflex_slaves.aid_flag(`Slave1`, `flag2`, this, {aaa: 1111, b: [1111, 22222]});
		});

	this.view(`
		<h1>Component 1</h1>
		<button onclick='click_test1'>iwbgeriwg</button>
		<div>[state:state1][input:state1]</div>
		<Comp3 ev1='[flag:aaa]' />
	`);
}
Comp1.extends = Leflex;


function Comp2(config)
{
	this.init = () =>
	{
		this.render();
	};
	this.view(`<h1>Component 2</h1>`);
}
Comp2.extends = Leflex;


function Comp3(config)
{
	this.action(`button_click`, (args)=>
		{
		});
	this.init = () =>
	{
		this.render();
	};
	this.view(`
	<h1>Component 3</h1>
	<button onclick='button_click'>wfqweqf</button>
	`);
}
Comp3.extends = Leflex;