import { writable, type Writable } from 'svelte/store';
import type { BoidSimOptions } from '$lib/types';
import { getBoidSimOptions } from './boidoptions';

export const goptions: Writable<BoidSimOptions> = writable(getBoidSimOptions(0));

export const mouse = {
	x: 0,
	y: 0
};
