/*
Ideas / Todo
- split code into Party Leader and Non Leader version
  - target Party Leader's target
  - Party Leader dont attack if any party member hp low
  - anchor movement to party leader position
- use upgrade function automagically
- don't use potions unless below certain threshold
- use skills/mana
- auto respawn
- auto reconnect
- resume farming
*/

/* *******Settings******** */
var attack_mode=true
var monsterReqStats = {
	min_xp:100,
	max_att:100
}
var percentHpRequiredToAcquireNewTarget = 0.5; //can't be const for some reason
var maxWander = 10;
/*****************************/


setInterval(function(){
  if(character.rip){
    return; 
  }
  use_hp_or_mp(); 
  loot();
  if(attack_mode && !is_moving(character)){ 
    attackMode();
  }
},1000/2);

function attackMode(){
  //sets 'target' variable to whatever is already targetted
  var target=get_targeted_monster(); 
  
	
  //if we dont have a target already
  if (!target){
    if (hasEnoughHPForNewTarget()){
	  
		  target = get_nearest_monster(monsterReqStats);

      if (!target) {
      	set_message('no monsters');
      	return;
      }
    } else {
      set_message('Hold 4 HP');
      return;
    }
  //If we get here, we have a target. Now, if it isn't in range, decide what to do
  } else {
	  game_log(target.name);
    //This is primarily for melee characters. If they are targeting
    //something that isn't 
    //reachable, try switching to closer target. But makes sure current 
    //target isn't already aggroing character as safety check so we 
    //dont aggro multiple monsters
    if (!targetIsWithinRestrictedRange(target) && target.target !== character.name){	
      target = get_nearest_monster(monsterReqStats);
		
    }
    //move towards whatever target we decided to pick, even if unreachable
    //(might as well move towards them if no other options)
    if (!is_in_range(target)){
      	
		   
    } 
  }
  
  moveTowardsTarget(target);

  if (can_attack(target)){
      set_message("Attacking");
      attack(target);
  }
}

function hasEnoughHPForNewTarget(){
	return (character.hp > minHpRequiredToAcquireNewTarget);
}

function targetIsWithinRestrictedRange(target){
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

function moveTowardsTarget(target){
  
	var xDistanceToTarget = target.x - character.x;
  var xMoveHere = Math.max(Math.min(character.x + xDistanceToTarget/2, maxXPosition), minXPosition)
  var yDistanceToTarget = target.y - character.y;
  var yMoveHere = Math.max(Math.min(character.y + yDistanceToTarget/2, maxYPosition), minYPosition)
  move(xMoveHere, yMoveHere);
}


function upgradeItemScroll0(itemNameOrLocation){
	var itemLocation;
	if (itemNameOrLocation === NaN) {
	  itemLocation = locate_item(itemNameOrLocation.toString());
	} else {
	  itemLocation = itemNameOrLocation;
	}
	upgrade(itemLocation,locate_item("scroll0")).then(
	function(data){
		game_log("Upgrade call completed");
	},
	function(data){
		game_log("Upgrade call failed with reason: "+data.reason);
	},
  );
	
}

//**********  Other global helper vars (supposed to avoid globals oops) ***********//

var minHpRequiredToAcquireNewTarget = percentHpRequiredToAcquireNewTarget * character.max_hp;

game_log('minHPReq: ' + minHpRequiredToAcquireNewTarget);
game_log('currentHP: ' + character.hp);
//Set max wander box based on current position when initializing code (aka 'engage'). must remain outside of update/setInterval
var maxXPosition = character.x + maxWander;
var minXPosition = character.x - maxWander;
var maxYPosition = character.y + maxWander;
var minYPosition = character.y - maxWander;

game_log('current xpos: ' + Math.round(character.x));
game_log('min/max xpos: ' + Math.round(minXPosition) +  " / " + Math.round(maxXPosition));

// Learn Javascript: https://www.codecademy.com/learn/learn-javascript
// Write your own CODE: https://github.com/kaansoral/adventureland
// NOTE: If the tab isn't focused, browsers slow down the game
// NOTE: Use the performance_trick() function as a workaround