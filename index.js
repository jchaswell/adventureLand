

var attack_mode=true

//Min/Max stats required in order to target a monster.  (I turned this into a variable because it is now being used twice in my code)
var monsterReqStats = {
	min_xp:100,
	max_att:220
}

setInterval(function(){

	use_hp_or_mp();
	loot();

	if(!attack_mode || character.rip) return; // || is_moving(character)) return;

	var target=get_targeted_monster();
	
	if(!target && character.hp >= 1500)
	{
		target=get_nearest_monster(monsterStats);
		
		if(target)
		{
			change_target(target);
		}
		else
		{
			set_message("No Monsters");
			//move(
			//	character.x - change_target('JCaesar').x/2,
			//	character.y
			//	);
			return;
		}
	}
	
	if(!is_in_range(target))
	{
		if (target === get_nearest_monster(monsterStats))
		{
			move(
				character.x +(target.x-character.x)/2,
				character.y//+(target.y-character.y)/2
				);
			// move along y
		}	
		else 
		{
			target = get_nearest_monster(monsterStats);
		}
	}
	
	if(can_attack(target))
	{
		set_message("Attacking");
		attack(target);
	}

},1000/4); // Loops every 1/4 seconds.

// Learn Javascript: https://www.codecademy.com/learn/learn-javascript
// Write your own CODE: https://github.com/kaansoral/adventureland
// NOTE: If the tab isn't focused, browsers slow down the game
// NOTE: Use the performance_trick() function as a workaround
