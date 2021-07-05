/* IMPORT MODULES */
import React, { Component } from 'react';
import axios from 'axios';
import PropTypes, { func } from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import DatePicker from 'react-datepicker';
import Select from 'react-select';

/* IMPORT COMPONENTS */
import Event from '../../../lists/lists-components/event';

/* COMPONENTS */
class ManageEvents extends Component {
	constructor(props) {
		super(props);
		this.state = {
			isLoaded: false,
			error: null,
			edit: false,
			elementId: '',
			// form
			name: '',
			enabled: false,
			displays: [],
			description: '',
			userGroup: '',
			type: 'capacity',
		};
	}
	componentDidMount() {
		const { data: { events } } = this.props;
		this.setState({ isLoaded: true, events });
	}

	componentWillReceiveProps(nextProps) {
		const { data: { events } } = nextProps;
		this.setState({ isLoaded: true, events });
	}

	edit = (elementId) => {
		const { events } = this.state;
		const {
			name, enabled, displays, description, userGroup, type
		} = events.find(e => e._id === elementId);

		this.setState({
			name,
			enabled,
			displays,
			description,
			userGroup,
			type,
			elementId,
			edit: true
		});
	}

	cancel = () => {
		this.setState({
			name: '',
			enabled: false,
			description: '',
			displays: '',
			userGroup: '',
			type: 'capacity',
			elementId: '',
			edit: false,
		});
	}

	handleInputChange = (event) => {
		const { target: { name, value } } = event;
		this.setState({
			[name]: value,
		});
	}

	handleMultiSelectChange = (event) => {
		let displays = [];
		if (event) {
			event.forEach(display => {
				displays.push(display.value);
			});
		}
		this.setState({ displays: displays });
	}

	setEventEnable = () => {
		this.setState({
			enabled: !this.state.enabled
		});
	}

	handleInputTypeChange = (event) => {
		const { target: { value: type } } = event;
		this.setState({ type });
	}

