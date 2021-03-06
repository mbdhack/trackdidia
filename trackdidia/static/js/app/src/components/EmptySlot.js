 /** @jsx React.DOM */
 /**
 * @author Thefuture2092
 *
 */

"user strict";

define(["react", "components/ScheduleTaskForm", "app/trackdidia", "app/constants", "app/TrackdidiaAction","app/event","bootstrap"], function(React, ScheduleForm, trackdidia, Constants, TrackdidiaActions, EventProvider){
	var ReactPropTypes = React.PropTypes;


	var EmptySlotComponent = React.createClass({

		propTypes : {
			day : ReactPropTypes.object.isRequired,
			offset : ReactPropTypes.number.isRequired,
			duration: ReactPropTypes.number.isRequired

	    },
		getInitialState : function() {
			return {
				isEditing: false,
				errorMessage: null,
				isCreating: false
			};
		},

		componentDidMount: function() {

		},

		componentWillUnmount: function() {
			this._unsubscribeAll();
		},
		_showCreateTaskForm: function() {
			this.setState({isEditing:true});
		},

		_createSlot: function(request) {
			if(this.state.isCreating)
				return;
			EventProvider.subscribe(Constants.CREATE_SLOT_FAILED, "_createSlotFailed", this);
			EventProvider.subscribe(Constants.SLOT_CREATED, "_createSlotSucceeded", this);
			TrackdidiaActions.scheduleTask(this.props.day, request);
		},
		_createSlotFailed: function(message) {
			this._unsubscribeAll();
			var state = this.state;
			state.errorMessage = message;
			state.isCreating = false;
			this.setState(state);
		},
		_createSlotSucceeded: function(message) {
			this._unsubscribeAll();
			var state = this.state;
			state.errorMessage = null;
			state.isCreating = false;
			state.isEditing = false;
			this.setState(state);
		},
		_unsubscribeAll: function() {
			EventProvider.unsubscribe(Constants.CREATE_SLOT_FAILED, "_createSlotFailed", this);
			EventProvider.unsubscribe(Constants.SLOT_CREATED, "_createSlotSucceeeded", this);
		},
		_cancelEditing: function() {
			var state = this.state
			state.errorMessage = null;
			state.isEditing = false;
			this.setState(state);
		},

		render: function() {
			var scheduleForm = '';
			if(this.state.isEditing) {
				var tasks = trackdidia.getAllTasks();
				var recurrenceTypes = trackdidia.getAllRecurrenceTypes();
				console.log(recurrenceTypes);
				scheduleForm = <ScheduleForm errorMessage={this.state.errorMessage} submit={this._createSlot} day={this.props.day} offset = {this.props.offset} duration = {this.props.duration} tasks = {tasks}  recurrenceTypes = {recurrenceTypes} cancel = {this._cancelEditing} />;
			}
			else {

			}
			return (
				<div className = "emptyslot">
					{this.state.isEditing?scheduleForm:
						<div className="row">
							<div className="col-xs-3">
								<span><b> {this.props.start} - {this.props.finish} </b> </span>
							</div>
							<div className="col-xs-9">
								<button className="btn btn-primary" onClick={this._showCreateTaskForm}> Schedule a task </button>
							</div>
						</div>
					}
					
				</div>

				);
		}
	});

	return EmptySlotComponent;
})