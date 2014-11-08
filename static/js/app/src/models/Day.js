
 /**
 * @author Thefuture2092
 *
 */

"use strict";

 define(['models/Slot'], function(Slot){
 	
 	function Day(day_data) {
 		this.id = day_data.day_id
 		this.usage = day_data.interval_usage
 		this.slots = this.initSlots(day_data.slots)
 	}

 	Day.prototype = {
 		constructor: Day,

 		initSlots: function(listOfSlots) {
 			var slots = {};
 			listOfSlots.forEach(function(slot_data) {
 				var slot = new Slot(slot_data);
 				slots[slot.offset] = slot;
 			});
 			return slots;


 		}
 	}

 	return Day;

 })