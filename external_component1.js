/*jshint esversion:6*/
function my_component(config)
{
	this.init = () =>
	{
		this.render();
	};
	this.view(`
	<h1>${config.name}</h1>
		`);
}

my_component.extends = Leflex;