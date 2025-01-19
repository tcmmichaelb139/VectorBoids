<script lang="ts">
	import { Slider, List, Checkbox, Color, FpsGraph, Folder, Pane } from 'svelte-tweakpane-ui';
	import { onMount } from 'svelte';

	import Boids from '$lib/boids';
	import { mouse, options } from '$lib/globals';

	let fpsMeter = 60;

	let boids: Boids;

	onMount(() => {
		options.bounds.margins = window.innerWidth / 30;

		const canvas = document.getElementById('boids') as HTMLCanvasElement;
		if (!canvas) return console.log('Canvas not found');

		boids = new Boids(canvas);
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
		<Slider bind:value={options.boidCount} label="Boid Count" min={1} max={5000} step={1} />
		<Folder title="Bounds" expanded={false}>
			<Slider
				bind:value={options.bounds.margins}
				label="Margins"
				min={0}
				max={Math.max(options.bounds.width, options.bounds.width) / 2}
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
		</Folder>
		<Folder title="Visuals" expanded={false}>
			<Slider bind:value={options.trailLength} label="Trail Length" min={0} max={250} step={1} />
			<Checkbox bind:value={options.show.separationRange} label="Show Separation Range" />
			<Checkbox bind:value={options.show.visibleRange} label="Show Visible Range" />
			<Color bind:value={options.colors.background} label="Background Color" />
			<Color bind:value={options.colors.boid} label="Boid Color" />
			<Color bind:value={options.colors.trail} label="Trail Color" />
			<Color bind:value={options.colors.separation} label="Separation Range Color" />
			<Color bind:value={options.colors.visible} label="Visible Range Color" />
		</Folder>
		<FpsGraph
			max={fpsMeter}
			on:change={(e) => {
				fpsMeter = Math.max(fpsMeter, Math.round(e.detail + 50));
			}}
		/>
	</Pane>
</div>

<svelte:window onresize={() => boids.updateCanvas()} />
