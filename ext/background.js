'use strict'

let idMap = new Map()

async function initContextMenu() {
	let [_, options] = await Promise.all([
		browser.contextMenus.removeAll(),
		browser.storage.local.get('applications'),
	])
	
	let applications = options.applications || []
	let name_prefix

	if (applications.length === 1) {
		name_prefix = 'Open with '
	} else {
		name_prefix = ''
	}

	idMap = new Map()

	for (let index = 0; index < applications.length; index++) {
		let application = applications[index]
		let id = 'web_open_with_' + index

		idMap.set(id, application)

		browser.contextMenus.create({
			id,
			title: name_prefix + application.name,
			contexts: ['link'],
		})
	}
}

initContextMenu()

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.method === 'options-update') {
		initContextMenu()
	}
})

browser.contextMenus.onClicked.addListener(info => {
	let application = idMap.get(info.menuItemId)

	if (application === undefined) {
		return
	}

	sendMessage({
		method: 'spawn',
		command: application.command,
		args: [info.linkUrl]
	})
})

async function sendMessage(message) {
	const response = await browser.runtime.sendNativeMessage('web_open_with', message)

	if (typeof response.error !== 'undefined') {
		throw response.error
	}

	return response
}
