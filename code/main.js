game_log('Engaged');

/* *******Settings******** */
var attack_mode=true
var monsterReqStats = {
	min_xp:100,
	max_att:100,
	max_hp:5000
}
var percentHPRequiredToAcquireNewTarget = 0.4; //can't be a const for some reason
var attackModeZoneSize = 20; //limits movement after clicking Engage
var autoAcceptPartyInviteFrom = ['JCaesar', 'JCameron', 'JCarrey', 'BobDonut', 'CardiB'];
var upgradeItemsInTheseSlots = [35,36,37,38,39,40,41]; //inclusive
/**********end settings************/

//upgradeItemsWithinRange([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41], 'scroll0');

setInterval(function(){
  if(character.rip){
    attack_mode = false;
	  setTimeout(respawn,15000);
  }	
  if (character.hp <= character.max_hp && character.hp >= minHPForTargetsAndPots){
	  use_hp_or_mp(); 
    //parent.socket.emit("use",{item:"hp"}); (spams "not ready" so needs a timeout or something)
  } else { 
    use_hp_or_mp(); 
  } 

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

      //we are low on HP, but need to check for monsters targetting us first, currently broken
      if(!target && (get_nearest_monster({target : character}))){
        game_log('target aggro')
        target = get_nearest_monster({target : character});

      } else {

        set_message('Hold 4 HP');
        return; //**these mid-update-function returns are potentially problematic**

      }
    }
    
  } else { //If we get here, we have a target. 
	  
    //This is primarily for melee characters. If they are targeting
    //something that isn't reachable AND that target isn't already
    //aggroing, try switching to a closer target.
    if(!targetInRangeOfAttackModeZone(target) && target.target !== character.name){	
      target = get_nearest_monster(monsterReqStats);
    }
  }
	
  if (!is_in_range(target)){
     moveWithinAttackZone(target);
  } 
  
  if (can_attack(target)){
      set_message("Attacking");
      attack(target);
	  if((character.ctype === 'warrior') && target.target !== character){
	  	parent.use_skill('taunt',target);
	  }
  }
}

function hasEnoughHPForNewTarget(){
	return (character.hp > minHPForTargetsAndPots);
}

function targetInRangeOfAttackModeZone(target){
  var bool = false;
  var maxX = attackModeZone[maxX] + character.range;
  var minX = attackModeZone[minX] - character.range;
  var maxY = attackModeZone[maxY] + character.range;
  var minY = attackModeZone[minY] - character.range;
  if (target.x <= maxX && target.x >= minX && target.y <= maxY && target.y >= minY){
    bool = true;
  }
  return bool;
}

function moveWithinAttackZone(target){
	var xDistanceToTarget = target.x - character.x;
  var yDistanceToTarget = target.y - character.y;
  var xMoveHere = Math.max(Math.min(character.x + xDistanceToTarget/2, attackModeZone.maxX), attackModeZone.minX)
  var yMoveHere = Math.max(Math.min(character.y + yDistanceToTarget/2, attackModeZone.maxY), attackModeZone.minY)
  move(xMoveHere, yMoveHere);
}

//this isn't fully working, only upgrades one item in array once
//TODO - upgrades all *basic* items regardless of position
function upgradeItemsWithinRange(invSlots, scrollID){ 
	var inventorySlotID = -1;
  
	for (var i = 0; i < invSlots.length; i++){
		inventorySlotID = invSlots[i];
    //TODO for each item, upgrade until hits level target
		game_log('Upgrading: ' + inventorySlotID); //TODO display item name instead of position
		//TODO:  wrap upgrade in setTimeout, using a delay based on the item's level
    setTimeout(upgradeItem(inventorySlotID, scrollID), 5000);
	}
}

