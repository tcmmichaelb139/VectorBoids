<script lang="ts">
	import {
		Pane,
		Folder,
		Slider,
		List,
		Checkbox,
		Color,
		ButtonGrid,
		FpsGraph,
		type ButtonGridClickEvent
	} from 'svelte-tweakpane-ui';
	import { onMount } from 'svelte';

	import Boids from '$lib/boids';
	import { mouse } from '$lib/globals';
	import { getBoidSimOptions, numBoidSimOptions, updateBoidOptions } from '$lib/boidoptions';
	import type { BoidSimOptions } from '$lib/types';

	let fpsMeter = 60;

	let boids: Boids;

	let options: BoidSimOptions = {
		boidCount: 1000,
		numBoidColors: 2,
		bounds: {
			width: 0,
			height: 0,
			margins: 50,
			scale: 1
		},
		ranges: {
			separation: 50,
			visible: 50
		},
		factors: {
			separation: 1.0,
			alignment: 0.75,
			cohesion: 0.75,
			drag: 0.25,
			mouse: 0.5,
			turn: 5
		},
		caps: {
			maxSpeed: 2.5,
			minSpeed: 0.5,
			maxAcceleration: 0.15,
			minAcceleration: 0.01
		},
		viewAngle: 360,
		mouse: 'none',
		followColor: true,
		trailLength: 10,
		show: {
			separationRange: false,
			visibleRange: false
		},
		colors: {
			background: '#1a1b26',
			boids: ['#bb9af7'],
			separation: '#f7768e',
			visible: '#9ece6a'
		}
	};

	onMount(() => {
		options = updateBoidOptions(options);

		const canvas = document.getElementById('boids') as HTMLCanvasElement;
		if (!canvas) return console.log('Canvas not found');

		boids = new Boids(canvas, options);
		boids.start();
	});
</script>

<div class="flex h-full items-center justify-center">
	<canvas
		id="boids"
		class="h-full w-full border-gray"
		style="background-color: {options.colors.background}"
		onmousemove={(e) => {
			const rect = (e.target as HTMLCanvasElement)?.getBoundingClientRect();
			mouse.x = (e.clientX - rect.left) * options.bounds.scale;
			mouse.y = (e.clientY - rect.top) * options.bounds.scale;
		}}
	></canvas>
	<Pane
		x={10}
		y={10}
		expanded={false}
		storePositionLocally={false}
		width={300}
		title="Boid Settings"
	>
		<Folder title="General" expanded={true}>
			<Slider bind:value={options.boidCount} label="Boid Count" min={1} max={5000} step={1} />
			<Slider
				bind:value={options.numBoidColors}
				label="# of Boid Colors"
				min={1}
				max={10}
				step={1}
			/>
		</Folder>
		<Folder title="Bounds" expanded={false}>
			<Slider
				bind:value={options.bounds.margins}
				label="Margins"
				min={0}
				max={Math.min(options.bounds.width, options.bounds.width) / 2}
				step={1}
			/>
			<Slider
				bind:value={options.bounds.scale}
				label="Bounds Scale"
				min={0.5}
				max={2}
				step={0.01}
			/>
		</Folder>
		<Folder title="Ranges" expanded={false}>
			<Slider
				bind:value={options.ranges.separation}
				label="Separation Range"
				min={0}
				max={Math.max(options.bounds.width, options.bounds.width)}
				step={1}
			/>
			<Slider
				bind:value={options.ranges.visible}
				label="Visible Range"
				min={0}
				max={Math.max(options.bounds.width, options.bounds.width)}
				step={1}
			/>
		</Folder>
		<Folder title="Factors" expanded={false}>
			<Slider
				bind:value={options.factors.separation}
				label="Separation Factor"
				min={0}
				max={5}
				step={0.01}
			/>
			<Slider
				bind:value={options.factors.alignment}
				label="Alignment Factor"
				min={0}
				max={5}
				step={0.01}
			/>
			<Slider
				bind:value={options.factors.cohesion}
				label="Cohesion Factor"
				min={0}
				max={1}
				step={0.01}
			/>
			<Slider bind:value={options.factors.drag} label="Drag Factor" min={0} max={1} step={0.01} />
			<Slider bind:value={options.factors.turn} label="Turn Factor" min={0} max={10} step={0.1} />
			<Slider bind:value={options.factors.mouse} label="Mouse Factor" min={0} max={1} step={0.01} />
		</Folder>
		<Folder title="Caps" expanded={false}>
			<Slider bind:value={options.caps.maxSpeed} label="Max Speed" min={0} max={20} step={0.1} />
			<Slider bind:value={options.caps.minSpeed} label="Min Speed" min={0} max={20} step={0.1} />
			<Slider
				bind:value={options.caps.maxAcceleration}
				label="Max Acceleration"
				min={0}
				max={5}
				step={0.01}
			/>
			<Slider
				bind:value={options.caps.minAcceleration}
				label="Min Acceleration"
				min={0}
				max={5}
				step={0.01}
			/>
		</Folder>
		<Folder title="Miscellaneous" expanded={false}>
			<Slider bind:value={options.viewAngle} label="View Angle" min={0} max={360} step={1} />
			<List
				bind:value={options.mouse}
				label="Mouse Function"
				options={{ None: 'none', Avoid: 'avoid', Attract: 'attract' }}
			/>
			<Checkbox bind:value={options.followColor} label="Follow Color" />
		</Folder>
		<Folder title="Visuals" expanded={false}>
			<Slider bind:value={options.trailLength} label="Trail Length" min={0} max={250} step={1} />
			<Folder title="Show" expanded={false}>
				<Checkbox bind:value={options.show.separationRange} label="Separation Range" />
				<Checkbox bind:value={options.show.visibleRange} label="Visible Range" />
			</Folder>
			<Color bind:value={options.colors.background} label="Background Color" />
			<Folder title="Boid Colors" expanded={false}>
				{#each options.colors.boids as color, i}
					<Color bind:value={options.colors.boids[i]} label={`Boid Color ${i + 1}`} />
				{/each}
			</Folder>
			<Folder title="Range Colors" expanded={false}>
				<Color bind:value={options.colors.separation} label="Separation Range Color" />
				<Color bind:value={options.colors.visible} label="Visible Range Color" />
			</Folder>
		</Folder>
		<ButtonGrid
			on:click={(event: ButtonGridClickEvent) => {
				options = getBoidSimOptions(parseInt(event.detail.label));
				boids.reset(options);
			}}
			buttons={Array.from({ length: numBoidSimOptions() }, (_, i) => i.toString())}
		/>
		<FpsGraph
			max={fpsMeter}
			on:change={(e) => {
				fpsMeter = Math.max(fpsMeter, Math.round(e.detail + 50));
			}}
		/>
	</Pane>
</div>

<svelte:window onresize={() => boids.updateCanvas()} />
