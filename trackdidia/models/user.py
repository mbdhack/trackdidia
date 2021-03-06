#!/usr/bin/env python
# -*- coding: utf-8 -*-
'''
Created on 2014-10-28

@author: didia
'''
from google.appengine.ext import ndb

from .custom_exceptions import BadArgumentError
from .custom_exceptions import DeleteTaskFailed
from .task import Task
from trackdidia.models.calendar import Week
from trackdidia.models.scheduled_task import ScheduledTask
from trackdidia import constants
from trackdidia.utils import utils
import webapp2_extras.appengine.auth.models as model

def create_user(user_id, email, nickname):
    
    user_data = User.create_user(user_id, id=user_id, email=email, nickname = nickname)  
    
    my_user = user_data[1]
    my_user.init_calendar()

    return my_user;

def get_user(user_id):
    return User.get_by_id(user_id)

def get_or_create_user(user_id, email, nickname):
    user = get_user(user_id)
    return user or create_user(user_id, email, nickname)

def get_all_users():
    return User.query().fetch()
    

def delete_user(user_id):
    key = ndb.Key(User, user_id)
    key.delete()
    
class User(model.User):
    '''
    Stores a user information
    '''
    email = ndb.StringProperty(required=True)
    nickname = ndb.StringProperty(required=True)
    week = None
    _tasks = None
    
    
    def update(self, **kwargs):
        if not kwargs is None:
            updated_values = {}
            for key, value in kwargs.iteritems():
                if not value is None:
                    updated_values[key] = value
            
            self.populate(**updated_values)
            self.put()
    
    def get_or_create_week(self, monday, saturday):
        week_id = monday.strftime(constants.WEEK_ID_FORMAT) + saturday.strftime(constants.WEEK_ID_FORMAT)
        week = self.get_week(week_id)
        if week:
            return week
        week = Week(id = week_id, parent = self.key)
        week.initialize()
        weekly_schedule = self.get_week(constants.RECURRENCE_TYPES[2])
        
        for recurrent_day in weekly_schedule.get_all_days():
            new_scheduled_tasks = []
            day = week.get_day(recurrent_day.key.id())
            for scheduled_task in recurrent_day.get_scheduled_tasks():
                new_key = ndb.Key(flat=[ScheduledTask, scheduled_task.key.id()], parent = day.key)
                scheduled_task.key = new_key
                for i in range(scheduled_task.offset, scheduled_task.offset+scheduled_task.duration):
                    day.interval_usage[i] = True
                
                new_scheduled_tasks.append(scheduled_task)
            new_scheduled_tasks.append(day)
            ndb.put_multi(new_scheduled_tasks)
        
                        
        week.put()
        return week
    
    def create_task(self, name, **kwargs):
        self._tasks = None
        if(self.has_task(name)):
            raise BadArgumentError("A task with name < " + name + " > already exists")
        task = Task(parent = self.key, name=name, **kwargs)
        task.put()
        return task
    
    def has_task(self, task_name):
        return Task.query(ancestor = self.key).filter(ndb.AND(Task.name ==task_name, Task.deleted == False)).get() != None;
                    
    def get_task(self, task_id):
        task = Task.get_by_id(task_id, parent = self.key)
        if task and not task.deleted:
            return task
        return None
    
    def get_task_by_name(self, task_name):
        return Task.query(ancestor = self.key).filter(Task.name ==task_name).get()
    
    def get_all_tasks(self, deleted = False):
        if self._tasks is None:
            if deleted is None:
                self._tasks = Task.query(ancestor = self.key).order(Task.name).fetch()
            else:
                self._tasks = Task.query(ancestor=self.key).filter(Task.deleted == deleted).order(Task.name).fetch()
            
        return self._tasks
        
    def update_task(self, task_id, **kwargs):
        self._tasks = None
        task = Task.get_by_id(task_id, parent = self.key)
        if(kwargs.get('name') and task.name != kwargs.get('name') and 
           self.has_task(kwargs.get('name'))):
            raise BadArgumentError("A task with name < " + kwargs.get('name') + " > already exists")
            
        return task.update(**kwargs)
        
    
    def delete_task(self, task_id = None, task_key = None, task = None, force = False):
        if task :
            pass
        elif task_key:
            task = task_key.get()
        elif task_id:
            key = ndb.Key(Task, task_id, parent = self.key)
            task = key.get()
        else:
            raise BadArgumentError("No task_id or task_key or task provided")
        
        scheduled_tasks = self.get_scheduled_tasks(active_only = True, task_key = task.key, unique=True)
        if force or len(scheduled_tasks) == 0:
            task.deleted = True
            task.put()
            week = self.get_week('current')
            today = utils.get_today_id()
            for sd in scheduled_tasks:
                week.delete_scheduled_task(today, sd, True)
        else:  
            raise DeleteTaskFailed("Task to be deleted has active scheduled tasks") 
    
    def init_calendar(self):
        if self.get_week(constants.RECURRENCE_TYPES[2]) is None:
            week = Week(id=constants.RECURRENCE_TYPES[2], parent=self.key)
            week.recurrent = True
            week.initialize()
            week.add_default_sleep_task()
            week.put()
            monday, saturday = utils.get_week_start_and_end()
            self.week = self.get_or_create_week(monday, saturday)
        return self.week
    
    def get_week(self, week_id='current'):
        if week_id == 'current':
            week_id = utils.get_week_id()
        if self.week is None or self.week.key.id() != week_id:
            self.week = Week.get_by_id(week_id, parent=self.key)
        return Week.get_by_id(week_id, parent=self.key)
    
    def get_current_week(self):
        return self.get_week('current')
    
    def get_scheduled_tasks(self, unique = False, active_only = False, task_key = None):
        return ScheduledTask.find(self.key, unique = unique, active_only = active_only, task_key = task_key)
        