	/* HANDLE SUBMIT */
	handleSubmit = (method) => {
		const {
			name, enabled, displays = [], description, userGroup, type, edit, elementId,
		} = this.state;
		const { token, update, notify } = this.props;
		// FORM DATA
		const form = {
			name,
			enabled,
			displays,
			description,
			userGroup,
			type
		};
		axios({
			method,
			url: edit ? `${process.env.API_URL}events/${elementId}` : `${process.env.API_URL}events`,
			data: form,
			headers: { Accept: 'application/json', 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
		})
			.then((res) => {
				if (res.status === 201 || res.status === 200) {
					switch (method) {
						case 'put':
							notify('Evento modificado con éxito', 'notify-success', 'save', res.data.notify);
							update('events', res.data.resourceId, 'edit', res.data.resource); // update dataset
							break;
						case 'post':
							notify('Evento creado con éxito', 'notify-success', 'upload', res.data.notify);
							update('events', res.data.resourceId, 'add', res.data.resource); // update dataset
							this.edit(res.data.resourceId);
							break;
						case 'delete':
							notify('Evento eliminado con éxito', 'notify-success', 'trash', res.data.notify);
							this.cancel();
							update('events', res.data.resourceId, 'remove', res.data.resource); // update dataset
							break;
						default:
							console.log('Something went wrong');
					}
				} else {
					this.setState({
						isLoaded: true,
						error: res.data,
					});
				}
			})
			.catch(error => notify('Error al añadir/modificar un Evento', 'notify-error', 'exclamation-triangle', error.response.data.notify, 'error'));
	}

	render() {
		const {
			events,
			error,
			isLoaded,
			edit,
			elementId,
			name,
			enabled,
			description,
			userGroup,
			type
		} = this.state;
		if (error) {
			return null; // TODO: handle error
		} if (!isLoaded) {
			return null; // TODO: handle loading
		}
		const list = events.map((event) => {
			if (event._id === elementId) {
				return <Event event={event} key={event._id} edit={this.edit} active />;
			}
			return <Event event={event} key={event._id} edit={this.edit} active={false} />;
		});
		let groupList,
			groupEmpty = false,
			displayList = [],
			displayDefault,
			displayEmpty = false,
			displaysSelected = [],
			labelTypeOptions;
		if (type === 'capacity') {
			labelTypeOptions = (<label><FontAwesomeIcon icon="user-friends" className="mr-2" fixedWidth />Aforo</label>)
		} else {
			labelTypeOptions = (<label><FontAwesomeIcon icon="fan" className="mr-2" fixedWidth />Calidad del aire</label>)
		}

		if (this.props.data.userGroups.length > 0) {
			groupList = this.props.data.userGroups.map(userGroupMap => <option value={userGroupMap._id} key={userGroupMap._id}>{userGroupMap.name}</option>);
		}
		else {
			groupList = (<option defaultValue key='0' value=''>"No hay grupos disponibles"</option>)
			groupEmpty = true;
		}
		if (this.state.userGroup != '') {
			if (this.props.data.displays.length > 0) {
				this.props.data.displays.forEach(display => {
					if (display.userGroup === this.state.userGroup) {
						if (this.state.displays.length > 0) {
							this.state.displays.forEach(eventDisplay => {
								if (eventDisplay === display._id) {
									displaysSelected.push({ value: display._id, label: display.name })
								}
							});
						}
						displayList.push({ value: display._id, label: display.name });
					}
				});
			}
		} else {
			displayDefault = 'Seleccione un grupo';
			displayEmpty = true;
		}

		if (displayList.length === 0 && this.state.userGroup != "") {
			displayEmpty = true;
			displayDefault = 'Grupo sin displays asociados'
		}
		list.push(
			<div key="0" className="list-group-item-action list-group-item flex-column align-items-start">
				<div className="text-center elemento">
					<h4 className="mb-1">No se han encontrado {events.length > 0 && 'más'} Eventos</h4>
					<hr className="card-division" />
					<small>Número de Eventos existentes: {events.length}</small>
				</div>
			</div>,
		);
		return (
			<div className="card card-settings">
				<div className="card-header">
					<ul className="nav nav-pills card-header-pills justify-content-end mx-1">
						<li className="nav-item mr-auto">
							<h2 className="detalles-titulo"><FontAwesomeIcon icon='stopwatch' className="mr-2" fixedWidth />Eventos</h2>
						</li>
					</ul>
				</div>
				<div className="card-body">
					<div className="row">
						<div className="col-6">
							<h3>{edit ? 'Editar evento' : 'Añadir evento'}</h3>
							<hr className="card-division" />
							<form>
								<div className="form-row">
									<div className="form-group col-6">
										<label htmlFor="name"><FontAwesomeIcon icon="stopwatch" className="mr-2" fixedWidth />Nombre *</label>
										<input type="text" className="form-control" id="name" placeholder="Nombre del Evento" name="name" value={name} onChange={this.handleInputChange} />
									</div>
									<div className="form-group col-3">
										<label htmlFor="enabled"><FontAwesomeIcon icon="power-off" className="mr-2" fixedWidth />Activo</label>
										<input type="checkbox" value={enabled} className="form-control" id="enabled" placeholder="Evento activo" name="enabled" checked={enabled} onChange={this.setEventEnable} />
									</div>
								</div>
								<div className="form-group">
									<label htmlFor="description"><FontAwesomeIcon icon="info-circle" className="mr-2" fixedWidth />Descripción</label>
									<input type="text" className="form-control" id="description" placeholder="Descripción del evento" name="description" value={description} onChange={this.handleInputChange} />
								</div>
								<div className="form-group">
									<label htmlFor="eventGroup"><FontAwesomeIcon icon="users" className="mr-2" fixedWidth />Grupo Responsable del Evento *</label>
									<div>
										<select disabled={groupEmpty} className="custom-select" id="eventGroup" value={userGroup} name="userGroup" onChange={this.handleInputChange}>
											<option defaultValue value=''>-</option>
											{groupList}
										</select>
									</div>
								</div>
								<div className="form-group">
									<label htmlFor="eventDisplay"><FontAwesomeIcon icon={['far', 'window-maximize']} className="mr-2" fixedWidth />Pantallas afectadas por el Evento *</label>
									<div>
										<Select options={displayList}
											isMulti
											name="colors"
											className="basic-multi-select"
											classNamePrefix="select"
											isSearchable
											placeholder={displayDefault}
											isDisabled={displayEmpty}
											onChange={this.handleMultiSelectChange}
											value={displaysSelected}
										/>
									</div>
								</div>
								<div className="form-group">
									{labelTypeOptions}
									{
										<select className="custom-select" id="typeActionOptions" name="actionOptions" value={ type } onChange={this.handleInputTypeChange}>
											<option value="capacity">Sensor de Aforo</option>
											<option value="volume">Sensor de Calidad del Aire</option>
										</select>
									}
								</div>
								{}
								{!edit
									? <button onClick={() => this.handleSubmit('post')} type="button" className="btn btn-block btn-small btn-success"><i className="fa fa-plus-circle mr-1" aria-hidden="true" />Añadir</button>
									: (
										<div className="d-flex w-100 justify-content-between">
											<button onClick={() => this.handleSubmit('put')} type="button" className="btn btn-block btn-small btn-success mr-2"><FontAwesomeIcon icon="save" className="mr-2" fixedWidth />Actualizar</button>
											<button onClick={() => this.handleSubmit('delete')} type="button" className="btn btn-block btn-small btn-danger ml-1 mr-1"><FontAwesomeIcon icon="trash" className="mr-2" fixedWidth />Eliminar</button>
											<button onClick={() => this.cancel()} type="button" className="btn btn-block btn-small btn-warning ml-2"><FontAwesomeIcon icon={['far', 'times-circle']} className="mr-2" fixedWidth />Cancelar</button>
										</div>
									)
								}
							</form>
						</div>
						{<div className="col-6">
							<h3 className="d-flex w-100 justify-content-between">Eventos<span>{events.length}</span></h3>
							<hr className="card-division" />
							<div className="list settings-list">
								<div className="list-group mb-3">
									{list}
								</div>
							</div>
						</div>}
					</div>
				</div>
			</div>
		);
	}
}

ManageEvents.propTypes = {
	data: PropTypes.shape({}).isRequired,
	token: PropTypes.string.isRequired,
	notify: PropTypes.func,
	update: PropTypes.func,
};

ManageEvents.defaultProps = {
	notify: () => false,
	update: () => false,
};

export default ManageEvents;
