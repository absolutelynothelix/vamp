#!/usr/bin/env node
const process_message = line => {
	console.log('');

	let severity = line.match(/Validation [^:]+/)[0];
	if (severity.includes('Information')) {
		severity = `\x1B[36m${severity}\x1B[39m`;
	} else if (severity.includes('Warning')) {
		severity = `\x1B[33m${severity}\x1B[39m`;
	} else if (severity.includes('Error')) {
		severity = `\x1B[31m${severity}\x1B[39m`;
	} else if (severity.includes('Debug')) {
		severity = `\x1B[37m${severity}\x1B[39m`;
	}

	let vuid = line.match(/^[^\(]+/)[0];
	vuid = `\x1B[37m${vuid}\x1B[39m`;

	console.log(`${severity} (${vuid}):`);

	let message = line.split(' | ');
	message = message[message.length - 1];

	let spec_message = message.match(/The Vulkan spec states: .+$/);
	if (spec_message) {
		spec_message = spec_message[0];
		message = message.replace(spec_message, '');
		spec_message = `\x1B[37m${spec_message}\x1B[39m`;
	}

	if (vuid.includes('UNASSIGNED')) {
		message = message.replace('[AMD]', '[\x1B[38;2;237;28;36mAMD\x1B[39m]');
		message = message.replace('[Arm]', '[\x1B[38;2;0;145;189mARM\x1B[39m]');
		message = message.replace('[IMG]', '[\x1B[38;2;114;35;135mIMG\x1B[39m]');
		message = message.replace('[NVIDIA]', '[\x1B[38;2;118;185;0mNV\x1B[39m]');
	}

	console.log(message);
	if (spec_message) {
		console.log(spec_message);
	}
};

const process_details = line => {
	if (!line.startsWith(' ')) {
		console.log(line);

		return;
	}

	if (line.includes('Objects: ')) {
		console.log(`\x1B[37m${line.match(/\d+/)[0]} referenced objects:`);

		return;
	}

	if (line.includes(', name: ')) {
		const number = parseInt(line.match(/(?<=\[)\d+/)[0]) + 1;
		const handle = line.match(/0x[0-9a-f]+/)[0];
		let type = parseInt(line.match(/(?<=type: )\d+/)[0]);
		let name = line.match(/(?<=name: ).+/)[0];

		type = {
			0: 'VK_OBJECT_TYPE_UNKNOWN',
			3: 'VK_OBJECT_TYPE_DEVICE',
			8: 'VK_OBJECT_TYPE_DEVICE_MEMORY',
			9: 'VK_OBJECT_TYPE_BUFFER',
			10: 'VK_OBJECT_TYPE_IMAGE'
		}[type] || type;

		if (name === 'NULL') {
			name = `Unnamed ${type}`;
		}

		console.log(`  \x1B[37m${number}: ${name} (${handle})\x1B[39m`);

		return;
	}

	console.log(line.replace(/^ +/, ''));
};

process.stdin.on('data', data => {
	const lines = data.toString().split('\n');
	for (const line of lines) {
		if (line === '') {
			continue;
		}

		if (line.startsWith('VUID') || line.startsWith('UNASSIGNED') || line.startsWith('CHASSIS')) {
			process_message(line);
		} else {
			process_details(line);
		}
	}
});