//TODO:  probably cleaner to use a separate function if upgrading by name instead of location.  or pulling the conversion to location into separate function
function upgradeItem(itemNameOrLocation, scrollID){
	//TODO: check if have at least one of each scroll, else get more
  var itemLocation = -1;
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

// function combineAllItems(itemTypeList, targetLevel){
//   for (var i = 0; i < itemTypeList.length; i++){
//     combineItemsOfType(itemTypeList[i], targetLevel);
//   }
// }

// var itemName = character.items[0]['name'];
// game_log(itemName);
// combineAllItemsOfType(itemName, 1);//only working for maxLevel = 1 right now.

function combineAllItemsOfType(itemName, maxLevel) {
  let bool = false;
 
  combineItemsOfType(itemName, maxLevel)
  
  setInterval(function() { 
      bool = combineItemsOfType(itemName, maxLevel)
      
  }, 11000); 

	if (bool === false){
    game_log('CombineAllItemsOfType Finished')
		return;
  } 
}

function combineItemsOfType(itemName, maxLevel){
  let itemLocs = getNextThreeItems(itemName, maxLevel);
    if (itemLocs.length === 3 && (locate_item("cscroll0"))) {
        compound(itemLocs[0],itemLocs[1],itemLocs[2],locate_item("cscroll0"));
        itemLocs = getNextThreeItems(itemName, maxLevel);
    } else {
      return false;
    }
}
function getNextThreeItems(itemName, targetLevel){
  let itemLocs = [];
  //iterate from lvl 0 to targetlevel
  for (let currentLvl = 0; currentLvl < targetLevel; currentLvl++){
    //iterate over character's inventory
    for (let loc = 0; loc < 42; loc++){
      if (character.items[loc] !== null && 
          character.items[loc]['name'] == itemName && 
          character.items[loc]['level'] == currentLvl){
  
        itemLocs.push(loc);

        if (itemLocs.length === 3){
          return itemLocs;
        }
      }
      
    }
  }
  return false;
}


// function canCombine(itemType, maxLevel){
//   var count = 0;
//   var beltHPPerLvl = [160, 240];
//   //iterate from lvl 1 to maxLevel
//   for (var lvl = 0; lvl < maxLevel; lvl++){
//     //iterate over inventory
//     for (var loc = 0; loc < 42; loc++){
//       //get item properties
//       var item = item_properties(character.items[loc])
//       //if it is itemType count++
//       if (item.hp == beltHPPerLvl[lvl]) {
//         count++;
//       }
//       if (count >= 3){return true}
//     }
//   }
//   return false;
// }
//example
// compound(0,1,2,locate_item("cscroll0")).then(
// 	function(data){
// 		game_log("Compound call completed");
// 		log(data);
// 	},
// 	function(data){
// 		game_log("Compound call failed with reason: "+data.reason);
// 	},
// );

function on_combined_damage(){
  game_log('TAKEING COMBINED DAMAGE OMAGERRRDDDDDDDDDDDDDDDDDDDDDDD')
}
//
//sendItems(0, 41, 'CardiB', 1);
// var datadata = {'give' : 'mestuff'};
// send_cm('JCameron',datadata);
//character.on("cm",function(data){})

function sendItems(startLoc, stopLoc, receiver, quantity){
  for (let i = 0; i < (stopLoc - startLoc); i++){
    //var quantity = //item_properties(character.items[0])
    send_item(receiver,(startLoc + i),quantity)
  }
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
	// Needed for browsers only,
	parent.performance_trick(); // Just plays an empty sound file, so browsers don't throttle JS, only way to prevent it, interesting cheat [05/07/18]
}

// function pm99Bottles(name){
// 	var totalBottles = 2;
// 	game_log('start pm99Bottles');
// 	for (var currentBottles = totalBottles; currentBottles > 0; currentBottles--) { 
//     	bottles(currentBottles, name, totalBottles); 
//   }
// }
// function bottles(currentBottles, name, totalBottles) { 
//   game_log('start bottles');
//   var message = '';
//   setTimeout(function() { 
//       message = currentBottles + ' bottles of beer on the wall! ' + currentBottles + ' bottles of beeeeer! Take one down, pass it around, ' + (currentBottles - 1) + ' bottles of beer on the wall!';
//       pm(name,message); 
//   }, 8000 * (totalBottles - currentBottles)); 
// } 

//**********  Other global helper vars (supposed to avoid globals oops) ***********//

let minHPForTargetsAndPots = percentHPRequiredToAcquireNewTarget * character.max_hp;

//Set max wander box based on current position when initializing code (aka 'engage'). must remain outside of update/setInterval
let characterStartX = character.x;
let characterStartY = character.y;
let attackModeZone = 
  {
		minX : characterStartX - attackModeZoneSize/2,
		maxX : characterStartX + attackModeZoneSize/2,
		minY : characterStartY - attackModeZoneSize/2,
		maxY : characterStartY + attackModeZoneSize/2
	};


/*
Ideas / Todo
Priotize:
 - Auto save code, send message to other two characters to load new save, re-engage.  and/or use load code function to load from git/replit

- split code into Party Leader and Non Leader version
  - target Party Leader's target (get_targeted_monster)
  - Party Leader dont attack if any party member hp low
  - anchor movement to party leader position
- use upgrade function automagically
  - item_grade(item) // example: item_grade(character.items[0])
  - item_properties(item) // example: item_properties(character.items[0])
  - send items to trader character to do the upgrades
- don't use potions unless below certain threshold
- use skills/mana while fighting
- auto reconnect
- resume farming
- merchant mule
  - send merchant hp/mp pot request (total needed based on party member totals)
  - merchant buys pots
  - merchant sends magiport request
  - magiport to party
  - send merchant all basic loot
  - merchant returns to town
  - upgrade/combine all items up to limit
- refil potions
- make ranged vs melee attackmodes (ranged kites)
- handle on_combined_damage()
- You should also be able to check like character.S to see if you're currently upgrading or not.  But you can [also] listen to the sockets, there might be better ways to listen nowadays but I don't know if wizard has extended the upgrade messaging yet

*/

// @jsizzle4rizzle upgrade and compound support promises, so you can take action when they complete and parent.compound  and parent.upgrade apparently allows getting the chance, so if you use  async/await code you mght have something like:

// const { chance } = await parent.compound(i0, i1, i2, s0, offering, 'code', true); // last parameter is true if calc chance, false if performing action
// const data = await parent.compound(i0, i1, i2, s0, offering, 'code', false); // pauses this function until complete
// if (data.success) {
//     game_log(`Combined`);
// } else {
//     game_log(`Rip`);
// // }
// @jsizzle4rizzle the two calls is purely for example. You only need one, I'm just demonstrating how you can use it to get the upgrade/compound chance before acting. In practice I only use it for logging.
