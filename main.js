const STORAGE_KEYS = {
	services: "appointment_manager_services",
	appointments: "appointment_manager_appointments",
};

let services = [];
let appointments = [];
let serviceBeingEditedId = null;

const serviceForm = document.getElementById("service-form");
const serviceNameInput = document.getElementById("service-name");
const serviceDurationInput = document.getElementById("service-duration");
const servicePriceInput = document.getElementById("service-price");
const serviceList = document.getElementById("service-list");

const appointmentForm = document.getElementById("appointment-form");
const clientNameInput = document.getElementById("client-name");
const clientEmailInput = document.getElementById("client-email");
const appointmentServiceSelect = document.getElementById("appointment-service");
const appointmentDateInput = document.getElementById("appointment-date");
const appointmentTimeInput = document.getElementById("appointment-time");
const holidayMessage = document.getElementById("holiday-message");

const filtersForm = document.getElementById("filters-form");
const filterDateInput = document.getElementById("filter-date");
const filterStatusSelect = document.getElementById("filter-status");
const clearFiltersButton = document.getElementById("clear-filters");
const appointmentTableBody = document.getElementById("appointment-table-body");

const holidayCache = new Map();

function generateId() {
	return `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}

function loadServices() {
	const raw = localStorage.getItem(STORAGE_KEYS.services);

	if (!raw) {
		services = [
			{
				id: generateId(),
				name: "Haircut",
				durationMinutes: 30,
				price: 15,
			},
			{
				id: generateId(),
				name: "Consultation",
				durationMinutes: 60,
				price: 40,
			},
		];
		saveServices();
		return;
	}

	try {
		const parsed = JSON.parse(raw);
		if (Array.isArray(parsed)) {
			services = parsed;
		} else {
			services = [];
		}
	} catch (error) {
		console.error("Failed to parse services from storage", error);
		services = [];
	}
}

function saveServices() {
	const raw = JSON.stringify(services);
	localStorage.setItem(STORAGE_KEYS.services, raw);
}

function loadAppointments() {
	const raw = localStorage.getItem(STORAGE_KEYS.appointments);

	if (!raw) {
		appointments = [];
		return;
	}

	try {
		const parsed = JSON.parse(raw);
		if (Array.isArray(parsed)) {
			appointments = parsed;
		} else {
			appointments = [];
		}
	} catch (error) {
		console.error("Failed to parse appointments from storage", error);
		appointments = [];
	}
}

function saveAppointments() {
	const raw = JSON.stringify(appointments);
	localStorage.setItem(STORAGE_KEYS.appointments, raw);
}

function renderServices() {
	serviceList.innerHTML = "";
	appointmentServiceSelect.innerHTML = "";

	if (services.length === 0) {
		const messageItem = document.createElement("li");
		messageItem.textContent = "No services yet. Add one above.";
		serviceList.appendChild(messageItem);
		return;
	}

	services.forEach((service) => {
		const listItem = document.createElement("li");
		listItem.className = "service-item";

		const infoContainer = document.createElement("div");
		infoContainer.className = "service-item__info";

		const name = document.createElement("span");
		name.className = "service-item__name";
		name.textContent = service.name;

		const meta = document.createElement("span");
		meta.className = "service-item__meta";
		meta.textContent = `${service.durationMinutes} min · $${service.price.toFixed(
			2,
		)}`;

		infoContainer.appendChild(name);
		infoContainer.appendChild(meta);

		const actionsContainer = document.createElement("div");
		actionsContainer.className = "service-item__actions";

		const editButton = document.createElement("button");
		editButton.type = "button";
		editButton.className = "button button--ghost";
		editButton.textContent = "Edit";
		editButton.dataset.action = "edit-service";
		editButton.dataset.id = service.id;

		const deleteButton = document.createElement("button");
		deleteButton.type = "button";
		deleteButton.className = "button button--ghost";
		deleteButton.textContent = "Delete";
		deleteButton.dataset.action = "delete-service";
		deleteButton.dataset.id = service.id;

		actionsContainer.appendChild(editButton);
		actionsContainer.appendChild(deleteButton);

		listItem.appendChild(infoContainer);
		listItem.appendChild(actionsContainer);
		serviceList.appendChild(listItem);

		const option = document.createElement("option");
		option.value = service.id;
		option.textContent = `${service.name} (${service.durationMinutes} min)`;
		appointmentServiceSelect.appendChild(option);
	});
}

function renderAppointments() {
	appointmentTableBody.innerHTML = "";

	if (appointments.length === 0) {
		const row = document.createElement("tr");
		const cell = document.createElement("td");
		cell.colSpan = 6;
		cell.textContent = "No appointments yet.";
		row.appendChild(cell);
		appointmentTableBody.appendChild(row);
		return;
	}

	const selectedDate = filterDateInput.value;
	const selectedStatus = filterStatusSelect.value;

	let filtered = appointments.slice();

	if (selectedDate) {
		filtered = filtered.filter(
			(appointment) => appointment.date === selectedDate,
		);
	}

	if (selectedStatus !== "all") {
		filtered = filtered.filter(
			(appointment) => appointment.status === selectedStatus,
		);
	}

	filtered.sort((a, b) => {
		const aKey = `${a.date}T${a.time}`;
		const bKey = `${b.date}T${b.time}`;
		return aKey.localeCompare(bKey);
	});

	if (filtered.length === 0) {
		const row = document.createElement("tr");
		const cell = document.createElement("td");
		cell.colSpan = 6;
		cell.textContent = "No appointments match the current filters.";
		row.appendChild(cell);
		appointmentTableBody.appendChild(row);
		return;
	}

	filtered.forEach((appointment) => {
		const row = document.createElement("tr");

		const clientCell = document.createElement("td");
		clientCell.textContent = appointment.clientName;

		const serviceCell = document.createElement("td");
		const service = services.find((item) => item.id === appointment.serviceId);
		serviceCell.textContent = service ? service.name : "Unknown";

		const dateCell = document.createElement("td");
		dateCell.textContent = appointment.date;

		const timeCell = document.createElement("td");
		timeCell.textContent = appointment.time;

		const statusCell = document.createElement("td");
		const badge = document.createElement("span");
		badge.className = `badge badge--${appointment.status}`;
		badge.textContent =
			appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1);
		statusCell.appendChild(badge);

		const actionsCell = document.createElement("td");
		const actionContainer = document.createElement("div");
		actionContainer.className = "action-buttons";

		const confirmButton = document.createElement("button");
		confirmButton.type = "button";
		confirmButton.className = "button button--ghost";
		confirmButton.textContent = "Confirm";
		confirmButton.dataset.action = "confirm";
		confirmButton.dataset.id = appointment.id;

		const cancelButton = document.createElement("button");
		cancelButton.type = "button";
		cancelButton.className = "button button--ghost";
		cancelButton.textContent = "Cancel";
		cancelButton.dataset.action = "cancel";
		cancelButton.dataset.id = appointment.id;

		const deleteButton = document.createElement("button");
		deleteButton.type = "button";
		deleteButton.className = "button button--ghost";
		deleteButton.textContent = "Delete";
		deleteButton.dataset.action = "delete";
		deleteButton.dataset.id = appointment.id;

		actionContainer.appendChild(confirmButton);
		actionContainer.appendChild(cancelButton);
		actionContainer.appendChild(deleteButton);

		actionsCell.appendChild(actionContainer);

		row.appendChild(clientCell);
		row.appendChild(serviceCell);
		row.appendChild(dateCell);
		row.appendChild(timeCell);
		row.appendChild(statusCell);
		row.appendChild(actionsCell);

		appointmentTableBody.appendChild(row);
	});
}

function handleServiceFormSubmit(event) {
	event.preventDefault();

	const name = serviceNameInput.value.trim();
	const duration = Number(serviceDurationInput.value);
	const price = Number(servicePriceInput.value);

	if (!name || Number.isNaN(duration) || Number.isNaN(price)) {
		return;
	}

	if (serviceBeingEditedId) {
		services = services.map((service) =>
			service.id === serviceBeingEditedId
				? {
						...service,
						name,
						durationMinutes: duration,
						price,
					}
				: service,
		);
	} else {
		const newService = {
			id: generateId(),
			name,
			durationMinutes: duration,
			price,
		};
		services.push(newService);
	}

	saveServices();
	renderServices();
	renderAppointments();

	serviceForm.reset();
	serviceBeingEditedId = null;
}

function handleAppointmentFormSubmit(event) {
	event.preventDefault();

	if (services.length === 0) {
		alert("Please create at least one service first.");
		return;
	}

	const clientName = clientNameInput.value.trim();
	const clientEmail = clientEmailInput.value.trim();
	const serviceId = appointmentServiceSelect.value;
	const date = appointmentDateInput.value;
	const time = appointmentTimeInput.value;

	if (!clientName || !clientEmail || !serviceId || !date || !time) {
		return;
	}

	const newAppointment = {
		id: generateId(),
		clientName,
		clientEmail,
		serviceId,
		date,
		time,
		status: "pending",
	};

	appointments.push(newAppointment);
	saveAppointments();
	renderAppointments();

	appointmentForm.reset();
	clearHolidayMessage();
}

function updateAppointmentStatus(appointmentId, newStatus) {
	appointments = appointments.map((appointment) =>
		appointment.id === appointmentId
			? { ...appointment, status: newStatus }
			: appointment,
	);
	saveAppointments();
	renderAppointments();
}

async function deleteAppointmentWithConfirmation(appointmentId) {
	if (typeof Swal === "undefined") {
		const confirmed = window.confirm(
			"Are you sure you want to delete this appointment?",
		);
		if (!confirmed) return;
	} else {
		const result = await Swal.fire({
			title: "Delete appointment?",
			text: "This action cannot be undone.",
			icon: "warning",
			showCancelButton: true,
			confirmButtonText: "Yes, delete it",
		});

		if (!result.isConfirmed) {
			return;
		}
	}

	appointments = appointments.filter(
		(appointment) => appointment.id !== appointmentId,
	);
	saveAppointments();
	renderAppointments();
}

function handleAppointmentTableClick(event) {
	const button = event.target.closest("button");
	if (!button) return;

	const action = button.dataset.action;
	const appointmentId = button.dataset.id;
	if (!action || !appointmentId) return;

	if (action === "confirm") {
		updateAppointmentStatus(appointmentId, "confirmed");
	} else if (action === "cancel") {
		updateAppointmentStatus(appointmentId, "cancelled");
	} else if (action === "delete") {
		deleteAppointmentWithConfirmation(appointmentId);
	}
}

function clearFilters() {
	filterDateInput.value = "";
	filterStatusSelect.value = "all";
	renderAppointments();
}

async function fetchHolidays(year, countryCode = "US") {
	const cacheKey = `${countryCode}-${year}`;

	if (holidayCache.has(cacheKey)) {
		return holidayCache.get(cacheKey);
	}

	const url = `https://date.nager.at/api/v3/PublicHolidays/${year}/${countryCode}`;

	try {
		const response = await fetch(url);

		if (!response.ok) {
			throw new Error(`Failed to fetch holidays: ${response.status}`);
		}

		const data = await response.json();
		const holidays = data.map((item) => item.date);
		holidayCache.set(cacheKey, holidays);
		return holidays;
	} catch (error) {
		console.error(error);
		return [];
	}
}

