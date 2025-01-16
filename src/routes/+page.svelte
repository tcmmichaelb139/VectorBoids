<script lang="ts">
	import { Slider, List, Checkbox, Color, FpsGraph } from 'svelte-tweakpane-ui';
	import { onMount } from 'svelte';

	import Boids from '$lib/boids';
	import type { BoidSimOptions } from '$lib/types';
	import { mouse } from '$lib/globals';

	const options: BoidSimOptions = {
		boidCount: 100,
		bounds: {
			width: 0,
			height: 0,
			margin: 0,
			scale: 1
		},
		ranges: {
			protected: 25,
			visible: 100
		},
		factors: {
			seperation: 0.05,
			alignment: 0.05,
			cohesion: 0.0005,
			regularization: 0.9,
			mouse: 0.05,
			turn: 0.2
		},
		maxSpeed: 2.5,
		minSpeed: 1,
		trailLength: 0,
		mouse: 'none',
		show: {
			protectedRange: false,
			visibleRange: false
		},
		colors: {
			boid: '#bb9af7',
			outline: '#565f89',
			trail: '#bb9af7',
			protected: '#f7768e',
			visible: '#9ece6a'
		}
	};

	let fpsMeter = 60;

	let boids: Boids;

	onMount(() => {
		options.bounds.margin = window.innerWidth / 30;

		const canvas = document.getElementById('boids') as HTMLCanvasElement;
		if (!canvas) return console.log('Canvas not found');

		boids = new Boids(canvas, options);
		boids.start();
	});
</script>

<div class="flex h-full items-center justify-center">
	<canvas
		id="boids"
		class="h-[90vh] w-[70vw] border-2 border-gray"
		onmousemove={(e) => {
			const rect = (e.target as HTMLCanvasElement)?.getBoundingClientRect();
			mouse.x = (e.clientX - rect.left) * options.bounds.scale;
			mouse.y = (e.clientY - rect.top) * options.bounds.scale;
		}}
	></canvas>
	<div class="ml-10 h-[90vh] w-[20vw] border-2 border-gray">
		<Slider bind:value={options.boidCount} label="Boid Count" min={1} max={1000} step={1} />
		<Slider
			bind:value={options.bounds.margin}
			label="Bounds Margin"
			min={0}
			max={Math.min(options.bounds.width / 2, options.bounds.height / 2)}
			step={1}
		/>
		<Slider bind:value={options.bounds.scale} label="Bounds Scale" min={0.5} max={5} step={0.01} />
		<Slider
			bind:value={options.ranges.protected}
			label="Protected Range"
			min={1}
			max={500}
			step={1}
		/>
		<Slider bind:value={options.ranges.visible} label="Visible Range" min={1} max={500} step={1} />
		<Slider
			bind:value={options.factors.seperation}
			label="Seperation Factor"
			min={0}
			max={1}
			step={0.01}
		/>
		<Slider
			bind:value={options.factors.alignment}
			label="Alignment Factor"
			min={0}
			max={1}
			step={0.01}
		/>
		<Slider
			bind:value={options.factors.cohesion}
			label="Cohesion Factor"
			min={0}
			max={0.1}
			step={0.0001}
		/>
		<Slider bind:value={options.factors.turn} label="Turn Factor" min={0} max={10} step={0.01} />
		<Slider
			bind:value={options.factors.regularization}
			label="Regularization Factor"
			min={0}
			max={1}
			step={0.01}
		/>
		<Slider bind:value={options.factors.mouse} label="Mouse Factor" min={0} max={1} step={0.01} />
		<Slider bind:value={options.maxSpeed} label="Max Speed" min={0} max={20} step={0.1} />
		<Slider bind:value={options.minSpeed} label="Min Speed" min={0} max={20} step={0.1} />
		<Slider bind:value={options.trailLength} label="Trail Length" min={0} max={250} step={1} />
		<List
			bind:value={options.mouse}
			label="Mouse Function"
			options={{ None: 'none', Avoid: 'avoid', Attract: 'attract' }}
		/>
		<Checkbox bind:value={options.show.protectedRange} label="Show Protected Range" />
		<Checkbox bind:value={options.show.visibleRange} label="Show Visible Range" />
		<Color bind:value={options.colors.boid} label="Boid Color" />
		<Color bind:value={options.colors.outline} label="Outline Color" />
		<Color bind:value={options.colors.trail} label="Trail Color" />
		<Color bind:value={options.colors.protected} label="Protected Color" />
		<Color bind:value={options.colors.visible} label="Visible Color" />
		<FpsGraph
			max={fpsMeter}
			on:change={(e) => {
				fpsMeter = Math.max(fpsMeter, Math.round(e.detail + 50));
			}}
		/>
	</div>
</div>

<svelte:window onresize={() => boids.updateCanvas()} />
