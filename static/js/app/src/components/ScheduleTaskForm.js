 /** @jsx React.DOM */
 /**
 * @author Thefuture2092
 *
 */

"user strict";

define(["react", "app/utils", "app/event", "app/constants", "app/TrackdidiaAction", "bootstrap"], function(React, Utils, EventProvider, Constants, TrackdidiaActions){
	var ReactPropTypes = React.PropTypes;
	var ScheduleTaskFormComponent = React.createClass({

		propTypes : {
			day : ReactPropTypes.object.isRequired,
			tasks:ReactPropTypes.object.isRequired,
			offset : ReactPropTypes.number.isRequired,
			duration: ReactPropTypes.number.isRequired

	    },
		getInitialState : function() {
			return {'error': null};
		},

		componentDidMount: function() {

		},

		componentWillUnmount: function() {

		},
		_handleSubmit : function(e) {
			e.preventDefault();
			var request = {};
			var day = this.props.day;
			var offset = this.refs.offset.getDOMNode().value;
			var end = this.refs.end.getDOMNode().value;
			var duration = end - offset;
			var task_id = this.refs.task_id.getDOMNode().value;
			console.log(task_id);
			request['offset'] = offset;
			request['duration'] = duration;
			if(task_id != "") {
				request['task_id'] = task_id
				

			}
			else {
				var name = this.refs.name.getDOMNode().value;
				var description = this.refs.description.getDOMNode().value;
				var location = this.refs.description.getDOMNode().value;

				request['name'] = name;
				description != ""?request['description'] = description:null;
				location != ""?request['location'] = location:null;
			}
			EventProvider.subscribe(Constants.CREATE_SLOT_FAILED, "_submit_failed", this);
			TrackdidiaActions.scheduleTask(day, request);

		},

		_submit_failed: function(message){
			EventProvider.unsubscribe(Constants.CREATE_SLOT_FAILED, "_submit_failed", this);
			this.setState({'error': message});
		},
		
		render: function() {
			var timeOptions = [];
			var tasksOptions =[];
			var day = this.props.day;
			var endOffset = this.props.offset + this.props.duration;
			var startDefaultOption = <option value = {this.props.offset}>{Utils.convertToHourString(day.getHourFromOffset(this.props.offset))} </option>
			var endDefaultOption = <option value = {endOffset}>{Utils.convertToHourString(day.getHourFromOffset(endOffset))}</option>
			for(var i = this.props.offset + 1; i < endOffset; i++) {
				timeString = Utils.convertToHourString(day.getHourFromOffset(i));
				timeOptions.push(<option key = {i} value = {i}> {timeString} </option>)
			}

			for(var key in this.props.tasks) {
				tasksOptions.push(<option key = {key} value = {key}> {this.props.tasks[key].name} </option>);
			}
			return (
				<form className="form-horizontal" role = "form"  onSubmit={this._handleSubmit} >
				  {this.state.error?
				  	<div className="alert alert-danger" role="alert">
				  	{ this.state.error}
				    </div> : ""
				  }
				  <div className = "form-group">
				    <label className = "control-label col-sm-2" htmlFor = "starting-input"> Start Time </label>
					<div className = "col-sm-10">
						<select defaultValue = {this.props.offset} className = "form-control" ref = "offset" name = "offset" id = "starting-input" required>
							{startDefaultOption}
							{timeOptions}
						</select>
					</div>
				  </div>

				  <div className = "form-group">
				    <label className = "control-label col-sm-2" htmlFor = "ending-input"> End Time </label>
					<div className = "col-sm-10">
						<select defaultValue = {endOffset} className = "form-control" ref = "end" name = "end" id = "ending-input" required>
							{timeOptions}
							{endDefaultOption}
						</select>
					</div>
				  </div>

				  <div className = "form-group">
				    <label className = "control-label col-sm-2" htmlFor = "task-input"> Exisiting Task </label>
					<div className = "col-sm-10">
						<select className = "form-control" ref = "task_id" name = "task_id" id = "task-input">
							<option value=""> Choose an existing task </option>
							{tasksOptions}
						</select>
					</div>
				  </div>

				  <div className = "form-group">
				    <label className = "control-label col-sm-2" htmlFor = "name-input"> Task Name </label>
					<div className = "col-sm-10">
						<input className = "form-control" ref = "name" name = "name" id = "name-input" />
					</div>
				  </div>

				  <div className = "form-group">
				    <label className = "control-label col-sm-2" htmlFor = "description-input"> Description </label>
					<div className = "col-sm-10">
						<input className = "form-control" ref = "description" name = "description" id = "description-input" />
					</div>
				  </div>

				  <div className = "form-group">
				    <label className = "control-label col-sm-2" htmlFor = "location-input"> Location </label>
					<div className = "col-sm-10">
						<input className = "form-control" ref = "location" name = "location" id = "location-input" />
					</div>
				  </div>

				  <div className = "form-group">
				  	<div className = "col-sm-10">
				  		<button type = "submit" className = "btn btn-default"> Add </button>
				  	</div>
				  </div>

				</form>

				);
		}
	});

	return ScheduleTaskFormComponent;
})