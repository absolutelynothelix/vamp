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

	if (vuid.includes('BestPractices')) {
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
		const objects = line.match(/\d+/)[0];
		if (objects !== '0') {
			console.log(`\x1B[37m${objects} referenced objects:\x1B[39m`);
		}

		return;
	}

	if (line.includes(', name: ')) {
		const number = Number.parseInt(line.match(/(?<=\[)\d+/)[0]) + 1;
		const handle = line.match(/0x[0-9a-f]+/)[0];
		let type = Number.parseInt(line.match(/(?<=type: )\d+/)[0]);
		let name = line.match(/(?<=name: ).+/)[0];

		type = {
			0: 'VK_OBJECT_TYPE_UNKNOWN',
			1: 'VK_OBJECT_TYPE_INSTANCE',
			2: 'VK_OBJECT_TYPE_PHYSICAL_DEVICE',
			3: 'VK_OBJECT_TYPE_DEVICE',
			4: 'VK_OBJECT_TYPE_QUEUE',
			5: 'VK_OBJECT_TYPE_SEMAPHORE',
			6: 'VK_OBJECT_TYPE_COMMAND_BUFFER',
			7: 'VK_OBJECT_TYPE_FENCE',
			8: 'VK_OBJECT_TYPE_DEVICE_MEMORY',
			9: 'VK_OBJECT_TYPE_BUFFER',
			10: 'VK_OBJECT_TYPE_IMAGE',
			11: 'VK_OBJECT_TYPE_EVENT',
			12: 'VK_OBJECT_TYPE_QUERY_POOL',
			13: 'VK_OBJECT_TYPE_BUFFER_VIEW',
			14: 'VK_OBJECT_TYPE_IMAGE_VIEW',
			15: 'VK_OBJECT_TYPE_SHADER_MODULE',
			16: 'VK_OBJECT_TYPE_PIPELINE_CACHE',
			17: 'VK_OBJECT_TYPE_PIPELINE_LAYOUT',
			18: 'VK_OBJECT_TYPE_RENDER_PASS',
			19: 'VK_OBJECT_TYPE_PIPELINE',
			20: 'VK_OBJECT_TYPE_DESCRIPTOR_SET_LAYOUT',
			21: 'VK_OBJECT_TYPE_SAMPLER',
			22: 'VK_OBJECT_TYPE_DESCRIPTOR_POOL',
			23: 'VK_OBJECT_TYPE_DESCRIPTOR_SET',
			24: 'VK_OBJECT_TYPE_FRAMEBUFFER',
			25: 'VK_OBJECT_TYPE_COMMAND_POOL',
			1000156000: 'VK_OBJECT_TYPE_SAMPLER_YCBCR_CONVERSION',
			1000085000: 'VK_OBJECT_TYPE_DESCRIPTOR_UPDATE_TEMPLATE',
			1000295000: 'VK_OBJECT_TYPE_PRIVATE_DATA_SLOT',
			1000000000: 'VK_OBJECT_TYPE_SURFACE_KHR',
			1000001000: 'VK_OBJECT_TYPE_SWAPCHAIN_KHR',
			1000002000: 'VK_OBJECT_TYPE_DISPLAY_KHR',
			1000002001: 'VK_OBJECT_TYPE_DISPLAY_MODE_KHR',
			1000011000: 'VK_OBJECT_TYPE_DEBUG_REPORT_CALLBACK_EXT',
			1000023000: 'VK_OBJECT_TYPE_VIDEO_SESSION_KHR',
			1000023001: 'VK_OBJECT_TYPE_VIDEO_SESSION_PARAMETERS_KHR',
			1000029000: 'VK_OBJECT_TYPE_CU_MODULE_NVX',
			1000029001: 'VK_OBJECT_TYPE_CU_FUNCTION_NVX',
			1000128000: 'VK_OBJECT_TYPE_DEBUG_UTILS_MESSENGER_EXT',
			1000150000: 'VK_OBJECT_TYPE_ACCELERATION_STRUCTURE_KHR',
			1000160000: 'VK_OBJECT_TYPE_VALIDATION_CACHE_EXT',
			1000165000: 'VK_OBJECT_TYPE_ACCELERATION_STRUCTURE_NV',
			1000210000: 'VK_OBJECT_TYPE_PERFORMANCE_CONFIGURATION_INTEL',
			1000268000: 'VK_OBJECT_TYPE_DEFERRED_OPERATION_KHR',
			1000277000: 'VK_OBJECT_TYPE_INDIRECT_COMMANDS_LAYOUT_NV',
			1000307000: 'VK_OBJECT_TYPE_CUDA_MODULE_NV',
			1000307001: 'VK_OBJECT_TYPE_CUDA_FUNCTION_NV',
			1000366000: 'VK_OBJECT_TYPE_BUFFER_COLLECTION_FUCHSIA',
			1000396000: 'VK_OBJECT_TYPE_MICROMAP_EXT',
			1000460000: 'VK_OBJECT_TYPE_TENSOR_ARM',
			1000460001: 'VK_OBJECT_TYPE_TENSOR_VIEW_ARM',
			1000464000: 'VK_OBJECT_TYPE_OPTICAL_FLOW_SESSION_NV',
			1000482000: 'VK_OBJECT_TYPE_SHADER_EXT',
			1000483000: 'VK_OBJECT_TYPE_PIPELINE_BINARY_KHR',
			1000556000: 'VK_OBJECT_TYPE_EXTERNAL_COMPUTE_QUEUE_NV',
			1000572000: 'VK_OBJECT_TYPE_INDIRECT_COMMANDS_LAYOUT_EXT',
			1000572001: 'VK_OBJECT_TYPE_INDIRECT_EXECUTION_SET_EXT'
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

		if (['WARNING', 'VUID', 'SYNC', 'BestPractices'].some(prefix => line.startsWith(prefix))) {
			process_message(line);
		} else {
			process_details(line);
		}
	}
});
