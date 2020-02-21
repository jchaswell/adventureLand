/*
Ideas / Todo
- split code into Party Leader and Non Leader version
  - target Party Leader's target
  - Party Leader dont attack if any party member hp low
  - anchor movement to party leader position
- use upgrade function automagically
  - item_grade(item) // example: item_grade(character.items[0])
  - item_properties(item) // example: item_properties(character.items[0])
- don't use potions unless below certain threshold
- use skills/mana
- auto respawn
- auto reconnect
- resume farming
- visit town
- refil potions
- make ranged vs melee attackmodes (ranged kites)
- handle on_combined_damage()
*/

/* *******Settings******** */
var attack_mode=true
var monsterReqStats = {
	min_xp:100,
	max_att:100
}
var percentHpRequiredToAcquireNewTarget = 0.5; //can't be a const for some reason
var maxWander = 50; //max movement allowed after clicking Engage
var autoAcceptPartyInviteFrom = ['JCaesar', 'JCameron', 'JCarrey', 'BobDonut', 'CardiB'];
/*****************************/



setInterval(function(){
  if(character.rip){
    attack_mode = false;
	  respawn();
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
    //We don't have a current target.  Don't get a new one if
    //low on HP, or as they say in England, HAYTCH P.
    if (hasEnoughHPForNewTarget()){
	  
		  target = get_nearest_monster(monsterReqStats);

      if (!target) {
      	set_message('no monsters');
      	return;
      }

    } else {

      set_message('Hold 4 HP');
      return; //**these mid-update-function returns are potentially problematic**

    }

  
  } else { //If we get here, we have a target. 
	  
    //This is primarily for melee characters. If they are targeting
    //something that isn't reachable AND that target isn't already
    //aggroing, try switching to a closer target.
    if(!targetIsWithinRestrictedRange(target)&&target.target!==character.name){	
      target = get_nearest_monster(monsterReqStats);
    }
  }
	
  if (!is_in_range(target)){
     moveTowardsTarget(target);
  } 
  
  if (can_attack(target)){
      set_message("Attacking");
      attack(target);
  }
}

function hasEnoughHPForNewTarget(){
  
	return (character.hp > minHpRequiredToAcquireNewTarget);
}

// function getNewTarget(){
//   game_log("running getNewTarget")
//   var returnObj = {};
//   if (get_nearest_monster(monsterReqStats)) {
//     obj = {
//       newTarget : get_nearest_monster(monsterReqStats),
//       message: 'target found'
//     }
//   } else {
//     obj = {
//       message : 'no monsters'
//     }
//   }
//   return returnObj;
// }

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


function on_combined_damage(){
  game_log('TAKEING COMBINED DAMAGE OMAGERRRDDDDDDDDDDDDDDDDDDDDDDD')
}
function on_party_invite(name) // called by the inviter's name
{
	if (autoAcceptPartyInviteFrom.indexOf(name) >= 0){
     accept_party_invite(name)
     game_log('accepted invite from: ' + name);
  }
}
function on_party_request(name) // called by the inviter's name - request = someone requesting to join your existing party
{
	if (autoAcceptPartyInviteFrom.indexOf(name) >= 0){
     accept_party_request(name)
     game_log('accepted party request from: ' + name);
  }
}

function performance_trick()
{
	// Needed for browsers only, Steam/Mac versions of the game always deliver high JS performance [03/02/19]
	parent.performance_trick(); // Just plays an empty sound file, so browsers don't throttle JS, only way to prevent it, interesting cheat [05/07/18]
	// Lately Chrome has been screwing things up with every update, mostly it's bugs and performance issues, but this time, the way Audio is played has been changed, so, once the game refreshes itself, the tabs need to be manually focused once for performance_trick() to become effective, as Audio can no longer automatically play [21/10/18]
}

function pm99Bottles(name){
  for (let i=99; i<0; i--) { 
    bottles(i); 
  }
}
function bottles(i) { 
  var message = '';
  setTimeout(function() { 
      message = i + ' bottles of beer on the wall! ' + i + ' bottles of beeeeer! Take one down, pass it around, ' + (i - 1) + ' bottles of beer on the wall!';
      pm(name,message); 
  }, 8000 * i); 
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