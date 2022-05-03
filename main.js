/*jshint esversion:6*/
window.onload = () =>
{
	let app = null;
	Leflex.new_app(App, {
		name: 'test',
		bbox: 'root',
		slaves: [
			Slave1
		]
	}).then(arg=>{	
		app = arg; 
		console.log(app);
	});
};


function Slave1()
{
	// this.state(`state1`, [App]);
	this.flag(`flag1`, [`action1`], [App]);
	this.flag(`flag2`, [`action2`, `action1`], [App]);


	this.action(`action1`, (args)=>
		{
			console.log(args);
			// args.caller.state(`state1`, 100);
		});
	this.action(`action2`, (args)=>
		{
			console.log('que pasaaaa, aqui estamos');
		});
}
Slave1.extends = Slave;