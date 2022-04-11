/*jshint esversion:6*/
const Component = function (config)
{
	// this.new_comp({class: Comp1, name: 'comptest1', arg1: 'componente 1'});
	// this.new_comp({class: Comp2, name: 'comptest2', arg1: 'componente 2'});

	this.state(`state1`, 0);
	this.state(`state2`, `hello`);
	this.state(`validate`, false);

	this.state(`fname`, ``);
	this.state(`lname`, ``);

	this.init = () =>
	{
		this.render();
	};


	this.action(`clicktest`, (args) =>
		{
			this.state(`state1`, this.state(`state1`) + 1);
		});
	this.action(`grewgergwe`, (args)=>
	{
		this.state(`validate`, true);
	});
	this.action(`changeState2`, (args)=>
	{

	});
	this.view(`<div>
		[state:state1]
		<button onclick='clicktest'>fweqfwef</button>
		[state:state2]|[state:state2]
		${
			this.if(`[state:state1] > 1`, 
				this.if(`1`, `aaaaa`, `bbbbbbb`),
			this.if(`[state:validate]`, 
				`<Comp2 />`
			))
		}
		[state:validate]
		${this.if(`[state:validate] && [state:state1] == 2`, `<Comp3 />`, `<Comp2 />`)}
		<form onsubmit='grewgergwe'>
			[input:state2]
			[input:state2]
			[cb:validate]
			<div>
				[state:fname]
				[state:lname]
			</div>
			[input:fname]
			[input:lname]
			<input type='submit' value='rewfwe' />
		</form>
		<Comp1 class='class1 class2' />
	</div>`);

	this.styles(`
		.${this.name()}_test1
		{
		}
	`);
};

Component.extends = Leflex;



function Comp1(config)
{
	this.state(`state1`, `ofbiwefwefb`);

	this.init = () =>
	{
		this.render();
	};

	this.view(`
		<h1>Component 1</h1>
		<div>[state:state1][input:state1]</div>
		<Comp3 />
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
};
Comp2.extends = Leflex;


function Comp3(config)
{
	this.init = () =>
	{
		this.render();
	};
	this.view(`<h1>Component 3</h1>`);
}
Comp3.extends = Leflex;