async function handleAppointmentDateChange() {
	const dateValue = appointmentDateInput.value;
	if (!dateValue) {
		clearHolidayMessage();
		return;
	}

	const [yearStr] = dateValue.split("-");
	const year = Number(yearStr);

	if (Number.isNaN(year)) {
		clearHolidayMessage();
		return;
	}

	holidayMessage.textContent = "Checking if this date is a public holiday…";

	const holidays = await fetchHolidays(year, "US");

	if (holidays.includes(dateValue)) {
		holidayMessage.textContent =
			"This day is a public holiday. Make sure your business is open.";
	} else {
		holidayMessage.textContent = "This day is not a public holiday (US).";
	}
}

function clearHolidayMessage() {
	holidayMessage.textContent = "";
}

function handleServiceListClick(event) {
	const button = event.target.closest("button");
	if (!button) return;

	const action = button.dataset.action;
	const serviceId = button.dataset.id;
	if (!action || !serviceId) return;

	if (action === "delete-service") {
		deleteServiceWithConfirmation(serviceId);
	} else if (action === "edit-service") {
		startEditingService(serviceId);
	}
}

async function deleteServiceWithConfirmation(serviceId) {
	if (typeof Swal === "undefined") {
		const confirmed = window.confirm(
			"Are you sure you want to delete this service?",
		);
		if (!confirmed) return;
	} else {
		const result = await Swal.fire({
			title: "Delete service?",
			text: "All future appointments using this service will show it as 'Unknown'.",
			icon: "warning",
			showCancelButton: true,
			confirmButtonText: "Yes, delete it",
		});

		if (!result.isConfirmed) {
			return;
		}
	}

	services = services.filter((service) => service.id !== serviceId);
	saveServices();
	renderServices();
	renderAppointments();
}

function startEditingService(serviceId) {
	const service = services.find((item) => item.id === serviceId);
	if (!service) {
		return;
	}

	serviceNameInput.value = service.name;
	serviceDurationInput.value = String(service.durationMinutes);
	servicePriceInput.value = String(service.price);

	serviceBeingEditedId = service.id;
}

function initializeApp() {
	loadServices();
	loadAppointments();
	renderServices();
	renderAppointments();

	serviceForm.addEventListener("submit", handleServiceFormSubmit);
	appointmentForm.addEventListener("submit", handleAppointmentFormSubmit);

	appointmentDateInput.addEventListener("change", handleAppointmentDateChange);

	filtersForm.addEventListener("change", renderAppointments);
	clearFiltersButton.addEventListener("click", clearFilters);

	appointmentTableBody.addEventListener("click", handleAppointmentTableClick);
	serviceList.addEventListener("click", handleServiceListClick);
}

document.addEventListener("DOMContentLoaded", initializeApp);
