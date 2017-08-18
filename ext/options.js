'use strict'

let statusDiv = document.getElementById('status')
let applicationsDiv = document.getElementById('applications')

async function saveOptions(event) {
	event.preventDefault()

	let applications = []

	for (let element of applicationsDiv.children) {
		applications.push({
			name: element.querySelector('[name=name]').value,
			command: element.querySelector('[name=command]').value,
		})
	}

	await browser.storage.local.set({
		applications,
	})

	browser.runtime.sendMessage({
		method: 'options-update'
	})
}

async function restoreOptions() {
	let options = await browser.storage.local.get(null)
	let applications = options.applications || []

	while (applicationsDiv.lastChild !== null) {
		applicationsDiv.removeChild(applicationsDiv.lastChild)
	}

	for (let application of applications) {
		addApplication(application.name, application.command)
	}

	if (!applications.length) {
		statusDiv.textContent = 'You have no applications configured. Click Add to add a new one.'
	}
}

function addNewApplication() {
	addApplication('', '', true)
}

function addApplication(name, command) {
	statusDiv.textContent = ''
	let application = document.createElement('div')
	application.className = 'application'
	application.appendChild(labelledInput('Name', 'text', 'name', name))
	application.appendChild(labelledInput('Command', 'text', 'command', command))
	let removeButton = document.createElement('input')
	removeButton.type = 'button'
	removeButton.value = 'Remove'
	removeButton.addEventListener('click', event => application.remove())
	application.appendChild(removeButton)
	applicationsDiv.appendChild(application)
}

function labelledInput(labelText, type, name, value) {
	let div = document.createElement('div')
	div.className = 'block'
	let label = document.createElement('label')
	label.textContent = labelText
	div.appendChild(label)
	let input = document.createElement('input')
	input.name = name
	input.type = type
	input.value = value
	div.appendChild(input)
	return div
}

document.addEventListener('DOMContentLoaded', restoreOptions)
document.getElementById('add').addEventListener('click', addNewApplication)
document.getElementById('save').addEventListener('click', saveOptions)
