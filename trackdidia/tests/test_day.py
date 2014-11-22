'''
Created on 2014-11-20

@author: didia
'''
import unittest
from .base_test import TestTracking
from trackdidia.models.custom_exceptions import SlotAlreadyUsed, BadArgumentError
class TestDay(TestTracking):


    def testAddSlot(self):
        i = 2
        duration= 6 # 6 interval . With interval = 0.5h, duration = 3 hours
        start_offset = 18
        task = self.user.create_task("Dinner Time")

        day = self.schedule.get_day(i)
        day.add_slot(task, start_offset, duration)
        day.reload_slots()
        slots = day.get_slots()
        self.assertEqual(2, len(slots))
        self.assertEqual(12+duration, day.interval_usage.count(True))
        slot = slots[1]
        self.assertEqual(duration,slot.duration)
        self.assertEqual(start_offset, slot.offset)
    
    def testRemoveSlot(self):
        i = 3
        day = self.schedule.get_day(i)
        slots = day.get_slots()
        slot_id = slots[0].key.integer_id()
        day.remove_slot(slot_id)
        slots_now = day.get_slots()
        self.assertEqual(0, len(slots_now))
        self.assertEqual(0, day.interval_usage.count(True))
    
    def testAddSlotBad(self):
        i = 2
        start_offset = 4
        duration = 2
        task = self.user.create_task("Fifa time")
        
        day = self.schedule.get_day(i)
        self.assertRaises(SlotAlreadyUsed, day.add_slot, task, start_offset, duration)
        
        #Bad start_slot
        self.assertRaises(BadArgumentError, day.add_slot, task, 60, 5)
        self.assertRaises(BadArgumentError, day.add_slot, task, -5, 5)
        
        #Bad duration
        self.assertRaises(BadArgumentError, day.add_slot, task, 43, 15)
    
    def testGetSlots(self):
        i = 2
        day = self.schedule.get_day(i)
        slots = day.get_slots()
        self.assertIsNotNone(slots)
        self.assertEqual(1, len(slots))
        
if __name__ == "__main__":
    #import sys;sys.argv = ['', 'Test.testName']
    unittest.main()