/*
Ideas / Todo
- split code into Party Leader and Non Leader version
  - target Party Leader's target
  - Party Leader dont attack if any party member hp low
  - anchor movement to party leader position
- make new script for auto attempting to upgrade items
- don't use potions unless below certain threshold
- use skills/mana
- auto respawn
- auto reconnect
- resume farming
- better movement restriction code.  allow x/y movement with caps, set anchor at runtime/engagetime
*/

/* *******Settings******** */
var attack_mode=true
var monsterReqStats = {
	min_xp:100,
	max_att:100
}
var percentHpRequiredToAcquireNewTarget = .8;
var maxWander = 200;
/* ***************************  */

setInterval(function(){
  
  if(character.rip){
    return; 
  }

	use_hp_or_mp(); 

	loot();

  if(attack_mode && !is_moving(character)){ 
    attackMode();
  }
  
},1000/4);

function attackMode(){
  //sets 'target' variable to whatever is already targetted
  var target=get_targeted_monster(); 
  
  
	if (!target){
		target = getNewTarget();
	}
	
  if (!target){
			set_message("No Monsters");
			return;
	}

	if (!is_in_range(target))
	{	
     if (!targetCanBeReached && target.target !== character.name){
       target = get_nearest_monster(monsterReqStats);
     }
     moveTowardsTarget(target);
     
    //if it's aggroing, move towards it
    //if we can't reach it but it's still the closest, move towards it
     
	}
  
	if (can_attack(target))
	{
		set_message("Attacking");
		attack(target);
	}
}

function targetCanBeReached(target){
  var bool = false;
  var maxX = maxXPosition + character.range;
  var minX = minXPosition - character.range;
  var maxY = maxYPosition + character.range;
  var minY = minYPosition - character.range;
  if (target.x <= maxX && target.x >= minX && target.y <= maxY && target.y >= minY){
    bool = true;
  }
  return bool;
}

function getNewTarget(){
  if (character.hp >= minHpRequiredToAcquireNewTarget){
      return get_nearest_monster(monsterReqStats); 
    } else {
      set_message("Hold 4 HP");
      return;
    }
		
}

function moveTowardsTarget(target){
  var xDistanceToTarget = target.x - character.x;
  var xMoveHere = Math.max(Math.min(character.x + xDistanceToTarget/2, maxXPosition), minXPosition)
  var yDistanceToTarget = target.y - character.y;
  var yMoveHere = Math.max(Math.min(character.y + yDistanceToTarget/2, maxYPosition), minYPosition)
  move(xMoveHere, yMoveHere);
}

//**********  Other global helper vars (supposed to avoid globals oops) ***********//

var minHpRequiredToAcquireNewTarget = percentHpRequiredToAcquireNewTarget * character.hp;
//Set max wander box based on current position when initializing code (aka 'engage'). must remain outside of update/setInterval
var maxXPosition = character.x + maxWander;
var minXPosition = character.x - maxWander;
var maxYPosition = character.y + maxWander;
var minYPosition = character.y - maxWander;


// Learn Javascript: https://www.codecademy.com/learn/learn-javascript
// Write your own CODE: https://github.com/kaansoral/adventureland
// NOTE: If the tab isn't focused, browsers slow down the game
// NOTE: Use the performance_trick() function as a workaround